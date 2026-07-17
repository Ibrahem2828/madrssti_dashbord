# School Administration API Contract Map

Date: 2026-07-16
API base: `/api/v1`
Transport: same-origin Next.js BFF via `/api/gateway/school/*`

## Users and RBAC

| UI route | Service function | Backend method | Backend path | Permission |
|---|---|---|---|---|
| `/[locale]/school/users` | `fetchSchoolUsers` | GET | `/api/v1/admin/users` | `ADMIN_USERS_READ` |
| `/[locale]/school/users/new` | `createSchoolUser` | POST | `/api/v1/admin/users` | `ADMIN_USERS_CREATE` |
| `/[locale]/school/users/[userId]` | `fetchSchoolUser` | GET | `/api/v1/admin/users/{id}` | `ADMIN_USERS_READ` |
| `/[locale]/school/users/[userId]` | `updateSchoolUser` | PATCH | `/api/v1/admin/users/{id}` | `ADMIN_USERS_UPDATE` |
| `/[locale]/school/users/[userId]` | `resetSchoolUserPassword` | POST | `/api/v1/admin/users/{id}/reset-password` | `ADMIN_USERS_RESET_PASSWORD` |
| `/[locale]/school/users/[userId]` | `fetchSchoolRoles` | GET | `/api/v1/admin/roles` | `ADMIN_RBAC_ROLES_READ` |
| `/[locale]/school/users/[userId]` | `fetchSchoolPermissions` | GET | `/api/v1/admin/permissions` | `ADMIN_RBAC_PERMS_READ` |
| `/[locale]/school/users/[userId]` | `fetchEffectivePermissions` | GET | `/api/v1/admin/users/{id}/effective-permissions` | `ADMIN_RBAC_VIEW_EFFECTIVE_PERMS` |
| `/[locale]/school/users/[userId]` | `assignSchoolRoles` | POST | `/api/v1/admin/users/{id}/roles` | `ADMIN_RBAC_ASSIGN_ROLE` |
| `/[locale]/school/users/[userId]` | `grantSchoolPermissions` | POST | `/api/v1/admin/users/{id}/permissions/grant` | `ADMIN_RBAC_GRANT_PERMISSION` |
| `/[locale]/school/users/[userId]` | `revokeSchoolPermissions` | POST | `/api/v1/admin/users/{id}/permissions/revoke` | `ADMIN_RBAC_REVOKE_PERMISSION` |

## Correspondence

| UI route | Service function | Backend method | Backend path | Permission |
|---|---|---|---|---|
| `/[locale]/school/correspondence` | `fetchDocumentOverview` | GET | `/api/v1/admin/documents/overview` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence` | `fetchDocuments` | GET | `/api/v1/admin/documents` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence/outgoing` | `fetchOutgoingDocuments` | GET | `/api/v1/admin/documents/outgoing` | `OUTGOING_READ` |
| `/[locale]/school/correspondence/incoming` | `fetchIncomingDocuments` | GET | `/api/v1/admin/documents/incoming` | `INCOMING_READ` |
| `/[locale]/school/correspondence/internal` | `fetchDocuments` | GET | `/api/v1/admin/documents?direction=INTERNAL` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence/circulars` | `fetchCircularDocuments` | GET | `/api/v1/admin/documents/circulars` | `CIRCULARS_READ` |
| `/[locale]/school/correspondence/needs-reply` | `fetchNeedsReplyDocuments` | GET | `/api/v1/admin/documents/needs-reply` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence/new` | `createDocument` | POST | `/api/v1/admin/documents` | `DOCUMENTS_CREATE`, direction-specific create permissions |
| `/[locale]/school/correspondence/[documentId]` | `fetchDocument` | GET | `/api/v1/admin/documents/{id}` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence/[documentId]` | `updateDocument` | PATCH | `/api/v1/admin/documents/{id}` | `DOCUMENTS_UPDATE` plus direction-specific update permissions |
| `/[locale]/school/correspondence/[documentId]` | `uploadDocumentAttachment` | POST | `/api/v1/admin/documents/{id}/attachments` | `DOCUMENTS_UPDATE` |
| `/[locale]/school/correspondence/[documentId]` | `fetchDocumentActivity` | GET | `/api/v1/admin/documents/{id}/activity` | `DOCUMENTS_READ` |
| `/[locale]/school/correspondence/[documentId]` | `createReplyDocument` | POST | `/api/v1/admin/documents/{id}/create-reply` | `DOCUMENTS_CREATE`, `CIRCULARS_REPLY` as applicable |
| `/[locale]/school/correspondence/[documentId]` | `linkDocument` | POST | `/api/v1/admin/documents/{id}/link` | `DOCUMENTS_LINK` |
| `/[locale]/school/correspondence/[documentId]` | `markDocumentSent` | POST | `/api/v1/admin/documents/{id}/mark-sent` | `OUTGOING_MARK_SENT` |
| `/[locale]/school/correspondence/[documentId]` | `markDocumentReceived` | POST | `/api/v1/admin/documents/{id}/mark-received` | `INCOMING_MARK_RECEIVED` |
| `/[locale]/school/correspondence/[documentId]` | `archiveDocument` | POST | `/api/v1/admin/documents/{id}/archive` | `DOCUMENTS_ARCHIVE` |
| `/[locale]/school/correspondence/[documentId]` | `deleteDocument` | DELETE | `/api/v1/admin/documents/{id}` | `DOCUMENTS_DELETE` |

## Collections

| UI route | Service function | Backend method | Backend path | Permission |
|---|---|---|---|---|
| `/[locale]/school/correspondence/categories` | `fetchCategories` | GET | `/api/v1/admin/document-categories` | `DOCUMENTS_MANAGE_CATEGORIES` |
| `/[locale]/school/correspondence/categories` | `createCategory` | POST | `/api/v1/admin/document-categories` | `DOCUMENTS_MANAGE_CATEGORIES` |
| `/[locale]/school/correspondence/categories` | `updateCategory` | PATCH | `/api/v1/admin/document-categories/{id}` | `DOCUMENTS_MANAGE_CATEGORIES` |
| `/[locale]/school/correspondence/categories` | `deleteCategory` | DELETE | `/api/v1/admin/document-categories/{id}` | `DOCUMENTS_MANAGE_CATEGORIES` |
| `/[locale]/school/correspondence/parties` | `fetchParties` | GET | `/api/v1/admin/correspondence-parties` | `DOCUMENTS_MANAGE_PARTIES` |
| `/[locale]/school/correspondence/parties` | `createParty` | POST | `/api/v1/admin/correspondence-parties` | `DOCUMENTS_MANAGE_PARTIES` |
| `/[locale]/school/correspondence/parties` | `updateParty` | PATCH | `/api/v1/admin/correspondence-parties/{id}` | `DOCUMENTS_MANAGE_PARTIES` |
| `/[locale]/school/correspondence/parties` | `deleteParty` | DELETE | `/api/v1/admin/correspondence-parties/{id}` | `DOCUMENTS_MANAGE_PARTIES` |