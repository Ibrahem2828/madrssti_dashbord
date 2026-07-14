import type { UUID, ISO8601DateTime } from "@/types/api";

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "EXPORT"
  | "IMPORT"
  | "ASSIGN"
  | "REVOKE";

export type PermissionResource =
  | "USERS"
  | "ROLES"
  | "ATTENDANCE"
  | "BEHAVIOR_POINTS"
  | "CORRESPONDENCE"
  | "HALAQAT"
  | "QURAN_PROGRESS"
  | "GRADES"
  | "SCHEDULES"
  | "REPORTS"
  | "SETTINGS"
  | "DISCIPLINE"
  | "FEES"
  | "EXAMS";

export interface Permission {
  readonly id: UUID;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly description: string;
  readonly isSystem: boolean;
  readonly createdAt: ISO8601DateTime;
}

export interface RolePermission {
  readonly id: UUID;
  readonly roleId: UUID;
  readonly permissionId: UUID;
  readonly permission: Permission;
  readonly isGranted: boolean;
  readonly createdAt: ISO8601DateTime;
}

export interface Role {
  readonly id: UUID;
  readonly name: string;
  readonly nameAr: string;
  readonly description: string | null;
  readonly roleType: string;
  readonly isSystem: boolean;
  readonly schoolId: UUID | null;
  readonly permissions: readonly RolePermission[];
  readonly userCount: number;
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface EffectivePermission {
  readonly permissionId: UUID;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly isGranted: boolean;
  readonly source: "ROLE" | "OVERRIDE";
  readonly roleName: string | null;
}

export interface PermissionOverride {
  readonly id: UUID;
  readonly userId: UUID;
  readonly permissionId: UUID;
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly isGranted: boolean;
  readonly reason: string | null;
  readonly grantedBy: UUID;
  readonly expiresAt: ISO8601DateTime | null;
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface UserEffectivePermissions {
  readonly userId: UUID;
  readonly roles: readonly { readonly roleId: UUID; readonly roleName: string; readonly roleNameAr: string }[];
  readonly effectivePermissions: readonly EffectivePermission[];
  readonly overrides: readonly PermissionOverride[];
}