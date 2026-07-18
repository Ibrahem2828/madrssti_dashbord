# Sidebar Navigation Implementation

## Configuration model

`NavigationGroup` contains a translation key, order, optional icon, collapsible state, and route items. `NavigationItem` contains its own identifier, label/description keys, route, serializable icon key, exact or dynamic route matchers, backend capability, permission requirements, and implementation state.

Central and school configurations are in:

- `src/config/navigation.central.ts`
- `src/config/navigation.school.ts`

School groups are Main, Administration, Academic Affairs, Correspondence and Archive, Follow-up, and System. Correspondence is collapsible; it automatically opens when a permitted child route is active.

## Rendering behavior

- Expanded desktop: group labels and navigation labels are visible.
- Collapsed desktop: compact items receive translated keyboard-and-hover tooltips. Correspondence opens a bounded floating panel rather than clipped labels.
- Mobile: `Drawer` renders all labels and groups, traps focus, restores it on close, closes on Escape/overlay click, and locks background scroll.
- Route matching strips `/ar` or `/en`, accepts dynamic path matchers, and prevents the correspondence overview from being active on a nested child page.

## Access evaluation

`PortalShell` filters each item by `implemented`, verified backend `capability`, one required permission, any-of permissions, and all-of permissions. It then removes groups with no permitted items. Backend enforcement remains authoritative.

## Labels and accessibility

The new `Tooltip` component supplies a focus-visible tooltip for compact icon-only controls. The portal shell uses semantic `nav`, lists, `aria-current`, `aria-expanded`, and `aria-controls`. New labels are in both `ar.json` and `en.json` under `navigation.groups` and `navigation.descriptions`.
