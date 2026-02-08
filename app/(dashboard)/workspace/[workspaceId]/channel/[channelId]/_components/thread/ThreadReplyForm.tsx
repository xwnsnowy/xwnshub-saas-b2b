'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MessageComposer } from '../message/MessageComposer';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { useEffect } from 'react';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { getAvatar } from '@/lib/get-avatar';
import { MessageListItem } from '@/lib/types';
import { useChannelRealtime } from '@/providers/ChannelRealtimeProvider';
import { useThreadRealtime } from '@/providers/ThreadRealtimeProvider';

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessagePage = {
  items: Array<MessageListItem>;
  nextCursor: string | null;
};

type InfiniteMessages = InfiniteData<MessagePage>;

type ThreadData = {
  parent: MessageListItem;
  messages: MessageListItem[];
};

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();

  const upload = useAttachmentUpload();
  const queryClient = useQueryClient();

  const { send } = useChannelRealtime();

  const { send: sendThread } = useThreadRealtime();

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
        // Use the same query key format as ReactionsBar
        const threadQueryKey = ['messages', 'thread', threadId];
        const listQueryKey = ['messages', 'list', channelId];

        await queryClient.cancelQueries({ queryKey: threadQueryKey });
        await queryClient.cancelQueries({ queryKey: listQueryKey });

        const previousThread = queryClient.getQueryData<ThreadData>(threadQueryKey);
        const previousList = queryClient.getQueryData<InfiniteMessages>(listQueryKey);

        const optimistic: MessageListItem = {
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
          replyCount: 0,
          reactions: [],
        };

        // Optimistic update for thread replies - use correct structure
        queryClient.setQueryData<ThreadData>(threadQueryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });

        // Optimistic bump replyCount in main message list for the parent message
        queryClient.setQueryData<InfiniteMessages>(listQueryKey, (oldData) => {
          if (!oldData) return oldData;

          const pages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((msg) => {
              if (msg.id === threadId) {
                return {
                  ...msg,
                  replyCount: (msg.replyCount || 0) + 1,
                };
              }
              return msg;
            }),
          }));

          return {
            ...oldData,
            pages,
          };
        });

        return {
          threadQueryKey,
          listQueryKey,
          previousThread,
          previousList,
        };
      },

      onSuccess: (data, _vars, ctx) => {
        if (ctx) {
          queryClient.invalidateQueries({ queryKey: ctx.threadQueryKey });
          queryClient.invalidateQueries({ queryKey: ctx.listQueryKey });
        }

        // Reset only content, keep threadId and channelId
        form.reset({
          content: '',
          channelId: channelId,
          threadId: threadId,
        });
        upload.reset();

        toast.success('Message sent successfully!');

        sendThread({
          type: 'thread:reply:created',
          payload: {
            reply: data,
          },
        });

        send({
          type: 'message:replies:incremented',
          payload: {
            messageId: threadId,
            delta: 1,
          },
        });
      },

      onError: (_err, _vars, ctx) => {
        if (!ctx) return;

        const { threadQueryKey, listQueryKey, previousThread, previousList } = ctx;

        if (previousThread) {
          queryClient.setQueryData(threadQueryKey, previousThread);
        }
        if (previousList) {
          queryClient.setQueryData(listQueryKey, previousList);
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
