import assert from "node:assert/strict";
import test from "node:test";
import {
  forumCategoryDescriptionCopy,
  forumCategoryEntryLabel,
  forumCountLabel,
  forumScoreLabel,
  forumThreadActivityLabel,
  forumThreadKindLabels,
  forumThreadVisibilityLabel,
} from "./forum-copy";

test("forum category description copy normalizes provider-list mojibake", () => {
  assert.equal(
    forumCategoryDescriptionCopy("Discussion of LLM providers \u00e2\u20ac\u201d DeepSeek, OpenAI, Anthropic, and more."),
    "Discussion of LLM providers - DeepSeek, OpenAI, Anthropic, and more."
  );
  assert.equal(
    forumCategoryDescriptionCopy("Discussion of LLM providers \u00c3\u00a2\u00c2\u0080\u00c2\u0094 DeepSeek, OpenAI, Anthropic, and more."),
    "Discussion of LLM providers - DeepSeek, OpenAI, Anthropic, and more."
  );
  assert.equal(forumCategoryDescriptionCopy(null), null);
});

test("forum count labels stay compact and pluralized", () => {
  assert.equal(forumCountLabel(0, "reply", "replies"), "0 replies");
  assert.equal(forumCountLabel(1, "reply", "replies"), "1 reply");
  assert.equal(forumCountLabel(3, "reply", "replies"), "3 replies");
  assert.equal(forumCountLabel(undefined, "vote"), "0 votes");
  assert.equal(forumScoreLabel(-2), "Score -2");
  assert.equal(forumScoreLabel(undefined), "Score 0");
});

test("forum thread status labels avoid raw visibility jargon", () => {
  assert.equal(forumThreadVisibilityLabel("public"), "Public");
  assert.equal(forumThreadVisibilityLabel("community"), "Community-visible");
  assert.equal(forumThreadVisibilityLabel("members"), "Members");
  assert.deepEqual(
    forumThreadKindLabels({ isPinned: true, linkedDocumentId: "doc-1", visibility: "community" }),
    ["Pinned", "Document discussion", "Community-visible"]
  );
  assert.deepEqual(forumThreadKindLabels({ visibility: "public" }), []);
});

test("forum activity and entry labels make route intent explicit", () => {
  assert.equal(
    forumThreadActivityLabel("2026-06-26T08:30:00.000Z"),
    "Latest activity 26 Jun 2026"
  );
  assert.equal(forumThreadActivityLabel(null), "Latest activity recently");
  assert.equal(forumCategoryEntryLabel(), "Open forum");
  assert.equal(
    forumCategoryEntryLabel({ subcommunity: { title: "Replay Salon", subcommunityType: "salon" } }),
    "Open Salon"
  );
});
