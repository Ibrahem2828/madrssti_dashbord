# Dashboard API Integration Map

All browser requests use same-origin BFF routes. Backend paths below are relative to the versioned backend API and are **statically integrated**, not runtime-verified.

| Portal | Page / action | BFF route | Backend path | Method | Permission | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Central | session/login | `/api/auth/central/login`, `/api/auth/session` | `central/auth/login`, `central/me` | POST/GET | portal scope | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | session/login/switch | `/api/auth/school/login`, `/api/auth/school/switch-school` | `auth/login`, `me`, `me/switch-school` | POST/GET | portal scope | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| Central | dashboard / health | `/api/gateway/central/*` | `central/dashboard/overview`, `central/dashboard/schools-health`, `health` | GET | Central dashboard/health permissions | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| Central | schools | `/api/gateway/central/central/schools*` | `central/schools`, `{id}`, `activate`, `deactivate` | GET/POST/PATCH | `CENTRAL_SCHOOLS_*` | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| Central | primary administrator | gateway Central | `central/schools/{id}/admin`, `create-admin`, `reset-admin-password` | GET/POST | `CENTRAL_SCHOOL_ADMIN_*` | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| Central | scoped School users/RBAC | gateway Central | `central/schools/{schoolId}/users/*`, `roles`, `permissions`, `effective-permissions`, `activity`, `audit-log` | GET/POST/PATCH | `CENTRAL_SCHOOL_USERS_*`, `CENTRAL_SCHOOL_RBAC_*` | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| Central | tickets / audit / policies | gateway Central | `central/tickets*`, `central/audit`, `central/policies` | GET/POST/PATCH | matching Central permission | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | dashboard / reporting | `/api/gateway/school/*` | `admin/reports/overview`, `dashboard/kpis`, report paths | GET | dashboard/report permissions | PARTIALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | users and RBAC | gateway School | `admin/users*`, `admin/roles`, `admin/permissions`, `users/{id}/roles` | GET/POST/PATCH | `ADMIN_USERS_*`, RBAC permissions | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | academic / attendance | gateway School | `admin/academic-years*`, `admin/attendance/*`, `admin/excuses*`, `admin/qr/*` | GET/POST/PATCH | matching School permission | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | correspondence | gateway School | `admin/documents*`, document actions, activity | GET/POST/PATCH/DELETE | document permissions | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | attachments | gateway School | `admin/documents/{id}/attachments*` | GET/POST | attachment permissions | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | categories / parties | gateway School | `admin/document-categories*`, `admin/correspondence-parties*` | GET/POST/PATCH/DELETE | management permissions | STATICALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |
| School | tickets/settings/notifications | gateway School | `admin/tickets*`, `admin/school/settings`, `notifications*` | GET/POST/PATCH | matching School permission | PARTIALLY INTEGRATED | RUNTIME VERIFICATION REQUIRED |

## Contract handling

- `normalizeResponse` accepts raw JSON and `{success, data}` envelopes.
- `ApiResult<T>` contains either normalized data or a safe code/message/field-error/request-ID failure.
- Binary preview/download responses bypass JSON normalization and retain only approved response headers.
- `404` contract mappings, mutation body shapes, pagination/filter behavior, and per-action error codes require runtime verification.

## Contract uncertainties

The current frontend maps endpoint names from repository endpoint configuration and existing contract artifacts. Any endpoint not explicitly represented in `endpoints.central.ts` or `endpoints.school.ts` is `CONTRACT UNCERTAIN` and is intentionally not exposed as a new functional action.
