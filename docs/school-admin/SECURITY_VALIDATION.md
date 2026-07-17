# Security Validation

## Preserved controls

- HttpOnly authentication tokens remain server-side.
- School browser calls continue through same-origin BFF routes.
- School context is derived server-side.
- `X-School-ID` remains set only from `auth.activeSchool` in the gateway.
- School gateway path validation remains active.
- Central-school leakage remains blocked by portal checks.
- Client preview/download flows keep using gateway URLs.

## Static test evidence

- School BFF gateway derives school context server-side and ignores browser-provided school context.
- School client service layer uses `browserApi("school", ...)` and does not embed backend origins.
- Specialized document routes no longer rely on temporary redirect indirection.
- Audit-sensitive document actions now require a reason in the UI and send the reason in the service layer.

## Runtime evidence

- Unauthenticated school routes redirect to the school login page with safe `next` values.
- `/api/health/backend` returned `200` during the local production runtime check.