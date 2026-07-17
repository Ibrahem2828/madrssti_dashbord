"use client";

import type {ApiResult} from "./contracts";
import {normalizeResponse} from "./normalize-response";

export async function browserApi<T>(
  portal: "central" | "school",
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  return sameOriginApi<T>(gatewayHref(portal, path), init);
}

export async function sameOriginApi<T>(
  href: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const csrf = document.cookie
    .split("; ")
    .find((item) => item.startsWith("madrasti_csrf="))
    ?.split("=")[1];
  const headers = new Headers(init.headers);

  if (csrf && !["GET", "HEAD"].includes(init.method ?? "GET")) {
    headers.set("X-CSRF-Token", decodeURIComponent(csrf));
  }

  let response: Response;

  try {
    response = await fetch(href, {
      ...init,
      headers,
      credentials: "same-origin",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {success: false, error: {code: "ABORTED", message: "Request aborted"}};
    }

    return {success: false, error: {code: "NETWORK_ERROR", message: "Request failed"}};
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return response.ok
      ? {success: true, data: undefined as T}
      : {success: false, error: {code: `HTTP_${response.status}`, message: "Request failed"}, requestId};
  }

  return normalizeResponse<T>(await response.json(), {
    ok: response.ok,
    requestId,
    status: response.status,
  });
}

export function gatewayHref(portal: "central" | "school", path: string): string {
  return `/api/gateway/${portal}/${path.replace(/^\/+/, "")}`;
}
