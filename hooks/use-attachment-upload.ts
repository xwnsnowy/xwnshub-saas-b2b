'use client';

import { useCallback, useMemo, useState } from 'react';

export function useAttachmentUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  // ✅ Gọi SAU KHI upload thành công - LƯU URL
  const onUploaded = useCallback((url: string) => {
    setStagedUrl(url); // Lưu URL
    setUploading(false);
    setIsOpen(false);
  }, []);

  // ✅ Gọi SAU KHI send message hoặc hủy - XÓA STATE
  const reset = useCallback(() => {
    setStagedUrl(null);
    setUploading(false);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      onUploaded,
      stagedUrl,
      isUploading,
      reset,
    }),
    [isOpen, onUploaded, stagedUrl, isUploading, reset],
  );
}

export type UseAttachmentUploadType = ReturnType<typeof useAttachmentUpload>;
