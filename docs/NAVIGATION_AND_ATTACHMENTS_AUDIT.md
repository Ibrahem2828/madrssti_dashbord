# Navigation and Attachments Audit

## Scope and inventory

Reviewed the active App Router portals, `PortalShell`, navigation configuration, school correspondence pages, BFF gateway, school API service, permission registry, reusable dialog/drawer primitives, translation messages, and the local Django correspondence source.

## Navigation before this change

- Central and school routes already used `PortalShell`, but navigation was a flat list.
- Navigation had serializable icon names, which correctly avoided passing Lucide component functions through a Server/Client boundary.
- The flat list did not expose institutional groups, collapsible correspondence navigation, or capability filtering.
- The retained legacy `components/dashboard/sidebar.tsx` is not used by either active portal. It remains a legacy surface and is not a source of active navigation.

## Correspondence before this change

- Active pages and BFF-backed school service existed for document creation, listing, detail, replies, categories, parties, attachment upload, preview, and download.
- The active detail screen used one PDF input only. It did not queue multiple files, distinguish a primary file, support retry/cancel, or give partial-upload feedback.
- The old `AttachmentUploader` used the compatibility API client. It has been converted into a BFF-backed compatibility adapter.

## Verified backend contract

The local backend source (`apps/correspondence`) verifies these routes:

| Action | Backend endpoint | Permission |
| --- | --- | --- |
| Create document | `POST /api/v1/admin/documents` | `DOCUMENTS_CREATE` |
| List attachments | `GET /api/v1/admin/documents/{id}/attachments` | `DOCUMENTS_READ` |
| Upload PDF | `POST /api/v1/admin/documents/{id}/attachments` | `DOCUMENTS_UPDATE` |
| Preview PDF | `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/preview` | `DOCUMENTS_PREVIEW` |
| Download PDF | `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/download` | `DOCUMENTS_DOWNLOAD` |

The serializer accepts `file` and `is_primary`. The validator permits `.pdf`, `application/pdf` or `application/x-pdf`, with the backend-configured limit (20 MB by default). No delete, update, reorder, or post-upload primary-file endpoint is implemented, so no such client actions are rendered.

## Security and accessibility findings

- Browser attachment requests are same-origin BFF requests only.
- BFF supplies the authorization header and validated school context; the client sends neither token nor `X-School-ID`.
- The gateway already streams binary response bodies. This implementation additionally retains `Content-Length` when supplied and applies `Cache-Control: private, no-store` to PDF responses when Django did not provide a policy.
- The uploader validates files before upload but leaves backend validation authoritative.
- Dialog already traps focus. The drawer now traps focus, restores focus, supports Escape/overlay close, and prevents background scrolling.

## Contract uncertainties

- The backend does not advertise upload progress; Fetch therefore shows an accessible indeterminate upload state rather than fabricated percentages.
- Runtime permission responses, binary headers, and maximum-size configuration still require authenticated staging verification.

## Implementation plan applied

1. Make central and school navigation declarative, grouped, serializable, capability-aware, and permission-filtered.
2. Add expanded/collapsed/mobile behaviors and localized tooltips.
3. Replace the active one-file upload control with a reusable BFF-backed PDF uploader.
4. Create documents before flushing queued uploads; retry only failed files.
5. Create replies before flushing reply-file queues to the reply document ID.
6. Preview through a transient object URL and download through the streaming BFF route.
