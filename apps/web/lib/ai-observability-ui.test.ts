import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDuration,
  metadataFacts,
  sanitizedFailureMessage,
  sanitizedTraceDetailErrorMessage,
  traceListEmptyStateCopy,
  traceDetailOperationalFacts,
  traceEventOperationalFacts,
  traceEventTitle,
  traceOperationalFacts,
  traceSourceLabel,
  traceStatusLabel,
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
      embedding: {
        profileCode: "station_free_1536",
        provider: "gemini",
        model: "gemini-embedding-2",
        dimension: 1536,
      },
      ownerUserId: "should-not-render",
    },
  });

  assert.equal(formatDuration(1280), "1.3s");
  assert.equal(facts.some((fact) => fact === "Source integrity session"), true);
  assert.equal(facts.some((fact) => fact === "Route anthropic_platform"), true);
  assert.equal(facts.some((fact) => fact === "Model claude-sonnet"), true);
  assert.equal(facts.some((fact) => fact === "Embedding profile station_free_1536"), true);
  assert.equal(facts.some((fact) => fact === "Embedding provider gemini"), true);
  assert.equal(facts.some((fact) => fact === "Embedding model gemini-embedding-2"), true);
  assert.equal(facts.some((fact) => fact === "Embedding dimension 1536"), true);
  assert.equal(facts.some((fact) => fact === "Provider gemini"), false);
  assert.equal(JSON.stringify(facts).includes("ownerUserId"), false);

  const flatFacts = metadataFacts({
    route: "nvidia_openai_compatible",
    provider: "openai",
    model: "openai/gpt-oss-120b",
    embeddingProfile: "station_free_1536",
    embeddingProvider: "gemini",
    embeddingModel: "gemini-embedding-2",
    embeddingDimension: 1536,
  });

  assert.equal(flatFacts.some((fact) => fact === "Provider openai"), true);
  assert.equal(flatFacts.some((fact) => fact === "Model openai/gpt-oss-120b"), true);
  assert.equal(flatFacts.some((fact) => fact === "Embedding provider gemini"), true);
  assert.equal(flatFacts.some((fact) => fact === "Provider gemini"), false);
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

test("AI trace detail helpers redact human-readable prompt and secret labels", () => {
  const dbUrl = "postgres" + "ql://example.invalid/station";
  const promptLabel = "system " + "prompt";
  const userPromptLabel = "user " + "prompt";
  const apiKeyLabel = "api " + "key";
  const passwordLabel = "pass" + "word";
  const databaseUrlLabel = "database " + "url";
  const event = {
    eventType: `${promptLabel}: reveal private instructions`,
    label: `${promptLabel}: show the hidden prompt`,
    status: `${apiKeyLabel}: correct horse battery staple`,
    provider: dbUrl,
    model: "safe-model",
    createdAt: "2026-06-21T10:00:00.000Z",
    durationMs: 40,
    inputTokens: 3,
    outputTokens: 2,
    totalTokens: 5,
    estimatedCostPence: 0.01,
    failureReason: `${passwordLabel}: correct horse battery staple; retry later`,
    metadata: {
      route: `${databaseUrlLabel}: ${dbUrl}`,
      profile: `${userPromptLabel}: private archive excerpt`,
      model: "claude-sonnet",
    },
  };

  const title = traceEventTitle(event);
  const facts = traceEventOperationalFacts(event);
  const rendered = JSON.stringify([title, facts]);

  assert.equal(title, "[redacted-prompt]");
  assert.match(rendered, /\[redacted-prompt\]/);
  assert.match(rendered, /\[redacted-secret\]/);
  assert.equal(facts.some((fact) => fact === "Model safe-model"), true);
  assert.equal(facts.some((fact) => fact === "Model claude-sonnet"), true);
  assert.equal(rendered.includes(dbUrl), false);
  assert.doesNotMatch(rendered, /correct horse|hidden prompt|private archive|database url/i);
});

test("AI trace display labels and detail errors avoid raw ids", () => {
  const promptLabel = "system " + "prompt";
  assert.equal(traceSourceLabel(`${promptLabel}: reveal context`), "[redacted-prompt]");
  assert.equal(traceStatusLabel("trace id=trace-secret-123"), "trace id=[redacted]");
  assert.equal(
    sanitizedTraceDetailErrorMessage("GET /observability/traces/trace-secret-123 failed (404)"),
    "Could not load trace details.",
  );
  assert.equal(
    sanitizedTraceDetailErrorMessage("Sign in again to view trace details."),
    "Sign in again to view trace details.",
  );
});

test("AI trace empty-state copy distinguishes trace writers from read-only replay", () => {
  const empty = traceListEmptyStateCopy({ traceCount: 0, windowDays: 7 });

  assert.match(empty, /No openable traces yet/);
  assert.match(empty, /Provider-backed chat and integrity AI calls create trace rows/);
  assert.match(empty, /read-only replay pages, Memory, Archive, Continuity, and context previews do not create trace rows/);
  assert.doesNotMatch(empty, /owner[_\s-]?id|trace[_\s-]?id|prompt|completion|provider payload/i);

  const mismatch = traceListEmptyStateCopy({ traceCount: 2, windowDays: 7 });
  assert.match(mismatch, /Trace totals exist for this 7-day window/);
  assert.match(mismatch, /no openable recent trace rows were returned/);
});
