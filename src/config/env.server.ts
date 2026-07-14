import "server-only";

type ServerEnv = {
  apiBaseUrl: string;
  appUrl?: string;
  cookieSecure: boolean;
};

let cachedEnv: ServerEnv | null = null;
let cachedApiBaseUrl: string | null = null;
let cachedCookieSecure: boolean | null = null;
let cachedAppUrl: string | undefined;
let appUrlResolved = false;

function readApiBaseUrl(): string {
  const value = process.env.API_BASE_URL;

  if (!value) {
    throw new Error("API_BASE_URL must be configured on the server.");
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
    get apiBaseUrl() {
      if (cachedApiBaseUrl) {
        return cachedApiBaseUrl;
      }

      cachedApiBaseUrl = readApiBaseUrl();
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
