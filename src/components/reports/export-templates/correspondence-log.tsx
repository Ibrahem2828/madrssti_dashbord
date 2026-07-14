import React from "react";
import type { CorrespondenceDocument } from "@/contracts/correspondence";

interface CorrespondenceLogProps {
  documents: CorrespondenceDocument[];
  schoolName: string;
  academicYear: string;
  generatedAt: string;
  logType: "INCOMING" | "OUTGOING" | "INTERNAL" | "ALL";
}

const directionLabel: Record<string, string> = { INCOMING: "وارد", OUTGOING: "صادر", INTERNAL: "داخلي" };
const statusLabel: Record<string, string> = { DRAFT: "مسودة", PENDING_REVIEW: "قيد المراجعة", APPROVED: "معتمد", REJECTED: "مرفوض", ARCHIVED: "مؤرشف", CANCELLED: "ملغي" };
const priorityLabel: Record<string, string> = { URGENT: "عاجل", HIGH: "مرتفع", NORMAL: "عادي", LOW: "منخفض" };

export function CorrespondenceLog({ documents, schoolName, academicYear, generatedAt, logType }: CorrespondenceLogProps) {
  const filtered = logType === "ALL" ? documents : documents.filter((d) => d.direction === logType);

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-5xl bg-white p-8 rounded-2xl border border-surface-border shadow-brand-lg print:shadow-none"
    >
      <div className="border-b-2 border-brand-navy pb-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-navy text-lg font-bold text-white">م</div>
            <div>
              <h1 className="text-lg font-bold text-brand-navy">سجل المراسلات | Correspondence Log</h1>
              <p className="text-xs text-text-muted">{schoolName}</p>
            </div>
          </div>
          <div className="text-left text-xs text-text-muted">
            <p>العام الدراسي: {academicYear}</p>
            <p>تاريخ التقرير: {generatedAt}</p>
            <p>النوع: {logType === "ALL" ? "الكل" : directionLabel[logType]}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-text-muted">
        <span>إجمالي المراسلات: <strong className="text-text-primary">{filtered.length}</strong></span>
        <span>المراجع: <strong className="text-text-primary">{filtered.map((d) => d.referenceNumber).join("، ")}</strong></span>
      </div>

      <table className="w-full border-collapse text-xs mb-6">
        <thead>
          <tr className="bg-brand-navy text-white">
            <th className="px-3 py-2 text-right font-medium">المرجع</th>
            <th className="px-3 py-2 text-right font-medium">العنوان</th>
            <th className="px-3 py-2 text-right font-medium">المرسل</th>
            <th className="px-3 py-2 text-right font-medium">المستلم</th>
            <th className="px-3 py-2 text-center font-medium">الاتجاه</th>
            <th className="px-3 py-2 text-center font-medium">الأولوية</th>
            <th className="px-3 py-2 text-center font-medium">الحالة</th>
            <th className="px-3 py-2 text-center font-medium">التاريخ</th>
            <th className="px-3 py-2 text-center font-medium">المرفقات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-6 text-center text-text-muted">لا توجد مراسلات</td>
            </tr>
          ) : (
            filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-surface-muted/50">
                <td className="px-3 py-2 font-mono font-medium text-text-primary">{doc.referenceNumber}</td>
                <td className="px-3 py-2 text-text-primary">{doc.title}</td>
                <td className="px-3 py-2 text-text-muted">{doc.senderName ?? "—"}</td>
                <td className="px-3 py-2 text-text-muted">{doc.recipientName ?? "—"}</td>
                <td className="px-3 py-2 text-center">
                  <span className="rounded-full px-2 py-0.5 font-medium" style={{
                    backgroundColor: doc.direction === "INCOMING" ? "#EFF6FF" : doc.direction === "OUTGOING" ? "#FFFBEB" : "#F3E8FF",
                    color: doc.direction === "INCOMING" ? "#1D4ED8" : doc.direction === "OUTGOING" ? "#D97706" : "#7C3AED",
                  }}>
                    {directionLabel[doc.direction]}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-medium" style={{
                    color: doc.priority === "URGENT" ? "#DC2626" : doc.priority === "HIGH" ? "#D97706" : "#64748B",
                  }}>
                    {priorityLabel[doc.priority]}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span style={{ color: doc.status === "APPROVED" ? "#059669" : doc.status === "REJECTED" ? "#DC2626" : doc.status === "PENDING_REVIEW" ? "#D97706" : "#64748B" }}>
                    {statusLabel[doc.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-center font-mono text-text-muted">{new Date(doc.createdAt).toLocaleDateString("ar-SA")}</td>
                <td className="px-3 py-2 text-center text-text-muted">{doc.attachments.length > 0 ? doc.attachments.length : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="border-t border-surface-border pt-4 flex items-center justify-between text-[10px] text-text-muted">
        <div>
          <p className="font-medium text-text-primary">المدرسة النموذجية للبنين</p>
          <p>الرياض — المملكة العربية السعودية</p>
        </div>
        <div className="text-left">
          <p>رقم التقرير: CL-{academicYear}-{String(Math.floor(Math.random() * 9000) + 1000)}</p>
          <p>تم الإنشاء: {generatedAt}</p>
        </div>
      </div>
    </div>
  );
}