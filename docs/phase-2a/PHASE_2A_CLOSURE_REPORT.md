# 1. Phase status

PHASE 2A STATIC IMPLEMENTATION COMPLETE  
RUNTIME VERIFICATION DEFERRED TO PHASE 3

## 2. Executive summary

Phase 2A completed the core Central and School business integration on top of the Phase 1 BFF/security foundation. The new portal architecture now contains verified backend-connected screens for Central dashboard, health, schools, tickets, audit, and policies, and for School dashboard, users, academic setup, attendance, QR, correspondence, tickets, and settings. Exact backend permissions and verified endpoint capabilities were integrated into the new routes, with same-origin gateway-only traffic preserved.

## 3. Central Portal completion

Completed:

- Central dashboard using real overview and school-health endpoints
- Central health screen using `/health` plus school-health summary
- Central schools list with server-side search, status filtering, and pagination
- Central school creation
- Central school detail and profile update
- Central school activation and deactivation with confirmation
- Principal state inspection
- Principal creation
- Principal password reset with protected temporary password disclosure
- Central tickets list and detail
- Ticket assignment and close actions
- Central audit list with server-side filtering
- Central policies read and update flows
- Capability gates and permission gates across Central screens

## 4. School Portal completion

Completed:

- School dashboard using real reports overview, KPI, and documents overview endpoints
- Users list with server-side pagination and filters
- User creation, edit, and password reset
- Roles list and assignment
- Permissions catalog
- Effective permissions view
- Explicit permission grant and revoke flows
- Academic years create/update/list
- Grades, classrooms, and subjects listings
- Attendance records list
- Manual attendance creation
- Attendance update
- Excuse approval and rejection
- QR user foundation, regeneration, revoke, and yearly rotation
- School tickets list with assign, close, and escalate
- School settings profile and feature flag foundations
- Capability gates and permission gates across School screens

## 5. Correspondence completion

Completed:

- Documents overview, list, filters, and pagination
- Document creation with exact verified enums
- Document detail and editable metadata subset
- Attachment upload
- Attachment preview via gateway
- Attachment download via gateway
- Mark sent
- Mark received
- Create reply
- Link documents
- Archive via dedicated endpoint with required reason
- Delete via verified detail endpoint
- Activity timeline
- Document categories CRUD
- Correspondence parties CRUD
- Exact backend direction, status, type, priority, relation, and party enums localized for display

## 6. Shared platform improvements

- expanded typed capability registry
- centralized Central and School endpoint catalogs
- centralized DTO mappers
- same-origin browser API client hardened for network and abort failures
- reusable query, mutation, pagination, URL-state, debounce, and async-action hooks
- shared table foundation components
- shared form primitives
- localized enum presentation layer
- confirmation coverage for sensitive mutations
- no direct browser-to-Django calls in migrated modules
- no token persistence in `localStorage` or `sessionStorage`

## 7. Files added

### Documentation

- `docs/phase-2a/STATIC_INVENTORY.md`
- `docs/phase-2a/API_INTEGRATION_MAP.md`
- `docs/phase-2a/CENTRAL_PORTAL.md`
- `docs/phase-2a/SCHOOL_PORTAL.md`
- `docs/phase-2a/CORRESPONDENCE_MODULE.md`
- `docs/phase-2a/LEGACY_MIGRATION_MAP.md`
- `docs/phase-2a/PHASE_2A_CLOSURE_REPORT.md`

### Central business layer

- `src/features/central/services/central-api.ts`
- `src/features/central/types/contracts.ts`
- `src/features/central/mappers/central.ts`
- `src/app/[locale]/(central)/central/health/page.tsx`
- `src/app/[locale]/(central)/central/tickets/[ticketId]/page.tsx`

### School business layer

- `src/features/school/services/school-api.ts`
- `src/features/school/types/contracts.ts`
- `src/features/school/mappers/school.ts`
- `src/features/school/components/common.tsx`
- `src/features/school/components/dashboard-screen.tsx`
- `src/features/school/components/users-screen.tsx`
- `src/features/school/components/academic-screen.tsx`
- `src/features/school/components/attendance-screen.tsx`
- `src/features/school/components/documents-screen.tsx`
- `src/features/school/components/tickets-screen.tsx`
- `src/features/school/components/settings-screen.tsx`
- `src/app/[locale]/(school)/school/academic/page.tsx`
- `src/app/[locale]/(school)/school/tickets/page.tsx`
- `src/app/[locale]/(school)/school/settings/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/categories/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/parties/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/[documentId]/page.tsx`

