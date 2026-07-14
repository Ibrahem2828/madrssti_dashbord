import type {
  PaginatedResult,
  SchoolAcademicYear,
  SchoolAttendanceRecord,
  SchoolClassroom,
  SchoolCorrespondenceParty,
  SchoolDashboardOverview,
  SchoolDocument,
  SchoolDocumentActivity,
  SchoolDocumentAttachment,
  SchoolDocumentCategory,
  SchoolDocumentOverview,
  SchoolEffectivePermissions,
  SchoolExcuse,
  SchoolGrade,
  SchoolKpiReport,
  SchoolNotification,
  SchoolPointsReportEntry,
  SchoolPermission,
  SchoolQrEntry,
  SchoolRole,
  SchoolSettings,
  SchoolSubject,
  SchoolAttendanceReport,
  SchoolAtRiskStudent,
  SchoolBehaviorReport,
  SchoolTicket,
  SchoolUser,
} from "../types/contracts";

type UnknownRecord = Record<string, unknown>;

export function mapPaginated<T>(value: unknown, mapper: (item: unknown) => T): PaginatedResult<T> {
  const dto = asRecord(value);
  return {
    count: asNumber(dto.count),
    next: maybeText(dto.next),
    previous: maybeText(dto.previous),
    results: Array.isArray(dto.results) ? dto.results.map(mapper) : [],
  };
}

export function overviewFromDto(value: unknown): SchoolDashboardOverview {
  const dto = asRecord(value);
  return {
    students: asNumber(dto.students),
    attendanceToday: asNumber(dto.attendance_today),
    pointsTransactions: asNumber(dto.points_transactions),
    behaviorNotes: asNumber(dto.behavior_notes),
    ticketsOpen: asNumber(dto.tickets_open),
  };
}

export function userFromDto(value: unknown): SchoolUser {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    email: asText(dto.email),
    phone: asText(dto.phone),
    fullName: asText(dto.full_name),
    isActive: Boolean(dto.is_active),
    userType: asText(dto.user_type),
    roles: Array.isArray(dto.roles)
      ? dto.roles.map((item) => {
          const role = asRecord(item);
          return {id: asText(role.id), name: asText(role.name)};
        })
      : [],
  };
}

export function roleListFromDto(value: unknown): SchoolRole[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {id: asText(dto.id), name: asText(dto.name)};
      })
    : [];
}

export function permissionListFromDto(value: unknown): SchoolPermission[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {code: asText(dto.code)};
      })
    : [];
}

export function effectivePermissionsFromDto(value: unknown): SchoolEffectivePermissions {
  const dto = asRecord(value);
  return {
    permissions: Array.isArray(dto.permissions)
      ? dto.permissions.filter((item): item is string => typeof item === "string")
      : [],
    permissionsDetail: Array.isArray(dto.permissions_detail)
      ? dto.permissions_detail.map((item) => {
          const detail = asRecord(item);
        return {
          code: asText(detail.code),
          source: asText(detail.source),
          roleName: typeof detail.role_name === "string" || Array.isArray(detail.role_name)
              ? (detail.role_name as string | string[])
              : undefined,
            overrideId: maybeText(detail.override_id) ?? undefined,
        };
      })
    : [],
  };
}

export function academicYearFromDto(value: unknown): SchoolAcademicYear {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    startDate: asText(dto.start_date),
    endDate: asText(dto.end_date),
    isActive: Boolean(dto.is_active),
  };
}

export function gradeFromDto(value: unknown): SchoolGrade {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    sortOrder: asNumber(dto.sort_order),
    isActive: Boolean(dto.is_active),
  };
}

export function classroomFromDto(value: unknown): SchoolClassroom {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    gradeLevelId: maybeText(dto.grade_level),
    isActive: Boolean(dto.is_active),
  };
}

export function subjectFromDto(value: unknown): SchoolSubject {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    code: asText(dto.code),
    isActive: Boolean(dto.is_active),
  };
}

