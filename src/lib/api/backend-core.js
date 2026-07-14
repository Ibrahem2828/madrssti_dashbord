export const BACKEND_TIMEOUTS = Object.freeze({
  health: 10_000,
  authentication: 15_000,
  default: 20_000,
  mutation: 30_000,
  upload: 60_000,
  download: 60_000,
});

const TIMEOUT_ERROR_CODES = new Set([
  "ABORT_ERR",
  "ABORT_ERROR",
  "ETIMEDOUT",
  "ERR_SOCKET_CONNECTION_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
]);

const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "UND_ERR_SOCKET",
  "UND_ERR_DESTROYED",
  "UND_ERR_ABORTED",
]);

const TLS_ERROR_PREFIXES = [
  "CERT_",
  "ERR_SSL_",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
];

export function classifyConnectivityStatus(status) {
  if (status >= 200 && status < 300) {
    return "ok";
  }

  if (status === 401 || status === 403) {
    return "protected";
  }

  if (status === 404) {
    return "mapping_error";
  }

  if (status >= 500) {
    return "backend_error";
  }

  return "other";
}

export function mapErrorCodeToHttpStatus(code, fallbackStatus = 500) {
  switch (code) {
    case "ORIGIN_MISSING":
    case "ORIGIN_NOT_ALLOWED":
    case "CSRF_TOKEN_MISSING":
    case "CSRF_TOKEN_MISMATCH":
    case "PERMISSION_DENIED":
    case "NO_SCHOOL_CONTEXT":
    case "PATH_FORBIDDEN":
      return 403;
    case "AUTH_REQUIRED":
    case "AUTH_FAILED":
    case "AUTHENTICATION_REQUIRED":
    case "SESSION_EXPIRED":
      return 401;
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "FILE_TOO_LARGE":
      return 413;
    case "UNSUPPORTED_MEDIA_TYPE":
      return 415;
    case "BACKEND_TIMEOUT":
      return 504;
    case "BACKEND_UNAVAILABLE":
      return 503;
    case "ENDPOINT_MAPPING_ERROR":
    case "INVALID_BACKEND_RESPONSE":
    case "SERVER_ERROR":
      return 502;
    default:
      return fallbackStatus;
  }
}

export function diagnoseBackendFailure(error, options = {}) {
  const errorClass = getErrorClass(error);
  const nestedErrorCode = getNestedErrorCode(error);
  const normalizedCode = typeof nestedErrorCode === "string" ? nestedErrorCode.toUpperCase() : undefined;
  const stage = options.stage ?? "request";

  if (options.cancelled) {
    return {
      code: "BACKEND_UNAVAILABLE",
      message: "The backend request was cancelled before completion.",
      details: {
        failureKind: "cancelled",
        errorClass,
        nestedErrorCode: normalizedCode ?? "CALLER_CANCELLED",
        stage,
      },
    };
  }

  if (options.timedOut) {
    return {
      code: "BACKEND_TIMEOUT",
      message: "The backend request timed out.",
      details: {
        failureKind: "timeout",
        errorClass,
        nestedErrorCode: normalizedCode ?? "ABORT_ERROR",
        stage,
      },
    };
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: "BACKEND_TIMEOUT",
      message: "The backend request timed out.",
      details: {
        failureKind: "timeout",
        errorClass,
        nestedErrorCode: normalizedCode ?? "ABORT_ERROR",
        stage,
      },
    };
  }

  if (normalizedCode && TIMEOUT_ERROR_CODES.has(normalizedCode)) {
    return {
      code: "BACKEND_TIMEOUT",
      message: "The backend request timed out.",
      details: {
        failureKind: "timeout",
        errorClass,
        nestedErrorCode: normalizedCode,
        stage,
      },
    };
  }

  const isTlsError = typeof normalizedCode === "string" && TLS_ERROR_PREFIXES.some((prefix) => normalizedCode.startsWith(prefix));
  const isNetworkError = isTlsError || (typeof normalizedCode === "string" && NETWORK_ERROR_CODES.has(normalizedCode));

  return {
    code: "BACKEND_UNAVAILABLE",
    message: "The backend request could not be completed.",
    details: {
      failureKind: isNetworkError ? "network" : "network",
      errorClass,
      nestedErrorCode: normalizedCode,
      stage,
    },
  };
}

export function getErrorClass(error) {
  if (error && typeof error === "object" && "constructor" in error) {
    const ctor = error.constructor;

    if (ctor && typeof ctor.name === "string") {
      return ctor.name;
    }
  }

  return typeof error;
}

export function getNestedErrorCode(error) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if (typeof error.code === "string") {
    return error.code;
  }

  if (error.cause && typeof error.cause === "object" && typeof error.cause.code === "string") {
    return error.cause.code;
  }

  return undefined;
}