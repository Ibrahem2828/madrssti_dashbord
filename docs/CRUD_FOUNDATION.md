# CRUD Foundation

## Standard composition

Every existing CRUD screen is expected to compose the shared page and data primitives:

1. Page header and permission-gated primary action.
2. URL-backed filters/search, sorting where the endpoint supports it, and pagination.
3. Loading skeleton, empty/filtered-empty state, retryable error state, and request identifier when supplied.
4. Responsive table container and mobile record representation where information density requires it.
5. Detail, create, edit, archive/restore/delete, confirmation, and reason capture only when supported by the backend contract.

## Form policy

Forms use shared controls and validation, expose field errors, preserve keyboard navigation, and use the unsaved-changes guard for meaningful drafts. Destructive and security-sensitive actions use `ConfirmDialog`/`ReasonDialog`; success and error results are rendered through the shared feedback language.

## Scope rule

Filtering, sorting, pagination, archive, restore, and bulk actions are enabled only when their existing endpoint and permission are available. The frontend does not emulate missing server workflows.
