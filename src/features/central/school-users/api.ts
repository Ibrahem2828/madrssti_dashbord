"use client";

import {centralEndpoints} from "@/config/endpoints.central";
import type {ApiResult} from "@/lib/api/contracts";
import {browserApi} from "@/lib/api/browser-client";

import type {
  CentralSchoolPermission,
  CentralSchoolUser,
  CentralSchoolUserAuditEntry,
  CentralSchoolUserPage,
  CentralSchoolUserPermissions,
  CentralSchoolUserRole,
  CreateCentralSchoolUserPayload,
  UpdateCentralSchoolUserPayload,
} from "./types";

type RecordValue = Record<string, unknown>;
type QueryValue = string | number | boolean | undefined;

function record(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown): boolean {
  return value === true;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function roleFromDto(value: unknown): CentralSchoolUserRole {
  const dto = record(value);
  return {
    id: text(dto.id),
    name: text(dto.name),
    description: text(dto.description),
    permissionsCount: typeof dto.permissions_count === "number" ? dto.permissions_count : 0,
  };
}

function permissionFromDto(value: unknown): CentralSchoolPermission {
  const dto = record(value);
  return {code: text(dto.code), description: text(dto.description)};
}

function userFromDto(value: unknown): CentralSchoolUser {
  const dto = record(value);
  const membershipDto = record(dto.membership);
  return {
    id: text(dto.id),
    email: text(dto.email),
    fullName: text(dto.full_name),
    phone: text(dto.phone),
    userType: text(dto.user_type),
    isActive: bool(dto.is_active),
    lastLogin: nullableText(dto.last_login),
    createdAt: nullableText(dto.created_at),
    updatedAt: nullableText(dto.updated_at),
    membership: Object.keys(membershipDto).length
      ? {
          id: text(membershipDto.id),
          isActive: bool(membershipDto.is_active),
          status: text(membershipDto.status),
          isPrimary: bool(membershipDto.is_primary),
        }
      : null,
    roles: list(dto.roles).map(roleFromDto),
    directPermissions: list(dto.direct_permissions).map((item) => {
      const permission = permissionFromDto(item);
      const permissionDto = record(item);
      return {...permission, isGranted: bool(permissionDto.is_granted), createdAt: nullableText(permissionDto.created_at)};
    }),
  };
}

function userListItemFromDto(value: unknown) {
  const user = userFromDto(value);
  return {...user, hasDirectPermissions: bool(record(value).has_direct_permissions)};
}

function mapResult<T, R>(result: ApiResult<T>, mapper: (data: T) => R): ApiResult<R> {
  return result.success ? {success: true, data: mapper(result.data)} : result;
}

function payloadForCreate(payload: CreateCentralSchoolUserPayload): RecordValue {
  return {
    email: payload.email,
    full_name: payload.fullName,
    phone: payload.phone ?? "",
    password: payload.password || undefined,
    is_active: payload.isActive,
    role_ids: payload.roleIds,
    permission_codes: payload.permissionCodes,
  };
}

export async function fetchCentralSchoolUsers(schoolId: string, query: Record<string, QueryValue>): Promise<ApiResult<CentralSchoolUserPage>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.list(schoolId, query));
  return mapResult(result, (data) => {
    const dto = record(data);
    return {
      count: typeof dto.count === "number" ? dto.count : 0,
      next: nullableText(dto.next),
      previous: nullableText(dto.previous),
      results: list(dto.results).map(userListItemFromDto),
    };
  });
}

export async function fetchCentralSchoolUser(schoolId: string, userId: string): Promise<ApiResult<CentralSchoolUser>> {
  return mapResult(await browserApi<unknown>("central", centralEndpoints.schools.users.detail(schoolId, userId)), userFromDto);
}

export async function fetchCentralSchoolRoles(schoolId: string): Promise<ApiResult<CentralSchoolUserRole[]>> {
  return mapResult(await browserApi<unknown>("central", centralEndpoints.schools.users.roles(schoolId)), (data) => list(data).map(roleFromDto));
}

