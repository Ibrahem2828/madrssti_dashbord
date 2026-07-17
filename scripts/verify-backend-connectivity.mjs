import {
  BACKEND_TIMEOUTS,
  classifyConnectivityStatus,
  diagnoseBackendFailure,
} from "../src/lib/api/backend-core.js";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

const DEFAULT_TIMEOUT_MS = BACKEND_TIMEOUTS.authentication;

loadLocalEnvironment();

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readBaseUrl() {
  const backendBaseUrl = process.env.BACKEND_BASE_URL?.trim();
  const value = readArg("--base-url")
    ?? process.env.API_BASE_URL?.trim()
    ?? (backendBaseUrl ? new URL("/api/v1", backendBaseUrl).toString() : undefined);

  if (!value) {
    throw new Error("BACKEND_BASE_URL, API_BASE_URL, or --base-url is required.");
  }

  const url = new URL(value);
  const normalizedPath = url.pathname.replace(/\/$/, "");

  if (normalizedPath !== "/api/v1") {
    throw new Error("API_BASE_URL must include the exact /api/v1 base path.");
  }

  if (backendBaseUrl && new URL(value).origin !== new URL(backendBaseUrl).origin) {
    throw new Error("API_BASE_URL and BACKEND_BASE_URL must use the same backend origin.");
  }

  return url.toString().replace(/\/$/, "");
}

function loadLocalEnvironment() {
  const envFilePath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envFilePath)) {
    return;
  }

  for (const line of readFileSync(envFilePath, "utf8").split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    process.env[key] = normalizeEnvironmentValue(trimmed.slice(separatorIndex + 1).trim());
  }
}

function normalizeEnvironmentValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function buildUrl(baseUrl, path) {
  if (!path.startsWith("/")) {
    throw new Error(`Backend path must start with '/': ${path}`);
  }

  return new URL(path.replace(/^\/+/, ""), `${baseUrl}/`).toString();
}

function buildOriginUrl(baseUrl, path = "/") {
  if (!path.startsWith("/")) {
    throw new Error(`Backend origin path must start with '/': ${path}`);
  }

  const origin = new URL(baseUrl).origin;
  return new URL(path, `${origin}/`).toString();
}

async function probe(url, name, method, path, {body, expected = "exists", timeoutMs = DEFAULT_TIMEOUT_MS} = {}) {
  const requestId = crypto.randomUUID();
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException("The backend request timed out.", "AbortError"));
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? {"Content-Type": "application/json"} : {}),
        "X-Request-ID": requestId,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = parseJson(text);
    const upstreamRequestId = response.headers.get("x-request-id") ?? payload?.request_id ?? payload?.requestId ?? requestId;
    const classification = classifyConnectivityStatus(response.status);

    return {
      name,
      method,
      path,
      status: response.status,
      classification,
      requestId,
      backendRequestId: upstreamRequestId,
      code: payload?.error?.code ?? payload?.code ?? undefined,
      errorClass: null,
      nestedErrorCode: null,
      expected,
    };
  } catch (error) {
    const diagnosis = diagnoseBackendFailure(error, {timedOut, stage: "request"});

    return {
      name,
      method,
      path,
      status: diagnosis.code === "BACKEND_TIMEOUT" ? 504 : 503,
      classification: "connectivity_error",
      requestId,
      backendRequestId: null,
      code: diagnosis.code,
      errorClass: diagnosis.details.errorClass,
      nestedErrorCode: diagnosis.details.nestedErrorCode ?? null,
      expected,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function main() {
  const baseUrl = readBaseUrl();
  const probes = await Promise.all([
    probe(buildOriginUrl(baseUrl, "/"), "backend-root", "GET", "/", {expected: "200", timeoutMs: BACKEND_TIMEOUTS.health}),
    probe(buildUrl(baseUrl, "/central/auth/login"), "central-login", "POST", "/central/auth/login", {
      body: {identifier: "invalid@example.test", password: "invalid"},
      expected: "401_or_400_not_404",
      timeoutMs: BACKEND_TIMEOUTS.authentication,
    }),
    probe(buildUrl(baseUrl, "/auth/login"), "school-login", "POST", "/auth/login", {
      body: {email: "invalid@example.test", password: "invalid"},
      expected: "401_or_400_not_404",
      timeoutMs: BACKEND_TIMEOUTS.authentication,
    }),
    probe(buildUrl(baseUrl, "/central/me"), "central-session", "GET", "/central/me", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
    probe(buildUrl(baseUrl, "/me"), "school-session", "GET", "/me", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
    probe(buildUrl(baseUrl, "/admin/users"), "school-users", "GET", "/admin/users", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
    probe(buildUrl(baseUrl, "/central/dashboard/overview"), "central-dashboard-overview", "GET", "/central/dashboard/overview", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
    probe(buildUrl(baseUrl, "/dashboard/kpis"), "school-dashboard-kpis", "GET", "/dashboard/kpis", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
    probe(buildUrl(baseUrl, "/admin/documents/overview"), "school-documents-overview", "GET", "/admin/documents/overview", {expected: "401_or_403", timeoutMs: BACKEND_TIMEOUTS.default}),
  ]);

  const failures = probes.filter((probeResult) => probeResult.classification === "mapping_error" || probeResult.classification === "backend_error" || probeResult.classification === "connectivity_error");
  const report = {
    baseOrigin: new URL(baseUrl).origin,
    basePath: new URL(baseUrl).pathname.replace(/\/$/, ""),
    includesApiV1: true,
    probes,
    passed: failures.length === 0,
  };

  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        passed: false,
        error: {
          code: "VERIFY_BACKEND_CONNECTIVITY_FAILED",
          message: error instanceof Error ? error.message : "Unexpected script failure.",
        },
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