export function attendanceRecordFromDto(value: unknown): SchoolAttendanceRecord {
  const dto = asRecord(value);
  const student = asRecord(dto.student);
  const classroom = asRecord(dto.classroom);
  return {
    id: asText(dto.id),
    date: asText(dto.date),
    status: asText(dto.status),
    method: asText(dto.method),
    note: asText(dto.note),
    student: {
      id: asText(student.id),
      studentCode: asText(student.student_code),
      fullName: asText(student.full_name),
    },
    classroom: Object.keys(classroom).length ? {id: asText(classroom.id), name: asText(classroom.name)} : null,
  };
}

export function excuseFromDto(value: unknown): SchoolExcuse {
  const dto = asRecord(value);
  const student = asRecord(dto.student);
  return {
    id: asText(dto.id),
    student: {id: asText(student.id), fullName: asText(student.full_name)},
    date: asText(dto.date),
    reason: asText(dto.reason),
    status: asText(dto.status),
    createdAt: asText(dto.created_at),
  };
}

export function qrEntryListFromDto(value: unknown): SchoolQrEntry[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          id: asText(dto.id),
          ownerType: asText(dto.owner_type),
          ownerId: asText(dto.owner_id),
          ownerName: asText(dto.owner_name),
          status: asText(dto.status),
          validFrom: asText(dto.valid_from),
          validTo: asText(dto.valid_to),
        };
      })
    : [];
}

export function documentOverviewFromDto(value: unknown): SchoolDocumentOverview {
  const dto = asRecord(value);
  return {
    total: asNumber(dto.total),
    outgoing: asNumber(dto.outgoing),
    incoming: asNumber(dto.incoming),
    internal: asNumber(dto.internal),
    needsReply: asNumber(dto.needs_reply),
    overdueReplies: asNumber(dto.overdue_replies),
    archived: asNumber(dto.archived),
    byStatus: asRecordOfNumber(dto.by_status),
  };
}

export function documentFromDto(value: unknown): SchoolDocument {
  const dto = asRecord(value);
  const attachments = Array.isArray(dto.attachments) ? dto.attachments.map(attachmentFromDto) : [];
  return {
    id: asText(dto.id),
    direction: asText(dto.direction),
    documentType: asText(dto.document_type),
    status: asText(dto.status),
    priority: asText(dto.priority),
    title: asText(dto.title),
    subject: asText(dto.subject),
    documentNumber: asText(dto.document_number),
    documentDate: asText(dto.document_date),
    registeredAt: asText(dto.registered_at),
    categoryId: maybeText(dto.category),
    categoryName: maybeText(asRecord(dto.category_detail).name ?? asRecord(dto.category).name),
    sourcePartyId: maybeText(dto.source_party),
    sourcePartyName: maybeText(asRecord(dto.source_party_detail).name),
    targetPartyId: maybeText(dto.target_party),
    targetPartyName: maybeText(asRecord(dto.target_party_detail).name),
    sourceName: asText(dto.source_name),
    targetName: asText(dto.target_name),
    needsReply: Boolean(dto.needs_reply),
    replyDueDate: maybeText(dto.reply_due_date),
    notes: asText(dto.notes),
    tags: Array.isArray(dto.tags) ? dto.tags.filter((item): item is string => typeof item === "string") : [],
    attachmentsCount: asNumber(dto.attachments_count),
    attachments,
  };
}

export function attachmentFromDto(value: unknown): SchoolDocumentAttachment {
  const dto = asRecord(value);
  const uploadedBy = asRecord(dto.uploaded_by);
  return {
    id: asText(dto.id),
    originalFilename: asText(dto.original_filename),
    fileSize: asNumber(dto.file_size),
    mimeType: asText(dto.mime_type),
    isPrimary: Boolean(dto.is_primary),
    downloadUrl: asText(dto.download_url),
    previewUrl: asText(dto.preview_url),
    createdAt: asText(dto.created_at),
    uploadedBy: Object.keys(uploadedBy).length
      ? {
          id: asText(uploadedBy.id),
          fullName: asText(uploadedBy.full_name),
          email: asText(uploadedBy.email),
        }
      : null,
  };
}

