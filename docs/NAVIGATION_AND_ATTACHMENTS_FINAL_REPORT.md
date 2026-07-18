# Navigation and Attachments Final Report

## Final status

**IMPLEMENTED AND PARTIALLY VERIFIED**

The Central and School portal navigation and school correspondence attachment implementation are complete at source level and passed the available automated quality gates. Authenticated browser, staging, real-file, and cross-tenant runtime scenarios remain pending because no dedicated test account/browser session was used in this implementation run.

## Files inspected

- Active App Router portal layouts and all school correspondence routes.
- `PortalShell`, `Drawer`, dialog, navigation controls, configuration, capability and permission registries.
- School API service, browser BFF client, generic gateway, document mappers, legacy attachment adapter, and translations.
- Local backend correspondence viewset, serializers, validators, service, permissions, and routes.

## Files changed

### Navigation and accessibility

- `src/config/navigation.types.ts`
- `src/config/navigation.central.ts`
- `src/config/navigation.school.ts`
- `src/components/layout/portal-shell.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/navigation/language-switcher.tsx`
- `src/components/navigation/theme-switcher.tsx`
- `src/components/navigation/notification-link.tsx`

### Correspondence attachments

- `src/components/correspondence/document-file-uploader.tsx`
- `src/components/correspondence/document-preview-dialog.tsx`
- `src/components/correspondence/attachment-uploader.tsx`
- `src/features/school/components/documents-screen.tsx`
- `src/features/school/services/school-api.ts`
- `src/features/school/mappers/school.ts`
- `src/lib/api/gateway.ts`

### Translation, exports, tests, and documentation

- `src/i18n/messages/ar.json`, `src/i18n/messages/en.json`
- `src/components/index.ts`
- `tests/school-admin.test.mjs`, `tests/central-school-administrators.test.mjs`
- This report and the five companion audit/implementation/security/API-map documents.

## Navigation result

- Central and School navigation is a serializable `NavigationGroup`/`NavigationItem` structure.
- School groups: Main, Administration, Academic Affairs, Correspondence and Archive, Follow-up, System.
- Correspondence is collapsible and opens for an active permitted child route.
- Visibility applies implementation state, verified capability, required permission, any-of permission, and all-of permission filters. Empty groups do not render.
- Locale-aware route matching supports nested and dynamic paths without incorrectly marking the correspondence overview active.
- Collapsed navigation has translated hover/focus tooltips. The mobile drawer keeps labels visible, traps focus, restores focus, supports Escape/overlay close, and locks background scrolling.

## Attachment result

- A shared `DocumentFileUploader` handles click, drag/drop, keyboard selection, multi-file queues, PDF extension/MIME/size checks, duplicate detection, primary-file selection, cancellation, removal, retry, safe error codes, and local status announcements.
- Document creation precedes upload. Partial upload failure preserves the created document and offers a path to retry affected files.
- Reply queues upload to the newly created reply document ID.
- Detail preview fetches a PDF only through the same-origin BFF, validates `application/pdf`, creates a temporary object URL, and revokes it on cleanup.
- Downloads stream through the same-origin BFF. No storage URL, backend origin, or browser token is rendered.
- Uploaded attachments have no delete/reorder/post-upload-primary UI because the verified backend contract provides none.

## Actual attachment endpoints

| Action | BFF path pattern | Backend path pattern | Method |
| --- | --- | --- | --- |
| Create document | `/api/gateway/school/admin/documents` | `/api/v1/admin/documents` | POST |
| Upload/list | `/api/gateway/school/admin/documents/{id}/attachments` | `/api/v1/admin/documents/{id}/attachments` | POST / GET |
| Preview | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/preview` | same under `/api/v1` | GET |
| Download | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/download` | same under `/api/v1` | GET |

Required backend permissions are `DOCUMENTS_CREATE`, `DOCUMENTS_READ`, `DOCUMENTS_UPDATE`, `DOCUMENTS_PREVIEW`, and `DOCUMENTS_DOWNLOAD` as appropriate. `DOCUMENTS_UPDATE` is the verified upload permission; no invented `DOCUMENT_ATTACHMENTS_UPLOAD` code was used.

## Security result

- Client components use same-origin BFF paths only.
- Uploads use `FormData` without a manually-set multipart content type.
- Browser code does not set `Authorization`, `Cookie`, or `X-School-ID`.
- CSRF/Origin protection remains enforced by the generic gateway for POST uploads.
- The gateway retains content type, disposition, content length, request ID, and secure cache policy for PDF binary responses.
- The mapper intentionally discards backend-provided media path fields from client state; BFF paths are constructed from identifiers.
- No tokens, passwords, file contents, storage paths, or backend origins are logged by the new attachment code.

## Accessibility, RTL/LTR, and theme result

- Navigation uses semantic lists, `aria-current`, `aria-expanded`, `aria-controls`, translated labels, and focus-visible states.
- Icon-only new controls provide `aria-label` and hover/focus tooltips.
- Dialog and drawer behavior includes Escape, focus trapping, and focus restoration.
- New layout uses logical `start`/`end` utilities and `text-start`; it does not force RTL.
- New components use semantic color tokens and therefore inherit light/dark mode.

## Verification evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Translation JSON | PASS | Both Arabic and English files parsed through `ConvertFrom-Json`. |
| TypeScript | PASS | `npm run typecheck` exited 0. |
| Lint | PASS | `npm run lint` exited 0 with no warnings or errors. |
| Tests | PASS | `npm test`: 40 passed, 0 failed. |
| Production build | PASS | `npm run build` exited 0 and generated all listed portal/BFF routes. |
| Formatting diff check | PASS | `git diff --check` produced no errors. |
| Lockfile integrity | PASS | `package-lock.json` is absent from the diff. |
| Real authenticated attachment upload/preview/download | NOT EXECUTED | Requires authorized non-production test account and browser/runtime session. |
| Playwright/E2E | NOT EXECUTED | No Playwright script or configured test credentials were present in `package.json`. |
| Tenant-isolation runtime attempt | NOT EXECUTED | Requires two approved school test tenants and accounts. |
| Responsive browser QA | NOT EXECUTED | Source-level responsive behavior implemented; visual viewport testing remains required. |

The Node test runner emitted the existing `MODULE_TYPELESS_PACKAGE_JSON` warning for ESM-style JavaScript test helpers; it is non-blocking and was not altered because adding package module mode could change the project runtime contract.

## Remaining validation work

1. Use approved School A/School B test accounts to verify `403`/`404` attachment isolation and no binary/metadata leakage.
2. Upload valid, invalid, oversized, Arabic-named, long-named, and duplicate PDFs in a browser.
3. Verify preview/download headers and filename handling with real BFF responses.
4. Exercise missing permissions (`DOCUMENTS_UPDATE`, `DOCUMENTS_PREVIEW`, `DOCUMENTS_DOWNLOAD`) at UI and direct BFF levels.
5. Run responsive/keyboard/screen-reader checks at the required viewports in Arabic/English and light/dark mode.

## Readiness for this feature

The source implementation is ready for controlled QA/staging validation. It is not claimed as fully runtime-verified until the remaining authenticated and browser-dependent scenarios are executed with approved test data.
