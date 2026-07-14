export type ApiSuccess<T> = {success: true; data: T};
export type ApiFailure = {success: false; error: {code: string; message: string; fieldErrors?: Record<string, string[]>}; requestId?: string};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
