import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";

export interface ApiHalaqa {
  id: string;
  name: string;
  level: string;
  teacher_id: string;
  teacher_name: string;
  supervisor_id?: string | null;
  supervisor_name?: string | null;
  max_students: number;
  current_students: number;
  schedule_day: string;
  schedule_time: string;
  room_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiHalaqaStudent {
  id: string;
  student_id: string;
  student_name: string;
  grade?: string;
  joined_at: string;
  is_active: boolean;
  current_surah_id?: string;
  current_surah_name?: string;
  current_ayah?: number;
  total_memorized_ayahs?: number;
  total_memorized_juz?: number;
  last_assessment_date?: string;
  last_assessment_score?: number;
}

export interface ApiMemorizationSession {
  id: string;
  student_id: string;
  halaqa_id: string;
  surah_id: string;
  ayah_from: number;
  ayah_to: number;
  score: number | null;
  notes?: string;
  created_at: string;
}

export interface ApiQuranProgress {
  id: string;
  student_id: string;
  total_memorized_ayahs: number;
  total_memorized_juz: number;
  total_memorized_surahs: number;
  last_surah_id: string;
  last_surah_name: string;
  last_ayah_number: number;
  start_date: string;
  completion_percentage: number;
  daily_average_ayahs: number;
  weekly_average_ayahs: number;
  sessions_count: number;
  last_session_date: string;
  streak_days: number;
  longest_streak: number;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function apiFetchHalaqat(params?: {
  level?: string;
  is_active?: boolean;
  teacher_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<ApiResponse<ApiHalaqa[] | ApiPaginatedResponse<ApiHalaqa>>> {
  return authenticatedApiClient.get<ApiHalaqa[] | ApiPaginatedResponse<ApiHalaqa>>("admin/halaqat", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiFetchHalaqaById(id: string): Promise<ApiResponse<ApiHalaqa & { students: ApiHalaqaStudent[] }>> {
  return authenticatedApiClient.get<ApiHalaqa & { students: ApiHalaqaStudent[] }>(`admin/halaqat/${id}`);
}

export function apiToggleStudentMembership(halaqaId: string, studentId: string, action: "ASSIGN" | "REMOVE"): Promise<ApiResponse<{ halaqa_id: string; student_id: string; action: string; current_student_count: number }>> {
  return authenticatedApiClient.post<{ halaqa_id: string; student_id: string; action: string; current_student_count: number }>(
    `admin/halaqat/${halaqaId}/students`,
    { student_id: studentId, action },
    { idempotent: true }
  );
}

export function apiRecordMemorizationSession(session: {
  student_id: string;
  halaqa_id: string;
  surah_id: string;
  ayah_from: number;
  ayah_to: number;
  score?: number | null;
  notes?: string;
}): Promise<ApiResponse<ApiMemorizationSession>> {
  return authenticatedApiClient.post<ApiMemorizationSession>("admin/memorization-sessions", session, { idempotent: true });
}

export function apiFetchStudentQuranProgress(studentId: string): Promise<ApiResponse<ApiQuranProgress>> {
  return authenticatedApiClient.get<ApiQuranProgress>(`admin/students/${studentId}/quran-progress`);
}

export function apiUpdateMemorizationTarget(halaqaId: string, targets: { surah_id: string; ayah_from: number; ayah_to: number }): Promise<ApiResponse<unknown>> {
  return authenticatedApiClient.patch<unknown>(`admin/halaqat/${halaqaId}/target`, targets, { idempotent: true });
}

export function apiFetchAvailableStudents(params?: {
  search?: string;
  grade?: string;
  page?: number;
  page_size?: number;
}): Promise<ApiResponse<ApiPaginatedResponse<{ id: string; student_name: string; grade: string }>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<{ id: string; student_name: string; grade: string }>>("admin/students", { params: params as Record<string, string | number | boolean | undefined> });
}