# API integration map

Common error families preserved through the frontend contract layer:

- `AUTHENTICATION_REQUIRED`
- `TOKEN_EXPIRED`
- `PERMISSION_DENIED`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `BACKEND_UNAVAILABLE`
- `SERVER_ERROR`

## Central

| Screen | Method | Gateway route | Backend path | Permission | Capability | Request | Response | Mapper | Status |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | GET | `/api/gateway/central/central/dashboard/overview` | `/api/v1/central/dashboard/overview` | `CENTRAL_DASHBOARD_VIEW` | `central.dashboard` | none | dashboard overview DTO | `dashboardOverviewFromDto` | Implemented |
| Dashboard | GET | `/api/gateway/central/central/dashboard/schools-health` | `/api/v1/central/dashboard/schools-health` | `CENTRAL_SCHOOLS_HEALTH_VIEW` | `central.dashboard` | none | school health list | `schoolHealthListFromDto` | Implemented |
| Health | GET | `/api/gateway/central/health` | `/api/v1/health` | `CENTRAL_DASHBOARD_VIEW` | `central.health` | none | health DTO | `systemHealthFromDto` | Implemented |
| Schools list | GET | `/api/gateway/central/central/schools?...` | `/api/v1/central/schools` | `CENTRAL_SCHOOLS_READ` | `central.schools` | query filters | paginated schools | `mapPaginated + schoolFromDto` | Implemented |
| School create | POST | `/api/gateway/central/central/schools` | `/api/v1/central/schools` | `CENTRAL_SCHOOLS_CREATE` | `central.schools` | school form JSON | school DTO | `schoolFromDto` | Implemented |
| School detail | GET | `/api/gateway/central/central/schools/{id}` | `/api/v1/central/schools/{id}` | `CENTRAL_SCHOOLS_READ` | `central.schools` | none | school DTO | `schoolFromDto` | Implemented |
| School update | PATCH | `/api/gateway/central/central/schools/{id}` | `/api/v1/central/schools/{id}` | `CENTRAL_SCHOOLS_UPDATE` | `central.schools` | partial school JSON | school DTO | `schoolFromDto` | Implemented |
| School activate | POST | `/api/gateway/central/central/schools/{id}/activate` | `/api/v1/central/schools/{id}/activate` | `CENTRAL_SCHOOLS_ACTIVATE_DEACTIVATE` | `central.schools` | empty body | school DTO | `schoolFromDto` | Implemented |
| School deactivate | POST | `/api/gateway/central/central/schools/{id}/deactivate` | `/api/v1/central/schools/{id}/deactivate` | `CENTRAL_SCHOOLS_ACTIVATE_DEACTIVATE` | `central.schools` | empty body | school DTO | `schoolFromDto` | Implemented |
| Principal state | GET | `/api/gateway/central/central/schools/{id}/admin` | `/api/v1/central/schools/{id}/admin` | `CENTRAL_SCHOOL_ADMIN_READ` | `central.schoolAdmin` | none | admin state DTO | `adminStateFromDto` | Implemented |
| Principal create | POST | `/api/gateway/central/central/schools/{id}/create-admin` | `/api/v1/central/schools/{id}/create-admin` | `CENTRAL_SCHOOL_ADMIN_CREATE` | `central.schoolAdmin` | admin JSON | admin + temp password | `adminStateFromDto` | Implemented |
| Principal reset password | POST | `/api/gateway/central/central/schools/{id}/reset-admin-password` | `/api/v1/central/schools/{id}/reset-admin-password` | `CENTRAL_SCHOOL_ADMIN_RESET_PASSWORD` | `central.schoolAdmin` | reason + optional temp password | temp password payload | inline mapping | Implemented |
| Tickets list | GET | `/api/gateway/central/central/tickets?...` | `/api/v1/central/tickets` | `CENTRAL_TICKETS_VIEW` | `central.tickets` | query filters | paginated tickets | `mapPaginated + ticketFromDto` | Implemented |
| Ticket detail | GET | `/api/gateway/central/central/tickets/{id}` | `/api/v1/central/tickets/{id}` | `CENTRAL_TICKETS_VIEW` | `central.tickets` | none | ticket DTO | `ticketFromDto` | Implemented |
| Ticket assign | PATCH | `/api/gateway/central/central/tickets/{id}/assign` | `/api/v1/central/tickets/{id}/assign` | `CENTRAL_TICKETS_ASSIGN` | `central.tickets` | `assigned_to` JSON | ticket mutation ack | normalized null result | Implemented |
| Ticket close | PATCH | `/api/gateway/central/central/tickets/{id}/close` | `/api/v1/central/tickets/{id}/close` | `CENTRAL_TICKETS_CLOSE` | `central.tickets` | empty | ticket mutation ack | normalized null result | Implemented |
| Audit | GET | `/api/gateway/central/central/audit?...` | `/api/v1/central/audit` | `CENTRAL_AUDIT_VIEW` | `central.audit` | query filters | paginated audit entries | `mapPaginated + auditEntryFromDto` | Implemented |
| Policies read | GET | `/api/gateway/central/central/policies` | `/api/v1/central/policies` | `CENTRAL_POLICIES_READ` | `central.policies` | none | policy list | `policyListFromDto` | Implemented |
| Policies update | PATCH | `/api/gateway/central/central/policies` | `/api/v1/central/policies` | `CENTRAL_POLICIES_UPDATE` | `central.policies` | `{key:value}` JSON | policy list | `policyListFromDto` | Implemented |

