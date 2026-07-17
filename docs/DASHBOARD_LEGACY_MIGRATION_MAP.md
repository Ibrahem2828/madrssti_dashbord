# Dashboard Legacy Migration Map

| Legacy surface | Current responsibility | Migration state | New source of truth | Removal condition |
| --- | --- | --- | --- | --- |
| `/[locale]/admin/*` | historical School administration routes | Retained | `/[locale]/school/*` and School BFF | after route usage and deep links are migrated |
| `src/contexts/AuthContext.tsx` | historical auth consumer API | Deprecated adapter | `providers/auth-provider.tsx` sanitized `PortalSession` | when all imports use portal session |
| `src/contexts/SchoolContext.tsx` | historical active-School consumer API | Deprecated adapter | sanitized session + safe switch-school BFF | when all imports use portal session |
| `src/services/apiClient.ts` | historical generic client | Hardened adapter | `lib/api/browser-client.ts` plus feature services | after old service exports are unused |
| `src/services/apiInterceptor.ts` | historical auth/school context interface | Deprecated tokenless adapter | BFF-derived session and gateway | after old consumers are removed |
| Central root routes | dashboard/detail forms prior to explicit aliases | Retained and aliased | Central portal routes | aliases may remain for stable links |
| School root/document detail routes | dashboard, RBAC, document editing workspaces | Retained and aliased | School portal feature routes | aliases may remain for stable links |

No legacy page was deleted in this phase. All adapters must remain tokenless and same-origin until their consumers are intentionally migrated.
