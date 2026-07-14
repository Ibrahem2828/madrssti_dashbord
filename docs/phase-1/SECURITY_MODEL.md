# Security model

Access and refresh tokens are only HttpOnly, SameSite=Lax cookies. The portal scope and active school are server-managed HttpOnly cookies; the theme and CSRF cookies are the only browser-readable cookies. Tokens are never returned by session endpoints or put in storage.

Mutations require matching CSRF cookie/header values and validate Origin/Referer when configured. Login validates same-origin context. Gateways attach authorization server-side, strip browser cookies, generate request IDs, reject traversal/absolute protocol paths, and use a timeout. Central never sends `X-School-ID`; School derives it only from the server cookie. Middleware separates portal scopes and protects against unsafe redirects by never redirecting to an external supplied target.

Phase 3 must confirm cookie Secure behavior behind the deployment proxy, backend Central contract mapping, CSRF origin configuration, and gateway upload/download behavior. Logs must not include credentials, tokens, authorization headers, or cookies.