### Shared frontend foundation

- `src/config/capabilities.ts`
- `src/lib/presentation/domain-enums.ts`
- `src/hooks/use-async-action.ts`
- `src/hooks/use-paginated-query.ts`
- `src/hooks/use-url-search-state.ts`
- `src/components/forms/form-primitives.tsx`
- `src/components/forms/index.ts`

## 8. Files modified

### Core platform

- `src/lib/api/browser-client.ts`: safer error handling, preserved same-origin gateway usage
- `src/lib/api/normalize-response.ts`: normalized wrapped and legacy backend payloads
- `src/lib/utils.ts`: removed random ID generation in shared utility code
- `src/components/feedback/states.tsx`: added structured unsupported-state handling
- `src/components/data/data-table.tsx`: expanded table foundation
- `src/hooks/use-api-query.ts`: abort-safe query handling
- `src/hooks/use-api-mutation.ts`: stricter mutation wrapper

### Configuration and i18n

- `src/config/endpoints.central.ts`
- `src/config/endpoints.school.ts`
- `src/config/navigation.central.ts`
- `src/config/navigation.school.ts`
- `src/config/permissions.ts`
- `src/i18n/messages/en.json`
- `src/i18n/messages/ar.json`

### Central screens

- `src/features/central/components/central-screens.tsx`
- `src/app/[locale]/(central)/central/page.tsx`
- `src/app/[locale]/(central)/central/schools/page.tsx`
- `src/app/[locale]/(central)/central/schools/[schoolId]/page.tsx`
- `src/app/[locale]/(central)/central/tickets/page.tsx`
- `src/app/[locale]/(central)/central/audit/page.tsx`
- `src/app/[locale]/(central)/central/policies/page.tsx`

### School screens

- `src/app/[locale]/(school)/school/page.tsx`
- `src/app/[locale]/(school)/school/users/page.tsx`
- `src/app/[locale]/(school)/school/attendance/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/page.tsx`

### Compatibility and legacy-safe adjustments

- `src/components/shared/toast.tsx`: removed random toast IDs
- `src/components/correspondence/attachment-uploader.tsx`: removed random upload progress
- `src/components/auth/login-form.tsx`: portal-safe identifier handling
- `src/components/layout/portal-shell.tsx`: shell cleanup and safer typing

## 9. Files deprecated but retained

- retained `/[locale]/admin/*` routes
- retained legacy report/export components under `src/components/reports/*`
- retained legacy shared/dashboard widgets outside new portal navigation
- retained compatibility adapters under `src/contexts/*` and older service entry points where still referenced

## 10. API integration map summary

Implemented endpoint groups:

- Central dashboard, health, schools, school admin lifecycle, tickets, audit, policies
- School dashboard, users, RBAC, academics, attendance, excuses, QR, correspondence, tickets, settings
- attachment preview and download through same-origin gateway passthrough
- all implemented endpoint mappings are documented in `docs/phase-2a/API_INTEGRATION_MAP.md`

## 11. Static review findings

Static inspection results:

- `rg -n 'https?://' src` returned no hardcoded backend domains in `src`
- `rg -n 'localStorage|sessionStorage' src` returned no token storage usage
- `rg -n 'next/font/google' src` returned no imports
- `rg -n 'Math\.random' src\features\central src\features\school` returned no migrated-module usage
- `rg -n 'Math\.random' src\components\shared src\components\correspondence` returned no shared/migrated usage
- remaining `Math.random()` occurrences exist only in retained legacy report/export components outside the new navigation
- `fetch(` inspection showed browser-facing code uses same-origin auth/session/gateway routes only
- Central and School route groups were confirmed under `src/app/[locale]/(central)/central` and `src/app/[locale]/(school)/school`
- Git status/diff inspection was attempted, but the workspace `.git` directory does not contain repository metadata, so Git could not report status or diffs in this environment

## 12. Static acceptance matrix

