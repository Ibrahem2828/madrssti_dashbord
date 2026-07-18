"use client";

import {useRef, useState} from "react";
import {useTranslations} from "next-intl";

import {DocumentFileUploader, type DocumentFileUploaderHandle} from "@/components/correspondence/document-file-uploader";
import {Button} from "@/components/ui/button";

type AttachmentUploaderProps = {
  documentId: string;
  onUploadComplete?: () => void;
};

/**
 * @deprecated Compatibility adapter for retained legacy routes.
 * It now delegates exclusively to the same-origin BFF-backed DocumentFileUploader.
 */
export function AttachmentUploader({documentId, onUploadComplete}: AttachmentUploaderProps) {
  const t = useTranslations("attachments");
  const ref = useRef<DocumentFileUploaderHandle | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!ref.current?.hasPendingFiles()) return;
    setUploading(true);
    await ref.current.uploadPending(documentId);
    setUploading(false);
    onUploadComplete?.();
  };

  return (
    <div className="space-y-4">
      <DocumentFileUploader ref={ref} documentId={documentId} onUploadComplete={() => onUploadComplete?.()} />
      <div className="flex justify-end">
        <Button type="button" loading={uploading} onClick={() => void upload()}>{t("upload")}</Button>
      </div>
    </div>
  );
}
