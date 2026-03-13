import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const appAuth = !!session;
  const appRole = String(session?.role || "").toLowerCase();
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner");
  const isEditRoute = pathname.startsWith("/edit");
  const isLoginPage = pathname === "/auth/login";

  if (isLoginPage && appAuth && ["admin", "owner"].includes(appRole)) {
    const target = appRole === "admin" ? "/admin/dashboard" : "/owner/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAdminRoute || isOwnerRoute || isEditRoute) {
    if (!appAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (!["admin", "owner"].includes(appRole)) {
      return NextResponse.redirect(new URL("/", request.url));
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
  matcher: ["/", "/auth/login", "/admin/:path*", "/owner/:path*", "/edit/:path*"],
};
