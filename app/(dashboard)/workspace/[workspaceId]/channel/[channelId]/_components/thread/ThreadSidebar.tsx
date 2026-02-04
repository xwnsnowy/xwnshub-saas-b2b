import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import Image from 'next/image';
import { ThreadReply } from './ThreadReply';
import { ThreadReplyForm } from './ThreadReplyForm';
import { useThread } from '@/providers/ThreadProvider';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { RichTextViewer } from '@/components/rich-text-editor/RichTextViewer';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { ThreadSidebarSkeleton } from './ThreadSidebarSkeleton';
import { useEffect, useRef, useMemo } from 'react';
import { SummarizeThread } from './SummarizeThread';

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadSidebar({ user }: ThreadSidebarProps) {
  const { selectedThreadId, closeThread } = useThread();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const hasInitialScrolledRef = useRef(false);
  const pendingScrollRef = useRef(false);

  const { data, isLoading } = useQuery({
    ...orpc.message.thread.list.queryOptions({
      input: { messageId: selectedThreadId! },
    }),
    queryKey: ['messages', 'thread', selectedThreadId],
    enabled: Boolean(selectedThreadId),
  });

  const messages = useMemo(() => data?.messages ?? [], [data?.messages]);

  // Force scroll to bottom helper
  const forceScrollToBottom = (smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Auto scroll logic when messages change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !data) return;

    if (!hasInitialScrolledRef.current) {
      // Initial scroll
      setTimeout(() => {
        forceScrollToBottom(false);
      }, 100);
      hasInitialScrolledRef.current = true;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    const messagesAdded = messages.length - prevMessagesLengthRef.current;

    if (messagesAdded > 0) {
      const latestMessage = messages[messages.length - 1];
      const isMyMessage = latestMessage?.authorId === user.id;

      pendingScrollRef.current = true;

      if (isMyMessage) {
        // For my messages, scroll immediately and keep trying
        forceScrollToBottom(false);
        const scrollInterval = setInterval(() => {
          forceScrollToBottom(false);
        }, 50);

        setTimeout(() => {
          clearInterval(scrollInterval);
          pendingScrollRef.current = false;
        }, 2000);
      } else {
        forceScrollToBottom(true);
        setTimeout(() => {
          pendingScrollRef.current = false;
        }, 1000);
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, messages.length, data, user.id]);

  // Handle image loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !data) return;

    const handleImageLoad = () => {
      if (pendingScrollRef.current) {
        requestAnimationFrame(() => {
          forceScrollToBottom(false);
        });
      }
    };

    const images = container.querySelectorAll('img');

    images.forEach((img) => {
      if (!img.complete) {
        const onLoad = () => {
          handleImageLoad();
          img.removeEventListener('load', onLoad);
        };
        img.addEventListener('load', onLoad);
      }
    });

    // MutationObserver for newly added images
    const observer = new MutationObserver(() => {
      if (pendingScrollRef.current) {
        requestAnimationFrame(() => {
          forceScrollToBottom(false);
        });
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'height'],
    });

    return () => {
      observer.disconnect();
    };
  }, [messages.length, data]);

  // Reset scroll state when thread changes
  useEffect(() => {
    hasInitialScrolledRef.current = false;
    prevMessagesLengthRef.current = 0;
    pendingScrollRef.current = false;
  }, [selectedThreadId]);

  if (isLoading) return <ThreadSidebarSkeleton />;

  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span>Thread</span>
        </div>

        <div className="flex items-center gap-2">
          <SummarizeThread messageId={selectedThreadId!} />
          <Button variant="outline" size="icon" onClick={closeThread}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {data && (
          <>
            <div className="p-4 border-b bg-muted/20">
              <div className="flex space-x-3">
                <Image
                  src={data.parent.authorAvatar}
                  alt="User Image"
                  width={32}
                  height={32}
                  className="size-8 rounded-full shrink-0"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{data.parent.authorName}</span>
                    <span>
                      {new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                        month: 'short',
                        day: 'numeric',
                      }).format(data.parent.createdAt)}
                    </span>
                  </div>

                  <RichTextViewer
                    className="text-sm break-words prose dark:prose-invert max-w-none"
                    content={data.parent.content}
                  />
                </div>
              </div>
            </div>

            {/* Thread Replies */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground">{data.messages.length + ' replies'}</p>

              <div className="space-y-1">
                {data.messages.map((message) => (
                  <ThreadReply
                    message={message}
                    key={message.id}
                    onImageLoad={() => {
                      if (pendingScrollRef.current) {
                        requestAnimationFrame(() => {
                          forceScrollToBottom(false);
                        });
                      }
                    }}
                    selectedThreadId={selectedThreadId!}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Thread Reply Form */}
      <div className="border-t p-4">
        <ThreadReplyForm user={user} threadId={selectedThreadId!} />
      </div>
    </div>
  );
}
