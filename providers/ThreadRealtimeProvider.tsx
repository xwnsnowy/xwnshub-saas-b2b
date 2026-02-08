import { orpc } from '@/lib/orpc';
import { RealtimeMessage, ThreadEvent, ThreadEventSchema } from '@/schemas/realtime';
import { useQueryClient } from '@tanstack/react-query';
import usePartySocket from 'partysocket/react';
import { createContext, useContext, useMemo } from 'react';

interface ThreadRealtimeContextValue {
  send: (event: ThreadEvent) => void;
}

interface ThreadRealtimeContextProps {
  threadId: string;
  children: React.ReactNode;
}

const ThreadRealtimeContext = createContext<ThreadRealtimeContextValue | null>(null);

type ThreadListOptions = ReturnType<typeof orpc.message.thread.list.queryOptions>;

type ThreadQueryData = Awaited<ReturnType<ThreadListOptions['queryFn']>>;

export function ThreadRealtimeProvider({ threadId, children }: ThreadRealtimeContextProps) {
  const queryClient = useQueryClient();

  const socket = usePartySocket({
    host: 'http://127.0.0.1:8787',
    room: `thread-${threadId}`,
    party: 'chat',
    onMessage: (messageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data);

        // Assuming ThreadEventSchema is defined similarly to ChannelEventSchema
        const result = ThreadEventSchema.safeParse(parsed);
        if (!result.success) {
          console.warn('Received invalid thread event:', parsed);
          return;
        }

        const event = result.data;

        if (event.type === 'thread:reply:created') {
          const raw = event.payload.reply as RealtimeMessage;

          queryClient.setQueryData(
            ['messages', 'thread', threadId],
            (oldData: ThreadQueryData | undefined) => {
              if (!oldData) {
                return oldData;
              }

              const reply = {
                reactions: Array.isArray(raw.reactions) ? raw.reactions : [],
                ...raw,
              } as ThreadQueryData['messages'][number];

              return {
                ...oldData,
                messages: [...oldData.messages, reply],
              };
            },
          );

          return;
        }
      } catch (error) {
        console.error('Error handling thread event:', error);
      }
    },
  });

  const value = useMemo<ThreadRealtimeContextValue>(() => {
    return {
      send: (event) => {
        socket.send(JSON.stringify(event));
      },
    };
  }, [socket]);

  return <ThreadRealtimeContext.Provider value={value}>{children}</ThreadRealtimeContext.Provider>;
}

export function useThreadRealtime(): ThreadRealtimeContextValue {
  const context = useContext(ThreadRealtimeContext);

  if (!context) {
    throw new Error('useThreadRealtime must be used within a ThreadRealtimeProvider');
  }

  return context;
}
