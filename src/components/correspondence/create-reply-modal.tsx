"use client";

import React, { useState } from "react";
import type { CorrespondenceDocument, DocumentPriority } from "@/contracts/correspondence";
import { apiCreateReply } from "@/services/api";
import { useToast } from "@/components/shared/toast";

interface CreateReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentDocument: CorrespondenceDocument;
}

export function CreateReplyModal({ isOpen, onClose, parentDocument }: CreateReplyModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<DocumentPriority>("NORMAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const parentDirectionLabel =
    parentDocument.direction === "INCOMING"
      ? "وارد"
      : parentDocument.direction === "OUTGOING"
      ? "صادر"
      : "داخلي";

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast("warning", "عنوان الرد مطلوب");
      return;
    }

    setIsSubmitting(true);
    const result = await apiCreateReply(parentDocument.id, {
      title: title.trim(),
      subject: subject.trim() || title.trim(),
      document_date: new Date().toISOString().split("T")[0] ?? "",
      priority,
      notes: summary.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast("success", "تم إنشاء الرد بنجاح", `تم إنشاء رد على ${parentDocument.referenceNumber}`);
      setTitle("");
      setSubject("");
      setSummary("");
      setPriority("NORMAL");
      onClose();
    } else {
      showToast("error", "فشل إنشاء الرد", result.message ?? "حدث خطأ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        dir="rtl"
        className="w-full max-w-lg mx-4 rounded-xl border border-surface-border bg-white shadow-brand-lg dark:bg-surface-dark"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">إنشاء رد على المراسلة</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary" aria-label="إغلاق">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-3 dark:bg-dark-muted/50">
            <p className="text-xs font-medium text-text-muted">المراسلة الأصلية</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{parentDocument.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-text-muted">
              <span>المرجع: {parentDocument.referenceNumber}</span>
              <span>الاتجاه: {parentDirectionLabel}</span>
              {parentDocument.senderName && <span>المرسل: {parentDocument.senderName}</span>}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">
                العنوان <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`رد: ${parentDocument.title}`}
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">الموضوع</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`الموضوع: ${parentDocument.subject}`}
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">الملخص</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="ملخص الرد..."
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30 resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-primary">الأولوية</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "LOW" as DocumentPriority, label: "منخفضة", color: "border-surface-border text-text-muted" },
                  { value: "NORMAL" as DocumentPriority, label: "عادية", color: "border-surface-border text-text-primary" },
                  { value: "HIGH" as DocumentPriority, label: "مرتفعة", color: "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20" },
                  { value: "URGENT" as DocumentPriority, label: "عاجلة", color: "border-status-error text-status-error bg-status-error/5" },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                      priority === p.value ? `${p.color} border-current` : "border-surface-border text-text-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-brand-gold/30 bg-brand-gold/5 p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <svg className="h-4 w-4 shrink-0 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                سيتم ربط الرد تلقائياً بالمراسلة الأصلية <strong>{parentDocument.referenceNumber}</strong> وتصنيفه كرد (REPLY_TO)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted">
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="rounded-lg bg-brand-gold px-5 py-2 text-sm font-medium text-brand-navy transition-all hover:bg-brand-gold-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جارٍ الإرسال...
              </span>
            ) : (
              "إنشاء الرد"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}