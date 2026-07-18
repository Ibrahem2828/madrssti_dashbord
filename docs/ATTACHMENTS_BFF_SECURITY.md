# Attachments BFF Security Model

## Request path

```text
Browser (same origin, session cookies)
  -> /api/gateway/school/admin/documents/{documentId}/attachments…
  -> Next.js validates Origin + CSRF for POST
  -> Next.js attaches HttpOnly access token and validated active-school context
  -> Django tenant and RBAC authorization
```

The browser never receives an access token, refresh token, Django origin, backend storage path, or `X-School-ID` value.

## Upload

The uploader sends `FormData` without setting `Content-Type`; the browser supplies the multipart boundary. The generic gateway forwards the body unchanged and forwards only approved headers. POST is not replayed automatically.

## Preview and download

Preview and download resolve only to same-origin gateway routes. Preview requires `DOCUMENTS_PREVIEW`; download requires `DOCUMENTS_DOWNLOAD`. Binary gateway responses preserve `Content-Type`, `Content-Length` when present, `Content-Disposition`, and request ID. PDF responses are marked `private, no-store` when the backend supplies no caching policy.

## Isolation

Django resolves the active school using server-managed context. The gateway ignores any browser-provided school header. A mismatched school/document/attachment is denied by the backend query scope and does not expose metadata or bytes.

## Logging

The uploader does not log file contents, local paths, token values, cookies, or credentials. User-facing errors expose only safe code, safe message, and request ID where the BFF supplied one.
