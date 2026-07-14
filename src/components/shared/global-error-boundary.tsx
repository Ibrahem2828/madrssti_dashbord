"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import type { ApiErrorPayload } from "@/services/envelopeHandler";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  requestId: string | null;
  errorCode: string | null;
}

function generateRequestId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function parseApiError(error: Error): { code: string | null; requestId: string | null; parsedMessage: string } {
  try {
    const parsed = JSON.parse(error.message) as ApiErrorPayload;
    if (parsed.error) {
      return {
        code: parsed.error.code ?? null,
        requestId: parsed.error.request_id ?? null,
        parsedMessage: parsed.error.message ?? parsed.message ?? "حدث خطأ غير متوقع",
      };
    }
  } catch {
    if (error.message.includes("ApiError")) {
      const codeMatch = error.message.match(/\[([^\]]+)\]/);
      const reqMatch = error.message.match(/معرف الطلب:\s*([^\s)]+)/);
      return {
        code: codeMatch?.[1] ?? null,
        requestId: reqMatch?.[1] ?? null,
        parsedMessage: error.message.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim(),
      };
    }
  }
  return { code: null, requestId: null, parsedMessage: error.message };
}

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      requestId: null,
      errorCode: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const { code, requestId } = parseApiError(error);
    return {
      hasError: true,
      error,
      requestId,
      errorCode: code,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error("[GlobalErrorBoundary] Unhandled error:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      requestId: null,
      errorCode: null,
    });
  };

  private handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.props.fallback) return this.props.fallback;

    if (this.state.hasError) {
      const errorMessage = this.state.error?.message ?? "حدث خطأ غير متوقع";
      const { parsedMessage } = parseApiError(this.state.error ?? new Error(errorMessage));
      const requestId = this.state.requestId ?? generateRequestId();

      return (
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-surface-muted p-6 dark:bg-surface-dark"
        >
          <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-white p-8 shadow-brand-lg dark:bg-surface-dark">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-status-error/10">
              <svg className="h-8 w-8 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-center text-xl font-bold text-text-primary">عذراً، حدث خطأ غير متوقع</h1>
            <p className="mt-2 text-center text-sm text-text-muted">
              نواجه مشكلة تقنية. فريق الدعم الفني على علم بالمشكلة ويعمل على حلها.
            </p>

            <div className="mt-5 rounded-lg border border-surface-border bg-surface-muted p-4 dark:bg-dark-muted">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1 text-xs text-text-muted">
                  <p><span className="font-medium text-text-primary">تفاصيل الخطأ:</span> {parsedMessage}</p>
                  {this.state.errorCode && (
                    <p><span className="font-medium text-text-primary">رمز الخطأ:</span> {this.state.errorCode}</p>
                  )}
                  <p>
                    <span className="font-medium text-text-primary">معرف الطلب:</span>
                    <span className="font-mono text-brand-gold" dir="ltr"> {requestId}</span>
                  </p>
                  <p className="text-[10px] text-text-muted/60">
                    يُرجى إبلاغ فريق الدعم الفني بمعرف الطلب لتسريع المعالجة
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full rounded-lg bg-brand-navy py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-navy-600"
              >
                محاولة مرة أخرى
              </button>
              <button
                onClick={this.handleReload}
                className="w-full rounded-lg border border-surface-border py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}