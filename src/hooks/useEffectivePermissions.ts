"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PermissionAction, PermissionResource, EffectivePermission, PermissionOverride } from "@/contracts/rbac";
import { useAuth, type SessionUser } from "@/contexts/AuthContext";

interface ResolvedPermission {
  resource: PermissionResource;
  action: PermissionAction;
  isGranted: boolean;
  source: "ROLE" | "OVERRIDE" | "DEFAULT";
  roleName: string | null;
}

interface PermissionMatrix {
  [resource: string]: {
    [action: string]: ResolvedPermission;
  };
}

interface UseEffectivePermissionsResult {
  permissions: PermissionMatrix;
  resolvedList: ResolvedPermission[];
  can: (resource: PermissionResource, action: PermissionAction) => boolean;
  canAny: (resource: PermissionResource, actions: PermissionAction[]) => boolean;
  canAll: (resource: PermissionResource, actions: PermissionAction[]) => boolean;
  isLoading: boolean;
  refresh: () => void;
}

const ROLE_PERMISSION_MAP: Record<string, Partial<Record<PermissionResource, PermissionAction[]>>> = {
  PRINCIPAL: {
    USERS: ["CREATE", "READ", "UPDATE", "DELETE", "ASSIGN", "REVOKE"],
    ROLES: ["CREATE", "READ", "UPDATE", "DELETE", "ASSIGN"],
    ATTENDANCE: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"],
    BEHAVIOR_POINTS: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"],
    CORRESPONDENCE: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE", "REJECT", "EXPORT"],
    HALAQAT: ["CREATE", "READ", "UPDATE", "DELETE"],
    QURAN_PROGRESS: ["CREATE", "READ", "UPDATE"],
    GRADES: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"],
    SCHEDULES: ["CREATE", "READ", "UPDATE", "DELETE"],
    REPORTS: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"],
    SETTINGS: ["CREATE", "READ", "UPDATE", "DELETE"],
    DISCIPLINE: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"],
    FEES: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"],
    EXAMS: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"],
  },
  DEPUTY_PRINCIPAL: {
    USERS: ["READ", "UPDATE"],
    ATTENDANCE: ["CREATE", "READ", "UPDATE", "EXPORT"],
    BEHAVIOR_POINTS: ["CREATE", "READ", "UPDATE", "EXPORT"],
    CORRESPONDENCE: ["CREATE", "READ", "UPDATE", "EXPORT"],
    HALAQAT: ["CREATE", "READ", "UPDATE"],
    QURAN_PROGRESS: ["READ", "UPDATE"],
    GRADES: ["CREATE", "READ", "UPDATE"],
    SCHEDULES: ["CREATE", "READ", "UPDATE"],
    REPORTS: ["CREATE", "READ", "EXPORT"],
    SETTINGS: ["READ"],
    DISCIPLINE: ["CREATE", "READ", "UPDATE"],
    EXAMS: ["READ", "UPDATE"],
  },
  ACADEMIC_SUPERVISOR: {
    USERS: ["READ"],
    ATTENDANCE: ["READ", "EXPORT"],
    BEHAVIOR_POINTS: ["READ"],
    CORRESPONDENCE: ["READ"],
    HALAQAT: ["CREATE", "READ", "UPDATE", "DELETE"],
    QURAN_PROGRESS: ["CREATE", "READ", "UPDATE"],
    GRADES: ["CREATE", "READ", "UPDATE", "EXPORT"],
    SCHEDULES: ["READ", "UPDATE"],
    REPORTS: ["CREATE", "READ", "EXPORT"],
    EXAMS: ["CREATE", "READ", "UPDATE", "APPROVE"],
  },
  TEACHER: {
    ATTENDANCE: ["CREATE", "READ", "UPDATE"],
    BEHAVIOR_POINTS: ["CREATE", "READ"],
    HALAQAT: ["READ"],
    QURAN_PROGRESS: ["CREATE", "READ", "UPDATE"],
    GRADES: ["CREATE", "READ", "UPDATE"],
    SCHEDULES: ["READ"],
    REPORTS: ["READ"],
    DISCIPLINE: ["CREATE", "READ"],
    EXAMS: ["READ"],
  },
  ATTENDANCE_OFFICER: {
    ATTENDANCE: ["CREATE", "READ", "UPDATE", "EXPORT"],
    BEHAVIOR_POINTS: ["READ"],
    REPORTS: ["READ", "EXPORT"],
  },
};

