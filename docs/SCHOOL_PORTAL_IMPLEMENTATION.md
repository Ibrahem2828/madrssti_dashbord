# School Portal Static Implementation

## Scope and isolation

School administration is rooted at `/[locale]/school/*`. `SchoolPortalGate` waits for the sanitized School session/context and distinguishes safe session failure states. The active School is backend-derived, stored server-side, and forwarded by the School BFF only; School pages do not take a trusted School ID from a URL, local storage, or browser header.

## Implemented workspaces

| Workspace | Static coverage |
| --- | --- |
| Dashboard | permission-aware dashboard and available overview/KPI services |
| Users and RBAC | list/filter/mobile cards, create/detail/edit, role replacement, direct permissions, effective permissions, reset/enable/disable actions |
| Academics | academic-year, grade, classroom, and subject services/screens where contracts exist |
| Attendance | records, manual actions, excuse decisions, and QR lifecycle service coverage |
| Tickets | list and authorized ticket actions |
| Settings | school settings and feature flag workspace |
| Notifications/reports | permission-aware routes bound to existing endpoint maps |

## Compatibility routes

- `/[locale]/school/dashboard` redirects to the current School dashboard root.
- `/[locale]/school/roles` and `/[locale]/school/permissions` redirect to the existing authorized user/RBAC workspace, which owns per-user role and permission actions.

The adapters avoid exposing a fabricated global role CRUD flow when the current verified endpoint map only supports the existing School user/RBAC contract.

## Access model

The School shell filters navigation by exact effective permissions and declared capability support. Direct access remains subject to feature-level forbidden/session states and backend authorization. Central sessions cannot enter the School portal.

## Deferred verification

School membership state, disabled School behavior, active-School switching, role/effective-permission response shapes, and all School mutations require Phase 2 runtime verification.
