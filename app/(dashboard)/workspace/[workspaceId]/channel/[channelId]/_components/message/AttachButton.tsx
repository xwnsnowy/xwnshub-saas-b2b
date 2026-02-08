import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';

export function AttachButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} size="sm" variant="outline" type="button" className="gap-1.5">
      <ImageIcon className="size-4" />
      Attach
    </Button>
  );
}
