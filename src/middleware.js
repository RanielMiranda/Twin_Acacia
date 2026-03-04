import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const appAuth = request.cookies.get("app_auth")?.value
  const appRole = request.cookies.get("app_role")?.value
  const isAdminRoute = pathname.startsWith("/admin")
  const isOwnerRoute = pathname.startsWith("/owner")

  if (isAdminRoute || isOwnerRoute) {
    if (!appAuth) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (isAdminRoute && appRole === "owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url))
    }
    if (isOwnerRoute && appRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'],
}
