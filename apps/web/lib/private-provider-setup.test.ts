import assert from "node:assert/strict";
import test from "node:test";
import {
  PRIVATE_PROVIDER_SETUP_HREF,
  PRIVATE_PROVIDER_SETUP_PROVIDERS,
  chatErrorMetadata,
  privateProviderSetupNoticeFromChatError,
} from "./private-provider-setup";

test("missing accepted provider maps to owner-facing setup copy", () => {
  const notice = privateProviderSetupNoticeFromChatError({
    message: "No Station chat provider is configured for this request.",
    code: "provider_config_missing",
    classification: "provider_config",
  });

  assert.ok(notice);
  assert.equal(notice.href, PRIVATE_PROVIDER_SETUP_HREF);
  assert.equal(notice.actionLabel, "Open AI Provider settings");
  assert.deepEqual(notice.supportedProviders, ["OpenAI", "Anthropic", "DeepSeek"]);
  assert.match(`${notice.title} ${notice.body}`, /accepted provider/i);
  assert.match(notice.body, /OpenAI, Anthropic, or DeepSeek/);
});

test("private NVIDIA and Gemini are not offered as private chat fixes", () => {
  const providerPolicyNotice = privateProviderSetupNoticeFromChatError({
    message: "NVIDIA platform chat is not allowed for private Station context.",
    code: "provider_policy_blocked",
    classification: "provider_data_policy",
  });

  assert.ok(providerPolicyNotice);
  assert.deepEqual(PRIVATE_PROVIDER_SETUP_PROVIDERS, ["OpenAI", "Anthropic", "DeepSeek"]);
  assert.doesNotMatch(providerPolicyNotice.supportedProviders.join(" "), /gemini|nvidia/i);
  assert.match(providerPolicyNotice.body, /Gemini stays embeddings-only/i);
  assert.match(providerPolicyNotice.body, /NVIDIA is not available/i);
});

test("provider setup copy does not expose secrets or private runtime payloads", () => {
  const notice = privateProviderSetupNoticeFromChatError({
    message: "No Station chat provider is configured for this request.",
    code: "provider_config_missing",
    classification: "provider_config",
  });

  assert.ok(notice);
  const visibleCopy = [
    notice.title,
    notice.body,
    notice.href,
    notice.actionLabel,
    ...notice.supportedProviders,
  ].join(" ");

  assert.doesNotMatch(visibleCopy, /sk-[a-z0-9_-]+/i);
  assert.doesNotMatch(visibleCopy, /bearer\s+[a-z0-9._-]+/i);
  assert.doesNotMatch(visibleCopy, /ciphertext|authTag|encrypted payload/i);
  assert.doesNotMatch(visibleCopy, /prompt|completion|private source body/i);
});

test("non-provider chat errors remain plain errors", () => {
  const metadata = chatErrorMetadata(new Error("Persona chat provider failed."));

  assert.equal(metadata.message, "Persona chat provider failed.");
  assert.equal(privateProviderSetupNoticeFromChatError(metadata), null);
});
