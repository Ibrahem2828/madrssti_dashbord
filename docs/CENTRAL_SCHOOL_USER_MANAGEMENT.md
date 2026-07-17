# Central school user management

## Goal

Provide Central IT with a tenant-isolated way to administer only the users of a school selected in the Central route. The browser never switches to a School session or submits `X-School-ID`.

## Architecture

```text
Central browser session
  -> /api/gateway/central/central/schools/{schoolId}/users/...
  -> Next.js Central gateway (HttpOnly Central JWT, Origin + CSRF validation)
  -> Django /api/v1/central/schools/{schoolId}/users/...
  -> school-scoped membership, RBAC, PermissionOverride and AuditLog records
```

`schoolId` is an URL UUID, not a browser cookie or request header. Django loads the school, then looks up the target user through `SchoolMembership` constrained to that school. A user in another school therefore receives `USER_NOT_FOUND_IN_SCHOOL` rather than data from the other tenant.

## Contract map

| Operation | Contract | Method | Permission |
| --- | --- | --- | --- |
| List or create users | `central/schools/{schoolId}/users` | GET, POST | `CENTRAL_SCHOOL_USERS_READ`, `CENTRAL_SCHOOL_USERS_CREATE` |
| View or update basic fields | `.../users/{userId}` | GET, PATCH | `CENTRAL_SCHOOL_USERS_READ`, `CENTRAL_SCHOOL_USERS_UPDATE` |
| Enable/disable | `.../enable`, `.../disable` | POST | `CENTRAL_SCHOOL_USERS_ENABLE_DISABLE` |
| Reset password | `.../reset-password` | POST | `CENTRAL_SCHOOL_USERS_RESET_PASSWORD` |
| Roles catalog / replacement | `.../roles`, `.../users/{userId}/roles` | GET, PUT | `CENTRAL_SCHOOL_RBAC_ROLES_READ`, `CENTRAL_SCHOOL_RBAC_ASSIGN_ROLE` |
| Add/remove roles | `.../roles/assign`, `.../roles/remove` | POST | `CENTRAL_SCHOOL_RBAC_ASSIGN_ROLE`, `CENTRAL_SCHOOL_RBAC_REMOVE_ROLE` |
| Permission catalog | `.../permissions` | GET | `CENTRAL_SCHOOL_RBAC_PERMISSIONS_READ` |
| Effective permissions | `.../effective-permissions` | GET | `CENTRAL_SCHOOL_RBAC_VIEW_EFFECTIVE_PERMISSIONS` |
| Direct permission overrides | `.../permissions/grant`, `.../permissions/revoke` | POST | `CENTRAL_SCHOOL_RBAC_GRANT_PERMISSION`, `CENTRAL_SCHOOL_RBAC_REVOKE_PERMISSION` |
| User audit and activity | `.../activity`, `.../audit-log` | GET | `CENTRAL_SCHOOL_USER_ACTIVITY_READ`, `CENTRAL_SCHOOL_USER_AUDIT_READ` |

List filters are server-side: `q`, `status`, `role`, `has_direct_permissions`, `ordering`, `page`, and `page_size`.

## Permission and audit policy

- All Central endpoints have a Central RBAC permission class and explicitly reject non-Central users.
- Role IDs are looked up in the selected school only.
- Direct permissions with a `CENTRAL_` prefix and unknown permission codes are rejected.
- Disable, password reset, permission grant/revoke, and sensitive role removal require a reason where applicable.
- Every mutation writes an `AuditLog` scoped to the selected school. `X-Request-ID` is retained in the safe audit metadata; passwords and authorization values are never audited.
- Password responses contain a generated temporary password only once. Submitted manual passwords are not returned.
- Global account disable/enable/password operations are rejected for multi-school users to prevent cross-tenant impact.
- The last active school administrator cannot be disabled or stripped of its final principal role.
- Central requests to explicit School Admin paths and School requests to `CENTRAL_*` paths fail with distinct portal-isolation codes; the legacy Central ticket compatibility endpoint remains available to Central IT.

## Frontend routes

- `/[locale]/central/schools/[schoolId]/users`
- `/[locale]/central/schools/[schoolId]/users/new`
- `/[locale]/central/schools/[schoolId]/users/[userId]`
- Direct tab routes: `edit`, `roles`, `permissions`, and `activity`

The school detail page links to the directory only when `CENTRAL_SCHOOL_USERS_READ` is present. The directory independently loads the verified school record to show its name, code, and activation state; failure to read that optional context never replaces a successful user directory response. The interface uses BFF requests through `browserApi("central", ...)`, sends same-origin CSRF protection, and has no backend URL or token access.

## Error contract

Important application codes: `SCHOOL_NOT_FOUND`, `USER_NOT_FOUND_IN_SCHOOL`, `ROLE_NOT_FOUND_IN_SCHOOL`, `PERMISSION_NOT_ALLOWED_FOR_SCHOOL_USER`, `CROSS_TENANT_ACCESS_DENIED`, `CANNOT_REMOVE_LAST_SCHOOL_ADMIN`, and `REASON_REQUIRED`. Transport failures remain normalized by the shared BFF as 502/503/504 without exposing backend credentials or URLs.

## Verification and rollback

Run backend tests for `apps.central.tests`, then frontend typecheck, lint, tests, and build. Seed the newly added Central permission codes using `python manage.py seed_permissions` after deploying Django code. A full backend suite and `python manage.py check --deploy` remain release gates; see the implementation report for their current result.

Rollback is additive: remove the Central route exposure and frontend navigation first; no migration is introduced by this module. Existing School portal routes are unchanged.
