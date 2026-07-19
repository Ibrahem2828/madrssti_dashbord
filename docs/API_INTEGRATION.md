# API Integration

## Source of truth

The current backend contracts and endpoint configuration are authoritative. Feature services call the same-origin BFF with the portal key (`central` or `school`), normalize the response, and map verified DTO fields into frontend types.

## Reliability behavior

- Feature screens use loading, retryable error, and unavailable states.
- API results preserve request identifiers for support and traceability.
- Browser requests can use cancellation where binary preview/upload workflows need it.
- Existing mutations reload authoritative server state unless a contract-specific optimistic update is safe.
- CSRF, cookies, auth refresh, and tenant/portal isolation remain in the BFF and auth libraries.

## Explicit non-changes

No endpoint, payload shape, model, permission definition, backend timeout, or backend business rule was changed in this phase. When the backend is unavailable, the UI reports a recoverable failure rather than substituting mock data.

## Phase 2 verification baseline

Static regression coverage confirms that feature clients stay behind the same-origin BFF, portal scope remains isolated, and known mutation workflows keep their required request fields. Runtime validation of success, validation, authorization, conflict, rate-limit, and server-error responses requires a reachable backend with dedicated test identities; it is not simulated by the frontend.
