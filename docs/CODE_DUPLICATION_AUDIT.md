# Code duplication audit

This is a source-level audit. It distinguishes confirmed duplication from retained compatibility surfaces; no file was removed merely because it has no direct import in the current route tree.

| Area | Files | Type | Risk | Refactor | Benefit | Compatibility concern | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Portal navigation policy | `portal-shell.tsx`, permission helpers | Logic/config | Sidebar and drawer could drift in permission behavior. | `filterNavigationForSession` and `isNavigationItemActive` in `lib/navigation`. | One visibility and active-route rule. | None; the same configs and permission codes remain. | Completed |
| Portal branding | Drawer generic header and shell sidebar header | Visual | Duplicate portal/system identity in mobile drawer. | `PortalBrand`; drawer accepts a custom accessible header. | Exactly one branded mobile header and one desktop sidebar brand. | Drawer keeps its default header for all other callers. | Completed |
| School switch request | `SchoolContext`, `SchoolSwitcher` | API/state | Cookie/CSRF/request behavior could diverge. | `requestSchoolSwitch` browser helper. | One same-origin request path. | Legacy context remains available. | Completed |
| Dialog mechanics | `Dialog`, `Drawer`, `ConfirmDialog`, `ReasonDialog` | Visual/accessibility | Similar focus logic is intentionally kept local to modal vs. side-panel semantics. | No unsafe merge. | Clear ownership by primitive. | Avoids a generic overlay abstraction. | Retained |
| Legacy dashboard widgets | `components/dashboard/*`, barrel exports | Legacy | No direct in-repo consumer was found, but barrel exports are a compatibility surface. | Documented, not deleted. | Prevents a breaking external import. | Public/local consumers may use exports. | Retained |
| Legacy session adapters | `contexts/AuthContext.tsx`, `contexts/SchoolContext.tsx` | Legacy/state | Old APIs may duplicate session projection. | School adapter reformatted and reuses switch helper. | Less duplicated BFF code. | Adapter contracts retained. | Partially completed |

## Explicitly not treated as duplication

Central and School navigation files are separate data sources because they define different authorized portals. They share filtering and active-route behavior, not route data. Feature service methods remain domain-specific because similar HTTP verbs do not imply identical backend contracts.
