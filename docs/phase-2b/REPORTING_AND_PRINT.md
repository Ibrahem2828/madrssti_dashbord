# Reporting and print

## Verified report sources surfaced in Phase 2B

The active reports hub uses only verified endpoints inspected from the repository/backend source:

- `GET /api/v1/admin/reports/overview`
- `GET /api/v1/reports/kpis`
- `GET /api/v1/admin/reports/attendance`
- `GET /api/v1/admin/reports/points`
- `GET /api/v1/admin/reports/behavior`
- `GET /api/v1/reports/at-risk`

No legacy mock report component is used by the active reports hub.

## Implemented Reports Hub

Route:

- `/[locale]/school/reports`

Sections:

- School overview cards
- KPI summary cards
- Attendance summary
- Points listing
- Behavior severity summary
- At-risk students table/cards
- Print notes

## Filter model

The reports hub exposes only filters supported by the verified contracts:

- from date
- to date
- classroom
- grade

These filters are URL-backed and reused across all report sections.

## Print foundation

Phase 2B intentionally implements browser print only.

Static behavior:

- print header surfaces route title and active school name
- print CSS forces a light readable surface
- shell chrome is hidden in print mode
- both RTL and LTR remain structurally supported because print relies on the locale-aware root direction

## Explicit non-features

Hidden because unsupported or unverified:

- backend PDF generation
- CSV/XLS export endpoints
- generated report reference numbers
- fake trend analytics
- fake comparative charts

## Legacy report cleanup

Legacy mock/random report components remain in `src/components/reports/*` only as deprecated unreachable source. They are excluded from active navigation and documented for Phase 3 deletion review.

## Phase 3 verification focus

- browser print output in Arabic RTL
- browser print output in English LTR
- report payload shape compatibility with mapper assumptions
- large table pagination/overflow in print mode
- at-risk endpoint filter behavior
