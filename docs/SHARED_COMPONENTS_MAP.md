# Shared components map

| Component / utility | Responsibility | Consumers |
| --- | --- | --- |
| `PortalBrand` | Portal title, system subtitle, icon, collapse/mobile close behavior | Desktop sidebar, mobile drawer |
| `PortalShell` | Portal layout and interaction state | Central and School layouts |
| `Drawer` | Focus-trapped side panel, overlay, close and optional custom header | Mobile navigation and other panels |
| `filterNavigationForSession` | Permission/capability-aware nav visibility | Portal shell, command palette input |
| `isNavigationItemActive` | Normalized active route resolution | Portal shell/group state |
| `requestSchoolSwitch` | CSRF-protected same-origin school switch request | School switcher, legacy School context |
| `FormControl` / `StickyPageActions` | Visible labels and reachable mobile actions | Document and school management forms |
| `ConfirmDialog` / `ReasonDialog` | Sensitive mutation acknowledgement | Document and school workflows |
| `ErrorState` / `EmptyState` | Product feedback states | Feature screens |
