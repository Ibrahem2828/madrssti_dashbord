"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { Halaqa, HalaqaStudent, HalaqaLevel } from "@/contracts/halaqa";
import { apiFetchHalaqat, apiFetchHalaqaById, apiToggleStudentMembership, apiFetchAvailableStudents, apiUpdateMemorizationTarget } from "@/services/api";
import { useToast } from "@/components/shared/toast";

const SURAHS = [
  { id: "1", nameAr: "الفاتحة", surahNumber: 1 },
  { id: "2", nameAr: "البقرة", surahNumber: 2 },
  { id: "3", nameAr: "آل عمران", surahNumber: 3 },
  { id: "4", nameAr: "النساء", surahNumber: 4 },
  { id: "5", nameAr: "المائدة", surahNumber: 5 },
];

interface HalaqaWithStudents extends Halaqa {
  students: HalaqaStudent[];
}

const levelColors: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  INTERMEDIATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ADVANCED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  MASTERY: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const levelNames: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  MASTERY: "إتقان",
};

export function HalaqaManagementPanel() {
  const [halaqat, setHalaqat] = useState<HalaqaWithStudents[]>([]);
  const [selectedHalaqa, setSelectedHalaqa] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<{ id: string; name: string; grade: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [memorizationForm, setMemorizationForm] = useState({ surahId: "", ayahFrom: "", ayahTo: "" });
  const [togglingStudent, setTogglingStudent] = useState<string | null>(null);
  const { showToast } = useToast();

  function mapApiHalaqa(h: { id: string; name: string; level: string; teacher_id: string; teacher_name: string; supervisor_id?: string | null; supervisor_name?: string | null; max_students: number; current_students: number; schedule_day: string; schedule_time: string; room_number?: string | null; is_active: boolean; created_at: string; updated_at: string }): Halaqa {
    return {
      id: h.id,
      schoolId: h.id,
      name: h.name,
      level: h.level as HalaqaLevel,
      teacherId: h.teacher_id,
      teacherName: h.teacher_name,
      supervisorId: h.supervisor_id ?? null,
      supervisorName: h.supervisor_name ?? null,
      maxStudents: h.max_students,
      currentStudents: h.current_students,
      scheduleDay: h.schedule_day,
      scheduleTime: h.schedule_time,
      roomNumber: h.room_number ?? null,
      isActive: h.is_active,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    };
  }

  function mapApiStudent(s: { id: string; student_id: string; student_name: string; joined_at: string; is_active: boolean; current_surah_id?: string | null; current_surah_name?: string | null; current_ayah?: number | null; total_memorized_ayahs?: number | null; total_memorized_juz?: number | null; last_assessment_date?: string | null; last_assessment_score?: number | null; grade?: string }, halaqaId: string): HalaqaStudent {
    return {
      id: s.id,
      halaqaId,
      studentId: s.student_id,
      studentName: s.student_name,
      joinedAt: s.joined_at,
      isActive: s.is_active,
      currentSurahId: s.current_surah_id ?? null,
      currentSurahName: s.current_surah_name ?? null,
      currentAyah: s.current_ayah ?? null,
      totalMemorizedAyahs: s.total_memorized_ayahs ?? 0,
      totalMemorizedJuz: s.total_memorized_juz ?? 0,
      lastAssessmentDate: s.last_assessment_date ?? null,
      lastAssessmentScore: s.last_assessment_score ?? null,
    };
  }

  useEffect(() => {
    (async () => {
      const result = await apiFetchHalaqat();
      if (result.success && result.data) {
        const list = Array.isArray(result.data) ? result.data : result.data.results;
        const enriched = await Promise.all(
          list.map(async (h) => {
            const detail = await apiFetchHalaqaById(h.id);
            const base = mapApiHalaqa(h);
            return detail.success && detail.data
              ? { ...base, students: detail.data.students.map((s) => mapApiStudent(s, h.id)) }
              : { ...base, students: [] as HalaqaStudent[] };
          })
        );
        setHalaqat(enriched);
      }
      setLoading(false);
    })();
  }, []);

  const loadAvailableStudents = useCallback(async () => {
    const result = await apiFetchAvailableStudents();
    if (result.success && result.data) setAvailableStudents(result.data.results.map((s) => ({ id: s.id, name: s.student_name, grade: s.grade })));
  }, []);

  useEffect(() => {
    if (selectedHalaqa) loadAvailableStudents();
  }, [selectedHalaqa, loadAvailableStudents]);

  const handleToggleStudent = async (studentId: string, studentName: string, currentlyAssigned: boolean) => {
    if (!selectedHalaqa) return;
    setTogglingStudent(studentId);
    const action = currentlyAssigned ? "REMOVE" : "ASSIGN";
    const result = await apiToggleStudentMembership(selectedHalaqa, studentId, action);
    setTogglingStudent(null);

    if (result.success) {
      setHalaqat((prev) =>
        prev.map((h) =>
          h.id === selectedHalaqa
            ? { ...h, currentStudents: result.data!.current_student_count }
            : h
        )
      );
      showToast("success", result.message!);
    } else {
      showToast("error", result.message ?? "فشل العملية");
    }
  };

  const handleSetMemorizationTarget = async () => {
    if (!selectedHalaqa || !memorizationForm.surahId || !memorizationForm.ayahFrom || !memorizationForm.ayahTo) {
      showToast("warning", "يرجى إكمال جميع الحقول");
      return;
    }
    const result = await apiUpdateMemorizationTarget(selectedHalaqa, {
      surah_id: memorizationForm.surahId,
      ayah_from: Number(memorizationForm.ayahFrom),
      ayah_to: Number(memorizationForm.ayahTo),
    });
    if (result.success) {
      showToast("success", "تم تحديث هدف الحفظ");
      setMemorizationForm({ surahId: "", ayahFrom: "", ayahTo: "" });
    } else {
      showToast("error", result.message ?? "فشل التحديث");
    }
  };

  const selectedData = halaqat.find((h) => h.id === selectedHalaqa);

  if (loading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted dark:bg-dark-muted" />
        ))}
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {halaqat.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHalaqa(h.id)}
            className={`rounded-xl border-2 p-4 text-right transition-all ${
              selectedHalaqa === h.id
                ? "border-brand-gold bg-brand-gold/5 shadow-brand-gold"
                : "border-surface-border bg-white hover:border-brand-navy/20 dark:bg-surface-dark"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">{h.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${levelColors[h.level]}`}>
                  {levelNames[h.level]}
                </span>
              </div>
              <span className="text-lg">📖</span>
            </div>
            <div className="mt-3 space-y-1 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>المعلم</span>
                <span className="font-medium text-text-primary">{h.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span>الطلاب</span>
                <span className="font-medium text-text-primary">{h.currentStudents}/{h.maxStudents}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedData && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-xl border border-surface-border bg-white p-5 shadow-brand-sm dark:bg-surface-dark">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">الطلاب — {selectedData.name}</h3>
              <button
                onClick={loadAvailableStudents}
                className="rounded-lg border border-surface-border px-3 py-1 text-[10px] font-medium text-text-muted transition-colors hover:bg-surface-muted"
              >
                تحديث القائمة
              </button>
            </div>

            <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-surface-border">
              {availableStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-muted">لا يوجد طلاب متاحون</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted/50 dark:bg-dark-muted/50">
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-text-muted">الطالب</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-text-muted">الصف</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-text-muted">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {availableStudents.map((s) => {
                      const isAssigned = selectedData.students.some((st) => st.studentId === s.id);
                      return (
                        <tr key={s.id} className="transition-colors hover:bg-surface-muted/30 dark:hover:bg-dark-muted/30">
                          <td className="px-3 py-2 text-xs font-medium text-text-primary">{s.name}</td>
                          <td className="px-3 py-2 text-xs text-text-muted">{s.grade}</td>
                          <td className="px-3 py-2 text-center">
                            <label className="inline-flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                disabled={togglingStudent === s.id}
                                onChange={() => handleToggleStudent(s.id, s.name, isAssigned)}
                                className="h-4 w-4 accent-brand-gold"
                              />
                              <span className="text-[10px] text-text-muted">{isAssigned ? "مسجل" : "تسجيل"}</span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <h4 className="mb-2 text-xs font-semibold text-text-muted">تحديد هدف الحفظ اليومي</h4>
            <div className="flex flex-wrap gap-2">
              <select
                value={memorizationForm.surahId}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, surahId: e.target.value }))}
                className="flex-1 min-w-[120px] rounded-lg border border-surface-border px-3 py-1.5 text-xs text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
              >
                <option value="">السورة</option>
                {SURAHS.map((s) => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
              <input
                type="number"
                value={memorizationForm.ayahFrom}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, ayahFrom: e.target.value }))}
                placeholder="من آية"
                className="w-20 rounded-lg border border-surface-border px-2 py-1.5 text-xs text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
              />
              <input
                type="number"
                value={memorizationForm.ayahTo}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, ayahTo: e.target.value }))}
                placeholder="إلى آية"
                className="w-20 rounded-lg border border-surface-border px-2 py-1.5 text-xs text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
              />
              <button
                onClick={handleSetMemorizationTarget}
                className="rounded-lg bg-brand-navy px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-navy-600"
              >
                تعيين الهدف
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-5 shadow-brand-sm dark:bg-surface-dark">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">تقدم الطلاب</h3>
            <div className="space-y-3">
              {selectedData.students.slice(0, 8).map((s) => (
                <div key={s.studentId} className="rounded-lg border border-surface-border p-2.5 transition-colors hover:bg-surface-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-text-primary">{s.studentName}</p>
                    <span className="text-[10px] text-text-muted">{s.totalMemorizedJuz} أجزاء</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-muted dark:bg-dark-muted">
                      <div className="h-1.5 rounded-full bg-brand-gold" style={{ width: `${Math.min(100, (s.totalMemorizedAyahs / 500) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-brand-gold">{s.totalMemorizedAyahs} آية</span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">{s.currentSurahName} — الآية {s.currentAyah}</p>
                </div>
              ))}
              {selectedData.students.length === 0 && (
                <div className="py-6 text-center text-xs text-text-muted">لا يوجد طلاب مسجلون</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedData && !loading && (
        <div className="rounded-xl border border-dashed border-surface-border p-10 text-center text-sm text-text-muted">
          اختر حلقة من القائمة أعلاه لعرض التفاصيل
        </div>
      )}
    </div>
  );
}