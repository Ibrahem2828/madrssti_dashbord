# Madrasti Dashboard — Phase 1 Static Implementation Report

## Final status

**PHASE 1 STATIC IMPLEMENTATION COMPLETE**  
**RUNTIME VERIFICATION DEFERRED TO PHASE 2**

## 1–4. Summary and architecture

The dashboard retains its App Router architecture and now documents/uses a clear Central-versus-School portal boundary, feature-oriented services, shared semantic UI, same-origin BFF, sanitized session model, and legacy adapters. No destructive rewrite or legacy route deletion was performed.

## 5–12. Portal, users, RBAC, and correspondence

- Central dashboard, schools, primary administrators, scoped School users, roles/direct permissions/effective permissions, tickets, audit, policies, and health are statically represented.
- School dashboard, users/RBAC, academics, attendance, tickets, settings, reports/notifications, and correspondence routes are statically represented.
- School user and Central scoped School-user workflows use endpoint maps, exact permission constants, safe BFF calls, filters, and shared feedback components.
- Correspondence supports mapped collections, detail/edit ownership, explicit document actions, attachments, categories, parties, activity, and archive UI without displaying invented operational data.

## 13–16. BFF, auth, session, and design

- Browser-to-Django traffic is routed through Next.js auth/gateway handlers.
- HttpOnly token cookies, CSRF/origin checks, request IDs, timeout/error normalization, Central/School path separation, and server-derived School context are retained.
- The environment layer now supports canonical server-only `BACKEND_BASE_URL` while preserving validated `/api/v1` compatibility through `API_BASE_URL`.
- Semantic navy/gold/neutral/status tokens, light/dark theme support, RTL/LTR locale behavior, responsive shell, mobile drawer, accessible dialog focus containment, and shared feedback states are documented and preserved.

## 17–22. UX, accessibility, errors, translations, and responsiveness

- Locale catalogs for Arabic and English remain the source for product UI text.
- Shared error/session/forbidden/unsupported/loading/empty primitives are used by portal features.
- Responsive implementation is static: grid shell, mobile drawer, table scrolling/mobile cards, logical direction handling, focus styles, skip link, and reduced motion are present.
- Browser/screen-reader rendering, translated copy parity, visual contrast, and viewport checks remain deferred; no claim is made that those runtime checks passed.

## 23–25. Files and legacy compatibility

### New in this pass

- `docs/DASHBOARD_CURRENT_STATE_AUDIT.md`
- `docs/DASHBOARD_ARCHITECTURE.md`
- `docs/DASHBOARD_API_INTEGRATION_MAP.md`
- `docs/DASHBOARD_DESIGN_SYSTEM.md`
- `docs/CENTRAL_PORTAL_IMPLEMENTATION.md`
- `docs/SCHOOL_PORTAL_IMPLEMENTATION.md`
- `docs/CORRESPONDENCE_UI_IMPLEMENTATION.md`
- `docs/DASHBOARD_SECURITY_MODEL.md`
- `docs/DASHBOARD_LEGACY_MIGRATION_MAP.md`
- compatibility route aliases for Central dashboard/school create/edit, School dashboard/RBAC, and document edit

### Modified in this pass

- `src/config/env.server.ts`, `.env.example`, and `next.config.js` for a canonical server-only backend-origin contract plus validated API version compatibility.
- `src/services/apiClient.ts` for same-origin tokenless legacy compatibility.
- `src/components/ui/dialog.tsx` and `src/components/ui/confirm-dialog.tsx` for keyboard focus containment and reusable sensitive-action confirmation.

### Retained

Legacy `/admin` routes, context adapters, and legacy services are retained and documented. Existing uncommitted user work was preserved.

## 26–29. API map, risks, and uncertainties

See `DASHBOARD_API_INTEGRATION_MAP.md`. Contract status is deliberately recorded as static integration or partial integration; no endpoint is marked runtime-verified. Backend response shapes, mutation fields, binary streaming, filters, permission responses, cookie behavior, and actual data handling remain runtime risks.

## 30. Recommended Phase 2 commands

Run only after a controlled runtime-verification plan and valid non-secret environment are available:

```text
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

Then execute authenticated Central/School smoke tests, BFF CSRF/origin tests, responsive browser QA, accessibility keyboard QA, and backend contract verification.

## 31. Manual QA checklist for Phase 2

- Arabic RTL and English LTR portal routing and preserved locale switching.
- Anonymous, Central, and School cross-portal redirects.
- CSRF/origin rejection for unsafe requests and successful authorized mutations.
- No token exposure in session response, browser storage, URLs, or console/network payloads.
- Active School switch and BFF-derived School context.
- Central School user lifecycle and tenant isolation.
- School user/RBAC lifecycle and effective permissions.
- Correspondence document, attachment preview/download, category/party, link/reply/archive workflows.
- Light/dark UI and viewport checks at 360, 390, 768, 1024, 1366, 1440, and 1920 pixels.

## 32. Execution declaration

No runtime, build, lint, typecheck, test, browser, network, backend mutation, package installation, or deployment command was executed for this static Phase 1 implementation pass.
