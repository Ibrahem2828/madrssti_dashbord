"use client";

import type {ReactNode} from "react";
import {
  Archive,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardCheck,
  FileSpreadsheet,
  FolderTree,
  HeartPulse,
  Inbox,
  LayoutDashboard,
  Mail,
  PanelLeft,
  PanelLeftClose,
  Reply,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";

import {Button} from "@/components/ui/button";
import {Drawer} from "@/components/ui/drawer";
import {Tooltip} from "@/components/ui/tooltip";
import {PortalBrand} from "@/components/layout/portal-brand";
import {CommandPalette, useCommandItems} from "@/components/navigation/command-palette";
import {LanguageSwitcher} from "@/components/navigation/language-switcher";
import {NotificationLink} from "@/components/navigation/notification-link";
import {SchoolSwitcher} from "@/components/navigation/school-switcher";
import {ThemeSwitcher} from "@/components/navigation/theme-switcher";
import {UserMenu} from "@/components/navigation/user-menu";
import {AccountProfileDialog} from "@/features/account/components/account-profile-dialog";
import {SCHOOL_PERMISSIONS} from "@/config/permissions";
import type {NavigationGroup, NavigationIconName, NavigationItem} from "@/config/navigation.types";
import type {Portal} from "@/config/routes";
import {Link, usePathname, useRouter, type AppLocale} from "@/i18n/routing";
import {
  filterNavigationForSession,
  isNavigationItemActive,
  type VisibleNavigationGroup,
} from "@/lib/navigation/portal-navigation";
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
  incoming: Inbox,
  outgoing: Send,
  reply: Reply,
  collections: FolderTree,
  reports: FileSpreadsheet,
  notifications: Bell,
  settings: Settings,
};

