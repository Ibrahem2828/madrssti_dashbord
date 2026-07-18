# Dashboard final UI report

## Status

**IMPLEMENTED AND PARTIALLY VERIFIED**

The source-level dashboard upgrade is implemented on the established Next.js/BFF architecture. TypeScript validation has passed. Runtime E2E, authenticated backend flows, visual viewport inspection, and Playwright are not asserted because the repository does not include a configured browser suite, test credentials, or an available backend test environment in this change.

## Delivered

- Semantic surface, info, focus-ring, and overlay tokens for both themes.
- Responsive topbar that separates compact mobile context from desktop context.
- Mobile navigation drawer and permission-aware accordion groups.
- Stable active-route and breadcrumb behavior for RTL/LTR portals.
- Shared `FormControl` with permanent labels and sticky long-form action support.
- Token-corrected generic table primitive with stable-key support.
- Accessible shared confirmation and reason dialogs; document actions, reference deletion, and Central school state changes no longer rely on native confirmation dialogs.
- CRUD, responsive, navigation, form, accessibility, audit, and implementation documentation.

## Automated verification

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with no warnings or errors |
| `npm test` | Passed: 40 tests, 0 failures |
| `npm run build` | Passed: production compilation and route generation complete |
| Playwright | Not configured in this repository; not run |

## Backend-supported operations exposed

- Update: Central schools, scoped users, School users, documents, categories, parties, attendance records, settings/features, and policies where configured.
- Delete: documents, categories, and correspondence parties only where configured and permissioned.
- Archive/deactivate alternatives: document archive, school activation/deactivation, user enable/disable, ticket close/escalate, and QR lifecycle actions.

## Deliberately excluded

No unconfirmed endpoint was added. In particular, generic delete actions for schools, users, tickets, settings, policies, and attachments remain absent. No client-side token storage, direct backend URL, custom Authorization header, or tenant header was added.

## Required release verification

Run `npm run lint`, `npm test`, and `npm run build`; then run authenticated browser validation at the documented viewport matrix for Central and School portals in both locales and themes. Confirm BFF 403/404 tenant boundaries and real backend response mappings before calling the dashboard production-ready.
