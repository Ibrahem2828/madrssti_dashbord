# Phase 2A static inventory

## Scope audited

The repository was inspected statically across:

- `src/app/[locale]/(central)` and `src/app/[locale]/(school)`
- `src/app/api/auth/*` and `src/app/api/gateway/*`
- `src/config/*`
- `src/features/central/*`
- `src/features/school/*`
- `src/lib/api/*`
- `src/lib/auth/*`
- `src/providers/*`
- `src/components/*`
- `src/i18n/messages/*`
- retained legacy `/[locale]/admin/*` pages and shared legacy components

No runtime command, build, linter, typecheck, test, browser preview, or network request was executed.

## Phase 1 architecture detected

The repository already contains the Phase 1 foundation:

- locale-aware App Router structure under `src/app/[locale]`
- separate Central and School portal shells
- same-origin auth and gateway route handlers
- HttpOnly cookie session model
- permission-aware session provider
- bilingual `next-intl` messages
- semantic theme foundation
- legacy compatibility adapters for auth and school session access

## Business modules detected before Phase 2A completion

Phase 2A work targeted these verified business areas:

- Central dashboard
- Central schools
- Central school detail and principal lifecycle
- Central tickets
- Central audit
- Central policies
- Central health
- School dashboard
- School users, roles, permissions, and effective permissions
- School academic setup
- School attendance, excuses, and QR foundations
- School correspondence, categories, parties, documents, attachments, and activity
- School tickets
- School settings

## Verified backend contracts and endpoints

Verified directly from the sibling backend source tree `B:\schools\mishkat_backend`:

### Central

- `GET /api/v1/central/dashboard/overview`
- `GET /api/v1/central/dashboard/schools-health`
- `GET /api/v1/health`
- `GET|POST /api/v1/central/schools`
- `GET|PATCH /api/v1/central/schools/{id}`
- `POST /api/v1/central/schools/{id}/activate`
- `POST /api/v1/central/schools/{id}/deactivate`
- `GET /api/v1/central/schools/{id}/admin`
- `POST /api/v1/central/schools/{id}/create-admin`
- `POST /api/v1/central/schools/{id}/reset-admin-password`
- `GET /api/v1/central/tickets`
- `GET /api/v1/central/tickets/{id}`
- `PATCH /api/v1/central/tickets/{id}/assign`
- `PATCH /api/v1/central/tickets/{id}/close`
- `GET /api/v1/central/audit`
- `GET|PATCH /api/v1/central/policies`

### School

- `GET /api/v1/admin/reports/overview`
- `GET /api/v1/dashboard/kpis`
- `GET|POST|PATCH /api/v1/admin/users*` related lifecycle endpoints
- `GET /api/v1/admin/roles`
- `GET /api/v1/admin/permissions`
- `GET|POST|PATCH /api/v1/admin/academic-years*`
- `GET /api/v1/grades`
- `GET /api/v1/classrooms`
- `GET /api/v1/subjects`
- `GET|POST|PATCH /api/v1/admin/attendance/records*`
- `GET /api/v1/admin/excuses`
- `POST /api/v1/admin/excuses/{id}/approve`
- `POST /api/v1/admin/excuses/{id}/reject`
- `GET /api/v1/admin/qr/users`
- `POST /api/v1/admin/qr/students/{id}/regenerate`
- `POST /api/v1/admin/qr/teachers/{id}/regenerate`
- `POST /api/v1/admin/qr/staff/{id}/regenerate`
- `POST /api/v1/admin/qr/{id}/revoke`
- `POST /api/v1/admin/qr/rotate-year`
- `GET /api/v1/admin/documents/overview`
- `GET|POST /api/v1/admin/documents`
- `GET|PATCH|DELETE /api/v1/admin/documents/{id}`
- `GET|POST /api/v1/admin/documents/{id}/attachments`
- `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/download`
- `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/preview`
- `POST /api/v1/admin/documents/{id}/mark-sent`
- `POST /api/v1/admin/documents/{id}/mark-received`
- `POST /api/v1/admin/documents/{id}/create-reply`
- `POST /api/v1/admin/documents/{id}/link`
- `POST /api/v1/admin/documents/{id}/archive`
- `GET /api/v1/admin/documents/{id}/activity`
- `GET|POST|PATCH|DELETE /api/v1/admin/document-categories*`
- `GET|POST|PATCH|DELETE /api/v1/admin/correspondence-parties*`
- `GET /api/v1/admin/tickets`
- `PATCH /api/v1/admin/tickets/{id}/assign`
- `PATCH /api/v1/admin/tickets/{id}/close`
- `POST /api/v1/admin/tickets/{id}/escalate`
- `GET|PATCH /api/v1/admin/school/settings`
- `PATCH /api/v1/admin/school/features`

## Unverified or intentionally unsupported in Phase 2A

- school ticket detail endpoint: not verified, not implemented
- central ticket timeline/comments: not verified, not implemented
- document search modal for related-document selection: backend list exists, dedicated search selector flow not added; current flow uses verified related document ID
- advanced report builder and analytics: intentionally excluded from Phase 2A

## Security and architecture risks found during audit

- legacy retained reports still contain `Math.random()` and fake values; they are outside the new portal navigation and documented for later removal
- the workspace contains an empty `.git` directory; `git status` and `git diff` inspection were attempted but repository metadata was unavailable
- some retained legacy UI components still carry hardcoded Arabic-only presentation and historical design tokens; they are not linked from the new Phase 2A navigation

## Files retained and adapted

- `src/providers/auth-provider.tsx`: retained as the canonical session provider
- `src/contexts/SchoolContext.tsx`: retained as a compatibility adapter backed by the sanitized session
- `src/services/apiClient.ts`: retained as same-origin gateway client, not a direct Django client
- legacy `/[locale]/admin/*` routes: retained for migration safety, removed from the new portal navigation
- legacy shared components under `src/components/shared/*`: retained selectively; only safe shared utilities were adjusted

## Files deprecated but not deleted

- retained `/[locale]/admin/*` pages
- retained legacy report/export components under `src/components/reports/*`
- retained legacy dashboard widgets not mounted in the new Central or School portals

## Translation and enum review

Phase 2A added or completed message coverage for:

- Central tickets, health, schools, policies, and audit
- School dashboard, users, academics, attendance, tickets, settings, and documents
- exact backend enum labels for status, priority, direction, document type, relation type, party type, QR owner type, and document activity actions
- confirmation prompts for sensitive mutations

## Runtime verification explicitly deferred to Phase 3

Static inspection cannot confirm:

- TypeScript compilation
- Next.js route resolution
- backend availability
- gateway refresh behavior
- multipart upload behavior in a live browser
- exact translation rendering at runtime
- final responsive behavior in a browser viewport
