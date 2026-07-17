export type CentralSchoolUserRole = {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
};

export type CentralSchoolPermission = {
  code: string;
  description: string;
};

export type CentralSchoolUserMembership = {
  id: string;
  isActive: boolean;
  status: string;
  isPrimary: boolean;
};

export type CentralSchoolUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  membership: CentralSchoolUserMembership | null;
  roles: CentralSchoolUserRole[];
  directPermissions: Array<CentralSchoolPermission & {isGranted: boolean; createdAt: string | null}>;
};

export type CentralSchoolUserListItem = Pick<
  CentralSchoolUser,
  "id" | "email" | "fullName" | "phone" | "userType" | "isActive" | "lastLogin" | "createdAt" | "roles"
> & {hasDirectPermissions: boolean};

export type CentralSchoolUserPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CentralSchoolUserListItem[];
};

export type EffectivePermission = CentralSchoolPermission & {
  source: "ROLE" | "DIRECT" | "OVERRIDE" | "SYSTEM";
  roleNames: string[];
};

export type CentralSchoolUserPermissions = {
  effectivePermissions: EffectivePermission[];
  directPermissions: Array<CentralSchoolPermission & {isGranted: boolean}>;
};

export type CentralSchoolUserAuditEntry = {
  id: string;
  action: string;
  actor: {id: string; fullName: string; email: string} | null;
  createdAt: string | null;
  after: Record<string, unknown> | null;
};

export type CreateCentralSchoolUserPayload = {
  email: string;
  fullName: string;
  phone?: string;
  password?: string;
  isActive: boolean;
  roleIds: string[];
  permissionCodes: string[];
};

export type UpdateCentralSchoolUserPayload = {
  email?: string;
  fullName?: string;
  phone?: string;
};
