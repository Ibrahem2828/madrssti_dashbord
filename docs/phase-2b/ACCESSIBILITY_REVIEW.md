# Accessibility review

## Scope reviewed statically

The 2B pass reviewed accessibility-sensitive source in:

- `src/components/layout/portal-shell.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/navigation/*`
- `src/components/feedback/*`
- `src/components/layout/product-framework.tsx`
- active Central and School business screens

## Completed source-level accessibility work

Landmarks and structure:

- skip-to-content link remains present in the shell
- main content landmark remains explicit
- navigation landmark is labeled
- page headers preserve one `h1` per route shell

Focus and keyboard behavior:

- dialog restores focus to the trigger and closes on Escape
- drawer restores focus to the trigger and closes on Escape
- user menu now closes on outside click and Escape, and returns focus to the trigger
- command palette supports Ctrl/Cmd+K

Labels and states:

- icon-only controls use `aria-label`
- breadcrumb nav is labeled
- notification region is labeled
- theme and language toggles remain accessible
- active navigation uses `aria-current`

Tables and status:

- active business tables remain semantic `<table>` structures
- canonical header cell supports `aria-sort`
- badges/alerts are not the only carrier of state because text labels remain present

Motion and target size:

- reduced motion handling remains in global styles
- buttons and interactive controls use minimum practical height near the 44px target

## Remaining Phase 3 browser checks

Static review cannot prove:

- actual focus order in every browser
- screen reader announcement quality
- keyboard trap edge cases on every dialog path
- mobile virtual keyboard behavior
- exact print/screen-reader interaction with hidden shell chrome

These are explicitly deferred to the Phase 3 accessibility matrix.