| ID | Status | Evidence |
|---|---|---|
| P2A-CENTRAL-01 | PASS | `CentralDashboardScreen` uses verified overview and schools-health services |
| P2A-CENTRAL-02 | PASS | `fetchCentralSchools` + paginated table flow |
| P2A-CENTRAL-03 | PASS | search query forwarded through `centralEndpoints.schools.list(query)` |
| P2A-CENTRAL-04 | PASS | list filters persisted with URL search params |
| P2A-CENTRAL-05 | PASS | create form posts to `POST /central/schools` |
| P2A-CENTRAL-06 | PASS | `/central/schools/[schoolId]` route implemented |
| P2A-CENTRAL-07 | PASS | detail form patches school profile |
| P2A-CENTRAL-08 | PASS | activate action posts to dedicated endpoint |
| P2A-CENTRAL-09 | PASS | deactivate action posts to dedicated endpoint |
| P2A-CENTRAL-10 | PASS | admin state loaded from `/schools/{id}/admin` |
| P2A-CENTRAL-11 | PASS | principal create form implemented |
| P2A-CENTRAL-12 | PASS | principal password reset implemented |
| P2A-CENTRAL-13 | PASS | temporary password stays only in component state |
| P2A-CENTRAL-14 | PASS | Central tickets list and detail implemented |
| P2A-CENTRAL-15 | PASS | Central audit route implemented |
| P2A-CENTRAL-16 | PASS | Central policies read/update implemented |
| P2A-CENTRAL-17 | PASS | Central screens gate actions with exact permissions |
| P2A-CENTRAL-18 | PASS | Central screens use `hasCapability(...)` |
| P2A-CENTRAL-19 | PASS | Phase 1 gateway logic still attaches `X-School-ID` only for School portal |
| P2A-CENTRAL-20 | PASS | no fake Central KPIs or mock entities rendered |
| P2A-SCHOOL-01 | PASS | School dashboard uses real overview/KPI/documents endpoints |
| P2A-SCHOOL-02 | PASS | user list uses paginated backend response |
| P2A-SCHOOL-03 | PASS | user creation implemented |
| P2A-SCHOOL-04 | PASS | user edit implemented |
| P2A-SCHOOL-05 | PASS | user password reset implemented |
| P2A-SCHOOL-06 | PASS | roles list implemented |
| P2A-SCHOOL-07 | PASS | permissions list implemented |
| P2A-SCHOOL-08 | PASS | effective permissions implemented |
| P2A-SCHOOL-09 | PASS | role assignment implemented |
| P2A-SCHOOL-10 | PASS | permission grant implemented |
| P2A-SCHOOL-11 | PASS | permission revoke implemented |
| P2A-SCHOOL-12 | PASS | academic years implemented |
| P2A-SCHOOL-13 | PASS | grades list implemented |
| P2A-SCHOOL-14 | PASS | classrooms list implemented |
| P2A-SCHOOL-15 | PASS | subjects list implemented |
| P2A-SCHOOL-16 | PASS | attendance records implemented |
| P2A-SCHOOL-17 | PASS | manual attendance implemented |
| P2A-SCHOOL-18 | PASS | excuse approval implemented |
| P2A-SCHOOL-19 | PASS | excuse rejection implemented |
| P2A-SCHOOL-20 | PASS | QR users foundation implemented |
| P2A-SCHOOL-21 | PASS | school tickets implemented on verified endpoints |
| P2A-SCHOOL-22 | PASS | school settings implemented on verified endpoints |
| P2A-SCHOOL-23 | PASS | school context remains server-managed via session/cookies |
| P2A-SCHOOL-24 | PASS | School screens use permission checks |
| P2A-SCHOOL-25 | PASS | School screens use capability checks |
| P2A-SCHOOL-26 | PASS | no fake School business data in migrated screens |
| P2A-DOC-01 | PASS | document list uses real API |
| P2A-DOC-02 | PASS | document list uses paginated backend response |
| P2A-DOC-03 | PASS | filters are server-driven |
| P2A-DOC-04 | PASS | overview uses `/admin/documents/overview` |
| P2A-DOC-05 | PASS | document create implemented |
| P2A-DOC-06 | PASS | document detail implemented |
| P2A-DOC-07 | PASS | document update implemented |
| P2A-DOC-08 | PASS | delete action implemented under permission gate |
| P2A-DOC-09 | PASS | attachments list implemented in detail route |
| P2A-DOC-10 | PASS | PDF upload implemented through multipart form data |
| P2A-DOC-11 | PASS | preview uses `gatewayHref("school", ...)` |
| P2A-DOC-12 | PASS | download uses `gatewayHref("school", ...)` |
| P2A-DOC-13 | PASS | mark-sent implemented |
| P2A-DOC-14 | PASS | mark-received implemented |
| P2A-DOC-15 | PASS | create-reply implemented |
| P2A-DOC-16 | PASS | link-document implemented |
| P2A-DOC-17 | PASS | archive uses dedicated archive endpoint |
| P2A-DOC-18 | PASS | archive reason required before mutation |
| P2A-DOC-19 | PASS | activity timeline implemented |
| P2A-DOC-20 | PASS | categories CRUD implemented |
| P2A-DOC-21 | PASS | parties CRUD implemented |
| P2A-DOC-22 | PASS | exact backend enum values verified and used |
| P2A-DOC-23 | PASS | totals come from overview endpoint, not first-page inference |
| P2A-DOC-24 | PASS | no random upload progress in migrated/shared correspondence flow |
| P2A-DOC-25 | PASS | no backend URL is exposed in rendered document links |
| P2A-SHARED-01 | PASS | endpoint strings centralized in `endpoints.central.ts` and `endpoints.school.ts` |
| P2A-SHARED-02 | PASS | DTO mapping centralized in `src/features/*/mappers/*` |
| P2A-SHARED-03 | PASS | normalized API failures preserve `fieldErrors` |
| P2A-SHARED-04 | PASS | request IDs preserved in `ApiFailure` and normalized responses |
| P2A-SHARED-05 | PASS | paginated result foundation exists in hooks and table components |
| P2A-SHARED-06 | PASS | URL-backed filters implemented across migrated lists |
| P2A-SHARED-07 | PASS | shared form primitives added under `src/components/forms/*` |
| P2A-SHARED-08 | PASS | shared data table foundation expanded under `src/components/data/data-table.tsx` |
| P2A-SHARED-09 | PASS | no new dependency was added |
| P2A-SHARED-10 | PASS | `package-lock.json` was not edited in this implementation pass |
| P2A-SHARED-11 | PASS | browser code uses same-origin endpoints only |
| P2A-SHARED-12 | PASS | no token storage in `localStorage` |
| P2A-SHARED-13 | PASS | no token storage in `sessionStorage` |
| P2A-SHARED-14 | PASS | no unsafe mutation auto-retry added |
| P2A-SHARED-15 | PASS | no `Math.random()` in migrated modules |
| P2A-SHARED-16 | PASS | migrated strings and enum labels exist in `ar.json` and `en.json` |
| P2A-SHARED-17 | PASS | Arabic RTL architecture remains intact statically |
| P2A-SHARED-18 | PASS | English LTR architecture remains intact statically |
| P2A-SHARED-19 | PASS | light theme support retained from Phase 1 |
| P2A-SHARED-20 | PASS | dark theme support retained from Phase 1 |
| P2A-SHARED-21 | PASS | mobile-aware layouts and card/table variations exist |
| P2A-SHARED-22 | PASS | accessibility work includes labels, confirmations, semantic tables, and localized status text |
| P2A-SHARED-23 | PASS | legacy pages retained and not destructively deleted |
| P2A-SHARED-24 | PASS | Phase 2A documentation set completed |

## 13. Known assumptions and backend limitations

- the backend source tree was used as the authoritative contract source
- no school ticket detail endpoint was verified, so only list/assign/close/escalate was implemented
- no central ticket comments or timeline endpoint was verified
- no restore/archive-reversal endpoint was verified for correspondence
- retained legacy report/export components still contain historical mock/random logic but are outside the new portal navigation and documented for later removal
- Git status/diff output could not be produced because the workspace `.git` metadata is absent in this environment

## 14. Runtime verification deferred

The following commands should be run in Phase 3 and were not executed here:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## 15. Repository operations performed

- Repository files were inspected.
- Source files were edited.
- Route trees were inspected.
- Source text searches were executed.
- Documentation files were created and updated.
- Git status/diff inspection was attempted, but repository metadata was unavailable in the provided workspace.
- No dependency installation was executed.
- No development server was started.
- No build was executed.
- No compiler was executed.
- No linter was executed.
- No test was executed.
- No browser preview was opened.
- No network request was made.
- No deployment was executed.

## 16. Recommended commit message

`feat(frontend): complete phase 2a central and school business integration`
