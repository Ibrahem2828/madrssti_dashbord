import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing, type AppLocale} from "@/i18n/routing";
import {AppProviders} from "@/providers/app-providers";
import {ThemeScript} from "@/lib/theme/theme-script";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  if (!routing.locales.includes(locale as AppLocale)) notFound();
  const t = await getTranslations({locale, namespace: "metadata"});
  return {title: t("title"), description: t("description")};
}

export default async function LocaleLayout({children, params: {locale}}: Readonly<{children: React.ReactNode; params: {locale: string}}>) {
  if (!routing.locales.includes(locale as AppLocale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeScript />
      <AppProviders>{children}</AppProviders>
    </NextIntlClientProvider>
  );
}
