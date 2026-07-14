"use client";

import type {ReactNode} from "react";
import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  HeartPulse,
  LayoutDashboard,
  Mail,
  PanelLeft,
  PanelLeftClose,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  UserRoundCog,
  X,
  Archive,
  type LucideIcon,
} from "lucide-react";
import {useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Drawer} from "@/components/ui/drawer";
import {CommandPalette, useCommandItems} from "@/components/navigation/command-palette";
import {LanguageSwitcher} from "@/components/navigation/language-switcher";
import {NotificationLink} from "@/components/navigation/notification-link";
import {SchoolSwitcher} from "@/components/navigation/school-switcher";
import {ThemeSwitcher} from "@/components/navigation/theme-switcher";
import {UserMenu} from "@/components/navigation/user-menu";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import type {Portal} from "@/config/routes";
import type {NavigationIconName, NavigationItem} from "@/config/navigation.types";
import {Link, usePathname, useRouter, type AppLocale} from "@/i18n/routing";
import {cn} from "@/lib/utils";
import {usePortalSession} from "@/providers/auth-provider";

const iconRegistry: Record<NavigationIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  schools: Building2,
  health: HeartPulse,
  tickets: Ticket,
  audit: ScrollText,
  policies: ShieldCheck,
  users: Users,
  roles: UserRoundCog,
  academics: BookOpen,
  attendance: ClipboardCheck,
  documents: Mail,
  archive: Archive,
  reports: FileSpreadsheet,
  notifications: Bell,
  settings: Settings,
};

function canAccess(item: NavigationItem, can: (permission: string) => boolean): boolean {
  if (!item.enabled) {
    return false;
  }

  if (item.permission && !can(item.permission)) {
    return false;
  }

  if (item.anyOf && !item.anyOf.some((permission) => can(permission))) {
    return false;
  }

  return true;
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  portal,
  navigation,
  children,
}: {
  portal: Portal;
  navigation: readonly NavigationItem[];
  children: ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const routeLocale: AppLocale = locale === "en" ? "en" : "ar";
  const pathname = usePathname();
  const router = useRouter();
  const {logout, can, session} = usePortalSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const visibleNavigation = useMemo(() => navigation.filter((item) => canAccess(item, can)), [can, navigation]);

  const exit = async () => {
    await logout();
    router.replace("/login", {locale: routeLocale});
  };

  const commandItems = useCommandItems({
    navigationItems: visibleNavigation.map(({key, href}) => ({key, href})),
    onLogout: exit,
  });

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center justify-between border-b border-sidebar-border px-4 py-4", collapsed && "lg:justify-center")}>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t(`navigation.${portal}`)}</p>
            <p className="mt-1 text-xs text-sidebar-foreground/70">{t("metadata.title")}</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-border"
          aria-label={collapsed ? t("accessibility.expandSidebar") : t("accessibility.collapseSidebar")}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
      <nav aria-label={t("accessibility.primaryNavigation")} className="flex-1 space-y-1 p-3">
        {visibleNavigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = iconRegistry[item.icon];

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-border",
                collapsed && "justify-center px-0",
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} aria-hidden className="shrink-0" />
              {!collapsed ? <span className="truncate">{t(`navigation.${item.key}`)}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 lg:hidden">
        <Button type="button" variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-border" onClick={() => setMobileOpen(false)}>
          <X className="h-4 w-4" aria-hidden />
          {t("common.close")}
        </Button>
      </div>
    </div>
  );

  const breadcrumbs = buildBreadcrumbs(pathname, t);
  const userLabel = session.user?.fullName ?? session.user?.email ?? t("common.none");

  return (
    <div className={cn("min-h-screen lg:grid", collapsed ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[17.5rem_1fr]")}>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:m-3 print:hidden"
      >
        {t("accessibility.skipToContent")}
      </a>

      <aside className="hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground print:hidden lg:block">{sidebar}</aside>

      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={t(`navigation.${portal}`)}
        description={t("accessibility.primaryNavigation")}
        closeLabel={t("accessibility.closeNavigation")}
        side="start"
        widthClassName="w-full max-w-sm"
      >
        {sidebar}
      </Drawer>

      <div className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur print:hidden supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label={t("accessibility.openNavigation")} onClick={() => setMobileOpen(true)}>
                  <PanelLeft className="h-4 w-4" aria-hidden />
                </Button>
                <Button type="button" variant="outline" className="hidden min-w-[15rem] justify-between md:flex" onClick={() => setCommandOpen(true)}>
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" aria-hidden />
                    {t("commandPalette.placeholder")}
                  </span>
                  <span className="text-xs text-muted-foreground">Ctrl K</span>
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{userLabel}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{t(`navigation.${portal}`)}</Badge>
                    {portal === "school" && session.activeSchool ? <Badge>{session.activeSchool.name}</Badge> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {portal === "school" ? <SchoolSwitcher /> : null}
                {portal === "school" && can(SCHOOL_PERMISSIONS.notificationsRead) ? <NotificationLink /> : null}
                <LanguageSwitcher />
                <ThemeSwitcher />
                {session.user ? (
                  <UserMenu fullName={session.user.fullName} email={session.user.email} portalLabel={t(`navigation.${portal}`)} onLogout={exit} />
                ) : null}
              </div>
            </div>
            <nav aria-label={t("accessibility.breadcrumbs")} className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <span key={item.href} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">{item.label}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </header>
        <main id="main-content" className="px-4 py-6 print:px-0 print:py-0 sm:px-6">
          {children}
        </main>
      </div>

      <CommandPalette items={commandItems} open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

function buildBreadcrumbs(pathname: string, t: ReturnType<typeof useTranslations>) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{href: string; label: string}> = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (index === 0) {
      breadcrumbs.push({href: currentPath, label: t(`navigation.${segment}`)});
      return;
    }

    if (/^[0-9a-f-]{8,}$/i.test(segment)) {
      return;
    }

    const labelMap: Record<string, string> = {
      schools: t("navigation.schools"),
      health: t("navigation.health"),
      tickets: t("navigation.tickets"),
      audit: t("navigation.audit"),
      policies: t("navigation.policies"),
      users: t("navigation.users"),
      academic: t("navigation.academic"),
      attendance: t("navigation.attendance"),
      correspondence: t("navigation.correspondence"),
      settings: t("navigation.settings"),
      reports: t("navigation.reports"),
      archive: t("navigation.archive"),
      notifications: t("navigation.notifications"),
      categories: t("documents.manageCategories"),
      parties: t("documents.manageParties"),
    };

    breadcrumbs.push({href: currentPath, label: labelMap[segment] ?? segment});
  });

  return breadcrumbs;
}
