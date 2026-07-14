export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly message?: string;
  readonly errors?: Record<string, string[]>;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly field_errors?: Record<string, string[]>;
    readonly details?: Record<string, unknown>;
    readonly request_id?: string;
  };
  readonly request_id?: string;
  readonly pagination?: PaginationMeta;
}

export interface PaginationMeta {
  readonly currentPage: number;
  readonly perPage: number;
  readonly total: number;
  readonly lastPage: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export type UUID = string;
export type ISO8601DateTime = string;
export type ISO8601Date = string;