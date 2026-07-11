import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import {
  DisabledOperationalCacheProvider,
  resetOperationalCacheProviderForTests,
  setOperationalCacheProviderForTests,
  type OperationalCacheProvider,
} from "../services/operational-cache.service";
import { estimateConversationTokens } from "../services/token-credits.service";
import { personaEncountersRouter } from "./persona-encounters";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

const nativeFetch = globalThis.fetch;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_OWNER_ID = "22222222-2222-4222-8222-222222222222";
const INITIATOR_ID = "33333333-3333-4333-8333-333333333333";
const RESPONDER_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_PERSONA_ID = "55555555-5555-4555-8555-555555555555";
const PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG =
  "PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        tier: "private",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: null,
        byok_anthropic_key: null,
        byok_deepseek_key: null,
      },
      {
        id: OTHER_OWNER_ID,
        email: "other@example.test",
        tier: "private",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: null,
        byok_anthropic_key: null,
        byok_deepseek_key: null,
      },
    ],
    personas: [
      {
        id: INITIATOR_ID,
        owner_user_id: OWNER_ID,
        name: "Blue Lantern",
        short_description: "A careful guide.",
        long_description: "Owner-only private persona notes for a quiet guide.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Notice the room before speaking.",
        style_notes: "Gentle, exact, brief.",
      },
      {
        id: RESPONDER_ID,
        owner_user_id: OWNER_ID,
        name: "Copper Scribe",
        short_description: "A grounded responder.",
        long_description: "Owner-only private persona notes for the response voice.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Answer once and stay inside the setup.",
        style_notes: "Plainspoken and warm.",
      },
      {
        id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_OWNER_ID,
        name: "Other Owner Persona",
        short_description: "Not owned by the caller.",
        long_description: "Cross-owner private material.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Do not expose me.",
        style_notes: "Unavailable.",
      },
    ],
    topup_purchases: [],
    token_usage: [],
    token_transactions: [],
    persona_encounter_private_sessions: [],
    conversations: [],
    conversation_messages: [],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    continuity_records: [],
    memory_items: [],
    canon_items: [],
    documents: [],
    threads: [],
    comments: [],
    moderation_reports: [],
    public_persona_interaction_counters: [],
    background_jobs: [],
  };

  private clock = Date.parse("2026-06-29T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["other-token", { id: OTHER_OWNER_ID, email: "other@example.test" }],
  ]);

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token) ?? null;
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => new QueryBuilder(this, table),
    rpc: (name: string, args: Row) => this.rpc(name, args),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    if (table === "persona_encounter_private_sessions" && !row.id) {
      row.id = `66666666-6666-4666-8666-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    row.id ??= `${table}-${this.rows(table).length + 1}`;

    if (table === "token_usage") {
      row.period_start ??= "2026-06-01";
      row.tokens_used ??= 0;
      row.tokens_limit ??= this.tokenLimitForUser(row.user_id);
      row.topup_tokens ??= 0;
      row.updated_at ??= now;
    }

    if (table === "token_transactions") {
      row.period_start ??= "2026-06-01";
      row.transaction_type ??= "llm_call";
      row.model_used ??= null;
      row.chat_id ??= null;
      row.input_tokens ??= 0;
      row.output_tokens ??= 0;
      row.tokens_delta ??= row.input_tokens + row.output_tokens;
      row.created_at ??= now;
    }

    if (table === "persona_encounter_private_sessions") {
      row.provenance_schema ??= "station.persona_encounter.private_session.v1";
      row.source_retrieval_used ??= false;
      row.shareable ??= false;
      row.public_visibility ??= "private";
      row.owner_title ??= null;
      row.owner_summary ??= null;
      row.owner_tags ??= [];
      row.publication_candidate ??= false;
      row.curation_schema ??= "station.persona_encounter.private_session_curation.v1";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }

  private rpc(name: string, args: Row) {
    if (name === "ensure_current_token_usage") {
      return Promise.resolve({ data: clone(this.ensureTokenUsage(args.p_user_id)), error: null });
    }

    if (name === "record_token_usage") {
      const usage = this.ensureTokenUsage(args.p_user_id);
      const inputTokens = Math.max(0, Number(args.p_input_tokens ?? 0));
      const outputTokens = Math.max(0, Number(args.p_output_tokens ?? 0));
      usage.tokens_used += inputTokens + outputTokens;
      usage.updated_at = this.timestamp();
      this.insertRow("token_transactions", {
        user_id: args.p_user_id,
        period_start: usage.period_start,
        transaction_type: "llm_call",
        model_used: args.p_model,
        chat_id: args.p_chat_id ?? null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        tokens_delta: inputTokens + outputTokens,
      });
      return Promise.resolve({ data: clone(usage), error: null });
    }

    return Promise.resolve({ data: null, error: { message: `Unknown RPC ${name}` } });
  }

  private ensureTokenUsage(userId: string) {
    let usage = this.rows("token_usage").find((row) =>
      row.user_id === userId && row.period_start === "2026-06-01"
    );
    if (!usage) {
      usage = this.insertRow("token_usage", {
        user_id: userId,
        period_start: "2026-06-01",
        tokens_limit: this.tokenLimitForUser(userId),
      });
    }
    return usage;
  }

  private tokenLimitForUser(userId: string) {
    const tier = this.rows("profiles").find((profile) => profile.id === userId)?.tier ?? "visitor";
    if (tier === "creator") return 7_500_000;
    if (tier === "canon" || tier === "institutional" || tier === "developer") return 20_000_000;
    if (tier === "private" || tier === "basic") return 750_000;
    return 0;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mutation:
    | { type: "insert"; payload: Row | Row[] }
    | { type: "update"; payload: Row }
    | { type: "delete" }
    | null = null;

  constructor(private db: InMemorySupabase, private table: string) {}

  select() {
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mutation = { type: "insert", payload };
    return this;
  }

  update(payload: Row) {
    this.mutation = { type: "update", payload };
    return this;
  }

  delete() {
    this.mutation = { type: "delete" };
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    return this.execute("single");
  }

  maybeSingle() {
    return this.execute("maybeSingle");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    if (this.mutation?.type === "insert") {
      const payloads = Array.isArray(this.mutation.payload) ? this.mutation.payload : [this.mutation.payload];
      const inserted = payloads.map((payload) => this.db.insertRow(this.table, payload));
      const data = clone(inserted);
      if (mode === "single") {
        return data.length === 1
          ? { data: data[0], error: null }
          : { data: null, error: { message: `Expected one inserted ${this.table} row.` } };
      }
      if (mode === "maybeSingle") {
        return data.length > 0
          ? { data: data[0], error: null }
          : { data: null, error: null };
      }
      return { data, error: null };
    }

    if (this.mutation?.type === "update") {
      const matches = this.matchingRows();
      const ids = new Set(matches.map((row) => row.id));
      const updated: Row[] = [];
      for (const row of this.db.rows(this.table)) {
        if (!ids.has(row.id)) continue;
        Object.assign(row, this.mutation.payload);
        row.updated_at = this.db.timestamp();
        updated.push(row);
      }
      const data = clone(updated);
      if (mode === "single") {
        return data.length === 1
          ? { data: data[0], error: null }
          : { data: null, error: { message: `Expected one updated ${this.table} row.` } };
      }
      if (mode === "maybeSingle") {
        return data.length > 0
          ? { data: data[0], error: null }
          : { data: null, error: null };
      }
      return { data, error: null };
    }

    if (this.mutation?.type === "delete") {
      const rows = this.db.rows(this.table);
      const matches = this.matchingRows().map((row) => row.id);
      this.db.tables[this.table] = rows.filter((row) => !matches.includes(row.id));
      return { data: null, error: null };
    }

    const data = clone(this.matchingRows());
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: null };
    }
    return { data, error: null };
  }
}

class TestRateLimitProvider implements OperationalCacheProvider {
  readonly enabled = true;
  readonly kind = "test" as const;
  counts = new Map<string, number>();
  keys: string[] = [];

  async getJson<T>(): Promise<T | null> {
    return null;
  }

  async setJson() {
    return undefined;
  }

  async increment(key: string) {
    this.keys.push(key);
    const next = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, next);
    return next;
  }

  async deleteKeys() {
    return 0;
  }
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/persona-encounters", personaEncountersRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await nativeFetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
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

function installProviderFetch(input: { status?: number; content?: string; model?: string } = {}) {
  const calls: Array<{ url: string; body: Row }> = [];
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(url),
      body: JSON.parse(String(init?.body ?? "{}")) as Row,
    });
    const status = input.status ?? 200;
    if (status >= 400) {
      return new Response("provider says no", { status });
    }
    return new Response(JSON.stringify({
      model: input.model ?? "deepseek-chat",
      choices: [{ message: { content: input.content ?? "Copper Scribe answers once." } }],
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

function configureProviderEnv() {
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  process.env.DEEPSEEK_BASE_URL = "https://deepseek.test";
  process.env.DEEPSEEK_MODEL = "deepseek-chat";
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.NVIDIA_MODEL_BASE_URL;
  delete process.env.NVIDIA_MODEL;
  delete process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG];
}

function clearProviderEnv() {
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_BASE_URL;
  delete process.env.DEEPSEEK_MODEL;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.NVIDIA_MODEL_BASE_URL;
  delete process.env.NVIDIA_MODEL;
  delete process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG];
}

function configureNvidiaOnlyEnv(flagValue?: string) {
  clearProviderEnv();
  process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
  process.env.NVIDIA_MODEL_BASE_URL = "https://nvidia.test/v1";
  process.env.NVIDIA_MODEL = "openai/gpt-oss-120b";
  if (flagValue !== undefined) {
    process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG] = flagValue;
  }
}

function previewBody(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens: number;
}> = {}) {
  return {
    initiatorPersonaId: INITIATOR_ID,
    responderPersonaId: RESPONDER_ID,
    setup: "The owner places both personas in a quiet library and asks for one reply.",
    ...overrides,
  };
}

function readinessPath(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
}> = {}) {
  const params = new URLSearchParams({
    initiatorPersonaId: overrides.initiatorPersonaId ?? INITIATOR_ID,
    responderPersonaId: overrides.responderPersonaId ?? RESPONDER_ID,
  });
  return `/persona-encounters/preview/readiness?${params.toString()}`;
}

function privateSessionBody(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens: number;
}> = {}) {
  return previewBody(overrides);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function withHarness<T>(
  fn: (input: { db: InMemorySupabase; app: Express; providerCalls: Array<{ url: string; body: Row }> }) => Promise<T>,
  options: { providerStatus?: number; providerContent?: string; providerModel?: string; rateLimitProvider?: OperationalCacheProvider } = {},
) {
  const db = new InMemorySupabase();
  configureProviderEnv();
  const providerCalls = installProviderFetch({
    status: options.providerStatus,
    content: options.providerContent,
    model: options.providerModel,
  });
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(options.rateLimitProvider ?? new TestRateLimitProvider());

  try {
    return await fn({ db, app: createApp(), providerCalls });
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
    clearProviderEnv();
    globalThis.fetch = nativeFetch;
  }
}

function assertNoDurableEncounterWrites(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_private_sessions",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

function assertNoDurableEncounterWritesExceptPrivateSessions(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

test("private encounter curation migration extends the owner-only table without weakening RLS", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/075_persona_encounter_private_session_curation.sql",
    "utf8",
  );

  assert.match(sql, /alter table public\.persona_encounter_private_sessions/);
  assert.match(sql, /owner_title text/);
  assert.match(sql, /owner_summary text/);
  assert.match(sql, /owner_tags text\[\] not null default '\{\}'::text\[\]/);
  assert.match(sql, /publication_candidate boolean not null default false/);
  assert.match(sql, /station\.persona_encounter\.private_session_curation\.v1/);
  assert.match(sql, /where tag is null\s+or char_length\(btrim\(tag\)\) not between 1 and 40/);
  assert.equal(/disable row level security/i.test(sql), false);
  assert.equal(/drop policy/i.test(sql), false);
  assert.equal(/drop constraint/i.test(sql), false);
  assert.match(sql, /not a public exhibit, share link, moderation state, or cross-owner consent|Does not create publication/);
});

test("owner preview generates one disposable same-owner responder reply without durable encounter rows", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ maxOutputTokens: 120 }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.preview.reply.role, "responder");
    assert.equal(response.body.preview.reply.content, "Copper Scribe answers once.");
    assert.equal(response.body.provenance.setup.label, "Owner-authored setup");
    assert.equal(response.body.provenance.setup.stored, false);
    assert.equal(response.body.provenance.personas.label, "Selected same-owner personas");
    assert.equal(response.body.provenance.personas.initiatorName, "Blue Lantern");
    assert.equal(response.body.provenance.personas.responderName, "Copper Scribe");
    assert.equal(response.body.provenance.reply.label, "Model-generated responder reply");
    assert.deepEqual(response.body.provenance.persistence, {
      saved: false,
      transcriptStored: false,
      shareable: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Disposable preview only; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    });

    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://deepseek.test/chat/completions");
    assert.equal(providerCalls[0].body.max_tokens, 120);
    assert.equal(providerCalls[0].body.messages.some((message: Row) =>
      message.role === "system" &&
      String(message.content).includes("Do not continue the conversation")
    ), true);
    assert.equal(providerCalls[0].body.messages.some((message: Row) =>
      message.role === "user" &&
      String(message.content).includes("Owner-authored setup")
    ), true);

    const transaction = db.rows("token_transactions")[0];
    const providerSystemMessage = providerCalls[0].body.messages.find((message: Row) => message.role === "system");
    const providerUserMessage = providerCalls[0].body.messages.find((message: Row) => message.role === "user");
    const expectedInputTokens = estimateConversationTokens({
      systemPrompt: providerSystemMessage.content,
      userMessage: providerUserMessage.content,
    });
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(transaction.user_id, OWNER_ID);
    assert.equal(transaction.chat_id, null);
    assert.equal(transaction.model_used, "deepseek-chat");
    assert.equal(transaction.input_tokens, expectedInputTokens);
    assert.equal(transaction.output_tokens > 0, true);

    assertNoDurableEncounterWrites(db);
    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes(OWNER_ID), false);
    assert.equal(responseJson.includes(INITIATOR_ID), false);
    assert.equal(responseJson.includes(RESPONDER_ID), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  });
});

test("provider readiness reports ready when an accepted private-context route is configured", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("provider readiness blocks cross-owner responder before provider resolution", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "GET", readinessPath({ responderPersonaId: OTHER_PERSONA_ID }), {
      token: "owner-token",
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.ready, false);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("nvidia-only private context stays paused before generation", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    for (const flagValue of [undefined, "", "false", "TRUE", " true "]) {
      configureNvidiaOnlyEnv(flagValue);

      const readiness = await requestJson(app, "GET", readinessPath(), {
        token: "owner-token",
      });

      assert.equal(readiness.status, 200);
      assert.equal(readiness.body.ready, false);
      assert.equal(readiness.body.code, "persona_encounter_provider_unavailable");
      assert.equal(readiness.body.classification, "provider_data_policy");
      assert.equal(
        readiness.body.message,
        "Encounter preview is paused because provider setup is unavailable.",
      );

      const generation = await requestJson(app, "POST", "/persona-encounters/preview", {
        token: "owner-token",
        body: previewBody(),
      });

      assert.equal(generation.status, 503);
      assert.equal(generation.body.code, "persona_encounter_provider_unavailable");
      assert.equal(generation.body.classification, "provider_data_policy");
      const responseJson = JSON.stringify({ readiness: readiness.body, generation: generation.body });
      assert.equal(responseJson.includes("test-nvidia-key"), false);
      assert.equal(responseJson.includes("nvidia.test"), false);
      assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
    }
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("nvidia-only private context can be explicitly opted in for owner readiness", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-nvidia-key"), false);
    assert.equal(responseJson.includes("nvidia.test"), false);
    assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
  });
});

test("nvidia-only opt-in generates one disposable same-owner reply without durable rows", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ maxOutputTokens: 140 }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.preview.reply.role, "responder");
    assert.equal(response.body.preview.reply.content, "Copper Scribe answers once.");
    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://nvidia.test/v1/chat/completions");
    assert.equal(providerCalls[0].body.model, "openai/gpt-oss-120b");
    assert.equal(providerCalls[0].body.max_tokens, 512);

    const transaction = db.rows("token_transactions")[0];
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(transaction.user_id, OWNER_ID);
    assert.equal(transaction.chat_id, null);
    assert.equal(transaction.model_used, "openai/gpt-oss-120b");
    assertNoDurableEncounterWrites(db);

    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-nvidia-key"), false);
    assert.equal(responseJson.includes("nvidia.test"), false);
    assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  }, {
    providerModel: "openai/gpt-oss-120b",
  });
});

test("nvidia-only opt-in still blocks cross-owner responder before provider resolution", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("owner BYOK route remains accepted without the nvidia encounter opt-in", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
    const profile = db.rows("profiles").find((row) => row.id === OWNER_ID)!;
    profile.ai_mode = "byok";
    profile.byok_openai_key = "test-openai-key";
    const responder = db.rows("personas").find((row) => row.id === RESPONDER_ID)!;
    responder.provider = "openai";

    const readiness = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.deepEqual(readiness.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });

    const generation = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(generation.status, 200);
    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://api.openai.com/v1/chat/completions");
    assert.equal(providerCalls[0].body.model, "gpt-4o-mini");
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWrites(db);
  }, {
    providerModel: "gpt-4o-mini",
  });
});

test("cross-owner responder fails before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("missing provider config fails closed before quota, rate limit, or provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_provider_unavailable");
    assert.equal(response.body.classification, "provider_config");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("quota exhaustion fails closed before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    db.insertRow("token_usage", {
      user_id: OWNER_ID,
      period_start: "2026-06-01",
      tokens_used: 750_000,
      tokens_limit: 750_000,
      topup_tokens: 0,
    });

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 402);
    assert.equal(response.body.code, "persona_encounter_quota_exceeded");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("disabled encounter rate-limit cache fails closed before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_rate_limit_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider: new DisabledOperationalCacheProvider("missing_config"),
  });
});

test("provider failure is bounded and is not retried", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_failed");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    providerStatus: 429,
  });
});

test("empty provider reply fails bounded without recording successful token usage", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_empty_reply");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);

    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-deepseek-key"), false);
    assert.equal(responseJson.includes("deepseek.test"), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  }, {
    providerContent: "  \n\t  ",
  });
});

test("private encounter session routes require authentication", async () => {
  await withHarness(async ({ app, providerCalls }) => {
    const sessionId = "66666666-6666-4666-8666-666666666666";
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      body: privateSessionBody(),
    });
    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions");
    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`);
    const curation = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      body: { title: "Private title" },
    });
    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${sessionId}`);

    assert.equal(create.status, 401);
    assert.equal(list.status, 401);
    assert.equal(detail.status, 401);
    assert.equal(curation.status, 401);
    assert.equal(deletion.status, 401);
    assert.equal(providerCalls.length, 0);
  });
});

test("owner can create list detail and delete a private encounter session without leaking raw ids", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });

    assert.equal(create.status, 201);
    assert.equal(create.body.session.setup.label, "Owner-authored setup");
    assert.equal(create.body.session.setup.stored, true);
    assert.equal(create.body.session.setup.content, "The owner places both personas in a quiet library and asks for one reply.");
    assert.equal(create.body.session.personas.label, "Selected same-owner personas");
    assert.equal(create.body.session.personas.initiatorName, "Blue Lantern");
    assert.equal(create.body.session.personas.responderName, "Copper Scribe");
    assert.equal(create.body.session.reply.label, "Model-generated responder reply");
    assert.equal(create.body.session.reply.role, "responder");
    assert.equal(create.body.session.reply.content, "Copper Scribe answers once.");
    assert.deepEqual(create.body.session.provenance.artifact, {
      label: "Private owner-only artifact",
      private: true,
      ownerOnly: true,
      serverCreated: true,
    });
    assert.deepEqual(create.body.session.provenance.persistence, {
      saved: true,
      transcriptStored: false,
      shareable: false,
      public: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Private saved encounter artifact; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    });

    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_user_id, OWNER_ID);
    assert.equal(stored.initiator_persona_id, INITIATOR_ID);
    assert.equal(stored.responder_persona_id, RESPONDER_ID);
    assert.equal(stored.owner_setup, "The owner places both personas in a quiet library and asks for one reply.");
    assert.equal(stored.responder_reply, "Copper Scribe answers once.");
    assert.equal(stored.provenance_schema, "station.persona_encounter.private_session.v1");
    assert.equal(stored.source_retrieval_used, false);
    assert.equal(stored.shareable, false);
    assert.equal(stored.public_visibility, "private");
    assert.equal(stored.owner_title, null);
    assert.equal(stored.owner_summary, null);
    assert.deepEqual(stored.owner_tags, []);
    assert.equal(stored.publication_candidate, false);
    assert.equal(stored.curation_schema, "station.persona_encounter.private_session_curation.v1");
    assert.deepEqual(create.body.session.curation, {
      label: "Owner-authored private curation",
      title: null,
      summary: null,
      tags: [],
      publicationCandidate: false,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const createJson = JSON.stringify(create.body);
    for (const hidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      "owner_user_id",
      "initiator_persona_id",
      "responder_persona_id",
      "test-deepseek-key",
      "deepseek.test",
      "deepseek-chat",
      "private persona notes",
    ]) {
      assert.equal(createJson.includes(hidden), false, `${hidden} leaked in create readback`);
    }

    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions", {
      token: "owner-token",
    });
    assert.equal(list.status, 200);
    assert.equal(list.body.sessions.length, 1);
    assert.equal(list.body.sessions[0].id, create.body.session.id);
    assert.equal(list.body.sessions[0].reply.content, "Copper Scribe answers once.");

    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.session.id, create.body.session.id);
    assert.equal(detail.body.session.setup.content, create.body.session.setup.content);

    const crossOwnerDetail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "other-token",
    });
    assert.equal(crossOwnerDetail.status, 404);

    const crossOwnerDelete = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "other-token",
    });
    assert.equal(crossOwnerDelete.status, 404);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);

    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(deletion.status, 200);
    assert.deepEqual(deletion.body, {
      deleted: true,
      session: {
        id: create.body.session.id,
      },
    });
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);

    const afterDelete = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(afterDelete.status, 404);
  });
});

test("owner can add edit and clear bounded private curation metadata only on own sessions", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);

    const sessionId = create.body.session.id;
    const update = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "owner-token",
      body: {
        title: "  Library draft  ",
        summary: "  Save this for later shape work.  ",
        tags: ["  quiet ", "candidate"],
        publicationCandidate: true,
      },
    });

    assert.equal(update.status, 200);
    assert.equal(update.body.session.id, sessionId);
    assert.deepEqual(update.body.session.curation, {
      label: "Owner-authored private curation",
      title: "Library draft",
      summary: "Save this for later shape work.",
      tags: ["quiet", "candidate"],
      publicationCandidate: true,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_title, "Library draft");
    assert.equal(stored.owner_summary, "Save this for later shape work.");
    assert.deepEqual(stored.owner_tags, ["quiet", "candidate"]);
    assert.equal(stored.publication_candidate, true);
    assert.equal(stored.curation_schema, "station.persona_encounter.private_session_curation.v1");

    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions", {
      token: "owner-token",
    });
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.sessions[0].curation.tags, ["quiet", "candidate"]);
    assert.equal(list.body.sessions[0].curation.publicationCandidate, true);

    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.session.curation.title, "Library draft");

    const crossOwner = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "other-token",
      body: { title: "Cross owner edit" },
    });
    assert.equal(crossOwner.status, 404);
    assert.equal(db.rows("persona_encounter_private_sessions")[0].owner_title, "Library draft");

    const clear = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "owner-token",
      body: {
        title: null,
        summary: "",
        tags: [],
        publicationCandidate: false,
      },
    });
    assert.equal(clear.status, 200);
    assert.deepEqual(clear.body.session.curation, {
      label: "Owner-authored private curation",
      title: null,
      summary: null,
      tags: [],
      publicationCandidate: false,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const clearJson = JSON.stringify(clear.body);
    for (const hidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      "owner_user_id",
      "initiator_persona_id",
      "responder_persona_id",
      "deepseek.test",
      "test-deepseek-key",
      "private persona notes",
    ]) {
      assert.equal(clearJson.includes(hidden), false, `${hidden} leaked in curation readback`);
    }

    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);

    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(deletion.status, 200);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);

    const afterDelete = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(afterDelete.status, 404);
  });
});

test("private curation metadata rejects malformed bodies before writes", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    const sessionId = create.body.session.id;

    const cases: unknown[] = [
      {},
      { title: "x".repeat(121) },
      { summary: "x".repeat(801) },
      { tags: ["ok", "x".repeat(41)] },
      { tags: Array.from({ length: 13 }, (_, index) => `tag-${index}`) },
      { tags: "not-an-array" },
      { tags: [""] },
      { publicationCandidate: "yes" },
      { title: "Allowed", shareable: true },
      { responderReply: "Client-certified reply must stay rejected." },
    ];

    for (const body of cases) {
      const response = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `body should fail: ${JSON.stringify(body)}`);
    }

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_title, null);
    assert.equal(stored.owner_summary, null);
    assert.deepEqual(stored.owner_tags, []);
    assert.equal(stored.publication_candidate, false);
    assert.equal(stored.shareable, false);
    assert.equal(stored.public_visibility, "private");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);
  });
});

test("private encounter session create rejects client-certified replies and cross-owner personas before side effects", async () => {
  const rateLimitProvider = new TestRateLimitProvider();
  await withHarness(async ({ db, app, providerCalls }) => {
    const extraKey = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: {
        ...privateSessionBody(),
        responderReply: "Client-supplied reply must not be certified.",
      },
    });
    assert.equal(extraKey.status, 400);

    const crossOwner = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });
    assert.equal(crossOwner.status, 403);
    assert.equal(crossOwner.body.code, "persona_encounter_persona_not_owned");

    assert.equal(providerCalls.length, 0);
    assert.equal(rateLimitProvider.keys.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider,
  });
});

test("private encounter session provider setup quota rate and empty reply failures insert no session", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_provider_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    db.insertRow("token_usage", {
      user_id: OWNER_ID,
      period_start: "2026-06-01",
      tokens_used: 750_000,
      tokens_limit: 750_000,
      topup_tokens: 0,
    });
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 402);
    assert.equal(response.body.code, "persona_encounter_quota_exceeded");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_rate_limit_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider: new DisabledOperationalCacheProvider("missing_config"),
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_empty_reply");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    providerContent: "  \n  ",
  });
});
