import type {
  CentralAdminState,
  CentralAuditEntry,
  CentralDashboardOverview,
  CentralPolicy,
  CentralSchool,
  CentralSchoolHealth,
  CentralSystemHealth,
  CentralTicket,
  PaginatedResult,
} from "../types/contracts";

type UnknownRecord = Record<string, unknown>;

export function schoolFromDto(value: unknown): CentralSchool {
  const dto = asRecord(value);
  const admin = asRecord(dto.admin_user);

  return {
    id: asText(dto.id),
    name: asText(dto.name),
    code: asText(dto.code),
    phone: asText(dto.phone),
    address: asText(dto.address),
    timezone: asText(dto.timezone),
    isActive: Boolean(dto.is_active),
    createdAt: asText(dto.created_at),
    updatedAt: asText(dto.updated_at),
    admin: Object.keys(admin).length
      ? {
          id: asText(admin.id),
          email: asText(admin.email),
          fullName: asText(admin.full_name),
          isActive: Boolean(admin.is_active),
        }
      : null,
  };
}

export function adminStateFromDto(value: unknown): CentralAdminState {
  const dto = asRecord(value);
  const admin = asRecord(dto.admin);

  return {
    hasAdmin: Boolean(dto.has_admin),
    admin: Object.keys(admin).length
      ? {
          id: asText(admin.id),
          email: asText(admin.email),
          fullName: asText(admin.full_name),
          status: admin.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        }
      : null,
  };
}

export function ticketFromDto(value: unknown): CentralTicket {
  const dto = asRecord(value);

  return {
    id: asText(dto.id),
    title: asText(dto.title),
    description: asText(dto.description),
    status: asText(dto.status),
    priority: asText(dto.priority),
    schoolId: maybeText(dto.school_id ?? dto.school),
    assignedTo: maybeText(dto.assigned_to),
    createdAt: asText(dto.created_at),
  };
}

export function auditEntryFromDto(value: unknown): CentralAuditEntry {
  const dto = asRecord(value);

  return {
    id: asText(dto.id),
    actorUser: maybeText(dto.actor_user),
    school: maybeText(dto.school),
    action: asText(dto.action),
    entityType: asText(dto.entity_type),
    entityId: asText(dto.entity_id),
    createdAt: asText(dto.created_at),
  };
}

export function policyListFromDto(value: unknown): CentralPolicy[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {key: asText(dto.key), value: dto.value};
      })
    : [];
}

export function dashboardOverviewFromDto(value: unknown): CentralDashboardOverview {
  const dto = asRecord(value);
  return {
    schoolsTotal: asNumber(dto.schools_total),
    schoolsActive: asNumber(dto.schools_active),
    schoolsInactive: asNumber(dto.schools_inactive),
    schoolsPendingAdmin: asNumber(dto.schools_pending_admin),
    usersTotal: asNumber(dto.users_total),
    ticketsOpen: asNumber(dto.tickets_open),
    systemStatus: asText(dto.system_status),
  };
}

export function systemHealthFromDto(value: unknown): CentralSystemHealth {
  const dto = asRecord(value);
  return {
    status: asText(dto.status),
    database: maybeText(dto.database ?? dto.db) ?? undefined,
    redis: maybeText(dto.redis) ?? undefined,
    checks: asChecks(dto.checks),
  };
}

export function schoolHealthListFromDto(value: unknown): CentralSchoolHealth[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          schoolId: asText(dto.school_id),
          name: asText(dto.name),
          status: asText(dto.status),
          openTickets: asNumber(dto.open_tickets),
          lastActivityAt: maybeText(dto.last_activity_at),
          errorRate: typeof dto.error_rate === "number" ? dto.error_rate : null,
        };
      })
    : [];
}

export function mapPaginated<T>(value: unknown, mapper: (item: unknown) => T): PaginatedResult<T> {
  const dto = asRecord(value);
  return {
    count: asNumber(dto.count),
    next: maybeText(dto.next),
    previous: maybeText(dto.previous),
    results: Array.isArray(dto.results) ? dto.results.map(mapper) : [],
  };
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function maybeText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function asChecks(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => (typeof entry === "string" ? [[key, entry]] : [])),
  );
}
