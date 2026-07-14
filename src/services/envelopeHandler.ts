import type { ApiResponse, PaginationMeta } from "@/types/api";

export interface ApiErrorPayload {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
    stack?: string;
  };
  pagination?: undefined;
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is { success: true; data: T; message?: string; pagination?: PaginationMeta } {
  return response.success === true;
}

export function isErrorResponse(response: ApiResponse<unknown>): response is ApiErrorPayload {
  return response.success === false;
}

export function unwrapData<T>(response: ApiResponse<T>, fallback: T): T {
  if (isSuccessResponse(response) && response.data !== null) {
    return response.data;
  }
  return fallback;
}

export function unwrapDataOrThrow<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response) && response.data !== null) {
    return response.data;
  }
  const errorMessage = response.message ?? "حدث خطأ غير متوقع";
  const errorCode = (response as ApiErrorPayload).error?.code ?? "UNKNOWN_ERROR";
  const requestId = (response as ApiErrorPayload).error?.request_id ?? null;
  throw new ApiError(errorMessage, errorCode, requestId, (response as ApiErrorPayload).errors);
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly requestId: string | null;
  public readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(message: string, code: string, requestId: string | null, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.requestId = requestId;
    this.fieldErrors = fieldErrors;
  }

  public getFieldError(field: string): string | null {
    if (!this.fieldErrors || !this.fieldErrors[field] || this.fieldErrors[field].length === 0) return null;
    return this.fieldErrors[field]![0] ?? null;
  }

  public toDisplayString(): string {
    let display = this.message;
    if (this.code !== "UNKNOWN_ERROR") display += ` [${this.code}]`;
    if (this.requestId) display += ` (معرف الطلب: ${this.requestId})`;
    return display;
  }
}

export function normalizeErrorResponse(error: unknown): ApiErrorPayload {
  if (error instanceof ApiError) {
    return {
      success: false,
      data: null,
      message: error.message,
      errors: error.fieldErrors,
      error: {
        code: error.code,
        message: error.message,
        request_id: error.requestId ?? undefined,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      data: null,
      message: error.message,
      error: {
        code: "CLIENT_ERROR",
        message: error.message,
      },
    };
  }

  return {
    success: false,
    data: null,
    message: "حدث خطأ غير متوقع",
    error: {
      code: "UNKNOWN_ERROR",
      message: "حدث خطأ غير متوقع",
    },
  };
}

export function extractPagination(data: Record<string, unknown>): PaginationMeta | null {
  if (typeof data.count !== "number") return null;

  const count = data.count as number;
  const next = data.next as string | null;
  const previous = data.previous as string | null;
  const pageSizeMatch = next
    ? next.match(/[?&]page_size=(\d+)/)
    : previous
      ? previous.match(/[?&]page_size=(\d+)/)
      : null;
  const perPage = pageSizeMatch ? parseInt(pageSizeMatch[1]!, 10) : 20;
  const currentPage = next
    ? Math.ceil(count / perPage) - 1
    : 1;
  const lastPage = Math.ceil(count / perPage);

  return {
    currentPage,
    perPage,
    total: count,
    lastPage,
    hasNextPage: next !== null,
    hasPreviousPage: previous !== null,
  };
}