import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  describePlatformProviderRoute,
  normalizeOpenAiCompatibleBaseUrl,
  resolveChatProviderRuntimeRoute,
  resolveProvider,
} from "../src/providers/router";

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
  let requestedAuth = "";
  let requestedBody: unknown;

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedAuth = (init?.headers as Record<string, string> | undefined)?.Authorization ?? "";
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
    platformNvidiaKey: " nvidia-key ",
    platformNvidiaBaseUrl: "https://integrate.api.nvidia.com",
    platformNvidiaModel: "nvidia/test-model",
  });

  const response = await provider.sendMessage({
    messages: [{ role: "user", content: "Hello" }],
  });

  assert.equal(requestedUrl, "https://integrate.api.nvidia.com/v1/chat/completions");
  assert.equal(requestedAuth, "Bearer nvidia-key");
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

test("ignores blank NVIDIA aliases and keeps the DeepSeek fallback", async () => {
  const provider = resolveProvider({
    provider: "platform",
    aiMode: "platform",
    platformNvidiaKey: "   ",
  });

  const response = await provider.sendMessage({
    messages: [{ role: "user", content: "Hello" }],
  });

  assert.equal(response.content, "Mock DeepSeek reply: Hello");
  assert.equal(response.model, "deepseek-chat");
});

test("describes platform provider route without exposing config", () => {
  assert.deepEqual(describePlatformProviderRoute({ platformNvidiaKey: " nvidia-key " }), {
    label: "nvidia_openai_compatible",
    nvidiaConfigured: true,
  });
  assert.deepEqual(describePlatformProviderRoute({ platformNvidiaKey: "   " }), {
    label: "deepseek_fallback",
    nvidiaConfigured: false,
  });
});

test("runtime route resolver preserves BYOK precedence over platform routes", () => {
  const route = resolveChatProviderRuntimeRoute({
    provider: "openai",
    aiMode: "byok",
    byokOpenaiKey: "owner-openai-key",
    platformNvidiaKey: "nvidia-key",
    platformDeepseekKey: "deepseek-key",
  });

  assert.equal(route.routeLabel, "byok_openai");
  assert.equal(route.providerFamily, "openai");
  assert.equal(route.providerMode, "byok");
  assert.equal(route.modelLabel, "gpt-4o-mini");
  assert.equal(route.configured, true);
  assert.ok(route.provider);
});

test("runtime route resolver keeps Station Anthropic as bounded platform fallback", () => {
  const route = resolveChatProviderRuntimeRoute({
    provider: "platform",
    aiMode: "platform",
    stationAnthropicKey: "anthropic-key",
    stationAnthropicModel: "claude-haiku-test",
    platformDeepseekKey: "deepseek-key",
  });

  assert.equal(route.routeLabel, "anthropic_platform");
  assert.equal(route.providerFamily, "anthropic");
  assert.equal(route.providerMode, "platform");
  assert.equal(route.modelLabel, "claude-haiku-test");
  assert.equal(route.configured, true);
});

test("runtime route resolver prefers NVIDIA platform chat over DeepSeek", () => {
  const route = resolveChatProviderRuntimeRoute({
    provider: "platform",
    aiMode: "platform",
    platformNvidiaKey: "nvidia-key",
    platformNvidiaModel: "nvidia/test-model",
    stationAnthropicKey: "anthropic-key",
    platformDeepseekKey: "deepseek-key",
  });

  assert.equal(route.routeLabel, "nvidia_openai_compatible");
  assert.equal(route.providerFamily, "openai");
  assert.equal(route.providerMode, "platform");
  assert.equal(route.modelLabel, "nvidia/test-model");
  assert.equal(route.configured, true);
});

test("runtime route resolver reports missing platform config safely", () => {
  const route = resolveChatProviderRuntimeRoute({
    provider: "platform",
    aiMode: "platform",
  });

  assert.equal(route.routeLabel, "deepseek_fallback");
  assert.equal(route.providerFamily, "deepseek");
  assert.equal(route.providerMode, "platform");
  assert.equal(route.modelLabel, "deepseek-chat");
  assert.equal(route.configured, false);
  assert.deepEqual(route.missingConfig, {
    code: "provider_config_missing",
    classification: "provider_config",
    error: "No Station chat provider is configured for this request.",
  });
});
