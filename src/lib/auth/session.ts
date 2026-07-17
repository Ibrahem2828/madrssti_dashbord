import "server-only";

import {AUTH_ENDPOINTS} from "@/config/auth-endpoints";
import {
  BACKEND_TIMEOUTS,
  BackendRequestError,
  extractRequestId,
  extractErrorCode,
  fetchBackend,
  logBackendFailure,
  readJsonBody,
} from "@/lib/api/backend";
import {authCookieValues, clearAuthCookies, setActiveSchool} from "./cookies";
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

    if (response.status === 401) {
      clearAuthCookies();
      return {
        ok: false,
        status: 401,
        code: "SESSION_EXPIRED",
        message: "The authenticated session has expired.",
        requestId: upstreamRequestId,
      };
    }

    if (response.status === 403) {
      return {
        ok: false,
        status: 403,
        code: extractErrorCode(body, "SCHOOL_ACCESS_DENIED"),
        message: "The account cannot access the selected school context.",
        requestId: upstreamRequestId,
      };
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

    const session = sessionFromBackendPayload(portal, body);

    if (!session) {
      return {
        ok: false,
        status: 502,
        code: "INVALID_BACKEND_RESPONSE",
        message: "The backend session response was not valid JSON data.",
        requestId: upstreamRequestId,
      };
    }

    // The active school is derived only from the authenticated backend session.
    // This prevents a browser-supplied school value from becoming gateway context.
    if (portal === "school" && session.activeSchool) {
      setActiveSchool(session.activeSchool.id);
    }

    return {
      ok: true,
      session,
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

/**
 * Normalizes the two verified backend session envelopes without leaking either
 * envelope to client components. Central returns `user`/`session`; school
 * returns `user`, `session.school`, and `memberships`.
 */
function sessionFromBackendPayload(portal: "central" | "school", body: unknown): PortalSession | null {
  const data = isRecord(body) && isRecord(body.data) ? body.data : body;

  if (!isRecord(data)) {
    return null;
  }

  const user = isRecord(data.user) ? data.user : data;
  const backendSession = isRecord(data.session) ? data.session : null;
  const memberships = Array.isArray(data.memberships) ? data.memberships : [];
  const fallbackSchools = Array.isArray(data.schools) ? data.schools : [];
  const schools = schoolSummaries(memberships, fallbackSchools);
  const activeFromBackend = portal === "school"
    ? schoolSummary(backendSession?.school ?? data.active_school)
    : schoolSummary(data.active_school);
  const activeSchool = activeFromBackend ?? schools.find((school) => school.isPrimary) ?? schools[0] ?? null;
  const roleSource = backendSession?.roles ?? data.roles;
  const permissionSource = backendSession?.permissions ?? data.permissions;
  const userId = stringOf(user.id);

  if (!userId) {
    return null;
  }

  return {
    authenticated: true,
    portal,
    user: {
      id: userId,
      email: stringOf(user.email),
      fullName: stringOf(user.full_name ?? user.fullName),
      userType: stringOf(user.user_type ?? user.userType),
    },
    activeSchool,
    schools,
    roles: roleNames(roleSource),
    permissions: strings(permissionSource),
  };
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

function roleNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((role) => {
    if (typeof role === "string") {
      return role;
    }

    if (!isRecord(role)) {
      return [];
    }

    const name = stringOf(role.name ?? role.code);
    return name ? [name] : [];
  });
}

function schoolSummaries(memberships: unknown[], fallbackSchools: unknown[]): PortalSession["schools"] {
  const fromMemberships = memberships.flatMap((membership) => {
    if (!isRecord(membership)) {
      return [];
    }

    const school = schoolSummary(membership.school);
    return school ? [{...school, isPrimary: Boolean(membership.is_primary ?? membership.isPrimary)}] : [];
  });

  if (fromMemberships.length > 0) {
    return fromMemberships;
  }

  return fallbackSchools.flatMap((school) => {
    const summary = schoolSummary(school);
    return summary ? [{...summary, isPrimary: isRecord(school) && Boolean(school.is_primary ?? school.isPrimary)}] : [];
  });
}

function schoolSummary(value: unknown): {id: string; name: string} | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringOf(value.id);
  const name = stringOf(value.name);
  return id && name ? {id, name} : null;
}
