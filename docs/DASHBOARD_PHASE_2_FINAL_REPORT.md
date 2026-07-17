# Madrasti Dashboard — Phase 2 Final Report

## Final status

**IMPLEMENTED AND PARTIALLY VERIFIED**

The local build, production startup, unauthenticated BFF boundary, negative authentication paths, and production asset delivery were verified. This is **not** a production-readiness approval: valid Central/School accounts, disposable tenant fixtures, browser automation, and staging authorization were not available, so authenticated business flows and tenant isolation could not be claimed.

## 1. Executive summary

Phase 2 began by reviewing the Phase 1 documents and creating the runtime risk inventory. Locked dependencies installed successfully; TypeScript, lint, tests, and optimized production builds passed. Two real production-runtime defects were found and repaired:

1. Standalone HTML was served while all referenced static CSS/JavaScript assets returned 404.
2. Early BFF gateway errors omitted a request identifier.

The backend health route, direct connectivity verifier, CSRF, Origin validation, sanitized session response, portal redirects, invalid Central/School authentication, asset delivery, and unauthenticated gateway behavior were all exercised against the running local production server.

## 2. Environment and repository state

| Item | Result |
| --- | --- |
| Canonical repository | `C:\dev\madrasti-dashboard` |
| Node.js | `v20.19.6` |
| npm | `11.16.0` |
| Package manager | npm (from `package-lock.json` and package scripts) |
| Backend API base | Configured server-side at the approved HTTPS origin with `/api/v1` |
| Local app origin | `http://localhost:3000` for controlled local testing |
| Staging | Not available / not executed |
| Repository cleanliness | Large pre-existing dirty worktree retained; no reset, discard, or destructive Git operation was used |

## 3. Commands actually executed

| Command / action | Actual result |
| --- | --- |
| `npm ci` | PASS — 413 packages installed; npm reported 6 dependency vulnerabilities (2 moderate, 4 high), deprecation notices, and one pending install-script approval. No audit fix or lockfile rewrite was run. |
| `npm run typecheck` | PASS (re-run after each production-code repair). |
| `npm run lint` | PASS — no ESLint warnings or errors. |
| `npm test` | PASS — final run: 36 tests, 36 passed, 0 failed. |
| `npm run build` | PASS — final optimized Next.js 14.2.35 build completed in approximately 113 seconds. |
| `npm run start` | PASS — one local standalone production server was started at port 3000. |
| `npm run verify:backend` | PASS — backend root 200; login endpoints 401 for deliberately invalid credentials; protected endpoints 401 without a token. |
| Local production HTTP probes | PASS for the results listed below. |
| Docker build/runtime | NOT EXECUTED. |
| Playwright/browser automation | NOT EXECUTED — no Playwright dependency or configured browser harness is present, and no test credentials were supplied. |
| Staging deployment/verification | NOT EXECUTED — no staging authorization was supplied. |

The Node test runner emitted a non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warning for ESM-style `.js` utility files. The repository-wide `type` field was not changed automatically because that would affect Next.js/CommonJS configuration behavior.

## 4. Defects found and fixed

### P1-RUN-01 — standalone assets unavailable

- **Symptom:** `/ar/login` rendered HTML, but eight referenced `/_next/static/...` CSS/JavaScript assets returned HTTP 404.
- **Root cause:** the runtime script launched `.next/standalone/server.js` without placing root `.next/static` and `public` alongside the standalone bundle. Docker already did this copying, but local standalone startup did not.
- **Fix:** `scripts/start-standalone.mjs` now verifies the server artifact and copies build-owned `.next/static` and `public` directories into `.next/standalone` before spawning the server.
- **Verification:** clean production build; production `/ar/login` 200 with `lang="ar"` and `dir="rtl"`; eight static assets returned 200 after the repair.
- **Status:** FIXED.

### P1-SEC-01 — gateway error responses missing request IDs

- **Symptom:** unauthenticated Central and School BFF gateway requests returned `401 AUTHENTICATION_REQUIRED` without a `requestId`.
- **Root cause:** request ID generation happened after authentication/path validation.
- **Fix:** generate the BFF request ID at gateway entry, attach it to all local failure responses, and use it as the response fallback when the backend does not provide an upstream ID.
- **Files:** `src/lib/api/gateway.ts`, `tests/auth-bff.test.mjs`.
- **Verification:** typecheck, lint, final 36/36 tests, optimized production build, and local production probes. Both Central and School gateway errors now include a request ID.
- **Status:** FIXED.

### P3-TOOLS-01 — verifier environment mismatch

- **Symptom:** the connectivity verifier required a command-line base URL even though the Next.js runtime read `.env.local`.
- **Root cause:** `scripts/verify-backend-connectivity.mjs` did not load local environment entries.
- **Fix:** it now reads local environment entries without overwriting explicit process environment values, validates the `/api/v1` base path, and checks origin consistency.
- **Verification:** `npm run verify:backend` PASS.
- **Status:** FIXED.

## 5. Runtime and BFF verification

