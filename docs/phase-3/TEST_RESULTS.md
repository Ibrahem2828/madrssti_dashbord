# Phase 3 test results

## Canonical repository

- Repository: `C:\dev\madrasti-dashboard`
- Date: `2026-07-14`

## Clean quality gates

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | PASS | Completed successfully after removing only `.next`. |
| `npm run typecheck` | PASS | `tsc --noEmit` exited `0` before and after `npm ci`. |
| `npm run lint` | PASS | `next lint` exited `0` with no warnings or errors. |
| `npm test` | PASS | Focused auth/BFF regression suite passed `13/13`. |
| `npm run build` | PASS | Production build completed successfully and generated standalone output. |
| `npm run start` | PASS | Standalone production runtime started and served local routes. |

## Runtime route gate

| Check | Result | Evidence |
|---|---|---|
| `GET /api/health` | PASS | `200` with `{"success":true,"data":{"status":"ok"}}` |
| `GET /api/auth/session` (unauthenticated) | PASS | `200` with sanitized token-free session payload |
| `GET /ar/login` | PASS | `200` |
| `GET /en/login/central` | PASS | `200` |
| `GET /en/login/school` | PASS | `200` |
| `GET /en/central` unauthenticated | PASS | `307` -> `/en/login/central?next=%2Fen%2Fcentral` |
| `GET /en/school` unauthenticated | PASS | `307` -> `/en/login/school?next=%2Fen%2Fschool` |
| `GET /ar/central` unauthenticated | PASS | `307` -> `/ar/login/central?next=%2Far%2Fcentral` |
| `GET /ar/school` unauthenticated | PASS | `307` -> `/ar/login/school?next=%2Far%2Fschool` |
| `GET /api/health/backend` | FAIL | `502` with all backend probes classified as transport timeouts from this host |

## Authentication and protection runtime checks

| Check | Result | HTTP status | Code | Request ID |
|---|---|---|---|---|
| Central invalid login with valid Origin + valid CSRF | FAIL (external blocker) | `504` | `BACKEND_TIMEOUT` | `76c04211-03da-4f29-a9f3-cce090038ba1` |
| School invalid login with valid Origin + valid CSRF | FAIL (external blocker) | `504` | `BACKEND_TIMEOUT` | `9d508eca-8ef1-4a74-a3f1-57aa79a9d83f` |
| Login without `Origin` | PASS | `403` | `ORIGIN_MISSING` | `ed1e0a46-a208-4ba5-a772-c48d5934b8c9` |
| Login with invalid `Origin` | PASS | `403` | `ORIGIN_NOT_ALLOWED` | `6126c069-0eb9-490a-b5aa-6315152a0995` |
| Login without CSRF header (controlled Node request) | PASS | `403` | `CSRF_TOKEN_MISSING` | `7019c55a-7669-402d-bf26-1ecd8d6fb6b1` |
| Login without CSRF cookie | PASS | `403` | `CSRF_TOKEN_MISSING` | `9f9d0254-42f5-4d89-95e3-219e41b39888` |
| Login with mismatched CSRF | PASS | `403` | `CSRF_TOKEN_MISMATCH` | `0bf45ce0-df2b-4a29-b2ba-289c15e4ee2e` |

## Differential connectivity evidence

| Probe | Result |
|---|---|
| Next.js runtime direct native fetch to backend root | `504 BACKEND_TIMEOUT`, cause `UND_ERR_CONNECT_TIMEOUT` |
| Next.js runtime builder-derived native fetch | `504 BACKEND_TIMEOUT`, cause `UND_ERR_CONNECT_TIMEOUT` |
| Next.js runtime shared helper fetch | `504 BACKEND_TIMEOUT`, helper abort at configured timeout |
| Direct `node -e fetch(...)` from same host and repo path | `UND_ERR_CONNECT_TIMEOUT` |
| Direct `curl.exe` from same host | connection reset |
| `Invoke-WebRequest` direct to backend root | operation timed out |
| DNS resolution | PASS -> `76.13.155.172` |
| TCP `443` | PASS |

## Notes

- The focused Node test suite emits a non-fatal `MODULE_TYPELESS_PACKAGE_JSON` warning because the retained in-repo JS helper modules use ESM syntax without a package-level `type` field. This did not fail the suite.
- Valid Central login, valid School login, authenticated dashboards, workflow verification, responsive browser QA, and manual accessibility QA remain blocked until backend HTTPS requests from this host stop timing out and valid School credentials are available in a working environment.