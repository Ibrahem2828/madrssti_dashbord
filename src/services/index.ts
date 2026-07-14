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
} from "./api";

export type {
  ApiUser,
  ApiUserDetail,
  ApiRole,
  ApiPermission,
  ApiUsersListResponse,
  ApiCreateUserPayload,
} from "./api";

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
} from "./api";

export type {
  ApiDocumentOverview,
  ApiDocumentCategory,
  ApiCorrespondenceParty,
  ApiDocumentListItem,
  ApiDocumentDetail,
  ApiDocumentAttachment,
  ApiDocPaginatedResponse,
  ApiCreateDocumentPayload,
  ApiCreateDocumentResponse,
} from "./api";

export {
  apiFetchAttendanceRecords,
  apiManualAttendanceRecord,
  apiUpdateAttendanceRecord,
  apiFetchExcuses,
  apiApproveExcuse,
  apiRejectExcuse,
  apiFetchQrUsers,
} from "./api";

export type {
  ApiAttendanceRecord,
  ApiExcuse,
} from "./api";

export {
  apiFetchBehaviorLog,
  apiRecordBehaviorPoint,
  apiFetchPointsSummary,
} from "./api";

export type {
  ApiBehaviorEntry,
} from "./api";

export {
  apiFetchHalaqat,
  apiFetchHalaqaById,
  apiToggleStudentMembership,
  apiRecordMemorizationSession,
  apiFetchStudentQuranProgress,
  apiUpdateMemorizationTarget,
  apiFetchAvailableStudents,
} from "./api";

export type {
  ApiHalaqa,
  ApiHalaqaStudent,
  ApiMemorizationSession,
  ApiQuranProgress,
} from "./api";

export { apiClient, createApiClient } from "./apiClient";
export type { ApiClientInstance, ApiClientConfig, RequestConfig, RequestOptions, HttpMethod } from "./apiClient";

export { authenticatedApiClient, createAuthenticatedApiClient, setAuthContext, setSchoolContext, getSchoolContext, getAuthContext } from "./apiInterceptor";
export type { SchoolContext, AuthContext as InterceptorAuthContext } from "./apiInterceptor";

export { unwrapData, unwrapDataOrThrow, isSuccessResponse, isErrorResponse, ApiError, normalizeErrorResponse, extractPagination } from "./envelopeHandler";
export type { ApiErrorPayload } from "./envelopeHandler";