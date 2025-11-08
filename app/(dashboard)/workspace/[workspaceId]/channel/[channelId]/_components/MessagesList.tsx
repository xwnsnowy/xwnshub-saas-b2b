import { useInfiniteQuery } from '@tanstack/react-query';
import { MessageItem } from './message/MessageItem';
import { orpc } from '@/lib/orpc';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export function MessagesList() {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      ...orpc.message.list.infiniteOptions({
        input: (pageParam: string | undefined) => ({
          channelId: channelId!,
          limit: 50,
          cursor: pageParam,
        }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage: any) => {
          return lastPage.hasMore ? lastPage.nextCursor : undefined;
        },
        select: (data) => ({
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.slice().reverse(),
          })),
          pageParams: data.pageParams.slice().reverse(),
        }),
      }),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });

  const messages = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  // Auto scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      setHasInitialScrolled(true);
    }
  }, [messages.length, hasInitialScrolled]);

  // Intersection Observer for infinite scroll (load more when scrolling up)
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
