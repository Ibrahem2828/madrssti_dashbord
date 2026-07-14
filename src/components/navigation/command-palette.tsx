"use client";

import {Search} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";

import {Dialog} from "@/components/ui/dialog";
import {SearchInput} from "@/components/ui/search-input";
import {Link, usePathname, useRouter} from "@/i18n/routing";
import {useTheme} from "@/lib/theme/theme-provider";

type CommandItem = {
  key: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: {
  items: readonly CommandItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("commandPalette");
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      size="md"
      closeLabel={t("close")}
    >
      <div className="space-y-4">
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("placeholder")} autoFocus />
        <div className="space-y-2">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) =>
              item.href ? (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex min-h-11 items-center justify-between rounded-xl border px-4 py-3 text-sm hover:bg-muted"
                  onClick={() => onOpenChange(false)}
                >
                  <span>{item.label}</span>
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  key={item.key}
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-sm hover:bg-muted"
                  onClick={() => {
                    item.onSelect?.();
                    onOpenChange(false);
                  }}
                >
                  <span>{item.label}</span>
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
              ),
            )
          ) : (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">{t("empty")}</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export function useCommandItems({
  navigationItems,
  onLogout,
}: {
  navigationItems: ReadonlyArray<{key: string; href: string}>;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const {toggleTheme} = useTheme();

  return useMemo(
    () => [
      ...navigationItems.map((item) => ({
        key: `route:${item.key}`,
        label: t(`navigation.${item.key}`),
        href: item.href,
      })),
      {
        key: "action:theme",
        label: t("commandPalette.toggleTheme"),
        onSelect: () => toggleTheme(),
      },
      {
        key: "action:language",
        label: t("commandPalette.switchLanguage"),
        onSelect: () => {
          const nextLocale = locale === "ar" ? "en" : "ar";
          const query = window.location.search;
          router.replace(`${pathname}${query}`, {locale: nextLocale});
        },
      },
      {
        key: "action:logout",
        label: t("common.logout"),
        onSelect: onLogout,
      },
    ],
    [locale, navigationItems, onLogout, pathname, router, t, toggleTheme],
  );
}
