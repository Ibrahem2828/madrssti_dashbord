# Madrasti Dashboard — Phase 2 Security Verification

## Scope and evidence model

This report records only checks actually performed in the canonical local repository (`C:\dev\madrasti-dashboard`). It does not claim authenticated, tenant, or staging security scenarios that require designated non-production accounts and records.

## Verified controls

| Control | Method | Result |
| --- | --- | --- |
| Backend configuration stays server-side | Source scan: no `NEXT_PUBLIC_BACKEND_*`, `NEXT_PUBLIC_API_*`, or backend domain in `src` | PASS |
| Browser token storage | Source scan: no `localStorage` or `sessionStorage` use in `src` | PASS |
| Token cookies | Reviewed `src/lib/auth/cookies.ts`: access, refresh, portal, and active-school cookies are `HttpOnly`, `SameSite=Lax`, `Path=/`, bounded, and use environment-derived `Secure` | PASS (source review) |
| CSRF cookie | Reviewed `src/lib/auth/csrf.ts`: non-HttpOnly double-submit token, `SameSite=Lax`, `Path=/`, bounded lifetime, and environment-derived `Secure` | PASS (source review) |
| Missing CSRF is rejected | Production BFF POST probe | PASS — `403 CSRF_TOKEN_MISSING` with request ID |
| Untrusted Origin is rejected | Production BFF POST probe | PASS — `403 ORIGIN_NOT_ALLOWED` with request ID |
| Invalid credentials reach backend safely | Production Central and School BFF probes with a deliberately non-existent account | PASS — each returned `401 AUTH_FAILED`; no token text in response |
| Session payload sanitization | Production `GET /api/auth/session` while unauthenticated | PASS — `200`, `authenticated:false`, no access/refresh-token text |
| Forged browser auth / tenant headers | Production unauthenticated Central and School gateway probes included forged `Authorization` and `X-School-ID` headers | PASS — both returned `401 AUTHENTICATION_REQUIRED`; no token text; request IDs present |
| Central/School gateway separation | Unit/static regression test and gateway source review | PASS — School path blocks `central`; School ID is derived only from the server-managed session; Central never sets `X-School-ID` |
| Request tracing | Production gateway failure probes after repair | PASS — both gateway errors include an API-body request ID and `X-Request-ID` header; upstream IDs are preserved when supplied |
| Open redirects | Middleware/protected-route runtime redirects use an encoded internal `next` path | PASS for unauthenticated portal redirects; authenticated redirect paths remain unverified |

## Security repair completed

### P1-SEC-01 — BFF failures omitted request identifiers

- **Symptom:** unauthenticated Central and School gateway responses returned `401 AUTHENTICATION_REQUIRED` without `requestId`.
- **Root cause:** `proxyGateway` generated its request ID only after the authentication and path checks.
- **Fix:** generate one BFF request ID at gateway entry; include it on authentication, path, CSRF, transport, unexpected-error, and pass-through responses. Preserve an upstream request ID when the backend sends one.
- **Files:** `src/lib/api/gateway.ts`, `tests/auth-bff.test.mjs`.
- **Verification:** TypeScript PASS, lint PASS, tests PASS (36/36), clean production build PASS, and production Central/School gateway probes both returned `401` with `requestId`.
- **Final status:** FIXED.

## Static review findings

- `next/font/google` is absent from `src`.
- No direct backend production domain is present in `src`.
- No Client Component was found importing the server environment module in the inspected API/client path; existing tests assert School browser calls use the same-origin BFF.
- No tokens, cookies, passwords, or authorization values were printed by Phase 2 probes. Temporary cookie jars and request bodies were removed after each probe.

## Not yet verified

| Scenario | Status | Reason |
| --- | --- | --- |
| Valid Central login, refresh, logout, expiry, and portal mismatch | BLOCKED | No designated Central test credentials were supplied. |
| Valid School login, inactive membership/school, active-school switching, and cross-portal session denial | BLOCKED | No designated School test credentials or test school were supplied. |
| Cross-tenant IDOR, forged IDs after authentication, attachment authorization, and cache isolation | BLOCKED | Requires School A/B fixtures and explicit permission to use them. |
| Secure cookie behavior on HTTPS staging | NOT EXECUTED | Local runtime intentionally uses HTTP and `AUTH_COOKIE_SECURE=false`; staging access was not supplied. |
| Browser devtools exposure, CSP/header policy, screen-reader behavior | PARTIAL | Source/runtime HTTP checks were possible; no browser automation or assistive-technology harness is configured. |

## Conclusion

The unauthenticated BFF security boundary is verified locally. The remaining security release gate is authenticated end-to-end testing with isolated, disposable test tenants and staging HTTPS configuration.
