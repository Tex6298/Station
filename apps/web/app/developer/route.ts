import { NextResponse, type NextRequest } from "next/server";
import { developerSpacesRedirectUrl } from "../../lib/developer-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function redirectToDeveloperSpaces(request: NextRequest) {
  const response = NextResponse.redirect(developerSpacesRedirectUrl(request), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export function GET(request: NextRequest) {
  return redirectToDeveloperSpaces(request);
}

export function HEAD(request: NextRequest) {
  return redirectToDeveloperSpaces(request);
}
