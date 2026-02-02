import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmojiReaction } from './EmojiReaction';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { GroupedReactionsSchemaType } from '@/schemas/message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { AsyncResource } from 'async_hooks';
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

export function ReactionsBar({ messageId, reactions, context }: ReactionsBarProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        const isThread = context && context.type === 'thread';
        const isList = context && context.type === 'list';
        toast.loading(
          isThread
            ? 'Toggling reaction in thread...'
            : isList
              ? 'Toggling reaction in list...'
              : 'Toggling reaction...',
        );

        const listKey = ['messages', 'list', channelId];
        await queryClient.cancelQueries({ queryKey: listKey });

        const previos = queryClient.getQueryData(listKey);

        queryClient.setQueryData<InfiniteReplies>(listKey, (oldData: any) => {
          if (!oldData) return oldData;

          const pages = oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((message: any) => {
              if (message.id !== messageId) return message;

              const current = message.reactions;

              const exisiting = current.find((r: any) => r.emoji === vars.emoji);

              let next: GroupedReactionsSchemaType[];
              if (exisiting) {
                const dec = exisiting.count - 1;
                if (dec === 0) {
                  next = current.filter((r: any) => r.emoji !== vars.emoji);
                } else {
                  next = current.map((r: any) =>
                    r.emoji === vars.emoji ? { ...r, count: dec, reactedByUser: false } : r,
                  );
                }
              } else {
                next = [...current, { emoji: vars.emoji, count: 1, reactedByUser: true }];
              }

              return { ...message, reactions: next };
            }),
          }));
          return { ...oldData, pages };
        });
        return { previous: previos, listKey };
      },
      onSuccess: () => {
        toast.success('Reaction toggled!');
      },
      onError: (_err, _vars, context) => {
        // Rollback nếu có lỗi
        if (context?.previous) {
          queryClient.setQueryData(context.listKey, context.previous);
        }
        toast.error('Failed to toggle reaction.');
      },
      onSettled: () => {
        // Dismiss loading toast
        toast.dismiss();
        // Invalidate để fetch lại từ server
        queryClient.invalidateQueries({ queryKey: ['messages', 'list', channelId] });
      },
    }),
  );

  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
  };

  return (
    <div className="mt-1 flex items-center gap-1r">
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
