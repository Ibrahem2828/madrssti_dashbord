import type { UUID, ISO8601DateTime } from "@/types/api";

export type UserRoleType =
  | "PRINCIPAL"
  | "DEPUTY_PRINCIPAL"
  | "ACADEMIC_SUPERVISOR"
  | "TEACHER"
  | "STUDENT"
  | "ATTENDANCE_OFFICER"
  | "ADMINISTRATOR";

export interface UserProfile {
  readonly id: UUID;
  readonly userId: UUID;
  readonly fullNameAr: string;
  readonly fullNameEn: string | null;
  readonly phoneNumber: string | null;
  readonly avatarUrl: string | null;
  readonly dateOfBirth: string | null;
  readonly nationality: string | null;
  readonly nationalId: string | null;
  readonly address: string | null;
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface User {
  readonly id: UUID;
  readonly email: string;
  readonly username: string;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly lastLoginAt: ISO8601DateTime | null;
  readonly profile: UserProfile;
  readonly roles: readonly UserRole[];
  readonly schoolId: UUID;
  readonly schoolName: string;
  readonly createdAt: ISO8601DateTime;
  readonly updatedAt: ISO8601DateTime;
}

export interface UserRole {
  readonly id: UUID;
  readonly userId: UUID;
  readonly roleId: UUID;
  readonly roleName: string;
  readonly roleType: UserRoleType;
  readonly schoolId: UUID;
  readonly isPrimary: boolean;
  readonly assignedAt: ISO8601DateTime;
}

export interface CreateUserPayload {
  email: string;
  username: string;
  password: string;
  profile: {
    fullNameAr: string;
    fullNameEn?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
    nationalId?: string;
  };
  roleType: UserRoleType;
  schoolId: UUID;
}

export interface UpdateUserPayload {
  email?: string;
  username?: string;
  isActive?: boolean;
  profile?: Partial<UserProfile>;
}