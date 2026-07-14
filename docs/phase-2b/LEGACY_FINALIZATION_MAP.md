# Legacy finalization map

| Legacy area | Current responsibility | Phase 2B state | Classification | Phase 3 action |
|---|---|---|---|---|
| `src/app/[locale]/admin/layout.tsx` | historical admin shell | replaced by minimal compatibility layout | Deprecated and unreachable from active nav | safe to delete after smoke test of redirects/notices |
| `src/app/[locale]/admin/page.tsx` | old admin landing | redirects to `/school` | Migrated | keep until redirect verified |
| `src/app/[locale]/admin/attendance/page.tsx` | old attendance entry | redirects to `/school/attendance` | Migrated | keep until redirect verified |
| `src/app/[locale]/admin/correspondence/page.tsx` | old correspondence entry | redirects to `/school/correspondence` | Migrated | keep until redirect verified |
| `src/app/[locale]/admin/reports/page.tsx` | old reports entry | redirects to `/school/reports` | Migrated | keep until redirect verified |
| `src/app/[locale]/admin/users/page.tsx` | old users entry | redirects to `/school/users` | Migrated | keep until redirect verified |
| `src/app/[locale]/admin/points/page.tsx` | legacy mock points route | replaced by retirement notice | Deprecated and unreachable from active nav | safe deletion candidate once stakeholders confirm no alias needed |
| `src/app/[locale]/admin/halaqat/page.tsx` | legacy halaqat route | replaced by retirement notice | Deprecated and unreachable from active nav | safe deletion candidate once supported migration exists or route alias is removed |
| `src/components/reports/*` | legacy report widgets/export templates | retained but unreachable from active product | Deprecated and unreachable | review and delete after Phase 3 if no hidden import remains |
| `src/contexts/AuthContext.tsx` | legacy auth import surface | compatibility adapter over canonical provider | Compatibility adapter | remove after import graph cleanup |
| `src/contexts/SchoolContext.tsx` | legacy school-context import surface | compatibility adapter over canonical provider | Compatibility adapter | remove after import graph cleanup |
| `src/components/shared/providers.tsx` | legacy provider entry point | delegates to `AppProviders` | Compatibility adapter | remove after import graph cleanup |
| legacy direct admin shell patterns | old sidebar/navbar assumptions | superseded by `PortalShell` | Deprecated pattern | delete once old route group is removed |

## Finalization rules applied in 2B

- No legacy route appears in active navigation.
- No legacy mock report is reachable from the active shell.
- Unambiguous legacy routes redirect to a verified modern route.
- Unsupported legacy routes surface an explicit retirement notice rather than silently failing.
