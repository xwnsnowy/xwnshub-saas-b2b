'use client';

import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import Image from 'next/image';
import { RichTextViewer } from '@/components/rich-text-editor/RichTextViewer';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageHoverToolbar } from '../toolbar';
import { InfiniteData, useQueryClient, useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { UpdateMessageType } from '@/schemas/message';
import { EditMessage } from '../toolbar/EditMessage';

interface MessageItemProps {
  message: Message;
  onImageLoad?: () => void;
}

export function MessageItem({ message, onImageLoad }: MessageItemProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: updateMessage } = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updated) => {
        type MessagePage = { items: Message[]; nextCursor: string | null };
        type InfiniteMessages = InfiniteData<MessagePage>;

        queryClient.setQueryData<InfiniteMessages>(
          ['messages', 'list', message.channelId],
          (oldData) => {
            if (!oldData) return oldData;

            const pages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) =>
                msg.id === updated.id ? { ...msg, ...updated } : msg,
              ),
            }));

            return { ...oldData, pages };
          },
        );
        toast.success('Message updated successfully');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(`Failed to update message: ${error.message}`);
      },
    }),
  );

  const handleSaveEdit = async (data: UpdateMessageType) => {
    await updateMessage(data);
  };

  return (
    <>
      <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50 transition-colors">
        <Image
          src={getAvatar(message.authorAvatar, message.authorEmail)}
          alt="User Avatar"
          width={32}
          height={32}
          className="size-8 rounded-lg"
        />

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center gap-x-2">
            <span className="font-medium leading-none">{message.authorName}</span>
            <span className="text-xs text-muted-foreground leading-none">
              {new Intl.DateTimeFormat('en-US', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
              }).format(message.createdAt)}{' '}
              {new Intl.DateTimeFormat('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }).format(message.createdAt)}
            </span>
          </div>
          {isEditing ? (
            <EditMessage
              message={message}
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveEdit}
            />
          ) : (
            <>
              <div className="text-sm leading-snug break-words max-w-none">
                <RichTextViewer content={message.content} />
              </div>

              {message.imageUrl && (
                <div className="mt-2 relative max-w-[320px] w-full bg-muted rounded-md overflow-hidden">
                  <Image
                    src={message.imageUrl}
                    alt="Attached Image"
                    width={640}
                    height={360}
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="rounded-md border border-border w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageOpen(true)}
                    onLoad={onImageLoad}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <MessageHoverToolbar onEdit={() => setIsEditing(true)} />
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-7xl w-full p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[80vh]">
            <Image
              src={message.imageUrl || ''}
              alt="Full Size Image"
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
