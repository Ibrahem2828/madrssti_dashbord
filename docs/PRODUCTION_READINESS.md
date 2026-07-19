# Production readiness

## Verified locally

- TypeScript, ESLint, unit/static regression suite, and production build are required release gates.
- Public Playwright smoke coverage exists for direct central and school login routes, RTL/LTR direction, client validation, console-error collection, and phone-width overflow.
- The shell, theme system, semantic feedback, shared loading skeleton, BFF boundary, and permission-filtered navigation are retained from the approved baseline.

## Required release-environment validation

- Provision Playwright Chromium, a reachable backend, and dedicated non-production central/school test identities.
- Set `E2E_RUN_AUTHENTICATED=true` and the documented `E2E_*` credentials only in the verification environment.
- Run authenticated direct-link, refresh, back/forward, RBAC, upload/preview/download, archive/restore, and responsive checks against disposable records.
- Collect browser console errors, network failures, accessibility findings, and Web Vitals from the release deployment.
- `npm audit --omit=dev` is currently clean. Triage the remaining dev-tooling audit findings before tooling upgrades; do not use `npm audit fix --force` without compatibility review.

## Release command set

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e:install
npm run test:e2e
```

## Current recommendation

The source baseline is suitable for production deployment once the external environment checks above pass. It is not valid to label the product fully production-ready until authenticated E2E, reachable-backend runtime validation, browser provisioning, and dependency-security triage are complete.