export async function fetchCentralSchoolPermissions(schoolId: string): Promise<ApiResult<CentralSchoolPermission[]>> {
  return mapResult(await browserApi<unknown>("central", centralEndpoints.schools.users.permissions(schoolId)), (data) => list(data).map(permissionFromDto));
}

export async function createCentralSchoolUser(schoolId: string, payload: CreateCentralSchoolUserPayload): Promise<ApiResult<{user: CentralSchoolUser; tempPassword: string | null}>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.create(schoolId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payloadForCreate(payload)),
  });
  return mapResult(result, (data) => {
    const dto = record(data);
    return {user: userFromDto(dto.user), tempPassword: nullableText(dto.temp_password)};
  });
}

export async function updateCentralSchoolUser(schoolId: string, userId: string, payload: UpdateCentralSchoolUserPayload): Promise<ApiResult<CentralSchoolUser>> {
  return mapResult(
    await browserApi<unknown>("central", centralEndpoints.schools.users.detail(schoolId, userId), {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: payload.email, full_name: payload.fullName, phone: payload.phone}),
    }),
    userFromDto,
  );
}

export async function setCentralSchoolUserStatus(schoolId: string, userId: string, enabled: boolean, reason = ""): Promise<ApiResult<CentralSchoolUser>> {
  return mapResult(
    await browserApi<unknown>("central", enabled ? centralEndpoints.schools.users.enable(schoolId, userId) : centralEndpoints.schools.users.disable(schoolId, userId), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(enabled ? {} : {reason}),
    }),
    userFromDto,
  );
}

export async function resetCentralSchoolUserPassword(schoolId: string, userId: string, reason: string, newTempPassword?: string): Promise<ApiResult<{tempPassword: string | null}>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.resetPassword(schoolId, userId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({reason, new_temp_password: newTempPassword || undefined}),
  });
  return mapResult(result, (data) => ({tempPassword: nullableText(record(data).temp_password)}));
}

export async function replaceCentralSchoolUserRoles(schoolId: string, userId: string, roleIds: string[], reason = ""): Promise<ApiResult<CentralSchoolUserRole[]>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.userRoles(schoolId, userId), {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({role_ids: roleIds, reason}),
  });
  return mapResult(result, (data) => list(record(data).roles).map(roleFromDto));
}

export async function fetchCentralSchoolUserPermissions(schoolId: string, userId: string): Promise<ApiResult<CentralSchoolUserPermissions>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.effectivePermissions(schoolId, userId));
  return mapResult(result, (data) => {
    const dto = record(data);
    return {
      effectivePermissions: list(dto.effective_permissions).map((item) => {
        const permission = permissionFromDto(item);
        const itemDto = record(item);
        const source = text(itemDto.source, "ROLE");
        return {
          ...permission,
          source: source === "DIRECT" || source === "OVERRIDE" || source === "SYSTEM" ? source : "ROLE",
          roleNames: list(itemDto.role_names).filter((entry): entry is string => typeof entry === "string"),
        };
      }),
      directPermissions: list(dto.direct_permissions).map((item) => ({...permissionFromDto(item), isGranted: bool(record(item).is_granted)})),
    };
  });
}

export async function changeCentralSchoolUserPermissions(schoolId: string, userId: string, granted: boolean, permissionCodes: string[], reason: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("central", granted ? centralEndpoints.schools.users.grantPermissions(schoolId, userId) : centralEndpoints.schools.users.revokePermissions(schoolId, userId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({permission_codes: permissionCodes, reason}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchCentralSchoolUserAudit(schoolId: string, userId: string): Promise<ApiResult<CentralSchoolUserAuditEntry[]>> {
  const result = await browserApi<unknown>("central", centralEndpoints.schools.users.audit(schoolId, userId));
  return mapResult(result, (data) => list(record(data).results).map((item) => {
    const dto = record(item);
    const actor = record(dto.actor);
    return {
      id: text(dto.id),
      action: text(dto.action),
      actor: Object.keys(actor).length ? {id: text(actor.id), fullName: text(actor.full_name), email: text(actor.email)} : null,
      createdAt: nullableText(dto.created_at),
      after: typeof dto.after === "object" && dto.after !== null ? record(dto.after) : null,
    };
  }));
}
