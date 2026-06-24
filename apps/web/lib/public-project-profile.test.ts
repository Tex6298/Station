import assert from "node:assert/strict";
import test from "node:test";
import {
  publicProjectDeveloperSpaceCountLabel,
  publicProjectEmptyDeveloperSpacesCopy,
  publicProjectHref,
  publicProjectProfileCopy,
} from "./public-project-profile";

const forbiddenClaims =
  /\b(?:institution|lab|company|collaboration|membership|evidence|export|billing|hosted|runtime|provider|model|queue|Redis|Cloudflare|Discover)\b/i;

test("public Project profile helpers keep copy narrow", () => {
  assert.equal(publicProjectDeveloperSpaceCountLabel(0), "No public Developer Spaces");
  assert.equal(publicProjectDeveloperSpaceCountLabel(1), "1 public Developer Space");
  assert.equal(publicProjectDeveloperSpaceCountLabel(12), "12 public Developer Spaces");

  assert.match(publicProjectProfileCopy(), /public Project metadata/i);
  assert.match(publicProjectProfileCopy(), /already-public Developer Space observatories/i);
  assert.match(publicProjectEmptyDeveloperSpacesCopy(), /No attached public Developer Space observatories/);
  assert.doesNotMatch(publicProjectProfileCopy(), forbiddenClaims);
  assert.doesNotMatch(publicProjectEmptyDeveloperSpacesCopy(), forbiddenClaims);
});

test("public Project href helper rejects unsafe slugs", () => {
  assert.equal(publicProjectHref("public-research-project"), "/projects/public/public-research-project");
  assert.equal(publicProjectHref("Bad Slug"), null);
  assert.equal(publicProjectHref("10000000-0000-4000-8000-000000000100"), null);
  assert.equal(publicProjectHref(null), null);
});
