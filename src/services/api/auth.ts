import { authenticatedApiClient } from "@/services/apiInterceptor";
import type { ApiResponse } from "@/types/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface RefreshRequest {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface MeResponse {
  id: string;
  email: string;
  full_name: string;
  active_school?: {
    id: string;
    name: string;
  };
  roles?: { roleId: string; roleName: string; roleType: string }[];
  permissions?: string[];
}

export interface SchoolInfo {
  id: string;
  name: string;
  is_primary?: boolean;
  status?: string;
}

export interface SwitchSchoolRequest {
  school_id: string;
}

export interface SwitchSchoolResponse {
  active_school_id: string;
}

export function apiLogin(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return authenticatedApiClient.post<LoginResponse>("auth/login", payload, { idempotent: false });
}

export function apiRefresh(payload: RefreshRequest): Promise<ApiResponse<RefreshResponse>> {
  return authenticatedApiClient.post<RefreshResponse>("auth/refresh", payload, { idempotent: false });
}

export function apiLogout(payload: RefreshRequest): Promise<ApiResponse<{ detail: string }>> {
  return authenticatedApiClient.post<{ detail: string }>("auth/logout", payload, { idempotent: false });
}

export function apiMe(): Promise<ApiResponse<MeResponse>> {
  return authenticatedApiClient.get<MeResponse>("me");
}

export function apiMySchools(): Promise<ApiResponse<SchoolInfo[]>> {
  return authenticatedApiClient.get<SchoolInfo[]>("me/schools");
}

export function apiSwitchSchool(payload: SwitchSchoolRequest): Promise<ApiResponse<SwitchSchoolResponse>> {
  return authenticatedApiClient.post<SwitchSchoolResponse>("me/switch-school", payload, { idempotent: false });
}