import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function redirectToDeveloperSpaces(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/developer-spaces", request.url), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export function GET(request: NextRequest) {
  return redirectToDeveloperSpaces(request);
}

export function HEAD(request: NextRequest) {
  return redirectToDeveloperSpaces(request);
}
