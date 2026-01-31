import { RichTextViewer } from '@/components/rich-text-editor/RichTextViewer';
import Image from 'next/image';

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
}

export function ThreadReply({ message }: ThreadReplyProps) {
  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        alt="Author Avatar"
        src={message.authorAvatar}
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0 mt-1"
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
      </div>
    </div>
  );
}
