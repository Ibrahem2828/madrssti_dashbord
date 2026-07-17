# Madrasti Dashboard Architecture

## Portal boundary

The dashboard has two independently routed, authenticated, and authorized portals:

```text
/[locale]/central/*  → Central Administration
/[locale]/school/*   → School Administration
```

Middleware uses the portal-scope cookie only for coarse route routing. Layouts, session loading, permission boundaries, and Django remain responsible for the authoritative decision. A Central session is redirected away from School routes and a School session is redirected away from Central routes.

## Browser-to-backend flow

```text
Browser Client Component
  → same-origin /api/auth/* or /api/gateway/{central|school}/*
  → server-only cookie/session/CSRF/origin controls
  → server-only backend transport
  → Django REST API /api/v1/*
```

Client Components call `browserApi` or an auth BFF route only. They never receive backend URLs, access tokens, refresh tokens, Authorization headers, or a trusted School header.

## Server configuration

`src/config/env.server.ts` is server-only. `BACKEND_BASE_URL` is the canonical backend origin. `API_BASE_URL` remains a compatibility-safe versioned API configuration and must resolve to the exact `/api/v1` path. When only the canonical origin is supplied, the server derives the versioned API URL as `{origin}/api/v1`; if both values are configured their origins must agree.

## BFF responsibilities

| Area | Responsibility |
| --- | --- |
| Auth handlers | separate Central/School login, refresh, logout, CSRF, session, and School switching |
| Cookie utilities | HttpOnly access/refresh/portal/active-School cookies; browser-readable CSRF/theme cookies only where necessary |
| Session normalizer | maps backend envelopes to a sanitized `PortalSession` |
| Gateway | validates portal, path, origin/CSRF, headers, body, timeout, binary response, request ID, and allowed response headers |
| Server transport | validates backend URLs, applies timeout policy, classifies transport failure, and normalizes safe errors |

Central gateway traffic never adds `X-School-ID`. School gateway traffic derives it exclusively from the validated server-managed active School cookie.

## Feature and UI organization

```text
src/features/central/      Central screens, services, mappers, contracts
src/features/school/       School screens, services, mappers, contracts
src/components/            UI, layout, navigation, feedback primitives
src/config/                routes, endpoints, permissions, capability/navigation metadata
src/lib/                   BFF, auth, API contracts, formatting, theme, permissions
```

Existing legacy `admin` routes and API/context exports remain compatibility adapters; new navigation and feature work targets the Central or School portal paths.

## Session lifecycle

```text
login BFF → validates same-origin request → server calls portal login endpoint
          → stores tokens in HttpOnly cookies → session endpoint normalizes user/scope
          → School session derives active School → UI receives sanitized session only

expired access → refresh BFF/server transport → session refresh or safe unauthenticated state
logout         → backend logout attempted → all local authentication cookies cleared
```

## Design and locale architecture

- `next-intl` provides Arabic and English message catalogs and locale routing.
- Root layout determines `lang` and `dir`; Arabic is RTL and English is LTR.
- Semantic CSS tokens are the visual source of truth for light and dark themes.
- `PortalShell` supplies skip navigation, responsive desktop/mobile navigation, breadcrumbs, language/theme controls, user menu, and portal-aware context.

## Deferred verification

This document describes static architecture only. Backend contracts, browser rendering, cookie behavior, accessibility interaction, and responsive rendering require Phase 2 runtime verification.
