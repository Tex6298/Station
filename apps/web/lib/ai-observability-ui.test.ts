import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDuration,
  metadataFacts,
  sanitizedFailureMessage,
  traceDetailOperationalFacts,
  traceEventOperationalFacts,
  traceEventTitle,
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

test("AI trace detail helpers map sanitized trace facts", () => {
  const facts = traceDetailOperationalFacts({
    id: "not-rendered",
    source: "conversation",
    status: "completed",
    startedAt: "2026-06-21T10:00:00.000Z",
    completedAt: "2026-06-21T10:00:01.250Z",
    durationMs: 1250,
    inputTokens: 950,
    outputTokens: 125,
    totalTokens: 1075,
    estimatedCostPence: 0.42,
    failureReason: null,
    metadata: {
      route: "anthropic_platform",
      model: "claude-sonnet",
      ownerUserId: "owner-should-not-render",
      webhookSecret: "whsec_should_not_render",
      callbackUrl: "https://example.invalid/raw",
    },
  });

  assert.equal(facts.some((fact) => fact === "Source conversation"), true);
  assert.equal(facts.some((fact) => fact === "Status completed"), true);
  assert.equal(facts.some((fact) => fact === "Duration 1.3s"), true);
  assert.equal(facts.some((fact) => fact === "Tokens 1K"), true);
  assert.equal(facts.some((fact) => fact === "Route anthropic_platform"), true);
  assert.equal(facts.some((fact) => fact === "Model claude-sonnet"), true);
  assert.doesNotMatch(JSON.stringify(facts), /not-rendered|owner-should-not-render|whsec_|https:\/\//);
});

test("AI trace event helpers expose bounded timeline facts", () => {
  const event = {
    eventType: "llm_call",
    label: "system_prompt=https://example.invalid/raw bearer secret",
    status: "failed",
    provider: "anthropic",
    model: "claude-sonnet",
    createdAt: "2026-06-21T10:00:00.000Z",
    durationMs: 88,
    inputTokens: 10,
    outputTokens: 5,
    totalTokens: 15,
    estimatedCostPence: 0.01,
    failureReason: "trace_id=4c1f0cce-9c67-40ad-b5e8-c2d8612fe3e0 token=abc123",
    metadata: {
      providerPolicy: "private_archive_allowed",
      traceId: "trace-should-not-render",
    },
  };

  const title = traceEventTitle(event);
  const facts = traceEventOperationalFacts(event);
  const rendered = JSON.stringify([title, facts]);

  assert.equal(title, "[redacted-prompt]");
  assert.equal(facts.some((fact) => fact === "Type llm call"), true);
  assert.equal(facts.some((fact) => fact === "Provider anthropic"), true);
  assert.equal(facts.some((fact) => fact === "Model claude-sonnet"), true);
  assert.equal(facts.some((fact) => fact === "Policy private_archive_allowed"), true);
  assert.doesNotMatch(rendered, /https:\/\/|abc123|trace-should-not-render|4c1f0cce|bearer secret/);
});
