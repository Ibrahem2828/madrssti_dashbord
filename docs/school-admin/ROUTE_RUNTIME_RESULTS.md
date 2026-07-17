# Route Runtime Results

Date: 2026-07-16
Mode: local production runtime via `npm run start`

## Verified local routes

| Route | Result |
|---|---|
| `GET /ar/login` | `200` |
| `GET /en/login/central` | `200` |
| `GET /api/health` | `200` |
| `GET /api/auth/session` | `200` |
| `GET /api/health/backend` | `200` |
| `GET /en/school/users` without auth | `307` → `/en/login/school?next=%2Fen%2Fschool%2Fusers` |
| `GET /en/school/correspondence/outgoing` without auth | `307` → `/en/login/school?next=%2Fen%2Fschool%2Fcorrespondence%2Foutgoing` |

## Not yet verified in this environment

- Authenticated school login with a legitimate school account.
- Authenticated user CRUD.
- Authenticated role assignment, grant, revoke, and reset-password flows.
- Authenticated correspondence CRUD, reply, link, archive, and attachment operations.