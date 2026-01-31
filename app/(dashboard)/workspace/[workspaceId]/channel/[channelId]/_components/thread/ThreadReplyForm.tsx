'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { createMessageChannelSchema, CreateMessageChannelType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MessageComposer } from '../message/MessageComposer';
import { useAttachmentUpload } from '@/lib/use-attachment-upload';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';

interface ThreadReplyFormProps {
  threadId: string;
}

export function ThreadReplyForm({ threadId }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();

  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(createMessageChannelSchema),
    defaultValues: {
      content: '',
      channelId: channelId,
      threadId: threadId,
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        form.reset({ channelId, content: '', threadId: '' });
        upload.reset();

        toast.success('Message sent successfully!');
      },

      onError: () => {
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
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
