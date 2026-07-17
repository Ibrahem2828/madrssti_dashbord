# School Route Map

## Users and RBAC

- `/[locale]/school/users` → `SchoolUsersScreen`
- `/[locale]/school/users/new` → `SchoolUserCreateScreen`
- `/[locale]/school/users/[userId]` → `SchoolUserDetailScreen`

## Correspondence and archive

- `/[locale]/school/correspondence` → `SchoolDocumentsScreen`
- `/[locale]/school/correspondence/new` → `SchoolDocumentsScreen`
- `/[locale]/school/correspondence/outgoing` → `SchoolDocumentCollectionScreen(mode="outgoing")`
- `/[locale]/school/correspondence/incoming` → `SchoolDocumentCollectionScreen(mode="incoming")`
- `/[locale]/school/correspondence/internal` → `SchoolDocumentCollectionScreen(mode="internal")`
- `/[locale]/school/correspondence/circulars` → `SchoolDocumentCollectionScreen(mode="circulars")`
- `/[locale]/school/correspondence/needs-reply` → `SchoolDocumentCollectionScreen(mode="needs-reply")`
- `/[locale]/school/correspondence/[documentId]` → `SchoolDocumentDetailScreen`
- `/[locale]/school/correspondence/archive` → `SchoolArchiveScreen`
- `/[locale]/school/correspondence/categories` → `SchoolCategoriesScreen`
- `/[locale]/school/correspondence/parties` → `SchoolPartiesScreen`

## Access control summary

- Unauthenticated school routes redirect to `/[locale]/login/school?next=...`.
- School routes remain protected by school-session middleware and BFF portal checks.
- Specialized correspondence list routes no longer use temporary redirects.