import type { NextRequest } from "next/server";

export const DEVELOPER_ALIAS_ROUTE = "/developer";
export const DEVELOPER_SPACES_ROUTE = "/developer-spaces";

type RedirectRequest = Pick<NextRequest, "headers" | "nextUrl">;

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first || null;
}

function internalHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized === "0.0.0.0" ||
    normalized.startsWith("0.0.0.0:") ||
    normalized === "[::]" ||
    normalized.startsWith("[::]:")
  );
}

function configuredPublicAppUrl(): URL | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return null;

  try {
    return new URL(configured);
  } catch {
    return null;
  }
}

export function developerSpacesRedirectUrl(request: RedirectRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname = DEVELOPER_SPACES_ROUTE;
  url.search = "";
  url.hash = "";

  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  if (forwardedHost && !internalHost(forwardedHost)) {
    const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";

    try {
      return new URL(DEVELOPER_SPACES_ROUTE, `${protocol}://${forwardedHost}`);
    } catch {
      return url;
    }
  }

  if (internalHost(url.host)) {
    const publicAppUrl = configuredPublicAppUrl();
    if (publicAppUrl) return new URL(DEVELOPER_SPACES_ROUTE, publicAppUrl);
  }

  return url;
}
