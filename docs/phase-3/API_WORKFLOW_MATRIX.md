# API workflow matrix

| Workflow | Frontend route | Same-origin endpoint(s) | Core assertions |
|---|---|---|---|
| Central login | `/[locale]/login/central` | `/api/auth/central/login`, `/api/auth/session` | tokens never exposed, redirect safe |
| School login | `/[locale]/login/school` | `/api/auth/school/login`, `/api/auth/session` | school portal only, safe redirect |
| Refresh | any protected route | `/api/auth/refresh`, `/api/auth/session` | no refresh loop |
| Logout | shell user menu | `/api/auth/logout` | cookies cleared, session reset |
| Create school | `/[locale]/central/schools` | Central gateway schools POST | validation and success refresh |
| Create principal | school detail workflow | Central gateway create-admin POST | temp password disclosure safe |
| Reset principal password | school detail workflow | Central gateway reset-admin-password POST | reason and temp password handling |
| Create school user | `/[locale]/school/users` | School gateway users POST | field errors and refresh |
| Assign role | `/[locale]/school/users` | School gateway user roles POST | permission-gated |
| Grant permission | `/[locale]/school/users` | School gateway grant POST | reason and effective permissions refresh |
| Revoke permission | `/[locale]/school/users` | School gateway revoke POST | reason and effective permissions refresh |
| Manual attendance record | `/[locale]/school/attendance` | School gateway manual attendance POST | validation and reload |
| Excuse approve/reject | `/[locale]/school/attendance` | School gateway excuse endpoints | confirmation and row refresh |
| Create document | `/[locale]/school/correspondence` | School gateway documents POST | enum mapping and refresh |
| Upload attachment | document detail | School gateway attachments POST | multipart handling |
| Preview attachment | document detail | School gateway preview GET | binary response |
| Download attachment | document detail | School gateway download GET | binary response and filename |
| Mark sent | document detail | School gateway mark-sent POST | only valid direction shown |
| Mark received | document detail | School gateway mark-received POST | only valid direction shown |
| Reply | document detail | School gateway create-reply POST | validation and refresh |
| Link | document detail | School gateway link POST | relation mapping and refresh |
| Archive | document detail / archive workspace | School gateway archive POST + documents GET | reason required, archived list update |
| Ticket assign/close | Central or School tickets | ticket mutation endpoints | permission gate and refresh |
| Policy update | `/[locale]/central/policies` | Central gateway policies PATCH | safe mutation and refresh |
| Notification read | `/[locale]/school/notifications` | School gateway notifications PATCH | count/list consistency |
| Reports load | `/[locale]/school/reports` | verified report endpoints | no fabricated totals |
