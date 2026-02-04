import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { eventIteratorToStream } from '@orpc/client';
import { client } from '@/lib/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

interface SummarizeThreadProps {
  messageId: string;
}

export function SummarizeThread({ messageId }: SummarizeThreadProps) {
  const [open, setOpen] = useState(false);

  const { messages, status, error, sendMessage, setMessages, stop, clearError } = useChat({
    id: `thread-summary:${messageId}`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.thread.summary.generate(
            {
              messageId,
            },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new Error('Reconnecting to thread summary stream is not supported.');
      },
    },
  });

  const lastAssistantMessage = messages.findLast((msg) => msg.role === 'assistant');

  const summaryText =
    lastAssistantMessage?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('') || '';

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      // Khi mở popover: reset và gửi yêu cầu tóm tắt nếu chưa có
      stop();
      clearError();
      setMessages([]);
      const hasAssistantMessage = messages.some((msg) => msg.role === 'assistant');
      if (status === 'ready' && !hasAssistantMessage) {
        sendMessage({ text: 'Summarize the thread.' });
      }
    } else {
      // Khi đóng popover: dừng và reset
      stop();
      clearError();
      setMessages([]);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="relative overflow-hidden rounded-full bg-gradient-to-t from-violet-600 to-fuchsia-600 text-primary shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.03] active:scale-95"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">Summarize</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-1.5 px-4 text-xs font-medium text-primary shadow-md">
              <Sparkles className="size-3.5" />
              <span className="text-sm font-medium">AI Summary (Preview)</span>
            </span>
          </div>
          {status === 'streaming' && (
            <Button
              onClick={() => {
                stop();
              }}
              type="button"
              size="sm"
              variant="outline"
            >
              Stop
            </Button>
          )}
        </div>

        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div>
              <p className="text-sm text-red-600">Error: {error.message}</p>
              <Button
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: 'Summarize the thread.' });
                }}
                type="button"
                size="sm"
                variant="outline"
                className="m-4 w-full bg-red-600 text-primary hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-200"
              >
                Retry
              </Button>
            </div>
          ) : summaryText ? (
            <p className="whitespace-pre-wrap text-sm">{summaryText}</p>
          ) : status === 'submitted' || status === 'streaming' ? (
            <div className="space-y-2">
              <p className="text-sm italic text-muted-foreground">Summarizing...</p>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Click "Summarize" to generate a summary of this thread.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
