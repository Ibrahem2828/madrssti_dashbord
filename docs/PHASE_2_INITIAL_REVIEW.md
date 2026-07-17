# Madrasti Dashboard — Phase 2 Initial Review

## Scope extracted from Phase 1

Every entry in the Phase 1 API map is `RUNTIME VERIFICATION REQUIRED`. The following areas are marked `PARTIALLY INTEGRATED` and require heightened validation:

1. School dashboard and reporting endpoints.
2. School tickets, settings, and notifications endpoints.

No current Phase 1 document marks an active workflow as `NOT IMPLEMENTED` or `PLACEHOLDER`. Unmapped endpoint names and response shapes remain `CONTRACT UNCERTAIN` and must not be treated as working before evidence is captured.

## Routes requiring runtime coverage

| Priority | Area | Routes |
| --- | --- | --- |
| P0 | Auth and session | `/[locale]/login`, `/login/central`, `/login/school`, `/api/auth/csrf`, `/api/auth/session`, `/api/auth/refresh`, `/api/auth/logout` |
| P0 | Portal separation | `/[locale]/central/*`, `/[locale]/school/*`, legacy `/[locale]/admin/*` |
| P0 | BFF | `/api/gateway/central/[...path]`, `/api/gateway/school/[...path]` |
| P1 | Central | dashboard, schools, school administrators, scoped school users/RBAC, tickets, audit, policies, health |
| P1 | School | dashboard, users/RBAC, attendance, academics, tickets, settings, notifications, reports |
| P1 | Correspondence | list collections, create/detail/edit, category/party, archive, attachment preview/download |
| P0 | Security | CSRF/origin, HttpOnly cookie behavior, no browser tokens, no cross-portal or cross-tenant access |
| P2 | UX | Arabic/English, RTL/LTR, light/dark, responsive layouts, keyboard/dialog behavior |

## Backend endpoints to prove

- Central login/session/dashboard/schools/School users/RBAC/tickets/audit/policies/health.
- School login/session/switch-school/users/RBAC/attendance/academics/documents/categories/parties/tickets/settings/notifications/reports.
- Attachment multipart, binary preview/download, and error response paths.

## Critical assumptions to prove

1. `BACKEND_BASE_URL` and `API_BASE_URL` resolve to the same reachable backend origin/version.
2. Central and School login request/response contracts match their BFF mappers.
3. Cookies are set with the intended production/development attributes and tokens never reach JavaScript.
4. CSRF/origin checks block forged unsafe requests while allowing valid same-origin BFF requests.
5. A School user receives a backend-derived active School, and BFF ignores forged School headers.
6. Central user management and School RBAC actions enforce tenant boundaries on the backend.
7. Correspondence binary responses preserve safe content headers without exposing the backend origin or authorization.

## Risk and test priority

| Severity | Risk | Evidence required |
| --- | --- | --- |
| P0 | authentication, portal mismatch, token exposure, CSRF/origin bypass, tenant leakage | BFF integration, authenticated browser tests, direct forged-request tests |
| P1 | Central/School user lifecycle, RBAC, correspondence/attachments, route errors | test-account workflow coverage and normalized error assertions |
| P2 | translation, responsive behavior, dialog/focus, theme contrast | browser viewport and keyboard review |
| P3 | existing Node module warning, legacy code style, non-blocking cleanup | classified output and regression assessment |

## Verification order

1. Capture environment/toolchain and repository state.
2. Install locked dependencies and record output.
3. Typecheck, lint, unit tests, then production build.
4. Start one local runtime instance and capture startup logs.
5. Verify unauthenticated BFF/health/CSRF/session behavior.
6. Run authenticated Central and School checks only with provided test accounts.
7. Validate tenant isolation and state-changing workflows only against explicitly designated test data.
8. Run browser, responsive, accessibility, performance, and staging checks where authorized.

## Constraint

No valid Central or School test credentials, test-school identifiers, or staging authorization have been supplied in the repository or request. Authenticated mutation, cross-tenant, attachment, and staging scenarios are therefore initially `BLOCKED` pending safe test credentials/data or explicit authorization.
