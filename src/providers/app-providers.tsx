"use client";

import {ToastProvider} from "@/components/shared/toast";
import {ThemeProvider} from "@/lib/theme/theme-provider";

import {AuthProvider} from "./auth-provider";

export function AppProviders({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
