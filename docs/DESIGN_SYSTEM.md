# Design System

## Foundations

The design system is token-based. CSS variables in `src/styles/globals.css` define semantic colors for background, surface, foreground, border, primary, accent, success, warning, danger, info, and sidebar. `tailwind.config.ts` exposes those values as Tailwind utilities, so components do not hard-code theme colors.

- Typography: system UI stack with Arabic fallbacks; responsive page titles and readable 14px body text.
- Spacing: 4px-derived utility scale; page rhythm is `gap-6`, component rhythm is `gap-3` or `gap-4`.
- Layout: a `max-w-7xl` page container, responsive grids, logical start/end properties, and a single mobile drawer.
- Shape/elevation: `rounded-xl`/`rounded-2xl`, bordered surfaces, restrained `shadow-sm` and `shadow-lg` only for sticky or modal layers.
- Themes: `.dark` overrides semantic variables; `color-scheme` is declared for native controls.

## Interaction and states

All controls use visible keyboard focus. Dialogs, drawers, menus, toast patterns, forms, tables, and feedback states reuse the same semantic tokens. Motion is intentionally subtle and guarded by `prefers-reduced-motion`; route and drawer surface transitions never block interaction.

## Status semantics

`Badge` and `InlineAlert` use the shared neutral, primary, success, warning, danger, and accent variants. Status labels remain translated by domain enum mappers rather than client-side business rules.

## Responsive and RTL rules

The same DOM adapts from phone to large desktop. Tables use horizontal containment or mobile record cards; page actions become reachable sticky actions on small screens. Components use logical CSS (`start`, `end`, `border-e`, `pe`) rather than direction-specific positioning.

## Phase 2 verification additions

Public browser smoke coverage verifies both Arabic RTL and English LTR document direction and checks phone-width horizontal overflow. Full contrast, screen-reader, zoom, and authenticated responsive verification remain release-environment checks because they need the complete rendered application state.
