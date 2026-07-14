# Phase 2B static inventory

## Inputs inspected

The Phase 2B pass was grounded in these source areas and authoritative prior-phase documents:

- `docs/phase-1/*`
- `docs/phase-2a/*`
- `src/app/[locale]/(central)`
- `src/app/[locale]/(school)`
- `src/app/api`
- `src/features/central`
- `src/features/school`
- `src/components/*`
- `src/config/*`
- `src/hooks/*`
- `src/lib/*`
- `src/providers/*`
- `src/i18n/*`
- `src/styles/*`
- `src/contexts/*`
- `src/app/[locale]/admin/*`
- `src/components/reports/*`
- Verified local backend source for notifications and report endpoints

## Phase 2A modules already implemented

Central portal:

- Dashboard and school health
- Schools CRUD-adjacent flows in scope for frontend: list, create, detail, edit, activate, deactivate
- Principal state, creation, and password reset
- Central tickets
- Audit
- Policies

School portal:

- Dashboard
- Users, roles, explicit permissions, effective permissions
- Academic years, grades, classrooms, subjects
- Attendance, excuses, QR administration
- Correspondence documents, categories, parties, and attachments
- Tickets
- Settings

Shared foundation:

- Same-origin BFF and gateways
- HttpOnly cookie session model
- Locale-aware shells and semantic theme tokens
- Permission and capability catalogs
- Shared table/form helpers

## Incomplete or partially polished journeys before Phase 2B

Before this pass, the repository still had the following product gaps:

- No active notification center route surfaced through the School portal
- No dedicated reports hub wired to verified report endpoints
- No dedicated archive workspace for archived correspondence records
- Active shell patterns were inconsistent across forms, filters, cards, tables, and feedback
- Legacy `/[locale]/admin/*` routes were still reachable and some pointed to mock-heavy experiences
- `src/components/reports/*` still contained legacy mock/random report components outside the modern shell
- Shared product shell lacked a command palette and some topbar affordances
- English/Arabic message catalogs were incomplete for the 2B features
- Arabic message file had mixed encoding damage in several lower sections
- User menu behavior and some topbar interactions needed stronger accessibility semantics

## Duplicate or inconsistent frontend systems identified

The audit found these overlap areas:

- `src/components/data/data-table.tsx` and business-page tables in feature screens
- `src/components/layout/product-framework.tsx` versus legacy ad hoc cards and section wrappers
- `src/components/shared/toast.tsx` versus older lightweight feedback usage
- `src/providers/app-providers.tsx` versus compatibility provider entry points
- `src/contexts/AuthContext.tsx` and `src/contexts/SchoolContext.tsx` as legacy adapters over the Phase 1 canonical provider

Phase 2B kept the compatibility entry points, but standardized active business routes on the canonical 2B component set.

## Remaining legacy routes and files

Legacy route group retained but removed from active navigation:

- `/[locale]/admin`
- `/[locale]/admin/attendance`
- `/[locale]/admin/correspondence`
- `/[locale]/admin/reports`
- `/[locale]/admin/users`
- `/[locale]/admin/points`
- `/[locale]/admin/halaqat`

Legacy report source retained but not used by active portal navigation:

- `src/components/reports/attendance-analytics.tsx`
- `src/components/reports/behavioral-at-risk.tsx`
- `src/components/reports/halaqat-progress-report.tsx`
- `src/components/reports/sharia-leaderboard.tsx`
- `src/components/reports/export-templates/*`

## Remaining mock and random behavior found during audit

Static search still found `Math.random()` only inside retained legacy report/export components under `src/components/reports/*`.

No active 2B business route uses:

- fake KPI values
- fake report IDs
- fake notification counts
- fake school identity
- fake user identity
- fake upload progress

## Backend-supported features surfaced in Phase 2B

Verified and promoted into active UX during this phase:

- School notifications list and mark-read workflow
- School reports overview endpoint
- School KPI report endpoint
- Attendance report endpoint
- Points report endpoint
- Behavior report endpoint
- At-risk students endpoint
- Archived document workspace using real `ARCHIVED` status filtering

## Backend limitations intentionally preserved

Unsupported capabilities were hidden rather than invented:

- Notification realtime streaming
- Global entity search across business records
- Backend-generated PDF exports for reports
- Archive restore
- Retention/disposal/legal-hold flows
- Archive-specific metadata beyond what document detail/activity exposes
- Bulk mutation APIs for users, documents, tickets, or reports
- Saved server-side views/preferences for filters

## Performance and architecture risks carried into Phase 3

- Many business screens still use direct `useEffect` + fetch orchestration rather than a single shared query abstraction
- Some heavy feature files remain large and should be type-checked/runtime-reviewed in Phase 3
- Legacy adapter files remain present for compile-time safety and should be pruned only after route/runtime validation
- Because runtime execution is deferred, multipart upload, binary preview/download, and browser print still require dedicated verification

## Security and quality risks reviewed

No new architecture was introduced. The static audit specifically rechecked:

- same-origin browser communication only
- no direct Django calls from client components
- no browser token persistence
- no new dependency installation
- no `next/font/google`
- no weakened CSRF/origin protections in the active 2B code paths

## Phase 2B implementation plan applied

1. Standardize the shared product framework and top-level UI primitives.
2. Complete archive, reports, and notifications using verified backend contracts only.
3. Retire legacy `/admin` routes from active journeys and convert ambiguous ones to notices/redirects.
4. Fix translation coverage and Arabic encoding integrity.
5. Tighten shell UX, navigation, accessibility semantics, and print behavior.
6. Prepare substantive Phase 2B and Phase 3 documentation.
