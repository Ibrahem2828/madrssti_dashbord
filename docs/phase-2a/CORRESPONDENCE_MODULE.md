# Correspondence module

## Implemented routes

- `/[locale]/school/correspondence`
- `/[locale]/school/correspondence/[documentId]`
- `/[locale]/school/correspondence/categories`
- `/[locale]/school/correspondence/parties`

## Verified backend enums

### Direction

- `OUTGOING`
- `INCOMING`
- `INTERNAL`

### Type

- `LETTER`
- `CIRCULAR`
- `REPORT`
- `TEACHER_ASSIGNMENT`
- `STUDENT_ADMISSION`
- `BUDGET`
- `FINANCIAL_REPORT`
- `ADMIN_REPORT`
- `GUIDANCE_REPORT`
- `OTHER`

### Status

- `DRAFT`
- `REGISTERED`
- `SENT`
- `RECEIVED`
- `UNDER_REVIEW`
- `NEEDS_REPLY`
- `REPLIED`
- `ARCHIVED`
- `CLOSED`
- `CANCELLED`

### Priority

- `LOW`
- `NORMAL`
- `HIGH`
- `URGENT`

### Relation type

- `REPLY_TO`
- `FOLLOW_UP`
- `RELATED`
- `REPLACES`

### Party type

- `MINISTRY`
- `DIRECTORATE`
- `SCHOOL`
- `PARENT`
- `FINANCIAL_ENTITY`
- `GUIDANCE`
- `INTERNAL_DEPARTMENT`
- `OTHER`

## Implemented endpoint coverage

### Documents

- `GET /api/v1/admin/documents/overview`
- `GET /api/v1/admin/documents`
- `POST /api/v1/admin/documents`
- `GET /api/v1/admin/documents/{id}`
- `PATCH /api/v1/admin/documents/{id}`
- `DELETE /api/v1/admin/documents/{id}`
- `GET /api/v1/admin/documents/{id}/activity`

### Attachments

- `GET /api/v1/admin/documents/{id}/attachments`
- `POST /api/v1/admin/documents/{id}/attachments`
- `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/download`
- `GET /api/v1/admin/documents/{id}/attachments/{attachmentId}/preview`

### Dedicated actions

- `POST /api/v1/admin/documents/{id}/mark-sent`
- `POST /api/v1/admin/documents/{id}/mark-received`
- `POST /api/v1/admin/documents/{id}/create-reply`
- `POST /api/v1/admin/documents/{id}/link`
- `POST /api/v1/admin/documents/{id}/archive`

### Category CRUD

- `GET|POST|PATCH|DELETE /api/v1/admin/document-categories*`

### Party CRUD

- `GET|POST|PATCH|DELETE /api/v1/admin/correspondence-parties*`

## Implemented list flow

- document overview uses the dedicated overview endpoint
- list filters are server-driven for `search`, `status`, `direction`, and `page`
- totals do not come from the first page of the list response
- detail navigation is route-based

## Implemented create flow

- uses exact verified direction, type, and priority enums
- supports category and party linkage by verified IDs
- supports `needs_reply` and `reply_due_date`
- uses mapped same-origin service calls only

## Implemented detail flow

- header and document number
- localized status, direction, and type rendering
- editable metadata subset through the verified `PATCH` endpoint
- activity timeline using the dedicated activity endpoint

## Implemented attachment flow

- upload uses real multipart form data
- preview uses the School gateway path
- download uses the School gateway path
- no direct backend download URL is rendered
- no random upload progress is used in the migrated document detail flow

## Implemented action flow

### Mark sent

- available only for outgoing documents
- uses the dedicated `mark-sent` endpoint
- confirmation required

### Mark received

- available only for incoming documents
- uses the dedicated `mark-received` endpoint
- confirmation required

### Create reply

- uses the dedicated `create-reply` endpoint
- requires title, subject, date, and exact priority enum
- confirmation required

### Link document

- uses the dedicated `link` endpoint
- uses exact relation type enums
- prevents self-link on the client side
- confirmation required

### Archive

- uses the dedicated `archive` endpoint
- requires a reason before mutation
- confirmation required

### Delete

- uses the verified `DELETE` detail endpoint
- confirmation required

## Permission matrix

| Action | Permission |
|---|---|
| View documents | `DOCUMENTS_READ` |
| Create documents | `DOCUMENTS_CREATE` |
| Edit documents | `DOCUMENTS_UPDATE` |
| Delete documents | `DOCUMENTS_DELETE` |
| Archive documents | `DOCUMENTS_ARCHIVE` |
| Download attachments | `DOCUMENTS_DOWNLOAD` |
| Preview attachments | `DOCUMENTS_PREVIEW` |
| Link documents | `DOCUMENTS_LINK` |
| Manage categories | `DOCUMENTS_MANAGE_CATEGORIES` |
| Manage parties | `DOCUMENTS_MANAGE_PARTIES` |
| Mark outgoing sent | `OUTGOING_MARK_SENT` |
| Mark incoming received | `INCOMING_MARK_RECEIVED` |

## Known limitations

- related-document selection is ID-based in Phase 2A, not a dedicated search modal
- no restore action is exposed because the backend restore endpoint is not verified
- no ticket/correspondence cross-module timeline is exposed because no verified endpoint was found
