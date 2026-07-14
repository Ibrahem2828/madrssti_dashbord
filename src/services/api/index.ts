export {
  apiLogin,
  apiRefresh,
  apiLogout,
  apiMe,
  apiMySchools,
  apiSwitchSchool,
} from "./auth";
export type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  MeResponse,
  SchoolInfo,
  SwitchSchoolRequest,
  SwitchSchoolResponse,
} from "./auth";

export {
  apiFetchUsers,
  apiFetchUserById,
  apiCreateUser,
  apiUpdateUser,
  apiResetUserPassword,
  apiFetchRoles,
  apiFetchPermissions,
  apiFetchUserEffectivePermissions,
  apiGrantPermission,
  apiRevokePermission,
} from "./users";
export type {
  ApiUser,
  ApiUserDetail,
  ApiRole,
  ApiPermission,
  ApiUsersListResponse,
  ApiCreateUserPayload,
} from "./users";

export {
  apiFetchDocumentsOverview,
  apiFetchDocuments,
  apiFetchDocumentById,
  apiCreateDocument,
  apiUpdateDocument,
  apiDeleteDocument,
  apiUploadAttachment,
  apiFetchAttachments,
  apiLinkDocument,
  apiCreateReply,
  apiMarkSent,
  apiMarkReceived,
  apiArchiveDocument,
  apiFetchDocumentActivity,
  apiFetchDocumentCategories,
  apiCreateDocumentCategory,
  apiFetchCorrespondenceParties,
  apiCreateCorrespondenceParty,
} from "./documents";
export type {
  ApiDocumentOverview,
  ApiDocumentCategory,
  ApiCorrespondenceParty,
  ApiDocumentListItem,
  ApiDocumentDetail,
  ApiDocumentAttachment,
  ApiPaginatedResponse as ApiDocPaginatedResponse,
  ApiCreateDocumentPayload,
  ApiCreateDocumentResponse,
} from "./documents";

export {
  apiFetchAttendanceRecords,
  apiManualAttendanceRecord,
  apiUpdateAttendanceRecord,
  apiFetchExcuses,
  apiApproveExcuse,
  apiRejectExcuse,
  apiFetchQrUsers,
} from "./attendance";
export type {
  ApiAttendanceRecord,
  ApiExcuse,
} from "./attendance";

export {
  apiFetchBehaviorLog,
  apiRecordBehaviorPoint,
  apiFetchPointsSummary,
} from "./points";
export type {
  ApiBehaviorEntry,
} from "./points";

export {
  apiFetchHalaqat,
  apiFetchHalaqaById,
  apiToggleStudentMembership,
  apiRecordMemorizationSession,
  apiFetchStudentQuranProgress,
  apiUpdateMemorizationTarget,
  apiFetchAvailableStudents,
} from "./halaqat";
export type {
  ApiHalaqa,
  ApiHalaqaStudent,
  ApiMemorizationSession,
  ApiQuranProgress,
} from "./halaqat";