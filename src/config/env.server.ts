import "server-only";

type ServerEnv = {
  backendBaseUrl: string;
  apiBaseUrl: string;
  appUrl?: string;
  cookieSecure: boolean;
};

let cachedEnv: ServerEnv | null = null;
let cachedBackendBaseUrl: string | null = null;
let cachedApiBaseUrl: string | null = null;
let cachedCookieSecure: boolean | null = null;
let cachedAppUrl: string | undefined;
let appUrlResolved = false;

function readBackendBaseUrl(): string | null {
  const value = process.env.BACKEND_BASE_URL?.trim();

  if (!value) {
    return null;
  }

  let backendBaseUrl: URL;

  try {
    backendBaseUrl = new URL(value);
  } catch {
    throw new Error("BACKEND_BASE_URL must be an absolute URL.");
  }

  if (!/^https?:$/.test(backendBaseUrl.protocol)) {
    throw new Error("BACKEND_BASE_URL must use HTTP or HTTPS.");
  }

  if (backendBaseUrl.pathname !== "/" && backendBaseUrl.pathname !== "") {
    throw new Error("BACKEND_BASE_URL must be an origin without an API path.");
  }

  return backendBaseUrl.origin;
}

function readApiBaseUrl(backendBaseUrl: string | null): string {
  const value = process.env.API_BASE_URL?.trim() ?? (backendBaseUrl ? new URL("/api/v1", backendBaseUrl).toString() : "");

  if (!value) {
    throw new Error("Configure BACKEND_BASE_URL or the legacy API_BASE_URL on the server.");
  }

  let apiBaseUrl: URL;

  try {
    apiBaseUrl = new URL(value);
  } catch {
    throw new Error("API_BASE_URL must be an absolute URL.");
  }

  if (!/^https?:$/.test(apiBaseUrl.protocol)) {
    throw new Error("API_BASE_URL must use HTTP or HTTPS.");
  }

  const normalizedPath = apiBaseUrl.pathname.replace(/\/$/, "");

  if (normalizedPath !== "/api/v1") {
    throw new Error("API_BASE_URL must include the exact /api/v1 base path.");
  }

  if (backendBaseUrl && apiBaseUrl.origin !== backendBaseUrl) {
    throw new Error("API_BASE_URL and BACKEND_BASE_URL must use the same backend origin.");
  }

  return apiBaseUrl.toString().replace(/\/$/, "");
}

function readAppUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  let appUrl: URL;

  try {
    appUrl = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be an absolute URL when configured.");
  }

  if (!/^https?:$/.test(appUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTP or HTTPS.");
  }

  const allowLocalRuntimeAppUrl = process.env.MADRASTI_LOCAL_RUNTIME === "true";

  if (process.env.NODE_ENV === "production" && isLocalDevelopmentHost(appUrl.hostname) && !allowLocalRuntimeAppUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL must not use localhost or loopback hosts in production.");
  }

  return appUrl.origin;
}

function isLocalDevelopmentHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    get backendBaseUrl() {
      if (cachedBackendBaseUrl) {
        return cachedBackendBaseUrl;
      }

      const explicitBackendBaseUrl = readBackendBaseUrl();
      const apiBaseUrl = readApiBaseUrl(explicitBackendBaseUrl);
      cachedBackendBaseUrl = explicitBackendBaseUrl ?? new URL(apiBaseUrl).origin;
      return cachedBackendBaseUrl;
    },
    get apiBaseUrl() {
      if (cachedApiBaseUrl) {
        return cachedApiBaseUrl;
      }

      cachedApiBaseUrl = readApiBaseUrl(cachedBackendBaseUrl ?? readBackendBaseUrl());
      return cachedApiBaseUrl;
    },
    get appUrl() {
      if (appUrlResolved) {
        return cachedAppUrl;
      }

      cachedAppUrl = readAppUrl(process.env.NEXT_PUBLIC_APP_URL?.trim());
      appUrlResolved = true;
      return cachedAppUrl;
    },
    get cookieSecure() {
      if (cachedCookieSecure !== null) {
        return cachedCookieSecure;
      }

      const configuredCookieSecure = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();
      cachedCookieSecure =
        configuredCookieSecure === "true"
          ? true
          : configuredCookieSecure === "false"
            ? false
            : process.env.NODE_ENV === "production";

      return cachedCookieSecure;
    },
  };

  return cachedEnv;
}

export const env = {
  get backendBaseUrl() {
    return getServerEnv().backendBaseUrl;
  },
  get apiBaseUrl() {
    return getServerEnv().apiBaseUrl;
  },
  get appUrl() {
    return getServerEnv().appUrl;
  },
  get cookieSecure() {
    return getServerEnv().cookieSecure;
  },
} as const;
