"use client";

import React, { useState, useRef, useCallback } from "react";
import { apiUploadAttachment } from "@/services/api";
import { useToast } from "@/components/shared/toast";
import { formatFileSize } from "@/lib/utils";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: "uploading" | "success" | "error";
  errorMsg?: string;
  downloadUrl?: string;
}

interface AttachmentUploaderProps {
  documentId: string;
  onUploadComplete?: () => void;
}

const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "xlsx", "xls", "jpg", "png", "zip"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function AttachmentUploader({ documentId, onUploadComplete }: AttachmentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const validateFile = useCallback((file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `امتداد .${ext} غير مدعوم. الامتدادات المسموحة: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `حجم الملف (${formatFileSize(file.size)}) يتجاوز الحد الأقصى (٢٠ م.ب)`;
    }
    return null;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setFiles((prev) => [
          ...prev,
          { name: file.name, size: file.size, type: file.type, status: "error", errorMsg: error },
        ]);
        showToast("error", "فشل رفع الملف", error);
        return;
      }

      const fileEntry: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
      };

      setFiles((prev) => [...prev, fileEntry]);

      const result = await apiUploadAttachment(documentId, file, false);

      if (result.success && result.data) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: "success", downloadUrl: result.data!.download_url }
              : f
          )
        );
        showToast("success", "تم رفع الملف", `تم رفع ${file.name} بنجاح`);
        onUploadComplete?.();
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: "error", errorMsg: result.message ?? "فشل الرفع" }
              : f
          )
        );
        showToast("error", "فشل رفع الملف", result.message ?? "حدث خطأ أثناء الرفع");
      }
    },
    [documentId, validateFile, showToast, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(processFile);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      selectedFiles.forEach(processFile);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile]
  );

  const removeFile = useCallback((fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const statusIcons: Record<string, React.ReactNode> = {
    uploading: (
      <svg className="h-4 w-4 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
    success: (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-status-success/10 text-[10px] text-status-success">✓</span>
    ),
    error: (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-status-error/10 text-[10px] text-status-error">✕</span>
    ),
  };

  return (
    <div dir="rtl">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          isDragOver
            ? "border-brand-gold bg-brand-gold/5"
            : "border-surface-border hover:border-brand-gold/40 hover:bg-surface-muted/50 dark:hover:bg-dark-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          className="hidden"
          onChange={handleFileSelect}
        />
        <svg className="mx-auto mb-2 h-8 w-8 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm font-medium text-text-muted">اسحب وأفلت الملفات هنا أو اضغط للاختيار</p>
        <p className="mt-1 text-[10px] text-text-muted">
          {ALLOWED_EXTENSIONS.join(", ").toUpperCase()} — الحد الأقصى ٢٠ م.ب
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className={`rounded-lg border p-3 transition-all ${
                file.status === "error"
                  ? "border-status-error/20 bg-status-error/5"
                  : file.status === "success"
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
                  : "border-surface-border bg-white dark:bg-surface-dark"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="mt-0.5">{statusIcons[file.status]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary truncate">{file.name}</p>
                    <p className="text-[10px] text-text-muted">{formatFileSize(file.size)}</p>
                    {file.status === "uploading" && (
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-muted dark:bg-dark-muted">
                        <div className="h-1 w-1/2 animate-pulse rounded-full bg-brand-gold" />
                      </div>
                    )}
                    {file.status === "error" && file.errorMsg && (
                      <p className="mt-0.5 text-[10px] text-status-error">{file.errorMsg}</p>
                    )}
                    {file.status === "success" && file.downloadUrl && (
                      <a
                        href={file.downloadUrl}
                        className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-brand-gold hover:text-brand-gold-300"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        تحميل
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="shrink-0 rounded p-1 text-text-muted/40 transition-colors hover:bg-surface-muted hover:text-text-muted"
                  aria-label="حذف الملف"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
