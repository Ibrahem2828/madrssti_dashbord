import createIntlMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";

import {routing} from "@/i18n/routing";

const intl = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const locale = pathname.split("/")[1];
  const activeLocale = routing.locales.includes(locale as "ar" | "en") ? locale : routing.defaultLocale;
  const remainder = pathname.replace(new RegExp(`^/${activeLocale}`), "") || "/";
  const portal = request.cookies.get("madrasti_portal_scope")?.value;
  const access = request.cookies.get("madrasti_access_token")?.value;
  const target = new URL(request.url);

  if (remainder.startsWith("/central")) {
    if (!access) {
      target.pathname = `/${activeLocale}/login/central`;
      target.searchParams.set("next", pathname);
      return NextResponse.redirect(target);
    }
    if (portal !== "central") {
      target.pathname = `/${activeLocale}/${portal === "school" ? "school" : "unauthorized"}`;
      return NextResponse.redirect(target);
    }
  }

  if (remainder.startsWith("/school")) {
    if (!access) {
      target.pathname = `/${activeLocale}/login/school`;
      target.searchParams.set("next", pathname);
      return NextResponse.redirect(target);
    }
    if (portal !== "school") {
      target.pathname = `/${activeLocale}/${portal === "central" ? "central" : "unauthorized"}`;
      return NextResponse.redirect(target);
    }
  }

  if (remainder.startsWith("/admin")) {
    if (!access) {
      target.pathname = `/${activeLocale}/login/school`;
      target.searchParams.set("next", pathname);
      return NextResponse.redirect(target);
    }
    if (portal !== "school") {
      target.pathname = `/${activeLocale}/${portal === "central" ? "central" : "unauthorized"}`;
      return NextResponse.redirect(target);
    }
  }

  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
