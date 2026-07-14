export const ATTENDANCE_STATUSES = ["PRESENT", "LATE", "ABSENT", "EXCUSED"] as const;
export const QR_OWNER_TYPES = ["STUDENT", "TEACHER", "STAFF"] as const;
export const QR_STATUSES = ["ACTIVE", "REVOKED", "EXPIRED"] as const;
export const DOCUMENT_DIRECTIONS = ["OUTGOING", "INCOMING", "INTERNAL"] as const;
export const DOCUMENT_TYPES = [
  "LETTER",
  "CIRCULAR",
  "REPORT",
  "TEACHER_ASSIGNMENT",
  "STUDENT_ADMISSION",
  "BUDGET",
  "FINANCIAL_REPORT",
  "ADMIN_REPORT",
  "GUIDANCE_REPORT",
  "OTHER",
] as const;
export const DOCUMENT_STATUSES = [
  "DRAFT",
  "REGISTERED",
  "SENT",
  "RECEIVED",
  "UNDER_REVIEW",
  "NEEDS_REPLY",
  "REPLIED",
  "ARCHIVED",
  "CLOSED",
  "CANCELLED",
] as const;
export const DOCUMENT_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const DOCUMENT_RELATION_TYPES = ["REPLY_TO", "FOLLOW_UP", "RELATED", "REPLACES"] as const;
export const PARTY_TYPES = [
  "MINISTRY",
  "DIRECTORATE",
  "SCHOOL",
  "PARENT",
  "FINANCIAL_ENTITY",
  "GUIDANCE",
  "INTERNAL_DEPARTMENT",
  "OTHER",
] as const;
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const statusTranslationKeys: Readonly<Record<string, string>> = {
  OPEN: "open",
  IN_PROGRESS: "inProgress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  EXCUSED: "excused",
  DRAFT: "draft",
  REGISTERED: "registered",
  SENT: "sent",
  RECEIVED: "received",
  UNDER_REVIEW: "underReview",
  NEEDS_REPLY: "needsReply",
  REPLIED: "replied",
  ARCHIVED: "archived",
  CANCELLED: "cancelled",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ACTIVE: "active",
  INACTIVE: "inactive",
  REVOKED: "revoked",
  EXPIRED: "expired",
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNAVAILABLE: "unavailable",
  OK: "ok",
  UP: "up",
  DOWN: "down",
};

export const priorityTranslationKeys: Readonly<Record<string, string>> = {
  LOW: "low",
  NORMAL: "normal",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const directionTranslationKeys: Readonly<Record<string, string>> = {
  OUTGOING: "outgoing",
  INCOMING: "incoming",
  INTERNAL: "internal",
};

export const documentTypeTranslationKeys: Readonly<Record<string, string>> = {
  LETTER: "letter",
  CIRCULAR: "circular",
  REPORT: "report",
  TEACHER_ASSIGNMENT: "teacherAssignment",
  STUDENT_ADMISSION: "studentAdmission",
  BUDGET: "budget",
  FINANCIAL_REPORT: "financialReport",
  ADMIN_REPORT: "adminReport",
  GUIDANCE_REPORT: "guidanceReport",
  OTHER: "other",
};

export const relationTypeTranslationKeys: Readonly<Record<string, string>> = {
  REPLY_TO: "replyTo",
  FOLLOW_UP: "followUp",
  RELATED: "related",
  REPLACES: "replaces",
};

export const partyTypeTranslationKeys: Readonly<Record<string, string>> = {
  MINISTRY: "ministry",
  DIRECTORATE: "directorate",
  SCHOOL: "school",
  PARENT: "parent",
  FINANCIAL_ENTITY: "financialEntity",
  GUIDANCE: "guidance",
  INTERNAL_DEPARTMENT: "internalDepartment",
  OTHER: "other",
};

export const ownerTypeTranslationKeys: Readonly<Record<string, string>> = {
  STUDENT: "student",
  TEACHER: "teacher",
  STAFF: "staff",
};

export const activityActionTranslationKeys: Readonly<Record<string, string>> = {
  DOCUMENT_CREATED: "documentCreated",
  DOCUMENT_UPDATED: "documentUpdated",
  DOCUMENT_ATTACHMENT_UPLOADED: "documentAttachmentUploaded",
  DOCUMENT_ATTACHMENT_DELETED: "documentAttachmentDeleted",
  DOCUMENT_LINKED: "documentLinked",
  DOCUMENT_STATUS_CHANGED: "documentStatusChanged",
  DOCUMENT_ARCHIVED: "documentArchived",
  DOCUMENT_DOWNLOADED: "documentDownloaded",
  DOCUMENT_PREVIEWED: "documentPreviewed",
  DOCUMENT_REPLY_CREATED: "documentReplyCreated",
  DOCUMENT_MARKED_SENT: "documentMarkedSent",
  DOCUMENT_MARKED_RECEIVED: "documentMarkedReceived",
};

export function translateEnum(
  value: string | null | undefined,
  t: (key: string) => string,
  keys: Readonly<Record<string, string>>,
) {
  if (!value) {
    return "";
  }

  const key = keys[value] ?? keys[value.toUpperCase()] ?? keys[value.toLowerCase()];
  return key ? t(key) : value;
}
