# Security test matrix

| Area | Route/endpoint | Checks |
|---|---|---|
| Central login | `/api/auth/central/login` | same-origin enforcement, no token exposure |
| School login | `/api/auth/school/login` | same-origin enforcement, no token exposure |
| Session | `/api/auth/session` | sanitized payload only |
| Refresh | `/api/auth/refresh` | no refresh loop, cookie-only auth |
| Logout | `/api/auth/logout` | cookies cleared and session invalidated |
| School switch | `/api/auth/school/switch-school` | CSRF header, school context remains server-managed |
| Central gateway | `/api/gateway/central/*` | no `X-School-ID`, Central-only paths |
| School gateway | `/api/gateway/school/*` | rejects Central paths, validated school context |
| Downloads/previews | document attachments | no direct backend URL exposure |
| Redirect flows | login and middleware redirects | no open redirect |
| Portal isolation | `/central` vs `/school` | wrong portal redirected/blocked |
| Cookies | deployed domain | Secure, SameSite, HttpOnly behavior |
