"use client";

import {AlertTriangle, CheckCircle2, Crown, FileText, Loader2, RotateCcw, Upload, X} from "lucide-react";
import {forwardRef, useCallback, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent} from "react";
import {useTranslations} from "next-intl";

import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import {Button} from "@/components/ui/button";
import type {SchoolDocumentAttachment} from "@/features/school/types/contracts";
import {uploadDocumentAttachment} from "@/features/school/services/school-api";
import {cn} from "@/lib/utils";

const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export type LocalDocumentUploadStatus = "pending" | "uploading" | "success" | "failed" | "cancelled" | "validation-failed";

export type LocalDocumentUploadItem = {
  localId: string;
  file: File;
  status: LocalDocumentUploadStatus;
  progress: number | null;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
  serverAttachment?: SchoolDocumentAttachment;
  isPrimary: boolean;
  abortController?: AbortController;
};

export type DocumentUploadBatchResult = {
  uploaded: number;
  failed: number;
  cancelled: number;
};

export type DocumentFileUploaderHandle = {
  uploadPending: (documentId: string) => Promise<DocumentUploadBatchResult>;
  hasPendingFiles: () => boolean;
};

type DocumentFileUploaderProps = {
  documentId?: string;
  disabled?: boolean;
  onUploadComplete?: (attachment: SchoolDocumentAttachment) => void;
  onUploadBatchComplete?: (result: DocumentUploadBatchResult) => void;
};

