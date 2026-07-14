# Responsive review

## Active shell behavior

The shell now represents these responsive states at source level:

- mobile drawer navigation for narrow screens
- collapsible desktop sidebar
- topbar controls that remain usable on mobile and tablet
- max-width constrained page body via `PageStack`
- print-specific shell suppression

## Active business screen behavior

Responsive alternatives now exist for the major record workspaces introduced or refined in 2B:

- notifications: desktop list + mobile record cards
- archive: desktop table + mobile record cards
- reports: desktop tables/cards + mobile record cards for at-risk students and points
- existing 2A correspondence/users/tickets screens continue to use mobile-friendly card/list patterns where already implemented

## Layout rules preserved

- no page-level `ml-64` / `mr-64` dependency in the active shell
- logical start/end utilities are used in the shell and controls
- action bars wrap rather than overflow
- filter bars stack to single-column first, then expand

## Breakpoint expectations for Phase 3

Source design supports review at these checkpoints:

- 360px phone width
- 390px phone width
- small tablet / portrait tablet
- desktop
- large desktop with constrained content width

## Remaining runtime checks

Phase 3 should verify:

- sticky header behavior on iOS/Android browsers
- drawer scrolling and body overlay behavior
- long translated labels in Arabic and English
- record card density on the smallest viewport
- print layout after browser pagination
