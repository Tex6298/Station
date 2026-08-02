import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";
import { institutionActivityPath } from "./institutions";

test("Institution activity uses an encoded private owner route", () => {
  assert.equal(institutionActivityPath("field/lab"), "/institutions/field%2Flab/activity");
  const page = readFileSync(resolve("apps/web/app/institutions/[slug]/activity/page.tsx"), "utf8");
  assert.match(page, /Bounded operational history/);
  assert.match(page, /Load older activity/);
  assert.match(page, /No Institution activity yet/);
  assert.match(page, /data-tone="error"/);
  assert.doesNotMatch(page, /actorUserId|subjectUserId|resourceId|email|avatar/i);
});

test("owner team exposes Activity without advertising it to members", () => {
  const team = readFileSync(resolve("apps/web/app/institutions/[slug]/team/page.tsx"), "utf8");
  assert.match(team, /institutionActivityPath\(team\.institution\.slug\)/);
  assert.match(team, /Institution owner controls/);
  assert.doesNotMatch(team.match(/function MemberInstitutionSummary[\s\S]*?\n\}/)?.[0] ?? "", /Activity/);
});

test("owner workspaces link Activity only inside owner guards", () => {
  const space = readFileSync(resolve("apps/web/app/institutions/[slug]/space/page.tsx"), "utf8");
  const publication = readFileSync(resolve("apps/web/app/institutions/[slug]/publications/[publicationSlug]/page.tsx"), "utf8");
  const community = readFileSync(resolve("apps/web/app/institutions/[slug]/community/page.tsx"), "utf8");
  assert.match(space, /owner\?<Link[^>]+institutionActivityPath/);
  assert.match(publication, /role === "institution_owner"[^?]+\? <Link[^>]+institutionActivityPath/);
  assert.match(community, /owner\?<Link[^>]+institutionActivityPath/);
});
