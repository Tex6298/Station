import assert from "node:assert/strict";
import test from "node:test";
import { consumeChatStream, sendPersonaChatWithStream } from "./chat-stream";

test("chat stream client sends bearer auth in headers and parses status plus completion", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; authorization: string | null }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    calls.push({
      url,
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return new Response(streamFromText([
      `event: chat.status\ndata: ${JSON.stringify({ stage: "checking_quota", message: "Checking token budget." })}\n\n`,
      `event: chat.complete\ndata: ${JSON.stringify({ conversationId: "conversation-1", reply: { id: "reply-1", role: "assistant", content: "Ready.", createdAt: "2026-06-18T12:00:00.000Z" } })}\n\n`,
    ]), {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    });
  }) as typeof fetch;

  const statuses: string[] = [];

  try {
    const result = await sendPersonaChatWithStream({
      personaId: "persona-1",
      conversationId: "conversation-1",
      content: "Hello",
      token: "secret-token",
      onStatus: (status) => statuses.push(status.message),
    });

    assert.equal(result.conversationId, "conversation-1");
    assert.equal(result.reply.content, "Ready.");
    assert.deepEqual(statuses, ["Checking token budget."]);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].authorization, "Bearer secret-token");
    assert.equal(new URL(calls[0].url).searchParams.has("access_token"), false);
    assert.equal(new URL(calls[0].url).searchParams.has("token"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chat stream parser surfaces production-safe chat errors", async () => {
  await assert.rejects(
    () => consumeChatStream(streamFromText([
      `event: chat.error\ndata: ${JSON.stringify({ error: "No Station chat provider is configured for this request.", code: "provider_config_missing", classification: "provider_config" })}\n\n`,
    ])),
    /No Station chat provider is configured/
  );
});

function streamFromText(parts: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}
