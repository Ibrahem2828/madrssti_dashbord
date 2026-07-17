import "server-only";

import {NextResponse} from "next/server";

import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import type {Portal} from "@/config/routes";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendRequestFailureResponse,
  buildFailureResponse,
  buildSuccessResponse,
  extractErrorCode,
  extractFieldErrors,
  extractRequestId,
  fetchBackend,
  logBackendFailure,
  readJsonBody,
} from "@/lib/api/backend";
import {authCookieValues, clearAuthCookies} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";

import type {AccountProfile} from "../types";

type JsonRecord = Record<string, unknown>;

type ProfileInput = {
  fullName: string;
  email: string;
  phone: string;
};

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function getOwnProfile(): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const auth = authenticate(requestId);

  if (auth instanceof NextResponse) {
    return auth;
  }

  return requestProfile(auth.portal, auth.access, requestId);
}

export async function updateOwnProfile(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const auth = authenticate(requestId);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const input = parseProfileInput(await request.json().catch(() => null));
  if (!input) {
    return buildFailureResponse(400, "VALIDATION_ERROR", "Profile data is incomplete.", {requestId});
  }

  const endpoint = profileEndpoint(auth.portal);
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      endpoint,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.access}`,
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({full_name: input.fullName, email: input.email, phone: input.phone}),
      },
      {requestId, timeoutMs: BACKEND_TIMEOUTS.mutation},
    );
    const payload = await readJsonBody(response);

    if (!response.ok) {
      return backendFailure(response, payload, requestId);
    }

    const profile = profileFromPayload(payload);
    if (!profile) {
      return buildFailureResponse(502, "INVALID_BACKEND_RESPONSE", "The profile update response was invalid.", {
        requestId: extractRequestId(response, payload) ?? requestId,
      });
    }

    return buildSuccessResponse({profile}, extractRequestId(response, payload) ?? requestId);
  } catch (error) {
    return requestFailure(error, {
      requestId,
      portal: auth.portal,
      endpoint,
      operation: "profile-update",
      method: "PATCH",
      startedAt,
    });
  }
}

export async function changeOwnPassword(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const protection = validateSameOriginAndCsrf();

  if (!protection.ok) {
    return buildFailureResponse(403, protection.code, protection.message, {requestId});
  }

  const auth = authenticate(requestId);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const input = parsePasswordInput(await request.json().catch(() => null));
  if (!input) {
    return buildFailureResponse(400, "VALIDATION_ERROR", "Password data is incomplete.", {requestId});
  }

  const endpoint = AUTH_ENDPOINTS.shared.changePassword;
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      endpoint,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.access}`,
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({old_password: input.currentPassword, new_password: input.newPassword}),
      },
      {requestId, timeoutMs: BACKEND_TIMEOUTS.authentication},
    );
    const payload = await readJsonBody(response);
    const upstreamRequestId = extractRequestId(response, payload) ?? requestId;

    if (!response.ok) {
      return backendFailure(response, payload, upstreamRequestId, {passwordChange: true});
    }

    await revokeSessionAfterPasswordChange(auth, requestId);
    clearAuthCookies();
    return buildSuccessResponse({reauthenticationRequired: true}, upstreamRequestId);
  } catch (error) {
    return requestFailure(error, {
      requestId,
      portal: auth.portal,
      endpoint,
      operation: "password-change",
      method: "POST",
      startedAt,
    });
  }
}

async function requestProfile(portal: Portal, access: string, requestId: string): Promise<NextResponse> {
  const endpoint = profileEndpoint(portal);
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      endpoint,
      {
        method: "GET",
        headers: {Accept: "application/json", Authorization: `Bearer ${access}`, "X-Request-ID": requestId},
      },
      {requestId, timeoutMs: BACKEND_TIMEOUTS.default},
    );
    const payload = await readJsonBody(response);

    if (!response.ok) {
      return backendFailure(response, payload, requestId);
    }

    const profile = profileFromPayload(payload);
    if (!profile) {
      return buildFailureResponse(502, "INVALID_BACKEND_RESPONSE", "The profile response was invalid.", {
        requestId: extractRequestId(response, payload) ?? requestId,
      });
    }

    return buildSuccessResponse({profile}, extractRequestId(response, payload) ?? requestId);
  } catch (error) {
    return requestFailure(error, {requestId, portal, endpoint, operation: "profile-read", method: "GET", startedAt});
  }
}

function authenticate(requestId: string): {access: string; refresh?: string; portal: Portal} | NextResponse {
  const auth = authCookieValues();

  if (!auth.access || !auth.portal) {
    return buildFailureResponse(401, "AUTHENTICATION_REQUIRED", "Authentication required.", {requestId});
  }

  return {access: auth.access, refresh: auth.refresh, portal: auth.portal};
}

