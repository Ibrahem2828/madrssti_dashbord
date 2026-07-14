"use client";

import React, { useState, useEffect } from "react";
import { apiFetchBehaviorLog } from "@/services/api";
import { SkeletonTable } from "@/components/shared/skeleton-card";

interface AtRiskStudent {
  rank: number;
  studentName: string;
  grade: string;
  negativePoints: number;
  totalNegativeActions: number;
  recentNegative: number;
  daysSinceLastAction: number;
  riskLevel: "CRITICAL" | "WARNING" | "MONITOR";
}

interface BehaviorEntryFlat {
  id: string;
  studentName: string;
  points: number;
  type: string;
  reason: string;
  date: string;
}

export function BehavioralAtRiskTerminal() {
  const [entries, setEntries] = useState<BehaviorEntryFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    (async () => {
      const result = await apiFetchBehaviorLog();
      if (result.success && result.data) {
        const items = result.data.results.map((r) => ({
          id: r.id,
          studentName: r.student_name,
          points: r.points,
          type: r.type,
          reason: r.reason,
          date: r.date,
        }));
        setEntries(items);
      }
      setLoading(false);
    })();
  }, []);

  const totalNegative = entries.filter((e) => e.type === "NEGATIVE").reduce((sum, e) => sum + e.points, 0);
  const negativeCount = entries.filter((e) => e.type === "NEGATIVE").length;
  const summary = { totalNegative, negativeCount };

  const atRiskStudents: AtRiskStudent[] = [
    { rank: 1, studentName: "عمر خالد الأحمد", grade: "٨/أ", negativePoints: 28, totalNegativeActions: 6, recentNegative: 3, daysSinceLastAction: 1, riskLevel: "CRITICAL" },
    { rank: 2, studentName: "سامي عبدالله الزيد", grade: "٩/ب", negativePoints: 22, totalNegativeActions: 4, recentNegative: 2, daysSinceLastAction: 3, riskLevel: "CRITICAL" },
    { rank: 3, studentName: "خالد سعد الدوسري", grade: "٨/أ", negativePoints: 15, totalNegativeActions: 3, recentNegative: 1, daysSinceLastAction: 7, riskLevel: "WARNING" },
    { rank: 4, studentName: "فيصل محمد العلي", grade: "٧/ج", negativePoints: 12, totalNegativeActions: 2, recentNegative: 1, daysSinceLastAction: 5, riskLevel: "WARNING" },
    { rank: 5, studentName: "نواف محمد الجهني", grade: "٩/ب", negativePoints: 8, totalNegativeActions: 2, recentNegative: 0, daysSinceLastAction: 14, riskLevel: "MONITOR" },
  ];

  const filtered = atRiskStudents.filter((s) => s.negativePoints >= threshold);
  const criticalCount = atRiskStudents.filter((s) => s.riskLevel === "CRITICAL").length;
  const warningCount = atRiskStudents.filter((s) => s.riskLevel === "WARNING").length;

  const riskStyles: Record<string, string> = {
    CRITICAL: "bg-status-error/10 text-status-error border border-status-error/20",
    WARNING: "bg-status-warning/10 text-status-warning border border-status-warning/20",
    MONITOR: "bg-status-info/10 text-status-info border border-status-info/20",
  };
  const riskText: Record<string, string> = { CRITICAL: "حرج", WARNING: "تنبيه", MONITOR: "مراقبة" };

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي النقاط السلبية", value: summary.totalNegative, color: "text-status-error" },
          { label: "حالات حرجة", value: criticalCount, color: "text-status-error" },
          { label: "حالات تنبيه", value: warningCount, color: "text-status-warning" },
          { label: "عدد العمليات السلبية", value: summary.negativeCount, color: "text-text-muted" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-border bg-white p-4 shadow-brand-sm dark:bg-surface-dark">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-text-muted">حد الأدنى للنقاط السلبية:</label>
        <input
          type="range"
          min="1"
          max="30"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-32 accent-brand-gold"
        />
        <span className="text-xs font-semibold text-text-primary">{threshold}</span>
      </div>

      <div className="rounded-xl border border-surface-border bg-white shadow-brand-sm dark:bg-surface-dark">
        <div className="border-b border-surface-border bg-status-error/5 px-5 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">محطة الطلاب المعرضون للخطر</h3>
            <span className="rounded-full bg-status-error/10 px-2.5 py-0.5 text-xs font-medium text-status-error">
              {filtered.length} طالب
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-muted">
              <svg className="mb-2 h-8 w-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">لا يوجد طلاب فوق الحد المحدد</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted/50 dark:bg-dark-muted/50">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">الطالب</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">الصف</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">النقاط السلبية</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">عدد المخالفات</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">آخر مخالفة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">مستوى الخطورة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((student) => (
                  <tr key={student.studentName} className="transition-colors hover:bg-surface-muted/30 dark:hover:bg-dark-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-muted">{String(student.rank).padStart(2, "٠")}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">{student.studentName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">{student.grade}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-bold text-status-error">{student.negativePoints}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">{student.totalNegativeActions}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`text-xs ${student.daysSinceLastAction <= 3 ? "text-status-error font-medium" : "text-text-muted"}`}>
                        {student.daysSinceLastAction === 0 ? "اليوم" : `منذ ${student.daysSinceLastAction} أيام`}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskStyles[student.riskLevel]}`}>
                        {riskText[student.riskLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="rounded-lg px-2.5 py-1 text-xs font-medium text-brand-navy transition-colors hover:bg-brand-navy/5 dark:text-brand-gold dark:hover:bg-brand-gold/10">
                        عرض الملف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}