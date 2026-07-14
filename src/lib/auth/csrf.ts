import "server-only";

import {randomBytes} from "crypto";
import {cookies, headers} from "next/headers";

import {env} from "@/config/env.server";

import {COOKIE_NAMES} from "./cookies";
import {validateCsrfTokens} from "./protection-core";
import {validateRequestOrigin, type OriginValidationCode} from "./origin";

export type CsrfValidationCode = OriginValidationCode | "CSRF_TOKEN_MISSING" | "CSRF_TOKEN_MISMATCH";

export type CsrfValidationResult =
  | {
      ok: true;
      allowedOrigin: string;
      requestOrigin: string;
    }
  | {
      ok: false;
      code: CsrfValidationCode;
      message: string;
      allowedOrigin: string | null;
      requestOrigin: string | null;
    };

export function issueCsrfToken(): string {
  const token = randomBytes(32).toString("base64url");

  cookies().set(COOKIE_NAMES.csrf, token, {
    httpOnly: false,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return token;
}

export function validateSameOriginAndCsrf(requireToken = true): CsrfValidationResult {
  const requestHeaders = headers();
  const originResult = validateRequestOrigin(
    requestHeaders.get("origin") ?? requestHeaders.get("referer"),
    env.appUrl,
  );

  if (!originResult.ok) {
    return originResult;
  }

  if (!requireToken) {
    return originResult;
  }

  const sentToken = requestHeaders.get("x-csrf-token");
  const storedToken = cookies().get(COOKIE_NAMES.csrf)?.value ?? null;
  const tokenResult = validateCsrfTokens(
    sentToken,
    storedToken,
    originResult.allowedOrigin,
    originResult.requestOrigin,
  );

  if (!tokenResult.ok) {
    return {
      ...tokenResult,
      ok: false,
    };
  }

  return originResult;
}
