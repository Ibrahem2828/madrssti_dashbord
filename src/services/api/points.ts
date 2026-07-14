import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";

export interface ApiBehaviorEntry {
  id: string;
  student_id: string;
  student_name: string;
  grade?: string;
  type: "POSITIVE" | "NEGATIVE";
  points: number;
  reason: string;
  recorded_by: string;
  date: string;
  created_at: string;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function apiFetchBehaviorLog(params?: {
  type?: "POSITIVE" | "NEGATIVE";
  student_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiPaginatedResponse<ApiBehaviorEntry>>> {
  return authenticatedApiClient.get<ApiPaginatedResponse<ApiBehaviorEntry>>("admin/behavior-points", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiRecordBehaviorPoint(payload: {
  student_id?: string;
  student_name: string;
  grade?: string;
  type: "POSITIVE" | "NEGATIVE";
  points: number;
  reason: string;
}): Promise<ApiResponse<ApiBehaviorEntry>> {
  return authenticatedApiClient.post<ApiBehaviorEntry>("admin/behavior-points", payload, { idempotent: true });
}

export function apiFetchPointsSummary(params?: {
  student_id?: string;
  date_from?: string;
  date_to?: string;
}): Promise<ApiResponse<{
  total_positive: number;
  total_negative: number;
  net_points: number;
  positive_count: number;
  negative_count: number;
}>> {
  return authenticatedApiClient.get<{
    total_positive: number;
    total_negative: number;
    net_points: number;
    positive_count: number;
    negative_count: number;
  }>("admin/behavior-points/summary", { params: params as Record<string, string | number | boolean | undefined> });
}