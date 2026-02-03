import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmojiReaction } from './EmojiReaction';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { GroupedReactionsSchemaType } from '@/schemas/message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { MessageListItem } from '@/lib/types';

type ThreadContext = { type: 'thread'; threadId: string };
type ListContext = { type: 'list'; channelId: string };

interface ReactionsBarProps {
  messageId: string;
  reactions: GroupedReactionsSchemaType[];
  context?: ThreadContext | ListContext;
}

type MessagePage = {
  items: MessageListItem[];
  nextCursor: string | null;
};

type InfiniteReplies = InfiniteData<MessagePage>;

type ThreadData = {
  parent: any;
  messages: any[];
};

// Helper function to update reactions optimistically
function updateReactions(
  currentReactions: GroupedReactionsSchemaType[],
  emoji: string,
): GroupedReactionsSchemaType[] {
  const existing = currentReactions.find((r) => r.emoji === emoji);

  if (existing) {
    if (existing.reactedByUser) {
      // User already reacted, remove reaction
      const dec = existing.count - 1;
      if (dec === 0) {
        return currentReactions.filter((r) => r.emoji !== emoji);
      }
      return currentReactions.map((r) =>
        r.emoji === emoji ? { ...r, count: dec, reactedByUser: false } : r,
      );
    } else {
      // User hasn't reacted, add reaction
      return currentReactions.map((r) =>
        r.emoji === emoji ? { ...r, count: r.count + 1, reactedByUser: true } : r,
      );
    }
  } else {
    // New emoji reaction
    return [...currentReactions, { emoji, count: 1, reactedByUser: true }];
  }
}

export function ReactionsBar({ messageId, reactions, context }: ReactionsBarProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        const isThread = context?.type === 'thread';
        const isList = context?.type === 'list';

        toast.loading(
          isThread
            ? 'Toggling reaction in thread...'
            : isList
              ? 'Toggling reaction in list...'
              : 'Toggling reaction...',
        );

        const listKey = ['messages', 'list', channelId];
        const threadKey = isThread ? ['messages', 'thread', context.threadId] : null;

        // Cancel relevant queries
        await queryClient.cancelQueries({ queryKey: listKey });
        if (threadKey) {
          await queryClient.cancelQueries({ queryKey: threadKey });
        }

        const previousList = queryClient.getQueryData(listKey);
        const previousThread = threadKey ? queryClient.getQueryData(threadKey) : null;

        // Update list cache
        queryClient.setQueryData<InfiniteReplies>(listKey, (oldData) => {
          if (!oldData) return oldData;

          const pages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((message) => {
              if (message.id !== messageId) return message;
              return {
                ...message,
                reactions: updateReactions(message.reactions, vars.emoji),
              };
            }),
          }));
          return { ...oldData, pages };
        });

        // Update thread cache if in thread context
        if (threadKey) {
          queryClient.setQueryData<ThreadData>(threadKey, (oldData) => {
            if (!oldData) return oldData;

            // Check if the message is the parent
            if (oldData.parent.id === messageId) {
              return {
                ...oldData,
                parent: {
                  ...oldData.parent,
                  reactions: updateReactions(oldData.parent.reactions || [], vars.emoji),
                },
              };
            }

            // Check if the message is in replies
            const messages = oldData.messages.map((message) => {
              if (message.id !== messageId) return message;
              return {
                ...message,
                reactions: updateReactions(message.reactions || [], vars.emoji),
              };
            });

            return { ...oldData, messages };
          });
        }

        return { previousList, previousThread, listKey, threadKey };
      },
      onSuccess: () => {
        toast.success('Reaction toggled!');
      },
      onError: (_err, _vars, ctx) => {
        // Rollback on error
        if (ctx?.previousList) {
          queryClient.setQueryData(ctx.listKey, ctx.previousList);
        }
        if (ctx?.previousThread && ctx?.threadKey) {
          queryClient.setQueryData(ctx.threadKey, ctx.previousThread);
        }
        toast.error('Failed to toggle reaction.');
      },
      onSettled: (_data, _err, _vars, ctx) => {
        toast.dismiss();
        // Invalidate to refetch from server
        queryClient.invalidateQueries({ queryKey: ['messages', 'list', channelId] });
        if (ctx?.threadKey) {
          queryClient.invalidateQueries({ queryKey: ctx.threadKey });
        }
      },
    }),
  );

  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.reactedByUser ? 'secondary' : 'outline'}
          size="sm"
          className={cn('reaction-button px-2 py-1 cursor-pointer', {
            'bg-secondary text-secondary-foreground': reaction.reactedByUser,
          })}
          onClick={() => handleToggle(reaction.emoji)}
          type="button"
        >
          <span>{reaction.emoji}</span> <span>{reaction.count}</span>
        </Button>
      ))}

      <EmojiReaction onSelect={handleToggle} />
    </div>
  );
}