export function activityFromDto(value: unknown): SchoolDocumentActivity {
  const dto = asRecord(value);
  const actor = asRecord(dto.actor);
  return {
    id: asText(dto.id),
    action: asText(dto.action),
    message: asText(dto.message),
    createdAt: asText(dto.created_at),
    actorName: maybeText(actor.full_name),
  };
}

export function categoryFromDto(value: unknown): SchoolDocumentCategory {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    code: asText(dto.code),
    parent: maybeText(dto.parent),
    description: asText(dto.description),
    isActive: Boolean(dto.is_active),
  };
}

export function partyFromDto(value: unknown): SchoolCorrespondenceParty {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    name: asText(dto.name),
    partyType: asText(dto.party_type),
    phone: asText(dto.phone),
    email: asText(dto.email),
    address: asText(dto.address),
    notes: asText(dto.notes),
    isActive: Boolean(dto.is_active),
  };
}

export function ticketListFromDto(value: unknown): SchoolTicket[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          id: asText(dto.id),
          title: asText(dto.title),
          status: asText(dto.status),
          priority: asText(dto.priority),
          assignedTo: maybeText(dto.assigned_to),
          createdAt: asText(dto.created_at),
        };
      })
    : [];
}

export function settingsFromDto(value: unknown): SchoolSettings {
  const dto = asRecord(value);
  const school = asRecord(dto.school);
  const settings = asRecord(dto.settings);
  return {
    school: {
      id: asText(school.id),
      name: asText(school.name),
      code: asText(school.code),
      phone: asText(school.phone),
      address: asText(school.address),
      timezone: asText(school.timezone),
    },
    settings: {
      aiEnabled: Boolean(settings.ai_enabled),
      leaderboardEnabled: Boolean(settings.leaderboard_enabled),
      behaviorVisibility: asText(settings.behavior_visibility),
      pointsLimits: settings.points_limits,
      featureFlags: settings.feature_flags,
    },
  };
}

export function notificationFromDto(value: unknown): SchoolNotification {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    title: asText(dto.title),
    body: asText(dto.body),
    type: asText(dto.type),
    isRead: Boolean(dto.is_read),
    createdAt: asText(dto.created_at),
  };
}

export function attendanceReportFromDto(value: unknown): SchoolAttendanceReport {
  const dto = asRecord(value);
  return {
    summary: asRecordOfNumber(dto.summary),
  };
}

export function pointsReportFromDto(value: unknown): SchoolPointsReportEntry[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          studentId: asText(dto.student_id),
          points: asNumber(dto.points),
        };
      })
    : [];
}

export function atRiskStudentsFromDto(value: unknown): SchoolAtRiskStudent[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          studentId: asText(dto.student_id),
          studentCode: asText(dto.student_code),
          fullName: asText(dto.full_name),
          absentDays: asNumber(dto.absent_days),
          points: asNumber(dto.points),
        };
      })
    : [];
}

export function behaviorReportFromDto(value: unknown): SchoolBehaviorReport {
  return asRecordOfNumber(value);
}

export function kpiReportFromDto(value: unknown): SchoolKpiReport {
  const dto = asRecord(value);
  return {
    students: asNumber(dto.students),
    staff: asNumber(dto.staff),
    attendanceToday: asNumber(dto.attendance_today),
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

function asRecordOfNumber(value: unknown): Record<string, number> {
  const dto = asRecord(value);
  return Object.fromEntries(
    Object.entries(dto).flatMap(([key, entry]) => (typeof entry === "number" ? [[key, entry]] : [])),
  );
}
