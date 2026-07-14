import "server-only";

import {NextResponse} from "next/server";

import {getServerEnv} from "@/config/env.server";
import {
  BACKEND_TIMEOUTS,
  classifyConnectivityStatus,
  diagnoseBackendFailure,
  mapErrorCodeToHttpStatus,
} from "./backend-core.js";
import type {
  BackendErrorCode,
  BackendFailureDetails,
  BackendRequestStage,
} from "./backend-core.js";
import type {ApiFailure} from "./contracts";

type FieldErrors = Record<string, string[]>;
type JsonRecord = Record<string, unknown>;

type FetchTimeoutOptions = {
  timeoutMs?: number;
  requestId?: string;
};

export type {BackendRequestStage};
export {BACKEND_TIMEOUTS, classifyConnectivityStatus, mapErrorCodeToHttpStatus};

export class BackendRequestError extends Error {
  constructor(
    public readonly code: BackendErrorCode,
    message: string,
    public readonly details: BackendFailureDetails,
  ) {
    super(message);
    this.name = "BackendRequestError";
  }
}

export function getBackendRuntimeInfo() {
  const url = new URL(getServerEnv().apiBaseUrl);
  const basePath = url.pathname.replace(/\/$/, "");

  return {
    baseOrigin: url.origin,
    basePath,
    includesApiV1: basePath === "/api/v1",
  };
}

export function buildBackendOriginUrl(path = "/"): URL {
  const apiUrl = new URL(getServerEnv().apiBaseUrl);

  if (!path.startsWith("/")) {
    throw new Error("Backend origin path must start with '/'.");
  }

  if (/^https?:\/\//i.test(path)) {
    throw new Error("Absolute backend origin URLs are not allowed.");
  }

  return new URL(path, `${apiUrl.origin}/`);
}

export function buildBackendUrl(path: string): URL {
  if (!path.startsWith("/")) {
    throw new Error("Backend path must start with '/'.");
  }

  if (/^https?:\/\//i.test(path)) {
    throw new Error("Absolute backend URLs are not allowed.");
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return new URL(normalizedPath, `${getServerEnv().apiBaseUrl}/`);
}

async function fetchWithTimeout(
  input: URL,
  init: RequestInit = {},
  {timeoutMs = BACKEND_TIMEOUTS.default, requestId}: FetchTimeoutOptions = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Request-ID", headers.get("X-Request-ID") ?? requestId ?? crypto.randomUUID());

  const callerSignal = init.signal;
  const controller = new AbortController();
  let timedOut = false;
  let cancelled = Boolean(callerSignal?.aborted);
  let detachCallerAbort: (() => void) | null = null;

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      const onAbort = () => {
        cancelled = true;
        controller.abort(callerSignal.reason);
      };

      callerSignal.addEventListener("abort", onAbort, {once: true});
      detachCallerAbort = () => callerSignal.removeEventListener("abort", onAbort);
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException("The backend request timed out.", "AbortError"));
  }, timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    const diagnosis = diagnoseBackendFailure(error, {
      timedOut,
      cancelled,
      stage: "request",
    });

    throw new BackendRequestError(diagnosis.code, diagnosis.message, diagnosis.details);
  } finally {
    clearTimeout(timeoutId);
    detachCallerAbort?.();
  }
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
  {timeoutMs = BACKEND_TIMEOUTS.default, requestId}: FetchTimeoutOptions = {},
): Promise<Response> {
  return fetchWithTimeout(buildBackendUrl(path), init, {timeoutMs, requestId});
}

export async function fetchBackendOrigin(
  path = "/",
  init: RequestInit = {},
  {timeoutMs = BACKEND_TIMEOUTS.default, requestId}: FetchTimeoutOptions = {},
): Promise<Response> {
  return fetchWithTimeout(buildBackendOriginUrl(path), init, {timeoutMs, requestId});
}

