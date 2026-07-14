"use client";

import {Moon, Sun} from "lucide-react";
import {useTranslations} from "next-intl";

import {buttonClassName} from "@/components/ui/button";
import {useTheme} from "@/lib/theme/theme-provider";

export function ThemeSwitcher() {
  const {theme, toggleTheme} = useTheme();
  const t = useTranslations("theme");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("toggle")}
      aria-pressed={theme === "dark"}
      className={buttonClassName({variant: "ghost", size: "icon"})}
    >
      {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
    </button>
  );
}
