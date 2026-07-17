import type { ApiResponse } from "@/types/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientConfig {
  /** @deprecated Retained only for type compatibility. Browser token refresh is forbidden; this callback is ignored. */
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: unknown) => ApiErrorPayload | Promise<ApiErrorPayload>;
  onAuthFailure?: () => Promise<string | null>;
}

import type { ApiErrorPayload } from "./envelopeHandler";
import { normalizeErrorResponse, extractPagination } from "./envelopeHandler";

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  idempotent?: boolean;
}

export interface ApiClientInstance {
  get: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  post: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  put: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  delete: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  request: <T>(method: HttpMethod, url: string, body?: unknown, options?: RequestOptions) => Promise<ApiResponse<T>>;
  setBaseUrl: (url: string) => void;
  setHeader: (key: string, value: string) => void;
  removeHeader: (key: string) => void;
  getConfig: () => ApiClientConfig;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  idempotent?: boolean;
}

function generateIdempotencyKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function buildUrl(baseUrl: string, url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (/^https?:\/\//i.test(url)) {
    throw new Error("Absolute browser API URLs are not allowed. Use the same-origin gateway.");
  }

  const fullUrl = `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  if (!params) return fullUrl;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}${qs}` : fullUrl;
}

/** @deprecated Configure legacy calls against a same-origin BFF gateway only. */
const LIVE_API_BASE = "/api/gateway/school";
const ALLOWED_GATEWAY_BASES = ["/api/gateway/school", "/api/gateway/central"] as const;
const FORBIDDEN_BROWSER_HEADERS = new Set(["authorization", "cookie", "x-school-id"]);

function normalizeGatewayBase(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "");

  if (!ALLOWED_GATEWAY_BASES.includes(normalized as (typeof ALLOWED_GATEWAY_BASES)[number])) {
    throw new Error("Legacy API clients may use only a same-origin Madrasti BFF gateway.");
  }

  return normalized;
}

function sanitizeBrowserHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !FORBIDDEN_BROWSER_HEADERS.has(name.toLowerCase())),
  );
}

function csrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("madrasti_csrf="));
  const value = cookie?.slice("madrasti_csrf=".length);
  return value ? decodeURIComponent(value) : null;
}

