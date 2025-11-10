'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageComposer } from './MessageComposer';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAttachmentUpload } from '@/lib/use-attachment-upload';

interface MessageInputFormProps {
  channelId: string;
}

export function MessageInputForm({ channelId }: MessageInputFormProps) {
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
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key(),
        });
        form.reset();
        toast.success('Message sent successfully!');
      },
      onError: () => {
        return toast.error('Failed to send message.');
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
