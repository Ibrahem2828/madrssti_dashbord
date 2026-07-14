# Legacy migration map

| Legacy subsystem | Phase 1 status | Migration path |
|---|---|---|
| `AuthContext` | Adapted/deprecated | sanitized provider; no token access |
| `SchoolContext` | Adapted/deprecated | derives schools from session and calls BFF switching |
| `apiClient` / interceptor | Adapted/deprecated | default same-origin School gateway |
| Admin layout/sidebar/navbar | Retained | excluded from new portal navigation; replace in Phase 2 |
| `/admin` pages | Retained | migrate one module at a time after portal shells |
| i18n setup | Replaced | locale routing and complete message namespaces |

No legacy business page was deleted in Phase 1.