export function createApiClient(userConfig?: Partial<ApiClientConfig>): ApiClientInstance {
  const config: ApiClientConfig = {
    baseUrl: normalizeGatewayBase(userConfig?.baseUrl ?? LIVE_API_BASE),
    defaultHeaders: sanitizeBrowserHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...userConfig?.defaultHeaders,
    }),
    timeout: userConfig?.timeout ?? 30000,
    retryCount: userConfig?.retryCount ?? 1,
    onRequest: userConfig?.onRequest,
    onResponse: userConfig?.onResponse,
    onError: userConfig?.onError,
    // A legacy caller may still provide this option at compile time, but the
    // browser adapter must never retain or use a token-refresh callback.
    onAuthFailure: undefined,
  };

  const instance: ApiClientInstance = {
    setBaseUrl(url: string) {
      config.baseUrl = normalizeGatewayBase(url);
    },

    setHeader(key: string, value: string) {
      if (FORBIDDEN_BROWSER_HEADERS.has(key.toLowerCase())) {
        throw new Error(`The ${key} header is managed by the server-side BFF.`);
      }

      config.defaultHeaders = {...config.defaultHeaders, [key]: value};
    },

    removeHeader(key: string) {
      if (config.defaultHeaders) {
        const { [key]: _, ...rest } = config.defaultHeaders;
        config.defaultHeaders = rest;
      }
    },

    getConfig() {
      return { ...config };
    },

    async request<T>(method: HttpMethod, url: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
      let requestConfig: RequestConfig = {
        method,
        url: buildUrl(config.baseUrl, url, options?.params),
        headers: sanitizeBrowserHeaders({
          ...config.defaultHeaders,
          ...options?.headers,
        }),
        body,
        signal: options?.signal,
        idempotent: options?.idempotent ?? false,
      };

      if (requestConfig.idempotent && ["POST", "PATCH"].includes(method)) {
        requestConfig.headers["Idempotency-Key"] = generateIdempotencyKey();
      }

      const xRequestId = generateIdempotencyKey().slice(0, 32);
      requestConfig.headers["X-Request-ID"] = xRequestId;

      if (!["GET", "DELETE"].includes(method) && !requestConfig.headers["X-CSRF-Token"]) {
        const csrf = csrfToken();
        if (csrf) {
          requestConfig.headers["X-CSRF-Token"] = csrf;
        }
      }

      if (config.onRequest) {
        requestConfig = await config.onRequest(requestConfig);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      const combinedSignal = requestConfig.signal
        ? combineAbortSignals(requestConfig.signal, controller.signal)
        : controller.signal;

      let attempts = 0;
      // Retained configuration is intentionally ignored: legacy browser calls
      // never replay automatically, especially not state-changing requests.
      const maxAttempts = 1;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const fetchOptions: RequestInit = {
            method: requestConfig.method,
            headers: requestConfig.headers,
            signal: combinedSignal,
            credentials: "same-origin",
          };

          if (requestConfig.body !== undefined && requestConfig.method !== "GET" && requestConfig.method !== "DELETE") {
            if (requestConfig.headers["Content-Type"]?.includes("multipart/form-data")) {
              fetchOptions.body = requestConfig.body as BodyInit;
            } else {
              fetchOptions.body = JSON.stringify(requestConfig.body);
            }
          }

          const response = await fetch(requestConfig.url, fetchOptions);
          clearTimeout(timeoutId);

          let data: ApiResponse<T>;
          const contentType = response.headers.get("content-type") ?? "";

          if (contentType.includes("application/json")) {
            data = await response.json();
          } else if (response.status === 204) {
            data = { success: true, data: null as unknown as T };
          } else {
            const text = await response.text();
            data = {
              success: response.ok,
              data: response.ok ? (text as unknown as T) : null,
              message: response.ok ? undefined : "استجابة غير متوقعة من الخادم",
            };
          }

          if (!response.ok) {
            const errorCode = data.error?.code ?? `HTTP_${response.status}`;
            const errorMessage = data.error?.message ?? data.message ?? `خطأ في الطلب (${response.status})`;
            const errorPayload: ApiErrorPayload = {
              success: false,
              data: null,
              message: errorMessage,
              errors: data.error?.field_errors ?? data.errors,
              error: {
                code: errorCode,
                message: errorMessage,
                request_id: data.request_id ?? data.error?.request_id ?? xRequestId,
              },
            };

            if (config.onError) {
              return await config.onError(errorPayload) as unknown as ApiResponse<T>;
            }
            return errorPayload as unknown as ApiResponse<T>;
          }

          if (data.success && typeof data.data === "object" && data.data !== null && !Array.isArray(data.data)) {
            const pagination = extractPagination(data.data as unknown as Record<string, unknown>);
            if (pagination) {
              (data as unknown as Record<string, unknown>).pagination = pagination;
            }
          }

          if (config.onResponse) {
            data = await config.onResponse(data);
          }

          return data;
        } catch (error: unknown) {
          clearTimeout(timeoutId);

          if (error instanceof DOMException && error.name === "AbortError") {
            return {
              success: false,
              data: null,
              message: "انتهت مهلة الطلب",
              error: { code: "TIMEOUT", message: "انتهت مهلة الطلب", request_id: xRequestId },
            } as unknown as ApiResponse<T>;
          }

          if (attempts >= maxAttempts) {
            const errorPayload = normalizeErrorResponse(error);
            if (config.onError) {
              return await config.onError(errorPayload) as unknown as ApiResponse<T>;
            }
            return errorPayload as unknown as ApiResponse<T>;
          }
        }
      }

      return {
        success: false,
        data: null,
        message: "فشل الطلب بعد المحاولات المتكررة",
      } as unknown as ApiResponse<T>;
    },

    get<T>(url: string, options?: RequestOptions) {
      return instance.request<T>("GET", url, undefined, options);
    },

    post<T>(url: string, body?: unknown, options?: RequestOptions) {
      return instance.request<T>("POST", url, body, options);
    },

    put<T>(url: string, body?: unknown, options?: RequestOptions) {
      return instance.request<T>("PUT", url, body, options);
    },

    patch<T>(url: string, body?: unknown, options?: RequestOptions) {
      return instance.request<T>("PATCH", url, body, options);
    },

    delete<T>(url: string, options?: RequestOptions) {
      return instance.request<T>("DELETE", url, undefined, options);
    },
  };

  return instance;
}

function combineAbortSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal1.addEventListener("abort", onAbort);
  signal2.addEventListener("abort", onAbort);
  if (signal1.aborted || signal2.aborted) controller.abort();
  return controller.signal;
}

export const apiClient = createApiClient();
