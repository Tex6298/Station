import assert from "node:assert/strict";
import test from "node:test";
import {
  canCreateSubcommunity,
  createSubcommunityPath,
  mySubcommunitiesPath,
  subcommunityBadgeLabel,
  subcommunityCategoryHref,
  subcommunityListPath,
  subcommunityTypeLabel,
  subcommunityVisibilityLabel,
} from "./community-subcommunities";

test("subcommunity helpers keep API paths bounded to PR91 routes", () => {
  assert.equal(subcommunityListPath(), "/forums/subcommunities");
  assert.equal(mySubcommunitiesPath(), "/forums/subcommunities/mine");
  assert.equal(createSubcommunityPath(), "/forums/subcommunities");
  assert.equal(subcommunityCategoryHref({ slug: "developer-lab" }), "/forums/developer-lab");
});

test("subcommunity helpers label serializer fields without owner internals", () => {
  assert.equal(subcommunityTypeLabel("canon"), "Canon");
  assert.equal(subcommunityTypeLabel("developer"), "Developer");
  assert.equal(subcommunityVisibilityLabel("community"), "Community");
  assert.equal(subcommunityBadgeLabel({ type: "developer", visibility: "public", status: "active" }), "Developer / Public / active");
});

test("subcommunity creation UI follows canon-tier gate", () => {
  assert.equal(canCreateSubcommunity(null), false);
  assert.equal(canCreateSubcommunity({ id: "member", tier: "private", isAdmin: false }), false);
  assert.equal(canCreateSubcommunity({ id: "creator", tier: "creator", isAdmin: false }), false);
  assert.equal(canCreateSubcommunity({ id: "canon", tier: "canon", isAdmin: false }), true);
  assert.equal(canCreateSubcommunity({ id: "admin", tier: "visitor", isAdmin: true }), true);
});
