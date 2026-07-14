# Performance review

## Static improvements completed in Phase 2B

- Server Components remain the default route model; Client Components are still limited to interactive surfaces.
- Active 2B additions reuse the same-origin BFF client and avoid direct backend browser traffic.
- The command palette, notification badge, school switcher, dialog, drawer, and topbar behaviors stay isolated as client boundaries.
- Active binary preview/download remains gateway-based and does not introduce base64 persistence.
- No object-URL preview layer was added, so there is no new object-URL lifetime risk.
- No new dependency or heavy runtime library was introduced.
- Shared UI primitives reduce duplication across buttons, inputs, cards, and feedback surfaces.

## Known performance tradeoffs retained

- Several feature screens still manage their own `useEffect` fetch flow rather than converging on a single abortable query abstraction.
- Some large screen files remain monolithic and should be measured during Phase 3 rather than rewritten blindly in Phase 2B.
- Notification unread count is loaded on mount and not streamed in realtime by design.

## Runtime profiling plan deferred to Phase 3

Phase 3 should inspect:

- route hydration cost of the shell and topbar controls
- repeated fetches across navigation transitions
- report screen load behavior under large datasets
- attachment preview/download latency through the gateway
- mobile shell interaction latency on low-power devices
