# Dashboard CRUD implementation

## Shared safety pattern

1. Check the declared capability.
2. Check the effective permission at the action and page boundary.
3. Invoke only a configured feature-service endpoint through the same-origin BFF.
4. Use confirmation for a sensitive mutation; require a reason only where the existing operation accepts one.
5. Normalize backend error responses and refresh the resource after success.

## Implemented dialog patterns

- `ConfirmDialog` is used for school activation/deactivation and category/party deletion instead of `window.confirm`.
- `ReasonDialog` is used for document mark-sent, mark-received, archive, and delete. The action remains disabled until an audit reason is provided.
- The document archive path remains the normal lifecycle action. Delete is only offered when the documented delete capability and permission are both present.

## Contract discipline

This implementation does not infer DELETE or PATCH support from a list page. The complete static inventory is maintained in `DASHBOARD_CRUD_MATRIX.md`; any operation absent from `endpoints.central.ts` or `endpoints.school.ts` is deliberately not added.
