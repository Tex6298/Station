import assert from "node:assert/strict";
import test from "node:test";
import {
  SIGNED_MOBILE_TOP_NAV_MENU_ROUTES,
  STUDIO_MOBILE_NAV_SUMMARY_LABEL,
  activeStudioHref,
  studioPersonaHref,
  studioPersonaMeta,
  studioWorkspaceLinks,
} from "./studio-navigation";

test("Studio navigation helpers keep route matching bounded", () => {
  assert.equal(activeStudioHref("/studio", "/studio"), true);
  assert.equal(activeStudioHref("/studio/personas/123", "/studio"), false);
  assert.equal(activeStudioHref("/studio/personas/123/memory", "/studio/personas/123"), true);
  assert.equal(activeStudioHref("/studio/personas-archive", "/studio/personas"), false);
});

test("Studio navigation helpers expose private persona links and labels", () => {
  const persona = { id: "persona-1", visibility: "private" as const };

  assert.equal(studioPersonaHref(persona), "/studio/personas/persona-1");
  assert.equal(studioPersonaMeta(persona), "private - private Studio");
  assert.equal(studioWorkspaceLinks.some((link) => link.href === "/studio/onboarding"), true);
  assert.equal(studioWorkspaceLinks.some((link) => link.href === "/studio/archive"), true);
});

test("Studio mobile navigation exposes an explicit disclosure label", () => {
  assert.equal(STUDIO_MOBILE_NAV_SUMMARY_LABEL, "Toggle Studio mobile navigation");
});

test("signed mobile top nav keeps protected routes reachable through the account menu", () => {
  assert.deepEqual([...SIGNED_MOBILE_TOP_NAV_MENU_ROUTES], ["/studio", "/space", "/developer-spaces"]);
});
