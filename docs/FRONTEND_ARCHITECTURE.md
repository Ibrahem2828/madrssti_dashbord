# Frontend Architecture

## Product boundaries

The App Router has three deliberate route boundaries: public authentication, `central`, and `school`. Each portal owns its route group, layout, declarative navigation configuration, capability checks, and feature services. This prevents school context and central-platform operations from being coupled.

## Layers

| Layer | Responsibility |
| --- | --- |
| `src/app` | Route composition, locale boundary, loading and error UI, same-origin BFF routes. |
| `src/features` | Portal-specific screens, mappers, types, and service adapters. |
| `src/components/ui` | Accessible primitives: buttons, inputs, dialogs, drawer, badges, skeletons. |
| `src/components/layout` | Product shell, page framework, responsive navigation, branding. |
| `src/components/feedback` | Empty, forbidden, unavailable, and retryable error states. |
| `src/config` | Endpoints, capabilities, permissions, route and navigation metadata. |
| `src/lib` | API normalization, auth/session utilities, validation, i18n helpers, formatting. |

`contexts/SchoolContext.tsx` is retained as a compatibility adapter. New portal code consumes `usePortalSession()` instead.

## Data and security flow

Browser feature services call only the same-origin gateway. The BFF owns backend-origin configuration, CSRF/cookie forwarding, request identifiers, error normalization, and portal isolation. DTO mappers convert verified backend payloads into frontend contracts without changing backend models.

## Cross-cutting standards

- Permission decisions originate from the authenticated session and are applied to navigation, actions, and route UI—not CSS visibility.
- `next-intl` supplies Arabic/English routing and messages; the shell inherits document direction for RTL-first layout.
- Light/dark tokens live in `globals.css`; Tailwind maps them to semantic utilities.
- Route loading and route errors are handled at portal boundaries; feature screens add local retry states for asynchronous data.
- New work extends the existing feature module or shared primitive. It must not create a second API client, permission engine, or design-system hierarchy.

## Phase 2 test boundary

`playwright.config.ts` starts the local Next.js server for public smoke checks or accepts `E2E_BASE_URL` for a dedicated verification deployment. Authenticated workflows require explicit environment variables and are skipped by default, preventing accidental traffic or mutations in an unverified environment.
