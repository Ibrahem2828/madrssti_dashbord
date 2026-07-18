# Dashboard CRUD matrix

Only operations represented by the checked-in endpoint configuration and feature services are listed. `STATIC` means source-integrated; it does not assert that a deployed backend accepts every payload.

| Resource | Read | Create | Update | Delete | Archive / state action | User-facing guard | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Central schools | `central/schools` | POST `central/schools` | PATCH `central/schools/{id}` | Not exposed | activate/deactivate | Central permission + `ConfirmDialog` | STATIC |
| Central primary administrator | GET admin state | POST `create-admin` | Not exposed as a generic profile edit | Not exposed | password reset | Central permission; reason is part of the reset contract | STATIC |
| Central scoped school users | GET scoped users | POST scoped users | PATCH scoped user | Not exposed | enable/disable, roles, direct permissions | Central permissions and scoped BFF path | STATIC |
| School users | GET `admin/users` | POST users | PATCH users | Not exposed | account/security and RBAC actions | School permissions and server-derived tenant | STATIC |
| Documents | GET document/list/activity | POST documents/replies | PATCH document | DELETE document | archive, mark sent/received, link | Capability + permission + confirm/reason dialog | STATIC |
| Attachments | GET/list/preview/download | multipart POST | Not represented | Not represented in current map | none | Document attachment permissions | STATIC |
| Categories | GET | POST | PATCH | DELETE | none | Management permission + `ConfirmDialog` | STATIC |
| Correspondence parties | GET | POST | PATCH | DELETE | none | Management permission + `ConfirmDialog` | STATIC |
| Attendance records | GET | manual POST | PATCH record | Not exposed | approve/reject excuse, QR lifecycle | Matching attendance permissions | STATIC |
| Tickets | GET/detail | Not represented as a generic create flow | assignment/close/escalate actions | Not exposed | close/escalate | Matching portal permission | STATIC |
| School settings | GET | Not applicable | PATCH settings/features | Not exposed | none | Settings permission | STATIC |
| Central policies | GET | Not applicable | PATCH policies | Not exposed | none | Central policy permission | STATIC |

## Excluded operations

No generic delete is exposed for schools, users, attachments, tickets, settings, or policies because the local endpoint map does not confirm such a contract. No hard-delete substitute has been added where archive, deactivate, close, or disable is the available business action.
