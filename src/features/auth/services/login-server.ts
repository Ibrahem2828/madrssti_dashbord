import "server-only";

import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import type {Portal} from "@/config/routes";
import {setAuthCookies} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendRequestFailureResponse,
  buildFailureResponse,
  buildSuccessResponse,
  extractRequestId,
  extractTokenPair,
  fetchBackend,
  logBackendFailure,
  mapLoginFailure,
  mapBackendRequestErrorToStatus,
  readJsonBody,
} from "@/lib/api/backend";
import {buildLoginCredentials} from "./login-payload";

type LoginAttemptResult =
  | {
      ok: true;
      requestId: string;
      tokens: {
        access: string;
        refresh: string;
      };
    }
  | {
      ok: false;
      requestId: string;
      status: number;
      code: string;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

function readIdentifier(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function requestLoginFromBackend(
  portal: Portal,
  identifier: string,
  password: string,
  requestId: string,
  timeoutMs = BACKEND_TIMEOUTS.authentication,
): Promise<LoginAttemptResult> {
  const endpoint = portal === "central" ? AUTH_ENDPOINTS.central.login : AUTH_ENDPOINTS.school.login;
  const credentials = buildLoginCredentials(portal, identifier, password);
  const response = await fetchBackend(
    endpoint,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(credentials),
    },
    {requestId, timeoutMs},
  );
  const payload = await readJsonBody(response);
  const upstreamRequestId = extractRequestId(response, payload) ?? requestId;

  if (!response.ok) {
    const failure = mapLoginFailure(response.status, payload);
    return {
      ok: false,
      requestId: failure.requestId ?? upstreamRequestId,
      status: failure.status,
      code: failure.code,
      message: failure.message,
      fieldErrors: failure.fieldErrors,
    };
  }

  const tokens = extractTokenPair(payload);

  if (!tokens) {
    return {
      ok: false,
      requestId: upstreamRequestId,
      status: 502,
      code: "INVALID_BACKEND_RESPONSE",
      message: "The backend login response did not contain the expected token fields.",
    };
  }

  return {
    ok: true,
    requestId: upstreamRequestId,
    tokens,
  };
}

export async function login(request: Request, portal: Portal) {
  const requestId = crypto.randomUUID();
  const timeoutMs = BACKEND_TIMEOUTS.authentication;
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const body: unknown = await request.json().catch(() => null);
  const identifier = readIdentifier((body as {identifier?: unknown})?.identifier ?? (body as {email?: unknown})?.email);
  const password = typeof (body as {password?: unknown})?.password === "string" ? (body as {password: string}).password : "";

  if (!identifier || !password) {
    return buildFailureResponse(400, "VALIDATION_ERROR", "Login credentials are incomplete.", {requestId});
  }

  const endpoint = portal === "central" ? AUTH_ENDPOINTS.central.login : AUTH_ENDPOINTS.school.login;
  const startedAt = Date.now();

  try {
    const result = await requestLoginFromBackend(portal, identifier, password, requestId, timeoutMs);

    if (!result.ok) {
      logBackendFailure("login", {
        requestId,
        portal,
        method: "POST",
        endpointPath: endpoint,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: result.status,
        code: result.code,
        backendRequestId: result.requestId,
      });

      return buildFailureResponse(result.status, result.code, result.message, {
        fieldErrors: result.fieldErrors,
        requestId: result.requestId,
      });
    }

    setAuthCookies(result.tokens, portal);
    return buildSuccessResponse({portal}, result.requestId);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logBackendFailure("login", {
        requestId,
        portal,
        method: "POST",
        endpointPath: endpoint,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: mapBackendRequestErrorToStatus(error),
        code: error.code,
        errorName: error.details.errorClass,
        causeCode: error.details.nestedErrorCode,
        stage: error.details.stage,
        backendRequestId: undefined,
      });

      return buildBackendRequestFailureResponse(error, requestId, {
        BACKEND_TIMEOUT: "The backend login request timed out.",
        BACKEND_UNAVAILABLE: "The backend service is temporarily unavailable.",
      });
    }

    logBackendFailure("login", {
      requestId,
      portal,
      method: "POST",
      endpointPath: endpoint,
      timeoutMs,
      elapsedMs: Date.now() - startedAt,
      backendStatus: 500,
      code: "UNEXPECTED_LOGIN_ERROR",
      backendRequestId: undefined,
    });

    return buildFailureResponse(500, "UNEXPECTED_LOGIN_ERROR", "The login request could not be completed.", {requestId});
  }
}