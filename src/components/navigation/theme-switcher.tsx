"use client";

import {Moon, Sun} from "lucide-react";
import {useTranslations} from "next-intl";

import {buttonClassName} from "@/components/ui/button";
import {Tooltip} from "@/components/ui/tooltip";
import {useTheme} from "@/lib/theme/theme-provider";

export function ThemeSwitcher() {
  const {theme, toggleTheme} = useTheme();
  const t = useTranslations("theme");

  const label = theme === "dark" ? t("activateLight") : t("activateDark");
  return (
    <Tooltip content={label}>
      <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "dark"}
      className={buttonClassName({variant: "ghost", size: "icon"})}
    >
      {theme === "dark" ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
    </button>
    </Tooltip>
  );
}
