'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageComposer } from './MessageComposer';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MessageInputFormProps {
  channelId: string;
}

export function MessageInputForm({ channelId }: MessageInputFormProps) {
  const queryClient = useQueryClient();

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
    createMessageChannelMutation.mutate(data);
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