function createLocalId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0]}`;
}

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentFileUploader = forwardRef<DocumentFileUploaderHandle, DocumentFileUploaderProps>(function DocumentFileUploader(
  {documentId, disabled = false, onUploadComplete, onUploadBatchComplete},
  ref,
) {
  const t = useTranslations("attachments");
  const common = useTranslations("common");
  const inputId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<LocalDocumentUploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<LocalDocumentUploadItem | null>(null);

  const validateFile = (file: File): Pick<LocalDocumentUploadItem, "status" | "errorCode" | "errorMessage"> | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return {status: "validation-failed", errorCode: "UNSUPPORTED_MEDIA_TYPE", errorMessage: t("invalidType")};
    }

    if (file.type && !PDF_MIME_TYPES.has(file.type.toLowerCase())) {
      return {status: "validation-failed", errorCode: "UNSUPPORTED_MEDIA_TYPE", errorMessage: t("invalidType")};
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      return {status: "validation-failed", errorCode: "FILE_TOO_LARGE", errorMessage: t("tooLarge", {maxSize: "20 MB"})};
    }

    return null;
  };

  const addFiles = (files: readonly File[]) => {
    if (disabled || files.length === 0) return;

    setItems((current) => {
      const accepted = [...current];
      files.forEach((file) => {
        const duplicate = accepted.some((item) => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified);
        const validation = validateFile(file);
        accepted.push({
          localId: createLocalId(),
          file,
          status: duplicate ? "validation-failed" : validation?.status ?? "pending",
          progress: null,
          errorCode: duplicate ? "DUPLICATE_FILE" : validation?.errorCode,
          errorMessage: duplicate ? t("duplicate") : validation?.errorMessage,
          isPrimary: !duplicate && !validation && !accepted.some((item) => item.isPrimary && item.status !== "validation-failed") && accepted.filter((item) => item.status !== "validation-failed").length === 0,
        });
      });
      return accepted;
    });
  };

  const uploadOne = useCallback(async (item: LocalDocumentUploadItem, targetDocumentId: string): Promise<"uploaded" | "failed" | "cancelled"> => {
    const controller = new AbortController();
    setItems((current) => current.map((entry) => entry.localId === item.localId ? {...entry, status: "uploading", progress: null, abortController: controller, errorCode: undefined, errorMessage: undefined} : entry));
    const result = await uploadDocumentAttachment(targetDocumentId, item.file, item.isPrimary, controller.signal);

    if (result.success) {
      setItems((current) => current.map((entry) => entry.localId === item.localId ? {...entry, status: "success", progress: 100, abortController: undefined, serverAttachment: result.data} : entry));
      onUploadComplete?.(result.data);
      return "uploaded";
    }

    const cancelled = result.error.code === "ABORTED" || controller.signal.aborted;
    setItems((current) => current.map((entry) => entry.localId === item.localId ? {
      ...entry,
      status: cancelled ? "cancelled" : "failed",
      progress: null,
      abortController: undefined,
      errorCode: result.error.code,
      errorMessage: cancelled ? t("cancelled") : result.error.message,
      requestId: result.requestId,
    } : entry));
    return cancelled ? "cancelled" : "failed";
  }, [onUploadComplete, t]);

  const uploadPending = useCallback(async (targetDocumentId = documentId): Promise<DocumentUploadBatchResult> => {
    if (!targetDocumentId) return {uploaded: 0, failed: 0, cancelled: 0};
    const queued = items.filter((item) => item.status === "pending" || item.status === "failed" || item.status === "cancelled");
    const totals: DocumentUploadBatchResult = {uploaded: 0, failed: 0, cancelled: 0};

    for (const item of queued) {
      const outcome = await uploadOne(item, targetDocumentId);
      if (outcome === "uploaded") totals.uploaded += 1;
      if (outcome === "failed") totals.failed += 1;
      if (outcome === "cancelled") totals.cancelled += 1;
    }

    onUploadBatchComplete?.(totals);
    return totals;
  }, [documentId, items, onUploadBatchComplete, uploadOne]);

  useImperativeHandle(ref, () => ({
    uploadPending,
    hasPendingFiles: () => items.some((item) => item.status === "pending" || item.status === "failed" || item.status === "cancelled"),
  }), [items, uploadPending]);

  const setPrimary = (localId: string) => {
    setItems((current) => {
      if (current.some((item) => item.status === "success" && item.isPrimary)) return current;
      return current.map((item) => ({...item, isPrimary: item.localId === localId && item.status === "pending"}));
    });
  };

  const requestRemove = (item: LocalDocumentUploadItem) => {
    if (item.status === "success") return;
    setConfirmTarget(item);
  };

  const removeTarget = () => {
    if (!confirmTarget) return;
    confirmTarget.abortController?.abort();
    setItems((current) => current.filter((item) => item.localId !== confirmTarget.localId));
    setConfirmTarget(null);
  };

  const retry = (item: LocalDocumentUploadItem) => {
    if (!documentId || item.status === "uploading") return;
    void uploadOne(item, documentId);
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <section aria-labelledby={`${inputId}-title`} className="space-y-4">
      <input ref={inputRef} id={inputId} type="file" accept="application/pdf,.pdf" multiple className="sr-only" onChange={handleSelect} disabled={disabled} />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed sm:p-8",
          dragActive && "border-primary bg-accent",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <Upload className="mx-auto h-7 w-7 text-primary" aria-hidden />
        <h3 id={`${inputId}-title`} className="mt-3 text-sm font-semibold">{t("dropzone")}</h3>
        <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" tabIndex={-1} disabled={disabled} aria-label={t("selectFile")}>
          <FileText className="h-4 w-4" aria-hidden />
          {t("selectFile")}
        </Button>
      </div>

      {items.length ? (
        <ul className="space-y-2" aria-live="polite">
          {items.map((item) => {
            const canChangePrimary = item.status === "pending";
            const canRetry = Boolean(documentId) && (item.status === "failed" || item.status === "cancelled");
            const statusLabel = t(item.status);
            return (
              <li key={item.localId} className={cn("rounded-xl border bg-card p-3 text-card-foreground", item.status === "failed" || item.status === "validation-failed" ? "border-danger/40" : "border-border")}>
                <div className="flex items-start gap-3">
                  {item.status === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden /> : item.status === "failed" || item.status === "validation-failed" ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden /> : item.status === "uploading" ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden /> : <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" dir="auto">{item.file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("fileSize", {size: fileSize(item.file.size)})} · {statusLabel}</p>
                    {item.status === "uploading" ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t("uploading")} aria-valuetext={t("uploading")}><div className="h-full w-1/2 animate-pulse rounded-full bg-primary" /></div> : null}
                    {item.errorMessage ? <p className="mt-2 text-xs text-danger">{item.errorMessage}{item.errorCode ? ` (${item.errorCode})` : ""}{item.requestId ? ` · ${item.requestId}` : ""}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {canChangePrimary ? <Button type="button" variant={item.isPrimary ? "warning" : "ghost"} size="icon" aria-label={item.isPrimary ? t("officialCopy") : t("markPrimary")} title={item.isPrimary ? t("officialCopy") : t("markPrimary")} onClick={() => setPrimary(item.localId)}><Crown className="h-4 w-4" aria-hidden /></Button> : null}
                    {canRetry ? <Button type="button" variant="ghost" size="icon" aria-label={t("retry")} title={t("retry")} onClick={() => retry(item)}><RotateCcw className="h-4 w-4" aria-hidden /></Button> : null}
                    {item.status === "uploading" ? <Button type="button" variant="ghost" size="icon" aria-label={t("cancel")} title={t("cancel")} onClick={() => item.abortController?.abort()}><X className="h-4 w-4" aria-hidden /></Button> : item.status !== "success" ? <Button type="button" variant="ghost" size="icon" aria-label={t("remove")} title={t("remove")} onClick={() => requestRemove(item)}><X className="h-4 w-4" aria-hidden /></Button> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      <ConfirmDialog open={Boolean(confirmTarget)} onOpenChange={(open) => !open && setConfirmTarget(null)} title={t("removeTitle")} description={t("removeDescription")} confirmLabel={t("remove")} cancelLabel={common("cancel")} variant="danger" onConfirm={removeTarget} />
    </section>
  );
});

DocumentFileUploader.displayName = "DocumentFileUploader";
