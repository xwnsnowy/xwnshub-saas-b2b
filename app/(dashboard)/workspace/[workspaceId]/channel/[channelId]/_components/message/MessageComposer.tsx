import { RichTextEditor } from '@/components/rich-text-editor/Editor';
import { Button } from '@/components/ui/button';
import { ImageIcon, Send } from 'lucide-react';

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
}

export function MessageComposer({ value, onChange }: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button type="button" size="sm">
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          <Button size="sm" variant="outline">
            <ImageIcon className="size-4 mr-1" />
            Attach
          </Button>
        }
      />
    </>
  );
}
