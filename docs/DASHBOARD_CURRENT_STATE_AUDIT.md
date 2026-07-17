# Madrasti Dashboard — Current State Static Audit

## 1. Executive summary

This audit was performed by source inspection only in the canonical dashboard repository. The application already uses Next.js App Router, locale-aware routes, separate Central and School portals, a same-origin BFF, HttpOnly authentication cookies, a shared design-token layer, and feature-oriented screens. The implementation is materially ahead of a greenfield Phase 1 baseline.

The principal static compatibility risk identified is the retained legacy `src/services/apiClient.ts`: it is not used by the current feature services, but its old extensibility surface could theoretically accept an unsafe base URL or a caller-supplied Authorization header. It must remain as a compatibility adapter, but must be constrained to same-origin BFF use and must never refresh or inject tokens in the browser.

No runtime, build, test, browser, network, backend mutation, package installation, or deployment command is part of this audit.

## 2. Current architecture

- **Framework:** Next.js 14 App Router, React 18, TypeScript strict mode, Tailwind, `next-intl`, and Lucide.
- **Route root:** `src/app/[locale]`; root HTML language and direction are derived from the locale by `src/app/layout.tsx`.
- **Portals:** Central routes are under `/[locale]/central`; School routes are under `/[locale]/school`; retained legacy School routes remain under `/[locale]/admin`.
- **Feature code:** Central screens and services live in `src/features/central`; School screens and services live in `src/features/school`.
- **Shared UI:** `src/components/ui`, `layout`, `navigation`, and `feedback` provide the shell and reusable controls.
- **Styles:** `src/styles/globals.css` and `tailwind.config.ts` use semantic CSS variables for light and dark schemes.

## 3. Routes inventory

| Area | Statically present routes | Notes |
| --- | --- | --- |
| Public | login selector, Central login, School login, unauthorized, session expired | locale-prefixed public route group |
| Central | dashboard root, schools, school detail, school administrators, scoped school users, tickets, ticket detail, audit, policies, health | scoped user detail, edit, role, permission, and activity routes are present |
| School | dashboard root, users, user detail/create, academic, attendance, correspondence, document collections, document detail, archive, reports, notifications, tickets, settings | active routes are permission-filtered by the shared shell and feature gates |
| Legacy | `/[locale]/admin/*` | retained for backward compatibility; not the new navigation source of truth |
| BFF | `/api/auth/*`, `/api/gateway/central/[...path]`, `/api/gateway/school/[...path]`, health routes | browser-facing same-origin boundary |

## 4. BFF inventory

- Central and School login handlers delegate to the shared server-only login service.
- Separate Central and School gateway handlers delegate to the shared `proxyGateway` implementation with a portal argument.
- Gateway traffic attaches bearer credentials only on the server and forwards a server-derived School ID only for School traffic.
- The gateway validates path segments, filters request and response headers, preserves binary bodies, adds request IDs, applies timeouts, and validates CSRF/origin for unsafe methods.
- Session, refresh, logout, CSRF, and safe School switching handlers are present.

## 5. Authentication architecture

- Access and refresh tokens are represented by `madrasti_*` HttpOnly cookies managed in `src/lib/auth/cookies.ts`.
- The browser receives only a sanitized `PortalSession` through `/api/auth/session`.
- Central and School authentication are distinct BFF login flows and use portal scope for routing.
- Middleware performs locale routing and cookie-presence/portal-scope redirects; backend session validation remains authoritative.

## 6. Session architecture

- `src/lib/auth/session.ts` normalizes Central and School backend envelopes into `PortalSession`.
- The active School context is derived from an authenticated backend session and persisted in an HttpOnly cookie only after successful session normalization.
- `AuthProvider` exposes sanitized session, loading, safe error code/request ID, logout, refresh, and permission helpers.
- The School portal has a dedicated School session/context gate.

## 7. Central portal inventory

