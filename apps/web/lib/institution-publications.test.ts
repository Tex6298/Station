import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { institutionPublicationWorkPath, institutionPublicationsPath, publicInstitutionPublicationPath } from "./institutions";

test("Institution publication paths keep private work and public reads visibly separate", () => {
  assert.equal(institutionPublicationsPath("station labs"), "/institutions/station%20labs/publications");
  assert.equal(institutionPublicationWorkPath("station-labs", "field note"), "/institutions/station-labs/publications/field%20note");
  assert.equal(publicInstitutionPublicationPath("station-labs", "field note"), "/institutions/station-labs/publications/public/field%20note");
});

test("Institution UI keeps member editing, owner transitions, attribution, and public reading explicit", () => {
  const team = readFileSync(resolve("apps/web/app/institutions/[slug]/team/page.tsx"), "utf8");
  const workspace = readFileSync(resolve("apps/web/app/institutions/[slug]/publications/[publicationSlug]/page.tsx"), "utf8");
  const publicPage = readFileSync(resolve("apps/web/app/institutions/[slug]/publications/public/[publicationSlug]/page.tsx"), "utf8");
  assert.match(team, /Create draft/);
  assert.match(team, /created by \{publication\.creatorLabel\} \/ last edited by \{publication\.lastEditorLabel\}/);
  assert.match(workspace, /Save draft/);
  assert.match(workspace, /publication\.access\.canPublish/);
  assert.match(workspace, /publication\.access\.canRetract/);
  assert.match(workspace, /This draft changed\. Reload it before saving your edit\./);
  assert.match(publicPage, /Created by \{data\.publication\.creatorLabel\}/);
  assert.doesNotMatch(publicPage, /getSession|accessToken|audit|member roster/i);
});
