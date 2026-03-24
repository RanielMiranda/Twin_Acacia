import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (pathname.includes(".") && !pathname.endsWith("/")) {
    return NextResponse.next();
  }

  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase();
  const portalHost =
    (process.env.PORTAL_HOST || "").toLowerCase().trim() ||
    (host.startsWith("portal.") ? host : "");
  const isPortalHost =
    !!portalHost &&
    (host === portalHost ||
      host === "portal.localhost" ||
      host === "portal.127.0.0.1" ||
      host === "portal.0.0.0.0");

  const session = await getSessionFromRequest(request);
  const appAuth = !!session;
  const appRole = String(session?.role || "").toLowerCase();
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner");
  const isEditRoute = pathname.startsWith("/edit");
  const isAuthRoute = pathname.startsWith("/auth");
  const isLoginPage = pathname === "/auth/login";

  if (isPortalHost) {
    if (pathname === "/" || (!isAuthRoute && !isAdminRoute && !isOwnerRoute && !isEditRoute)) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  } else if (isAdminRoute || isOwnerRoute || isEditRoute || isLoginPage) {
    const redirectTarget = portalHost ? `https://${portalHost}/auth/login` : "/auth/login";
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  if (isLoginPage && appAuth && ["admin", "owner"].includes(appRole)) {
    const target = appRole === "admin" ? "/admin/dashboard" : "/owner/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAdminRoute || isOwnerRoute || isEditRoute) {
    if (!appAuth) {
      const redirectTarget = isPortalHost ? "/auth/login" : "/";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    if (!["admin", "owner"].includes(appRole)) {
      const redirectTarget = isPortalHost ? "/auth/login" : "/";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    if (isAdminRoute && appRole === "owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    }
    if (isOwnerRoute && appRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
