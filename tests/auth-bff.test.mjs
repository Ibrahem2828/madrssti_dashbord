import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

import {
  BACKEND_TIMEOUTS,
  diagnoseBackendFailure,
  mapErrorCodeToHttpStatus,
} from "../src/lib/api/backend-core.js";
import {validateRequestOriginValue, validateCsrfTokens} from "../src/lib/auth/protection-core.js";
import {buildLoginCredentials} from "../src/features/auth/services/login-payload.js";

test("valid same-origin + matching CSRF passes validation", () => {
  const originResult = validateRequestOriginValue("http://localhost:3000", "http://localhost:3000");
  assert.equal(originResult.ok, true);

  if (!originResult.ok) {
    throw new Error("Expected origin validation to pass.");
  }

  const csrfResult = validateCsrfTokens("token-1", "token-1", originResult.allowedOrigin, originResult.requestOrigin);
  assert.deepEqual(csrfResult, {
    ok: true,
    allowedOrigin: "http://localhost:3000",
    requestOrigin: "http://localhost:3000",
  });
});

test("missing CSRF header fails with CSRF_TOKEN_MISSING", () => {
  const csrfResult = validateCsrfTokens(null, "cookie-token", "http://localhost:3000", "http://localhost:3000");
  assert.equal(csrfResult.ok, false);

  if (csrfResult.ok) {
    throw new Error("Expected CSRF validation to fail.");
  }

  assert.equal(csrfResult.code, "CSRF_TOKEN_MISSING");
});

test("missing CSRF cookie fails with CSRF_TOKEN_MISSING", () => {
  const csrfResult = validateCsrfTokens("header-token", null, "http://localhost:3000", "http://localhost:3000");
  assert.equal(csrfResult.ok, false);

  if (csrfResult.ok) {
    throw new Error("Expected CSRF validation to fail.");
  }

  assert.equal(csrfResult.code, "CSRF_TOKEN_MISSING");
});

test("mismatched CSRF token fails with CSRF_TOKEN_MISMATCH", () => {
  const csrfResult = validateCsrfTokens("header-token", "cookie-token", "http://localhost:3000", "http://localhost:3000");
  assert.equal(csrfResult.ok, false);

  if (csrfResult.ok) {
    throw new Error("Expected CSRF validation to fail.");
  }

  assert.equal(csrfResult.code, "CSRF_TOKEN_MISMATCH");
});

test("invalid Origin fails with ORIGIN_NOT_ALLOWED", () => {
  const originResult = validateRequestOriginValue("http://127.0.0.1:3000", "http://localhost:3000");
  assert.equal(originResult.ok, false);

  if (originResult.ok) {
    throw new Error("Expected origin validation to fail.");
  }

  assert.equal(originResult.code, "ORIGIN_NOT_ALLOWED");
  assert.equal(originResult.allowedOrigin, "http://localhost:3000");
  assert.equal(originResult.requestOrigin, "http://127.0.0.1:3000");
});

test("localhost development Origin is accepted", () => {
  const originResult = validateRequestOriginValue("http://localhost:3000", "http://localhost:3000");
  assert.deepEqual(originResult, {
    ok: true,
    allowedOrigin: "http://localhost:3000",
    requestOrigin: "http://localhost:3000",
  });
});

test("Central login request mapping uses identifier/password", () => {
  assert.deepEqual(buildLoginCredentials("central", "central@example.test", "secret"), {
    identifier: "central@example.test",
    password: "secret",
  });
});

test("School login request mapping uses email/password", () => {
  assert.deepEqual(buildLoginCredentials("school", "school@example.test", "secret"), {
    email: "school@example.test",
    password: "secret",
  });
});

test("shared auth timeout policy does not use a one-second login timeout", () => {
  assert.equal(BACKEND_TIMEOUTS.authentication, 15_000);
  assert.ok(BACKEND_TIMEOUTS.authentication > 2_000);
});

test("undici connect timeout is classified as BACKEND_TIMEOUT", () => {
  const diagnosis = diagnoseBackendFailure({cause: {code: "UND_ERR_CONNECT_TIMEOUT"}}, {stage: "request"});
  assert.equal(diagnosis.code, "BACKEND_TIMEOUT");
  assert.equal(diagnosis.details.failureKind, "timeout");
  assert.equal(diagnosis.details.nestedErrorCode, "UND_ERR_CONNECT_TIMEOUT");
});

test("caller cancellation is separated from backend timeout", () => {
  const diagnosis = diagnoseBackendFailure(new DOMException("cancelled", "AbortError"), {cancelled: true, stage: "request"});
  assert.equal(diagnosis.code, "BACKEND_UNAVAILABLE");
  assert.equal(diagnosis.details.failureKind, "cancelled");
  assert.equal(diagnosis.details.nestedErrorCode, "CALLER_CANCELLED");
});

test("shared status mapping keeps backend timeout out of HTTP 403", () => {
  assert.equal(mapErrorCodeToHttpStatus("BACKEND_TIMEOUT"), 504);
  assert.equal(mapErrorCodeToHttpStatus("BACKEND_UNAVAILABLE"), 503);
  assert.equal(mapErrorCodeToHttpStatus("ORIGIN_NOT_ALLOWED"), 403);
  assert.equal(mapErrorCodeToHttpStatus("AUTH_FAILED"), 401);
  assert.equal(mapErrorCodeToHttpStatus("INVALID_BACKEND_RESPONSE"), 502);
});

test("navigation icons remain serializable string values", () => {
  const files = [
    resolve(process.cwd(), "src/config/navigation.central.ts"),
    resolve(process.cwd(), "src/config/navigation.school.ts"),
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const iconValues = [...source.matchAll(/icon:\s*([^,\n}]+)/g)].map((match) => match[1]?.trim() ?? "");
    assert.ok(iconValues.length > 0, `Expected icon definitions in ${file}`);

    for (const iconValue of iconValues) {
      assert.match(iconValue, /^"[A-Za-z0-9_-]+"$/, `Navigation icon must stay a string literal in ${file}: ${iconValue}`);
    }
  }
});