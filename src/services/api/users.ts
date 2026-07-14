import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";
import type { UserEffectivePermissions } from "@/contracts/rbac";

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  roles: string[];
  profile_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiUserDetail extends ApiUser {
  teacher_code?: string;
  national_id?: string;
  date_of_birth?: string;
  address?: string;
}

export interface ApiRole {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface ApiPermission {
  code: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface ApiUsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUser[];
}

export interface ApiCreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  profile_type: string;
  teacher_code?: string;
  role_ids: string[];
}

export function apiFetchUsers(params?: {
  role?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<ApiResponse<ApiUsersListResponse>> {
  return authenticatedApiClient.get<ApiUsersListResponse>("admin/users", { params: params as Record<string, string | number | boolean | undefined> });
}

export function apiFetchUserById(id: string): Promise<ApiResponse<ApiUserDetail>> {
  return authenticatedApiClient.get<ApiUserDetail>(`admin/users/${id}`);
}

export function apiCreateUser(payload: ApiCreateUserPayload): Promise<ApiResponse<{ id: string }>> {
  return authenticatedApiClient.post<{ id: string }>("admin/users", payload, { idempotent: true });
}

export function apiUpdateUser(id: string, payload: Partial<ApiCreateUserPayload>): Promise<ApiResponse<{ id: string }>> {
  return authenticatedApiClient.patch<{ id: string }>(`admin/users/${id}`, payload, { idempotent: true });
}

export function apiResetUserPassword(id: string, newPassword: string, reason: string): Promise<ApiResponse<{ detail: string }>> {
  return authenticatedApiClient.post<{ detail: string }>(`admin/users/${id}/reset-password`, { new_password: newPassword, reason }, { idempotent: true });
}

export function apiFetchRoles(): Promise<ApiResponse<ApiRole[]>> {
  return authenticatedApiClient.get<ApiRole[]>("admin/roles");
}

export function apiFetchPermissions(): Promise<ApiResponse<ApiPermission[]>> {
  return authenticatedApiClient.get<ApiPermission[]>("admin/permissions");
}

export function apiFetchUserEffectivePermissions(userId: string): Promise<ApiResponse<UserEffectivePermissions>> {
  return authenticatedApiClient.get<UserEffectivePermissions>(`admin/users/${userId}/effective-permissions`);
}

export function apiGrantPermission(userId: string, permissionId: string): Promise<ApiResponse<unknown>> {
  return authenticatedApiClient.post<unknown>(`admin/users/${userId}/permissions/grant`, { permission_id: permissionId }, { idempotent: true });
}

export function apiRevokePermission(userId: string, permissionId: string): Promise<ApiResponse<unknown>> {
  return authenticatedApiClient.post<unknown>(`admin/users/${userId}/permissions/revoke`, { permission_id: permissionId }, { idempotent: true });
}