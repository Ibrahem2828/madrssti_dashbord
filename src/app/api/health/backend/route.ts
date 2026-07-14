import {NextResponse} from "next/server";

import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendOriginUrl,
  classifyConnectivityStatus,
  diagnoseBackendFetchError,
  extractRequestId,
  fetchBackend,
  fetchBackendOrigin,
  getBackendRuntimeInfo,
  mapBackendRequestErrorToStatus,
} from "@/lib/api/backend";

async function probe(name: string, path: string, method: "GET" | "OPTIONS") {
  try {
    const response = await fetchBackend(path, {method, headers: {Accept: "application/json"}}, {timeoutMs: BACKEND_TIMEOUTS.health});

    return {
      name,
      method,
      path,
      status: response.status,
      result: classifyConnectivityStatus(response.status),
      requestId: response.headers.get("x-request-id") ?? undefined,
    };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return {
        name,
        method,
        path,
        status: mapBackendRequestErrorToStatus(error),
        result: "connectivity_error",
        errorCode: error.code,
        errorClass: error.details.errorClass,
        nestedErrorCode: error.details.nestedErrorCode,
        stage: error.details.stage,
      };
    }

    return {
      name,
      method,
      path,
      status: 500,
      result: "unexpected_error",
      errorCode: "UNEXPECTED_BACKEND_HEALTH_ERROR",
    };
  }
}

export async function GET(request: Request) {
  const runtime = getBackendRuntimeInfo();
  const url = new URL(request.url);
  const includeDiagnostic = url.searchParams.get("diagnostic") === "1";
  const checks = await Promise.all([
    probeRoot(),
    probe("central-login-options", AUTH_ENDPOINTS.central.login, "OPTIONS"),
    probe("school-login-options", AUTH_ENDPOINTS.school.login, "OPTIONS"),
  ]);
  const diagnosticChecks = includeDiagnostic ? await Promise.all([
    runDifferentialDiagnostic("direct-native-root", () => new URL("/", `${runtime.baseOrigin}/`), (target, requestId) =>
      fetch(target, {method: "GET", headers: {Accept: "application/json", "X-Request-ID": requestId}}),
    ),
    runDifferentialDiagnostic("builder-native-root", () => buildBackendOriginUrl("/"), (target, requestId) =>
      fetch(target, {method: "GET", headers: {Accept: "application/json", "X-Request-ID": requestId}}),
    ),
    runDifferentialDiagnostic("helper-root", () => buildBackendOriginUrl("/"), async (_target, requestId) =>
      fetchBackendOrigin("/", {method: "GET", headers: {Accept: "application/json", "X-Request-ID": requestId}}, {timeoutMs: BACKEND_TIMEOUTS.health, requestId}),
    ),
  ]) : undefined;

  const status = checks.some((check) => check.result === "mapping_error" || check.result === "backend_error" || check.result === "connectivity_error")
    ? 502
    : 200;

  return NextResponse.json(
    {
      success: status === 200,
      data: {
        status: status === 200 ? "ok" : "degraded",
        runtime: {
          ...runtime,
          cwd: process.cwd(),
        },
        checks,
        ...(diagnosticChecks ? {diagnosticChecks} : {}),
      },
    },
    {status},
  );
}

async function probeRoot() {
  try {
    const response = await fetchBackendOrigin("/", {method: "GET", headers: {Accept: "application/json"}}, {timeoutMs: BACKEND_TIMEOUTS.health});

    return {
      name: "backend-root",
      method: "GET",
      path: "/",
      status: response.status,
      result: classifyConnectivityStatus(response.status),
      requestId: response.headers.get("x-request-id") ?? undefined,
    };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return {
        name: "backend-root",
        method: "GET",
        path: "/",
        status: mapBackendRequestErrorToStatus(error),
        result: "connectivity_error",
        errorCode: error.code,
        errorClass: error.details.errorClass,
        nestedErrorCode: error.details.nestedErrorCode,
        stage: error.details.stage,
      };
    }

    return {
      name: "backend-root",
      method: "GET",
      path: "/",
      status: 500,
      result: "unexpected_error",
      errorCode: "UNEXPECTED_BACKEND_HEALTH_ERROR",
    };
  }
}

async function runDifferentialDiagnostic(
  name: string,
  buildUrl: () => URL,
  execute: (target: URL, requestId: string) => Promise<Response>,
) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  let target: URL | null = null;

  try {
    target = buildUrl();
  } catch (error) {
    return {
      name,
      requestId,
      backendRequestId: null,
      origin: null,
      pathname: null,
      status: null,
      durationMs: Date.now() - startedAt,
      stage: "url_construction",
      errorClass: getSafeErrorClass(error),
      nestedErrorCode: getSafeNestedErrorCode(error),
      errorCode: "INVALID_BACKEND_URL",
    };
  }

  try {
    const response = await execute(target, requestId);

    return {
      name,
      requestId,
      backendRequestId: extractRequestId(response) ?? null,
      origin: target.origin,
      pathname: target.pathname,
      status: response.status,
      durationMs: Date.now() - startedAt,
      stage: "http_response",
      errorClass: null,
      nestedErrorCode: null,
      result: classifyConnectivityStatus(response.status),
    };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return {
        name,
        requestId,
        backendRequestId: null,
        origin: target.origin,
        pathname: target.pathname,
        status: mapBackendRequestErrorToStatus(error),
        durationMs: Date.now() - startedAt,
        stage: error.details.stage,
        errorClass: error.details.errorClass,
        nestedErrorCode: error.details.nestedErrorCode ?? null,
        errorCode: error.code,
      };
    }

    const diagnosis = diagnoseBackendFetchError(error);

    return {
      name,
      requestId,
      backendRequestId: null,
      origin: target.origin,
      pathname: target.pathname,
      status: diagnosis.code === "BACKEND_TIMEOUT" ? 504 : 503,
      durationMs: Date.now() - startedAt,
      stage: diagnosis.details.stage,
      errorClass: diagnosis.details.errorClass,
      nestedErrorCode: diagnosis.details.nestedErrorCode ?? null,
      errorCode: diagnosis.code,
    };
  }
}

function getSafeErrorClass(error: unknown): string {
  if (error && typeof error === "object" && "constructor" in error) {
    const ctor = (error as {constructor?: {name?: unknown}}).constructor;
    if (ctor && typeof ctor.name === "string") {
      return ctor.name;
    }
  }

  return typeof error;
}

function getSafeNestedErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  if ("code" in error && typeof (error as {code?: unknown}).code === "string") {
    return (error as {code: string}).code;
  }

  const cause = "cause" in error ? (error as {cause?: unknown}).cause : undefined;
  if (cause && typeof cause === "object" && "code" in cause && typeof (cause as {code?: unknown}).code === "string") {
    return (cause as {code: string}).code;
  }

  return null;
}