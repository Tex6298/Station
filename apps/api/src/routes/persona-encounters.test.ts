import assert from "node:assert/strict";
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
import { personaEncountersRouter } from "./persona-encounters";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

const nativeFetch = globalThis.fetch;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_OWNER_ID = "22222222-2222-4222-8222-222222222222";
const INITIATOR_ID = "33333333-3333-4333-8333-333333333333";
const RESPONDER_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_PERSONA_ID = "55555555-5555-4555-8555-555555555555";

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

  constructor(private db: InMemorySupabase, private table: string) {}

  select() {
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

function installProviderFetch(input: { status?: number; content?: string } = {}) {
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
      model: "deepseek-chat",
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
}

function clearProviderEnv() {
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_BASE_URL;
  delete process.env.DEEPSEEK_MODEL;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function withHarness<T>(
  fn: (input: { db: InMemorySupabase; app: Express; providerCalls: Array<{ url: string; body: Row }> }) => Promise<T>,
  options: { providerStatus?: number; providerContent?: string; rateLimitProvider?: OperationalCacheProvider } = {},
) {
  const db = new InMemorySupabase();
  configureProviderEnv();
  const providerCalls = installProviderFetch({
    status: options.providerStatus,
    content: options.providerContent,
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

    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].user_id, OWNER_ID);
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assert.equal(db.rows("token_transactions")[0].model_used, "deepseek-chat");
    assert.equal(db.rows("token_transactions")[0].input_tokens > 0, true);
    assert.equal(db.rows("token_transactions")[0].output_tokens > 0, true);

    assertNoDurableEncounterWrites(db);
    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes(OWNER_ID), false);
    assert.equal(responseJson.includes(INITIATOR_ID), false);
    assert.equal(responseJson.includes(RESPONDER_ID), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
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
