import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  isValidProjectUsername,
  loadProjectThenOwnerResources,
  normaliseProjectUsername,
  projectInvitationActionPath,
  projectInvitationPath,
  projectMemberRevokePath,
  projectMembersPath,
  projectViewerMemberAction,
  shouldLoadProjectOwnerResources,
} from "./project-collaboration";

test("Project collaboration accepts only an exact complete Station username", () => {
  assert.equal(normaliseProjectUsername("  Exact_Handle-1  "), "Exact_Handle-1");
  assert.equal(isValidProjectUsername("Exact_Handle-1"), true);
  assert.equal(isValidProjectUsername("exact handle"), false);
  assert.equal(isValidProjectUsername("ab"), false);
  assert.equal(isValidProjectUsername("a".repeat(31)), false);
});

test("Project collaboration paths encode slugs and expose only fixed actions", () => {
  assert.equal(projectInvitationPath("field/lab"), "/projects/field%2Flab/invitations");
  assert.equal(projectMembersPath("field/lab"), "/projects/field%2Flab/members");
  assert.equal(projectMemberRevokePath("field/lab"), "/projects/field%2Flab/members/revoke");
  assert.equal(projectInvitationActionPath("field/lab", "accept"), "/projects/field%2Flab/invitation/accept");
  assert.equal(projectInvitationActionPath("field/lab", "decline"), "/projects/field%2Flab/invitation/decline");
});

test("viewer detail never starts the owner resource request", async () => {
  let ownerRequests = 0;
  const viewer = await loadProjectThenOwnerResources(
    async () => ({ access: { role: "viewer" as const, readOnly: true as const }, project: { name: "Shared" } }),
    async () => {
      ownerRequests += 1;
      return { spaces: ["private-space"] };
    }
  );

  assert.equal(shouldLoadProjectOwnerResources(viewer.detail), false);
  assert.equal(viewer.ownerResources, null);
  assert.equal(ownerRequests, 0);

  const owner = await loadProjectThenOwnerResources(
    async () => ({ access: { role: "owner" as const, readOnly: false as const } }),
    async () => {
      ownerRequests += 1;
      return { spaces: ["owner-space"] };
    }
  );
  assert.deepEqual(owner.ownerResources, { spaces: ["owner-space"] });
  assert.equal(ownerRequests, 1);

  const institutionMember = await loadProjectThenOwnerResources(
    async () => ({ access: { role: "institution_member" as const, readOnly: true as const } }),
    async () => {
      ownerRequests += 1;
      return { spaces: ["must-not-load"] };
    }
  );
  assert.equal(institutionMember.ownerResources, null);
  assert.equal(ownerRequests, 1);
});

test("member actions remain viewer-only and truthful", () => {
  assert.equal(projectViewerMemberAction({ status: "invited" }), "Cancel invitation");
  assert.equal(projectViewerMemberAction({ status: "active" }), "Revoke access");
});

test("Project detail source branches before owner-only controls and keeps collaboration scoped", () => {
  const detailSource = readFileSync(
    fileURLToPath(new URL("../app/projects/[idOrSlug]/page.tsx", import.meta.url)),
    "utf8"
  );
  const listSource = readFileSync(
    fileURLToPath(new URL("../app/projects/page.tsx", import.meta.url)),
    "utf8"
  );

  assert.match(detailSource, /loadProjectThenOwnerResources/);
  assert.match(detailSource, /detail\.access\.role === "viewer"/);
  assert.match(detailSource, /Read-only viewer/);
  assert.match(detailSource, /Institution Project/);
  assert.match(detailSource, /Institution member \/ read-only/);
  assert.match(detailSource, /detail\.access\.role === "institution_owner"/);
  assert.match(detailSource, /actionError=\{actionError\}/);
  assert.match(detailSource, /actionMessage=\{actionMessage\}/);
  assert.match(detailSource, /Project visibility updated\./);
  assert.match(detailSource, /Could not update Project visibility\./);
  assert.match(detailSource, /Collaborators/);
  assert.match(detailSource, /attached Developer Space, and evidence metadata/);
  assert.match(detailSource, /Available owner Developer Spaces could not be determined/);
  assert.match(detailSource, /e instanceof ApiRequestError && e\.status === 404/);
  assert.match(listSource, /Pending invitations/);
  assert.match(listSource, /Pending invitations are unavailable/);
  assert.match(listSource, /invitationLoadError/);
  assert.match(listSource, /Shared with you/);
  assert.match(listSource, /Shared Projects are unavailable/);
  assert.match(listSource, /Owner Projects are unavailable/);
  assert.match(listSource, /!actionCompleted && e instanceof ApiRequestError/);
  assert.doesNotMatch(`${detailSource}\n${listSource}`, /invite by email|seat count/i);
});
