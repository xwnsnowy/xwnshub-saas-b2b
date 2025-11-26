import { RichTextEditor } from '@/components/rich-text-editor/Editor';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Message } from '@/lib/generated/prisma/client';
import { updateMessageSchema, UpdateMessageType } from '@/schemas/message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface EditMessageProps {
  message: Message;
  onCancel: () => void;
  onSave?: (data: UpdateMessageType) => void | Promise<void>;
}

export function EditMessage({ message, onCancel, onSave }: EditMessageProps) {
  const form = useForm<UpdateMessageType>({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
  });

  const handleSubmit = async (data: UpdateMessageType) => {
    if (onSave) {
      await onSave(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mr-2"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  }
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
