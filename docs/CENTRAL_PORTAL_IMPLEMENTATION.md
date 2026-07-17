# Central Portal Static Implementation

## Scope

The Central portal is isolated under `/[locale]/central/*`, uses the Central session and gateway only, and derives navigation from Central permissions/capabilities. The shared portal shell never renders a School switcher in this portal.

## Implemented workspaces

| Workspace | Static coverage |
| --- | --- |
| Dashboard | overview and School-health data through Central BFF; no fabricated operational widget |
| Schools | list/filter/pagination, create form, detail/edit workspace, activation/deactivation, primary administrator state |
| School administrators | dedicated directory/provisioning workspace with one-school backend contract |
| Scoped School users | list, create, detail, profile edit, roles, direct permission grant/revoke, effective permissions, activation, reset password, activity/audit |
| Tickets | list/detail and authorized assignment/closure actions where supported by endpoint configuration |
| Audit / policies / health | permission-aware screens bound to Central endpoint configuration |

## Route compatibility

- `/[locale]/central/dashboard` redirects to the existing Central dashboard root.
- `/[locale]/central/schools/new` redirects to the existing authorized School catalogue/create workspace.
- `/[locale]/central/schools/[schoolId]/edit` redirects to the existing authorized School detail/edit workspace.

These adapters avoid duplicate screens and preserve an explicit route contract while current forms remain owned by their existing feature screens.

## Authorization and data handling

- Navigation and screen actions use exact `CENTRAL_*` permissions, not translated roles.
- The Central School-user UI takes `schoolId` only as a Central resource path. The BFF never adds a School context header for Central traffic, and backend authorization is responsible for the final tenant check.
- Sensitive actions use permission gates, confirmation/reason inputs where implemented, server-derived request IDs, safe errors, and one-time temporary-password disclosure.

## Static limitations

Backend fields such as user counts, last activity, and every ticket/policy action are only shown when supplied by the existing contract. Browser rendering, permission responses, and mutation behavior are deferred to Phase 2.
