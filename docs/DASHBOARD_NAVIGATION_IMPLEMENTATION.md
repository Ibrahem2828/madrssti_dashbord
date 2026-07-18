# Dashboard navigation implementation

## Source of truth

- `src/config/navigation.central.ts` and `src/config/navigation.school.ts` define serializable navigation groups.
- `PortalShell` filters items using the effective session permission helper and `hasCapability`.
- Route matching accepts configured parameter matchers and marks active entries with `aria-current="page"`.

## Group behavior

- Empty groups are removed after permission/capability filtering.
- An active route opens its group.
- Desktop groups can be expanded or collapsed independently; a collapsed sidebar exposes labelled icon controls with tooltips.
- Mobile turns every visible group into an accessible accordion and keeps only the selected group open.

## Boundaries

Navigation filtering only avoids offering unavailable paths. Page-level guards, BFF validation, and backend tenant/permission checks remain independently necessary. The shell never stores permissions, token material, or school context in browser storage.
