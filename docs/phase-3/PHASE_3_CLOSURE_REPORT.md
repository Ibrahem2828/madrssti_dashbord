# Phase 3 closure report

## Final phase status

PHASE 3 NOT CLOSED
CRITICAL RELEASE BLOCKERS REMAIN

## Summary

The current repair pass closed the frontend-side timeout and status-mapping defects that were still under the dashboard's control:

- backend auth timeout handling is now centralized
- backend transport failures no longer fall back to `403`
- invalid backend response handling is normalized
- login, health, refresh, gateway, session, and verifier logic now share the same timeout policy
- login protection still enforces Origin and CSRF correctly
- production build and local production runtime both pass in the canonical repository

The remaining blocker is external to the repaired frontend code: from the current verification host, direct HTTPS requests to the backend origin time out or reset before any backend HTTP response is received.

## Quality gate summary

| Gate | Result |
|---|---|
| `npm ci` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS |
| `npm run build` | PASS |
| `npm run start` | PASS |
| `/api/health` | PASS |
| `/api/auth/session` (unauthenticated) | PASS |
| Public login routes | PASS |
| Unauthenticated protected-route redirects | PASS |
| `/api/health/backend` | FAIL |
| Central invalid login (valid Origin + valid CSRF) | FAIL |
| School invalid login (valid Origin + valid CSRF) | FAIL |
| Central valid login | BLOCKED |
| School valid login | BLOCKED |
| Authenticated dashboards | BLOCKED |
| Critical workflows | BLOCKED |
| Responsive QA | BLOCKED |
| Accessibility QA | BLOCKED |
| Docker build/run | BLOCKED |

## External blocker evidence

- DNS resolves backend host -> `76.13.155.172`
- TCP `443` succeeds
- `Invoke-WebRequest` to backend root times out
- `curl.exe` to backend root resets the connection
- direct `node -e fetch(...)` to backend root and Central login endpoint returns `UND_ERR_CONNECT_TIMEOUT`
- Next.js runtime direct fetch and shared helper return the same timeout classification

## Current recommendation

Phase 3 should remain open until the verification host can receive a real backend HTTP response from `https://api.madrasti.xn--mgbaab0cxheq.tech`, and until authenticated Central and School test accounts are verified in that working environment.