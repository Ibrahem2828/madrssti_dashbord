# Refactoring architecture

## Dependency direction

`app → features → shared components → lib/config → UI primitives`

The refactor preserves this direction. Navigation policy sits in `src/lib/navigation`, UI identity in `src/components/layout`, and domain permissions/endpoints remain in `src/config` and feature services. UI primitives do not import feature code.

## Shared navigation boundary

`filterNavigationForSession(navigation, session.permissions)` is the single discoverability policy. It applies capability, implemented-route, single permission, any-permission, and all-permission checks and removes empty groups. `isNavigationItemActive` normalizes locale, query/hash fragments, trailing slashes, nested routes, aliases, and configured dynamic matchers.

## Portal shell boundary

`PortalShell` owns desktop/sidebar layout, mobile drawer, header controls, and main region. Pages own only their page header and content. `PortalBrand` owns portal identity and is used once in the desktop sidebar and once in the mobile drawer header.

## Compatibility boundary

Legacy contexts remain adapters over `PortalSession`; they do not store tokens or create a second authenticated session. The School adapter delegates its BFF request to the shared client helper and refreshes the sanitized session only after server success.
