import { ChannelEvent, ChannelEventSchema, RealtimeMessage } from '@/schemas/realtime';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import usePartySocket from 'partysocket/react';
import { createContext, useContext, useMemo } from 'react';

type ChannelRealtimeContextValue = {
  send: (event: ChannelEvent) => void;
};

interface ChannelRealtimeContextProps {
  channelId: string;
  children: React.ReactNode;
}

type MessageListPage = { items: RealtimeMessage[]; nextCursor: string | undefined };

type InfiniteMessages = InfiniteData<MessageListPage>;

const ChannelRealtimeContext = createContext<ChannelRealtimeContextValue | null>(null);

export function ChannelRealtimeProvider({ channelId, children }: ChannelRealtimeContextProps) {
  const queryClient = useQueryClient();

  const socket = usePartySocket({
    host: 'http://127.0.0.1:8787',
    room: `channel-${channelId}`,
    party: 'chat',
    onMessage: (messageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data);

        const result = ChannelEventSchema.safeParse(parsed);
        if (!result.success) {
          console.warn('Received invalid channel event:', parsed);
          return;
        }

        const event = result.data;

        if (event.type === 'message:created') {
          const raw = event.payload.message;

          queryClient.setQueryData<InfiniteMessages>(
            ['messages', 'list', channelId],
            (oldData: InfiniteMessages | undefined) => {
              if (!oldData) {
                return {
                  pages: [
                    {
                      items: [raw],
                      nextCursor: undefined,
                    },
                  ],
                  pageParams: [undefined],
                } as InfiniteMessages;
              }

              const updatedPages = oldData.pages[0];

              const updatedFirstPage: MessageListPage = {
                ...updatedPages,
                items: [raw, ...updatedPages.items],
              };

              return {
                ...oldData,
                pages: [updatedFirstPage, ...oldData.pages.slice(1)],
              };
            },
          );

          return;
        }

        if (event.type === 'message:updated') {
          const updated = event.payload.message;

          // Replace the message in the infinite list by id
          queryClient.setQueryData<InfiniteMessages>(
            ['messages', 'list', channelId],
            (oldData: InfiniteMessages | undefined) => {
              if (!oldData) {
                return oldData;
              }

              const updatedPages = oldData.pages.map((page) => ({
                ...page,
                items: page.items.map((msg) =>
                  msg.id === updated.id ? { ...msg, ...updated } : msg,
                ),
              }));

              return {
                ...oldData,
                pages: updatedPages,
              };
            },
          );
          return;
        }
      } catch (error) {
        console.error('Error handling channel event message:', error);
      }
    },
  });

  const value = useMemo<ChannelRealtimeContextValue>(() => {
    return {
      send: (event) => {
        socket.send(JSON.stringify(event));
      },
    };
  }, [socket]);

  return (
    <ChannelRealtimeContext.Provider value={value}>{children}</ChannelRealtimeContext.Provider>
  );
}

export function useChannelRealtime(): ChannelRealtimeContextValue {
  const context = useContext(ChannelRealtimeContext);

  if (!context) {
    throw new Error('useChannelRealtime must be used within a ChannelRealtimeProvider');
  }

  return context;
}
