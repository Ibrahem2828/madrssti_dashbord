# Madrasti Dashboard Security Model

## Credentials and sessions

- Access and refresh tokens are server-set HttpOnly cookies with secure production settings, `SameSite=Lax`, and root-scoped paths.
- Browser code receives a sanitized session only; no token is stored in `localStorage`, `sessionStorage`, IndexedDB, React state, or URL parameters.
- Logout clears local authentication cookies even if the upstream logout call fails.

## BFF controls

- Browser traffic uses same-origin auth handlers or portal-specific gateway handlers.
- The BFF adds Authorization only server-side, filters inbound/outbound headers, generates/preserves request IDs, and does not forward browser cookies to Django.
- State-changing BFF operations require same-origin/origin checks and double-submit CSRF validation.
- Gateway paths reject absolute URLs, traversal, protocol-like segments, cross-portal paths, and unsafe headers.

## Tenant isolation

- Central requests never send `X-School-ID`.
- School requests ignore browser-supplied School headers and derive the active School from the authenticated server-managed context.
- Central School-user management scopes user operations through the selected School path and relies on backend tenant authorization.

## Legacy adapter hardening

`src/services/apiClient.ts` remains for compatibility but accepts only same-origin Central or School BFF bases, strips Authorization/Cookie/X-School-ID headers, attaches CSRF for unsafe calls, uses same-origin credentials, and never performs browser token refresh or automatic replay.

## Static limitations

This model has not been runtime-tested in this phase. Cookie attributes, origin edge cases, CSRF behavior, backend authorization, response-header filtering, and file streaming require Phase 2 verification.
