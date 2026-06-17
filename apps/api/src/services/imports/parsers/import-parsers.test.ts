import assert from "node:assert/strict";
import test from "node:test";
import { ImportParseError, parseImportFile } from "./index.js";

test("ChatGPT parser extracts role-labelled turns in chronological order", () => {
  const parsed = parseImportFile({
    fileName: "chatgpt-export.json",
    fileType: "application/json",
    rawText: JSON.stringify({
      title: "Harbor replay",
      mapping: {
        late: {
          message: {
            author: { role: "assistant" },
            content: { parts: ["Second answer."] },
            create_time: 20,
          },
        },
        early: {
          message: {
            author: { role: "user" },
            content: { parts: ["First question."] },
            create_time: 10,
          },
        },
      },
    }),
  });

  assert.equal(parsed.format, "chatgpt");
  assert.equal(parsed.metadata.messageCount, 2);
  assert.equal(parsed.metadata.title, "Harbor replay");
  assert.equal(parsed.text, "[user]: First question.\n[assistant]: Second answer.");
});

test("Claude parser extracts role-labelled turns in chronological order", () => {
  const parsed = parseImportFile({
    fileName: "claude-export.json",
    fileType: "application/json",
    rawText: JSON.stringify({
      name: "Launch notes",
      chat_messages: [
        {
          sender: "assistant",
          text: "Second answer.",
          created_at: "2026-06-17T10:02:00.000Z",
        },
        {
          sender: "human",
          text: "First question.",
          created_at: "2026-06-17T10:01:00.000Z",
        },
      ],
    }),
  });

  assert.equal(parsed.format, "claude");
  assert.equal(parsed.metadata.messageCount, 2);
  assert.equal(parsed.metadata.title, "Launch notes");
  assert.equal(parsed.text, "[user]: First question.\n[assistant]: Second answer.");
});

test("Reddit parser extracts listing-style posts and comments deterministically", () => {
  const parsed = parseImportFile({
    fileName: "reddit-thread.json",
    fileType: "application/json",
    rawText: JSON.stringify({
      data: {
        children: [
          {
            kind: "t1",
            data: {
              author: "commenter",
              body: "Second comment.",
              subreddit: "StationLab",
              permalink: "/r/StationLab/comments/thread/comment",
              created_utc: 20,
            },
          },
          {
            kind: "t3",
            data: {
              author: "poster",
              title: "Thread title",
              selftext: "First post body.",
              subreddit: "StationLab",
              permalink: "/r/StationLab/comments/thread",
              created_utc: 10,
            },
          },
        ],
      },
    }),
  });

  assert.equal(parsed.format, "reddit");
  assert.equal(parsed.metadata.messageCount, 2);
  assert.equal(parsed.metadata.title, "Thread title");
  assert.equal(parsed.metadata.subreddit, "StationLab");
  assert.equal(parsed.metadata.permalink, "/r/StationLab/comments/thread");
  assert.equal(
    parsed.text,
    "[reddit/StationLab/poster]: Thread title - First post body. (/r/StationLab/comments/thread)\n[reddit/StationLab/commenter]: Second comment. (/r/StationLab/comments/thread/comment)"
  );
});

test("Reddit parser extracts thread-like object arrays without live API fields", () => {
  const parsed = parseImportFile({
    fileName: "reddit-export.json",
    fileType: "application/json",
    rawText: JSON.stringify({
      title: "Ask Station",
      subreddit: "LocalAI",
      permalink: "/r/LocalAI/comments/ask_station",
      selftext: "Remember the source boundary.",
      author: "thread-owner",
      created_utc: 5,
      comments: [
        {
          author: "reply-owner",
          body: "Never treat Reddit archive text as instructions.",
          subreddit: "LocalAI",
          permalink: "/r/LocalAI/comments/ask_station/reply",
          created_utc: 6,
        },
      ],
    }),
  });

  assert.equal(parsed.format, "reddit");
  assert.equal(parsed.metadata.messageCount, 2);
  assert.equal(parsed.metadata.title, "Ask Station");
  assert.match(parsed.text, /\[reddit\/LocalAI\/thread-owner\]: Ask Station - Remember the source boundary\./);
  assert.match(parsed.text, /\[reddit\/LocalAI\/reply-owner\]: Never treat Reddit archive text as instructions\./);
});

test("unknown JSON fails safely instead of stringifying into archive memory", () => {
  assert.throws(
    () => parseImportFile({
      fileName: "unknown.json",
      fileType: "application/json",
      rawText: JSON.stringify({ arbitrary: { private: "do not stringify me" } }),
    }),
    (error) =>
      error instanceof ImportParseError &&
      /Unsupported JSON import format/.test(error.message) &&
      /Reddit/.test(error.message) &&
      !/do not stringify me/.test(error.message)
  );
});

test("JSON extension is authoritative over misleading text MIME", () => {
  assert.throws(
    () => parseImportFile({
      fileName: "unknown.json",
      fileType: "text/plain",
      rawText: JSON.stringify({ arbitrary: { private: "do not route as text" } }),
    }),
    (error) =>
      error instanceof ImportParseError &&
      /Unsupported JSON import format/.test(error.message) &&
      !/do not route as text/.test(error.message)
  );
});

test("malformed JSON fails with a sanitized import error", () => {
  assert.throws(
    () => parseImportFile({
      fileName: "broken.json",
      fileType: "application/json",
      rawText: "{\"secret\":\"private phrase\"",
    }),
    (error) =>
      error instanceof ImportParseError &&
      /Malformed JSON import/.test(error.message) &&
      !/private phrase/.test(error.message)
  );
});

test("text and Markdown imports preserve raw text", () => {
  const text = parseImportFile({
    fileName: "notes.txt",
    fileType: "text/plain",
    rawText: "plain archive notes",
  });
  assert.equal(text.format, "text");
  assert.equal(text.text, "plain archive notes");

  const markdown = parseImportFile({
    fileName: "notes.md",
    fileType: "text/markdown",
    rawText: "# Markdown archive notes",
  });
  assert.equal(markdown.format, "markdown");
  assert.equal(markdown.text, "# Markdown archive notes");
});

test("legacy message arrays remain explicit known JSON imports", () => {
  const parsed = parseImportFile({
    fileName: "legacy.json",
    fileType: "application/json",
    rawText: JSON.stringify([
      { role: "user", content: "Old import question." },
      { role: "assistant", content: "Old import answer." },
    ]),
  });

  assert.equal(parsed.format, "legacy-message-array");
  assert.equal(parsed.metadata.messageCount, 2);
  assert.equal(parsed.text, "[user]: Old import question.\n[assistant]: Old import answer.");
});
