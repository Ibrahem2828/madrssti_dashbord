import {hasCapability} from "@/config/capabilities";
import type {NavigationGroup, NavigationItem} from "@/config/navigation.types";
import {can, canAll, canAny} from "@/lib/permissions/permission-utils";

export type VisibleNavigationGroup = Omit<NavigationGroup, "items"> & {
  items: readonly NavigationItem[];
};

/**
 * Shared navigation policy for the sidebar, mobile drawer, and command palette.
 * It controls discoverability only; the BFF and backend remain authoritative.
 */
export function filterNavigationForSession(
  navigation: readonly NavigationGroup[],
  permissions: readonly string[],
): readonly VisibleNavigationGroup[] {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isNavigationItemVisible(item, permissions)).sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => a.order - b.order);
}

export function isNavigationItemVisible(item: NavigationItem, permissions: readonly string[]): boolean {
  if (!item.implemented || item.mobileBehavior === "hide") {
    return false;
  }

  if (item.capability && !hasCapability(item.capability)) {
    return false;
  }

  if (item.permission && !can(permissions, item.permission)) {
    return false;
  }

  if (item.permissionsAny && !canAny(permissions, item.permissionsAny)) {
    return false;
  }

  return !item.permissionsAll || canAll(permissions, item.permissionsAll);
}

export function normalizeNavigationPath(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const withoutLocale = path.replace(/^\/(?:ar|en)(?=\/|$)/, "") || "/";
  return withoutLocale.length > 1 ? withoutLocale.replace(/\/+$/, "") : withoutLocale;
}

export function isNavigationItemActive(pathname: string, item: NavigationItem): boolean {
  const normalizedPath = normalizeNavigationPath(pathname);
  const matchers = [item.href, ...(item.routeMatchers ?? [])];
  return matchers.some((matcher) => routeMatches(normalizedPath, matcher, item.exact));
}

export function findActiveNavigationItem(
  pathname: string,
  navigation: readonly VisibleNavigationGroup[],
): NavigationItem | undefined {
  return navigation.flatMap((group) => group.items).find((item) => isNavigationItemActive(pathname, item));
}

function routeMatches(pathname: string, matcher: string, exact = false): boolean {
  const normalizedMatcher = matcher.length > 1 ? matcher.replace(/\/+$/, "") : matcher;
  const pattern = normalizedMatcher.replace(/:[^/]+/g, "[^/]+");
  const expression = exact ? `^${pattern}$` : `^${pattern}(?:/|$)`;
  return new RegExp(expression).test(pathname);
}
