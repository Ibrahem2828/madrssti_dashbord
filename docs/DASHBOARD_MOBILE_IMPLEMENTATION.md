# Dashboard mobile implementation

## Header

`PortalShell` renders a compact phone header with a navigation button, shortened current-page title, permitted notification control, and account-menu trigger. The long user name, email, school name, role badges, language, and theme controls are not permanently rendered in the narrow header. Personal and contextual data live in the account menu instead.

## Navigation drawer

`Drawer` supplies modal semantics, focus trapping, focus restoration, Escape handling, background-scroll locking, and an overlay close action. On mobile, the sidebar groups are accordion sections and route selection closes the drawer.

## Forms and actions

`FormControl` provides an always-visible label for primary correspondence and Central school create/edit controls. `StickyPageActions` keeps the submit action available on small screens and deliberately becomes non-sticky on desktop.

## Tables and attachments

Collection screens use a desktop table and mobile record-card pattern where a card view is supplied. The generic table is horizontally safe and token-driven. Attachment cards wrap filename metadata and actions so preview/download controls do not force horizontal layout.

## Runtime checks still required

Use an authenticated School session at 390px to create a document, open the drawer, upload a permitted PDF, inspect sticky actions, and verify no overflow. This repository does not include credentials or a configured Playwright browser suite, so these checks are not claimed complete.
