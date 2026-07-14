# Route runtime results

## Canonical runtime

- Repository: `C:\dev\madrasti-dashboard`
- Production runtime command: `npm start`
- Local runtime PID: recorded during execution; current runtime served from `.next/standalone/server.js`

## Verified route status table

| Route | Auth state | Result | Status | Redirect / request ID | Notes |
|---|---|---|---|---|---|
| `/ar/login` | public | `200` | PASS | - | Arabic public login selector renders. |
| `/en/login/central` | public | `200` | PASS | - | English Central login page renders. |
| `/en/login/school` | public | `200` | PASS | - | English School login page renders. |
| `/api/health` | n/a | `200` | PASS | - | Runtime service health ok. |
| `/api/auth/session` | unauthenticated | `200` | PASS | - | Payload is sanitized and token-free. |
| `/en/central` | unauthenticated | `307` | PASS | `/en/login/central?next=%2Fen%2Fcentral` | Protected Central route redirects safely. |
| `/en/school` | unauthenticated | `307` | PASS | `/en/login/school?next=%2Fen%2Fschool` | Protected School route redirects safely. |
| `/ar/central` | unauthenticated | `307` | PASS | `/ar/login/central?next=%2Far%2Fcentral` | Arabic Central redirect verified. |
| `/ar/school` | unauthenticated | `307` | PASS | `/ar/login/school?next=%2Far%2Fschool` | Arabic School redirect verified. |
| `/api/health/backend` | n/a | `502` | BLOCKED | root diag request `f3a03887-862e-45ee-8bf7-5dc6cafce73f` | Backend transport times out before any upstream HTTP response. |
| `/api/auth/central/login` | valid Origin + valid CSRF + invalid credentials | `504` | BLOCKED | `76c04211-03da-4f29-a9f3-cce090038ba1` | Reaches transport layer correctly; cannot yet reach backend HTTP response from this host. |
| `/api/auth/school/login` | valid Origin + valid CSRF + invalid credentials | `504` | BLOCKED | `9d508eca-8ef1-4a74-a3f1-57aa79a9d83f` | Same transport blocker as Central. |

## Protection-layer route checks

| Case | Result | Request ID |
|---|---|---|
| Missing Origin | `403 ORIGIN_MISSING` | `ed1e0a46-a208-4ba5-a772-c48d5934b8c9` |
| Invalid Origin | `403 ORIGIN_NOT_ALLOWED` | `6126c069-0eb9-490a-b5aa-6315152a0995` |
| Missing CSRF header | `403 CSRF_TOKEN_MISSING` | `7019c55a-7669-402d-bf26-1ecd8d6fb6b1` |
| Missing CSRF cookie | `403 CSRF_TOKEN_MISSING` | `9f9d0254-42f5-4d89-95e3-219e41b39888` |
| Mismatched CSRF | `403 CSRF_TOKEN_MISMATCH` | `0bf45ce0-df2b-4a29-b2ba-289c15e4ee2e` |

## Remaining blocked route groups

The following route groups still require a working backend HTTP path plus valid authenticated sessions before they can be marked PASS:

- `/[locale]/central/**` after successful Central login
- `/[locale]/school/**` after successful School login
- all authenticated Central and School module routes that depend on backend API data
- all workflow routes involving mutations, uploads, downloads, and permission-filtered actions