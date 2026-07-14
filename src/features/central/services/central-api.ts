"use client";

import type {ApiResult} from "@/lib/api/contracts";
import {browserApi} from "@/lib/api/browser-client";
import {centralEndpoints} from "@/config/endpoints.central";

import {
  adminStateFromDto,
  auditEntryFromDto,
  dashboardOverviewFromDto,
  mapPaginated,
  policyListFromDto,
  schoolFromDto,
  schoolHealthListFromDto,
  systemHealthFromDto,
  ticketFromDto,
} from "../mappers/central";
import type {
  CentralAdminInput,
  CentralAdminState,
  CentralAuditEntry,
  CentralDashboardOverview,
  CentralPasswordResetInput,
  CentralPolicy,
  CentralSchool,
  CentralSchoolHealth,
  CentralSchoolInput,
  CentralSystemHealth,
  CentralTicket,
  PaginatedResult,
} from "../types/contracts";

type QueryValue = string | number | boolean | undefined | null;

export async function fetchCentralDashboard(): Promise<ApiResult<CentralDashboardOverview>> {
  const result = await browserApi<unknown>("central", centralEndpoints.dashboard.overview);
  return result.success ? {success: true, data: dashboardOverviewFromDto(result.data)} : result;
}

export async function fetchCentralSystemHealth(): Promise<ApiResult<CentralSystemHealth>> {
  const result = await browserApi<unknown>("central", centralEndpoints.dashboard.systemHealth);
  return result.success ? {success: true, data: systemHealthFromDto(result.data)} : result;
}

export async function fetchCentralSchoolHealth(): Promise<ApiResult<CentralSchoolHealth[]>> {
  const result = await browserApi<unknown>("central", centralEndpoints.dashboard.schoolsHealth);
  return result.success ? {success: true, data: schoolHealthListFromDto(result.data)} : result;
}

export async function fetchCentralSchools(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<CentralSchool>>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.list(query));
  return result.success ? {success: true, data: mapPaginated(result.data, schoolFromDto)} : result;
}

export async function createCentralSchool(payload: CentralSchoolInput): Promise<ApiResult<CentralSchool>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.create, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: schoolFromDto(result.data)} : result;
}

export async function fetchCentralSchool(id: string): Promise<ApiResult<CentralSchool>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.detail(id));
  return result.success ? {success: true, data: schoolFromDto(result.data)} : result;
}

export async function updateCentralSchool(id: string, payload: Partial<CentralSchoolInput>): Promise<ApiResult<CentralSchool>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.detail(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: schoolFromDto(result.data)} : result;
}

export async function activateCentralSchool(id: string): Promise<ApiResult<CentralSchool>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.activate(id), {method: "POST"});
  return result.success ? {success: true, data: schoolFromDto(result.data)} : result;
}

export async function deactivateCentralSchool(id: string): Promise<ApiResult<CentralSchool>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.deactivate(id), {method: "POST"});
  return result.success ? {success: true, data: schoolFromDto(result.data)} : result;
}

export async function fetchCentralAdminState(id: string): Promise<ApiResult<CentralAdminState>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.admin(id));
  return result.success ? {success: true, data: adminStateFromDto(result.data)} : result;
}

export async function createCentralAdmin(id: string, payload: CentralAdminInput): Promise<ApiResult<{state: CentralAdminState; tempPassword: string | null}>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.createAdmin(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone ?? "",
      temp_password: payload.tempPassword ?? "",
    }),
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {
      state: adminStateFromDto({has_admin: true, admin: (result.data as Record<string, unknown>).admin}),
      tempPassword:
        typeof (result.data as Record<string, unknown>).temp_password === "string"
          ? ((result.data as Record<string, unknown>).temp_password as string)
          : null,
    },
  };
}

export async function resetCentralAdminPassword(
  id: string,
  payload: CentralPasswordResetInput,
): Promise<ApiResult<{tempPassword: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("central", centralEndpoints.schools.resetAdminPassword(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({reason: payload.reason, new_temp_password: payload.newTempPassword ?? ""}),
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {tempPassword: typeof result.data.temp_password === "string" ? result.data.temp_password : null},
  };
}

export async function fetchCentralTickets(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<CentralTicket>>> {
  const result = await browserApi<unknown>("central", centralEndpoints.tickets.list(query));
  return result.success ? {success: true, data: mapPaginated(result.data, ticketFromDto)} : result;
}

export async function fetchCentralTicket(id: string): Promise<ApiResult<CentralTicket>> {
  const result = await browserApi<unknown>("central", centralEndpoints.tickets.detail(id));
  return result.success ? {success: true, data: ticketFromDto(result.data)} : result;
}

export async function assignCentralTicket(id: string, assignedTo: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("central", centralEndpoints.tickets.assign(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({assigned_to: assignedTo || undefined}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function closeCentralTicket(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("central", centralEndpoints.tickets.close(id), {method: "PATCH"});
  return result.success ? {success: true, data: null} : result;
}

export async function fetchCentralAudit(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<CentralAuditEntry>>> {
  const result = await browserApi<unknown>("central", centralEndpoints.audit(query));
  return result.success ? {success: true, data: mapPaginated(result.data, auditEntryFromDto)} : result;
}

export async function fetchCentralPolicies(): Promise<ApiResult<CentralPolicy[]>> {
  const result = await browserApi<unknown>("central", centralEndpoints.policies);
  return result.success ? {success: true, data: policyListFromDto(result.data)} : result;
}

export async function updateCentralPolicy(key: string, value: unknown): Promise<ApiResult<CentralPolicy[]>> {
  const result = await browserApi<unknown>("central", centralEndpoints.policies, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({[key]: value}),
  });
  return result.success ? {success: true, data: policyListFromDto(result.data)} : result;
}
