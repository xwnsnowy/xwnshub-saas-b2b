import { RichTextEditor } from '@/components/rich-text-editor/Editor';
import ImageUploadModal from '@/components/rich-text-editor/ImageUploadModal';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { UseAttachmentUploadType, useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { AttachmentPreview } from './AttachmentPreview';
import { AttachButton } from './AttachButton';

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  upload: UseAttachmentUploadType;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isPending,
  upload,
}: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button disabled={isPending} type="button" size="sm" onClick={onSubmit}>
            <Send className="size-4 mr-1" />
            {isPending ? 'Sending...' : 'Send'}
          </Button>
        }
        footerLeft={
          upload.stagedUrl ? (
            <AttachmentPreview url={upload.stagedUrl} onRemove={() => upload.reset()} />
          ) : (
            <AttachButton onClick={() => upload.setIsOpen(true)} />
          )
        }
      />

      <ImageUploadModal
        onUploaded={(url) => upload.onUploaded(url)}
        open={upload.isOpen}
        onOpenChange={upload.setIsOpen}
      />
    </>
  );
}
