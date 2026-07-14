# Legacy migration map

| Legacy file or subsystem | Previous responsibility | Phase 2A responsibility | Status | Planned removal |
|---|---|---|---|---|
| `src/providers/auth-provider.tsx` | session bootstrap and auth state | retained as canonical session provider | Retained | after full legacy cleanup |
| `src/contexts/SchoolContext.tsx` | school state and switching | compatibility adapter over sanitized session and same-origin switch route | Adapted | Phase 2B or 3 |
| `src/services/apiClient.ts` | browser API transport | retained as same-origin client only | Adapted | keep |
| legacy direct service helpers under `src/services/*` | historical business transport | retained only where already same-origin and safe; new business work uses Phase 2A feature services | Adapted | Phase 2B |
| legacy `/[locale]/admin/*` pages | old school admin area | preserved for non-destructive migration, removed from new portal navigation | Deprecated but retained | after parity audit |
| legacy sidebar/navbar/dashboard components | old shell | superseded by Phase 1/2 portal shell and typed navigation | Deprecated but retained | after last `/admin` removal |
| `src/components/shared/toast.tsx` | legacy toast UI | retained, random ID generation removed | Adapted | optional redesign later |
| `src/components/correspondence/attachment-uploader.tsx` | legacy attachment uploader | retained, random progress removed | Adapted | replace after full correspondence parity |
| `src/components/reports/sharia-leaderboard.tsx` | legacy report widget with synthetic display values | retained outside new navigation, documented as legacy and non-Phase-2A | Deprecated but retained | Phase 2B or 3 |
| `src/components/reports/export-templates/*` | legacy export templates | retained outside new navigation, not part of migrated portals | Deprecated but retained | later reporting phase |
| legacy translation fragments embedded in old pages | old Arabic-only UI strings | new portal work moved to `src/i18n/messages/*.json`; legacy strings remain only in retained pages | Partially migrated | after legacy page removal |
| legacy correspondence pages | earlier correspondence workflows | replaced by `/school/correspondence*` routes backed by verified endpoints | Superseded in navigation | remove old routes after parity sign-off |
| legacy attendance pages | earlier attendance workflows | replaced by `/school/attendance` | Superseded in navigation | remove old routes after parity sign-off |
| legacy user/permission pages | earlier user management flows | replaced by `/school/users` | Superseded in navigation | remove old routes after parity sign-off |
| legacy settings pages | earlier school profile forms | replaced by `/school/settings` | Superseded in navigation | remove old routes after parity sign-off |

## Notes

- Legacy files were not deleted during Phase 2A.
- Remaining legacy code is either outside the new navigation or explicitly documented as compatibility-only.
- Any retained legacy component that still uses fake values is excluded from the new Central and School portal entry points.
