import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import Image from 'next/image';
import { RichTextViewer } from '@/components/rich-text-editor/RichTextViewer';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
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
        <div className="text-sm leading-snug break-words max-w-none">
          <RichTextViewer content={message.content} />
        </div>
      </div>
    </div>
  );
}
