/**
 * Verified against the local backend source tree under B:\schools\mishkat_backend.
 * Capabilities describe backend support, not user authorization.
 */

export const centralCapabilities = {
  dashboard: true,
  dashboardOverview: true,
  dashboardSchoolsHealth: true,
  systemHealth: true,
  schoolsRead: true,
  schoolsCreate: true,
  schoolsUpdate: true,
  schoolsActivate: true,
  schoolsDeactivate: true,
  schoolAdminRead: true,
  schoolAdminCreate: true,
  schoolAdminResetPassword: true,
  ticketsRead: true,
  ticketsDetail: true,
  ticketsAssign: true,
  ticketsClose: true,
  auditRead: true,
  policiesRead: true,
  policiesUpdate: true,
} as const;

export const schoolCapabilities = {
  dashboard: true,
  dashboardOverview: true,
  dashboardKpis: true,
  dashboardDocumentsOverview: true,
  notificationsRead: true,
  usersRead: true,
  usersCreate: true,
  usersUpdate: true,
  usersResetPassword: true,
  rolesRead: true,
  permissionsRead: true,
  effectivePermissionsRead: true,
  rolesAssign: true,
  permissionsGrant: true,
  permissionsRevoke: true,
  academicYearsRead: true,
  academicYearsCreate: true,
  academicYearsUpdate: true,
  gradesRead: true,
  classroomsRead: true,
  subjectsRead: true,
  attendanceRead: true,
  attendanceManual: true,
  attendanceUpdate: true,
  excusesRead: true,
  excusesApprove: true,
  excusesReject: true,
  qrRead: true,
  qrRegenerate: true,
  qrRevoke: true,
  qrRotateYear: true,
  documentsOverview: true,
  documentsRead: true,
  documentsCreate: true,
  documentsDetail: true,
  documentsUpdate: true,
  documentsDelete: true,
  documentsAttachmentsRead: true,
  documentsAttachmentsUpload: true,
  documentsPreview: true,
  documentsDownload: true,
  documentsLink: true,
  documentsReply: true,
  documentsMarkSent: true,
  documentsMarkReceived: true,
  documentsArchive: true,
  documentsActivity: true,
  categoriesRead: true,
  categoriesCreate: true,
  categoriesUpdate: true,
  categoriesDelete: true,
  partiesRead: true,
  partiesCreate: true,
  partiesUpdate: true,
  partiesDelete: true,
  ticketsRead: true,
  ticketsAssign: true,
  ticketsClose: true,
  ticketsEscalate: true,
  settingsRead: true,
  settingsUpdate: true,
  featuresUpdate: true,
  reportsKpis: true,
  reportsOverview: true,
  reportsAttendance: true,
  reportsPoints: true,
  reportsBehavior: true,
  reportsAtRisk: true,
} as const;

export type CentralCapability = keyof typeof centralCapabilities;
export type SchoolCapability = keyof typeof schoolCapabilities;
export type Capability =
  | "central.dashboard"
  | "central.health"
  | "central.schools"
  | "central.schoolAdmin"
  | "central.tickets"
  | "central.audit"
  | "central.policies"
  | "school.dashboard"
  | "school.users"
  | "school.academics"
  | "school.attendance"
  | "school.qr"
  | "school.documents"
  | "school.documentCategories"
  | "school.correspondenceParties"
  | "school.archive"
  | "school.reports"
  | "school.notifications"
  | "school.tickets"
  | "school.settings";

export const capabilities: Readonly<Record<Capability, boolean>> = {
  "central.dashboard": centralCapabilities.dashboard,
  "central.health": centralCapabilities.systemHealth && centralCapabilities.dashboardSchoolsHealth,
  "central.schools": centralCapabilities.schoolsRead,
  "central.schoolAdmin": centralCapabilities.schoolAdminRead,
  "central.tickets": centralCapabilities.ticketsRead,
  "central.audit": centralCapabilities.auditRead,
  "central.policies": centralCapabilities.policiesRead,
  "school.dashboard": schoolCapabilities.dashboard,
  "school.users": schoolCapabilities.usersRead,
  "school.academics": schoolCapabilities.academicYearsRead,
  "school.attendance": schoolCapabilities.attendanceRead && schoolCapabilities.qrRead,
  "school.qr": schoolCapabilities.qrRead,
  "school.documents": schoolCapabilities.documentsRead,
  "school.documentCategories": schoolCapabilities.categoriesRead,
  "school.correspondenceParties": schoolCapabilities.partiesRead,
  "school.archive": schoolCapabilities.documentsRead,
  "school.reports":
    schoolCapabilities.reportsOverview ||
    schoolCapabilities.reportsAttendance ||
    schoolCapabilities.reportsPoints ||
    schoolCapabilities.reportsBehavior ||
    schoolCapabilities.reportsAtRisk,
  "school.notifications": schoolCapabilities.notificationsRead,
  "school.tickets": schoolCapabilities.ticketsRead,
  "school.settings": schoolCapabilities.settingsRead,
} as const;

export function hasCentralCapability(capability: CentralCapability) {
  return centralCapabilities[capability];
}

export function hasSchoolCapability(capability: SchoolCapability) {
  return schoolCapabilities[capability];
}

export function hasCapability(capability: Capability) {
  return capabilities[capability];
}
