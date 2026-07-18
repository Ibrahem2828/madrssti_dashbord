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
  SchoolActorSummary,
  SchoolDocumentRelated,
  SchoolDocumentOverviewActivity,
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
    userType: asText(dto.user_type || dto.profile_type),
    profileType: asText(dto.profile_type),
    teacherCode: maybeText(dto.teacher_code),
    roles: Array.isArray(dto.roles)
      ? dto.roles.map((item) => {
          if (typeof item === "string") {
            return {id: item, name: item};
          }

          const role = asRecord(item);
          return {
            id: asText(role.id || role.code || role.name),
            name: asText(role.name || role.code),
            code: maybeText(role.code) ?? undefined,
            description: maybeText(role.description) ?? undefined,
          };
        })
      : [],
    createdAt: maybeText(dto.created_at),
    updatedAt: maybeText(dto.updated_at),
  };
}

export function roleListFromDto(value: unknown): SchoolRole[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          id: asText(dto.id || dto.code || dto.name),
          name: asText(dto.name || dto.code),
          code: maybeText(dto.code) ?? undefined,
          description: maybeText(dto.description) ?? undefined,
        };
      })
    : [];
}

export function permissionListFromDto(value: unknown): SchoolPermission[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const dto = asRecord(item);
        return {
          code: asText(dto.code),
          description: maybeText(dto.description) ?? undefined,
          resource: maybeText(dto.resource) ?? undefined,
          action: maybeText(dto.action) ?? undefined,
        };
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
            roleName:
              typeof detail.role_name === "string" || Array.isArray(detail.role_name)
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
    recentActivity: Array.isArray(dto.recent_activity) ? dto.recent_activity.map(overviewActivityFromDto) : [],
  };
}

export function documentFromDto(value: unknown): SchoolDocument {
  const dto = asRecord(value);
  const category = resolveEntityRecord(dto.category);
  const sourceParty = resolveEntityRecord(dto.source_party);
  const targetParty = resolveEntityRecord(dto.target_party);
  const attachments = Array.isArray(dto.attachments) ? dto.attachments.map(attachmentFromDto) : [];
  const relatedDocuments = Array.isArray(dto.related_documents) ? dto.related_documents.map(relatedDocumentFromDto) : [];

  return {
    id: asText(dto.id),
    direction: asText(dto.direction),
    documentType: asText(dto.document_type),
    status: asText(dto.status),
    priority: asText(dto.priority),
    title: asText(dto.title),
    subject: asText(dto.subject),
    documentNumber: asText(dto.document_number),
    sequenceNumber: asNullableNumber(dto.sequence_number),
    documentDate: asText(dto.document_date),
    registeredAt: asText(dto.registered_at),
    categoryId: maybeText(category.id ?? dto.category),
    categoryName: maybeText(category.name),
    categoryCode: maybeText(category.code),
    sourcePartyId: maybeText(sourceParty.id ?? dto.source_party),
    sourcePartyName: maybeText(sourceParty.name),
    targetPartyId: maybeText(targetParty.id ?? dto.target_party),
    targetPartyName: maybeText(targetParty.name),
    sourceName: asText(dto.source_name),
    targetName: asText(dto.target_name),
    needsReply: Boolean(dto.needs_reply),
    replyDueDate: maybeText(dto.reply_due_date),
    repliedAt: maybeText(dto.replied_at),
    relatedDocumentId: maybeText(dto.related_document),
    relationType: maybeText(dto.relation_type),
    academicYearId: maybeText(dto.academic_year),
    notes: asText(dto.notes),
    tags: Array.isArray(dto.tags) ? dto.tags.filter((item): item is string => typeof item === "string") : [],
    attachmentsCount: asNumber(dto.attachments_count ?? attachments.length),
    attachments,
    relatedDocuments,
    createdBy: actorFromDto(dto.created_by),
    updatedBy: actorFromDto(dto.updated_by),
    createdAt: maybeText(dto.created_at),
    updatedAt: maybeText(dto.updated_at),
  };
}

export function attachmentFromDto(value: unknown): SchoolDocumentAttachment {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    originalFilename: asText(dto.original_filename),
    fileSize: asNumber(dto.file_size),
    mimeType: asText(dto.mime_type),
    isPrimary: Boolean(dto.is_primary),
    // The browser builds a same-origin BFF URL from the document and attachment IDs.
    // Do not retain server-provided media paths in client state.
    downloadUrl: "",
    previewUrl: "",
    createdAt: asText(dto.created_at),
    uploadedBy: actorFromDto(dto.uploaded_by),
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

function overviewActivityFromDto(value: unknown): SchoolDocumentOverviewActivity {
  const dto = asRecord(value);
  return {
    documentId: asText(dto.document_id),
    action: asText(dto.action),
    title: asText(dto.title),
    createdAt: asText(dto.created_at),
  };
}

function relatedDocumentFromDto(value: unknown): SchoolDocumentRelated {
  const dto = asRecord(value);
  return {
    id: asText(dto.id),
    title: asText(dto.title),
    documentNumber: asText(dto.document_number),
    relationType: maybeText(dto.relation_type),
    direction: maybeText(dto.direction),
    status: maybeText(dto.status),
  };
}

function actorFromDto(value: unknown): SchoolActorSummary | null {
  const dto = asRecord(value);
  if (Object.keys(dto).length === 0) {
    return null;
  }

  const id = asText(dto.id);
  const fullName = asText(dto.full_name);

  if (!id && !fullName) {
    return null;
  }

  return {
    id,
    fullName,
    email: maybeText(dto.email) ?? undefined,
  };
}

function resolveEntityRecord(value: unknown) {
  if (typeof value === "string") {
    return {id: value};
  }

  return asRecord(value);
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

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function asRecordOfNumber(value: unknown): Record<string, number> {
  const dto = asRecord(value);
  return Object.fromEntries(Object.entries(dto).flatMap(([key, entry]) => (typeof entry === "number" ? [[key, entry]] : [])));
}
