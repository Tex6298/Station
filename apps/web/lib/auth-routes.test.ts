import assert from "node:assert/strict";
import test from "node:test";
import { config as middlewareConfig } from "../middleware";
import { isProtectedRoute } from "./auth-routes";

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
