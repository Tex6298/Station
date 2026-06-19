import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDuration,
  metadataFacts,
  sanitizedFailureMessage,
  traceOperationalFacts,
} from "./ai-observability-ui";

test("AI observability helpers expose useful sanitized operation facts", () => {
  const facts = traceOperationalFacts({
    source: "integrity_session",
    status: "completed",
    duration_ms: 1280,
    total_input_tokens: 1200,
    total_output_tokens: 50,
    total_estimated_cost_pence: 0.23,
    metadata: {
      runtimeBudget: {
        provider: { route: "anthropic_platform", model: "claude-sonnet" },
        modelTier: "sonnet",
      },
      profileCode: "station_free_1536",
      ownerUserId: "should-not-render",
    },
  });

  assert.equal(formatDuration(1280), "1.3s");
  assert.equal(facts.some((fact) => fact === "Source integrity session"), true);
  assert.equal(facts.some((fact) => fact === "Route anthropic_platform"), true);
  assert.equal(facts.some((fact) => fact === "Model claude-sonnet"), true);
  assert.equal(JSON.stringify(facts).includes("ownerUserId"), false);
});

test("AI observability metadata whitelist drops raw secrets, urls, and private ids", () => {
  const facts = metadataFacts({
    providerPolicy: "private_archive_allowed",
    providerPosture: "owner_byok",
    traceId: "trace-secret",
    callbackUrl: "https://example.invalid/raw",
    apiKey: "sk-secret",
    model: "sk_live_should_not_render",
  });

  assert.deepEqual(facts, ["Policy private_archive_allowed", "Posture owner_byok"]);
});

test("AI observability failure copy redacts obvious secret material", () => {
  const message = sanitizedFailureMessage(
    "provider failed token=abc123 with Bearer abc.def at https://example.invalid using sk_live_secret",
  );

  assert.match(message ?? "", /\[redacted-url\]/);
  assert.match(message ?? "", /\[redacted-secret\]/);
  assert.doesNotMatch(message ?? "", /abc123/);
  assert.doesNotMatch(message ?? "", /abc\.def/);
  assert.doesNotMatch(message ?? "", /sk_live_secret/);
});