## School

| Screen | Method | Gateway route | Backend path | Permission | Capability | Request | Response | Mapper | Status |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | GET | `/api/gateway/school/admin/reports/overview` | `/api/v1/admin/reports/overview` | `ADMIN_REPORTS_VIEW` | `school.dashboard` | none | overview DTO | `overviewFromDto` | Implemented |
| Dashboard | GET | `/api/gateway/school/dashboard/kpis` | `/api/v1/dashboard/kpis` | `DASHBOARD_VIEW` | `school.dashboard` | none | KPI object | direct | Implemented |
| Dashboard | GET | `/api/gateway/school/admin/documents/overview` | `/api/v1/admin/documents/overview` | `DOCUMENTS_READ` | `school.dashboard` | none | documents overview | `documentOverviewFromDto` | Implemented |
| Users list | GET | `/api/gateway/school/admin/users?...` | `/api/v1/admin/users` | `ADMIN_USERS_READ` | `school.users` | query filters | paginated users | `mapPaginated + userFromDto` | Implemented |
| User create | POST | `/api/gateway/school/admin/users` | `/api/v1/admin/users` | `ADMIN_USERS_CREATE` | `school.users` | user JSON | mutation ack | normalized null result | Implemented |
| User update | PATCH | `/api/gateway/school/admin/users/{id}` | `/api/v1/admin/users/{id}` | `ADMIN_USERS_UPDATE` | `school.users` | partial user JSON | mutation ack | normalized null result | Implemented |
| User reset password | POST | `/api/gateway/school/admin/users/{id}/reset-password` | `/api/v1/admin/users/{id}/reset-password` | `ADMIN_USERS_RESET_PASSWORD` | `school.users` | password + reason JSON | mutation ack | normalized null result | Implemented |
| Roles catalog | GET | `/api/gateway/school/admin/roles` | `/api/v1/admin/roles` | `ADMIN_RBAC_ROLES_READ` | `school.users` | none | role list | `roleListFromDto` | Implemented |
| Permissions catalog | GET | `/api/gateway/school/admin/permissions` | `/api/v1/admin/permissions` | `ADMIN_RBAC_PERMS_READ` | `school.users` | none | permission list | `permissionListFromDto` | Implemented |
| Effective permissions | GET | `/api/gateway/school/admin/users/{id}/effective-permissions` | `/api/v1/admin/users/{id}/effective-permissions` | `ADMIN_RBAC_VIEW_EFFECTIVE_PERMS` | `school.users` | none | effective permissions DTO | `effectivePermissionsFromDto` | Implemented |
| Replace roles | POST | `/api/gateway/school/users/{id}/roles` | `/api/v1/users/{id}/roles` | `ROLE_ASSIGN` | `school.users` | `role_ids` JSON | mutation ack | normalized null result | Implemented |
| Grant permissions | POST | `/api/gateway/school/admin/users/{id}/permissions/grant` | `/api/v1/admin/users/{id}/permissions/grant` | `ADMIN_RBAC_GRANT_PERMISSION` | `school.users` | codes + reason JSON | mutation ack | normalized null result | Implemented |
| Revoke permissions | POST | `/api/gateway/school/admin/users/{id}/permissions/revoke` | `/api/v1/admin/users/{id}/permissions/revoke` | `ADMIN_RBAC_REVOKE_PERMISSION` | `school.users` | codes + reason JSON | mutation ack | normalized null result | Implemented |
| Academic years list | GET | `/api/gateway/school/admin/academic-years?...` | `/api/v1/admin/academic-years` | `ADMIN_ACADEMIC_YEAR_MANAGE` | `school.academics` | query filters | paginated academic years | `mapPaginated + academicYearFromDto` | Implemented |
| Academic year create | POST | `/api/gateway/school/admin/academic-years` | `/api/v1/admin/academic-years` | `ADMIN_ACADEMIC_YEAR_MANAGE` | `school.academics` | year JSON | mutation ack | normalized null result | Implemented |
| Academic year update | PATCH | `/api/gateway/school/admin/academic-years/{id}` | `/api/v1/admin/academic-years/{id}` | `ADMIN_ACADEMIC_YEAR_MANAGE` | `school.academics` | year JSON | mutation ack | normalized null result | Implemented |
| Grades | GET | `/api/gateway/school/grades?...` | `/api/v1/grades` | `GRADE_READ` | `school.academics` | query filters | paginated grades | `mapPaginated + gradeFromDto` | Implemented |
| Classrooms | GET | `/api/gateway/school/classrooms?...` | `/api/v1/classrooms` | `CLASSROOM_READ` | `school.academics` | query filters | paginated classrooms | `mapPaginated + classroomFromDto` | Implemented |
| Subjects | GET | `/api/gateway/school/subjects?...` | `/api/v1/subjects` | `SUBJECT_READ` | `school.academics` | query filters | paginated subjects | `mapPaginated + subjectFromDto` | Implemented |
| Attendance records | GET | `/api/gateway/school/admin/attendance/records?...` | `/api/v1/admin/attendance/records` | `ADMIN_ATTENDANCE_READ` | `school.attendance` | query filters | paginated attendance | `mapPaginated + attendanceRecordFromDto` | Implemented |
| Manual attendance | POST | `/api/gateway/school/admin/attendance/records/manual` | `/api/v1/admin/attendance/records/manual` | `ADMIN_ATTENDANCE_RECORD_MANUAL` | `school.attendance` | attendance JSON | mutation ack | normalized null result | Implemented |
| Attendance update | PATCH | `/api/gateway/school/admin/attendance/records/{id}` | `/api/v1/admin/attendance/records/{id}` | `ADMIN_ATTENDANCE_EDIT` | `school.attendance` | attendance JSON | mutation ack | normalized null result | Implemented |
| Excuses list | GET | `/api/gateway/school/admin/excuses?...` | `/api/v1/admin/excuses` | `ADMIN_EXCUSES_MANAGE` | `school.attendance` | query filters | paginated excuses | `mapPaginated + excuseFromDto` | Implemented |
| Excuse approve | POST | `/api/gateway/school/admin/excuses/{id}/approve` | `/api/v1/admin/excuses/{id}/approve` | `ADMIN_EXCUSES_MANAGE` | `school.attendance` | empty | mutation ack | normalized null result | Implemented |
| Excuse reject | POST | `/api/gateway/school/admin/excuses/{id}/reject` | `/api/v1/admin/excuses/{id}/reject` | `ADMIN_EXCUSES_MANAGE` | `school.attendance` | empty | mutation ack | normalized null result | Implemented |
| QR users | GET | `/api/gateway/school/admin/qr/users?...` | `/api/v1/admin/qr/users` | `QR_REGENERATE` | `school.qr` | query filters | QR list | `qrEntryListFromDto` | Implemented |
| QR regenerate | POST | `/api/gateway/school/admin/qr/*/regenerate` | verified regenerate endpoints | `QR_REGENERATE` | `school.qr` | reason JSON | token payload | inline mapping | Implemented |
| QR revoke | POST | `/api/gateway/school/admin/qr/{id}/revoke` | `/api/v1/admin/qr/{id}/revoke` | `QR_REVOKE` | `school.qr` | reason JSON | mutation ack | normalized null result | Implemented |
| QR rotate year | POST | `/api/gateway/school/admin/qr/rotate-year` | `/api/v1/admin/qr/rotate-year` | `QR_ROTATE_YEAR` | `school.qr` | owner/year JSON | mutation ack | normalized null result | Implemented |
| Documents overview | GET | `/api/gateway/school/admin/documents/overview` | `/api/v1/admin/documents/overview` | `DOCUMENTS_READ` | `school.documents` | none | overview DTO | `documentOverviewFromDto` | Implemented |
| Documents list | GET | `/api/gateway/school/admin/documents?...` | `/api/v1/admin/documents` | `DOCUMENTS_READ` | `school.documents` | query filters | paginated documents | `mapPaginated + documentFromDto` | Implemented |
| Document create | POST | `/api/gateway/school/admin/documents` | `/api/v1/admin/documents` | `DOCUMENTS_CREATE` | `school.documents` | document JSON | mutation ack | normalized null result | Implemented |
| Document detail | GET | `/api/gateway/school/admin/documents/{id}` | `/api/v1/admin/documents/{id}` | `DOCUMENTS_READ` | `school.documents` | none | detail DTO | `documentFromDto` | Implemented |
| Document update | PATCH | `/api/gateway/school/admin/documents/{id}` | `/api/v1/admin/documents/{id}` | `DOCUMENTS_UPDATE` | `school.documents` | document JSON | detail DTO | `documentFromDto` | Implemented |
| Document delete | DELETE | `/api/gateway/school/admin/documents/{id}` | `/api/v1/admin/documents/{id}` | `DOCUMENTS_DELETE` | `school.documents` | none | mutation ack | normalized null result | Implemented |
| Attachments upload | POST | `/api/gateway/school/admin/documents/{id}/attachments` | `/api/v1/admin/documents/{id}/attachments` | `DOCUMENTS_UPDATE` | `school.documents` | multipart form data | mutation ack | normalized null result | Implemented |
| Attachments preview | GET | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/preview` | same backend path | `DOCUMENTS_PREVIEW` | `school.documents` | none | binary/PDF | passthrough | Implemented |
| Attachments download | GET | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/download` | same backend path | `DOCUMENTS_DOWNLOAD` | `school.documents` | none | binary | passthrough | Implemented |
| Mark sent | POST | `/api/gateway/school/admin/documents/{id}/mark-sent` | `/api/v1/admin/documents/{id}/mark-sent` | `OUTGOING_MARK_SENT` | `school.documents` | empty | mutation ack | normalized null result | Implemented |
| Mark received | POST | `/api/gateway/school/admin/documents/{id}/mark-received` | `/api/v1/admin/documents/{id}/mark-received` | `INCOMING_MARK_RECEIVED` | `school.documents` | empty | mutation ack | normalized null result | Implemented |
| Create reply | POST | `/api/gateway/school/admin/documents/{id}/create-reply` | `/api/v1/admin/documents/{id}/create-reply` | `DOCUMENTS_CREATE` | `school.documents` | reply JSON | mutation ack | normalized null result | Implemented |
| Link document | POST | `/api/gateway/school/admin/documents/{id}/link` | `/api/v1/admin/documents/{id}/link` | `DOCUMENTS_LINK` | `school.documents` | relation JSON | mutation ack | normalized null result | Implemented |
| Archive document | POST | `/api/gateway/school/admin/documents/{id}/archive` | `/api/v1/admin/documents/{id}/archive` | `DOCUMENTS_ARCHIVE` | `school.documents` | reason JSON | mutation ack | normalized null result | Implemented |
| Document activity | GET | `/api/gateway/school/admin/documents/{id}/activity?...` | `/api/v1/admin/documents/{id}/activity` | `DOCUMENTS_READ` | `school.documents` | query filters | paginated activity | `mapPaginated + activityFromDto` | Implemented |
| Categories CRUD | GET/POST/PATCH/DELETE | `/api/gateway/school/admin/document-categories*` | `/api/v1/admin/document-categories*` | `DOCUMENTS_MANAGE_CATEGORIES` | `school.documentCategories` | category JSON | paginated/category mutation results | `mapPaginated + categoryFromDto` | Implemented |
| Parties CRUD | GET/POST/PATCH/DELETE | `/api/gateway/school/admin/correspondence-parties*` | `/api/v1/admin/correspondence-parties*` | `DOCUMENTS_MANAGE_PARTIES` | `school.correspondenceParties` | party JSON | paginated/party mutation results | `mapPaginated + partyFromDto` | Implemented |
| School tickets | GET | `/api/gateway/school/admin/tickets?...` | `/api/v1/admin/tickets` | `ADMIN_TICKETS_VIEW` | `school.tickets` | query filters | ticket list | `ticketListFromDto` | Implemented |
| School ticket assign | PATCH | `/api/gateway/school/admin/tickets/{id}/assign` | `/api/v1/admin/tickets/{id}/assign` | `ADMIN_TICKETS_ASSIGN` | `school.tickets` | `assigned_to` JSON | mutation ack | normalized null result | Implemented |
| School ticket close | PATCH | `/api/gateway/school/admin/tickets/{id}/close` | `/api/v1/admin/tickets/{id}/close` | `ADMIN_TICKETS_CLOSE` | `school.tickets` | empty | mutation ack | normalized null result | Implemented |
| School ticket escalate | POST | `/api/gateway/school/admin/tickets/{id}/escalate` | `/api/v1/admin/tickets/{id}/escalate` | `ADMIN_TICKETS_ESCALATE` | `school.tickets` | empty | mutation ack | normalized null result | Implemented |
| School settings | GET/PATCH | `/api/gateway/school/admin/school/settings` | `/api/v1/admin/school/settings` | `ADMIN_SCHOOL_SETTINGS_UPDATE` | `school.settings` | profile/settings JSON | settings DTO | `settingsFromDto` | Implemented |
| Feature flags | PATCH | `/api/gateway/school/admin/school/features` | `/api/v1/admin/school/features` | `ADMIN_FEATURE_FLAGS_MANAGE` | `school.settings` | features JSON | mutation ack | normalized null result | Implemented |