export async function readJsonBody(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function extractRequestId(response: Response, payload?: unknown): string | undefined {
  const headerId = response.headers.get("x-request-id") ?? response.headers.get("x-request-id".toUpperCase()) ?? undefined;
  if (headerId) {
    return headerId;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  if (typeof payload.request_id === "string") {
    return payload.request_id;
  }

  if (typeof payload.requestId === "string") {
    return payload.requestId;
  }

  if (isRecord(payload.error)) {
    if (typeof payload.error.request_id === "string") {
      return payload.error.request_id;
    }

    if (typeof payload.error.requestId === "string") {
      return payload.error.requestId;
    }
  }

  return undefined;
}

export function extractSuccessData(payload: unknown): JsonRecord | null {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return isRecord(payload) ? payload : null;
}

export function extractTokenPair(payload: unknown): {access: string; refresh: string} | null {
  const data = extractSuccessData(payload);

  if (!data) {
    return null;
  }

  const directAccess = readTokenValue(data, ["access", "access_token"]);
  const directRefresh = readTokenValue(data, ["refresh", "refresh_token"]);

  if (directAccess && directRefresh) {
    return {access: directAccess, refresh: directRefresh};
  }

  const tokens = isRecord(data.tokens) ? data.tokens : null;
  const nestedAccess = tokens ? readTokenValue(tokens, ["access", "access_token"]) : undefined;
  const nestedRefresh = tokens ? readTokenValue(tokens, ["refresh", "refresh_token"]) : undefined;

  if (nestedAccess && nestedRefresh) {
    return {access: nestedAccess, refresh: nestedRefresh};
  }

  return null;
}

export function extractAccessToken(payload: unknown): string | null {
  const data = extractSuccessData(payload);

  if (!data) {
    return null;
  }

  const directAccess = readTokenValue(data, ["access", "access_token"]);
  if (directAccess) {
    return directAccess;
  }

  const tokens = isRecord(data.tokens) ? data.tokens : null;
  return tokens ? readTokenValue(tokens, ["access", "access_token"]) ?? null : null;
}

export function extractErrorCode(payload: unknown, fallback: string): string {
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.code === "string") {
    return payload.error.code;
  }

  if (isRecord(payload) && typeof payload.code === "string") {
    return payload.code;
  }

  return fallback;
}

export function extractErrorMessage(payload: unknown, fallback: string): string {
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }

  if (isRecord(payload) && typeof payload.detail === "string") {
    return payload.detail;
  }

  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export function extractFieldErrors(payload: unknown): FieldErrors | undefined {
  const candidate = isRecord(payload) && isRecord(payload.error)
    ? payload.error.field_errors ?? payload.error.fieldErrors ?? payload.error.fields
    : isRecord(payload)
      ? payload.field_errors ?? payload.fieldErrors ?? payload.fields
      : undefined;

  if (!isRecord(candidate)) {
    return undefined;
  }

  const entries = Object.entries(candidate)
    .map(([key, value]) => [key, normalizeFieldErrors(value)] as const)
    .filter(([, value]) => value.length > 0);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function buildFailureResponse(
  status: number,
  code: string,
  message: string,
  {
    fieldErrors,
    requestId,
  }: {
    fieldErrors?: FieldErrors;
    requestId?: string;
  } = {},
) {
  const payload: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      ...(fieldErrors ? {fieldErrors} : {}),
    },
    ...(requestId ? {requestId} : {}),
  };

  const headers = requestId ? {"X-Request-ID": requestId} : undefined;
  return NextResponse.json(payload, {status, headers});
}

export function buildSuccessResponse<T>(data: T, requestId?: string) {
  return NextResponse.json(
    {success: true as const, data},
    {headers: requestId ? {"X-Request-ID": requestId} : undefined},
  );
}

export function mapBackendRequestErrorToStatus(error: BackendRequestError): number {
  return mapErrorCodeToHttpStatus(error.code, 503);
}

export function buildBackendRequestFailureResponse(
  error: BackendRequestError,
  requestId: string,
  messageOverrides?: Partial<Record<BackendErrorCode, string>>,
) {
  const status = mapBackendRequestErrorToStatus(error);
  const message = messageOverrides?.[error.code] ?? error.message;
  return buildFailureResponse(status, error.code, message, {requestId});
}

