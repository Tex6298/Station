import assert from "node:assert/strict";
import test from "node:test";
import type { PublicSeminarCard } from "@station/types";
import {
  publicSeminarCardHref,
  publicSeminarDateLabel,
  publicSeminarDiscussionHref,
  publicSeminarSourceLabel,
  publicSeminarsEmptyCopy,
  publicSeminarsIntroCopy,
  publicSeminarsStatusCopy,
  publicSeminarsUnavailableCopy,
} from "./live-events-route";

const BANNED_CLAIMS =
  /\b(?:RSVP|ticket|tickets|payment|Stripe|attendance|attend|reminder|calendar|livestream|realtime|live room|recording|transcript|provider|private runtime|WebSocket|SSE)\b/i;

test("public seminars copy stays readback-only", () => {
  for (const copy of [
    publicSeminarsIntroCopy(),
    publicSeminarsEmptyCopy(),
    publicSeminarsUnavailableCopy(),
    publicSeminarsStatusCopy("loading"),
    publicSeminarsStatusCopy("ready"),
    publicSeminarsStatusCopy("empty"),
    publicSeminarsStatusCopy("unavailable"),
  ]) {
    assert.doesNotMatch(copy, BANNED_CLAIMS);
    assert.doesNotMatch(copy, /ownerUserId|storage_path|provider payload|token|cookie|secret/i);
  }
});

test("public seminar card helpers keep route scope public", () => {
  const card: PublicSeminarCard = {
    id: "document:doc-public",
    sourceType: "document",
    label: "Published readback",
    title: "Public Readback Notes",
    description: "Public excerpt.",
    href: "/space/station-house/documents/doc-public",
    discussionHref: "/forums/seminar-room/thread-public",
    featuredAt: "2026-06-29T08:00:00.000Z",
    publishedAt: "2026-06-29T07:00:00.000Z",
    space: {
      title: "Station House",
      href: "/space/station-house",
    },
  };

  assert.equal(publicSeminarCardHref(card), "/space/station-house/documents/doc-public");
  assert.equal(publicSeminarDiscussionHref(card), "/forums/seminar-room/thread-public");
  assert.equal(publicSeminarSourceLabel("document"), "Published readback");
  assert.equal(publicSeminarSourceLabel("thread"), "Public discussion");
  assert.equal(publicSeminarSourceLabel("space"), "Public Space");
  assert.match(publicSeminarDateLabel(card.publishedAt), /2026/);

  assert.equal(publicSeminarCardHref({ ...card, href: "/studio/personas/private" }), null);
  assert.equal(publicSeminarDiscussionHref({ ...card, discussionHref: "/settings/billing" }), null);
  assert.equal(publicSeminarDateLabel("not-a-date"), "Featured");
});
