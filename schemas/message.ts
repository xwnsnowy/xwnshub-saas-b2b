import z from 'zod';

export const createMessageChannelSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
});

export type CreateMessageChannelType = z.infer<typeof createMessageChannelSchema>;
