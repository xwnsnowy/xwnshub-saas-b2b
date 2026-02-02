import { RichTextViewer } from '@/components/rich-text-editor/RichTextViewer';
import Image from 'next/image';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ThreadReplyProps {
  message: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    channelId: string;
    content: string;
    imageUrl: string | null;
    threadId: string | null;
    authorId: string;
    authorEmail: string;
    authorName: string;
    authorAvatar: string;
  };
  onImageLoad?: () => void;
}

export function ThreadReply({ message, onImageLoad }: ThreadReplyProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
        <Image
          alt="Author Avatar"
          src={message.authorAvatar}
          width={32}
          height={32}
          className="size-8 rounded-full shrink-0 mt-1"
          onLoad={onImageLoad}
        />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{message.authorName}</span>
            <span>
              {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                month: 'short',
                day: 'numeric',
              }).format(message.createdAt)}
            </span>
          </div>

          <RichTextViewer
            content={message.content}
            className="text-sm break-words prose dark:prose-invert max-w-none"
          />

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
        </div>
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
