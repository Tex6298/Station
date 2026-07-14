import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  forumCategoryDescriptionCopy,
  forumCategoryEntryLabel,
  forumCountLabel,
  forumParticipationActionLabel,
  forumParticipationReadbackLabel,
  forumThreadActivityLabel,
  forumThreadCategoryLabel,
  forumThreadKindLabels,
  forumThreadStatusLabel,
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
});

test("forum participation labels avoid public score and vote framing", () => {
  assert.equal(forumParticipationReadbackLabel(), "Discussion feedback");
  assert.equal(forumParticipationReadbackLabel("comment"), "Comment feedback");
  assert.equal(forumParticipationActionLabel(1), "Useful");
  assert.equal(forumParticipationActionLabel(-1), "Needs work");
  assert.doesNotMatch(
    [
      forumParticipationReadbackLabel(),
      forumParticipationReadbackLabel("comment"),
      forumParticipationActionLabel(1),
      forumParticipationActionLabel(-1),
    ].join(" "),
    /score|vote|rank|leaderboard|badge|clout|reputation profile/i
  );
});

test("forum page sources avoid legacy public score and vote labels", () => {
  const categoryPage = readFileSync("apps/web/app/forums/[categorySlug]/page.tsx", "utf8");
  const threadPage = readFileSync("apps/web/app/forums/[categorySlug]/[threadId]/page.tsx", "utf8");
  const source = `${categoryPage}\n${threadPage}`;

  assert.doesNotMatch(source, /forumScoreLabel|Score \{|Score [0-9-]+|\{c\.score\} votes|>Up<|>Down<|trust \{/);
  assert.match(source, /forumParticipationReadbackLabel/);
  assert.match(source, /forumParticipationActionLabel/);
});

test("forum thread status labels avoid raw visibility jargon", () => {
  assert.equal(forumThreadVisibilityLabel("public"), "Public");
  assert.equal(forumThreadVisibilityLabel("community"), "Community-visible");
  assert.equal(forumThreadVisibilityLabel("members"), "Members");
  assert.equal(forumThreadStatusLabel("active"), "Open discussion");
  assert.equal(forumThreadStatusLabel("locked"), "Locked thread");
  assert.equal(forumThreadCategoryLabel("Replay Salon"), "Category: Replay Salon");
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

test("forum index uses the measured honest three-column composition", () => {
  const page = readFileSync("apps/web/app/forums/page.tsx", "utf8");
  const css = readFileSync("apps/web/app/globals.css", "utf8");

  assert.match(page, /apiGet<\{ categories: Category\[\] \}>\("\/forums\/categories"\)/);
  assert.match(page, /<details className="forum-index-mobile-navigation">/);
  assert.match(page, /href: "\/forums\/subcommunities"/);
  assert.match(page, /href: "\/forums\/witnesses"/);
  assert.match(page, /href: "\/forums\/reports"/);
  assert.match(page, /forumCategoryDescriptionCopy\(category\.description\)/);
  assert.match(page, /forumCategoryEntryLabel\(\{ subcommunity: category\.subcommunity \}\)/);
  assert.match(page, /<h2>Navigate<\/h2>/);
  assert.doesNotMatch(page, /<button|>Feeds<|Popular|Following|Best|Hot|active now|human-led|vote count|sort_order\}/);

  assert.match(css, /\.forum-index-layout\s*\{[\s\S]*?grid-template-columns: 210px 720px 260px;[\s\S]*?gap: 18px;/);
  assert.match(css, /\.forum-index\.container\s*\{[\s\S]*?max-width: 1262px;[\s\S]*?padding: 18px 18px 56px;/);
  assert.match(css, /\.forum-index \.forum-category-card\s*\{[\s\S]*?min-height: 128px;[\s\S]*?border-radius: 9px;/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.forum-index \.forum-category-card\s*\{[\s\S]*?min-height: 172px;/);
});