- Dashboard, school catalogue/detail, activation state, primary administrator lifecycle, tickets, audit, policies, health, and scoped School user/RBAC flows are represented.
- Central navigation uses serializable icon keys and exact Central permission codes.
- School user actions are scoped by the school ID inside Central BFF paths and use server-side tenant authorization.

## 8. School portal inventory

- School dashboard, users/RBAC, academic setup, attendance, reports, tickets, settings, notifications, and correspondence are represented.
- School navigation is permission-aware and uses the server-derived active School context; it does not expose a browser-controlled tenant header.
- The School portal is intentionally distinct from Central navigation, layouts, gateway selection, and middleware redirects.

## 9. Correspondence inventory

- Document overview, filtered collections (outgoing, incoming, internal, circulars, needs reply, archive), create, detail, categories, parties, activity, attachments, preview/download, linking, and archive actions have feature and endpoint-map coverage.
- Document endpoint building is centralized in `src/config/endpoints.school.ts` and uses the School BFF.

## 10. Shared components inventory

- Shared shell: sidebar, mobile drawer, topbar, breadcrumbs, command palette, language/theme controls, user menu, School switcher.
- Shared UI/feedback: buttons, dialogs, cards, badges, inputs, select controls, tables/mobile cards, loading, empty, error, forbidden, and session states.
- Central and School feature screens reuse common form/table primitives instead of introducing a separate component library.

## 11. API integration status

- `endpoints.central.ts` and `endpoints.school.ts` centralize relative gateway paths and validate path entities via shared builders.
- `browserApi`-based feature services use same-origin `/api/gateway/{portal}` requests.
- Server transport builds backend URLs from the server-only `API_BASE_URL` which is required to include `/api/v1`; this is the existing compatibility-safe equivalent of a backend base URL plus API version.
- The backend response normalizer supports raw records and `{success, data}` envelopes.

## 12. Design inconsistencies

- Core semantic tokens, light/dark mode, focus states, reduced-motion handling, and professional Lucide navigation are present.
- Some older legacy source files remain compact/minified in style and do not meet the newer component readability convention; they are retained pending controlled migration.
- The retained legacy API client needs security hardening and a deprecation boundary rather than removal.

## 13. Translation issues

- `ar` and `en` message catalogs and locale routing are present.
- New shared portal UI generally uses message keys. Some technical UI text such as `Ctrl K` is intentionally technical.
- Static parity and rendered-text verification remain runtime/QA work; no missing-key claim is made by this audit.

## 14. Responsive issues

- The shell uses CSS grid, logical border/spacing utilities, a mobile drawer, table scrollers, and mobile record cards.
- No viewport was rendered during this static phase. Responsive behavior requires later browser verification at the prescribed viewports.

## 15. Security concerns

- No source match was found for `localStorage`, `sessionStorage`, public backend base URL configuration, or the real backend origin in `src`.
- Authorization and `X-School-ID` usage is confined to server-only BFF/session code.
- `ThemeScript` is the only intentional `dangerouslySetInnerHTML` usage and is limited to controlled theme initialization.
- The legacy API client must be constrained so callers cannot configure cross-origin base URLs, browser Authorization headers, or token refresh callbacks.

## 16. Legacy compatibility risks

- `/[locale]/admin/*`, `src/contexts/AuthContext.tsx`, `src/contexts/SchoolContext.tsx`, and `src/services/apiClient.ts` are retained compatibility surfaces.
- Context adapters already derive state from the sanitized portal session. They must not regain token access.
- Existing uncommitted files across the Central, School, documentation, and Phase 3 areas were found and will be preserved; this work will not reset, delete, or overwrite unrelated changes.

## 17. Static implementation plan

1. Preserve the current feature/BFF architecture and complete required documentation, rather than moving files for cosmetic conformity.
2. Harden the legacy API client into a same-origin, tokenless compatibility adapter with CSRF support and safe retry semantics.
3. Add missing route aliases only where they preserve a current route contract without duplicating screens.
4. Document architecture, API integration status, design system, portal coverage, correspondence coverage, security model, and legacy migration plan.
5. Perform text/diff inspection only and defer all runtime validation to Phase 2.
