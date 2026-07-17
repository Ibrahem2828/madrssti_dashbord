"use client";

import type {ApiResult} from "@/lib/api/contracts";
import {browserApi} from "@/lib/api/browser-client";
import {schoolEndpoints} from "@/config/endpoints.school";

import {
  academicYearFromDto,
  activityFromDto,
  attendanceReportFromDto,
  attendanceRecordFromDto,
  atRiskStudentsFromDto,
  behaviorReportFromDto,
  categoryFromDto,
  classroomFromDto,
  documentFromDto,
  documentOverviewFromDto,
  effectivePermissionsFromDto,
  excuseFromDto,
  gradeFromDto,
  kpiReportFromDto,
  mapPaginated,
  notificationFromDto,
  overviewFromDto,
  partyFromDto,
  permissionListFromDto,
  pointsReportFromDto,
  qrEntryListFromDto,
  roleListFromDto,
  settingsFromDto,
  subjectFromDto,
  ticketListFromDto,
  userFromDto,
  attachmentFromDto,
} from "../mappers/school";
import type {
  PaginatedResult,
  SchoolAcademicYear,
  SchoolAttendanceRecord,
  SchoolAttendanceReport,
  SchoolAtRiskStudent,
  SchoolBehaviorReport,
  SchoolClassroom,
  SchoolCorrespondenceParty,
  SchoolDashboardKpis,
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
  SchoolTicket,
  SchoolUser,
} from "../types/contracts";

type QueryValue = string | number | boolean | undefined | null;
type DocumentCollection = "all" | "outgoing" | "incoming" | "circulars" | "needsReply";

export async function fetchSchoolOverview(): Promise<ApiResult<SchoolDashboardOverview>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.dashboard.overview);
  return result.success ? {success: true, data: overviewFromDto(result.data)} : result;
}

export async function fetchSchoolKpis(): Promise<ApiResult<SchoolDashboardKpis>> {
  return browserApi<SchoolDashboardKpis>("school", schoolEndpoints.dashboard.kpis);
}

export async function fetchSchoolNotifications(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolNotification>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.notifications.list(query));
  return result.success ? {success: true, data: mapPaginated(result.data, notificationFromDto)} : result;
}

export async function markSchoolNotificationRead(id: string): Promise<ApiResult<SchoolNotification>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.notifications.markRead(id), {
    method: "PATCH",
  });
  return result.success ? {success: true, data: notificationFromDto(result.data)} : result;
}

export async function fetchSchoolUsers(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolUser>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.list(query));
  return result.success ? {success: true, data: mapPaginated(result.data, userFromDto)} : result;
}

export async function fetchSchoolUser(id: string): Promise<ApiResult<SchoolUser>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.detail(id));
  return result.success ? {success: true, data: userFromDto(result.data)} : result;
}

export async function createSchoolUser(payload: Record<string, unknown>): Promise<ApiResult<{id: string}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.users.create, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {id: typeof result.data.id === "string" ? result.data.id : ""},
  };
}

export async function updateSchoolUser(id: string, payload: Record<string, unknown>): Promise<ApiResult<{id: string; fullName: string}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.users.update(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      id: typeof result.data.id === "string" ? result.data.id : id,
      fullName: typeof result.data.full_name === "string" ? result.data.full_name : "",
    },
  };
}

async function changeSchoolUserActivation(id: string, action: "enable" | "disable"): Promise<ApiResult<SchoolUser>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users[action](id), {
    method: "POST",
  });

  return result.success ? {success: true, data: userFromDto(result.data)} : result;
}

export function disableSchoolUser(id: string): Promise<ApiResult<SchoolUser>> {
  return changeSchoolUserActivation(id, "disable");
}

export function enableSchoolUser(id: string): Promise<ApiResult<SchoolUser>> {
  return changeSchoolUserActivation(id, "enable");
}

export async function resetSchoolUserPassword(id: string, newPassword: string, reason: string): Promise<ApiResult<{detail: string; temporaryPassword: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.users.reset(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({new_password: newPassword, reason}),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      detail: typeof result.data.detail === "string" ? result.data.detail : "",
      temporaryPassword:
        typeof result.data.temporary_password === "string"
          ? result.data.temporary_password
          : typeof result.data.new_password === "string"
            ? result.data.new_password
            : typeof result.data.temp_password === "string"
              ? result.data.temp_password
              : null,
    },
  };
}

