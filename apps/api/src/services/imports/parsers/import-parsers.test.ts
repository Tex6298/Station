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
      !/do not stringify me/.test(error.message)
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
