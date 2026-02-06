'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageComposer } from './MessageComposer';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { Message } from '@/lib/generated/prisma/client';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { getAvatar } from '@/lib/get-avatar';

interface MessageInputFormProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessageProps = { items: Message[]; nextCursor: string | undefined };
type InfiniteMessages = InfiniteData<MessageProps>;

export function MessageInputForm({ channelId, user }: MessageInputFormProps) {
  const queryClient = useQueryClient();
  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(createMessageChannelSchema),
    defaultValues: {
      channelId: channelId,
      content: '',
    },
  });

  const createMessageChannelMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (newMessage) => {
        // Cancel any outgoing refetches to avoid overwriting optimistic update
        await queryClient.cancelQueries({
          queryKey: ['messages', 'list', channelId],
        });

        // Snapshot the previous value
        const previousMessages = queryClient.getQueryData<InfiniteMessages>([
          'messages',
          'list',
          channelId,
        ]);

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: newMessage.content,
          imageUrl: newMessage.imageUrl ?? null,
          channelId: newMessage.channelId,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name + ' ' + user.family_name || 'Unknown User',
          authorAvatar: getAvatar(user.picture, user.email || 'anonymous'),
        };

        // Optimistically update to the new value
        queryClient.setQueryData<InfiniteMessages>(['messages', 'list', channelId], (old) => {
          if (!old) {
            return {
              pages: [
                {
                  items: [optimisticMessage],
                  nextCursor: undefined,
                },
              ],
              pageParams: [undefined],
            } satisfies InfiniteMessages;
          }

          const firstPage = old.pages[0] ?? {
            items: [],
            nextCursor: undefined,
          };

          return {
            ...old,
            pages: [
              {
                ...firstPage,
                items: [optimisticMessage, ...firstPage.items],
              },
              ...old.pages.slice(1),
            ],
          } satisfies InfiniteMessages;
        });

        return {
          previousMessages,
          tempId,
        };
      },
      onSuccess: async (data, variables, context) => {
        if (!context) return;

        // Replace optimistic message with real message from server
        queryClient.setQueryData<InfiniteMessages>(['messages', 'list', channelId], (old) => {
          if (!old) return old;

          const updatedPages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((msg) => (msg.id === context.tempId ? data : msg)),
          }));

          return {
            ...old,
            pages: updatedPages,
          } satisfies InfiniteMessages;
        });

        // Invalidate to ensure fresh data in background
        await queryClient.invalidateQueries({
          queryKey: ['messages', 'list', channelId],
          refetchType: 'none', // Don't refetch immediately
        });

        form.reset();
        upload.reset();
        toast.success('Message sent successfully!');
      },
      onError: (error, variables, context) => {
        // Log error for debugging
        console.error('Failed to send message:', error);

        // Rollback to the previous value on error
        if (context?.previousMessages) {
          queryClient.setQueryData(['messages', 'list', channelId], context.previousMessages);
        }

        toast.error('Failed to send message.');
      },
    }),
  );

  function onSubmit(data: CreateMessageChannelType) {
    createMessageChannelMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isPending={createMessageChannelMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
