import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectEvidenceItem } from "@station/types";
import {
  projectEvidenceCountLabel,
  projectEvidenceDate,
  projectEvidenceEmptyCopy,
  projectEvidenceRoleLabel,
  projectEvidenceRouteLabel,
} from "./project-evidence";

const sample: ProjectEvidenceItem = {
  id: "link-1",
  developerSpace: {
    id: "space-1",
    projectName: "Attached Lab",
    slug: "attached-lab",
  },
  document: {
    id: "doc-1",
    title: "Published proof",
    slug: "published-proof",
    documentType: "research",
    status: "published",
    visibility: "public",
    provenanceType: "user_authored",
    sourceLabel: "Developer Space: Attached Lab",
    publishedAt: "2026-06-20T10:00:00.000Z",
    createdAt: "2026-06-20T09:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  },
  role: "finding",
  linkVisibility: "public",
  sortOrder: 1,
  linkedAt: "2026-06-20T10:01:00.000Z",
  updatedAt: "2026-06-20T10:01:00.000Z",
  routeHref: "/developer-spaces/attached-lab",
  routeLabel: "Open observatory",
};

test("Project evidence helpers keep panel labels compact", () => {
  assert.equal(projectEvidenceCountLabel(0), "No evidence");
  assert.equal(projectEvidenceCountLabel(1), "1 evidence item");
  assert.equal(projectEvidenceCountLabel(12), "12 evidence items");
  assert.equal(projectEvidenceRoleLabel("methodology"), "Methodology");
  assert.equal(projectEvidenceRoleLabel("finding"), "Finding");
  assert.equal(projectEvidenceRoleLabel("field_log"), "Field log");
  assert.equal(projectEvidenceRoleLabel("note"), "Note");
});

test("Project evidence helpers keep route and empty-state copy narrow", () => {
  assert.equal(projectEvidenceDate(sample), "2026-06-20T10:00:00.000Z");
  assert.equal(projectEvidenceRouteLabel(sample), "Open observatory");
  assert.equal(projectEvidenceRouteLabel({ ...sample, routeHref: null, routeLabel: null }), null);

  const emptyCopy = projectEvidenceEmptyCopy();
  assert.match(emptyCopy, /Developer Spaces/);
  assert.doesNotMatch(emptyCopy, /institution|collaboration|export|billing|hosted|provider/i);
});
