"use client";

import React, { useState, useEffect } from "react";
import { apiFetchAttendanceRecords } from "@/services/api";
import { SkeletonCard } from "@/components/shared/skeleton-card";

interface MonthlyTrend {
  month: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

export function AttendanceAnalytics() {
  const [currentStats, setCurrentStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, total: 0, attendanceRate: 0, totalPointsAdjustment: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"monthly" | "semester">("monthly");

  useEffect(() => {
    (async () => {
      const result = await apiFetchAttendanceRecords({ page_size: 100 });
      if (result.success && result.data) {
        const records = result.data.results;
        const present = records.filter((r) => r.status === "PRESENT").length;
        const absent = records.filter((r) => r.status === "ABSENT").length;
        const late = records.filter((r) => r.status === "LATE").length;
        const excused = records.filter((r) => r.status === "EXCUSED").length;
        const total = records.length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        setCurrentStats({ present, absent, late, excused, total, attendanceRate, totalPointsAdjustment: 0 });
      }
      setLoading(false);
    })();
  }, []);

  const monthlyTrends: MonthlyTrend[] = [
    { month: "محرم", present: 285, absent: 12, late: 8, excused: 5, total: 310, rate: 92 },
    { month: "صفر", present: 278, absent: 15, late: 10, excused: 7, total: 310, rate: 90 },
    { month: "ربيع الأول", present: 290, absent: 8, late: 6, excused: 6, total: 310, rate: 94 },
    { month: "ربيع الآخر", present: 282, absent: 14, late: 9, excused: 5, total: 310, rate: 91 },
    { month: "جمادى الأولى", present: 295, absent: 6, late: 5, excused: 4, total: 310, rate: 95 },
    { month: "جمادى الآخرة", present: 275, absent: 18, late: 11, excused: 6, total: 310, rate: 89 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    );
  }

  const rateColor = currentStats.attendanceRate >= 90 ? "text-status-success" : currentStats.attendanceRate >= 80 ? "text-status-warning" : "text-status-error";

  return (
    <div dir="rtl" className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "نسبة الحضور", value: `${currentStats.attendanceRate}%`, color: rateColor, detail: `${currentStats.present} حاضر` },
          { label: "الغياب", value: currentStats.absent, color: "text-status-error", detail: `${((currentStats.absent / Math.max(currentStats.total, 1)) * 100).toFixed(1)}%` },
          { label: "التأخير", value: currentStats.late, color: "text-status-warning", detail: `${((currentStats.late / Math.max(currentStats.total, 1)) * 100).toFixed(1)}%` },
          { label: "الحضور الكلي", value: currentStats.total, color: "text-brand-gold", detail: "إجمالي المسجلين" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-border bg-white p-4 shadow-brand-sm dark:bg-surface-dark">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-text-muted">{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${period === "monthly" ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-surface-border text-text-muted"}`}
        >
          شهري
        </button>
        <button
          onClick={() => setPeriod("semester")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${period === "semester" ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-surface-border text-text-muted"}`}
        >
          فصل دراسي
        </button>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-brand-sm dark:bg-surface-dark">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">اتجاهات الحضور الشهرية</h3>
        <div className="space-y-3">
          {monthlyTrends.map((m) => (
            <div key={m.month} className="rounded-lg border border-surface-border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">{m.month}</span>
                <span className={`text-xs font-medium ${m.rate >= 90 ? "text-status-success" : m.rate >= 80 ? "text-status-warning" : "text-status-error"}`}>
                  {m.rate}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-muted dark:bg-dark-muted">
                <div
                  className={`h-2 rounded-full transition-all ${m.rate >= 90 ? "bg-status-success" : m.rate >= 80 ? "bg-status-warning" : "bg-status-error"}`}
                  style={{ width: `${m.rate}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-text-muted">
                <span>حاضر: {m.present}</span>
                <span>غائب: {m.absent}</span>
                <span>متأخر: {m.late}</span>
                <span>معذر: {m.excused}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-brand-sm dark:bg-surface-dark">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">مؤشرات الأداء</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-surface-border p-3 text-center">
            <p className="text-xs text-text-muted">أفضل شهر</p>
            <p className="text-lg font-bold text-status-success mt-1">جمادى الأولى</p>
            <p className="text-xs text-text-muted">نسبة حضور ٩٥٪</p>
          </div>
          <div className="rounded-lg border border-surface-border p-3 text-center">
            <p className="text-xs text-text-muted">أسوأ شهر</p>
            <p className="text-lg font-bold text-status-error mt-1">جمادى الآخرة</p>
            <p className="text-xs text-text-muted">نسبة حضور ٨٩٪</p>
          </div>
          <div className="rounded-lg border border-surface-border p-3 text-center">
            <p className="text-xs text-text-muted">متوسط الفصل</p>
            <p className="text-lg font-bold text-brand-gold mt-1">٩١.٨٪</p>
            <p className="text-xs text-text-muted">معدل الحضور الإجمالي</p>
          </div>
        </div>
      </div>
    </div>
  );
}