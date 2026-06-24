import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/developer-spaces", request.url), 307);
}

export function HEAD(request: NextRequest) {
  return GET(request);
}
