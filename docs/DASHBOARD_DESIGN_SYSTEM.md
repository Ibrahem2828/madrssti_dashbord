# Madrasti Dashboard Design System

## Tokens and themes

`src/styles/globals.css` owns semantic light and dark tokens for background, foreground, card, popover, muted content, border, input, ring, primary navy, controlled gold accent, success, warning, danger, and sidebar states. `tailwind.config.ts` maps these variables to semantic utilities; feature screens should not introduce business-color literals.

Theme selection is initialized before hydration and persisted through the existing non-sensitive theme cookie. `color-scheme`, focus rings, and reduced-motion behavior are defined centrally.

## Typography and layout

- System font stack includes Arabic-capable fallbacks without a network font dependency.
- Screen layout uses responsive grid/flex composition, logical `border-e`/direction-aware drawer placement, mobile record cards, table scrollers, and touch-sized controls.
- The standard spacing rhythm is based on Tailwind’s 4px scale; controls use shared minimum-height and semantic spacing conventions.

## Shared components

| Group | Components / responsibilities |
| --- | --- |
| Shell | `PortalShell`, navigation, mobile drawer, breadcrumbs, command palette, user menu, language/theme controls |
| Inputs | button, icon button, input, textarea, select, checkbox/switch patterns, form sections |
| Data | cards, tables, mobile record cards, filters, pagination, badges, metadata lists |
| Feedback | loading, empty, filtered-empty, error, forbidden, unsupported, inline success/error |
| Overlay | accessible `Dialog` and `ConfirmDialog` with Escape close, focus restoration, Tab focus containment, labels/descriptions, and responsive height |

## Accessibility commitments

- Skip-to-content, semantic main/navigation landmarks, active navigation `aria-current`, accessible icon labels, visible focus state, keyboard drawer/dialog controls, reduced motion, and light/dark semantic contrast are implemented in shared primitives.
- Required runtime checks remain keyboard traversal, screen-reader semantics, contrast measurement, and browser viewport behavior.

## Usage rules

1. Use a shared component before adding a new visual primitive.
2. Use translation keys for visible product text.
3. Use permission/capability boundaries around actions; hiding a control is not authorization.
4. Use a `Dialog`/confirmation pattern for sensitive mutations; do not expose temporary credentials after the user closes the controlled disclosure.
5. Use logical CSS and responsive structures rather than fixed left/right layout assumptions.
