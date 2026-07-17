# Phase 2 Failure Classification

## Current command evidence

| Gate | Result | Classification |
| --- | --- | --- |
| `npm ci` | PASS; 413 packages installed | P3 warnings: deprecated transitive packages, one pending install-script approval, 6 reported vulnerabilities (2 moderate, 4 high) |
| `npm run typecheck` | PASS | none |
| `npm run lint` | PASS; no warnings/errors | none |
| `npm test` | PASS; 35/35 | P3 Node module-type warning for `login-payload.js` |
| `npm run build` | PASS; all listed routes compiled | none |
| `git diff --check` | PASS after cleanup | none from the reviewed source diff; Git still reports line-ending normalization warnings for pre-existing modified files |

## Severity definition

- **P0:** security, authentication, tenant-isolation, secret exposure, or build blocker.
- **P1:** broken core Central/School/correspondence workflow.
- **P2:** visual, translation, responsive, or accessibility defect.
- **P3:** non-blocking warning, dependency debt, or cleanup issue.

## Confirmed findings

### P0 / P1

1. **P1 — production static assets returned 404:** The standalone server was started without `.next/static` and `public` copied beside `.next/standalone/server.js`. HTML, health, and BFF routes worked, but browser CSS and JavaScript assets returned 404. `scripts/start-standalone.mjs` now copies those build-owned directories into the standalone layout before starting the server. A clean production build and runtime probe verified eight referenced assets return 200.

No unresolved P0 or P1 defect is confirmed by install, TypeScript, lint, tests, production build, or the completed unauthenticated runtime probes. Authenticated workflows remain unverified rather than assumed successful.

### P2

No P2 defect is confirmed without browser/assistive-technology evidence.

### P3

1. **Dependency audit output:** `npm ci` reported 6 vulnerabilities (2 moderate, 4 high) in the resolved dependency tree. No `npm audit fix --force` was run because it can make breaking lockfile changes. Dependency ownership and upgrade compatibility require a separate controlled remediation decision.
2. **Deprecated transitive packages:** npm reported deprecations for `inflight`, older `glob`, `rimraf@3`, and ESLint support packages. These do not block current commands but require maintenance planning.
3. **Pending install script:** npm reported `unrs-resolver@1.12.2` as awaiting script approval. No approval command was executed.
4. **Module-type warning:** tests reparse `src/features/auth/services/login-payload.js` as ESM because package type is unspecified. Changing the application-wide module type is not an automatic safe fix for a Next.js repository.
5. **Line-ending notices:** Git reports CRLF-to-LF normalization notices on several pre-existing modified files. They do not indicate a source error and no bulk line-ending rewrite was performed.

## Next action

Proceed only with authenticated and mutating workflows against explicitly supplied non-production test accounts and tenant fixtures. No failure is suppressed by this classification.
