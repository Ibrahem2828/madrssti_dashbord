"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/shared/toast";
import { apiManualAttendanceRecord } from "@/services/api";

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  grade: string;
  status: string;
  checkInTime: string | null;
  pointsAdjustment: number;
  scannedAt?: string;
}

interface QrScannerConsoleProps {
  records: AttendanceRecord[];
  onRecordsChange: (records: AttendanceRecord[]) => void;
}

const statusConfig: Record<string, { text: string; color: string; textColor: string }> = {
  PRESENT: { text: "حاضر", color: "bg-emerald-100 dark:bg-emerald-900/30", textColor: "text-emerald-700 dark:text-emerald-300" },
  ABSENT: { text: "غائب", color: "bg-status-error/10", textColor: "text-status-error" },
  LATE: { text: "متأخر", color: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-700 dark:text-amber-300" },
  EXCUSED: { text: "معذر", color: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-700 dark:text-blue-300" },
};

export function QrScannerConsole({ records, onRecordsChange }: QrScannerConsoleProps) {
  const sc = (s: string) => statusConfig[s]!;
  const [inputValue, setInputValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<AttendanceRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = useCallback(async () => {
    const code = inputValue.trim();
    if (!code) return;

    setIsScanning(true);
    const today = new Date().toISOString().split("T")[0] ?? "";
    const result = await apiManualAttendanceRecord({ student_id: code, status: "PRESENT", date: today });
    setIsScanning(false);

    if (result.success && result.data) {
      const mapped = {
        studentId: result.data.student_id,
        studentName: result.data.student_name,
        grade: result.data.grade ?? "",
        status: result.data.status,
        checkInTime: result.data.check_in_time,
        pointsAdjustment: result.data.points_adjustment,
        scannedAt: result.data.scanned_at,
      };
      const existingIndex = records.findIndex((r) => r.studentId === mapped.studentId);
      let updated: AttendanceRecord[];
      if (existingIndex !== -1) {
        updated = records.map((r, i) => (i === existingIndex ? mapped : r));
      } else {
        updated = [mapped, ...records];
      }
      onRecordsChange(updated);
      setLastScanned(mapped);
      showToast("success", "تم تسجيل الحضور");
    } else {
      showToast("error", "فشل التسجيل", result.message ?? "رمز الطالب غير صالح");
    }

    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [inputValue, records, onRecordsChange, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleScan();
  };

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    excused: records.filter((r) => r.status === "EXCUSED").length,
    attendanceRate: records.length > 0 ? Math.round((records.filter((r) => r.status === "PRESENT").length / records.length) * 100) : 0,
    totalPointsAdjustment: records.reduce((sum, r) => sum + r.pointsAdjustment, 0),
  };

  const handleReset = () => {
    onRecordsChange([]);
    showToast("info", "تم إعادة تعيين السجل");
  };

  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            ماسح الباركود الضوئي (محاكاة)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m4 0h-2m-6-10H6m12 0h-2m-6 4H6m12 0h-2m-6 4H6m12 0h-2M4 4h2m12 12h2M4 16h2m-2-4h2m12 0h2M4 8h2m12 0h2" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="امسح رمز الطالب أو أدخل الرقم..."
                className="w-full rounded-lg border-2 border-dashed border-brand-gold/40 bg-brand-gold/5 px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                autoFocus
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !inputValue.trim()}
              className="flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-navy-600 disabled:opacity-50"
            >
              {isScanning ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "مسح"
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-text-muted">اضغط Enter للمسح السريع</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "الإجمالي", value: stats.total, color: "text-text-primary" },
          { label: "حاضر", value: stats.present, color: "text-status-success" },
          { label: "غائب", value: stats.absent, color: "text-status-error" },
          { label: "متأخر", value: stats.late, color: "text-status-warning" },
          { label: "نسبة الحضور", value: `${stats.attendanceRate}%`, color: "text-brand-gold" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-surface-border bg-white p-3 text-center dark:bg-surface-dark">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{s.label}</p>
            <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {lastScanned && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
              <div>
                <p className="text-sm font-medium text-text-primary">{lastScanned.studentName}</p>
                <p className="text-xs text-text-muted">{lastScanned.grade} — {lastScanned.checkInTime ?? "—"}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${sc(lastScanned.status).color} ${sc(lastScanned.status).textColor}`}>
              {sc(lastScanned.status).text}
            </span>
          </div>
          {lastScanned.pointsAdjustment !== 0 && (
            <p className="mr-8 mt-1 text-xs text-text-muted">
              تعديل النقاط: <span className={lastScanned.pointsAdjustment > 0 ? "text-status-success" : "text-status-error"}>{lastScanned.pointsAdjustment > 0 ? "+" : ""}{lastScanned.pointsAdjustment}</span>
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-surface-border bg-white shadow-brand-sm dark:bg-surface-dark">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">سجل المسح</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{records.length} طالب</span>
            {records.length > 0 && (
              <button onClick={handleReset} className="rounded-lg border border-surface-border px-2.5 py-1 text-[10px] font-medium text-text-muted transition-colors hover:bg-surface-muted">
                إعادة تعيين
              </button>
            )}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <svg className="mb-2 h-8 w-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2m4 0h-2m-6-10H6m12 0h-2m-6 4H6m12 0h-2m-6 4H6m12 0h-2M4 4h2m12 12h2M4 16h2m-2-4h2m12 0h2M4 8h2m12 0h2" />
              </svg>
              <p className="text-xs">لم يتم مسح أي طالب بعد</p>
              <p className="text-[10px]">قم بمسح رمز الطالب للبدء</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted/50 dark:bg-dark-muted/50">
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الطالب</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الصف</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الحالة</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الوقت</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {records.map((record) => (
                  <tr key={record.studentId} className="transition-colors hover:bg-surface-muted/30 dark:hover:bg-dark-muted/30">
                    <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-text-primary">{record.studentName}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-text-muted">{record.grade}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc(record.status).color} ${sc(record.status).textColor}`}>
                        {sc(record.status).text}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-text-muted">{record.checkInTime ?? "—"}</td>
                    <td className={`whitespace-nowrap px-3 py-2 text-xs font-medium ${
                      record.pointsAdjustment > 0 ? "text-status-success" : record.pointsAdjustment < 0 ? "text-status-error" : "text-text-muted"
                    }`}>
                      {record.pointsAdjustment > 0 ? `+${record.pointsAdjustment}` : record.pointsAdjustment === 0 ? "—" : record.pointsAdjustment}
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