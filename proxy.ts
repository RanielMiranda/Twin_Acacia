import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/session";

const ADMIN_PREFIX = "/admin";
const OWNER_PREFIX = "/owner";
const EDIT_PREFIX = "/edit";
const LOGIN_PATH = "/auth/login";

const isProtectedPath = (pathname: string) =>
  pathname.startsWith(ADMIN_PREFIX) ||
  pathname.startsWith(OWNER_PREFIX) ||
  pathname.startsWith(EDIT_PREFIX);

const parseAccountEditId = (pathname: string) => {
  const match = pathname.match(/^\/edit\/accounts\/(\d+)/);
  return match ? match[1] : null;
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isAuthed = !!session;
  const role = session?.role || "";
  const accountId = session?.accountId ? String(session.accountId) : "";

  if (pathname === LOGIN_PATH && isAuthed) {
    const redirectTo = role === "admin" ? "/admin/dashboard" : "/owner/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (!isProtectedPath(pathname)) return NextResponse.next();

  if (!isAuthed) {
    const nextParam = encodeURIComponent(`${pathname}${search || ""}`);
    return NextResponse.redirect(new URL(`${LOGIN_PATH}?next=${nextParam}`, request.url));
  }

  if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
    return NextResponse.redirect(new URL("/owner/dashboard", request.url));
  }

  if (pathname.startsWith(OWNER_PREFIX) && role !== "owner") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname.startsWith(EDIT_PREFIX) && role !== "admin" && role !== "owner") {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const editingAccountId = parseAccountEditId(pathname);
  if (editingAccountId && role === "owner" && accountId && editingAccountId !== accountId) {
    return NextResponse.redirect(new URL(`/edit/accounts/${accountId}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*", "/edit/:path*", "/auth/login"],
};