export async function fetchSchoolRoles(): Promise<ApiResult<SchoolRole[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.roles);
  return result.success ? {success: true, data: roleListFromDto(result.data)} : result;
}

export async function fetchSchoolPermissions(): Promise<ApiResult<SchoolPermission[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.permissions);
  return result.success ? {success: true, data: permissionListFromDto(result.data)} : result;
}

export async function fetchEffectivePermissions(userId: string): Promise<ApiResult<SchoolEffectivePermissions>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.effective(userId));
  return result.success ? {success: true, data: effectivePermissionsFromDto(result.data)} : result;
}

export async function assignSchoolRoles(userId: string, roleIds: string[]): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.assignRoles(userId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({role_ids: roleIds}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function grantSchoolPermissions(userId: string, permissionCodes: string[], reason: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.grant(userId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({permission_codes: permissionCodes, reason}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function revokeSchoolPermissions(userId: string, permissionCodes: string[], reason: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.users.revoke(userId), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({permission_codes: permissionCodes, reason}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchAcademicYears(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolAcademicYear>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.years(query));
  return result.success ? {success: true, data: mapPaginated(result.data, academicYearFromDto)} : result;
}

export async function createAcademicYear(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.createYear, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function updateAcademicYear(id: string, payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.updateYear(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchGrades(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolGrade>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.grades(query));
  return result.success ? {success: true, data: mapPaginated(result.data, gradeFromDto)} : result;
}

export async function fetchClassrooms(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolClassroom>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.classrooms(query));
  return result.success ? {success: true, data: mapPaginated(result.data, classroomFromDto)} : result;
}

export async function fetchSubjects(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolSubject>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.academics.subjects(query));
  return result.success ? {success: true, data: mapPaginated(result.data, subjectFromDto)} : result;
}

export async function fetchAttendanceRecords(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolAttendanceRecord>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.records(query));
  return result.success ? {success: true, data: mapPaginated(result.data, attendanceRecordFromDto)} : result;
}

export async function manualAttendanceRecord(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.manual, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function updateAttendanceRecord(recordId: string, payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.update(recordId), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchExcuses(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolExcuse>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.excuses(query));
  return result.success ? {success: true, data: mapPaginated(result.data, excuseFromDto)} : result;
}

export async function approveExcuse(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.approve(id), {method: "POST"});
  return result.success ? {success: true, data: null} : result;
}

export async function rejectExcuse(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.reject(id), {method: "POST"});
  return result.success ? {success: true, data: null} : result;
}

export async function fetchQrEntries(query: Record<string, QueryValue>): Promise<ApiResult<SchoolQrEntry[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.qr(query));
  return result.success ? {success: true, data: qrEntryListFromDto(result.data)} : result;
}

export async function regenerateQr(ownerType: string, ownerId: string, reason: string): Promise<ApiResult<{token: string | null}>> {
  const path = ownerType === "TEACHER"
    ? schoolEndpoints.attendance.regenerateTeacher(ownerId)
    : ownerType === "STAFF"
      ? schoolEndpoints.attendance.regenerateStaff(ownerId)
      : schoolEndpoints.attendance.regenerateStudent(ownerId);
  const result = await browserApi<Record<string, unknown>>("school", path, {
    method: "POST",
    headers: {"Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID()},
    body: JSON.stringify({reason}),
  });
  if (!result.success) return result;
  return {success: true, data: {token: typeof result.data.token === "string" ? result.data.token : null}};
}

export async function revokeQr(id: string, reason: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.revoke(id), {
    method: "POST",
    headers: {"Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID()},
    body: JSON.stringify({reason}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function rotateQrYear(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.attendance.rotateYear, {
    method: "POST",
    headers: {"Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID()},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchDocumentOverview(): Promise<ApiResult<SchoolDocumentOverview>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.overview);
  return result.success ? {success: true, data: documentOverviewFromDto(result.data)} : result;
}

export async function fetchDocuments(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  return fetchDocumentCollection("all", query);
}

export async function fetchOutgoingDocuments(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  return fetchDocumentCollection("outgoing", query);
}

export async function fetchIncomingDocuments(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  return fetchDocumentCollection("incoming", query);
}

export async function fetchCircularDocuments(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  return fetchDocumentCollection("circulars", query);
}

export async function fetchNeedsReplyDocuments(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  return fetchDocumentCollection("needsReply", query);
}

export async function createDocument(payload: Record<string, unknown>): Promise<ApiResult<{id: string; documentNumber: string; sequenceNumber: number | null; status: string}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.create, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      id: typeof result.data.id === "string" ? result.data.id : "",
      documentNumber: typeof result.data.document_number === "string" ? result.data.document_number : "",
      sequenceNumber: typeof result.data.sequence_number === "number" ? result.data.sequence_number : null,
      status: typeof result.data.status === "string" ? result.data.status : "",
    },
  };
}

export async function fetchDocument(id: string): Promise<ApiResult<SchoolDocument>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.detail(id));
  return result.success ? {success: true, data: documentFromDto(result.data)} : result;
}

export async function updateDocument(id: string, payload: Record<string, unknown>): Promise<ApiResult<{id: string; updatedAt: string | null; priority: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.update(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      id: typeof result.data.id === "string" ? result.data.id : id,
      updatedAt: typeof result.data.updated_at === "string" ? result.data.updated_at : null,
      priority: typeof result.data.priority === "string" ? result.data.priority : null,
    },
  };
}

export async function deleteDocument(id: string, reason = ""): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.delete(id), {
    method: "DELETE",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({reason}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function uploadDocumentAttachment(id: string, file: File, isPrimary = false): Promise<ApiResult<SchoolDocumentAttachment>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_primary", String(isPrimary));
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.attachments(id), {
    method: "POST",
    body: formData,
  });
  return result.success ? {success: true, data: attachmentFromDto(result.data)} : result;
}

export async function fetchDocumentAttachments(id: string): Promise<ApiResult<SchoolDocumentAttachment[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.attachmentsList(id));
  return result.success ? {success: true, data: Array.isArray(result.data) ? result.data.map(attachmentFromDto) : []} : result;
}

export async function linkDocument(id: string, relatedDocument: string, relationType: string): Promise<ApiResult<{id: string; relatedDocument: string; relationType: string}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.link(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({related_document: relatedDocument, relation_type: relationType}),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      id: typeof result.data.id === "string" ? result.data.id : id,
      relatedDocument: typeof result.data.related_document === "string" ? result.data.related_document : relatedDocument,
      relationType: typeof result.data.relation_type === "string" ? result.data.relation_type : relationType,
    },
  };
}

export async function createReplyDocument(id: string, payload: Record<string, unknown>): Promise<ApiResult<{id: string; documentNumber: string; relatedDocument: string | null; relationType: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.reply(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      id: typeof result.data.id === "string" ? result.data.id : "",
      documentNumber: typeof result.data.document_number === "string" ? result.data.document_number : "",
      relatedDocument: typeof result.data.related_document === "string" ? result.data.related_document : null,
      relationType: typeof result.data.relation_type === "string" ? result.data.relation_type : null,
    },
  };
}

