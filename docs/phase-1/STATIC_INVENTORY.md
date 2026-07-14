# Static inventory

The repository is Next.js 14, React 18, TypeScript strict mode, Tailwind 3, next-intl, and Lucide. Existing school-admin pages remain under `src/app/[locale]/admin` and are retained for migration.

## Risks found

- The root used `next/font/google`, fixed Arabic HTML direction, and Arabic-only locale configuration.
- `AuthContext`, `SchoolContext`, `apiClient`, and `apiInterceptor` stored or propagated bearer tokens in browser code and used a hard-coded backend URL.
- Middleware decoded an unrelated browser token and did not enforce its calculated authentication state.
- Legacy admin shell has hard-coded RTL layout offsets and identity/navigation concerns.

## Retained and adapted

`/admin` pages, existing services, and contexts are retained. Contexts and interceptors are compatibility adapters; new code uses `providers/auth-provider`, BFF routes, and `lib/api/browser-client`.

## Contract findings

The checked contract verifies school `/auth/login`, `/auth/refresh`, `/auth/logout`, `/me`, `/me/schools`, and `/me/switch-school`. It does not document central login/session response envelopes; the Central mapping is isolated in `config/auth-endpoints.ts` and `features/auth/services/login-server.ts`.

## Deferred runtime checks

Cookie semantics, Central response field mapping, multipart gateway behavior, and deployment environment configuration require Phase 3 verification.
