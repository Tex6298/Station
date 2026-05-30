import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOGIN_REDIRECT_PARAM, STATION_AUTH_COOKIE, isProtectedRoute } from "./lib/auth-routes";

export function middleware(request: NextRequest) {
  if (!isProtectedRoute(request.nextUrl.pathname)) return NextResponse.next();

  const authCookie = request.cookies.get(STATION_AUTH_COOKIE);
  if (!authCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      LOGIN_REDIRECT_PARAM,
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio/:path*",
    "/space/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/developer-spaces/:path*",
    "/forums/:path*",
  ],
};