| Scenario | Result | Evidence |
| --- | --- | --- |
| Local health | PASS | `GET /api/health` → 200, `success:true`. |
| Backend health through Next BFF | PASS | `GET /api/health/backend` → 200, status `ok`; backend root and both login `OPTIONS` routes were reachable. |
| CSRF issue endpoint | PASS | `GET /api/auth/csrf` → 200, expected `success.data.csrfToken` envelope. Token value was never recorded. |
| Sanitized unauthenticated session | PASS | `GET /api/auth/session` → 200, `authenticated:false`, no access/refresh-token text. |
| Central invalid login | PASS | `POST /api/auth/central/login` with structurally valid, deliberately non-existent credentials → `401 AUTH_FAILED`, request ID present, no token text. |
| School invalid login | PASS | `POST /api/auth/school/login` with structurally valid, deliberately non-existent credentials → `401 AUTH_FAILED`, request ID present, no token text. |
| Missing CSRF header | PASS | Central login POST → `403 CSRF_TOKEN_MISSING`, request ID present. |
| Invalid Origin | PASS | Central login POST → `403 ORIGIN_NOT_ALLOWED`, request ID present. |
| Central gateway with forged browser auth/school headers | PASS | `401 AUTHENTICATION_REQUIRED`, no token, request ID present. |
| School gateway with forged browser auth/school headers | PASS | `401 AUTHENTICATION_REQUIRED`, no token, request ID present. |
| Unauthenticated Central route | PASS | `/en/central` → safe `307` to `/en/login/central?next=%2Fen%2Fcentral`. |
| Unauthenticated School route | PASS | `/en/school` → safe redirect to localized School login during local runtime verification. |
| Production static asset | PASS | referenced `/_next/static/...` asset → 200 after the standalone repair. |

## 6. Portal, RBAC, correspondence, and attachment status

| Area | Static / automated evidence | Runtime status |
| --- | --- | --- |
| Central portal routes and serializable navigation | Build PASS; navigation serialization and Central school-administrator tests PASS | PARTIAL — unauthenticated routing verified; valid Central session flows BLOCKED |
| Central school/user lifecycle | Central school-user tests PASS | BLOCKED — no designated Central test account or disposable school/user records |
| School portal and session gate | School-session tests PASS | PARTIAL — unauthenticated portal protection verified; valid School session BLOCKED |
| School RBAC/user lifecycle | School-admin tests PASS | BLOCKED — needs test users/roles/permissions and mutation authorization |
| Correspondence | Collection/detail/service static tests PASS | BLOCKED — no disposable documents, categories, parties, or mailbox data |
| Attachments | Service test confirms `FormData` usage without a manual multipart header | BLOCKED — no safe files, test records, or authorized upload account; preview/download binary behavior not exercised |
| Tenant isolation | Source and static tests PASS; unauthenticated forged header rejection PASS | BLOCKED — full School A/B authenticated matrix is in `TENANT_ISOLATION_VERIFICATION.md` |

## 7. Localization, theme, responsive, accessibility, and performance

| Area | Result | Evidence / limitation |
| --- | --- | --- |
| Arabic RTL | PARTIAL | production `/ar/login` → 200 with `lang="ar"` and `dir="rtl"`; no full browser visual review was available |
| English LTR | PARTIAL | localized public routes rendered during local runtime work; no final browser/viewport proof |
| Light/dark themes | NOT TESTED | requires browser interaction and visual inspection |
| Responsive sizes (360, 390, 768, 1024, 1366, 1440, 1920) | NOT TESTED | no browser automation/harness configured; no visual claim is made |
| Keyboard, focus, dialogs, screen reader | PARTIAL | component/source tests and lint passed; no assistive-technology run, so WCAG conformance is not claimed |
| Performance | PARTIAL | final build reports 87.3 kB shared first-load JS; Central first load up to 141 kB and School feature routes up to 146 kB. No Lighthouse/RUM measurement was run. |
| Legacy emoji UI | PARTIAL | source scan found legacy `/admin`-area components using emoji icons. New Central/School declarative navigation is covered by serializable-icon tests. Legacy visual modernization is separate technical debt and was not masked. |

## 8. Security conclusion

See `DASHBOARD_SECURITY_VERIFICATION.md` for the full control matrix. Source scans found no browser storage use, no public backend variable, no direct backend domain in `src`, and no Google font download import. Production negative probes prove CSRF, Origin, failure mapping, sanitized session output, and BFF gateway rejection without exposing tokens.

## 9. Remaining failures, limitations, and blockers

| Severity | Item | Status / required next step |
| --- | --- | --- |
| Release blocker | Valid Central and School login/session/refresh/logout | Supply dedicated non-production credentials through secure runtime environment variables; do not place them in source or documentation. |
| Release blocker | Mutating Central/School/RBAC/correspondence/attachment workflows | Supply or approve disposable records and a cleanup policy. |
| Release blocker | Authenticated tenant isolation | Run the School A/B matrix in `TENANT_ISOLATION_VERIFICATION.md`. |
| Release blocker | Browser responsive/a11y/theme QA | Configure an approved browser/Playwright harness and run the specified viewports, keyboard, dialog, and contrast checks. |
| Release blocker | HTTPS staging verification | Provide staging access; validate secure cookies, domain/Origin configuration, BFF, and health there. |
| P3 | Dependency audit output | Plan a controlled dependency upgrade/remediation; no automatic audit fix was run. |
| P3 | ESM module-type warning | Decide deliberately whether to migrate isolated test utilities or the package module strategy; do not change globally without compatibility review. |

## 10. Deployment and rollback recommendations

1. Promote only after the release blockers above are closed with evidence.
2. Deploy the standalone layout together with `.next/static` and `public`; Docker already follows this pattern, and the local start script now does as well.
3. Configure `BACKEND_BASE_URL` at deployment as a server-only origin and preserve `API_BASE_URL` only as a `/api/v1` compatibility value.
4. Set `AUTH_COOKIE_SECURE=true` and a non-local `NEXT_PUBLIC_APP_URL` on HTTPS staging/production.
5. Roll back by restoring the previously verified build artifact and server-only environment configuration; do not roll back by weakening CSRF, Origin, or cookie protections.

## 11. Production readiness assessment

**Not production ready for release approval.** The local technical foundation is functioning and the repaired production runtime is healthy, but the required authenticated, tenant-isolation, browser QA, and staging evidence is absent. The correct next phase is controlled test-data provisioning followed by the blocked test matrix, not feature expansion.