function getDefaultActions(): Partial<Record<PermissionResource, PermissionAction[]>> {
  const allResources: PermissionResource[] = ["USERS", "ROLES", "ATTENDANCE", "BEHAVIOR_POINTS", "CORRESPONDENCE", "HALAQAT", "QURAN_PROGRESS", "GRADES", "SCHEDULES", "REPORTS", "SETTINGS", "DISCIPLINE", "FEES", "EXAMS"];
  const result: Partial<Record<PermissionResource, PermissionAction[]>> = {};
  allResources.forEach((r) => { result[r] = ["READ"]; });
  return result;
}

function resolvePermissionsForUser(user: SessionUser): ResolvedPermission[] {
  const permissionMap = new Map<string, ResolvedPermission>();
  const allResources: PermissionResource[] = ["USERS", "ROLES", "ATTENDANCE", "BEHAVIOR_POINTS", "CORRESPONDENCE", "HALAQAT", "QURAN_PROGRESS", "GRADES", "SCHEDULES", "REPORTS", "SETTINGS", "DISCIPLINE", "FEES", "EXAMS"];

  const defaultActions = getDefaultActions();

  allResources.forEach((resource) => {
    (defaultActions[resource] ?? ["READ"]).forEach((action) => {
      const key = `${resource}-${action}`;
      if (!permissionMap.has(key)) {
        permissionMap.set(key, { resource, action, isGranted: true, source: "DEFAULT", roleName: null });
      }
    });
  });

  const resolvedRoleTypes = new Set(user.roles.map((r) => r.roleType));

  resolvedRoleTypes.forEach((roleType) => {
    const rolePerms = ROLE_PERMISSION_MAP[roleType];
    if (rolePerms) {
      Object.entries(rolePerms).forEach(([resource, actions]) => {
        actions.forEach((action) => {
          const key = `${resource}-${action}`;
          permissionMap.set(key, { resource: resource as PermissionResource, action, isGranted: true, source: "ROLE", roleName: roleType });
        });
      });
    }
  });

  return Array.from(permissionMap.values());
}

export function useEffectivePermissions(): UseEffectivePermissionsResult {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<PermissionOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const basePermissions = useMemo(() => {
    if (!user) return [];
    return resolvePermissionsForUser(user);
  }, [user]);

  const resolvedList = useMemo(() => {
    if (overrides.length === 0) return basePermissions;

    return basePermissions.map((perm) => {
      const matchingOverride = overrides.find(
        (o) => o.resource === perm.resource && o.action === perm.action
      );
      if (matchingOverride) {
        return {
          ...perm,
          isGranted: matchingOverride.isGranted,
          source: "OVERRIDE" as const,
        };
      }
      return perm;
    });
  }, [basePermissions, overrides]);

  const permissions = useMemo(() => {
    const matrix: PermissionMatrix = {};
    resolvedList.forEach((p) => {
      if (!matrix[p.resource]) matrix[p.resource] = {};
      matrix[p.resource]![p.action] = p;
    });
    return matrix;
  }, [resolvedList]);

  const can = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      return permissions[resource]?.[action]?.isGranted ?? false;
    },
    [permissions]
  );

  const canAny = useCallback(
    (resource: PermissionResource, actions: PermissionAction[]): boolean => {
      return actions.some((action) => can(resource, action));
    },
    [can]
  );

  const canAll = useCallback(
    (resource: PermissionResource, actions: PermissionAction[]): boolean => {
      return actions.every((action) => can(resource, action));
    },
    [can]
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  return { permissions, resolvedList, can, canAny, canAll, isLoading, refresh };
}