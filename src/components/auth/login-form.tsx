"use client";

import type {FormEvent} from "react";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import type {Portal} from "@/config/routes";
import type {ApiFailure} from "@/lib/api/contracts";
import type {AppLocale} from "@/i18n/routing";

type LoginErrorState = {
  code: string;
  message: string;
  requestId?: string;
  fieldErrors: string[];
};

type CsrfResponsePayload = {
  success?: boolean;
  data?: {
    csrfToken?: string;
  };
  requestId?: string;
};

function readCsrfCookie(): string | null {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith("madrasti_csrf="))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

function isFailurePayload(value: unknown): value is ApiFailure {
  return typeof value === "object"
    && value !== null
    && (value as {success?: unknown}).success === false
    && typeof (value as {error?: {code?: unknown}}).error?.code === "string"
    && typeof (value as {error?: {message?: unknown}}).error?.message === "string";
}

function flattenFieldErrors(fieldErrors?: Record<string, string[]>): string[] {
  if (!fieldErrors) {
    return [];
  }

  return Object.values(fieldErrors)
    .flat()
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function resolveRedirect(nextValue: string | null, locale: AppLocale, portal: Portal): string {
  const fallback = `/${locale}/${portal}`;

  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(nextValue, window.location.origin);

    if (url.origin !== window.location.origin || !url.pathname.startsWith("/") || url.pathname.startsWith("/api/")) {
      return fallback;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function LoginForm({portal}: {portal: Portal}) {
  const t = useTranslations("auth");
  const errors = useTranslations("errors");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const locale = useLocale();
  const routeLocale: AppLocale = locale === "en" ? "en" : "ar";
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<LoginErrorState | null>(null);

  function messageForCode(code?: string): string {
    switch (code) {
      case "VALIDATION_ERROR":
        return t("validationError");
      case "INVALID_CREDENTIALS":
      case "AUTH_FAILED":
        return t("invalidCredentials");
      case "USER_INACTIVE":
      case "INACTIVE_ACCOUNT":
        return t("inactiveAccount");
      case "PERMISSION_DENIED":
      case "CENTRAL_FORBIDDEN_ROUTE":
        return t("permissionDenied");
      case "ORIGIN_MISSING":
        return t("originMissing");
      case "ORIGIN_NOT_ALLOWED":
        return t("originNotAllowed");
      case "CSRF_TOKEN_MISSING":
        return t("csrfMissing");
      case "CSRF_TOKEN_MISMATCH":
        return t("csrfMismatch");
      case "BACKEND_TIMEOUT":
        return t("backendTimeout");
      case "BACKEND_UNAVAILABLE":
      case "BACKEND_SERVER_ERROR":
      case "SERVER_ERROR":
        return t("backendUnavailable");
      case "BACKEND_INVALID_RESPONSE":
      case "INVALID_BACKEND_RESPONSE":
      case "ENDPOINT_MAPPING_ERROR":
        return t("invalidBackendResponse");
      default:
        return t("requestFailed");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier || !password) {
      setError({
        code: "VALIDATION_ERROR",
        message: t("validationError"),
        fieldErrors: [
          ...(!normalizedIdentifier ? [validation("required")] : []),
          ...(!password ? [validation("required")] : []),
        ],
      });
      setPending(false);
      return;
    }

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {credentials: "same-origin"});
      const csrfPayload: CsrfResponsePayload | null = await csrfResponse.json().catch(() => null);
      const csrfToken = typeof csrfPayload?.data?.csrfToken === "string" ? csrfPayload.data.csrfToken : readCsrfCookie();

      if (!csrfResponse.ok || !csrfToken) {
        setError({
          code: "CSRF_TOKEN_MISSING",
          message: messageForCode("CSRF_TOKEN_MISSING"),
          requestId: csrfPayload?.requestId,
          fieldErrors: [],
        });
        return;
      }

      const response = await fetch(`/api/auth/${portal}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "same-origin",
        body: JSON.stringify(portal === "central" ? {identifier: normalizedIdentifier, password} : {email: normalizedIdentifier, password}),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        if (isFailurePayload(payload)) {
          setError({
            code: payload.error.code,
            message: messageForCode(payload.error.code),
            requestId: payload.requestId,
            fieldErrors: flattenFieldErrors(payload.error.fieldErrors),
          });
          return;
        }

        setError({
          code: "INVALID_BACKEND_RESPONSE",
          message: t("invalidBackendResponse"),
          requestId: response.headers.get("X-Request-ID") ?? undefined,
          fieldErrors: [],
        });
        return;
      }

      window.location.assign(resolveRedirect(searchParams.get("next"), routeLocale, portal));
    } catch {
      setError({code: "BACKEND_UNAVAILABLE", message: t("backendUnavailable"), fieldErrors: []});
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
          {portal === "central" ? t("identifier") : t("emailAddress")}
        </label>
        <Input
          id="identifier"
          type={portal === "school" ? "email" : "text"}
          autoComplete={portal === "school" ? "email" : "username"}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          disabled={pending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t("password")}
        </label>
        <div className="flex gap-2">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={pending}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
          <Button
            type="button"
            className="bg-secondary text-secondary-foreground"
            aria-label={show ? t("hidePassword") : t("showPassword")}
            disabled={pending}
            onClick={() => setShow(!show)}
          >
            {show ? t("hidePassword") : t("showPassword")}
          </Button>
        </div>
      </div>
      {error ? (
        <div id="login-error" role="alert" className="space-y-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger-foreground">
          <p className="font-medium text-danger">{error.message}</p>
          <p className="text-danger">{t("errorCode", {code: error.code})}</p>
          {error.fieldErrors.length > 0 ? (
            <ul className="list-disc space-y-1 ps-5 text-danger">
              {error.fieldErrors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {error.requestId ? <p className="text-danger">{errors("requestId", {requestId: error.requestId})}</p> : null}
        </div>
      ) : null}
      <Button type="submit" loading={pending} className="w-full">
        {common("login")}
      </Button>
    </form>
  );
}