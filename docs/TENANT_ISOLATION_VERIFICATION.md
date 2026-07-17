# Madrasti Dashboard — Tenant Isolation Verification

## Status

**BLOCKED for authenticated runtime proof.** No School A / School B disposable fixtures, user credentials, or authorization to create test data were supplied. No tenant mutation was attempted.

## Evidence completed without tenant data

| Check | Evidence | Result |
| --- | --- | --- |
| Browser-provided School header is not trusted | Gateway source review and `school-admin.test.mjs` | PASS |
| School context comes from server-managed session state | `src/lib/api/gateway.ts`, session mapper tests, and active-school login regression tests | PASS |
| School gateway refuses Central path family | `school-admin.test.mjs` | PASS |
| Central gateway never attaches School context | Gateway source review | PASS |
| Unauthenticated forged tenant and authorization headers do not establish a session | Local production gateway probes | PASS — `401 AUTHENTICATION_REQUIRED`, no token response, request ID present |

## Required fixture matrix

The following must be supplied or created in a non-production environment before this report can be closed:

| Fixture | School A | School B |
| --- | --- | --- |
| School administrator | Admin A | Admin B |
| Ordinary user | User A | User B |
| Role / direct permission | Role A | Role B |
| Correspondence document | Document A | Document B |
| Attachment | Attachment A | Attachment B |
| Categories / parties / ticket / settings | A-scoped | B-scoped |

## Mandatory authenticated matrix

For each request, record UI result, BFF status/code/request ID, backend status/code/request ID, and whether any foreign metadata was visible.

| Actor | Attempt | Expected result | Actual result |
| --- | --- | --- | --- |
| Admin A | Open User B, Role B, Document B, Attachment B, Category B, Party B, Ticket B, or Settings B using modified path IDs | `403` or `404`, no metadata | BLOCKED |
| Admin A | Send `school_id` in query or JSON body | Ignored or rejected; effective School A remains server-derived | BLOCKED |
| Admin A | Send forged `X-School-ID: SchoolB` through browser | Ignored; BFF uses server cookie/session context | PASS for unauthenticated rejection; authenticated proof BLOCKED |
| Central user | Call School gateway or supply School header | Portal isolation rejection; no School context attached | BLOCKED for authenticated proof |
| School user | Call Central path via School gateway | `403 PATH_FORBIDDEN` once authenticated | BLOCKED |
| Admin A | Refresh stale data after switching user/session | No cached School B records | BLOCKED |

## Execution rules for the remaining test

1. Use only designated test tenants.
2. Do not delete production data or mutate shared customer records.
3. Start with read-only IDOR attempts; stop if data leakage occurs.
4. Record only safe IDs and request IDs; never record tokens, cookies, or passwords.
5. Treat `200`, partial metadata, or `500` for a foreign resource as a release blocker.

## Release interpretation

Tenant isolation cannot be marked PASS without the authenticated School A / School B matrix. Existing source-level defenses reduce risk but are not a substitute for backend authorization proof.
