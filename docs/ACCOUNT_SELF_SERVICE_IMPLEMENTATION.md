# Account self-service implementation

## Scope

Every authenticated Dashboard user can open **Manage account** from the shared portal user menu. The dialog supports:

- Updating their own full name, email address, and phone number.
- Changing their own password only after providing the current password and confirming the new password.

No user can select another account ID, school ID, portal, role, permission, or account-status field through this feature.

## Verified backend contract

The local Django source was inspected before implementation:

| Function | Backend route | Method | Request fields |
| --- | --- | --- | --- |
| School self-profile read/update | `/api/v1/me` | `GET`, `PATCH` | `full_name`, `email`, `phone` |
| Central self-profile read/update | `/api/v1/central/me` | `GET`, `PATCH` | `full_name`, `email`, `phone` |
| Change own password | `/api/v1/auth/change-password` | `POST` | `old_password`, `new_password` |

The backend checks `old_password` with `user.check_password`. A mismatch returns `400 CURRENT_PASSWORD_INVALID`; the new password is never written to logs, audit metadata, browser storage, or documentation.

## Browser-to-backend flow

```text
Browser
  -> GET/PATCH /api/account/profile
  -> POST /api/account/change-password
  -> Next.js validates Origin + CSRF and reads HttpOnly session cookies
  -> Django /me or /central/me, or /auth/change-password
  -> sanitized JSON response only
```

Client Components call only same-origin `/api/account/*` routes. The access token, refresh token, authorization header, backend origin, and school context remain server-side.

## Password-change behavior

After a successful password change, the BFF attempts to revoke the current backend refresh session, clears all Dashboard authentication cookies, and returns `reauthenticationRequired:true`. The UI refreshes its sanitized session and redirects the user to localized sign-in. This prevents the old browser session from continuing after a password change.

## Audit and cache behavior

- School profile updates create a `self_profile_update` audit event in the resolved school context.
- Central profile updates create a `central_self_profile_update` audit event.
- School `/me` cache entries for the current user are invalidated for every membership after a profile update.

## Deliberate exclusions

- Roles, permissions, memberships, active-school selection, account activation, and user type are not self-service fields.
- Backend password policy is not invented by the Dashboard; server validation remains authoritative.
- Runtime authentication tests require approved non-production credentials and were not performed by this implementation pass.
