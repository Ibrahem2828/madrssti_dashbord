# Route smoke matrix

All routes below are active localized routes that should be verified in Arabic and English during Phase 3.

| Area | Arabic example | English example | Expected result |
|---|---|---|---|
| Public login selector | `/ar/login` | `/en/login` | portal selection page |
| Central login | `/ar/login/central` | `/en/login/central` | Central login form |
| School login | `/ar/login/school` | `/en/login/school` | School login form |
| Unauthorized | `/ar/unauthorized` | `/en/unauthorized` | forbidden-style state |
| Session expired | `/ar/session-expired` | `/en/session-expired` | session-expired state |
| Central dashboard | `/ar/central` | `/en/central` | authenticated Central shell |
| Central schools | `/ar/central/schools` | `/en/central/schools` | schools workspace |
| Central health | `/ar/central/health` | `/en/central/health` | health workspace |
| Central tickets | `/ar/central/tickets` | `/en/central/tickets` | tickets list |
| Central ticket detail | `/ar/central/tickets/{ticketId}` | `/en/central/tickets/{ticketId}` | ticket detail |
| Central audit | `/ar/central/audit` | `/en/central/audit` | audit list |
| Central policies | `/ar/central/policies` | `/en/central/policies` | policies workspace |
| School dashboard | `/ar/school` | `/en/school` | authenticated School shell |
| School users | `/ar/school/users` | `/en/school/users` | users workspace |
| School academic | `/ar/school/academic` | `/en/school/academic` | academic workspace |
| School attendance | `/ar/school/attendance` | `/en/school/attendance` | attendance workspace |
| School correspondence | `/ar/school/correspondence` | `/en/school/correspondence` | correspondence workspace |
| School document detail | `/ar/school/correspondence/{documentId}` | `/en/school/correspondence/{documentId}` | document detail |
| Document categories | `/ar/school/correspondence/categories` | `/en/school/correspondence/categories` | category CRUD workspace |
| Correspondence parties | `/ar/school/correspondence/parties` | `/en/school/correspondence/parties` | party CRUD workspace |
| School archive | `/ar/school/archive` | `/en/school/archive` | archive workspace |
| School reports | `/ar/school/reports` | `/en/school/reports` | reports hub |
| School notifications | `/ar/school/notifications` | `/en/school/notifications` | notification center |
| School tickets | `/ar/school/tickets` | `/en/school/tickets` | tickets workspace |
| School settings | `/ar/school/settings` | `/en/school/settings` | settings workspace |
| Legacy admin redirect | `/ar/admin` | `/en/admin` | redirect to modern school route |
| Legacy admin notice routes | `/ar/admin/points` | `/en/admin/points` | retirement notice |
| Not found | `/ar/does-not-exist` | `/en/does-not-exist` | localized 404 behavior |