function profileEndpoint(portal: Portal): string {
  return portal === "central" ? AUTH_ENDPOINTS.central.me : AUTH_ENDPOINTS.school.me;
}

function parseProfileInput(value: unknown): ProfileInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const fullName = text(value.fullName)?.trim();
  const email = text(value.email)?.trim();
  const phone = text(value.phone)?.trim();

  if (!fullName || !email || phone === undefined) {
    return null;
  }

  return {fullName, email, phone};
}

function parsePasswordInput(value: unknown): PasswordInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const currentPassword = text(value.currentPassword);
  const newPassword = text(value.newPassword);

  if (!currentPassword || !newPassword) {
    return null;
  }

  return {currentPassword, newPassword};
}

function profileFromPayload(payload: unknown): AccountProfile | null {
  const candidate = isRecord(payload) && isRecord(payload.user) ? payload.user : payload;
  if (!isRecord(candidate)) {
    return null;
  }

  const id = text(candidate.id);
  const fullName = text(candidate.full_name) ?? text(candidate.fullName);
  const email = text(candidate.email);
  const phone = text(candidate.phone) ?? "";
  const userType = text(candidate.user_type) ?? text(candidate.userType);

  if (!id || !fullName || !email || !userType) {
    return null;
  }

  return {id, fullName, email, phone, userType};
}

function backendFailure(
  response: Response,
  payload: unknown,
  fallbackRequestId: string,
  options: {passwordChange?: boolean} = {},
): NextResponse {
  const requestId = extractRequestId(response, payload) ?? fallbackRequestId;
  const backendCode = extractErrorCode(payload, `HTTP_${response.status}`);
  const normalized = backendCode.toUpperCase();
  const fieldErrors = extractFieldErrors(payload);

  if (response.status === 404) {
    return buildFailureResponse(502, "ENDPOINT_MAPPING_ERROR", "The configured account endpoint was not found.", {requestId});
  }

  if (response.status >= 500) {
    return buildFailureResponse(502, "SERVER_ERROR", "The account service could not complete the request.", {requestId});
  }

  if (options.passwordChange && response.status === 400 && normalized === "CURRENT_PASSWORD_INVALID") {
    return buildFailureResponse(400, "CURRENT_PASSWORD_INVALID", "The current password is incorrect.", {requestId});
  }

  const code = response.status === 400
    ? "VALIDATION_ERROR"
    : response.status === 401
      ? "AUTH_REQUIRED"
      : response.status === 403
        ? "PERMISSION_DENIED"
        : response.status === 409
          ? "CONFLICT"
          : response.status === 429
            ? "RATE_LIMITED"
            : backendCode;
  const message = response.status === 400
    ? "The submitted account data is invalid."
    : response.status === 401
      ? "Your session is no longer valid."
      : response.status === 403
        ? "You cannot perform this account action."
        : response.status === 409
          ? "This email address is already in use."
          : response.status === 429
            ? "Too many requests. Please try again later."
            : "The account request could not be completed.";

  return buildFailureResponse(response.status, code, message, {fieldErrors, requestId});
}

async function revokeSessionAfterPasswordChange(
  auth: {access: string; refresh?: string; portal: Portal},
  requestId: string,
): Promise<void> {
  if (!auth.refresh) {
    return;
  }

  const endpoint = auth.portal === "central" ? AUTH_ENDPOINTS.central.logout : AUTH_ENDPOINTS.school.logout;

  try {
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
      {requestId, timeoutMs: BACKEND_TIMEOUTS.mutation},
    );
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logBackendFailure("password-change-logout", {
        requestId,
        portal: auth.portal,
        method: "POST",
        endpointPath: endpoint,
        timeoutMs: BACKEND_TIMEOUTS.mutation,
        code: error.code,
        errorName: error.details.errorClass,
        causeCode: error.details.nestedErrorCode,
        stage: error.details.stage,
      });
    }
  }
}

function requestFailure(
  error: unknown,
  context: {requestId: string; portal: Portal; endpoint: string; operation: string; method: "GET" | "PATCH" | "POST"; startedAt: number},
): NextResponse {
  if (error instanceof BackendRequestError) {
    logBackendFailure(context.operation, {
      requestId: context.requestId,
      portal: context.portal,
      method: context.method,
      endpointPath: context.endpoint,
      timeoutMs: BACKEND_TIMEOUTS.default,
      elapsedMs: Date.now() - context.startedAt,
      code: error.code,
      errorName: error.details.errorClass,
      causeCode: error.details.nestedErrorCode,
      stage: error.details.stage,
    });
    return buildBackendRequestFailureResponse(error, context.requestId);
  }

  return buildFailureResponse(500, "UNEXPECTED_ACCOUNT_ERROR", "The account request could not be completed.", {
    requestId: context.requestId,
  });
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
