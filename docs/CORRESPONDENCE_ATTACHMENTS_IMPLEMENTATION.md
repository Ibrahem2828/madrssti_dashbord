# Correspondence Attachments Implementation

## Implemented flow

1. The user completes metadata and queues local PDF files.
2. The dashboard creates the document through the BFF.
3. Only after a server `documentId` exists, the uploader sends each queued file as `FormData` with `file` and `is_primary`.
4. A failed file can be retried independently without creating the document again.
5. When creating a reply, the dashboard waits for the backend reply document ID, then uploads queued reply files to that new ID.

The create screen reports partial success and links to the created document. It never reports a complete attachment success when one or more files fail.

## File rules

- PDF extension plus MIME validation in the client.
- 20 MB client limit matching the backend default.
- Duplicate name/size/modified-time detection in the local queue.
- One pending primary/official copy can be selected. A server-uploaded primary is never altered because the backend exposes no mutation endpoint.
- `File` and `AbortController` objects stay in local component state only; they are not persisted or put into global state.

## Detail screen

The detail screen uses the same uploader, lists server attachments, distinguishes the official copy, gates preview/download buttons by exact permission codes, and uses a dialog preview. The preview creates an object URL only after a same-origin BFF response and revokes it when closed or replaced.

## Limitations intentionally preserved

- Upload progress is indeterminate because native Fetch does not expose upload progress and the current server contract has no progress channel.
- No delete, reorder, or post-upload primary toggle is presented because no verified endpoint supports those operations.
