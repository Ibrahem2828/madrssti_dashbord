# Dashboard UI/UX audit

## Scope and method

Static source review of the App Router shell, shared UI primitives, navigation configuration, BFF routes, feature services, permissions, and the correspondence and Central-school workflows. This is not a claim of browser or backend runtime verification.

## Findings and resolution

| Area | Risk observed | Implemented resolution |
| --- | --- | --- |
| Desktop | User context was duplicated between the topbar and account menu. | The topbar now presents portal/school context; personal details remain in `UserMenu`. |
| Tablet | Topbar controls could consume too much horizontal space. | The school selector and desktop-only context use the `sm` breakpoint; controls retain touch-sized targets. |
| Mobile | Desktop-oriented user/school badges and complete breadcrumbs crowded the header. | A compact page title, navigation trigger, notification control, and account menu are shown. Breadcrumbs are capped to two levels. |
| Navigation | Mobile groups did not behave as one accordion. | All mobile navigation groups now use mutually exclusive accordion behavior; desktop retains independent collapsible groups. |
| Forms | Several primary correspondence and school-management fields relied on placeholder text. | `FormControl` supplies visible persistent labels and is applied to high-traffic create/edit workflows. |
| Long forms | Primary submit actions could scroll beyond reach on a phone. | `StickyPageActions` stays visible on small screens and becomes a normal action row from `md` upward. |
| Tables | A legacy generic table referenced obsolete color utilities. | It now uses semantic tokens, borders, and an optional stable backend row key. |
| Dialogs | Native browser confirmation dialogs were used for category/party deletion and school state changes. | Shared `ConfirmDialog` now handles those actions; `ReasonDialog` is used for document state/delete/archive contracts. |
| Accessibility | The shell had good landmarks and focus behavior but needed a reusable visual-label primitive. | `FormControl` makes label association semantic without a placeholder-only fallback. |

## Security and tenant review

- Browser traffic remains same-origin through `/api/gateway/central/*` or `/api/gateway/school/*`.
- No browser-provided Authorization or school tenant header is introduced by this work.
- Navigation visibility is filtered by capabilities and effective permissions. It is not considered authorization; BFF and backend enforcement remain required.
- No endpoint, delete operation, archive operation, or data fixture was invented.

## Remaining audit work

Rendered inspection at every target viewport, keyboard-only testing in browsers, contrast measurement, and authenticated E2E verification require a running backend and test identities. Existing non-primary legacy forms should be migrated to `FormControl` incrementally rather than mechanically rewriting unverified feature paths.
