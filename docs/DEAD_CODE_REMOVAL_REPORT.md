# Dead code removal report

No file was deleted in this refactor.

| File / area | Candidate | Evidence | Decision | Risk | Verification |
| --- | --- | --- | --- | --- | --- |
| `components/dashboard/sidebar.tsx` and `navbar.tsx` | Legacy dashboard widgets | No direct in-repo import was found; both are re-exported from `components/index.ts`. | Retained. | Barrel exports can be consumed externally or by future legacy migration. | Typecheck/lint required after all changes. |
| `contexts/AuthContext.tsx` | Legacy session adapter | It is a compatibility surface and intentionally derives a tokenless projection. | Retained. | Removing could break a legacy consumer. | Not removed. |
| `contexts/SchoolContext.tsx` | Legacy school adapter | Its switch request duplicated the active switcher request. | Retained and refactored. | Old hook contract is retained. | Uses `requestSchoolSwitch`. |

The audit found no safe evidence for deleting route handlers, App Router route files, translations, or the legacy API adapter. These remain outside the deletion scope.
