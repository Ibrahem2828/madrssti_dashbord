# Deployment checklist

## Environment

- `API_BASE_URL` configured and reachable from the Next.js server only
- `NEXT_PUBLIC_APP_URL` matches deployed dashboard origin
- `NEXT_PUBLIC_DEFAULT_LOCALE` set intentionally
- `AUTH_COOKIE_SECURE` matches HTTPS deployment expectation

## Cookies and HTTPS

- Secure cookies enabled in production
- SameSite behavior confirmed
- no browser-readable auth token cookie exists
- HTTPS termination and proxy headers verified

## Routing and health

- `/api/health` (or project health route) returns expected response
- localized routing works behind the real domain/proxy
- Central and School middleware redirects behave correctly under production hostnames

## Build/runtime output

- Next.js build succeeds
- standalone output verified if deployment expects it
- static assets served with correct cache behavior
- upload and binary proxy routes work behind reverse proxy

## Docker / platform concerns

- non-root runtime user if containerized
- exposed port matches hosting platform (including Coolify if used)
- environment values mounted correctly
- filesystem expectations for uploads/temp files reviewed

## Operations

- request IDs visible in logs and error responses
- rollback path documented
- release smoke list prepared
