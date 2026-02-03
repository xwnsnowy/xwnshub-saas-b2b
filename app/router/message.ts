import { GroupedReactionsSchema, GroupedReactionsSchemaType } from './../../schemas/message';
import prisma from '@/lib/db';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard';
import { writeSecurityMiddleware } from '../middlewares/arcjet/write';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { base } from '../middlewares/base';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import {
  createMessageChannelSchema,
  toggleReactionSchema,
  updateMessageSchema,
} from '@/schemas/message';
import { getAvatar } from '@/lib/get-avatar';
import z from 'zod';
import { Message } from '@/lib/generated/prisma/client';
import { MessageListItem } from '@/lib/types';

function groupReactions(
  reactions: { emoji: string; userId: string }[],
  userId: string,
): GroupedReactionsSchemaType[] {
  const reactionMap = new Map<string, { count: number; reactedByUser: boolean }>();

  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      if (reaction.userId === userId) {
        existing.reactedByUser = true;
      }
    } else {
      reactionMap.set(reaction.emoji, {
        count: 1,
        reactedByUser: reaction.userId === userId,
      });
    }
  }

  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    reactedByUser: data.reactedByUser,
  }));
}

export const createMessageChannel = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: 'POST',
    path: '/message',
    summary: 'Create a message',
    tags: ['message'],
  })
  .input(createMessageChannelSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    // verify the channel belongs to the user's organization

    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    // if this is a thread reply, validate the parent message
    if (input.threadId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.threadId,
          channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
      });

      if (
        !parentMessage ||
        parentMessage.channelId !== input.channelId ||
        parentMessage.threadId !== null
      ) {
        throw errors.BAD_REQUEST();
      }
    }

    const created = await prisma.message.create({
      data: {
        channelId: input.channelId,
        content: input.content,
        imageUrl: input.imageUrl,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName:
          context.user.given_name && context.user.family_name
            ? context.user.given_name + ' ' + context.user.family_name
            : 'Tommy',
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
        threadId: input.threadId,
      },
    });

    return { ...created };
  });

export const listMessages = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .route({
    method: 'GET',
    path: '/message',
    summary: 'List messages in a channel',
    tags: ['message'],
  })
  .input(
    z.object({
      channelId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(z.custom<MessageListItem>()),
      nextCursor: z.string().optional(),
      hasMore: z.boolean(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const limit = input.limit;

    const messages = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
        threadId: null,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        messsageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
      take: limit + 1,
      ...(input.cursor && {
        cursor: { id: input.cursor },
        skip: 1,
      }),
    });

    // Check if there are more items
    const hasMore = messages.length > limit;

    // Remove the extra item if exists
    const sliced = hasMore ? messages.slice(0, limit) : messages;

    const items: MessageListItem[] = sliced.map((m) => ({
      ...m,
      repliesCount: m._count.replies,
      reactions: groupReactions(
        m.messsageReactions.map((r) => ({ emoji: r.emoji, userId: r.userId })),
        context.user.id,
      ),
    }));

    // Get the last item's ID as next cursor
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  });

export const updateMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: 'PUT',
    path: '/message/:messageId',
    summary: 'Update a message',
    tags: ['message'],
  })
  .input(updateMessageSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!message) {
      throw errors.NOT_FOUND();
    }

    if (message.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }

    const updated = await prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: {
        content: input.content,
      },
    });

    return updated;
  });

export const listThreadReplies = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .route({
    method: 'GET',
    path: '/message/:messageId/replies',
    summary: 'List replies to a message',
    tags: ['message'],
  })
  .input(z.object({ messageId: z.string() }))
  .output(
    z.object({
      parent: z.custom<MessageListItem>(),
      messages: z.array(z.custom<MessageListItem>()),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const parentRow = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        messsageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    if (!parentRow) {
      throw errors.NOT_FOUND();
    }

    const replies = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        messsageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const parent: MessageListItem = {
      id: parentRow.id,
      content: parentRow.content,
      imageUrl: parentRow.imageUrl,
      authorAvatar: parentRow.authorAvatar,
      authorEmail: parentRow.authorEmail,
      authorId: parentRow.authorId,
      authorName: parentRow.authorName,
      createdAt: parentRow.createdAt,
      updatedAt: parentRow.updatedAt,
      channelId: parentRow.channelId,
      threadId: parentRow.threadId,
      repliesCount: parentRow._count.replies,
      reactions: groupReactions(
        parentRow.messsageReactions.map((r) => ({ emoji: r.emoji, userId: r.userId })),
        context.user.id,
      ),
    };

    const messages: MessageListItem[] = replies.map((m) => ({
      ...m,
      repliesCount: m._count.replies,
      reactions: groupReactions(
        m.messsageReactions.map((r) => ({ emoji: r.emoji, userId: r.userId })),
        context.user.id,
      ),
    }));

    return { parent, messages };
  });

export const toggleReaction = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: 'POST',
    path: '/message/:messageId/reaction',
    summary: 'Toggle reaction to a message',
    tags: ['message'],
  })
  .input(toggleReactionSchema)
  .output(
    z.object({
      messageId: z.string(),
      reaction: z.array(GroupedReactionsSchema),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!message) {
      throw errors.NOT_FOUND();
    }

    const inserted = await prisma.messageReaction.createMany({
      data: {
        emoji: input.emoji,
        messageId: input.messageId,
        userId: context.user.id,
        userName:
          context.user.given_name && context.user.family_name
            ? context.user.given_name + ' ' + context.user.family_name
            : 'Tommy',
        userAvatar: getAvatar(context.user.picture, context.user.email!),
        userEmail: context.user.email!,
      },
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      // reaction already exists, remove it
      await prisma.messageReaction.deleteMany({
        where: {
          messageId: input.messageId,
          userId: context.user.id,
          emoji: input.emoji,
        },
      });
    }

    const updated = await prisma.message.findUnique({
      where: {
        id: input.messageId,
      },
      include: {
        messsageReactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!updated) {
      throw errors.NOT_FOUND();
    }

    return {
      messageId: updated.id,
      reaction: groupReactions(
        (updated.messsageReactions ?? []).map((r) => ({ emoji: r.emoji, userId: r.userId })),
        context.user.id,
      ),
    };
  });
