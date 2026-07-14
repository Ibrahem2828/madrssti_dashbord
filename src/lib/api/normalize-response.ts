import type {ApiResult} from "./contracts";

type NormalizeOptions = {
  ok: boolean;
  requestId?: string;
  status: number;
};

export function normalizeResponse<T>(value: unknown, options: NormalizeOptions): ApiResult<T> {
  if (isRecord(value) && value.success === true) {
    return {success: true, data: value.data as T};
  }

  if (isRecord(value) && isRecord(value.error)) {
    return {
      success: false,
      error: {
        code: text(value.error.code, `HTTP_${options.status}`),
        message: text(value.error.message, "Request failed"),
        fieldErrors: collectFieldErrors(value.error.field_errors ?? value.error.fields),
      },
      requestId: text(value.request_id, options.requestId),
    };
  }

  if (options.ok) {
    return {success: true, data: value as T};
  }

  if (isRecord(value)) {
    return {
      success: false,
      error: {
        code: text(value.code, `HTTP_${options.status}`),
        message: text(value.detail ?? value.message, "Request failed"),
        fieldErrors: collectFieldErrors(value.field_errors ?? value.fields),
      },
      requestId: options.requestId,
    };
  }

  return {
    success: false,
    error: {code: `HTTP_${options.status}`, message: "Unexpected server response"},
    requestId: options.requestId,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown, fallback?: string): string {
  return typeof value === "string" ? value : fallback ?? "";
}

function collectFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([key, entry]) => [key, normalizeFieldEntry(entry)] as const)
    .filter(([, entry]) => entry.length > 0);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeFieldEntry(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}
