import { Button } from '@/components/ui/button';
import { useThread } from '@/providers/ThreadProvider';
import { MessageSquareText, Pen, Smile } from 'lucide-react';

interface MessageHoverToolbarProps {
  onEdit?: () => void;
  messageId: string;
}

export function MessageHoverToolbar({ onEdit, messageId }: MessageHoverToolbarProps) {
  const { tooggleThread } = useThread();

  return (
    <div className="absolute top-0 right-4 flex items-center gap-1 bg-accent border border-border rounded-md shadow-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
      <Button variant="ghost" size="icon" className="size-7 hover:scale-120 transition-transform">
        <Smile className="size-5 hover:text-primary transition-colors" />
      </Button>
      <div className="w-px h-5 bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-7 hover:scale-120 transition-transform"
        onClick={onEdit}
      >
        <Pen className="size-5 hover:text-primary transition-colors" />
      </Button>
      <div className="w-px h-5 bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-7 hover:scale-120 transition-transform"
        onClick={() => tooggleThread(messageId)}
      >
        <MessageSquareText className="size-5 hover:text-primary transition-colors" />
      </Button>
    </div>
  );
}
