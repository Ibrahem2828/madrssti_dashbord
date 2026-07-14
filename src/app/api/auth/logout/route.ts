import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {BACKEND_TIMEOUTS, BackendRequestError, buildFailureResponse, buildSuccessResponse, fetchBackend, logBackendFailure} from "@/lib/api/backend";
import {authCookieValues, clearAuthCookies} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";

export async function POST() {
  const requestId = crypto.randomUUID();
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const auth = authCookieValues();
  const timeoutMs = BACKEND_TIMEOUTS.mutation;
  const startedAt = Date.now();

  try {
    if (auth.access && auth.refresh && auth.portal) {
      const endpoint = auth.portal === "central" ? AUTH_ENDPOINTS.central.logout : AUTH_ENDPOINTS.school.logout;

      await fetchBackend(
        endpoint,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.access}`,
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
          },
          body: JSON.stringify({refresh: auth.refresh}),
        },
        {requestId, timeoutMs},
      );
    }
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logBackendFailure("logout", {
        requestId,
        portal: auth.portal,
        method: "POST",
        endpointPath: auth.portal === "central" ? AUTH_ENDPOINTS.central.logout : AUTH_ENDPOINTS.school.logout,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: error.code === "BACKEND_TIMEOUT" ? 504 : 503,
        code: error.code,
        errorName: error.details.errorClass,
        causeCode: error.details.nestedErrorCode,
        stage: error.details.stage,
        backendRequestId: undefined,
      });
    }
  } finally {
    clearAuthCookies();
  }

  return buildSuccessResponse({loggedOut: true}, requestId);
}