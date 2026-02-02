'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MessageComposer } from '../message/MessageComposer';
import { useAttachmentUpload } from '@/lib/use-attachment-upload';
import { useEffect } from 'react';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { Message } from '@/lib/generated/prisma/client';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { getAvatar } from '@/lib/get-avatar';
import { MessageListItem } from '@/lib/types';

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();

  const upload = useAttachmentUpload();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createMessageChannelSchema),
    defaultValues: {
      content: '',
      channelId: channelId,
      threadId: threadId,
    },
  });

  // Update form values when threadId or channelId changes
  useEffect(() => {
    form.setValue('threadId', threadId);
    form.setValue('channelId', channelId);
  }, [threadId, channelId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });

        type MessagePage = {
          items: Array<MessageListItem>;
          nextCursor: string | null;
        };

        type InfinitieMessages = InfiniteData<MessagePage>;

        await queryClient.cancelQueries({
          queryKey: listOptions.queryKey,
        });

        const previousMessages = queryClient.getQueryData(listOptions.queryKey);

        const optimistic: Message = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name + ' ' + user.family_name || 'Unknown User',
          authorAvatar: getAvatar(user.picture, user.email || 'anonymous'),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
        };

        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });

        // optimistic buump repliesCount in main message list for the parent message
        queryClient.setQueryData<InfinitieMessages>(
          ['messages', 'list', channelId],
          (oldData: any) => {
            if (!oldData) return oldData;

            const pages = oldData.pages.map((page: { items: any[] }) => ({
              ...page,
              items: page.items.map((msg) => {
                if (msg.id === threadId) {
                  return {
                    ...msg,
                    repliesCount: (msg.repliesCount || 0) + 1,
                  };
                }
                return msg;
              }),
            }));

            return {
              ...oldData,
              pages,
            };
          },
        );

        return {
          listOptions,
          previousMessages,
        };
      },

      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx.listOptions.queryKey });

        // Reset only content, keep threadId and channelId
        form.reset({
          content: '',
          channelId: channelId,
          threadId: threadId,
        });
        upload.reset();

        toast.success('Message sent successfully!');
      },

      onError: (_err, _vars, ctx) => {
        if (!ctx) return;

        const { listOptions, previousMessages } = ctx;

        if (previousMessages) {
          queryClient.setQueryData(listOptions.queryKey, previousMessages);
        }

        return toast.error('Something went wrong.');
      },
    }),
  );

  function onSubmit(data: CreateMessageChannelType) {
    createMessageMutation.mutate({
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
                  upload={upload}
                  onSubmit={() => onSubmit(form.getValues())}
                  isPending={createMessageMutation.isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
