import z from 'zod';

export const createMessageChannelSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
  threadId: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().optional(),
});

export type CreateMessageChannelType = z.infer<typeof createMessageChannelSchema>;
export type UpdateMessageType = z.infer<typeof updateMessageSchema>;
