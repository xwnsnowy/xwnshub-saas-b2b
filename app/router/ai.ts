import z from 'zod';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { base } from '../middlewares/base';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import prisma from '@/lib/db';
import { tiptapJsonToMarkdown } from '@/lib/json-to-markdown';
import { streamText } from 'ai';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamToEventIterator } from '@orpc/server';
import { aiSecurityMiddleware } from '../middlewares/arcjet/ai';

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_API_KEY || '',
});

const MODEL_ID = 'tngtech/deepseek-r1t2-chimera:free';

const model = openrouter.chat(MODEL_ID);

export const generateThreadSummary = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: 'GET',
    path: '/ai/thread/summary',
    summary: 'Generate thread summary',
    tags: ['AI'],
  })
  .input(
    z.object({
      messageId: z.string(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const baseMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        threadId: true,
        channelId: true,
      },
    });

    if (!baseMessage) {
      throw errors.NOT_FOUND();
    }

    const parentId = baseMessage.threadId || baseMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: parentId,
        channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
        replies: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
          },
        },
      },
    });

    if (!parent) {
      throw errors.NOT_FOUND();
    }

    const replies = parent.replies.slice().reverse();

    const parentText = await tiptapJsonToMarkdown(parent.content);

    const lines = [];

    lines.push(`Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`);

    lines.push(parentText);

    if (replies.length > 0) {
      lines.push('\nReplies:\n');

      for (const reply of replies) {
        const replyText = await tiptapJsonToMarkdown(reply.content);
        lines.push(`---\n${reply.authorName} - ${reply.createdAt.toISOString()}\n\n${replyText}\n`);
      }
    }

    const compiledText = lines.join('\n');

    const system = `You are an expert summarization assistant for threaded conversations.
Your job is to read a thread (root message + replies) and retell it in a natural, human-like way.
Guidelines:
- Keep the summary engaging, like you're narrating what happened in a chat.
- Avoid inventing information not present in the thread.
- Write in plain text, no code formatting.
- The style should feel like storytelling or a friend recounting the discussion.
`;

    const result = streamText({
      model,
      system,
      messages: [
        {
          role: 'user',
          content: compiledText,
        },
      ],
      temperature: 0.2,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });

export const generateCompose = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: 'POST',
    path: '/ai/compose/generate',
    summary: 'Generate compose',
    tags: ['AI'],
  })
  .input(
    z.object({
      content: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const markdown = await tiptapJsonToMarkdown(input.content);

    const system = [
      'You are an expert rewriting assistant. You are not a chatbot.',
      'Task: Rewrite the provided content to be clearer and better structured while preserving meaning, facts, terminology, and names.',
      'Do not address the user, ask questions, add greetings, or include commentary.',
      'Keep existing links/mentions intact. Do not change code blocks or inline code content.',
      'Output strictly in Markdown (paragraphs and optional bullet lists). Do not output any HTML or images.',
      'Return ONLY the rewritten content. No preamble, headings, or closing remarks.',
    ].join('\n');

    const result = streamText({
      model,
      system,
      messages: [
        {
          role: 'user',
          content:
            'Please rewrite the following message to make it more professional and engaging:\n\n' +
            markdown,
        },
        {
          role: 'user',
          content: markdown,
        },
      ],
      temperature: 0,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });
