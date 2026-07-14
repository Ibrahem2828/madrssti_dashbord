# Phase 3 security validation report

## Verified controls

| Control | Result | Evidence |
|---|---|---|
| HttpOnly auth cookies preserved | PASS | Session payload remains sanitized and token-free; auth cookies are still managed only on the server in `src/lib/auth/cookies.ts`. |
| Browser storage token exposure | PASS | No access or refresh token was returned in `/api/auth/session`; login flow still stores tokens only through server-set cookies. |
| Origin validation | PASS | `Origin: http://localhost:3000` is accepted for local runtime; missing Origin returns `403 ORIGIN_MISSING`; `http://127.0.0.1:3000` returns `403 ORIGIN_NOT_ALLOWED`. |
| Login CSRF validation | PASS | Missing CSRF header, missing CSRF cookie, and mismatched CSRF all return structured `403` responses. |
| Timeout/status separation | PASS | Valid Origin + valid CSRF requests now return `504 BACKEND_TIMEOUT` when backend transport stalls; they do not incorrectly return `403`. |
| Request ID propagation | PASS | Structured BFF error responses and safe transport logs include request IDs. |
| Central/School portal isolation | PASS (static/runtime partial) | Separate login endpoints remain intact and unauthenticated portal redirects remain correct. Full authenticated cross-portal validation is still blocked by backend connectivity. |

## CSRF cookie attributes

- Name: `madrasti_csrf`
- `Path=/`
- `SameSite=Lax`
- `HttpOnly=false`
- `Secure=false` in the current local verification environment because `AUTH_COOKIE_SECURE=false`
- No conflicting `Domain` attribute is configured in the current implementation

## Local origin comparison values

- Allowed app origin: `http://localhost:3000`
- Rejected local mismatch example: `http://127.0.0.1:3000`

## Safe transport logging evidence

Structured login transport log entries now capture:

- `requestId`
- `portal`
- `method`
- `endpointPath`
- `timeoutMs`
- `elapsedMs`
- `backendStatus`
- `code`
- `errorName`
- `causeCode`
- `stage`

Observed runtime entries:

- Central login timeout -> request `76c04211-03da-4f29-a9f3-cce090038ba1`, cause `UND_ERR_CONNECT_TIMEOUT`
- School login timeout -> request `9d508eca-8ef1-4a74-a3f1-57aa79a9d83f`, cause `UND_ERR_CONNECT_TIMEOUT`

## Current blocker

Security controls in the BFF are working. The remaining blocker is not a CSRF or Origin bypass; it is the absence of a successful upstream HTTPS response from the current host to the backend origin.