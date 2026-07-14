export type PaginatedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CentralDashboardOverview = {
  schoolsTotal: number;
  schoolsActive: number;
  schoolsInactive: number;
  schoolsPendingAdmin: number;
  usersTotal: number;
  ticketsOpen: number;
  systemStatus: string;
};

export type CentralSystemHealth = {
  status: string;
  database?: string;
  redis?: string;
  checks?: Record<string, string>;
};

export type CentralSchoolHealth = {
  schoolId: string;
  name: string;
  status: string;
  openTickets: number;
  lastActivityAt: string | null;
  errorRate: number | null;
};

export type CentralSchool = {
  id: string;
  name: string;
  code: string;
  phone: string;
  address: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
  } | null;
};

export type CentralSchoolInput = {
  name: string;
  code: string;
  phone: string;
  address: string;
  timezone: string;
};

export type CentralAdminState = {
  hasAdmin: boolean;
  admin: {
    id: string;
    email: string;
    fullName: string;
    status: "ACTIVE" | "INACTIVE";
  } | null;
};

export type CentralAdminInput = {
  fullName: string;
  email: string;
  phone?: string;
  tempPassword?: string;
};

export type CentralPasswordResetInput = {
  reason: string;
  newTempPassword?: string;
};

export type CentralTicket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  schoolId: string | null;
  assignedTo: string | null;
  createdAt: string;
};

export type CentralAuditEntry = {
  id: string;
  actorUser: string | null;
  school: string | null;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

export type CentralPolicy = {
  key: string;
  value: unknown;
};
