# Information architecture

## Central portal active navigation

The active Central navigation remains intentionally narrow and capability-backed:

- Dashboard
- Schools
- System Health
- Tickets
- Audit
- Policies

Rationale:

- every item maps to a real route
- every item maps to verified Phase 1/2A backend support
- no speculative enterprise modules are exposed

## School portal active navigation

The School navigation was finalized in Phase 2B to reflect the actual product surface:

- Dashboard
- Users and permissions
- Academic setup
- Attendance and QR
- Correspondence and archive
- Archive
- Reports
- Notifications
- Tickets
- School settings

Rationale:

- archive and notifications are now directly discoverable
- reports are promoted because verified endpoints exist
- no dead links are rendered

## Navigation rules

- route visibility is permission-aware
- route availability is capability-aware
- active state is derived from the pathname
- the mobile drawer and desktop sidebar use the same source configuration
- command palette uses the visible navigation set plus local actions only

## Legacy route policy

The following routes remain in the codebase but not in active navigation:

- `/[locale]/admin/*`
- legacy report components under `src/components/reports/*`

Unambiguous legacy routes redirect to their modern destination.
Ambiguous or unsupported legacy routes show a retirement notice.

## Search and command behavior

Phase 2B deliberately implements command-style navigation search, not entity-global search.

Supported:

- page navigation
- theme toggle
- locale switch
- logout

Hidden because unsupported by verified backend contracts:

- cross-entity search
- searchable tickets/documents/users across modules from a single global endpoint
- persisted search history containing business entity names

## Breadcrumb rules

Breadcrumbs are localized and generated from route segments using typed label mappings in the shell.

Special handling exists for:

- central sections
- school sections
- correspondence categories/parties
- archive
- notifications
- reports

Opaque record IDs are not exposed as breadcrumb labels.

## Mobile information architecture

- sidebar becomes drawer navigation
- table-first workspaces expose mobile cards
- shell controls remain in the top bar
- school switcher stays in the top bar only when multiple validated schools exist

## Retired or intentionally hidden modules

The following remain outside the active IA until backed by verified routes/contracts:

- Halaqat
- legacy points experience
- speculative timetable
- speculative retention/archive governance controls
- speculative realtime notification feeds
