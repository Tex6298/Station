import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { seminarHostReadiness } from "./seminar-host-readiness";
import type { PublishingDocument, PublishingSpace } from "./publishing";

const BANNED_COPY =
  /\b(?:host|propose|schedule|book|reserve|launch|invite|attendee|attendees|RSVP|ticket|tickets|payment|waitlist|reminder|calendar|live room|stream|recording|recorded|transcript|media|provider|queue|worker|Redis|Cloudflare|Stripe)\b/i;

const spaces: PublishingSpace[] = [
  { id: "space-public", slug: "station-house", title: "Station House", is_public: true },
  { id: "space-private", slug: "private-house", title: "Private House", is_public: false },
];

const documents: PublishingDocument[] = [
  {
    id: "doc-ready",
    title: "Public Readback Notes",
    document_type: "essay",
    status: "published",
    visibility: "public",
    space_id: "space-public",
    discussion_thread_id: "thread-public",
    source_label: "source_id=owner-private-id token=abc123",
  },
  {
    id: "doc-ready-no-discussion",
    title: "Second Public Notes",
    document_type: "field_log",
    status: "published",
    visibility: "public",
    space_id: "space-public",
    discussion_thread_id: null,
  },
  { id: "doc-private", title: "Private", document_type: "essay", status: "published", visibility: "private", space_id: "space-public" },
  { id: "doc-community", title: "Community", document_type: "essay", status: "published", visibility: "community", space_id: "space-public" },
  { id: "doc-unlisted", title: "Unlisted", document_type: "essay", status: "published", visibility: "unlisted", space_id: "space-public" },
  { id: "doc-archived", title: "Archived", document_type: "essay", status: "archived", visibility: "public", space_id: "space-public" },
  { id: "doc-draft", title: "Draft", document_type: "essay", status: "draft", visibility: "public", space_id: "space-public" },
  { id: "doc-no-space", title: "No Space", document_type: "essay", status: "published", visibility: "public", space_id: null },
  { id: "doc-private-space", title: "Private Space", document_type: "essay", status: "published", visibility: "public", space_id: "space-private" },
];

test("seminar host readiness only counts public published documents in public Spaces", () => {
  const readback = seminarHostReadiness(documents, spaces);

  assert.equal(readback.label, "Seminar readiness");
  assert.equal(readback.candidates.length, 2);
  assert.deepEqual(readback.candidates.map((candidate) => candidate.documentHref), [
    "/space/station-house/documents/doc-ready",
    "/space/station-house/documents/doc-ready-no-discussion",
  ]);
  assert.deepEqual(readback.candidates.map((candidate) => candidate.spaceHref), [
    "/space/station-house",
    "/space/station-house",
  ]);
  assert.equal(readback.gaps.find((gap) => gap.id === "space")?.value, "1 public Space");
  assert.equal(readback.gaps.find((gap) => gap.id === "document")?.value, "2 ready candidates");
  assert.equal(readback.gaps.find((gap) => gap.id === "discussion")?.value, "1 linked discussion");

  const serialized = JSON.stringify(readback);
  for (const excluded of [
    "doc-private",
    "doc-community",
    "doc-unlisted",
    "doc-archived",
    "doc-draft",
    "doc-no-space",
    "doc-private-space",
    "private-house",
  ]) {
    assert.equal(serialized.includes(excluded), false, `${excluded} should not be counted`);
  }
});

test("seminar host readiness readback is safe and metadata-only", () => {
  const readback = seminarHostReadiness([
    {
      ...documents[0],
      title: "Public token=abc123 ghp_secret123456 123e4567-e89b-12d3-a456-426614174000",
    },
  ], spaces);
  const serialized = JSON.stringify(readback);

  assert.match(serialized, /token=\[redacted\]/);
  assert.match(serialized, /\[redacted-secret\]/);
  assert.match(serialized, /\[redacted-id\]/);
  assert.doesNotMatch(serialized, /abc123|ghp_secret|123e4567|owner-private-id|source_label|source_id|provider payload|storage_path|cookie|authorization|user-agent|stack trace/i);
  assert.doesNotMatch(serialized, BANNED_COPY);
});

test("seminar host readiness reports honest gaps without forbidden claims", () => {
  const readback = seminarHostReadiness([
    { id: "doc-private", title: "Private", document_type: "essay", status: "published", visibility: "private", space_id: "space-public" },
  ], [{ id: "space-private", slug: "private-house", title: "Private House", is_public: false }]);
  const copy = JSON.stringify(readback);

  assert.equal(readback.candidates.length, 0);
  assert.equal(readback.gaps.find((gap) => gap.id === "space")?.tone, "gap");
  assert.equal(readback.gaps.find((gap) => gap.id === "document")?.tone, "gap");
  assert.equal(readback.gaps.find((gap) => gap.id === "discussion")?.tone, "gap");
  assert.match(readback.boundaryCopy, /Readback only/);
  assert.match(readback.interactionCopy, /existing public document discussion paths only/);
  assert.doesNotMatch(copy, BANNED_COPY);
});

test("publishing dashboard wires seminar readiness without new API or public route drift", () => {
  const source = readFileSync("apps/web/components/studio/publishing-dashboard.tsx", "utf8");

  assert.match(source, /seminarHostReadiness/);
  assert.match(source, /<SeminarReadinessPanel readback=\{seminarReadiness\} loading=\{loading\} \/>/);
  assert.match(source, /apiGet<\{ documents: PublishingDocument\[\] \}>\("\/documents"/);
  assert.match(source, /apiGet<\{ spaces: PublishingSpace\[\] \}>\("\/spaces"/);
  assert.doesNotMatch(source, /\/events\/seminars|\/seminars|apiPost<.*seminar|apiPatch<.*seminar|apiGet<.*seminar|RSVP|ticket|payment|Stripe|Cloudflare|Redis|Worker\(|new Queue/i);
});
