# Central school user management — implementation report

## Implemented

- Added explicit Django Central school-user endpoints under `apps.central`.
- Added Central permission codes to the RBAC seed registry.
- Enforced Central session scope, selected-school membership lookup, school-scoped role validation, forbidden Central permissions, audit records, reason requirements, and last-principal protection.
- Added Central BFF client integration through the existing scope-enforcing gateway; no direct Django browser call or `X-School-ID` input was introduced.
- Added localized English and Arabic Central user list, creation, detail, role, permission, audit, reset-password, and enable/disable interfaces.
- Added focused Django tests for creation, cross-school denial, role/permission isolation, audit request IDs, required disable reason, and last-administrator protection.

## Intentionally not implemented as unsupported contracts

- Employment, teaching, student, guardian, and "force password change" profile fields: the current `User` and Central contracts do not store them.
- A Central user-delete endpoint: destructive deletion was not present in the agreed Central contract.
- Session termination and failed-login counters: the backend has no authoritative contract for them.
- A user-facing audit reason for every profile edit: the active contract requires reasons for sensitive changes only.

## Deployment requirement

Deploy the Django changes and run `python manage.py seed_permissions` before exposing the Central UI to non-superuser Central IT accounts. Existing Central IT users currently have broad access through the project's `UserType.CENTRAL_IT` rule; the seed keeps the contract registry complete for future delegated Central roles.

## Verification status

### Passed

| Check | Result |
| --- | --- |
| `python -m pytest apps/central/tests` | PASS — 10 passed |
| `python manage.py check` | PASS — no issues |
| `python manage.py makemigrations --check --dry-run` | PASS — no model changes detected; the optional migration-history connection check emitted an external DNS warning only |
| `npm ci` in `C:\dev\madrasti-dashboard` | PASS — clean install completed |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — no warnings or errors |
| `npm test` | PASS — 35 tests passed, including Central school-user coverage |
| `npm run build` | PASS — all Central school-user routes compiled |

### Defects corrected during verification

- Replaced use of the removed `UserManager.make_random_password()` API with `get_random_string()` in Central password generation paths.
- Made `request.school` access safe in the authenticated school-context paths that were exercised by the test client, avoiding an `AttributeError` when middleware has not attached the attribute.
- Added explicit portal-isolation error codes for Central-to-School and School-to-Central attempts while retaining the legacy Central ticket compatibility route.
- Blocked global profile edits through a single school URL for users that have another school membership.
- Return `409 EMAIL_ALREADY_EXISTS` before attempting Central user creation or profile email changes.

### Not fully verified / release blockers outside this module

`python -m pytest` completed with **78 passed and 30 failed**. The Central suite passed in full. The remaining failures are legacy backend issues outside this feature, including QR-token fixture collisions, attendance idempotency/domain defects, response-envelope contract drift, a ticket-list pagination expectation mismatch, throttling state leakage across tests, and several existing points/quiz/RBAC contract mismatches.

`python manage.py check --deploy` exits zero but reports deployment warnings, including `DEBUG=True`, missing HSTS/SSL-cookie/X-Frame-Options hardening, and a development-quality secret key. These deployment settings must be corrected in the production configuration before a staging or production security sign-off.

`npm ci` also reports six dependency audit findings (two moderate and four high) and deprecation notices. They were not auto-fixed because the requested implementation must not perform unreviewed dependency upgrades.

## Final readiness

**IMPLEMENTED BUT NOT FULLY VERIFIED**

The Central school user-management module, its tenant isolation, BFF usage, audits, permission gates, translations, and focused backend/frontend verification are complete. The final UI review also verifies that the directory header renders the selected school's actual name, code, and activation state without making that auxiliary request a prerequisite for the user list. A full platform release claim is intentionally withheld until the unrelated backend suite failures and deployment-security configuration warnings above are resolved, then the full suite and runtime/E2E checks are rerun.
