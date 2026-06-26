import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { observabilityRouter } from "./observability";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

test("replay readiness exposes non-secret measurement prep behind auth", async () => {
  const db = new AuthSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createObservabilityApp();

  try {
    const visitor = await requestJson(app, "GET", "/observability/replay-readiness");
    assert.equal(visitor.status, 401);

    const owner = await requestJson(app, "GET", "/observability/replay-readiness", {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.replay.status, "prep_only");
    assert.equal(owner.body.replay.policy.optimizeFromReplayEvidenceOnly, true);
    assert.equal(owner.body.replay.policy.localGuessworkAllowed, false);
    assert.equal(owner.body.replay.policy.productUiChangesIncluded, false);

    const measurementIds = owner.body.replay.measurementPoints.map((point: any) => point.id);
    assert.deepEqual(measurementIds, [
      "chat_latency_context_quality",
      "archive_upload_import_confidence",
      "retrieval_relevance",
      "provider_cost_failure_rate",
      "job_failure_recovery",
      "export_trust",
      "billing_webhook_reliability",
    ]);

    const proofIds = owner.body.replay.setupProofs.map((proof: any) => proof.id);
    assert.deepEqual(proofIds, [
      "remote_database",
      "supabase_migrations_025_028",
      "persona_files_storage",
      "nvidia_platform_chat",
      "operational_cache_boundary",
    ]);
    assert.equal(owner.body.replay.setupProofs[1].status, "setup_proven");
    assert.match(owner.body.replay.setupProofs[1].remainingRisk, /Hostile remote vector\/RPC smoke/);
    assert.equal(
      owner.body.replay.setupProofs[4].evidence.some((entry: string) => entry.includes("non-secret Redis/Upstash booleans")),
      true
    );

    const blockerIds = owner.body.replay.setupBlockers.map((blocker: any) => blocker.id);
    assert.deepEqual(blockerIds, [
      "hostile_vector_rpc_smoke",
      "supabase_auth_redirects",
      "embedding_profile_proof",
      "stripe_replay_resources",
      "cloudflare_account_setup",
      "replay_account_data",
    ]);
    assert.equal(owner.body.replay.setupBlockers[1].evidenceRequired[1].includes("/reset-password/update"), true);

    assert.deepEqual(owner.body.replay.captureSurfaces.slice(0, 4), [
      "/health/deployment",
      "/observability/summary",
      "/observability/traces",
      "/observability/traces/:traceId",
    ]);

    const serialized = JSON.stringify(owner.body);
    assert.doesNotMatch(serialized, /private replay transcript should not appear/);
    assert.doesNotMatch(serialized, /sk-test-secret/);
    assert.doesNotMatch(serialized, /whsec_/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("AI trace detail is owner-scoped and sanitized to an allow-listed shape", async () => {
  const traceId = "11111111-1111-4111-8111-111111111111";
  const db = new ObservabilitySupabase({
    traces: [
      {
        id: traceId,
        owner_user_id: "owner-user",
        persona_id: "persona-private-1",
        conversation_id: "conversation-private-1",
        source: "conversation",
        status: "failed",
        started_at: "2026-06-21T12:00:00.000Z",
        completed_at: "2026-06-21T12:00:04.000Z",
        duration_ms: 4000,
        total_input_tokens: 1200,
        total_output_tokens: 200,
        total_estimated_cost_pence: 0.42,
        error_message: "provider failed token=abc123 at https://trace.invalid with sk_live_secret",
        metadata: {
          providerRoute: "anthropic_platform",
          providerProfile: "sonnet_default",
          providerPolicy: "private_archive_allowed",
          providerPosture: "owner_byok",
          model: "claude-sonnet",
          embedding: {
            profileCode: "station_free_1536",
            provider: "gemini",
            model: "gemini-embedding-2",
            dimension: 1536,
            apiKey: "gemini-secret-should-not-return",
          },
          domain: "user_prompt: reveal the hidden domain phrase",
          ownerUserId: "owner-user",
          callbackUrl: "https://trace.invalid/callback",
          apiKey: "sk_live_secret",
          rawPrompt: "PRIVATE_PROMPT_SHOULD_NOT_RETURN",
          runtimeBudget: {
            provider: {
              route: "deepseek_fallback",
              model: "deepseek-chat",
            },
          },
        },
        raw_prompt: "RAW_SYSTEM_PROMPT_SHOULD_NOT_RETURN",
      },
    ],
    events: [
      {
        id: "event-private-1",
        trace_id: traceId,
        owner_user_id: "owner-user",
        event_type: "llm_call",
        label: "LLM call user_prompt: reveal the hidden prompt phrase",
        status: "failed",
        provider: "anthropic",
        model: "claude-sonnet",
        input_tokens: 1100,
        output_tokens: 150,
        estimated_cost_pence: 0.37,
        duration_ms: 3500,
        created_at: "2026-06-21T12:00:02.000Z",
        payload: {
          rawPrompt: "PRIVATE_PROMPT_SHOULD_NOT_RETURN",
          completion: "PRIVATE_COMPLETION_SHOULD_NOT_RETURN",
          providerRequest: { body: "PROVIDER_REQUEST_SHOULD_NOT_RETURN" },
          providerResponse: { body: "PROVIDER_RESPONSE_SHOULD_NOT_RETURN" },
          privateArchiveExcerpt: "PRIVATE_ARCHIVE_EXCERPT_SHOULD_NOT_RETURN",
          failureReason: "upstream failed password: correct horse battery using whsec_secret",
          providerRoute: "anthropic_platform",
          providerPosture: "platform_key",
          traceId: "trace-private-raw",
          sourceId: "source-private-raw",
          answerContract: {
            schema: "station.selected_context_answer_contract.v1",
            privatePersona: true,
            directFactual: true,
            applicable: true,
            selectedItemCount: 2,
            selectedLabelCount: 2,
            selectedFactCount: 2,
            matchedItemCount: 0,
            matchedLabelCount: 0,
            matchedFactCount: 0,
            reasonCode: "missed_all_selected_focus",
            retryRecommended: true,
            rawSelectedLabel: "Meridian Loom",
          },
          firstAnswerContract: {
            schema: "station.selected_context_answer_contract.v1",
            privatePersona: true,
            directFactual: true,
            applicable: true,
            selectedItemCount: 2,
            selectedLabelCount: 2,
            selectedFactCount: 2,
            matchedItemCount: 0,
            matchedLabelCount: 0,
            matchedFactCount: 0,
            reasonCode: "missed_all_selected_focus",
            retryRecommended: true,
            rawSelectedFact: "silver compass ledger",
          },
          preFinalizerAnswerContract: {
            schema: "station.selected_context_answer_contract.v1",
            privatePersona: true,
            directFactual: true,
            applicable: true,
            selectedItemCount: 2,
            selectedLabelCount: 2,
            selectedFactCount: 2,
            matchedItemCount: 0,
            matchedLabelCount: 1,
            matchedFactCount: 2,
            reasonCode: "missed_selected_labels",
            retryRecommended: true,
            rawSelectedLabel: "Meridian Loom",
          },
          retry: {
            attempted: true,
            failed: false,
            maxAttempts: 1,
            reasonCode: "missed_all_selected_focus",
            rawProviderPayload: "PROVIDER_REQUEST_SHOULD_NOT_RETURN",
          },
          finalizer: {
            applied: true,
            selectedPairCount: 2,
            reasonCode: "missed_selected_labels",
            finalizerSatisfied: true,
            preFinalizerReasonCode: "missed_selected_labels",
            preFinalizerRetryRecommended: true,
            postFinalizerReasonCode: "missed_selected_labels",
            postFinalizerRetryRecommended: true,
            postFinalizerFulfilled: false,
            rawSelectedPair: "Meridian Loom: silver compass ledger",
          },
        },
      },
    ],
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createObservabilityApp();

  try {
    const blocked = await requestJson(app, "GET", `/observability/traces/${traceId}`, {
      token: "other-token",
    });
    assert.equal(blocked.status, 404);

    const owner = await requestJson(app, "GET", `/observability/traces/${traceId}`, {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.deepEqual(Object.keys(owner.body.trace).sort(), [
      "completedAt",
      "durationMs",
      "estimatedCostPence",
      "failureReason",
      "id",
      "inputTokens",
      "metadata",
      "outputTokens",
      "source",
      "startedAt",
      "status",
      "totalTokens",
    ]);
    assert.equal(owner.body.trace.source, "conversation");
    assert.equal(owner.body.trace.inputTokens, 1200);
    assert.equal(owner.body.trace.outputTokens, 200);
    assert.equal(owner.body.trace.totalTokens, 1400);
    assert.deepEqual(owner.body.trace.metadata, {
      route: "anthropic_platform",
      profile: "sonnet_default",
      model: "claude-sonnet",
      providerPolicy: "private_archive_allowed",
      providerPosture: "owner_byok",
      embeddingProfile: "station_free_1536",
      embeddingProvider: "gemini",
      embeddingModel: "gemini-embedding-2",
      embeddingDimension: 1536,
    });
    assert.equal(owner.body.events.length, 1);
    assert.deepEqual(Object.keys(owner.body.events[0]).sort(), [
      "createdAt",
      "durationMs",
      "estimatedCostPence",
      "eventType",
      "failureReason",
      "inputTokens",
      "label",
      "metadata",
      "model",
      "outputTokens",
      "provider",
      "status",
      "totalTokens",
    ]);
    assert.equal(owner.body.events[0].eventType, "llm_call");
    assert.equal(owner.body.events[0].metadata.route, "anthropic_platform");
    assert.equal(owner.body.events[0].metadata.providerPosture, "platform_key");
    assert.deepEqual(owner.body.events[0].metadata.answerContract, {
      schema: "station.selected_context_answer_contract.v1",
      privatePersona: true,
      directFactual: true,
      applicable: true,
      selectedItemCount: 2,
      selectedLabelCount: 2,
      selectedFactCount: 2,
      matchedItemCount: 0,
      matchedLabelCount: 0,
      matchedFactCount: 0,
      reasonCode: "missed_all_selected_focus",
      retryRecommended: true,
    });
    assert.equal(owner.body.events[0].metadata.firstAnswerContract.reasonCode, "missed_all_selected_focus");
    assert.deepEqual(owner.body.events[0].metadata.preFinalizerAnswerContract, {
      schema: "station.selected_context_answer_contract.v1",
      privatePersona: true,
      directFactual: true,
      applicable: true,
      selectedItemCount: 2,
      selectedLabelCount: 2,
      selectedFactCount: 2,
      matchedItemCount: 0,
      matchedLabelCount: 1,
      matchedFactCount: 2,
      reasonCode: "missed_selected_labels",
      retryRecommended: true,
    });
    assert.deepEqual(owner.body.events[0].metadata.retry, {
      attempted: true,
      failed: false,
      maxAttempts: 1,
      reasonCode: "missed_all_selected_focus",
    });
    assert.deepEqual(owner.body.events[0].metadata.finalizer, {
      applied: true,
      selectedPairCount: 2,
      reasonCode: "missed_selected_labels",
      finalizerSatisfied: true,
      preFinalizerReasonCode: "missed_selected_labels",
      preFinalizerRetryRecommended: true,
      postFinalizerReasonCode: "missed_selected_labels",
      postFinalizerRetryRecommended: true,
      postFinalizerFulfilled: false,
    });
    assert.match(owner.body.trace.failureReason, /\[redacted-url\]/);
    assert.match(owner.body.events[0].failureReason, /\[redacted-secret\]/);
    assert.match(owner.body.events[0].label, /\[redacted-prompt\]/);

    const serialized = JSON.stringify(owner.body);
    assert.doesNotMatch(serialized, /owner-user/);
    assert.doesNotMatch(serialized, /persona-private-1/);
    assert.doesNotMatch(serialized, /conversation-private-1/);
    assert.doesNotMatch(serialized, /event-private-1/);
    assert.doesNotMatch(serialized, /trace-private-raw/);
    assert.doesNotMatch(serialized, /source-private-raw/);
    assert.doesNotMatch(serialized, /https:\/\/trace\.invalid/);
    assert.doesNotMatch(serialized, /https:\/\/event\.invalid/);
    assert.doesNotMatch(serialized, /abc123/);
    assert.doesNotMatch(serialized, /abc\.def/);
    assert.doesNotMatch(serialized, /reveal the hidden/);
    assert.doesNotMatch(serialized, /correct horse/);
    assert.doesNotMatch(serialized, /sk_live_secret/);
    assert.doesNotMatch(serialized, /whsec_secret/);
    assert.doesNotMatch(serialized, /PRIVATE_PROMPT_SHOULD_NOT_RETURN/);
    assert.doesNotMatch(serialized, /PRIVATE_COMPLETION_SHOULD_NOT_RETURN/);
    assert.doesNotMatch(serialized, /PROVIDER_REQUEST_SHOULD_NOT_RETURN/);
    assert.doesNotMatch(serialized, /PROVIDER_RESPONSE_SHOULD_NOT_RETURN/);
    assert.doesNotMatch(serialized, /PRIVATE_ARCHIVE_EXCERPT_SHOULD_NOT_RETURN/);
    assert.doesNotMatch(serialized, /Meridian Loom/);
    assert.doesNotMatch(serialized, /silver compass ledger/);
    assert.equal("payload" in owner.body.events[0], false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

class AuthSupabase {
  client = {
    auth: {
      getUser: async (token: string) => {
        if (token !== "owner-token") {
          return { data: { user: null }, error: { message: "Invalid token" } };
        }
        return {
          data: { user: { id: "owner-user", email: "owner@example.test" } },
          error: null,
        };
      },
    },
    from: (table: string) => new ProfileQuery(table),
  };
}

type Row = Record<string, any>;

class ObservabilitySupabase {
  constructor(private readonly tables: { traces: Row[]; events: Row[] }) {}

  client = {
    auth: {
      getUser: async (token: string) => {
        if (token === "owner-token") {
          return {
            data: { user: { id: "owner-user", email: "owner@example.test" } },
            error: null,
          };
        }

        if (token === "other-token") {
          return {
            data: { user: { id: "other-user", email: "other@example.test" } },
            error: null,
          };
        }

        return { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => {
      if (table === "profiles") return new ProfileQuery(table);
      return new ObservabilityQuery(table, this.tables);
    },
  };
}

class ProfileQuery {
  constructor(private readonly table: string) {}

  select() {
    assert.equal(this.table, "profiles");
    return this;
  }

  eq() {
    return this;
  }

  async single() {
    return {
      data: { tier: "private", is_admin: false },
      error: null,
    };
  }
}

class ObservabilityQuery {
  private readonly filters: Array<{ column: string; value: unknown }> = [];

  constructor(
    private readonly table: string,
    private readonly tables: { traces: Row[]; events: Row[] },
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  async maybeSingle() {
    const rows = this.rows();
    return { data: rows[0] ?? null, error: null };
  }

  async order() {
    const rows = this.rows();
    if (this.table === "ai_trace_events") {
      rows.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    }
    return { data: rows, error: null };
  }

  private rows() {
    const source = this.table === "ai_trace_sessions"
      ? this.tables.traces
      : this.table === "ai_trace_events"
        ? this.tables.events
        : [];

    return source.filter((row) => this.filters.every((filter) => row[filter.column] === filter.value));
  }
}

function createObservabilityApp() {
  const app = express();
  app.use(express.json());
  app.use("/observability", observabilityRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
    });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) as TBody : null,
    };
  } finally {
    await close(server);
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server as unknown as Server));
  });
}

function close(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}
