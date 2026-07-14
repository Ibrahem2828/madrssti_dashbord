import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";

export interface ApiAttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  grade?: string;
  classroom?: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  check_in_time: string | null;
  date: string;
  points_adjustment: number;
  scanned_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiExcuse {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  attachment_url?: string;
  created_at: string;
}

export function apiFetchAttendanceRecords(params?: {
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  grade?: string;
  classroom?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiAttendanceRecord>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiAttendanceRecord>>("admin/attendance/records", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiManualAttendanceRecord(payload: {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  date: string;
  check_in_time?: string;
  reason?: string;
}): Promise<ApiResponse<ApiAttendanceRecord>> {
  return authenticatedApiClient.post<ApiAttendanceRecord>("admin/attendance/records/manual", payload, { idempotent: true });
}

export function apiUpdateAttendanceRecord(id: string, payload: { status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; check_in_time?: string; reason?: string }): Promise<ApiResponse<ApiAttendanceRecord>> {
  return authenticatedApiClient.patch<ApiAttendanceRecord>(`admin/attendance/records/${id}`, payload, { idempotent: true });
}

export function apiFetchExcuses(params?: {
  status?: string;
  student_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiExcuse>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiExcuse>>("admin/excuses", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiApproveExcuse(excuseId: string): Promise<ApiResponse<{ detail: string }>> {
  return authenticatedApiClient.post<{ detail: string }>(`admin/excuses/${excuseId}/approve`, {}, { idempotent: true });
}

export function apiRejectExcuse(excuseId: string): Promise<ApiResponse<{ detail: string }>> {
  return authenticatedApiClient.post<{ detail: string }>(`admin/excuses/${excuseId}/reject`, {}, { idempotent: true });
}

export function apiFetchQrUsers(params?: {
  search?: string;
  grade?: string;
  page?: number;
  page_size?: number;
}): Promise<ApiResponse<ApiPaginatedResponse<{ id: string; student_name: string; grade: string; qr_code: string }>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<{ id: string; student_name: string; grade: string; qr_code: string }>>("admin/qr/users", { params: params as Record<string, string | number | boolean | undefined> });
}