export function PortalShell({portal, navigation, children}: {portal: Portal; navigation: readonly NavigationGroup[]; children: ReactNode}) {
  const t = useTranslations();
  const locale = useLocale();
  const routeLocale: AppLocale = locale === "en" ? "en" : "ar";
  const pathname = usePathname();
  const router = useRouter();
  const {logout, refreshSession, can, session} = usePortalSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const visibleNavigation = useMemo<readonly VisibleNavigationGroup[]>(
    () => filterNavigationForSession(navigation, session.permissions),
    [navigation, session.permissions],
  );

  useEffect(() => {
    const activeGroups = visibleNavigation.filter((group) => group.items.some((item) => isNavigationItemActive(pathname, item)));
    if (activeGroups.length) {
      setExpandedGroups((previous) => ({...previous, ...Object.fromEntries(activeGroups.map((group) => [group.id, true]))}));
    }
  }, [pathname, visibleNavigation]);

  const exit = async () => {
    await logout();
    router.replace("/login", {locale: routeLocale});
  };

  const completePasswordChange = async () => {
    setAccountOpen(false);
    await refreshSession();
    router.replace("/login", {locale: routeLocale});
  };

  const commandItems = useCommandItems({
    navigationItems: visibleNavigation.flatMap((group) => group.items.map(({id, href}) => ({key: id, href}))),
    onLogout: exit,
  });

  const renderItem = (item: NavigationItem, compact: boolean) => {
    const active = isNavigationItemActive(pathname, item);
    const Icon = iconRegistry[item.icon];
    const label = t(item.labelKey);
    const link = (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={compact ? label : undefined}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-sidebar-active text-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-border",
          compact && "justify-center px-0",
        )}
        onClick={() => setMobileOpen(false)}
      >
        <Icon size={19} aria-hidden className="shrink-0" />
        {!compact ? <span className="min-w-0 truncate">{label}</span> : null}
      </Link>
    );

    return compact ? <Tooltip key={item.id} content={t(item.tooltipKey ?? item.labelKey)}>{link}</Tooltip> : <li key={item.id}>{link}</li>;
  };

  const sidebar = (compact: boolean, mobile = false) => (
    <div className="flex h-full flex-col">
      {!mobile ? (
        <div className={cn("flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4", compact && "justify-center px-2")}>
          <PortalBrand portal={portal} title={t(`navigation.${portal}`)} subtitle={t("metadata.title")} collapsed={compact} />
          <Tooltip content={t(compact ? "accessibility.expandSidebar" : "accessibility.collapseSidebar")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-sidebar-foreground hover:bg-sidebar-border"
              aria-label={t(compact ? "accessibility.expandSidebar" : "accessibility.collapseSidebar")}
              onClick={() => setCollapsed((value) => !value)}
            >
              {compact ? <PanelLeft className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
            </Button>
          </Tooltip>
        </div>
      ) : null}
      <nav aria-label={t("accessibility.primaryNavigation")} className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-3">
          {visibleNavigation.map((group) => {
            const groupIsCollapsible = mobile || Boolean(group.collapsible);
            const groupOpen = !groupIsCollapsible || expandedGroups[group.id] !== false || group.items.some((item) => isNavigationItemActive(pathname, item));
            const groupControlId = `sidebar-group-${group.id}`;
            const GroupIcon = iconRegistry[group.icon ?? group.items[0]!.icon];
            const toggleGroup = () => {
              setExpandedGroups((previous) =>
                mobile
                  ? Object.fromEntries(visibleNavigation.map((visibleGroup) => [visibleGroup.id, visibleGroup.id === group.id ? !groupOpen : false]))
                  : {...previous, [group.id]: !groupOpen},
              );
            };

            if (compact && groupIsCollapsible) {
              return (
                <li key={group.id} className="relative">
                  <Tooltip content={t(group.labelKey)}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t(group.labelKey)}
                      aria-expanded={groupOpen}
                      aria-controls={groupControlId}
                      className="w-full text-sidebar-foreground hover:bg-sidebar-border"
                      onClick={toggleGroup}
                    >
                      <GroupIcon className="h-5 w-5" aria-hidden />
                    </Button>
                  </Tooltip>
                  {groupOpen ? (
                    <div id={groupControlId} className="absolute start-full top-0 z-50 ms-3 w-64 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-xl">
                      <p className="px-2 pb-2 pt-1 text-xs font-semibold text-sidebar-foreground/70">{t(group.labelKey)}</p>
                      <ul className="space-y-1">{group.items.map((item) => renderItem(item, false))}</ul>
                    </div>
                  ) : null}
                </li>
              );
            }

            return (
              <li key={group.id}>
                {!compact ? (
                  groupIsCollapsible ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-1 w-full justify-between px-2 text-xs font-semibold text-sidebar-foreground/70 hover:bg-sidebar-border hover:text-sidebar-foreground"
                      aria-expanded={groupOpen}
                      aria-controls={groupControlId}
                      onClick={toggleGroup}
                    >
                      <span>{t(group.labelKey)}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", groupOpen ? "rotate-0" : "-rotate-90")} aria-hidden />
                    </Button>
                  ) : <p className="px-2 pb-1 text-xs font-semibold text-sidebar-foreground/70">{t(group.labelKey)}</p>
                ) : null}
                <ul id={groupControlId} className={cn("space-y-1", groupIsCollapsible && !groupOpen && "hidden")}>{group.items.map((item) => renderItem(item, compact))}</ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  const breadcrumbs = buildBreadcrumbs(pathname, t);
  const mobileBreadcrumbs = breadcrumbs.slice(-2);
  const mobilePageTitle = mobileBreadcrumbs.at(-1)?.label ?? t(`navigation.${portal}`);

  return (
    <div className={cn("min-h-screen lg:grid", collapsed ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[17.5rem_1fr]")}>
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:absolute focus:not-sr-only focus:m-3 print:hidden">
        {t("accessibility.skipToContent")}
      </a>

      <aside className="hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground print:hidden lg:block">{sidebar(collapsed)}</aside>
      <Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={t(`navigation.${portal}`)}
        description={t("accessibility.primaryNavigation")}
        closeLabel={t("accessibility.closeNavigation")}
        side="start"
        widthClassName="w-full max-w-sm"
        header={<PortalBrand portal={portal} title={t(`navigation.${portal}`)} subtitle={t("metadata.title")} onClose={() => setMobileOpen(false)} closeLabel={t("accessibility.closeNavigation")} />}
      >
        {sidebar(false, true)}
      </Drawer>

      <div className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur print:hidden supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Tooltip content={t("accessibility.openNavigation")}>
                  <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label={t("accessibility.openNavigation")} onClick={() => setMobileOpen(true)}>
                    <PanelLeft className="h-4 w-4" aria-hidden />
                  </Button>
                </Tooltip>
                <Button type="button" variant="outline" className="hidden min-w-[15rem] justify-between md:flex" onClick={() => setCommandOpen(true)}>
                  <span className="flex items-center gap-2"><Search className="h-4 w-4" aria-hidden />{t("commandPalette.placeholder")}</span>
                  <span className="text-xs text-muted-foreground">Ctrl K</span>
                </Button>
                <div className="min-w-0 sm:hidden">
                  <p className="truncate text-sm font-semibold">{mobilePageTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {portal === "school" ? <div className="hidden sm:block"><SchoolSwitcher /></div> : null}
                {portal === "school" && can(SCHOOL_PERMISSIONS.notificationsRead) ? <NotificationLink /> : null}
                <div className="hidden sm:flex sm:items-center sm:gap-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                {session.user ? (
                  <UserMenu
                    fullName={session.user.fullName}
                    email={session.user.email}
                    portalLabel={t(`navigation.${portal}`)}
                    schoolName={portal === "school" ? session.activeSchool?.name : undefined}
                    roleLabel={portal === "school" ? t(`schoolAccess.${schoolAccessKey(session.roles)}`) : undefined}
                    contextControls={
                      <div className="space-y-3 sm:hidden">
                        {portal === "school" ? <SchoolSwitcher /> : null}
                        <div className="flex items-center gap-2">
                          <LanguageSwitcher />
                          <ThemeSwitcher />
                        </div>
                      </div>
                    }
                    onManageAccount={() => setAccountOpen(true)}
                    onLogout={exit}
                  />
                ) : null}
              </div>
            </div>
            <nav aria-label={t("accessibility.breadcrumbs")} className="hidden flex-wrap items-center gap-2 text-sm text-muted-foreground sm:flex">
              {breadcrumbs.map((item, index) => <span key={item.href} className="flex items-center gap-2">{index > 0 ? <span aria-hidden="true">/</span> : null}{index === breadcrumbs.length - 1 ? <span className="font-medium text-foreground">{item.label}</span> : <Link href={item.href} className="hover:text-foreground">{item.label}</Link>}</span>)}
            </nav>
            {mobileBreadcrumbs.length > 1 ? (
              <nav aria-label={t("accessibility.breadcrumbs")} className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground sm:hidden">
                <Link href={mobileBreadcrumbs[0]!.href} className="shrink-0 hover:text-foreground">{mobileBreadcrumbs[0]!.label}</Link>
                <span aria-hidden="true">/</span>
                <span className="truncate font-medium text-foreground">{mobileBreadcrumbs[1]!.label}</span>
              </nav>
            ) : null}
          </div>
        </header>
        <main id="main-content" className="px-4 py-6 print:px-0 print:py-0 sm:px-6">{children}</main>
      </div>
      <CommandPalette items={commandItems} open={commandOpen} onOpenChange={setCommandOpen} />
      <AccountProfileDialog open={accountOpen} onOpenChange={setAccountOpen} onPasswordChanged={completePasswordChange} />
    </div>
  );
}

function schoolAccessKey(roles: readonly string[]): "principal" | "administrator" | "staff" {
  const normalizedRoles = roles.map((role) => role.trim().toUpperCase());
  if (normalizedRoles.includes("PRINCIPAL")) return "principal";
  if (normalizedRoles.includes("SCHOOL_IT") || normalizedRoles.includes("SCHOOLIT") || normalizedRoles.includes("ADMINSTAFF")) return "administrator";
  return "staff";
}

function buildBreadcrumbs(pathname: string, t: ReturnType<typeof useTranslations>) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{href: string; label: string}> = [];
  let currentPath = "";
  const labels: Record<string, string> = {
    central: t("navigation.central"), school: t("navigation.school"), dashboard: t("navigation.dashboard"), schools: t("navigation.schools"), health: t("navigation.health"), tickets: t("navigation.tickets"), audit: t("navigation.audit"), policies: t("navigation.policies"), "school-administrators": t("navigation.schoolAdministrators"), users: t("navigation.users"), roles: t("navigation.rolesAndPermissions"), permissions: t("navigation.rolesAndPermissions"), outgoing: t("navigation.outgoing"), incoming: t("navigation.incoming"), internal: t("navigation.internal"), circulars: t("navigation.circulars"), "needs-reply": t("navigation.needsReply"), academic: t("navigation.academic"), attendance: t("navigation.attendance"), correspondence: t("navigation.correspondence"), settings: t("navigation.settings"), reports: t("navigation.reports"), archive: t("navigation.archive"), notifications: t("navigation.notifications"), categories: t("navigation.categories"), parties: t("navigation.parties"), new: t("navigation.newDocument"), edit: t("common.edit"),
  };

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (index === 0) return;
    if (/^[0-9a-f-]{8,}$/i.test(segment)) return;
    breadcrumbs.push({href: currentPath, label: labels[segment] ?? segment});
  });
  return breadcrumbs;
}