export async function markDocumentSent(id: string, sentAt = new Date().toISOString(), reason = ""): Promise<ApiResult<{id: string; status: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.markSent(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({sent_at: sentAt, reason}),
  });
  if (!result.success) return result;
  return {success: true, data: {id: typeof result.data.id === "string" ? result.data.id : id, status: typeof result.data.status === "string" ? result.data.status : null}};
}

export async function markDocumentReceived(id: string, receivedAt = new Date().toISOString(), reason = ""): Promise<ApiResult<{id: string; status: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.markReceived(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({received_at: receivedAt, reason}),
  });
  if (!result.success) return result;
  return {success: true, data: {id: typeof result.data.id === "string" ? result.data.id : id, status: typeof result.data.status === "string" ? result.data.status : null}};
}

export async function archiveDocument(id: string, reason: string): Promise<ApiResult<{id: string; status: string | null}>> {
  const result = await browserApi<Record<string, unknown>>("school", schoolEndpoints.documents.archive(id), {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({reason}),
  });
  if (!result.success) return result;
  return {success: true, data: {id: typeof result.data.id === "string" ? result.data.id : id, status: typeof result.data.status === "string" ? result.data.status : null}};
}

export async function fetchDocumentActivity(id: string, query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocumentActivity>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.activity(id, query));
  return result.success ? {success: true, data: mapPaginated(result.data, activityFromDto)} : result;
}

