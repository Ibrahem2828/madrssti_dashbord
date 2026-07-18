# Sidebar Navigation Review

## Findings

The active portal sidebar now has one implementation: `src/components/layout/portal-shell.tsx`. The old dashboard sidebar is retained for legacy paths and is not used by the central or school layouts.

The former active configuration was a flat list. It could not represent the enterprise information architecture, and a correspondence route could also make the correspondence overview appear active. The new model removes those issues.

## Review criteria

- Navigation is passed across the Server/Client boundary as plain serializable data only.
- Visibility uses effective permission checks plus backend capability declarations; it never uses a display role label as authorization.
- Empty groups are removed after filtering.
- Grouped correspondence items are kept only where a real App Router page exists.
- Locale is stripped before matching routes; dynamic IDs and nested pages do not activate unrelated primary items.
- Collapsed controls include labels through accessible tooltips; mobile always renders labels.

## Legacy status

`src/components/dashboard/sidebar.tsx` remains for legacy compatibility. It must not be reintroduced into Central or School portal layouts. Its emoji-based navigation is therefore isolated from active portal navigation and should be removed only after legacy route migration is complete.
