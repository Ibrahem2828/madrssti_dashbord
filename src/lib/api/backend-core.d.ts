export const BACKEND_TIMEOUTS: {
  readonly health: 10000;
  readonly authentication: 15000;
  readonly default: 20000;
  readonly mutation: 30000;
  readonly upload: 60000;
  readonly download: 60000;
};

export type BackendErrorCode = "BACKEND_TIMEOUT" | "BACKEND_UNAVAILABLE";
export type BackendFailureKind = "timeout" | "network" | "http" | "invalid_response" | "cancelled";
export type BackendRequestStage = "url_construction" | "request" | "http_response" | "json_parsing" | "response_normalization";

export type BackendFailureDetails = {
  failureKind: BackendFailureKind;
  errorClass: string;
  nestedErrorCode?: string;
  stage: BackendRequestStage;
};

export type BackendFailureDiagnosis = {
  code: BackendErrorCode;
  message: string;
  details: BackendFailureDetails;
};

export function classifyConnectivityStatus(status: number): "ok" | "protected" | "mapping_error" | "backend_error" | "other";
export function mapErrorCodeToHttpStatus(code: string, fallbackStatus?: number): number;
export function diagnoseBackendFailure(
  error: unknown,
  options?: {
    timedOut?: boolean;
    cancelled?: boolean;
    stage?: BackendRequestStage;
  },
): BackendFailureDiagnosis;
export function getErrorClass(error: unknown): string;
export function getNestedErrorCode(error: unknown): string | undefined;