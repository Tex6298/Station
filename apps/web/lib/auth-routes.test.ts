import assert from "node:assert/strict";
import test from "node:test";
import { config as middlewareConfig } from "../middleware";
import { developerSpacesRedirectUrl } from "./developer-route";
import { isProtectedRoute } from "./auth-routes";

type DeveloperRedirectRequest = Parameters<typeof developerSpacesRedirectUrl>[0];

function redirectRequest(url: string, headers = new Headers()): DeveloperRedirectRequest {
  const nextUrl = new URL(url) as URL & { clone: () => URL };
  nextUrl.clone = () => new URL(nextUrl.toString());
  return { headers, nextUrl } as unknown as DeveloperRedirectRequest;
}

test("auth route guard protects private app routes and preserves public reads", () => {
  const protectedPaths = [
    "/studio",
    "/studio/personas/persona-1",
    "/projects",
    "/projects/owner-project",
    "/projects/anything-other-than-public",
    "/space",
    "/space/new",
    "/space/my-space/manage",
    "/space/my-space/documents/new",
    "/billing",
    "/settings/social",
    "/developer-spaces/my-project/manage",
    "/forums/general/new",
  ];

  const publicPaths = [
    "/",
    "/discover",
    "/forums",
    "/forums/general",
    "/forums/general/thread-1",
    "/space/my-space",
    "/space/my-space/documents/doc-1",
    "/developer",
    "/developer-spaces",
    "/developer-spaces/my-project",
    "/projects/public",
    "/projects/public/example-project",
    "/projects/public/ariadne-pr240-public-profile-202606241001",
    "/login",
    "/signup",
  ];

  for (const path of protectedPaths) {
    assert.equal(isProtectedRoute(path), true, `${path} should be protected`);
  }

  for (const path of publicPaths) {
    assert.equal(isProtectedRoute(path), false, `${path} should remain public`);
  }
});

test("middleware matchers include each protected route family", () => {
  for (const matcher of [
    "/studio/:path*",
    "/space/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/projects/:path*",
    "/developer-spaces/:path*",
    "/forums/:path*",
  ] as const) {
    assert.equal(middlewareConfig.matcher.includes(matcher), true, `${matcher} should wake middleware`);
  }
});

test("middleware matcher includes the public developer alias redirect", () => {
  assert.equal(isProtectedRoute("/developer"), false);
  assert.equal(middlewareConfig.matcher.includes("/developer"), true);
});

test("developer alias redirect uses forwarded public host before internal host", () => {
  const headers = new Headers({
    "x-forwarded-host": "stationweb-production.up.railway.app",
    "x-forwarded-proto": "https",
  });

  assert.equal(
    developerSpacesRedirectUrl(redirectRequest("https://0.0.0.0:8080/developer", headers)).toString(),
    "https://stationweb-production.up.railway.app/developer-spaces"
  );
});

test("developer alias redirect falls back to configured public app url for internal hosts", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://stationweb-production.up.railway.app";

  try {
    assert.equal(
      developerSpacesRedirectUrl(redirectRequest("https://0.0.0.0:8080/developer")).toString(),
      "https://stationweb-production.up.railway.app/developer-spaces"
    );
  } finally {
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = previous;
    }
  }
});

test("developer alias redirect keeps localhost for local probes", () => {
  assert.equal(
    developerSpacesRedirectUrl(redirectRequest("http://localhost:3140/developer")).toString(),
    "http://localhost:3140/developer-spaces"
  );
});
