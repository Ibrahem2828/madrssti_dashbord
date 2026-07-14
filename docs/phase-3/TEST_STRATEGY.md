# Phase 3 test strategy

Phase 3 is the first runtime-validation phase. Nothing in this document has been executed during Phase 2B.

## 1. Clean install

- run `npm ci`
- confirm lockfile resolution is reproducible
- confirm no hidden postinstall dependency is required

## 2. TypeScript and lint

- run `npm run typecheck`
- run `npm run lint`
- capture any errors in active portal routes, route handlers, providers, i18n, and legacy compatibility files

## 3. Unit and integration tests

Current repository state should be audited to determine whether formal unit/integration suites already exist.

If test structure exists:

- run existing unit tests
- add targeted coverage for mappers, auth/session parsing, gateway errors, and permission filtering

If test structure does not exist:

- do not fabricate success; record absence and prioritize high-risk coverage only after type/lint/build pass

## 4. End-to-end and browser validation

Prioritize:

- localized login flows
- portal isolation
- school switching
- notifications
- reports
- correspondence detail and archive flow
- attachment preview/download
- responsive shell behavior

## 5. Build and packaging

- run `npm run build`
- inspect Next.js output for route handler and App Router issues
- verify standalone/runtime expectations if deployment uses standalone output

## 6. Docker and staging

- validate Dockerfile/runtime assumptions if present
- verify non-root execution, exposed port, and environment propagation
- deploy to staging only after build succeeds

## 7. Accessibility

- keyboard navigation sweep
- screen reader smoke test
- dialog/drawer/user-menu focus validation
- heading order review
- Arabic and English locale accessibility labels review

## 8. Responsive

- test at 360px, 390px, tablet, desktop, and large desktop
- verify tables/cards, drawer navigation, topbar wrapping, and print layout

## 9. Security

- validate cookie behavior, CSRF, origin enforcement, portal isolation, gateway restrictions, and file preview/download behavior

## 10. Performance

- profile shell hydration
- inspect heavy report/correspondence routes
- review repeated requests across route transitions

## 11. Production smoke

After staging approval only:

- central login
- school login
- session refresh
- logout
- representative reads/mutations in both portals
