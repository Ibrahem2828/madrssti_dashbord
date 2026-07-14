"use client";

import {CheckCircle2, Info, TriangleAlert, X, XCircle} from "lucide-react";
import {useTranslations} from "next-intl";
import React, {createContext, useCallback, useContext, useMemo, useState} from "react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const toneMap: Record<ToastType, string> = {
  success: "border-success/20 bg-success/10 text-success",
  error: "border-danger/20 bg-danger/10 text-danger",
  warning: "border-warning/20 bg-warning/10 text-warning",
  info: "border-primary/20 bg-primary/10 text-primary",
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({children}: {children: React.ReactNode}) {
  const t = useTranslations();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, {id, type, title, message}]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[90] flex flex-col gap-2 sm:start-auto sm:w-[22rem]"
        role="region"
        aria-label={t("accessibility.notificationsRegion")}
      >
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];

          return (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className={cn("pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur", toneMap[toast.type])}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{toast.title}</p>
                  {toast.message ? <p className="mt-1 text-sm opacity-90">{toast.message}</p> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-8 h-8 w-8 shrink-0"
                  aria-label={t("common.dismiss")}
                  onClick={() => dismissToast(toast.id)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
