'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { orpc } from '@/lib/orpc';
import { channelNameSchema, ChannelNameSchemaType, transformChannelName } from '@/schemas/channel';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDefinedError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function CreateNewChannel() {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<ChannelNameSchemaType>({
    resolver: zodResolver(channelNameSchema),
    defaultValues: {
      name: '',
    },
  });

  const createChannelMutation = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (newChannel) => {
        toast.success(`Channel "${newChannel.name}" created successfully`);

        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey(),
        });

        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(`Failed to create channel: ${error.message}`);
          return;
        }
        toast.error('Failed to create channel due to an unknown error');
      },
    }),
  );

  function onSubmit(values: ChannelNameSchemaType) {
    createChannelMutation.mutate(values);
  }

  const watchWorkspaceName = form.watch('name');
  const transformName = watchWorkspaceName ? transformChannelName(watchWorkspaceName) : '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="size-4" />
          Add Channel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>Add a new channel to the workspace</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Channel name" {...field} />
                  </FormControl>
                  {transformName && transformName !== watchWorkspaceName && (
                    <p className="text-sm text-muted-foreground ">
                      Channel name will be created as:
                      <br />
                      <code className="bg-muted px-2 py-1 rounded text-xs text-primary ml-1">
                        {transformName}
                      </code>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                createChannelMutation.isPending
              }
            >
              {createChannelMutation.isPending ? 'Creating...' : 'Create Channel'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
