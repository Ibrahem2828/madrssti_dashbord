import "server-only";
import {cookies} from "next/headers";
import {env} from "@/config/env.server";
import type {Portal} from "@/config/routes";
export const COOKIE_NAMES = {access: "madrasti_access_token", refresh: "madrasti_refresh_token", portal: "madrasti_portal_scope", activeSchool: "madrasti_active_school", csrf: "madrasti_csrf", theme: "madrasti_theme"} as const;

function secureOptions() {
  return {secure: env.cookieSecure, sameSite: "lax" as const, path: "/"};
}

export function setAuthCookies(tokens: {access: string; refresh: string}, portal: Portal): void {
  const jar = cookies();
  const base = secureOptions();

  jar.set(COOKIE_NAMES.access, tokens.access, {...base, httpOnly: true, maxAge: 60 * 15});
  jar.set(COOKIE_NAMES.refresh, tokens.refresh, {...base, httpOnly: true, maxAge: 60 * 60 * 24 * 14});
  jar.set(COOKIE_NAMES.portal, portal, {...base, httpOnly: true, maxAge: 60 * 60 * 24 * 14});
  // A school context is valid only after the new backend session has been read.
  // Clearing this prevents a previous account's school from being reused.
  jar.set(COOKIE_NAMES.activeSchool, "", {...base, httpOnly: true, maxAge: 0});
}

export function clearAuthCookies(): void {
  const jar = cookies();
  const base = secureOptions();

  Object.values(COOKIE_NAMES).forEach((name) =>
    jar.set(name, "", {...base, httpOnly: name !== COOKIE_NAMES.csrf && name !== COOKIE_NAMES.theme, maxAge: 0}),
  );
}

export function authCookieValues() { const jar = cookies(); return {access: jar.get(COOKIE_NAMES.access)?.value, refresh: jar.get(COOKIE_NAMES.refresh)?.value, portal: jar.get(COOKIE_NAMES.portal)?.value as Portal | undefined, activeSchool: jar.get(COOKIE_NAMES.activeSchool)?.value}; }

export function setActiveSchool(id: string): void {
  cookies().set(COOKIE_NAMES.activeSchool, id, {...secureOptions(), httpOnly: true, maxAge: 60 * 60 * 24 * 14});
}
