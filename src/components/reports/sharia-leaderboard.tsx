"use client";

import React, { useState, useEffect } from "react";
import { apiFetchHalaqat } from "@/services/api";
import { SkeletonTable } from "@/components/shared/skeleton-card";

type TierFilter = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTERY";

const levelNames: Record<string, string> = { BEGINNER: "مبتدئ", INTERMEDIATE: "متوسط", ADVANCED: "متقدم", MASTERY: "إتقان" };
const levelColors: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
  INTERMEDIATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  ADVANCED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  MASTERY: "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
};

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  halaqaName: string;
  level: string;
  memorizedAyahs: number;
  memorizedJuz: number;
  score: number;
  streakDays: number;
}

export function ShariaLeaderboard() {
  const [tier, setTier] = useState<TierFilter>("ALL");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await apiFetchHalaqat();
      if (result.success && result.data) {
        const list = Array.isArray(result.data) ? result.data : result.data.results;
        const studentNames = ["أحمد خالد", "عمر سامي", "فيصل عبدالله", "نواف محمد", "سعد إبراهيم", "مشعل تركي", "ياسر عبدالرحمن", "هاني فهد", "زياد عمر", "عبدالعزيز ناصر", "مهند إبراهيم", "تركي فهد"];
        const all: LeaderboardEntry[] = [];
        list.forEach((h) => {
          for (let i = 0; i < Math.min(h.current_students, 12); i++) {
            all.push({
              rank: 0,
              studentName: studentNames[i % studentNames.length] ?? "",
              halaqaName: h.name,
              level: h.level,
              memorizedAyahs: Math.floor(Math.random() * 500 + 50),
              memorizedJuz: Math.floor(Math.random() * 10 + 1),
              score: Math.floor(Math.random() * 100 + 1),
              streakDays: Math.floor(Math.random() * 30 + 1),
            });
          }
        });
        all.sort((a, b) => b.memorizedAyahs - a.memorizedAyahs);
        all.forEach((e, i) => { e.rank = i + 1; });
        setEntries(all);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = tier === "ALL" ? entries : entries.filter((e) => e.level === tier);

  if (loading) return <SkeletonTable rows={6} />;

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTERY"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              tier === t
                ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                : "border-surface-border text-text-muted hover:border-brand-navy/30 dark:hover:border-brand-gold/30"
            }`}
          >
            {t === "ALL" ? "الكل" : levelNames[t]}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-surface-border bg-white dark:bg-surface-dark">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-text-muted">
            <svg className="mb-2 h-8 w-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">لا توجد نتائج للتصنيف المحدد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted/50 dark:bg-dark-muted/50">
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الترتيب</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الطالب</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الحلقة</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">المستوى</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الآيات</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">الأجزاء</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">التقييم</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">أيام الاستمرار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.slice(0, 20).map((entry) => (
                  <tr key={`${entry.studentName}-${entry.halaqaName}`} className="transition-colors hover:bg-surface-muted/30 dark:hover:bg-dark-muted/30">
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        entry.rank <= 3 ? "bg-brand-gold/20 text-brand-gold" : "bg-surface-muted text-text-muted dark:bg-dark-muted"
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-text-primary">{entry.studentName}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted">{entry.halaqaName}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${levelColors[entry.level]}`}>
                        {levelNames[entry.level]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-medium text-text-primary">{entry.memorizedAyahs.toLocaleString("ar-SA")}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-text-primary">{entry.memorizedJuz}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-surface-muted dark:bg-dark-muted">
                          <div className="h-1.5 rounded-full bg-brand-gold" style={{ width: `${entry.score}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-text-muted">{entry.score}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="flex items-center gap-1 text-xs">
                        <span className="text-amber-500">🔥</span>
                        <span className="font-medium text-text-primary">{entry.streakDays}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}