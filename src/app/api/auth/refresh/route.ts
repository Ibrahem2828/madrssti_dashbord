import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendRequestFailureResponse,
  buildFailureResponse,
  buildSuccessResponse,
  extractAccessToken,
  extractRequestId,
  fetchBackend,
  logBackendFailure,
  readJsonBody,
} from "@/lib/api/backend";
import {authCookieValues, clearAuthCookies, setAuthCookies} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";

export async function POST() {
  const requestId = crypto.randomUUID();
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const auth = authCookieValues();
  if (!auth.refresh || !auth.portal) {
    return buildFailureResponse(401, "AUTHENTICATION_REQUIRED", "Authentication required", {requestId});
  }

  const endpoint = auth.portal === "central" ? AUTH_ENDPOINTS.central.refresh : AUTH_ENDPOINTS.school.refresh;
  const timeoutMs = BACKEND_TIMEOUTS.authentication;
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({refresh: auth.refresh}),
      },
      {requestId, timeoutMs},
    );
    const body = await readJsonBody(response);
    const upstreamRequestId = extractRequestId(response, body) ?? requestId;
    const access = extractAccessToken(body);

    if (!response.ok || typeof access !== "string") {
      clearAuthCookies();

      return buildFailureResponse(
        response.status === 404 ? 502 : 401,
        response.status === 404 ? "ENDPOINT_MAPPING_ERROR" : "SESSION_EXPIRED",
        response.status === 404 ? "The configured backend refresh endpoint was not found." : "Session expired",
        {requestId: upstreamRequestId},
      );
    }

    setAuthCookies({access, refresh: auth.refresh}, auth.portal);
    return buildSuccessResponse({refreshed: true}, upstreamRequestId);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logBackendFailure("refresh", {
        requestId,
        portal: auth.portal,
        method: "POST",
        endpointPath: endpoint,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: error.code === "BACKEND_TIMEOUT" ? 504 : 503,
        code: error.code,
        errorName: error.details.errorClass,
        causeCode: error.details.nestedErrorCode,
        stage: error.details.stage,
        backendRequestId: undefined,
      });

      return buildBackendRequestFailureResponse(error, requestId, {
        BACKEND_TIMEOUT: "The backend refresh request timed out.",
        BACKEND_UNAVAILABLE: "The backend refresh request could not be completed.",
      });
    }

    return buildFailureResponse(500, "UNEXPECTED_REFRESH_ERROR", "The refresh request could not be completed.", {requestId});
  }
}