export function mapLoginFailure(status: number, payload: unknown) {
  const requestId = payload && isRecord(payload) ? text(payload.request_id) ?? text(payload.requestId) : undefined;
  const backendCode = extractErrorCode(payload, `HTTP_${status}`);
  const normalizedCode = normalizeLoginFailureCode(status, backendCode);
  const backendMessage = extractErrorMessage(payload, loginFailureFallbackMessage(status, normalizedCode));
  const fieldErrors = extractFieldErrors(payload);

  if (status === 400) {
    return {
      status: 400,
      code: normalizedCode,
      message: backendMessage,
      fieldErrors,
      requestId,
    };
  }

  if (status === 401) {
    return {
      status: 401,
      code: normalizedCode,
      message: backendMessage,
      fieldErrors,
      requestId,
    };
  }

  if (status === 403) {
    return {
      status: 403,
      code: normalizedCode,
      message: backendMessage,
      fieldErrors,
      requestId,
    };
  }

  if (status === 404) {
    return {
      status: 502,
      code: "ENDPOINT_MAPPING_ERROR",
      message: "The configured backend login endpoint was not found.",
      fieldErrors,
      requestId,
    };
  }

  if (status === 409) {
    return {
      status: 409,
      code: "CONFLICT",
      message: backendMessage,
      fieldErrors,
      requestId,
    };
  }

  if (status === 429) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      message: backendMessage,
      fieldErrors,
      requestId,
    };
  }

  if (status >= 500) {
    return {
      status: 502,
      code: "SERVER_ERROR",
      message: "The backend login endpoint failed while processing the request.",
      fieldErrors,
      requestId,
    };
  }

  return {
    status: 502,
    code: "INVALID_BACKEND_RESPONSE",
    message: "The backend returned an unexpected login response.",
    fieldErrors,
    requestId,
  };
}

export function logBackendFailure(context: string, details: Record<string, string | number | undefined>) {
  console.error(`[backend:${context}]`, JSON.stringify(details));
}

export function diagnoseBackendFetchError(
  error: unknown,
  options?: {
    timedOut?: boolean;
    cancelled?: boolean;
    stage?: BackendRequestStage;
  },
) {
  return diagnoseBackendFailure(error, options);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeFieldErrors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function readTokenValue(record: JsonRecord, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].length > 0) {
      return record[key] as string;
    }
  }

  return undefined;
}

function normalizeLoginFailureCode(status: number, backendCode: string): string {
  const normalized = backendCode.toUpperCase();

  if (status === 400) {
    return normalized === "HTTP_400" ? "VALIDATION_ERROR" : backendCode;
  }

  if (status === 401) {
    if (["HTTP_401", "INVALID_CREDENTIALS", "INVALID_LOGIN", "UNAUTHORIZED"].includes(normalized)) {
      return "AUTH_FAILED";
    }

    if (["INACTIVE_ACCOUNT", "ACCOUNT_INACTIVE", "USER_INACTIVE"].includes(normalized)) {
      return "USER_INACTIVE";
    }

    return backendCode;
  }

  if (status === 403) {
    if (["INACTIVE_ACCOUNT", "ACCOUNT_INACTIVE", "USER_INACTIVE"].includes(normalized)) {
      return "USER_INACTIVE";
    }

    if (["HTTP_403", "FORBIDDEN"].includes(normalized)) {
      return "PERMISSION_DENIED";
    }
  }

  return backendCode;
}

function loginFailureFallbackMessage(status: number, code: string): string {
  if (status === 400) {
    return "The login request could not be validated.";
  }

  if (status === 401 && code === "AUTH_FAILED") {
    return "The provided credentials are invalid.";
  }

  if (code === "USER_INACTIVE") {
    return "This account is inactive.";
  }

  if (status === 403) {
    return "This account cannot access the requested portal.";
  }

  return "Login failed";
}