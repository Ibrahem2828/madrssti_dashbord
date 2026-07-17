"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";

import {emptySession, type PortalSession} from "@/lib/auth/types";
import {can, canAll, canAny} from "@/lib/permissions/permission-utils";

type AuthContextValue = {
  session: PortalSession;
  loading: boolean;
  /** A safe, BFF-provided session failure. It never contains backend payloads or tokens. */
  sessionError: {code: string; requestId?: string} | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
  canAny: (permissions: readonly string[]) => boolean;
  canAll: (permissions: readonly string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readSessionError(value: unknown, requestId?: string): {code: string; requestId?: string} {
  if (isRecord(value) && isRecord(value.error) && typeof value.error.code === "string") {
    return {code: value.error.code, ...(typeof value.requestId === "string" ? {requestId: value.requestId} : requestId ? {requestId} : {})};
  }

  return {code: "SESSION_UNAVAILABLE", ...(requestId ? {requestId} : {})};
}

function parsePortalSession(value: unknown): PortalSession {
  if (!isRecord(value)) {
    return emptySession;
  }

  const portal = value.portal === "central" || value.portal === "school" ? value.portal : null;

  const user = isRecord(value.user)
    ? {
        id: typeof value.user.id === "string" ? value.user.id : "",
        email: typeof value.user.email === "string" ? value.user.email : "",
        fullName: typeof value.user.fullName === "string" ? value.user.fullName : "",
        userType: typeof value.user.userType === "string" ? value.user.userType : "",
      }
    : null;

  const activeSchool = isRecord(value.activeSchool)
    ? {
        id: typeof value.activeSchool.id === "string" ? value.activeSchool.id : "",
        name: typeof value.activeSchool.name === "string" ? value.activeSchool.name : "",
      }
    : null;

  const schools = Array.isArray(value.schools)
    ? value.schools
        .filter(isRecord)
        .map((school) => ({
          id: typeof school.id === "string" ? school.id : "",
          name: typeof school.name === "string" ? school.name : "",
          isPrimary: school.isPrimary === true,
        }))
        .filter((school) => school.id && school.name)
    : [];

  return {
    authenticated: value.authenticated === true && portal !== null,
    portal,
    user: user && user.id ? user : null,
    activeSchool: activeSchool && activeSchool.id ? activeSchool : null,
    schools,
    roles: readStringArray(value.roles),
    permissions: readStringArray(value.permissions),
  };
}

function readCsrfCookie(): string | null {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith("madrasti_csrf="))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [session, setSession] = useState<PortalSession>(emptySession);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<{code: string; requestId?: string} | null>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/session", {credentials: "same-origin"});
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setSession(emptySession);
        setSessionError(readSessionError(payload, response.headers.get("x-request-id") ?? undefined));
        return;
      }

      setSession(parsePortalSession(payload));
      setSessionError(null);
    } catch {
      setSession(emptySession);
      setSessionError({code: "SESSION_UNAVAILABLE"});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    const csrf = readCsrfCookie();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: csrf ? {"X-CSRF-Token": csrf} : {},
      });
    } catch {
      // Local authenticated state must still be cleared even when transport fails.
    } finally {
      setSession(emptySession);
      setSessionError(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      sessionError,
      refreshSession,
      logout,
      can: (permission) => can(session.permissions, permission),
      canAny: (permissions) => canAny(session.permissions, permissions),
      canAll: (permissions) => canAll(session.permissions, permissions),
    }),
    [loading, logout, refreshSession, session, sessionError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function usePortalSession() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("usePortalSession must be used within AuthProvider");
  }

  return value;
}
