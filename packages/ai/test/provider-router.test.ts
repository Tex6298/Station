import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { normalizeOpenAiCompatibleBaseUrl, resolveProvider } from "../src/providers/router";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("normalizes NVIDIA/OpenAI-compatible base URLs to /v1", () => {
  assert.equal(
    normalizeOpenAiCompatibleBaseUrl("https://integrate.api.nvidia.com"),
    "https://integrate.api.nvidia.com/v1",
  );
  assert.equal(
    normalizeOpenAiCompatibleBaseUrl("https://integrate.api.nvidia.com/v1/"),
    "https://integrate.api.nvidia.com/v1",
  );
  assert.equal(
    normalizeOpenAiCompatibleBaseUrl("https://integrate.api.nvidia.com/v1/chat/completions"),
    "https://integrate.api.nvidia.com/v1",
  );
});

test("uses NVIDIA aliases for platform chat without changing the request shape", async () => {
  let requestedUrl = "";
  let requestedBody: unknown;

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "hello from nvidia" } }],
        model: "nvidia/test-model",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const provider = resolveProvider({
    provider: "platform",
    aiMode: "platform",
    platformNvidiaKey: "nvidia-key",
    platformNvidiaBaseUrl: "https://integrate.api.nvidia.com",
    platformNvidiaModel: "nvidia/test-model",
  });

  const response = await provider.sendMessage({
    messages: [{ role: "user", content: "Hello" }],
  });

  assert.equal(requestedUrl, "https://integrate.api.nvidia.com/v1/chat/completions");
  assert.deepEqual(requestedBody, {
    model: "nvidia/test-model",
    messages: [{ role: "user", content: "Hello" }],
  });
  assert.equal(response.content, "hello from nvidia");
  assert.equal(response.model, "nvidia/test-model");
});

test("keeps the DeepSeek mock fallback when no NVIDIA key is configured", async () => {
  const provider = resolveProvider({
    provider: "platform",
    aiMode: "platform",
  });

  const response = await provider.sendMessage({
    messages: [{ role: "user", content: "Hello" }],
  });

  assert.equal(response.content, "Mock DeepSeek reply: Hello");
  assert.equal(response.model, "deepseek-chat");
});
