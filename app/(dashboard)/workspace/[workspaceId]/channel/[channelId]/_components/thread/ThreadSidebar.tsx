import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import Image from 'next/image';
import { ThreadReply } from './ThreadReply';
import { ThreadReplyForm } from './ThreadReplyForm';
import { useThread } from '@/providers/ThreadProvider';

const messages = [
  {
    id: 1,
    authorName: 'John Doe',
    authorImage: 'https://avatars.githubusercontent.com/u/109363894?v=4',
    content: 'Hello, world!',
    createdAt: new Date(),
  },
  {
    id: 2,
    authorName: 'John Doe',
    authorImage: 'https://avatars.githubusercontent.com/u/109363894?v=4',
    content: 'Hello, world!',
    createdAt: new Date(),
  },
  {
    id: 3,
    authorName: 'John Doe',
    authorImage: 'https://avatars.githubusercontent.com/u/109363894?v=4',
    content: 'Hello, world!',
    createdAt: new Date(),
  },
  {
    id: 4,
    authorName: 'John Doe',
    authorImage: 'https://avatars.githubusercontent.com/u/109363894?v=4',
    content: 'Hello, world!',
    createdAt: new Date(),
  },
];

export function ThreadSidebar() {
  const { selectedThreadId, closeThread } = useThread();

  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span>Thread</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={closeThread}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b bg-muted/20">
          <div className="flex space-x-3">
            <Image
              src={messages[0].authorImage}
              alt="User Image"
              width={32}
              height={32}
              className="size-8 rounded-full shrink-0"
            />
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{messages[0].authorName}</span>
                <span>
                  {new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                  }).format(messages[0].createdAt)}
                </span>
              </div>

              <p className="text-sm break-words prose dark:prose-invert max-w-none">
                {messages[0].content}
              </p>
            </div>
          </div>
        </div>

        {/* Thread Replies */}
        <div className="p-2">
          <p className="text-xs text-muted-foreground">{messages.length + ' replies'}</p>

          <div className="space-y-1">
            {messages.map((message) => (
              <ThreadReply message={message} key={message.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Thread Reply Form */}
      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} />
      </div>
    </div>
  );
}
