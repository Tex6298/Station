import assert from "node:assert/strict";
import test from "node:test";
import { isProtectedRoute } from "./auth-routes";

test("auth route guard protects private app routes and preserves public reads", () => {
  const protectedPaths = [
    "/studio",
    "/studio/personas/persona-1",
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
