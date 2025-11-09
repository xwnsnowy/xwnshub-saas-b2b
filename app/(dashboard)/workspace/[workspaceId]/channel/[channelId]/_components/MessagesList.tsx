import { useInfiniteQuery } from '@tanstack/react-query';
import { MessageItem } from './message/MessageItem';
import { orpc } from '@/lib/orpc';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MessagesList() {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  const infiniteQueryOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId: channelId!,
      limit: 5,
      cursor: pageParam,
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    select: (data) => ({
      pages: [...data.pages].reverse().map((page) => ({
        ...page,
        items: page.items.slice().reverse(),
      })),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      ...infiniteQueryOptions,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });

  const messages = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  // Track scroll position to show/hide scroll button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollButton(scrollBottom > 300);
    };

    // Check initial scroll position
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Auto scroll to bottom on initial load + smooth scroll for new messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    if (!hasInitialScrolled) {
      container.scrollTop = container.scrollHeight;
      setHasInitialScrolled(true);
      prevMessagesLengthRef.current = messages.length;
      prevScrollHeightRef.current = container.scrollHeight;
      return;
    }

    const messagesAdded = messages.length - prevMessagesLengthRef.current;

    if (messagesAdded > 0) {
      const isLoadingOlder =
        prevScrollHeightRef.current > 0 && container.scrollHeight > prevScrollHeightRef.current;

      if (isLoadingOlder) {
        const heightDifference = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop = container.scrollTop + heightDifference;
      } else {
        const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        const isNearBottom = scrollBottom < 150;

        if (isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    }

    prevMessagesLengthRef.current = messages.length;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages.length, hasInitialScrolled]);

  // Intersection Observer for infinite scroll (load more when scrolling up)
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const container = scrollContainerRef.current;
          if (container) {
            prevScrollHeightRef.current = container.scrollHeight;
          }
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-red-500">Error loading messages</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4">
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-2 text-center text-sm text-gray-500">
            {isFetchingNextPage ? 'Loading more messages...' : 'Scroll up to load more'}
          </div>
        )}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>

      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="default"
          className="absolute bottom-4 right-8 z-50 h-10 w-10 rounded-full shadow-lg transition-all hover:shadow-xl"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
