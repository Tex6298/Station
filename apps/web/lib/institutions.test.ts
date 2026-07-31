import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  institutionInvitationActionPath,
  institutionMemberRevokePath,
  institutionPublicationPath,
  institutionProjectsPath,
  institutionTeamRequestPlan,
  isValidInstitutionUsername,
  normaliseInstitutionUsername,
  suggestInstitutionProjectSlug,
} from "./institutions";

test("institution routes encode slugs and usernames preserve exact case", () => {
  assert.equal(normaliseInstitutionUsername("  Exact_Member  "), "Exact_Member");
  assert.equal(isValidInstitutionUsername("Exact_Member"), true);
  assert.equal(isValidInstitutionUsername("wrong member"), false);
  assert.equal(
    institutionInvitationActionPath("station-labs", "accept"),
    "/institutions/station-labs/invitation/accept"
  );
  assert.equal(institutionMemberRevokePath("station-labs"), "/institutions/station-labs/members/revoke");
  assert.equal(institutionPublicationPath("station-labs"), "/institutions/station-labs/publication");
  assert.equal(institutionProjectsPath("station/labs"), "/institutions/station%2Flabs/projects");
  assert.equal(suggestInstitutionProjectSlug("  Institutional Alpha!  "), "institutional-alpha");
});

test("owner and member team plans make only the bounded team request", () => {
  const ownerPlan = institutionTeamRequestPlan("station-labs", {
    role: "owner",
    readOnly: false,
    canManageTeam: true,
    canManagePublication: true,
  });
  const memberPlan = institutionTeamRequestPlan("station-labs", {
    role: "member",
    readOnly: true,
    canManageTeam: false,
    canManagePublication: false,
  });

  assert.deepEqual(ownerPlan, ["/institutions/station-labs/team"]);
  assert.deepEqual(memberPlan, ["/institutions/station-labs/team"]);
  for (const forbidden of [
    "/projects",
    "/spaces",
    "/developer-spaces",
    "/documents",
    "/exports",
    "/billing",
    "/settings",
  ]) {
    assert.equal(memberPlan.some((path) => path.startsWith(forbidden)), false);
  }
});

test("member team rendering stays separated from owner controls", () => {
  const source = readFileSync(
    resolve("apps/web/app/institutions/[slug]/team/page.tsx"),
    "utf8"
  );
  assert.match(source, /team\.institution\.access\.role === "owner"/);
  assert.match(source, /function OwnerInstitutionControls/);
  assert.match(source, /function MemberInstitutionSummary/);

  const memberBranch = source.match(
    /function MemberInstitutionSummary[\s\S]*?^}\r?$/m
  )?.[0] ?? "";
  for (const forbidden of [
    "Invitation",
    "Revoke",
    "Publication",
    "Project",
    "Space",
    "document",
    "export",
    "billing",
    "provider",
  ]) {
    assert.equal(memberBranch.includes(forbidden), false, `${forbidden} must not appear in member controls`);
  }
});

test("private institution index does not overclaim verification", () => {
  const source = readFileSync(
    resolve("apps/web/app/institutions/page.tsx"),
    "utf8"
  );

  assert.match(source, /Institution identities/);
  assert.doesNotMatch(source, /Verified organisations/);
});

test("Institution Project controls separate owner creation from member read-only access", () => {
  const source = readFileSync(
    resolve("apps/web/app/institutions/[slug]/team/page.tsx"),
    "utf8"
  );
  assert.match(source, /Projects owned by \{team\.institution\.name\}/);
  assert.match(source, /team\.institution\.access\.role === "owner"/);
  assert.match(source, /Institution member access is read-only/);
  assert.match(source, /institutionProjectsPath\(slug\)/);
  assert.match(source, /Institution member \/ read-only/);
});
