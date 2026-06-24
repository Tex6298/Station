import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEVELOPER_ALIAS_ROUTE, developerSpacesRedirectUrl } from "./lib/developer-route";
import { LOGIN_REDIRECT_PARAM, STATION_AUTH_COOKIE, isProtectedRoute } from "./lib/auth-routes";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === DEVELOPER_ALIAS_ROUTE) {
    return NextResponse.redirect(developerSpacesRedirectUrl(request), 307);
  }

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
    "/developer",
    "/studio/:path*",
    "/space/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/projects/:path*",
    "/developer-spaces/:path*",
    "/forums/:path*",
  ],
};
