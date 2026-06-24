import assert from "node:assert/strict";
import test from "node:test";
import { forumCategoryDescriptionCopy } from "./forum-copy";

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
