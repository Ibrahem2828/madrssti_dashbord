# Known runtime risks

These risks remain intentionally deferred because Phase 2B is source-editing only.

## Application/runtime risks

- TypeScript compatibility across large feature files and compatibility adapters
- Next.js App Router/runtime behavior for route handlers and middleware
- cookie behavior under real HTTPS and domain settings
- CSRF/origin enforcement under actual browser requests
- locale routing edge cases on deep links and redirects
- multipart upload behavior for correspondence attachments
- binary preview/download behavior through the School gateway
- browser print output in Arabic RTL and English LTR
- responsive layout edge cases on real mobile browsers
- accessibility behavior with assistive technologies
- API payload differences from backend environments not identical to local source contracts
- build output stability and deployment packaging

## Legacy/runtime cleanup risks

- legacy `/admin` redirect expectations may still be bookmarked by users
- deprecated `src/components/reports/*` may still be referenced by external/untracked code paths not visible in this static workspace
- compatibility adapters under `src/contexts/*` still need runtime import graph confirmation before deletion
