import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { MessageItem } from './message/MessageItem';
import { orpc } from '@/lib/orpc';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MessagesList() {
  const { channelId } = useParams<{ channelId: string }>();

  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

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

  // Track the last message ID separately to ensure effect triggers
  const lastMessageId = messages[messages.length - 1]?.id;
  const lastMessageAuthorId = messages[messages.length - 1]?.authorId;

  // Helper to check if near bottom
  const checkIfNearBottom = (container: HTMLDivElement, threshold = 150) => {
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return scrollBottom < threshold;
  };

  // Track scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = checkIfNearBottom(container);
      isNearBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Auto scroll logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    // Initial scroll to bottom
    if (!hasInitialScrolled) {
      container.scrollTop = container.scrollHeight;
      setHasInitialScrolled(true);
      prevMessagesLengthRef.current = messages.length;
      prevScrollHeightRef.current = container.scrollHeight;
      isNearBottomRef.current = true;
      lastMessageIdRef.current = messages[messages.length - 1]?.id || null;
      return;
    }

    const messagesAdded = messages.length - prevMessagesLengthRef.current;

    if (messagesAdded > 0) {
      const latestMessage = messages[messages.length - 1];
      const currentLastMessageId = latestMessage?.id;

      // Check if it's new messages at the bottom (not loading older messages)
      const isNewMessageAtBottom = currentLastMessageId !== lastMessageIdRef.current;

      console.log('📊 Message Update:', {
        messagesAdded,
        isNewMessageAtBottom,
        currentLastMessageId,
        lastMessageIdRef: lastMessageIdRef.current,
        authorId: latestMessage?.authorId,
        userId: user.id,
        isMyMessage: latestMessage?.authorId === user.id,
        isNearBottom: isNearBottomRef.current,
      });

      if (isNewMessageAtBottom) {
        // New messages at bottom
        const isMyMessage = latestMessage?.authorId === user.id;

        console.log('✅ New message detected:', {
          isMyMessage,
          willScroll: isMyMessage || isNearBottomRef.current,
        });

        // Always scroll if it's my message, or if user is near bottom
        if (isMyMessage || isNearBottomRef.current) {
          // Use instant scroll for own messages to avoid timing issues
          if (isMyMessage) {
            console.log('🚀 Instant scroll for my message');
            container.scrollTop = container.scrollHeight;
            isNearBottomRef.current = true;
          } else {
            console.log('🌊 Smooth scroll for others message');
            // Smooth scroll for others' messages when near bottom
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth',
            });
          }
        } else {
          console.log('⏸️ Not scrolling - user scrolled up');
        }

        // Always update lastMessageIdRef for new messages
        lastMessageIdRef.current = currentLastMessageId;
      } else {
        console.log('📜 Loading older messages');

        // Loading older messages - maintain scroll position
        const heightDifference = container.scrollHeight - prevScrollHeightRef.current;
        if (heightDifference > 0) {
          container.scrollTop = container.scrollTop + heightDifference;
        }
      }
    }

    prevMessagesLengthRef.current = messages.length;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages, messages.length, hasInitialScrolled, user.id]);

  // Separate effect specifically for handling new messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasInitialScrolled || !lastMessageId) return;

    // Check if this is a new message (not loading older ones)
    if (lastMessageId !== lastMessageIdRef.current && lastMessageIdRef.current !== null) {
      console.log('🔔 New message effect triggered:', {
        lastMessageId,
        lastMessageAuthorId,
        userId: user.id,
        isMyMessage: lastMessageAuthorId === user.id,
        isNearBottom: isNearBottomRef.current,
      });

      const isMyMessage = lastMessageAuthorId === user.id;

      if (isMyMessage || isNearBottomRef.current) {
        if (isMyMessage) {
          console.log('🚀 [New Effect] Instant scroll for my message');
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            isNearBottomRef.current = true;
          });
        } else {
          console.log('🌊 [New Effect] Smooth scroll for others message');
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }

      lastMessageIdRef.current = lastMessageId;
    }
  }, [lastMessageId, lastMessageAuthorId, hasInitialScrolled, user.id]);

  // Intersection Observer for infinite scroll
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
      isNearBottomRef.current = true;
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
