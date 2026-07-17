# Users and RBAC

## Implemented UX

- Backend-driven users list with URL-synchronized filters.
- Create-user workspace with password confirmation, teacher-code rule, and backend field-error mapping.
- User detail screen with profile summary, account-security section, activation/deactivation controls, role replacement, permission catalog, and effective permissions.
- Password reset dialog requiring explicit confirmation and audit reason.

## Security and permission rules

- No token exposure in the client layer.
- Role replacement uses backend IDs, not translated labels, through the school-scoped replacement contract.
- Activation and deactivation are server-authorized, school-scoped actions; the signed-in account cannot deactivate itself through the UI.
- Direct permission grant/revoke requires an audit reason.
- Effective permissions are displayed from the sanitized backend result.

## Static evidence

- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm test` PASS
- Build route output includes:
  - `/[locale]/school/users`
  - `/[locale]/school/users/new`
  - `/[locale]/school/users/[userId]`

## Runtime evidence available

- Unauthenticated `/en/school/users` returns `307` to `/en/login/school?next=%2Fen%2Fschool%2Fusers`.

## Remaining runtime requirement

- Real school-account CRUD verification remains pending a legitimate school session.
