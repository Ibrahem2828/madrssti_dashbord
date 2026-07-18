"use client";

import {Download, FileWarning, Loader2} from "lucide-react";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {gatewayHref} from "@/lib/api/browser-client";
import {schoolEndpoints} from "@/config/endpoints.school";
import {fetchDocumentAttachmentPreview} from "@/features/school/services/school-api";

type DocumentPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  attachmentId: string;
  filename: string;
};

/** PDF preview is fetched through the BFF and the temporary browser object URL is always revoked. */
export function DocumentPreviewDialog({open, onOpenChange, documentId, attachmentId, filename}: DocumentPreviewDialogProps) {
  const t = useTranslations("attachments");
  const common = useTranslations("common");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<{code: string; requestId?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    setUrl(null);

    void fetchDocumentAttachmentPreview(documentId, attachmentId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.success) {
        setError({code: result.error.code, requestId: result.requestId});
        setLoading(false);
        return;
      }
      objectUrl = URL.createObjectURL(result.data.blob);
      setUrl(objectUrl);
      setLoading(false);
    });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachmentId, documentId, open]);

  const downloadHref = gatewayHref("school", schoolEndpoints.documents.download(documentId, attachmentId));
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("previewTitle")}
      description={filename}
      size="lg"
      closeLabel={common("close")}
      footer={<div className="flex justify-end"><a href={downloadHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" download><Download className="h-4 w-4" aria-hidden />{t("download")}</a></div>}
    >
      <div className="min-h-[55vh] rounded-lg border bg-muted/30">
        {loading ? <div className="flex min-h-[55vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />{t("previewLoading")}</div> : null}
        {error ? <div className="flex min-h-[55vh] flex-col items-center justify-center gap-2 p-6 text-center"><FileWarning className="h-7 w-7 text-danger" aria-hidden /><p className="font-medium">{t("previewFailed")}</p><p className="text-sm text-muted-foreground">{error.code}{error.requestId ? ` · ${error.requestId}` : ""}</p><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{common("close")}</Button></div> : null}
        {url ? <iframe title={t("previewFrameTitle", {filename})} src={url} className="min-h-[55vh] w-full rounded-lg" /> : null}
      </div>
    </Dialog>
  );
}
