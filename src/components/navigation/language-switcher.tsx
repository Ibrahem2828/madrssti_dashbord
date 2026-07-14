"use client";

import {Languages} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {useSearchParams} from "next/navigation";

import {buttonClassName} from "@/components/ui/button";
import {usePathname, useRouter} from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("language");
  const nextLocale = locale === "ar" ? "en" : "ar";
  const query = searchParams.toString();

  return (
    <button
      type="button"
      className={buttonClassName({variant: "ghost", size: "icon"})}
      aria-label={t("switchTo", {language: t(nextLocale)})}
      onClick={() => router.replace(`${pathname}${query ? `?${query}` : ""}`, {locale: nextLocale})}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
