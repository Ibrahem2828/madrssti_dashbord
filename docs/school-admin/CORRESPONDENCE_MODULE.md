# Correspondence Module

## Implemented structure

- Overview screen with totals, create form, filters, and records.
- Specialized list routes:
  - outgoing
  - incoming
  - internal
  - circulars
  - needs-reply
- Detail screen with edit, attachments, reply, link, audit-sensitive actions, and activity timeline.
- Dedicated archive screen.
- Category and party managers.

## Backend integrations

- Overview: `/api/v1/admin/documents/overview`
- Generic list: `/api/v1/admin/documents`
- Specialized lists:
  - `/api/v1/admin/documents/outgoing`
  - `/api/v1/admin/documents/incoming`
  - `/api/v1/admin/documents/circulars`
  - `/api/v1/admin/documents/needs-reply`
- Detail: `/api/v1/admin/documents/{id}`
- Reply: `/api/v1/admin/documents/{id}/create-reply`
- Link: `/api/v1/admin/documents/{id}/link`
- Activity: `/api/v1/admin/documents/{id}/activity`

## UX and safety decisions

- Specialized routes render explicit screens instead of redirecting back to a generic list.
- Sensitive actions require an audit reason in the detail UI.
- Preview and download continue through same-origin gateway URLs.
- No fake document counters or fabricated document numbers were introduced.