export type OriginValidationCode = "ORIGIN_MISSING" | "ORIGIN_NOT_ALLOWED";
export type CsrfValidationCode = OriginValidationCode | "CSRF_TOKEN_MISSING" | "CSRF_TOKEN_MISMATCH";

export type OriginValidationResult =
  | {
      ok: true;
      allowedOrigin: string;
      requestOrigin: string;
    }
  | {
      ok: false;
      code: OriginValidationCode;
      message: string;
      allowedOrigin: string | null;
      requestOrigin: string | null;
    };

export type CsrfTokenValidationResult =
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

export function validateRequestOriginValue(requestOriginValue: string | null, allowedAppUrl?: string): OriginValidationResult;
export function validateCsrfTokens(
  sentToken: string | null,
  storedToken: string | null,
  allowedOrigin: string,
  requestOrigin: string,
): CsrfTokenValidationResult;
