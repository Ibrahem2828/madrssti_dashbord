import "server-only";

import {NextRequest, NextResponse} from "next/server";

import type {Portal} from "@/config/routes";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  buildBackendRequestFailureResponse,
  buildFailureResponse,
  extractRequestId,
  fetchBackend,
  logBackendFailure,
  mapBackendRequestErrorToStatus,
} from "@/lib/api/backend";
import {authCookieValues} from "@/lib/auth/cookies";
import {validateSameOriginAndCsrf} from "@/lib/auth/csrf";

const safeHeaders = ["accept", "content-type", "x-request-id", "idempotency-key", "if-match"] as const;

export async function proxyGateway(request: NextRequest, portal: Portal, path: string[]): Promise<NextResponse> {
  const auth = authCookieValues();
  if (!auth.access || auth.portal !== portal) {
    return buildFailureResponse(401, "AUTHENTICATION_REQUIRED", "Authentication required");
  }

  if (!validPath(path, portal)) {
    return buildFailureResponse(403, "PATH_FORBIDDEN", "Path is not allowed");
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    const protection = validateSameOriginAndCsrf();

    if (!protection.ok) {
      return buildFailureResponse(403, protection.code, protection.message, {
        requestId: crypto.randomUUID(),
      });
    }
  }

  const headers = new Headers();
  safeHeaders.forEach((name) => {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  });

  headers.set("Authorization", `Bearer ${auth.access}`);
  headers.set("X-Request-ID", headers.get("X-Request-ID") ?? crypto.randomUUID());

  if (portal === "school" && auth.activeSchool) {
    headers.set("X-School-ID", auth.activeSchool);
  }

  const timeoutMs = request.method === "GET" || request.method === "HEAD"
    ? BACKEND_TIMEOUTS.default
    : BACKEND_TIMEOUTS.mutation;
  const startedAt = Date.now();

  try {
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
    const response = await fetchBackend(
      `/${path.join("/")}`,
      {
        method: request.method,
        headers,
        body: body && body.byteLength ? body : undefined,
        redirect: "manual",
      },
      {requestId: headers.get("X-Request-ID") ?? undefined, timeoutMs},
    );

    return responseFrom(response);
  } catch (error) {
    const requestId = headers.get("X-Request-ID") ?? undefined;

    if (error instanceof BackendRequestError) {
      logBackendFailure("gateway", {
        requestId,
        portal,
        method: request.method,
        endpointPath: `/${path.join("/")}`,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: mapBackendRequestErrorToStatus(error),
        code: error.code,
        errorName: error.details.errorClass,
        causeCode: error.details.nestedErrorCode,
        stage: error.details.stage,
        backendRequestId: undefined,
      });

      return buildBackendRequestFailureResponse(error, requestId ?? crypto.randomUUID(), {
        BACKEND_TIMEOUT: "The backend request timed out.",
        BACKEND_UNAVAILABLE: "The backend request could not be completed.",
      });
    }

    return buildFailureResponse(500, "UNEXPECTED_GATEWAY_ERROR", "The gateway request could not be completed.", {requestId});
  }
}

function validPath(path: string[], portal: Portal): boolean {
  if (!path.length || path.some((segment) => !segment || segment.includes("..") || /%2e|:|\\/i.test(segment))) {
    return false;
  }

  const first = path[0]?.toLowerCase() ?? "";
  return portal === "central"
    ? !["admin", "students", "teachers", "school", "auth", "me"].includes(first)
    : first !== "central";
}

async function responseFrom(response: Response): Promise<NextResponse> {
  const headers = new Headers();
  ["content-type", "content-disposition", "cache-control", "x-request-id"].forEach((name) => {
    const value = response.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  });

  const requestId = extractRequestId(response);
  if (requestId && !headers.get("x-request-id")) {
    headers.set("X-Request-ID", requestId);
  }

  return new NextResponse(response.body, {status: response.status, headers});
}