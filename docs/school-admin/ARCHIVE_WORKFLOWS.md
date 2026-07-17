# Archive Workflows

## Implemented actions

- Mark sent
- Mark received
- Archive
- Delete

## Audit rule

The UI now requires a mandatory audit reason before:

- `mark-sent`
- `mark-received`
- `delete`
- `archive`

This is enforced in the detail screen before the mutation is sent.

## Backend mappings

- `POST /api/v1/admin/documents/{id}/mark-sent`
- `POST /api/v1/admin/documents/{id}/mark-received`
- `POST /api/v1/admin/documents/{id}/archive`
- `DELETE /api/v1/admin/documents/{id}`

## Runtime note

The archive list route is present and built successfully. Full authenticated archive mutation verification remains pending a legitimate school account.