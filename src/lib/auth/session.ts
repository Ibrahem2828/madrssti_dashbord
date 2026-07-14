import "server-only";

import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  extractRequestId,
  fetchBackend,
  logBackendFailure,
  readJsonBody,
} from "@/lib/api/backend";
import {authCookieValues} from "./cookies";
import {emptySession, type PortalSession} from "./types";

export type SessionResult =
  | {ok: true; session: PortalSession}
  | {ok: false; status: number; code: string; message: string; requestId?: string};

export async function getSessionResult(): Promise<SessionResult> {
  const {access, portal} = authCookieValues();

  if (!access || !portal) {
    return {ok: true, session: emptySession};
  }

  const endpoint = portal === "central" ? AUTH_ENDPOINTS.central.me : AUTH_ENDPOINTS.school.me;
  const requestId = crypto.randomUUID();
  const timeoutMs = BACKEND_TIMEOUTS.default;
  const startedAt = Date.now();

  try {
    const response = await fetchBackend(
      endpoint,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access}`,
          "X-Request-ID": requestId,
        },
        cache: "no-store",
      },
      {requestId, timeoutMs},
    );
    const body = await readJsonBody(response);
    const upstreamRequestId = extractRequestId(response, body) ?? requestId;

    if (response.status === 401 || response.status === 403) {
      return {ok: true, session: emptySession};
    }

    if (!response.ok) {
      logBackendFailure("session", {
        requestId,
        portal,
        method: "GET",
        endpointPath: endpoint,
        timeoutMs,
        elapsedMs: Date.now() - startedAt,
        backendStatus: response.status,
        code: `HTTP_${response.status}`,
        backendRequestId: upstreamRequestId,
      });

      return {
        ok: false,
        status: response.status >= 500 ? 502 : response.status,
        code: response.status === 404 ? "ENDPOINT_MAPPING_ERROR" : `HTTP_${response.status}`,
        message: response.status === 404 ? "The configured backend session endpoint was not found." : "The backend session request failed.",
        requestId: upstreamRequestId,
      };
    }

    const data = isRecord(body) && isRecord(body.data) ? body.data : body;

    if (!isRecord(data)) {
      return {
        ok: false,
        status: 502,
        code: "INVALID_BACKEND_RESPONSE",
        message: "The backend session response was not valid JSON data.",
        requestId: upstreamRequestId,
      };
    }

    const centralUser = portal === "central" && isRecord(data.user) ? data.user : data;
    const centralSession = portal === "central" && isRecord(data.session) ? data.session : null;
    const active = isRecord(data.active_school) ? data.active_school : null;
    const schools = Array.isArray(data.schools) ? data.schools : [];

    return {
      ok: true,
      session: {
        authenticated: true,
        portal,
        user: {
          id: stringOf(centralUser.id),
          email: stringOf(centralUser.email),
          fullName: stringOf(centralUser.full_name ?? centralUser.fullName),
          userType: stringOf(centralUser.user_type ?? centralUser.userType),
        },
        activeSchool: active ? {id: stringOf(active.id), name: stringOf(active.name)} : null,
        schools: schools
          .filter(isRecord)
          .map((school) => ({
            id: stringOf(school.id),
            name: stringOf(school.name),
            isPrimary: Boolean(school.is_primary ?? school.isPrimary),
          })),
        roles: strings(data.roles),
        permissions: strings(centralSession?.permissions ?? data.permissions),
      },
    };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return {
        ok: false,
        status: error.code === "BACKEND_TIMEOUT" ? 504 : 503,
        code: error.code,
        message: error.code === "BACKEND_TIMEOUT" ? "The backend session request timed out." : "The backend session request could not be completed.",
        requestId,
      };
    }

    return {
      ok: false,
      status: 500,
      code: "UNEXPECTED_SESSION_ERROR",
      message: "The session request could not be completed.",
      requestId,
    };
  }
}

export async function getSession(): Promise<PortalSession> {
  const result = await getSessionResult();
  return result.ok ? result.session : emptySession;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}