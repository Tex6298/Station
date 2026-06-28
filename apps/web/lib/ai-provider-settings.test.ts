import assert from "node:assert/strict";
import test from "node:test";
import {
  AI_PROVIDER_SETUP_PROVIDERS,
  AI_PROVIDER_SETTINGS_COPY,
  buildAiProviderSettingsPatch,
  configuredKeyLabel,
} from "./ai-provider-settings";

test("AI provider settings copy exposes only supported owner BYOK providers", () => {
  assert.deepEqual(
    AI_PROVIDER_SETUP_PROVIDERS.map((provider) => provider.id),
    ["openai", "anthropic", "deepseek"]
  );

  const visibleCopy = [
    AI_PROVIDER_SETTINGS_COPY.summary,
    AI_PROVIDER_SETTINGS_COPY.platform,
    AI_PROVIDER_SETTINGS_COPY.byok,
    AI_PROVIDER_SETTINGS_COPY.gemini,
    AI_PROVIDER_SETTINGS_COPY.nvidia,
    ...AI_PROVIDER_SETUP_PROVIDERS.map((provider) => `${provider.label} ${provider.placeholder}`),
  ].join(" ");

  assert.match(visibleCopy, /Gemini remains embeddings-only/i);
  assert.match(visibleCopy, /Private Studio and replay chat do not use the NVIDIA platform route/i);
  assert.doesNotMatch(AI_PROVIDER_SETUP_PROVIDERS.map((provider) => provider.id).join(" "), /gemini|nvidia/i);
  assert.match(AI_PROVIDER_SETTINGS_COPY.byok, /Raw keys are never shown back/i);
});

test("AI provider settings patch trims keys and only sends requested clears", () => {
  const patch = buildAiProviderSettingsPatch({
    aiMode: "byok",
    keyInputs: {
      openai: "  sk-owner-openai-1234  ",
      anthropic: "   ",
    },
    clearKeys: {
      deepseek: true,
      anthropic: false,
    },
  });

  assert.deepEqual(patch, {
    aiMode: "byok",
    keys: { openai: "sk-owner-openai-1234" },
    clearKeys: { deepseek: true },
  });
});

test("configured key labels never require raw key readback", () => {
  assert.equal(configuredKeyLabel({ configured: false, keyLastFour: null }), "Not configured");
  assert.equal(configuredKeyLabel({ configured: true, keyLastFour: "1234" }), "Configured, ending 1234");
  assert.equal(configuredKeyLabel({ configured: true, keyLastFour: null }), "Configured");
});
