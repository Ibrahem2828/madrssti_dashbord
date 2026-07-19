# Phase 2 baseline

## Current routes

The App Router exposes locale-prefixed public, central, school, legacy admin, and same-origin API routes. Central includes dashboard, health, schools, school administrators, school users, tickets, audit, and policies. School includes dashboard, users/RBAC, academics, attendance, correspondence collections and detail workflows, archive, reports, notifications, tickets, and settings. Route-level loading and error boundaries exist for both portal groups.

## Current components and features

- One responsive portal shell: sidebar, mobile drawer, breadcrumbs, command palette, user menu, locale/theme controls, and school switcher.
- Shared design-system primitives and shared page/CRUD composition utilities.
- Permission and capability filtering for navigation and protected feature actions.
- Same-origin BFF, session, CSRF, response normalization, request IDs, and DTO mapping.
- Correspondence attachments, preview/download, reply, archive, and activity workflows; central school and ticket workflows; school users, attendance, academics, reports, notifications, and settings.

## Current APIs

Official endpoint definitions remain in `src/config/endpoints.central.ts`, `src/config/endpoints.school.ts`, and the BFF route handlers. Browser code calls the central or school gateway via `browserApi`; it does not embed a backend origin or mock data.

## Current risks and limitations

1. The configured upstream backend previously timed out before returning HTTP, so authenticated runtime validation cannot be evidenced from this workspace.
2. Playwright was added, but Chromium download exceeded this environment's timeout. E2E execution is therefore pending browser provisioning.
3. No dedicated disposable test identities or fixture-reset workflow is configured; destructive E2E cases remain intentionally disabled.
4. `npm audit --omit=dev` is clean for production dependencies. The install-time audit reported six findings in the wider dependency tree (two moderate, four high); these require dev-tooling triage, and no automatic force upgrade was applied.
5. Student, teacher, guardian, import, and restore flows are not verified because current official route/API coverage does not expose all of them.
