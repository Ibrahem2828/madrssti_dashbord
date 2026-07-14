import type {Metadata} from "next";
import {headers} from "next/headers";

import {routing, type AppLocale} from "@/i18n/routing";

import "@/styles/globals.css";

export const metadata: Metadata = {title: {default: "Madrasti", template: "%s | Madrasti"}, description: "Madrasti administration platform"};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const localeHeader = headers().get("X-NEXT-INTL-LOCALE");
  const locale: AppLocale = routing.locales.includes(localeHeader as AppLocale) ? (localeHeader as AppLocale) : routing.defaultLocale;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
