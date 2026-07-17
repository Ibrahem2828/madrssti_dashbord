# Central and School RBAC Boundaries

## Verified current behavior

Central IT is responsible for the platform-level school relationship. The verified Central API supports only these primary-administrator operations:

- read the assigned primary administrator for a school;
- create one primary administrator for a school;
- reset that primary administrator's password.

`POST /central/schools/{school_id}/create-admin` accepts identity and optional temporary-password fields. It does **not** accept role IDs, permission codes, account activation state, or arbitrary school-user updates. The Dashboard therefore does not fabricate a permission picker in the Central portal.

The school-scoped administration API is the authoritative user-lifecycle surface once the principal has an active school session. It supports a single, server-derived school scope and the following permission-gated actions:

- create and list school users;
- edit approved user fields;
- activate or deactivate another school user;
- reset a user's password with an audit reason;
- replace role assignments using `POST /users/{user_id}/roles`;
- grant or revoke direct permissions with an audit reason;
- view effective permissions.

The Dashboard never passes `X-School-ID` from the browser. The School BFF derives it from the HttpOnly, backend-validated active-school cookie. Central requests never send `X-School-ID`.

## Principal provisioning prerequisite

The current backend creates a `PRINCIPAL` role membership for a newly created primary administrator. It does not, in that same transaction, guarantee that the role has `RolePermission` rows. A principal can therefore authenticate successfully but receive an empty permission list and no visible modules.

Immediate operational remediation for existing schools:

```text
python manage.py seed_permissions
```

Run the command in the backend deployment environment, then wait for the short `/me` cache to expire or sign out and sign in again. This command is idempotent and associates the configured default-role permissions with every school role.

Permanent backend remediation: update `CentralCreateSchoolAdminView` so the same transaction that creates or finds the `PRINCIPAL` role also creates its `RolePermission` entries from the backend's canonical default-role map. The central API must not rely on the frontend to grant those baseline permissions.

## Required API extension for full Central user lifecycle

The desired Central IT workflow—create any school account, select roles or direct permissions, activate/deactivate, edit, and reset password—requires a dedicated **Central-scoped** backend contract. Reusing school-admin routes through the Central gateway would break portal isolation.

Recommended contract family, protected by new exact Central permission codes and fully audited:

| Operation | Recommended Central route |
|---|---|
| list/create school users | `GET` / `POST /central/schools/{school_id}/users` |
| read/update school user | `GET` / `PATCH /central/schools/{school_id}/users/{user_id}` |
| activate/deactivate | `POST /central/schools/{school_id}/users/{user_id}/activate` and `/deactivate` |
| reset password | `POST /central/schools/{school_id}/users/{user_id}/reset-password` |
| replace roles | `PUT /central/schools/{school_id}/users/{user_id}/roles` |
| grant/revoke direct permissions | `POST /central/schools/{school_id}/users/{user_id}/permissions/grant` and `/revoke` |
| inspect effective permissions | `GET /central/schools/{school_id}/users/{user_id}/effective-permissions` |

Each mutation must verify that the target user's membership belongs to the URL school, reject cross-school IDs, require an audit reason for security-sensitive actions, and return a request ID. The Central BFF can then proxy only `/central/*` routes without ever sending school context headers.

## Dashboard behavior after this change

- A successful school `/me` response supplies the active school, roles, and permissions to the sanitized frontend session.
- If `/me` fails, the UI now displays only its safe error code and request reference; it never displays tokens or raw backend errors.
- A principal with no effective permissions sees an explicit role-provisioning state instead of a blank portal.
- A principal with provisioned permissions can manage only users of the active school through the School portal, including activation state, role replacement, direct permission changes, profile edits, and password resets.