export async function fetchCategories(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocumentCategory>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.categories(query));
  return result.success ? {success: true, data: mapPaginated(result.data, categoryFromDto)} : result;
}

export async function createCategory(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.createCategory, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function updateCategory(id: string, payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.updateCategory(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function deleteCategory(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.deleteCategory(id), {method: "DELETE"});
  return result.success ? {success: true, data: null} : result;
}

export async function fetchParties(query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolCorrespondenceParty>>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.parties(query));
  return result.success ? {success: true, data: mapPaginated(result.data, partyFromDto)} : result;
}

export async function createParty(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.createParty, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function updateParty(id: string, payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.updateParty(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function deleteParty(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.documents.deleteParty(id), {method: "DELETE"});
  return result.success ? {success: true, data: null} : result;
}

export async function fetchSchoolTickets(query: Record<string, QueryValue>): Promise<ApiResult<SchoolTicket[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.tickets.list(query));
  return result.success ? {success: true, data: ticketListFromDto(result.data)} : result;
}

export async function assignSchoolTicket(id: string, assignedTo: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.tickets.assign(id), {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({assigned_to: assignedTo}),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function closeSchoolTicket(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.tickets.close(id), {method: "PATCH"});
  return result.success ? {success: true, data: null} : result;
}

export async function escalateSchoolTicket(id: string): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.tickets.escalate(id), {method: "POST"});
  return result.success ? {success: true, data: null} : result;
}

export async function fetchSchoolSettings(): Promise<ApiResult<SchoolSettings>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.settings.detail);
  return result.success ? {success: true, data: settingsFromDto(result.data)} : result;
}

export async function updateSchoolSettings(payload: Record<string, unknown>): Promise<ApiResult<SchoolSettings>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.settings.detail, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: settingsFromDto(result.data)} : result;
}

export async function updateSchoolFeatures(payload: Record<string, unknown>): Promise<ApiResult<null>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.settings.features, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  return result.success ? {success: true, data: null} : result;
}

export async function fetchAttendanceReport(query: Record<string, QueryValue>): Promise<ApiResult<SchoolAttendanceReport>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.reports.attendance(query));
  return result.success ? {success: true, data: attendanceReportFromDto(result.data)} : result;
}

export async function fetchPointsReport(query: Record<string, QueryValue>): Promise<ApiResult<SchoolPointsReportEntry[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.reports.points(query));
  return result.success ? {success: true, data: pointsReportFromDto(result.data)} : result;
}

export async function fetchBehaviorReport(query: Record<string, QueryValue>): Promise<ApiResult<SchoolBehaviorReport>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.reports.behavior(query));
  return result.success ? {success: true, data: behaviorReportFromDto(result.data)} : result;
}

export async function fetchAtRiskStudents(query: Record<string, QueryValue>): Promise<ApiResult<SchoolAtRiskStudent[]>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.reports.atRisk(query));
  return result.success ? {success: true, data: atRiskStudentsFromDto(result.data)} : result;
}

export async function fetchKpiReport(): Promise<ApiResult<SchoolKpiReport>> {
  const result = await browserApi<unknown>("school", schoolEndpoints.reports.kpis);
  return result.success ? {success: true, data: kpiReportFromDto(result.data)} : result;
}

async function fetchDocumentCollection(collection: DocumentCollection, query: Record<string, QueryValue>): Promise<ApiResult<PaginatedResult<SchoolDocument>>> {
  const path = collection === "outgoing"
    ? schoolEndpoints.documents.outgoing(query)
    : collection === "incoming"
      ? schoolEndpoints.documents.incoming(query)
      : collection === "circulars"
        ? schoolEndpoints.documents.circulars(query)
        : collection === "needsReply"
          ? schoolEndpoints.documents.needsReply(query)
          : schoolEndpoints.documents.list(query);

  const result = await browserApi<unknown>("school", path);
  return result.success ? {success: true, data: mapPaginated(result.data, documentFromDto)} : result;
}
