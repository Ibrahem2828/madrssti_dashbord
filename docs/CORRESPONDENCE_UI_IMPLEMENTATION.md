# Correspondence UI Static Implementation

## Routes and collections

The School correspondence module includes the base workspace, outgoing, incoming, internal, circulars, needs-reply, archive, create, document detail, categories, and parties. Collection routes use the existing document-service filters and server pagination rather than fabricated records.

`/[locale]/school/correspondence/[documentId]/edit` is a compatibility route to the existing document detail workspace, which owns the authorized edit form and avoids duplicated mutation logic.

## Data and actions

- Endpoint construction lives in `src/config/endpoints.school.ts`.
- The School BFF supplies authentication and derived School context for documents, actions, activity, attachment upload, preview, and download.
- Feature screens cover document create/update, explicit status actions, reply/link/archive flows, categories, parties, and archival views according to the currently mapped contracts.
- Preview/download URLs use the same-origin gateway and do not reveal backend origin, token, or storage path.

## UI behavior

- Desktop tables have responsive scrollers and mobile record/card alternatives.
- Filters are URL-state aware in the document list implementation.
- Empty/error/loading/forbidden states use shared feedback primitives.
- Actions are permission-aware; unsupported contract actions are not introduced as placeholders.

## Deferred verification

Actual document number generation, attachment MIME/size limits, streaming behavior, relationship action name, archive policy, delete constraints, and server pagination/filter semantics require Phase 2 runtime verification.
