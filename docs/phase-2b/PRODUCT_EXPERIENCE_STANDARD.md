# Product experience standard

## Product shell rules

Every active business route should conform to the same structural hierarchy:

1. localized breadcrumb
2. one page title (`h1`)
3. short contextual description
4. primary and secondary actions in the header area only
5. filters before results
6. result or detail surface
7. pagination or supporting sections

The canonical source for these primitives in Phase 2B is:

- `src/components/layout/product-framework.tsx`
- `src/components/layout/portal-shell.tsx`
- `src/components/feedback/states.tsx`
- `src/components/ui/*`

## Actions

Primary action rules:

- A page shows at most one visually dominant primary action in the header.
- Destructive actions never occupy the primary slot unless the whole page is a destructive confirmation.
- Permission and capability checks must happen before rendering actions.
- Loading states must disable duplicate submission.

Secondary action rules:

- Secondary actions sit adjacent to the primary action or inside a clearly named card section.
- Confirmation wording must name the object or workflow being changed.
- Unsupported actions are hidden, not visually disabled without explanation.

## Filters

Standard filter behavior:

- Filters render in a canonical `FilterBar` surface.
- Filter state is URL-backed for list/report/archive/notification screens.
- Active filters render as removable chips.
- “Clear all” resets only view preferences, never authentication or school context.
- Server-driven filters are preferred to client-only record slicing.

## Tables and list workspaces

- Desktop tables use semantic `<table>` markup.
- Mobile alternatives use `MobileRecordCard` rather than forcing horizontal table scrolling.
- Totals may only display backend-provided `count` or explicit overview totals; never derive a global total from the first page.
- Row actions must stay close to the record they mutate.
- Sorting semantics should be expressed through `aria-sort` when sorting is available.
- Bulk actions remain hidden unless a verified bulk endpoint exists.

## Forms

Canonical form expectations:

- consistent label spacing
- visible focus ring
- disabled/pending states
- field-level error placement
- optional summary-level error block
- no optimistic critical mutation
- audit/destructive reasons collected explicitly when the backend expects them
- unsaved-change protection for long-running or multi-input flows

## Dialogs and drawers

- One canonical dialog system and one canonical drawer system
- Escape closes the surface
- focus returns to the trigger
- icon close controls must have labels
- mobile drawer is reserved for navigation and constrained auxiliary workflows

## Feedback states

Use the shared feedback vocabulary:

- `EmptyState` when there is no data yet
- `FilteredEmptyState` when filters produced zero records
- `ErrorState` for unexpected failures with retry when safe
- `ForbiddenState` for permission denial
- `UnsupportedState` when backend capability is absent and intentionally hidden
- inline alerts for workflow-local success/error feedback

## Notifications

- Notification counts must come from a verified API or remain hidden
- no invented realtime indicators
- notification listing is school-scoped only
- mark-read uses the dedicated backend mutation

## Destructive actions

Destructive flows must:

- use danger styling or explicit warning copy
- name the affected object/workflow
- request a reason when the backend contract requires it
- avoid silent retries

## Status and semantic color rules

- navy/primary for main identity and navigational emphasis
- muted gold/accent for institutional secondary emphasis only
- green for success
- amber for warning
- red for destructive/error
- neutral tokens for structural chrome and muted information

No feature screen should introduce arbitrary raw business colors outside the semantic token system.

## Arabic and English terminology

- Arabic remains formal, short, and administrative
- English remains concise and operational
- destructive wording should be explicit, not euphemistic
- School and Central portal names must remain distinct

## Dates, numbers, and print

- dates and numbers use locale-aware formatters from `src/lib/formatting/*`
- print views must remain legible in both directions
- browser print is labeled as browser print, not backend export
- unsupported export actions remain hidden
