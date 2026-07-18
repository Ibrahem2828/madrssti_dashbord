# Navigation refactor

## Single source of truth

`navigation.central.ts` and `navigation.school.ts` remain the sole route-data definitions. The desktop sidebar, mobile drawer, and command palette consume the same filtered list from `PortalShell`.

## Unified rules

- `filterNavigationForSession` centralizes visibility and removes empty groups.
- `isNavigationItemActive` centralizes active route resolution.
- Group state uses the same active-child rule in collapsed desktop, expanded desktop, and mobile modes.
- Mobile differs only in container behavior: it is an accordion inside a focus-trapped drawer and closes after navigation.

## Branding

The drawer now receives `PortalBrand` as its custom header. Its navigation body does not render a second brand. The desktop topbar no longer repeats the portal title already owned by the sidebar brand.
