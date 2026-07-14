# School portal completion

## Implemented routes

- `/[locale]/school`
- `/[locale]/school/users`
- `/[locale]/school/academic`
- `/[locale]/school/attendance`
- `/[locale]/school/correspondence`
- `/[locale]/school/correspondence/[documentId]`
- `/[locale]/school/correspondence/categories`
- `/[locale]/school/correspondence/parties`
- `/[locale]/school/tickets`
- `/[locale]/school/settings`

## Implemented modules

### Dashboard

Backed by:

- `GET /api/v1/admin/reports/overview`
- `GET /api/v1/dashboard/kpis`
- `GET /api/v1/admin/documents/overview`

Static characteristics:

- real metrics only
- KPI keys normalized to localized labels
- documents overview uses the dedicated overview endpoint
- capability gate: `school.dashboard`

### Users, roles, permissions, and effective permissions

Backed by:

- `GET|POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}`
- `POST /api/v1/admin/users/{id}/reset-password`
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/permissions`
- `GET /api/v1/admin/users/{id}/effective-permissions`
- `POST /api/v1/admin/users/{id}/roles`
- `POST /api/v1/admin/users/{id}/permissions/grant`
- `POST /api/v1/admin/users/{id}/permissions/revoke`

Static characteristics:

- server-driven list
- create and edit forms
- password reset action
- role assignment action with confirmation
- explicit permission grant and revoke with confirmation
- effective-permission viewer
- capability gate: `school.users`

### Academic setup

Backed by:

- `GET|POST /api/v1/admin/academic-years`
- `PATCH /api/v1/admin/academic-years/{id}`
- `GET /api/v1/grades`
- `GET /api/v1/classrooms`
- `GET /api/v1/subjects`

Static characteristics:

- academic year CRUD foundation
- grade, classroom, and subject listings
- server-driven search and pagination for years
- capability gate: `school.academics`

### Attendance, excuses, and QR

Backed by:

- `GET /api/v1/admin/attendance/records`
- `POST /api/v1/admin/attendance/records/manual`
- `PATCH /api/v1/admin/attendance/records/{id}`
- `GET /api/v1/admin/excuses`
- `POST /api/v1/admin/excuses/{id}/approve`
- `POST /api/v1/admin/excuses/{id}/reject`
- `GET /api/v1/admin/qr/users`
- `POST /api/v1/admin/qr/students/{id}/regenerate`
- `POST /api/v1/admin/qr/teachers/{id}/regenerate`
- `POST /api/v1/admin/qr/staff/{id}/regenerate`
- `POST /api/v1/admin/qr/{id}/revoke`
- `POST /api/v1/admin/qr/rotate-year`

Static characteristics:

- attendance list with server filters
- manual attendance form
- attendance record edit flow
- pending excuses table with approve and reject actions
- QR owner list
- QR regenerate, revoke, and rotate-year actions
- exact enum labels for attendance and QR states
- capability gates: `school.attendance`, `school.qr`

### Correspondence

Backed by the document, category, party, and attachment endpoints described in `CORRESPONDENCE_MODULE.md`.

Static characteristics:

- document overview cards
- document list with server filters and pagination
- document create form using exact verified enum values
- document detail/edit route
- attachment upload, preview, and download through the same-origin gateway
- dedicated mark-sent, mark-received, reply, link, and archive actions
- category CRUD
- party CRUD
- capability gates:
  - `school.documents`
  - `school.documentCategories`
  - `school.correspondenceParties`

### School tickets

Backed by:

- `GET /api/v1/admin/tickets`
- `PATCH /api/v1/admin/tickets/{id}/assign`
- `PATCH /api/v1/admin/tickets/{id}/close`
- `POST /api/v1/admin/tickets/{id}/escalate`

Static characteristics:

- list screen
- status filter
- assign, close, and escalate actions
- confirmation on close and escalate
- exact status and priority labels
- capability gate: `school.tickets`

### School settings

Backed by:

- `GET|PATCH /api/v1/admin/school/settings`
- `PATCH /api/v1/admin/school/features`

Static characteristics:

- school profile form
- feature-flags form
- save confirmation
- capability gate: `school.settings`

## School scope behavior

- active school comes from the server-managed session
- school switching stays in `/api/auth/school/switch-school`
- the browser never provides trusted school context directly to Django
- the School gateway can attach `X-School-ID` only from the validated cookie/session context

## Permission behavior

The School portal uses exact backend permission codes, including:

- `ADMIN_USERS_READ`
- `ADMIN_USERS_CREATE`
- `ADMIN_USERS_UPDATE`
- `ADMIN_USERS_RESET_PASSWORD`
- `ADMIN_RBAC_ROLES_READ`
- `ADMIN_RBAC_PERMS_READ`
- `ADMIN_RBAC_VIEW_EFFECTIVE_PERMS`
- `ADMIN_RBAC_ASSIGN_ROLE`
- `ADMIN_RBAC_GRANT_PERMISSION`
- `ADMIN_RBAC_REVOKE_PERMISSION`
- `ADMIN_ACADEMIC_YEAR_MANAGE`
- `ADMIN_ATTENDANCE_READ`
- `ADMIN_ATTENDANCE_RECORD_MANUAL`
- `ADMIN_ATTENDANCE_EDIT`
- `ADMIN_EXCUSES_MANAGE`
- `QR_REGENERATE`
- `QR_REVOKE`
- `QR_ROTATE_YEAR`
- `DOCUMENTS_READ`
- `DOCUMENTS_CREATE`
- `DOCUMENTS_UPDATE`
- `DOCUMENTS_DELETE`
- `DOCUMENTS_ARCHIVE`
- `DOCUMENTS_DOWNLOAD`
- `DOCUMENTS_PREVIEW`
- `DOCUMENTS_LINK`
- `DOCUMENTS_MANAGE_CATEGORIES`
- `DOCUMENTS_MANAGE_PARTIES`
- `OUTGOING_MARK_SENT`
- `INCOMING_MARK_RECEIVED`
- `ADMIN_TICKETS_VIEW`
- `ADMIN_TICKETS_ASSIGN`
- `ADMIN_TICKETS_CLOSE`
- `ADMIN_TICKETS_ESCALATE`
- `ADMIN_SCHOOL_SETTINGS_UPDATE`
- `ADMIN_FEATURE_FLAGS_MANAGE`

## Remaining backend or UX limitations

- no verified school ticket detail endpoint
- related-document link flow currently uses verified document ID entry instead of a dedicated search modal
- retained legacy report modules are not part of the new School navigation and remain scheduled for later migration
