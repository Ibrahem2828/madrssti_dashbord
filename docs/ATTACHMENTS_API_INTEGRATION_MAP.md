# Attachments API Integration Map

| Page/action | UI component | BFF route | Backend endpoint | Method | Content type | Required permission | Payload/response | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| New document | `SchoolDocumentsScreen` | `/api/gateway/school/admin/documents` | `/api/v1/admin/documents` | POST | JSON | `DOCUMENTS_CREATE` | Document metadata / document detail | Static contract verified |
| Queue/upload attachment | `DocumentFileUploader` | `/api/gateway/school/admin/documents/{id}/attachments` | `/api/v1/admin/documents/{id}/attachments` | POST | multipart/form-data | `DOCUMENTS_UPDATE` | `file`, `is_primary` / attachment | Static contract verified |
| List attachments | Document detail | `/api/gateway/school/admin/documents/{id}` or attachments collection | `/api/v1/admin/documents/{id}` | GET | JSON | `DOCUMENTS_READ` | Document detail contains attachments | Static contract verified |
| Preview PDF | `DocumentPreviewDialog` | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/preview` | same path under `/api/v1` | GET | application/pdf | `DOCUMENTS_PREVIEW` | Binary stream | Static contract verified; runtime pending |
| Download PDF | detail link | `/api/gateway/school/admin/documents/{id}/attachments/{attachmentId}/download` | same path under `/api/v1` | GET | application/pdf | `DOCUMENTS_DOWNLOAD` | Binary stream + content disposition | Static contract verified; runtime pending |
| Reply and attachment | detail reply form + uploader | reply then attachment gateway routes | `/api/v1/admin/documents/{id}/create-reply`, then attachment endpoint | POST, POST | JSON, multipart | `DOCUMENTS_CREATE`, `DOCUMENTS_UPDATE` | Reply metadata, then `file` / reply detail and attachment | Static flow verified |

Expected errors are normalized BFF responses: `AUTHENTICATION_REQUIRED`, `PERMISSION_DENIED`, `NOT_FOUND`, `FILE_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `BACKEND_TIMEOUT`, `BACKEND_UNAVAILABLE`, and `INVALID_BACKEND_RESPONSE`. The current backend returns serializer validation errors for invalid files; runtime mapping must be verified with test accounts.
