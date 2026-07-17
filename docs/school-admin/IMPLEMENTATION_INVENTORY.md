# School Administration Implementation Inventory

Date: 2026-07-16
Repository: `C:\dev\madrasti-dashboard`

## Scope completed in source

- School users list, create flow, and detail experience.
- School RBAC role assignment, direct grant/revoke, and effective permissions display.
- School correspondence overview, detail, attachments, archive, categories, and parties.
- Specialized school correspondence list routes for outgoing, incoming, internal, circulars, and needs-reply.
- Permission-aware navigation entries and serializable icon keys.
- English and Arabic translations for the new school-admin and correspondence UI.
- Static tests covering RBAC registry, endpoint wiring, same-origin client usage, BFF school isolation, and audit-sensitive workflows.

## Files retained and adapted

- `src/features/school/components/documents-screen.tsx`
  - Retained as the shared correspondence overview, create workspace, detail screen, and category/party manager host.
- `src/features/school/components/archive-screen.tsx`
  - Retained for archived records view.
- `src/features/school/services/school-api.ts`
  - Adapted to expose specialized document list fetchers and richer school user/document mappings.
- `src/components/layout/portal-shell.tsx`
  - Adapted for new school-admin breadcrumb labels and icon registry coverage.

## Files newly added in this scope

- `src/features/school/config/profile-types.ts`
- `src/features/school/config/rbac.ts`
- `src/features/school/config/documents.ts`
- `src/features/school/components/document-collection-screen.tsx`
- `src/app/[locale]/(school)/school/users/new/page.tsx`
- `src/app/[locale]/(school)/school/users/[userId]/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/outgoing/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/incoming/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/internal/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/circulars/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/needs-reply/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/new/page.tsx`
- `src/app/[locale]/(school)/school/correspondence/archive/page.tsx`
- `tests/school-admin.test.mjs`

## Compatibility notes

- Legacy `/[locale]/admin/*` routes were preserved.
- Existing portal/session/BFF architecture was retained and reused.
- No browser-to-Django direct calls were introduced.
- No new dependency was added.

## Deferred items

- Authenticated school-account runtime CRUD verification remains pending a legitimate school account.
- Manual responsive QA across all required viewports remains pending staging execution.
- Manual accessibility walkthrough remains pending staging execution.