import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendRequestFailureResponse,
  buildFailureResponse,
  buildSuccessResponse,
  extractErrorCode,
  extractErrorMessage,
  extractFieldErrors,
  extractRequestId,
  fetchBackend,
  logBackendFailure,
  readJsonBody,
} from "@/lib/api/backend";
import {authCookieValues, setActiveSchool} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const auth = authCookieValues();
  const body: unknown = await request.json().catch(() => null);
  const schoolId = typeof (body as {schoolId?: unknown})?.schoolId === "string" ? (body as {schoolId: string}).schoolId : "";

  if (auth.portal !== "school" || !auth.access || !schoolId) {
    return buildFailureResponse(400, "VALIDATION_ERROR", "Invalid school selection", {requestId});
  }

  const timeoutMs = BACKEND_TIMEOUTS.mutation;
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      AUTH_ENDPOINTS.school.switchSchool,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.access}`,
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({school_id: schoolId}),
      },
      {requestId, timeoutMs},
    );
    const payload = await readJsonBody(response);
    const upstreamRequestId = extractRequestId(response, payload) ?? requestId;

    if (!response.ok) {
      return buildFailureResponse(
        response.status === 404 ? 502 : response.status,
        response.status === 404 ? "ENDPOINT_MAPPING_ERROR" : extractErrorCode(payload, "SCHOOL_SWITCH_FAILED"),
        response.status === 404 ? "The configured backend school switching endpoint was not found." : extractErrorMessage(payload, "School could not be selected"),
        {
          fieldErrors: extractFieldErrors(payload),
          requestId: upstreamRequestId,
        },
      );
    }

    setActiveSchool(schoolId);
    return buildSuccessResponse({switched: true}, upstreamRequestId);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logBackendFailure("switch-school", {
        requestId,
        portal: auth.portal,
        method: "POST",
        endpointPath: AUTH_ENDPOINTS.school.switchSchool,
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
        BACKEND_TIMEOUT: "The backend school switch request timed out.",
        BACKEND_UNAVAILABLE: "The backend school switch request could not be completed.",
      });
    }

    return buildFailureResponse(500, "UNEXPECTED_SCHOOL_SWITCH_ERROR", "The school switch request could not be completed.", {
      requestId,
    });
  }
}