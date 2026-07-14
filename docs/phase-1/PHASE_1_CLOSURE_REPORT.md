# Phase 1 closure report

## Status

**PHASE 1 STATIC IMPLEMENTATION COMPLETE**

**RUNTIME VERIFICATION DEFERRED TO PHASE 3**

## Objective and decisions

This phase establishes separated Central and School portal shells, BFF authentication and gateways, HttpOnly session cookies, CSRF/origin controls, bilingual locale configuration, dynamic direction initialization, semantic light/dark themes, and compatibility adapters for legacy school administration code. No Phase 2 business module was added.

Central/Schoool portal scope is a server-managed cookie, all browser API traffic is same-origin, and the backend URL is isolated in a server-only module. Navigation is declarative and permission-filtered. Legacy pages remain intact and are excluded from new navigation.

## Files added and modified

Added: BFF routes under `src/app/api`, portal route groups, `config`, `lib/auth`, `lib/api`, permission, theme, formatting, providers, new portal shell/components, message files, `.env.example`, and Phase 1 documentation.

Modified: root/locale layouts, middleware, Tailwind configuration, global CSS, legacy contexts, API interceptor/client, and shared compatibility provider. These changes remove active direct-Django/token-storage paths in favor of BFF adapters.

Deprecated but retained: `AuthContext`, `SchoolContext`, `apiInterceptor`, legacy API client defaults, `/admin` layout/sidebar/navbar/pages. They remain to preserve imports and migrate safely in Phase 2.

## Repository Operations Performed

- Repository listing and file discovery
- Source-code text search and file reading
- Source patching and directory creation
- Git status/diff inspection was attempted; this workspace does not expose a recognized Git worktree despite `.git` read permission

No dependency installation, development server, build, compiler, linter, test, browser preview, network request, or deployment command was executed.

## Static acceptance matrix

| Criteria | Status |
|---|---|
| P1-ARCH-01 through P1-ARCH-05 | PASS |
| P1-AUTH-01 through P1-AUTH-17 | PASS |
| P1-I18N-01 through P1-I18N-07 | PASS |
| P1-UI-01 through P1-UI-12 | PASS |
| P1-PERM-01 through P1-PERM-06 | PASS |
| P1-QUAL-01 through P1-QUAL-12 | PASS |
| P1-A11Y-01 through P1-A11Y-08 | PASS |

The static review searched for hard-coded backend domains, browser token storage, Google fonts, locale route structure, BFF routes, cookie/CSRF utilities, gateways, semantic theme tokens, and Phase 1 use of `Math.random`. Existing retained legacy/report mock code still contains unrelated historical `Math.random` usages and is documented for Phase 2 migration; no new Phase 1 infrastructure uses it. Existing legacy report placeholders were not expanded or connected.

## Assumptions and deferred risks

The checked school contract establishes email/password login and JWT envelope shape. Central response fields were not in the repository contract and are normalized in one server adapter pending backend confirmation. Runtime verification must validate Central mapping, proxy/deployment origin values, secure-cookie behavior, multipart/binary gateway paths, session refresh semantics, and compatibility of retained legacy pages.

## Phase 2 prerequisites

Confirm Central API schema and permission catalog, then migrate legacy modules one at a time to the portal shell and gateway clients.

## Phase 3 commands (not executed)

`npm ci`  
`npm run typecheck`  
`npm run lint`  
`npm test`  
`npm run build`
