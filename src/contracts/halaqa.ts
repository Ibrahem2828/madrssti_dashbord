import type { UUID, ISO8601DateTime, ISO8601Date } from "@/types/api";

export type HalaqaLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTERY";
export type MemorizationStatus = "NEW" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "MASTERED";
export type TasmeeType = "INDIVIDUAL" | "GROUP" | "WEEKLY" | "MONTHLY";

export interface Halaqa {
  readonly id: UUID;
  readonly schoolId: UUID;
  readonly name: string;
  readonly level: HalaqaLevel;
  readonly teacherId: UUID;
  readonly teacherName: string;
  readonly supervisorId: UUID | null;
  readonly supervisorName: string | null;
  readonly maxStudents: number;
  readonly currentStudents: number;
  readonly scheduleDay: string;
  readonly scheduleTime: string;
  readonly roomNumber: string | null;
  readonly isActive: boolean;
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface HalaqaStudent {
  readonly id: UUID;
  readonly halaqaId: UUID;
  readonly studentId: UUID;
  readonly studentName: string;
  readonly joinedAt: ISO8601Date;
  readonly isActive: boolean;
  readonly currentSurahId: UUID | null;
  readonly currentSurahName: string | null;
  readonly currentAyah: number | null;
  readonly totalMemorizedAyahs: number;
  readonly totalMemorizedJuz: number;
  readonly lastAssessmentDate: ISO8601Date | null;
  readonly lastAssessmentScore: number | null;
}

export interface QuranSurah {
  readonly id: UUID;
  readonly surahNumber: number;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly totalAyahs: number;
  readonly juzNumber: number;
  readonly revelationType: "MAKKI" | "MADANI";
}

export interface MemorizationSession {
  readonly id: UUID;
  readonly halaqaStudentId: UUID;
  readonly studentId: UUID;
  readonly studentName: string;
  readonly surahId: UUID;
  readonly surahName: string;
  readonly surahNumber: number;
  readonly ayahFrom: number;
  readonly ayahTo: number;
  readonly type: TasmeeType;
  readonly status: MemorizationStatus;
  readonly score: number | null;
  readonly mistakes: number | null;
  readonly teacherNotes: string | null;
  readonly date: ISO8601Date;
  readonly createdAt: ISO8601DateTime;
}

export interface QuranProgress {
  readonly id: UUID;
  readonly studentId: UUID;
  readonly totalMemorizedAyahs: number;
  readonly totalMemorizedJuz: number;
  readonly totalMemorizedSurahs: number;
  readonly lastSurahId: UUID | null;
  readonly lastSurahName: string | null;
  readonly lastAyahNumber: number | null;
  readonly startDate: ISO8601Date;
  readonly completionPercentage: number;
  readonly dailyAverageAyahs: number;
  readonly weeklyAverageAyahs: number;
  readonly sessionsCount: number;
  readonly lastSessionDate: ISO8601Date | null;
  readonly streakDays: number;
  readonly longestStreak: number;
}

export interface CreateHalaqaPayload {
  schoolId: UUID;
  name: string;
  level: HalaqaLevel;
  teacherId: UUID;
  supervisorId?: UUID;
  maxStudents: number;
  day: string;
  time: string;
  roomNumber?: string;
}

export interface RecordMemorizationPayload {
  studentId: UUID;
  halaqaId: UUID;
  surahId: UUID;
  ayahFrom: number;
  ayahTo: number;
  type: TasmeeType;
  score?: number;
  notes?: string;
  date: ISO8601Date;
}