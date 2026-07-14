# Security review

## Security architecture preserved

Phase 2B did not replace the Phase 1 security model.

Still authoritative:

- HttpOnly session cookies for access/refresh tokens
- same-origin browser communication only
- server-only backend base URL
- portal-scoped Central/School isolation
- CSRF validation for mutating BFF routes
- origin validation at the BFF layer
- Central prohibition on `X-School-ID`
- server-managed School context

## Security-sensitive 2B decisions

Notifications:

- unread count and list are loaded from the same-origin School gateway only
- no fake or client-persisted count was introduced
- no realtime transport was invented

Reports:

- only verified report endpoints are surfaced
- no fake totals, reference numbers, or export artifacts are produced

Archive:

- archived list is a filtered real document view
- restore/destruction were hidden because backend support is absent
- archive reason continues to be collected through the dedicated archive mutation path

Legacy finalization:

- `/admin` is removed from active navigation
- ambiguous legacy journeys are replaced by explicit notices instead of unsafe guesswork
- mock-heavy report components remain unreachable from the active product

## Remaining Phase 3 security checks

- cookie behavior across actual deployed domains and HTTPS
- CSRF and origin enforcement in real browser requests
- gateway binary behavior for attachment preview/download
- school-switch mutation behavior after network failures
- exact backend payload compatibility for archive/report/notification errors
