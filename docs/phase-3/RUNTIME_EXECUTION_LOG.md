# Phase 3 runtime execution log

## Canonical repository

- Date: `2026-07-14`
- Workspace: `C:\dev\madrasti-dashboard`

## Command log

| Order | Category | Command / action | Result | Notes |
|---|---|---|---|---|
| 1 | Repository control | Confirmed canonical path, resolved `package.json` and `.env.local`, stopped only `C:\dev\madrasti-dashboard` Node processes | Completed | Old B-drive repo was not modified. |
| 2 | Source inspection | Reviewed backend transport, auth routes, CSRF/origin helpers, login form, health route, verifier, gateway, and session code | Completed | Isolated timeout/status mapping work before runtime reruns. |
| 3 | Source edits | Added shared backend timeout/classification module and refactored login/health/refresh/logout/switch-school/gateway/session usage | Completed | Centralized auth timeout policy and backend failure mapping. |
| 4 | Tests (pre-clean) | `npm run typecheck`, `npm run lint`, `npm test` | Completed | All passed after code repair. |
| 5 | Clean baseline | Deleted only `.next`, ran `npm ci` once | Completed | Install succeeded; advisories remained in transitive dependencies. |
| 6 | Tests (post-clean) | `npm run typecheck`, `npm run lint`, `npm test` | Completed | Passed again after clean install. |
| 7 | Production build | `npm run build` | Completed | Standalone output generated successfully. |
| 8 | Production runtime | `npm start` | Completed | Runtime served local routes and `/api/health` returned `200`. |
| 9 | Backend health runtime | `GET /api/health/backend?diagnostic=1` | Completed | Returned `502` with direct native fetch, builder-derived fetch, and shared helper all timing out against the backend origin. |
| 10 | Direct host comparison | `node -e fetch(...)`, `curl.exe`, `Invoke-WebRequest`, `Resolve-DnsName`, `Test-NetConnection` | Completed | DNS and TCP 443 succeeded; HTTPS application requests still timed out or reset from this host. |
| 11 | Auth runtime | Local BFF login checks with valid Origin + valid CSRF | Completed | Central and School invalid login returned `504 BACKEND_TIMEOUT`, not `403`. |
| 12 | Security runtime | Missing / invalid Origin and CSRF cases | Completed | Returned structured `403` protection failures with request IDs. |
| 13 | Docker gate | `docker --version`, `docker build ...` | Completed | CLI exists; daemon unavailable, so build/run are blocked externally. |

## Differential connectivity conclusion

The BFF transport helper and direct native fetch no longer diverge. Both now fail the same way from this host:

- direct runtime fetch -> `UND_ERR_CONNECT_TIMEOUT`
- direct shell `node -e fetch` -> `UND_ERR_CONNECT_TIMEOUT`
- `curl.exe` -> connection reset
- `Invoke-WebRequest` -> timeout

This means the current blocker is not URL construction, auth endpoint mapping, or timeout-to-status translation inside the frontend code.