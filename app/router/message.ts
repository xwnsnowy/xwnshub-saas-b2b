import prisma from '@/lib/db';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard';
import { writeSecurityMiddleware } from '../middlewares/arcjet/write';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { base } from '../middlewares/base';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import { createMessageChannelSchema, updateMessageSchema } from '@/schemas/message';
import { getAvatar } from '@/lib/get-avatar';
import z from 'zod';
import { Message } from '@/lib/generated/prisma/client';

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
      items: z.array(z.custom<Message>()),
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
      take: limit + 1,
      ...(input.cursor && {
        cursor: { id: input.cursor },
        skip: 1,
      }),
    });

    // Check if there are more items
    const hasMore = messages.length > limit;

    // Remove the extra item if exists
    const items = hasMore ? messages.slice(0, limit) : messages;

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
      parent: z.custom<Message>(),
      messages: z.array(z.custom<Message>()),
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
    });

    const parent = {
      ...parentRow,
    };

    const messages = replies.map((r) => ({
      ...r,
    }));

    return { parent, messages };
  });
