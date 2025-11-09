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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workspaceSchema, WorkspaceSchemaType } from '@/schemas/workspace';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { isDefinedError } from '@orpc/client';

export function CreateWorkspace() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<WorkspaceSchemaType>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
    },
  });

  const createWorkspaceMutation = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: (newWorkspace) => {
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });

        toast.success(`Workspace ${newWorkspace.workspaceName} created successfully`);
        setOpen(false);
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          if (error.code === 'RATE_LIMITED') {
            toast.error(error.message);
            return;
          }

          toast.error(error.message);
          return;
        }

        toast.error('Failed to create workspace. Please try again.');
      },
    }),
  );

  function onSubmit(values: WorkspaceSchemaType) {
    createWorkspaceMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-200"
            >
              <Plus className="size-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Create a new workspace</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new workspace</DialogTitle>
          <DialogDescription>Create a new workspace get to work</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="spacet-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Workspace Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={createWorkspaceMutation.isPending} type="submit" className="mt-6">
              {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
