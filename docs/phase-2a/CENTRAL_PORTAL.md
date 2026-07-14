# Central portal completion

## Implemented routes

- `/[locale]/central`
- `/[locale]/central/health`
- `/[locale]/central/schools`
- `/[locale]/central/schools/[schoolId]`
- `/[locale]/central/tickets`
- `/[locale]/central/tickets/[ticketId]`
- `/[locale]/central/audit`
- `/[locale]/central/policies`

## Implemented modules

### Dashboard

Backed by:

- `GET /api/v1/central/dashboard/overview`
- `GET /api/v1/central/dashboard/schools-health`

Static characteristics:

- real API-only metrics
- no synthetic KPIs
- localized status labels
- quick links to implemented Central modules
- capability gate: `central.dashboard`
- permission-aware shell inherited from Phase 1

### Health

Backed by:

- `GET /api/v1/health`
- `GET /api/v1/central/dashboard/schools-health`

Static characteristics:

- system, database, and Redis state cards
- school health table
- localized status rendering
- capability gate: `central.health`

### Schools list

Backed by:

- `GET /api/v1/central/schools`
- `POST /api/v1/central/schools`

Static characteristics:

- server-driven search and status filters
- URL-backed filters
- server pagination
- create form in the page shell
- school detail drill-down
- no client-side full-dataset loading
- capability gate: `central.schools`

### School detail and principal lifecycle

Backed by:

- `GET /api/v1/central/schools/{id}`
- `PATCH /api/v1/central/schools/{id}`
- `POST /api/v1/central/schools/{id}/activate`
- `POST /api/v1/central/schools/{id}/deactivate`
- `GET /api/v1/central/schools/{id}/admin`
- `POST /api/v1/central/schools/{id}/create-admin`
- `POST /api/v1/central/schools/{id}/reset-admin-password`

Static characteristics:

- editable school profile
- activation and deactivation actions with confirmation
- principal state inspection
- principal creation form
- principal temporary password display held only in component state
- temporary password cleared when the operator closes the disclosure card
- principal password reset with confirmation and reason support

### Tickets

Backed by:

- `GET /api/v1/central/tickets`
- `GET /api/v1/central/tickets/{id}`
- `PATCH /api/v1/central/tickets/{id}/assign`
- `PATCH /api/v1/central/tickets/{id}/close`

Static characteristics:

- server pagination
- status and school filters
- localized status and priority labels
- detail route
- assign and close actions
- close confirmation
- capability gate: `central.tickets`

### Audit

Backed by:

- `GET /api/v1/central/audit`

Static characteristics:

- server-driven filters
- server pagination
- actor, school, entity, and timestamp columns
- capability gate: `central.audit`

### Policies

Backed by:

- `GET /api/v1/central/policies`
- `PATCH /api/v1/central/policies`

Static characteristics:

- list of verified policy keys
- JSON draft editor
- save confirmation
- update permission gate on the edit action
- capability gate: `central.policies`

## Permission model

Central UI uses exact verified backend codes:

- `CENTRAL_DASHBOARD_VIEW`
- `CENTRAL_SCHOOLS_READ`
- `CENTRAL_SCHOOLS_CREATE`
- `CENTRAL_SCHOOLS_UPDATE`
- `CENTRAL_SCHOOLS_ACTIVATE_DEACTIVATE`
- `CENTRAL_SCHOOL_ADMIN_READ`
- `CENTRAL_SCHOOL_ADMIN_CREATE`
- `CENTRAL_SCHOOL_ADMIN_RESET_PASSWORD`
- `CENTRAL_TICKETS_VIEW`
- `CENTRAL_TICKETS_ASSIGN`
- `CENTRAL_TICKETS_CLOSE`
- `CENTRAL_AUDIT_VIEW`
- `CENTRAL_POLICIES_READ`
- `CENTRAL_POLICIES_UPDATE`

Permissions and capabilities are both enforced statically in the Central portal screens.

## Security model retained

- browser traffic stays same-origin
- Central requests go only through `/api/gateway/central/*`
- the browser never receives raw access or refresh tokens
- the Central gateway never attaches `X-School-ID`
- sensitive mutations use confirmation prompts
- temporary principal passwords are never persisted to local storage, session storage, or URLs

## Remaining backend limitations

- no verified Central ticket comments/timeline endpoint
- no verified Central recent-activity dashboard feed beyond school-health summary
- no verified policy history/version endpoint
- no verified school-level audit detail endpoint inside Central school detail tabs
