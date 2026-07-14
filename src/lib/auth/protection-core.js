const ORIGIN_MISSING_MESSAGE = "The request origin header is missing.";
const ORIGIN_NOT_ALLOWED_MESSAGE = "The request origin is not allowed for this environment.";
const CSRF_TOKEN_MISSING_MESSAGE = "The CSRF token is missing.";
const CSRF_TOKEN_MISMATCH_MESSAGE = "The CSRF token does not match the current session cookie.";

export function validateRequestOriginValue(requestOriginValue, allowedAppUrl) {
  const allowedOrigin = normalizeOrigin(allowedAppUrl ?? null);
  const requestOrigin = normalizeOrigin(requestOriginValue);

  if (!requestOriginValue) {
    return {
      ok: false,
      code: "ORIGIN_MISSING",
      message: ORIGIN_MISSING_MESSAGE,
      allowedOrigin,
      requestOrigin: null,
    };
  }

  if (!allowedOrigin || !requestOrigin || requestOrigin !== allowedOrigin) {
    return {
      ok: false,
      code: "ORIGIN_NOT_ALLOWED",
      message: ORIGIN_NOT_ALLOWED_MESSAGE,
      allowedOrigin,
      requestOrigin,
    };
  }

  return {
    ok: true,
    allowedOrigin,
    requestOrigin,
  };
}

export function validateCsrfTokens(sentToken, storedToken, allowedOrigin, requestOrigin) {
  if (!sentToken || !storedToken) {
    return {
      ok: false,
      code: "CSRF_TOKEN_MISSING",
      message: CSRF_TOKEN_MISSING_MESSAGE,
      allowedOrigin,
      requestOrigin,
    };
  }

  if (sentToken !== storedToken) {
    return {
      ok: false,
      code: "CSRF_TOKEN_MISMATCH",
      message: CSRF_TOKEN_MISMATCH_MESSAGE,
      allowedOrigin,
      requestOrigin,
    };
  }

  return {
    ok: true,
    allowedOrigin,
    requestOrigin,
  };
}

function normalizeOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
