# Attachments and Binary Proxy

## Upload

- Client upload uses `FormData`.
- No manual multipart boundary is set in the client request.
- Upload endpoint remains school-scoped through the same-origin BFF.

## Preview and download

- Attachment preview URL is generated through `gatewayHref("school", schoolEndpoints.documents.preview(...))`.
- Attachment download URL is generated through `gatewayHref("school", schoolEndpoints.documents.download(...))`.
- Browser never receives a direct backend file URL.

## Static test coverage

- `tests/school-admin.test.mjs`
  - verifies FormData upload path
  - verifies no manual multipart header
  - verifies preview/download remain same-origin