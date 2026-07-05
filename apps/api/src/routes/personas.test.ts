import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import type {
  PublicPersonaAnonymousEligibilityReadback,
  PublicPersonaChatResponse,
  PublicPersonaReportConfirmation,
} from "@station/types/persona";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { ownerCanExposeExistingPublicPersonas } from "../lib/public-persona-eligibility";
import {
  DisabledOperationalCacheProvider,
  resetOperationalCacheProviderForTests,
  setOperationalCacheProviderForTests,
  type OperationalCacheProvider,
} from "../services/operational-cache.service";
import { personasRouter } from "./personas";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;
type HangingQuery = {
  table: string;
  head?: boolean;
  countRequested?: boolean;
  operation?: "select" | "insert" | "update" | "delete";
};

function anonymousEligibility(
  overrides: Partial<PublicPersonaAnonymousEligibilityReadback> = {}
): PublicPersonaAnonymousEligibilityReadback {
  const mode = overrides.mode ?? "signed_in_alpha";
  return {
    available: false,
    policy: overrides.policy ?? (mode === "anonymous_alpha" ? "replay_alpha_compatibility" : "owner_controlled_alpha"),
    mode,
    blockerCode: "owner_gate_disabled",
    blocker: "Owner has not enabled anonymous public chat for this persona; it remains signed-in alpha.",
    ownerControlledRollback: true,
    publicSourceOnly: true,
    publicSourceOnlyScope: [
      "public_profile",
      "published_public_documents",
      "linked_public_discussions",
    ],
    transcriptStored: false,
    visitorIdentityStored: false,
    rawEventsStored: false,
    aggregateCountersOnly: true,
    rateLimitFailClosed: true,
    rateLimitAvailable: true,
    providerAvailable: true,
    ...overrides,
  };
}

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "private-owner", email: "private@example.test", tier: "private", is_admin: false },
      { id: "creator-owner", email: "creator@example.test", tier: "creator", is_admin: false },
      { id: "canon-owner", email: "canon@example.test", tier: "canon", is_admin: false },
      { id: "institution-owner", email: "institution@example.test", tier: "institutional", is_admin: false },
      { id: "admin-private", email: "admin@example.test", tier: "private", is_admin: true },
      { id: "visitor-user", email: "visitor@example.test", tier: "visitor", is_admin: false },
      { id: "other-user", email: "other@example.test", tier: "private", is_admin: false },
    ],
    conversations: [],
    conversation_messages: [],
    personas: [],
    persona_layer_profiles: [],
    persona_lifecycle_events: [],
    memory_items: [],
    canon_items: [],
    persona_files: [],
    integrity_sessions: [],
    calibration_sessions: [],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    continuity_records: [],
    spaces: [],
    documents: [],
    forum_categories: [],
    community_subcommunities: [],
    threads: [],
    moderation_reports: [],
    public_persona_interaction_counters: [],
    token_usage: [],
    token_transactions: [],
    topup_purchases: [],
  };

  private idCounters: Record<string, number> = {};
  private hangingQueries: HangingQuery[] = [];
  private clock = Date.parse("2026-06-23T10:00:00.000Z");
  private usersByToken = new Map([
    ["private-token", { id: "private-owner", email: "private@example.test" }],
    ["creator-token", { id: "creator-owner", email: "creator@example.test" }],
    ["canon-token", { id: "canon-owner", email: "canon@example.test" }],
    ["institution-token", { id: "institution-owner", email: "institution@example.test" }],
    ["admin-token", { id: "admin-private", email: "admin@example.test" }],
    ["visitor-token", { id: "visitor-user", email: "visitor@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
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

  hangQuery(query: HangingQuery) {
    this.hangingQueries.push(query);
  }

  shouldHangQuery(table: string, query: Omit<HangingQuery, "table">) {
    return this.hangingQueries.some((candidate) =>
      candidate.table === table &&
      (candidate.head === undefined || candidate.head === query.head) &&
      (candidate.countRequested === undefined || candidate.countRequested === query.countRequested) &&
      (candidate.operation === undefined || candidate.operation === query.operation)
    );
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

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `${table}-${this.idCounters[table]}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "personas") {
      row.short_description ??= null;
      row.long_description ??= null;
      row.public_slug ??= null;
      row.public_chat_enabled ??= false;
      row.public_anonymous_chat_enabled ??= false;
      row.visibility ??= "private";
      row.provider ??= "platform";
      row.avatar_url ??= null;
      row.awakening_prompt ??= null;
      row.style_notes ??= null;
      row.sort_order ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_layer_profiles") {
      row.soul ??= {};
      row.body ??= {};
      row.faculty ??= {};
      row.skill ??= {};
      row.evolution ??= {};
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_lifecycle_events") {
      row.event_label ??= null;
      row.event_data ??= {};
      row.created_at ??= now;
    }

    if (table === "spaces") {
      row.slug ??= row.id;
      row.title ??= row.slug;
      row.is_public ??= true;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "documents") {
      row.title ??= "Untitled document";
      row.slug ??= row.id;
      row.body ??= "";
      row.status ??= "draft";
      row.visibility ??= "private";
      row.space_id ??= null;
      row.persona_id ??= null;
      row.source_persona_id ??= null;
      row.discussion_thread_id ??= null;
      row.published_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "forum_categories") {
      row.slug ??= row.id;
      row.title ??= row.slug;
      row.created_at ??= now;
    }

    if (table === "community_subcommunities") {
      row.category_id ??= null;
      row.owner_user_id ??= "creator-owner";
      row.slug ??= row.id;
      row.title ??= row.slug;
      row.description ??= null;
      row.subcommunity_type ??= "salon";
      row.visibility ??= "public";
      row.status ??= "active";
      row.linked_space_id ??= null;
      row.linked_developer_space_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "threads") {
      row.title ??= "Untitled thread";
      row.body ??= "";
      row.status ??= "active";
      row.visibility ??= "public";
      row.is_hidden ??= false;
      row.linked_document_id ??= null;
      row.linked_persona_id ??= null;
      row.category_id ??= null;
      row.comment_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "moderation_reports") {
      row.reporter_id ??= "reporter-user";
      row.target_type ??= "persona";
      row.target_id ??= "target-id";
      row.reason ??= "reason";
      row.notes ??= null;
      row.status ??= "open";
      row.reviewed_by ??= null;
      row.reviewed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "public_persona_interaction_counters") {
      row.owner_user_id ??= "creator-owner";
      row.persona_id ??= "persona-id";
      row.bucket_date ??= utcBucketDate();
      row.chat_attempt_count ??= 0;
      row.chat_success_count ??= 0;
      row.chat_failure_count ??= 0;
      row.report_created_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

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
      row.tokens_delta ??= 0;
      row.created_at ??= now;
    }

    return row;
  }

  private rpc(name: string, args: Row) {
    if (name === "ensure_current_token_usage") {
      return Promise.resolve({ data: this.ensureTokenUsage(args.p_user_id), error: null });
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

    if (name === "increment_public_persona_interaction_counters") {
      return Promise.resolve({
        data: clone(this.incrementPublicPersonaInteractionCounters(args)),
        error: null,
      });
    }

    return Promise.resolve({ data: null, error: { message: `Unknown RPC ${name}` } });
  }

  private incrementPublicPersonaInteractionCounters(args: Row) {
    const bucketDate = args.p_bucket_date ?? utcBucketDate();
    let counter = this.rows("public_persona_interaction_counters").find((row) =>
      row.persona_id === args.p_persona_id && row.bucket_date === bucketDate
    );
    if (!counter) {
      counter = this.insertRow("public_persona_interaction_counters", {
        owner_user_id: args.p_owner_user_id,
        persona_id: args.p_persona_id,
        bucket_date: bucketDate,
      });
    }

    counter.chat_attempt_count += Math.max(0, Number(args.p_chat_attempt_delta ?? 0));
    counter.chat_success_count += Math.max(0, Number(args.p_chat_success_delta ?? 0));
    counter.chat_failure_count += Math.max(0, Number(args.p_chat_failure_delta ?? 0));
    counter.report_created_count += Math.max(0, Number(args.p_report_created_delta ?? 0));
    counter.updated_at = this.timestamp();
    return counter;
  }

  private ensureTokenUsage(userId: string) {
    const rows = this.rows("token_usage");
    let usage = rows.find((row) => row.user_id === userId && row.period_start === "2026-06-01");
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
    if (tier === "canon" || tier === "institutional") return 20_000_000;
    if (tier === "private") return 750_000;
    return 0;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private countRequested = false;
  private head = false;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.countRequested = Boolean(options.count);
    this.head = Boolean(options.head);
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.inFilters.push([field, values]);
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

  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
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

    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.includes(row[field]));
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
    if (this.db.shouldHangQuery(this.table, {
      head: this.head,
      countRequested: this.countRequested,
      operation: this.operation,
    })) {
      return new Promise(() => undefined);
    }

    let rows: Row[];

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = this.db.timestamp();
      }
    } else if (this.operation === "delete") {
      const rowsToDelete = new Set(this.matchingRows());
      this.db.tables[this.table] = this.db.rows(this.table).filter((row) => !rowsToDelete.has(row));
      rows = [...rowsToDelete];
    } else {
      rows = this.matchingRows();
    }

    const data = clone(rows);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null, count }
        : { data: null, error: null, count };
    }

    return { data: this.head ? null : data, error: null, count };
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function utcBucketDate(daysAgo = 0) {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(start - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function createPersonasApp() {
  const app = express();
  app.use(express.json());
  app.use("/personas", personasRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown; headers?: Record<string, string> } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = { ...(options.headers ?? {}) };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
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

test("public persona eligibility blocks private-tier create and transition even with skip", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const createPublic = await requestJson(app, "POST", "/personas", {
      token: "private-token",
      body: {
        name: "Private Tier Persona",
        visibility: "public",
      },
    });

    assert.equal(createPublic.status, 403);
    assert.equal(createPublic.body.publicPersonaEligibility.eligible, false);
    assert.deepEqual(
      createPublic.body.publicPersonaEligibility.blockers,
      ["public_personas_not_available_for_tier"]
    );
    assert.equal(db.rows("personas").length, 0);

    const privatePersona = db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Owner Workspace Persona",
      short_description: "Private setup",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      visibility: "private",
    });

    const transitionPublic = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "private-token",
      body: { visibility: "public" },
    });
    assert.equal(transitionPublic.status, 403);
    assert.equal(db.rows("personas")[0].visibility, "private");

    const transitionPublicWithSkip = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "private-token",
      body: { visibility: "public", skipIntegrityPreflight: true },
    });
    assert.equal(transitionPublicWithSkip.status, 403);
    assert.equal(db.rows("personas")[0].visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner readback reports public eligibility and exact public fields without mutating visibility", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Studio Persona",
      short_description: "Owner-visible short card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "openai",
      avatar_url: "https://example.test/avatar.png",
      visibility: "private",
    });

    const ownerReadback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "creator-token",
    });

    assert.equal(ownerReadback.status, 200);
    assert.equal(ownerReadback.body.persona.ownerUserId, "creator-owner");
    assert.equal(ownerReadback.body.persona.longDescription, "Owner-only setup material.");
    assert.deepEqual(ownerReadback.body.persona.publicReadback.eligibility, {
      eligible: true,
      limit: -1,
      used: 0,
      remaining: null,
      blockers: [],
    });
    assert.deepEqual(Object.keys(ownerReadback.body.persona.publicReadback.publicFields).sort(), [
      "avatarUrl",
      "name",
      "publicChat",
      "publicSlug",
      "shortDescription",
      "visibility",
    ]);
    assert.deepEqual(ownerReadback.body.persona.publicReadback.publicFields, {
      name: "Studio Persona",
      shortDescription: "Owner-visible short card.",
      visibility: "private",
      avatarUrl: "https://example.test/avatar.png",
      publicSlug: null,
      publicChat: {
        enabled: false,
        mode: "signed_in_alpha",
      },
    });
    assert.equal(db.rows("personas")[0].visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner avatar URL control sanitizes writes, clears safely, and nulls unsafe legacy public rows", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const created = await requestJson(app, "POST", "/personas", {
      token: "creator-token",
      body: {
        name: "Avatar Persona",
        shortDescription: "Avatar setup.",
        avatarUrl: " https://cdn.example.test/avatar.png?size=128 ",
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.persona.avatarUrl, "https://cdn.example.test/avatar.png?size=128");
    const personaId = created.body.persona.id;
    assert.equal(db.rows("personas").find((row) => row.id === personaId)?.avatar_url, "https://cdn.example.test/avatar.png?size=128");

    const safePatch = await requestJson(app, "PATCH", `/personas/${personaId}`, {
      token: "creator-token",
      body: { avatarUrl: "https://images.example.test/portraits/avatar.webp" },
    });
    assert.equal(safePatch.status, 200);
    assert.equal(safePatch.body.persona.avatarUrl, "https://images.example.test/portraits/avatar.webp");

    const nonOwnerPatch = await requestJson(app, "PATCH", `/personas/${personaId}`, {
      token: "other-token",
      body: { avatarUrl: "https://other.example.test/avatar.png" },
    });
    assert.equal(nonOwnerPatch.status, 404);
    assert.equal(db.rows("personas").find((row) => row.id === personaId)?.avatar_url, "https://images.example.test/portraits/avatar.webp");

    for (const unsafe of [
      "javascript:alert(1)",
      "data:image/svg+xml;base64,AAAA",
      "http://example.test/avatar.png",
      "https://localhost/avatar.png",
      "https://127.0.0.1/avatar.png",
      "https://192.168.1.10/avatar.png",
      "https://cdn.example.test/avatar.png?apikey=abc123",
      "https://cdn.example.test/avatar.png?apiKey=abc123",
      "https://cdn.example.test/avatar.png?token=secret",
      "https://cdn.example.test/avatar.png?x-amz-signature=abc",
      "https://station.example.test/storage/avatar.png",
      "https://example.test/avatar.png#fragment",
    ]) {
      const response = await requestJson(app, "PATCH", `/personas/${personaId}`, {
        token: "creator-token",
        body: { avatarUrl: unsafe },
      });
      if (unsafe.endsWith("#fragment")) {
        assert.equal(response.status, 200);
        assert.equal(response.body.persona.avatarUrl, "https://example.test/avatar.png");
      } else {
        assert.equal(response.status, 400, unsafe);
        assert.equal(response.body.code, "invalid_avatar_url");
        assert.equal(JSON.stringify(response.body).includes(unsafe), false);
      }
    }

    const cleared = await requestJson(app, "PATCH", `/personas/${personaId}`, {
      token: "creator-token",
      body: { avatarUrl: "   " },
    });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.persona.avatarUrl, null);
    assert.equal(db.rows("personas").find((row) => row.id === personaId)?.avatar_url, null);

    const unsafeLegacy = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Unsafe Legacy Avatar",
      short_description: "Legacy row.",
      visibility: "public",
      public_slug: "unsafe-legacy-avatar",
      public_chat_enabled: false,
      avatar_url: "javascript:alert(1)",
    });

    const ownerLegacy = await requestJson(app, "GET", `/personas/${unsafeLegacy.id}`, {
      token: "creator-token",
    });
    assert.equal(ownerLegacy.status, 200);
    assert.equal(ownerLegacy.body.persona.avatarUrl, null);

    const publicLegacy = await requestJson(app, "GET", "/personas/public/unsafe-legacy-avatar");
    assert.equal(publicLegacy.status, 200);
    assert.equal(publicLegacy.body.persona.avatarUrl, null);
    assert.equal(JSON.stringify(publicLegacy.body).includes("javascript:"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("creator, canon, institutional, and admin-private users can create public personas when eligible", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    for (const [token, name] of [
      ["creator-token", "Creator Public Persona"],
      ["canon-token", "Canon Public Persona"],
      ["institution-token", "Institution Public Persona"],
      ["admin-token", "Admin Public Persona"],
    ] as const) {
      const created = await requestJson(app, "POST", "/personas", {
        token,
        body: {
          name,
          shortDescription: "Public-safe profile card.",
          visibility: "public",
        },
      });

      assert.equal(created.status, 201);
      assert.equal(created.body.persona.visibility, "public");
      assert.match(created.body.persona.publicReadback.publicFields.publicSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(created.body.persona.publicReadback.eligibility.eligible, true);
      assert.deepEqual(created.body.persona.publicReadback.eligibility.blockers, []);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("generated public persona slugs never expose UUID-shaped route ids", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const uuidLikeName = "550e8400-e29b-41d4-a716-446655440000";
    const created = await requestJson(app, "POST", "/personas", {
      token: "creator-token",
      body: {
        name: uuidLikeName,
        shortDescription: "Public-safe UUID-shaped name.",
        visibility: "public",
      },
    });

    assert.equal(created.status, 201);
    assert.equal(
      created.body.persona.publicReadback.publicFields.publicSlug,
      `persona-${uuidLikeName}`
    );

    const rawUuidReadback = await requestJson(app, "GET", `/personas/public/${uuidLikeName}`);
    assert.equal(rawUuidReadback.status, 404);

    const safeReadback = await requestJson(app, "GET", `/personas/public/persona-${uuidLikeName}`);
    assert.equal(safeReadback.status, 200);
    assert.equal(safeReadback.body.persona.publicSlug, `persona-${uuidLikeName}`);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("non-owner public persona readback uses the public serializer only", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Public Persona",
      short_description: "Public-safe card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "anthropic",
      avatar_url: "https://example.test/public-avatar.png",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });

    const readback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "other-token",
    });

    assert.equal(readback.status, 200);
    assert.deepEqual(readback.body.persona, {
      name: "Public Persona",
      shortDescription: "Public-safe card.",
      visibility: "public",
      avatarUrl: "https://example.test/public-avatar.png",
      publicSlug: null,
      publicChat: {
        enabled: false,
        mode: "signed_in_alpha",
      },
    });

    const serialized = JSON.stringify(readback.body);
    assert.equal(serialized.includes("creator-owner"), false);
    assert.equal(serialized.includes("ownerUserId"), false);
    assert.equal(serialized.includes("longDescription"), false);
    assert.equal(serialized.includes("awakeningPrompt"), false);
    assert.equal(serialized.includes("styleNotes"), false);
    assert.equal(serialized.includes("provider"), false);

    const privatePersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Persona",
      visibility: "private",
    });
    const privateReadback = await requestJson(app, "GET", `/personas/${privatePersona.id}`, {
      token: "other-token",
    });
    assert.equal(privateReadback.status, 403);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public persona slug readback is anonymous, public-only, and owner-tier eligible", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Public Slug Persona",
      short_description: "Public-safe slug card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "anthropic",
      avatar_url: "https://example.test/public-slug-avatar.png",
      visibility: "public",
      public_slug: "public-slug-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Slug Persona",
      visibility: "private",
      public_slug: "private-slug-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Legacy Ineligible Persona",
      visibility: "public",
      public_slug: "legacy-ineligible-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "UUID Shaped Legacy Persona",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });

    const publicReadback = await requestJson(app, "GET", "/personas/public/public-slug-persona");
    assert.equal(publicReadback.status, 200);
    assert.deepEqual(publicReadback.body.persona, {
      name: "Public Slug Persona",
      shortDescription: "Public-safe slug card.",
      visibility: "public",
      avatarUrl: "https://example.test/public-slug-avatar.png",
      publicSlug: "public-slug-persona",
      publicChat: {
        enabled: false,
        mode: "signed_in_alpha",
      },
    });
    const publicJson = JSON.stringify(publicReadback.body);
    assert.equal(publicJson.includes("creator-owner"), false);
    assert.equal(publicJson.includes("provider"), false);
    assert.equal(publicJson.includes("longDescription"), false);
    assert.equal(publicJson.includes("awakeningPrompt"), false);
    assert.equal(publicJson.includes("styleNotes"), false);

    const privateReadback = await requestJson(app, "GET", "/personas/public/private-slug-persona");
    assert.equal(privateReadback.status, 404);

    const ineligibleReadback = await requestJson(app, "GET", "/personas/public/legacy-ineligible-persona");
    assert.equal(ineligibleReadback.status, 404);

    const rawUuidReadback = await requestJson(app, "GET", "/personas/public/550e8400-e29b-41d4-a716-446655440000");
    assert.equal(rawUuidReadback.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public persona roulette returns eligible public cards without private fields", async () => {
  const db = new InMemorySupabase();
  const rateLimitProvider = new TestRateLimitProvider();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(rateLimitProvider);
  const app = createPersonasApp();
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousNvidiaModel = process.env.NVIDIA_MODEL;
  const previousAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const previousDeepseekKey = process.env.DEEPSEEK_API_KEY;
  process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
  process.env.NVIDIA_MODEL = "test-public-model";
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;

  try {
    const blue = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Blue Lantern Guide",
      short_description: "Public-safe guide to the blue lantern room.",
      long_description: "Owner-only private runtime context.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "anthropic",
      avatar_url: "https://example.test/blue.png",
      visibility: "public",
      public_slug: "blue-lantern-guide",
      public_chat_enabled: true,
    });
    const ownerGated = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Owner Gated Roulette",
      short_description: "Public-safe anonymous roulette candidate.",
      visibility: "public",
      public_slug: "owner-gated-roulette",
      public_chat_enabled: true,
      public_anonymous_chat_enabled: true,
    });
    const green = db.insertRow("personas", {
      owner_user_id: "canon-owner",
      name: "Green Door Archivist",
      short_description: "Public-safe archive index.",
      visibility: "public",
      public_slug: "green-door-archivist",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Roulette Persona",
      short_description: "Should stay private.",
      visibility: "private",
      public_slug: "private-roulette-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Ineligible Public Persona",
      short_description: "Private tier should not expose.",
      visibility: "public",
      public_slug: "ineligible-public-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Unsafe UUID Persona",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });
    db.insertRow("moderation_reports", {
      reporter_id: "visitor-user",
      target_type: "persona",
      target_id: blue.id,
      reason: "public_persona_chat",
      notes: "Reporter-only note.",
      status: "open",
    });
    db.insertRow("public_persona_interaction_counters", {
      owner_user_id: "creator-owner",
      persona_id: blue.id,
      chat_attempt_count: 9,
      report_created_count: 1,
    });

    const roulette = await requestJson(app, "GET", "/personas/public/roulette?limit=5&seed=alpha");
    assert.equal(roulette.status, 200);
    assert.equal(roulette.body.seed, "alpha");
    assert.deepEqual(
      roulette.body.personas
        .map((persona: Row) => persona.name)
        .sort(),
      ["Blue Lantern Guide", "Green Door Archivist", "Owner Gated Roulette"]
    );
    assert.deepEqual(
      roulette.body.personas
        .map((persona: Row) => ({
          name: persona.name,
          shortDescription: persona.shortDescription,
          avatarUrl: persona.avatarUrl,
          publicSlug: persona.publicSlug,
          href: persona.href,
          publicChat: persona.publicChat,
        }))
        .sort((left: Row, right: Row) => left.name.localeCompare(right.name)),
      [
        {
          name: "Blue Lantern Guide",
          shortDescription: "Public-safe guide to the blue lantern room.",
          avatarUrl: "https://example.test/blue.png",
          publicSlug: "blue-lantern-guide",
          href: "/personas/blue-lantern-guide",
          publicChat: {
            enabled: true,
            mode: "signed_in_alpha",
          },
        },
        {
          name: "Green Door Archivist",
          shortDescription: "Public-safe archive index.",
          avatarUrl: null,
          publicSlug: "green-door-archivist",
          href: "/personas/green-door-archivist",
          publicChat: {
            enabled: false,
            mode: "signed_in_alpha",
          },
        },
        {
          name: "Owner Gated Roulette",
          shortDescription: "Public-safe anonymous roulette candidate.",
          avatarUrl: null,
          publicSlug: "owner-gated-roulette",
          href: "/personas/owner-gated-roulette",
          publicChat: {
            enabled: true,
            mode: "anonymous_alpha",
          },
        },
      ]
    );

    const anonymousRoulette = await requestJson(app, "GET", "/personas/public/roulette?limit=5&seed=alpha&chatMode=anonymous_alpha");
    assert.equal(anonymousRoulette.status, 200);
    assert.deepEqual(
      anonymousRoulette.body.personas.map((persona: Row) => persona.name),
      ["Owner Gated Roulette"]
    );
    assert.equal(JSON.stringify(anonymousRoulette.body).includes(ownerGated.id), false);

    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
    const rateUnavailableRoulette = await requestJson(app, "GET", "/personas/public/roulette?limit=5&seed=alpha&chatMode=anonymous_alpha");
    assert.equal(rateUnavailableRoulette.status, 200);
    assert.deepEqual(rateUnavailableRoulette.body.personas, []);

    setOperationalCacheProviderForTests(rateLimitProvider);
    delete process.env.NVIDIA_AI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    const providerUnavailableRoulette = await requestJson(app, "GET", "/personas/public/roulette?limit=5&seed=alpha&chatMode=anonymous_alpha");
    assert.equal(providerUnavailableRoulette.status, 200);
    assert.deepEqual(providerUnavailableRoulette.body.personas, []);
    process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";

    const responseJson = JSON.stringify(roulette.body);
    for (const forbidden of [
      blue.id,
      green.id,
      "creator-owner",
      "canon-owner",
      "private-owner",
      "visitor-user",
      "provider",
      "anthropic",
      "visibility",
      "longDescription",
      "awakeningPrompt",
      "styleNotes",
      "Owner-only private runtime context",
      "Reporter-only note",
      "publicInteraction",
      "report_created_count",
      "chat_attempt_count",
      "public_anonymous_chat_enabled",
      "publicAnonymousChatEnabled",
      "550e8400-e29b-41d4-a716-446655440000",
      "Ineligible Public Persona",
      "Private Roulette Persona",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked into roulette payload`);
    }
  } finally {
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousNvidiaModel == null) {
      delete process.env.NVIDIA_MODEL;
    } else {
      process.env.NVIDIA_MODEL = previousNvidiaModel;
    }
    if (previousAnthropicKey == null) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = previousAnthropicKey;
    }
    if (previousDeepseekKey == null) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = previousDeepseekKey;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("signed-in public persona chat alpha is owner-enabled, rate-limited, public-source-only, and owner-paid", async () => {
  const db = new InMemorySupabase();
  const rateLimitProvider = new TestRateLimitProvider();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(rateLimitProvider);
  const app = createPersonasApp();
  const originalFetch = globalThis.fetch;
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousNvidiaModel = process.env.NVIDIA_MODEL;
  process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
  process.env.NVIDIA_MODEL = "test-public-model";
  const providerRequests: Row[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("integrate.api.nvidia.com")) {
      providerRequests.push(JSON.parse(String(init?.body ?? "{}")));
      return new Response(JSON.stringify({
        choices: [{ message: { content: "Public answer from approved sources." } }],
        model: "test-public-model",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(input, init);
  }) as typeof fetch;

  try {
    const publicPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Blue Lantern Guide",
      short_description: "Public-safe guide to the blue lantern room.",
      long_description: "Owner-only private runtime context with memory archive canon continuity integrity.",
      awakening_prompt: "Private setup prompt with secret-shaped-value.",
      style_notes: "Private style notes with provider settings.",
      provider: "anthropic",
      visibility: "public",
      public_slug: "blue-lantern-guide",
    });
    const privatePersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Lantern",
      visibility: "private",
      public_slug: "private-lantern",
    });
    db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Ineligible Public Persona",
      visibility: "public",
      public_slug: "ineligible-public-persona",
    });
    const publicSpace = db.insertRow("spaces", {
      id: "public-space",
      slug: "field-notes",
      title: "Field Notes",
      is_public: true,
    });
    const category = db.insertRow("forum_categories", {
      id: "category-docs",
      slug: "documents-and-codexes",
      title: "Documents & Codexes",
    });
    const publicDocument = db.insertRow("documents", {
      id: "public-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      source_persona_id: publicPersona.id,
      title: "Blue Lantern Field Notes",
      body: "Public document notes about the blue lantern room.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T11:00:00.000Z",
      discussion_thread_id: "public-thread",
    });
    db.insertRow("documents", {
      id: "private-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      title: "Private Runtime Source",
      body: "Private memory archive canon continuity integrity source.",
      status: "published",
      visibility: "private",
    });
    db.insertRow("threads", {
      id: "public-thread",
      category_id: category.id,
      linked_document_id: publicDocument.id,
      title: "Blue Lantern Discussion",
      body: "Public discussion about the blue lantern source.",
      status: "active",
      visibility: "public",
      is_hidden: false,
      comment_count: 2,
    });

    const anonymousChat = await requestJson(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      body: { message: "blue lantern" },
    });
    assert.equal(anonymousChat.status, 409);
    assert.equal(anonymousChat.body.code, "public_persona_chat_disabled");

    const disabledChat = await requestJson(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      token: "visitor-token",
      body: { message: "blue lantern" },
    });
    assert.equal(disabledChat.status, 409);
    assert.equal(disabledChat.body.code, "public_persona_chat_disabled");
    assert.equal(providerRequests.length, 0);

    const privateEnable = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: true },
    });
    assert.equal(privateEnable.status, 409);
    assert.equal(db.rows("personas").find((row) => row.id === privatePersona.id)?.public_chat_enabled, false);

    const otherEnable = await requestJson(app, "PATCH", `/personas/${publicPersona.id}`, {
      token: "other-token",
      body: { publicChatEnabled: true },
    });
    assert.equal(otherEnable.status, 404);

    const enabled = await requestJson(app, "PATCH", `/personas/${publicPersona.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: true },
    });
    assert.equal(enabled.status, 200);
    assert.equal(enabled.body.persona.publicChatEnabled, true);
    assert.equal(enabled.body.persona.publicReadback.publicFields.publicChat.enabled, true);

    const ineligibleChat = await requestJson(app, "POST", "/personas/public/ineligible-public-persona/chat", {
      token: "visitor-token",
      body: { message: "hello" },
    });
    assert.equal(ineligibleChat.status, 404);

    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
    const failClosed = await requestJson(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      token: "visitor-token",
      body: { message: "blue lantern" },
    });
    assert.equal(failClosed.status, 503);
    assert.equal(failClosed.body.code, "public_persona_rate_limit_unavailable");
    assert.equal(providerRequests.length, 0);

    setOperationalCacheProviderForTests(rateLimitProvider);
    const chat = await requestJson<PublicPersonaChatResponse>(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      token: "visitor-token",
      body: { message: "What does the blue lantern source say?" },
    });
    assert.equal(chat.status, 200);
    assert.deepEqual(chat.body.reply, {
      role: "assistant",
      content: "Public answer from approved sources.",
    });
    assert.equal(chat.body.publicChat.enabled, true);
    assert.equal(chat.body.publicChat.mode, "signed_in_alpha");
    assert.equal(chat.body.publicChat.transcriptStored, false);
    assert.equal(chat.body.sources.some((source) => source.href === "/space/field-notes/documents/public-doc"), true);
    assert.equal(chat.body.sources.some((source) => source.href === "/forums/documents-and-codexes/public-thread"), true);
    assert.equal(db.rows("conversations").length, 0);
    assert.equal(db.rows("conversation_messages").length, 0);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].user_id, "creator-owner");
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assert.equal(db.rows("token_usage").find((row) => row.user_id === "creator-owner")?.tokens_used > 0, true);
    assert.equal(providerRequests.length, 1);
    assert.equal(providerRequests[0].model, "test-public-model");
    assert.equal(providerRequests[0].max_tokens, 450);

    const providerPayload = JSON.stringify(providerRequests[0]);
    assert.match(providerPayload, /Blue Lantern Guide/);
    assert.match(providerPayload, /Blue Lantern Field Notes/);
    assert.match(providerPayload, /Public document notes about the blue lantern room/);
    assert.doesNotMatch(providerPayload, /\/space|\/forums|public-doc|public-thread|creator-owner/);
    assert.doesNotMatch(providerPayload, /owner_user_id|provider settings|secret-shaped-value|Owner-only private runtime context/);
    assert.doesNotMatch(providerPayload, /Private Runtime Source|private-doc|persona_id|source_persona_id|linked_document_id|category_id/);
    assert.equal(rateLimitProvider.keys.some((key) => key.includes("test-nvidia-key")), false);

    const usage = db.rows("token_usage").find((row) => row.user_id === "creator-owner")!;
    usage.tokens_used = usage.tokens_limit;
    const quotaBlocked = await requestJson(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      token: "visitor-token",
      body: { message: "another public question" },
    });
    assert.equal(quotaBlocked.status, 402);
    assert.equal(quotaBlocked.body.code, "public_persona_quota_exceeded");
    assert.equal(providerRequests.length, 1);

    const aggregateCounters = db.rows("public_persona_interaction_counters").find((row) => row.persona_id === publicPersona.id);
    assert.equal(aggregateCounters?.owner_user_id, "creator-owner");
    assert.equal(aggregateCounters?.chat_attempt_count, 3);
    assert.equal(aggregateCounters?.chat_success_count, 1);
    assert.equal(aggregateCounters?.chat_failure_count, 2);
    assert.equal(aggregateCounters?.report_created_count, 0);
    assert.equal(JSON.stringify(aggregateCounters).includes("visitor-user"), false);
    assert.equal(JSON.stringify(aggregateCounters).includes("What does the blue lantern source say?"), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousNvidiaModel == null) {
      delete process.env.NVIDIA_MODEL;
    } else {
      process.env.NVIDIA_MODEL = previousNvidiaModel;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("anonymous public persona chat alpha is replay-slug only, hashed-rate-limited, public-source-only, and owner-paid", async () => {
  const db = new InMemorySupabase();
  const rateLimitProvider = new TestRateLimitProvider();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(rateLimitProvider);
  const app = createPersonasApp();
  const originalFetch = globalThis.fetch;
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousNvidiaModel = process.env.NVIDIA_MODEL;
  process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
  process.env.NVIDIA_MODEL = "test-public-model";
  const providerRequests: Row[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("integrate.api.nvidia.com")) {
      providerRequests.push(JSON.parse(String(init?.body ?? "{}")));
      return new Response(JSON.stringify({
        choices: [{ message: { content: "Anonymous public answer from approved sources." } }],
        model: "test-public-model",
        usage: { prompt_tokens: 24, completion_tokens: 8, total_tokens: 32 },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(input, init);
  }) as typeof fetch;

  try {
    const replayPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Station Replay Alpha Persona",
      short_description: "Public replay-safe guide.",
      long_description: "Owner-only memory archive canon continuity integrity setup.",
      awakening_prompt: "Private prompt with secret-shaped-value.",
      style_notes: "Private provider settings.",
      provider: "anthropic",
      visibility: "public",
      public_slug: "station-replay-alpha-persona",
    });
    const otherPublicPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Blue Lantern Guide",
      short_description: "Public-safe guide to the blue lantern room.",
      visibility: "public",
      public_slug: "blue-lantern-guide",
      public_chat_enabled: true,
    });
    const publicSpace = db.insertRow("spaces", {
      id: "replay-space",
      slug: "replay-notes",
      title: "Replay Notes",
      is_public: true,
    });
    const privateSpace = db.insertRow("spaces", {
      id: "private-space",
      slug: "private-notes",
      title: "Private Notes",
      is_public: false,
    });
    const category = db.insertRow("forum_categories", {
      id: "category-replay",
      slug: "replay-discussion",
      title: "Replay Discussion",
    });
    const publicDocument = db.insertRow("documents", {
      id: "replay-public-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: replayPersona.id,
      source_persona_id: replayPersona.id,
      title: "Replay Public Field Notes",
      body: "Public replay notes about careful source handling.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-29T08:00:00.000Z",
      discussion_thread_id: "replay-thread",
    });
    db.insertRow("documents", {
      id: "replay-private-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: replayPersona.id,
      title: "Private Runtime Source",
      body: "Private memory archive canon continuity integrity source body.",
      status: "published",
      visibility: "private",
    });
    db.insertRow("documents", {
      id: "replay-private-space-doc",
      author_user_id: "creator-owner",
      space_id: privateSpace.id,
      persona_id: replayPersona.id,
      title: "Private Space Public Row",
      body: "Public row in a private Space must stay hidden.",
      status: "published",
      visibility: "public",
    });
    db.insertRow("threads", {
      id: "replay-thread",
      category_id: category.id,
      linked_document_id: publicDocument.id,
      title: "Replay Public Discussion",
      body: "Public discussion about source handling.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });

    const disabledAnonymous = await requestJson(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      body: { message: "Can anonymous visitors use the public replay source?" },
    });
    assert.equal(disabledAnonymous.status, 409);
    assert.equal(disabledAnonymous.body.code, "public_persona_chat_disabled");

    const disabledSignedIn = await requestJson(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      token: "visitor-token",
      body: { message: "Signed in but disabled." },
    });
    assert.equal(disabledSignedIn.status, 409);
    assert.equal(disabledSignedIn.body.code, "public_persona_chat_disabled");

    const enabled = await requestJson(app, "PATCH", `/personas/${replayPersona.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: true },
    });
    assert.equal(enabled.status, 200);
    assert.equal(enabled.body.persona.publicAnonymousChatEnabled, false);
    assert.equal(enabled.body.persona.publicReadback.publicFields.publicChat.mode, "anonymous_alpha");

    const ownerReplayReadback = await requestJson(app, "GET", `/personas/${replayPersona.id}`, {
      token: "creator-token",
    });
    assert.equal(ownerReplayReadback.status, 200);
    assert.equal(ownerReplayReadback.body.persona.publicInteraction.publicChat.mode, "anonymous_alpha");
    assert.deepEqual(
      ownerReplayReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        available: true,
        mode: "anonymous_alpha",
        blockerCode: "available",
        blocker: null,
        providerAvailable: true,
        rateLimitAvailable: true,
      })
    );
    assert.equal(JSON.stringify(ownerReplayReadback.body.persona.publicInteraction).includes(replayPersona.id), false);
    assert.equal(JSON.stringify(ownerReplayReadback.body.persona.publicInteraction).includes("test-nvidia-key"), false);

    const publicReadback = await requestJson(app, "GET", "/personas/public/station-replay-alpha-persona");
    assert.equal(publicReadback.status, 200);
    assert.deepEqual(publicReadback.body.persona.publicChat, {
      enabled: true,
      mode: "anonymous_alpha",
    });

    const otherAnonymous = await requestJson(app, "POST", "/personas/public/blue-lantern-guide/chat", {
      body: { message: "hello" },
    });
    assert.equal(otherAnonymous.status, 401);
    assert.equal(otherAnonymous.body.code, "public_persona_auth_required");
    assert.equal(providerRequests.length, 0);

    const otherOwnerReadback = await requestJson(app, "GET", `/personas/${otherPublicPersona.id}`, {
      token: "creator-token",
    });
    assert.equal(otherOwnerReadback.status, 200);
    assert.equal(otherOwnerReadback.body.persona.publicInteraction.publicChat.mode, "signed_in_alpha");
    assert.deepEqual(
      otherOwnerReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "signed_in_alpha",
        providerAvailable: true,
        rateLimitAvailable: true,
      })
    );

    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
    const failClosed = await requestJson(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      body: { message: "rate limit store down" },
    });
    assert.equal(failClosed.status, 503);
    assert.equal(failClosed.body.code, "public_persona_rate_limit_unavailable");
    assert.equal(providerRequests.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);

    const rateLimitBlockedReadback = await requestJson(app, "GET", `/personas/${replayPersona.id}`, {
      token: "creator-token",
    });
    assert.equal(rateLimitBlockedReadback.status, 200);
    assert.deepEqual(
      rateLimitBlockedReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "anonymous_alpha",
        blockerCode: "rate_limit_unavailable",
        blocker: "Fail-closed anonymous rate limiting is unavailable.",
        providerAvailable: true,
        rateLimitAvailable: false,
      })
    );

    setOperationalCacheProviderForTests(rateLimitProvider);
    const chat = await requestJson<PublicPersonaChatResponse>(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      body: { message: "What do the replay public notes say about source handling?" },
      headers: {
        "X-Forwarded-For": "203.0.113.44, 198.51.100.7",
        "User-Agent": "raw-user-agent-secret",
        Cookie: "station_session=raw-cookie-secret",
        Authorization: "Bearer raw-auth-header-secret",
      },
    });
    assert.equal(chat.status, 200);
    assert.equal(chat.body.reply.content, "Anonymous public answer from approved sources.");
    assert.equal(chat.body.publicChat.enabled, true);
    assert.equal(chat.body.publicChat.mode, "anonymous_alpha");
    assert.equal(chat.body.publicChat.transcriptStored, false);
    assert.equal(chat.body.sources.some((source) => source.href === "/space/replay-notes/documents/replay-public-doc"), true);
    assert.equal(chat.body.sources.some((source) => source.href === "/forums/replay-discussion/replay-thread"), true);
    assert.equal(db.rows("conversations").length, 0);
    assert.equal(db.rows("conversation_messages").length, 0);
    assert.equal(db.rows("moderation_reports").length, 0);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].user_id, "creator-owner");
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assert.equal(db.rows("token_usage").find((row) => row.user_id === "creator-owner")?.tokens_used > 0, true);
    assert.equal(providerRequests.length, 1);

    const providerPayload = JSON.stringify(providerRequests[0]);
    assert.match(providerPayload, /Station Replay Alpha Persona/);
    assert.match(providerPayload, /Replay Public Field Notes/);
    assert.match(providerPayload, /Public replay notes about careful source handling/);
    assert.doesNotMatch(providerPayload, /\/space|\/forums|replay-public-doc|replay-thread|creator-owner/);
    assert.doesNotMatch(providerPayload, /owner_user_id|provider settings|secret-shaped-value|Owner-only memory/);
    assert.doesNotMatch(providerPayload, /Private Runtime Source|Private Space Public Row|replay-private-doc|persona_id|source_persona_id|linked_document_id|category_id/);

    assert.equal(rateLimitProvider.keys.some((key) => /resource:anonymous_[a-f0-9]{24}/.test(key)), true);
    for (const raw of [
      "203.0.113.44",
      "198.51.100.7",
      "127.0.0.1",
      "raw-user-agent-secret",
      "raw-cookie-secret",
      "raw-auth-header-secret",
      "What do the replay public notes",
      "test-nvidia-key",
      "visitor-user",
    ]) {
      assert.equal(rateLimitProvider.keys.some((key) => key.includes(raw)), false, `${raw} leaked into rate-limit key`);
    }

    const aggregateCounters = db.rows("public_persona_interaction_counters").find((row) => row.persona_id === replayPersona.id);
    assert.equal(aggregateCounters?.owner_user_id, "creator-owner");
    assert.equal(aggregateCounters?.chat_attempt_count, 2);
    assert.equal(aggregateCounters?.chat_success_count, 1);
    assert.equal(aggregateCounters?.chat_failure_count, 1);
    const aggregateJson = JSON.stringify(aggregateCounters);
    assert.equal(aggregateJson.includes("anonymous_"), false);
    assert.equal(aggregateJson.includes("raw-cookie-secret"), false);
    assert.equal(aggregateJson.includes("What do the replay public notes"), false);

    const disabled = await requestJson(app, "PATCH", `/personas/${replayPersona.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: false },
    });
    assert.equal(disabled.status, 200);

    const anonymousAfterDisable = await requestJson(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      body: { message: "after disable" },
    });
    assert.equal(anonymousAfterDisable.status, 409);
    assert.equal(anonymousAfterDisable.body.code, "public_persona_chat_disabled");

    const signedInAfterDisable = await requestJson(app, "POST", "/personas/public/station-replay-alpha-persona/chat", {
      token: "visitor-token",
      body: { message: "after disable signed in" },
    });
    assert.equal(signedInAfterDisable.status, 409);
    assert.equal(signedInAfterDisable.body.code, "public_persona_chat_disabled");
    assert.equal(providerRequests.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousNvidiaModel == null) {
      delete process.env.NVIDIA_MODEL;
    } else {
      process.env.NVIDIA_MODEL = previousNvidiaModel;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("public persona report resolver writes server-side target and returns public-safe confirmation", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Reportable Public Persona",
      short_description: "Report-safe public profile.",
      visibility: "public",
      public_slug: "reportable-public-persona",
    });

    const anonymous = await requestJson(app, "POST", "/personas/public/reportable-public-persona/report", {
      body: { reason: "public_persona_chat" },
    });
    assert.equal(anonymous.status, 401);

    const created = await requestJson<PublicPersonaReportConfirmation>(
      app,
      "POST",
      "/personas/public/reportable-public-persona/report",
      {
        token: "visitor-token",
        body: {
          reason: "public_persona_chat",
          notes: "Public page report without prompt or response text.",
        },
      }
    );
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, {
      report: { status: "open" },
      duplicate: false,
    });
    assert.equal(db.rows("moderation_reports").length, 1);
    assert.deepEqual(db.rows("moderation_reports")[0], {
      id: "moderation_reports-1",
      reporter_id: "visitor-user",
      target_type: "persona",
      target_id: persona.id,
      reason: "public_persona_chat",
      notes: "Public page report without prompt or response text.",
      status: "open",
      reviewed_by: null,
      reviewed_at: null,
      created_at: db.rows("moderation_reports")[0].created_at,
      updated_at: db.rows("moderation_reports")[0].updated_at,
    });
    const publicResponse = JSON.stringify(created.body);
    assert.equal(publicResponse.includes(persona.id), false);
    assert.equal(publicResponse.includes("visitor-user"), false);
    assert.equal(publicResponse.includes("targetId"), false);
    assert.equal(publicResponse.includes("reporter"), false);
    assert.equal(db.rows("public_persona_interaction_counters").length, 1);
    assert.equal(db.rows("public_persona_interaction_counters")[0].owner_user_id, "creator-owner");
    assert.equal(db.rows("public_persona_interaction_counters")[0].persona_id, persona.id);
    assert.equal(db.rows("public_persona_interaction_counters")[0].report_created_count, 1);

    const duplicate = await requestJson<PublicPersonaReportConfirmation>(
      app,
      "POST",
      "/personas/public/reportable-public-persona/report",
      {
        token: "visitor-token",
        body: { reason: "public_persona_chat" },
      }
    );
    assert.equal(duplicate.status, 200);
    assert.deepEqual(duplicate.body, {
      report: { status: "open" },
      duplicate: true,
    });
    assert.equal(db.rows("moderation_reports").length, 1);
    assert.equal(db.rows("public_persona_interaction_counters").length, 1);
    assert.equal(db.rows("public_persona_interaction_counters")[0].report_created_count, 1);

    const rawUuid = await requestJson(app, "POST", "/personas/public/550e8400-e29b-41d4-a716-446655440000/report", {
      token: "visitor-token",
      body: { reason: "public_persona_chat" },
    });
    assert.equal(rawUuid.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner-controlled anonymous public chat gate is default-off and rollback-scoped", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new TestRateLimitProvider());
  const app = createPersonasApp();
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const previousDeepseekKey = process.env.DEEPSEEK_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;

  try {
    const ordinary = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Owner Gated Public Persona",
      short_description: "Public-safe owner gate fixture.",
      visibility: "public",
      public_slug: "owner-gated-public-persona",
      public_chat_enabled: true,
    });
    const signedInFixture = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Station Replay Signed-In Alpha Persona",
      short_description: "Public-safe signed-in fixture.",
      visibility: "public",
      public_slug: "station-replay-signed-in-alpha-persona",
      public_chat_enabled: true,
    });

    const defaultAnonymous = await requestJson(app, "POST", "/personas/public/owner-gated-public-persona/chat", {
      body: { message: "default off" },
    });
    assert.equal(defaultAnonymous.status, 401);
    assert.equal(defaultAnonymous.body.code, "public_persona_auth_required");
    assert.equal(db.rows("public_persona_interaction_counters").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);

    const fixtureAnonymous = await requestJson(app, "POST", "/personas/public/station-replay-signed-in-alpha-persona/chat", {
      body: { message: "fixture stays signed-in only" },
    });
    assert.equal(fixtureAnonymous.status, 401);
    assert.equal(fixtureAnonymous.body.code, "public_persona_auth_required");

    const nonOwnerEnable = await requestJson(app, "PATCH", `/personas/${ordinary.id}`, {
      token: "other-token",
      body: { publicAnonymousChatEnabled: true },
    });
    assert.equal(nonOwnerEnable.status, 404);
    assert.equal(db.rows("personas").find((row) => row.id === ordinary.id)?.public_anonymous_chat_enabled, false);

    const disabledChatEnable = await requestJson(app, "PATCH", `/personas/${signedInFixture.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: false, publicAnonymousChatEnabled: true },
    });
    assert.equal(disabledChatEnable.status, 409);
    assert.match(disabledChatEnable.body.error, /requires public chat/);
    assert.equal(db.rows("personas").find((row) => row.id === signedInFixture.id)?.public_anonymous_chat_enabled, false);

    const privatePersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Gate Persona",
      visibility: "private",
      public_chat_enabled: true,
    });
    const privateEnable = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "creator-token",
      body: { publicAnonymousChatEnabled: true },
    });
    assert.equal(privateEnable.status, 409);
    assert.match(privateEnable.body.error, /public personas/);

    const unsafePersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Unsafe Gate Persona",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
      public_chat_enabled: true,
    });
    const unsafeEnable = await requestJson(app, "PATCH", `/personas/${unsafePersona.id}`, {
      token: "creator-token",
      body: { publicAnonymousChatEnabled: true },
    });
    assert.equal(unsafeEnable.status, 409);
    assert.match(unsafeEnable.body.error, /safe public persona slug/);

    const ineligiblePersona = db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Ineligible Gate Persona",
      visibility: "public",
      public_slug: "ineligible-gate-persona",
      public_chat_enabled: true,
    });
    const ineligibleEnable = await requestJson(app, "PATCH", `/personas/${ineligiblePersona.id}`, {
      token: "private-token",
      body: { publicAnonymousChatEnabled: true },
    });
    assert.equal(ineligibleEnable.status, 403);
    assert.match(ineligibleEnable.body.error, /does not allow anonymous public persona chat/);

    const enabled = await requestJson(app, "PATCH", `/personas/${ordinary.id}`, {
      token: "creator-token",
      body: { publicAnonymousChatEnabled: true },
    });
    assert.equal(enabled.status, 200);
    assert.equal(enabled.body.persona.publicChatEnabled, true);
    assert.equal(enabled.body.persona.publicAnonymousChatEnabled, true);
    assert.equal(enabled.body.persona.publicReadback.publicFields.publicChat.mode, "anonymous_alpha");
    assert.equal(
      JSON.stringify(enabled.body.persona.publicReadback.publicFields).includes("publicAnonymousChatEnabled"),
      false
    );

    const ownerReadback = await requestJson(app, "GET", `/personas/${ordinary.id}`, {
      token: "creator-token",
    });
    assert.equal(ownerReadback.status, 200);
    assert.equal(ownerReadback.body.persona.publicInteraction.publicChat.mode, "anonymous_alpha");
    assert.equal(ownerReadback.body.persona.publicInteraction.publicChat.anonymousOwnerGateEnabled, true);
    assert.deepEqual(
      ownerReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        available: false,
        policy: "owner_controlled_alpha",
        mode: "anonymous_alpha",
        blockerCode: "provider_unavailable",
        blocker: "Public persona chat provider configuration is unavailable.",
        providerAvailable: false,
        rateLimitAvailable: true,
      })
    );

    const gatedAnonymous = await requestJson(app, "POST", "/personas/public/owner-gated-public-persona/chat", {
      body: { message: "anonymous gate is on" },
      headers: {
        "X-Forwarded-For": "203.0.113.55",
        "User-Agent": "raw-gated-agent",
        Cookie: "station_session=raw-gated-cookie",
      },
    });
    assert.equal(gatedAnonymous.status, 503);
    assert.equal(gatedAnonymous.body.code, "public_persona_provider_unavailable");
    assert.equal(db.rows("token_transactions").length, 0);
    const counter = db.rows("public_persona_interaction_counters").find((row) => row.persona_id === ordinary.id);
    assert.equal(counter?.chat_attempt_count, 1);
    assert.equal(counter?.chat_failure_count, 1);
    const counterJson = JSON.stringify(counter);
    assert.equal(counterJson.includes("raw-gated-agent"), false);
    assert.equal(counterJson.includes("raw-gated-cookie"), false);
    assert.equal(counterJson.includes("203.0.113.55"), false);

    const disabled = await requestJson(app, "PATCH", `/personas/${ordinary.id}`, {
      token: "creator-token",
      body: { publicChatEnabled: false },
    });
    assert.equal(disabled.status, 200);
    assert.equal(disabled.body.persona.publicChatEnabled, false);
    assert.equal(disabled.body.persona.publicAnonymousChatEnabled, false);
    assert.equal(db.rows("personas").find((row) => row.id === ordinary.id)?.public_anonymous_chat_enabled, false);

    const afterRollback = await requestJson(app, "POST", "/personas/public/owner-gated-public-persona/chat", {
      body: { message: "after rollback" },
    });
    assert.equal(afterRollback.status, 409);
    assert.equal(afterRollback.body.code, "public_persona_chat_disabled");
    assert.equal(db.rows("public_persona_interaction_counters").find((row) => row.persona_id === ordinary.id)?.chat_attempt_count, 1);
  } finally {
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousAnthropicKey == null) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = previousAnthropicKey;
    }
    if (previousDeepseekKey == null) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = previousDeepseekKey;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("owner persona readback includes safe public interaction summary only", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new TestRateLimitProvider());
  const app = createPersonasApp();
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const previousDeepseekKey = process.env.DEEPSEEK_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Public Interaction Guide",
      short_description: "Public-safe guide.",
      visibility: "public",
      public_slug: "public-interaction-guide",
      public_chat_enabled: true,
    });
    db.insertRow("moderation_reports", {
      reporter_id: "visitor-user",
      target_type: "persona",
      target_id: persona.id,
      reason: "public_persona_chat",
      notes: "Reporter-only note with visitor context.",
      status: "open",
    });
    db.insertRow("moderation_reports", {
      reporter_id: "other-user",
      target_type: "persona",
      target_id: persona.id,
      reason: "public_persona_chat",
      notes: "Second reporter-only note.",
      status: "reviewing",
    });
    db.insertRow("moderation_reports", {
      reporter_id: "visitor-user",
      target_type: "persona",
      target_id: persona.id,
      reason: "resolved_case",
      notes: "Resolved reporter note.",
      status: "resolved",
    });
    db.insertRow("moderation_reports", {
      reporter_id: "visitor-user",
      target_type: "thread",
      target_id: "thread-1",
      status: "open",
    });
    db.insertRow("token_transactions", {
      user_id: "creator-owner",
      transaction_type: "llm_call",
      tokens_delta: 42,
      chat_id: null,
    });
    db.insertRow("public_persona_interaction_counters", {
      owner_user_id: "creator-owner",
      persona_id: persona.id,
      bucket_date: utcBucketDate(),
      chat_attempt_count: 5,
      chat_success_count: 4,
      chat_failure_count: 1,
      report_created_count: 1,
    });
    db.insertRow("public_persona_interaction_counters", {
      owner_user_id: "creator-owner",
      persona_id: persona.id,
      bucket_date: utcBucketDate(10),
      chat_attempt_count: 7,
      chat_success_count: 6,
      chat_failure_count: 1,
      report_created_count: 2,
    });
    db.insertRow("public_persona_interaction_counters", {
      owner_user_id: "creator-owner",
      persona_id: persona.id,
      bucket_date: utcBucketDate(40),
      chat_attempt_count: 99,
      chat_success_count: 99,
      chat_failure_count: 99,
      report_created_count: 99,
    });

    const ownerReadback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "creator-token",
    });
    assert.equal(ownerReadback.status, 200);
    assert.deepEqual(ownerReadback.body.persona.publicInteraction, {
      publicChat: {
        enabled: true,
        mode: "signed_in_alpha",
        anonymousOwnerGateEnabled: false,
        ownerPaid: true,
        transcriptStored: false,
        tokenAttribution: "not_available_without_event_retention",
        anonymousEligibility: anonymousEligibility({
          providerAvailable: false,
        }),
      },
      publicRoute: {
        publicSlug: "public-interaction-guide",
        href: "/personas/public-interaction-guide",
        canOpen: true,
        unavailableReason: null,
      },
      reports: {
        total: 3,
        active: 2,
        byStatus: {
          open: 1,
          reviewing: 1,
          resolved: 1,
          dismissed: 0,
        },
      },
      activity: {
        aggregation: "daily_owner_persona",
        transcriptStored: false,
        visitorIdentityStored: false,
        rawEventsStored: false,
        windows: {
          last7Days: {
            days: 7,
            chatAttempts: 5,
            chatSuccesses: 4,
            chatFailures: 1,
            reportsCreated: 1,
          },
          last30Days: {
            days: 30,
            chatAttempts: 12,
            chatSuccesses: 10,
            chatFailures: 2,
            reportsCreated: 3,
          },
        },
      },
      moderation: {
        ownerCanSeeReporterIdentity: false,
        ownerCanSeeReportBodies: false,
        adminQueueHref: null,
      },
    });

    const ownerJson = JSON.stringify(ownerReadback.body.persona.publicInteraction);
    assert.equal(ownerJson.includes("visitor-user"), false);
    assert.equal(ownerJson.includes("other-user"), false);
    assert.equal(ownerJson.includes("Reporter-only note"), false);
    assert.equal(ownerJson.includes(persona.id), false);
    assert.equal(ownerJson.includes("tokens_delta"), false);
    assert.equal(ownerJson.includes("public_persona_interaction_counters"), false);
    assert.equal(ownerJson.includes("chat_attempt_count"), false);
    assert.equal(ownerJson.includes("99"), false);

    const publicReadback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "other-token",
    });
    assert.equal(publicReadback.status, 200);
    assert.equal(JSON.stringify(publicReadback.body).includes("publicInteraction"), false);

    const adminOwnedPersona = db.insertRow("personas", {
      owner_user_id: "admin-private",
      name: "Admin Public Guide",
      visibility: "public",
      public_slug: "admin-public-guide",
    });
    const adminReadback = await requestJson(app, "GET", `/personas/${adminOwnedPersona.id}`, {
      token: "admin-token",
    });
    assert.equal(adminReadback.status, 200);
    assert.equal(
      adminReadback.body.persona.publicInteraction.moderation.adminQueueHref,
      "/forums/moderation?targetType=persona"
    );

    const unsafeSlugPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Unsafe Legacy Public Guide",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });
    const unsafeSlugReadback = await requestJson(app, "GET", `/personas/${unsafeSlugPersona.id}`, {
      token: "creator-token",
    });
    assert.equal(unsafeSlugReadback.status, 200);
    assert.deepEqual(unsafeSlugReadback.body.persona.publicInteraction.publicRoute, {
      publicSlug: null,
      href: null,
      canOpen: false,
      unavailableReason: "Persona has no safe public route.",
    });
    assert.deepEqual(
      unsafeSlugReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        blockerCode: "unsafe_public_slug",
        blocker: "Persona has no safe public route slug.",
        providerAvailable: false,
      })
    );
    assert.equal(
      JSON.stringify(unsafeSlugReadback.body.persona.publicInteraction).includes("550e8400-e29b-41d4-a716-446655440000"),
      false
    );

    const disabledReplayPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Disabled Replay Alpha",
      visibility: "public",
      public_slug: "station-replay-alpha-persona",
      public_chat_enabled: false,
    });
    const disabledReplayReadback = await requestJson(app, "GET", `/personas/${disabledReplayPersona.id}`, {
      token: "creator-token",
    });
    assert.deepEqual(
      disabledReplayReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "anonymous_alpha",
        blockerCode: "disabled_chat",
        blocker: "Owner has public chat disabled; this is the rollback control.",
        providerAvailable: false,
      })
    );

    const privateReplayPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Replay Alpha",
      visibility: "private",
      public_slug: "station-replay-alpha-persona",
      public_chat_enabled: true,
    });
    const privateReplayReadback = await requestJson(app, "GET", `/personas/${privateReplayPersona.id}`, {
      token: "creator-token",
    });
    assert.deepEqual(
      privateReplayReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "anonymous_alpha",
        blockerCode: "private_visibility",
        blocker: "Persona is private; public chat must stay closed.",
        providerAvailable: false,
      })
    );

    const ineligibleReplayPersona = db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Ineligible Replay Alpha",
      visibility: "public",
      public_slug: "station-replay-alpha-persona",
      public_chat_enabled: true,
    });
    const ineligibleReplayReadback = await requestJson(app, "GET", `/personas/${ineligibleReplayPersona.id}`, {
      token: "private-token",
    });
    assert.deepEqual(
      ineligibleReplayReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "anonymous_alpha",
        blockerCode: "owner_tier_ineligible",
        blocker: "Owner tier is not eligible for public persona exposure.",
        providerAvailable: false,
      })
    );

    const providerBlockedReplayPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Provider Blocked Replay Alpha",
      visibility: "public",
      public_slug: "station-replay-alpha-persona",
      public_chat_enabled: true,
    });
    const providerBlockedReadback = await requestJson(app, "GET", `/personas/${providerBlockedReplayPersona.id}`, {
      token: "creator-token",
    });
    assert.deepEqual(
      providerBlockedReadback.body.persona.publicInteraction.publicChat.anonymousEligibility,
      anonymousEligibility({
        mode: "anonymous_alpha",
        blockerCode: "provider_unavailable",
        blocker: "Public persona chat provider configuration is unavailable.",
        providerAvailable: false,
      })
    );
  } finally {
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousAnthropicKey == null) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = previousAnthropicKey;
    }
    if (previousDeepseekKey == null) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = previousDeepseekKey;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("public persona context preview is anonymous and limited to public routeable sources", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const publicPersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Blue Lantern Guide",
      short_description: "Public-safe guide to the blue lantern room.",
      long_description: "Owner-only private runtime context with memory archive canon continuity integrity.",
      awakening_prompt: "Private setup prompt with secret-shaped-value.",
      style_notes: "Private style notes with provider settings.",
      provider: "anthropic",
      avatar_url: "https://example.test/public-slug-avatar.png",
      visibility: "public",
      public_slug: "blue-lantern-guide",
    });
    const publicSpace = db.insertRow("spaces", {
      id: "public-space",
      slug: "field-notes",
      title: "Field Notes",
      is_public: true,
    });
    const privateSpace = db.insertRow("spaces", {
      id: "private-space",
      slug: "private-field-notes",
      title: "Private Field Notes",
      is_public: false,
    });
    const category = db.insertRow("forum_categories", {
      id: "category-docs",
      slug: "documents-and-codexes",
      title: "Documents & Codexes",
    });
    const unsafeDiscussionCategory = db.insertRow("forum_categories", {
      id: "category-unsafe-discussion",
      slug: "550e8400-e29b-41d4-a716-446655440001",
      title: "Unsafe Discussion Route",
    });
    const salonCategory = db.insertRow("forum_categories", {
      id: "category-salon",
      slug: "blue-lantern-salon",
      title: "Blue Lantern Salon",
    });
    const communitySalonCategory = db.insertRow("forum_categories", {
      id: "category-community-salon",
      slug: "community-blue-lantern-salon",
      title: "Community Blue Lantern Salon",
    });
    const privateSalonCategory = db.insertRow("forum_categories", {
      id: "category-private-salon",
      slug: "private-blue-lantern-salon",
      title: "Private Blue Lantern Salon",
    });
    const unlistedSalonCategory = db.insertRow("forum_categories", {
      id: "category-unlisted-salon",
      slug: "unlisted-blue-lantern-salon",
      title: "Unlisted Blue Lantern Salon",
    });
    const pausedSalonCategory = db.insertRow("forum_categories", {
      id: "category-paused-salon",
      slug: "paused-blue-lantern-salon",
      title: "Paused Blue Lantern Salon",
    });
    const nonSalonCategory = db.insertRow("forum_categories", {
      id: "category-canon-circle",
      slug: "canon-blue-lantern-circle",
      title: "Canon Blue Lantern Circle",
    });
    const unsafeSalonCategory = db.insertRow("forum_categories", {
      id: "category-unsafe-salon",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe Salon Route",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-public-salon",
      category_id: salonCategory.id,
      slug: "blue-lantern-salon",
      title: "Blue Lantern Salon",
      subcommunity_type: "salon",
      visibility: "public",
      status: "active",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-community-salon",
      category_id: communitySalonCategory.id,
      slug: "community-blue-lantern-salon",
      title: "Community Blue Lantern Salon",
      subcommunity_type: "salon",
      visibility: "community",
      status: "active",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-private-salon",
      category_id: privateSalonCategory.id,
      slug: "private-blue-lantern-salon",
      title: "Private Blue Lantern Salon",
      subcommunity_type: "salon",
      visibility: "private",
      status: "active",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-unlisted-salon",
      category_id: unlistedSalonCategory.id,
      slug: "unlisted-blue-lantern-salon",
      title: "Unlisted Blue Lantern Salon",
      subcommunity_type: "salon",
      visibility: "unlisted",
      status: "active",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-paused-salon",
      category_id: pausedSalonCategory.id,
      slug: "paused-blue-lantern-salon",
      title: "Paused Blue Lantern Salon",
      subcommunity_type: "salon",
      visibility: "public",
      status: "paused",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-canon-circle",
      category_id: nonSalonCategory.id,
      slug: "canon-blue-lantern-circle",
      title: "Canon Blue Lantern Circle",
      subcommunity_type: "canon",
      visibility: "public",
      status: "active",
    });
    db.insertRow("community_subcommunities", {
      id: "sub-unsafe-salon",
      category_id: unsafeSalonCategory.id,
      slug: "unsafe-blue-lantern-salon",
      title: "Unsafe Salon Route",
      subcommunity_type: "salon",
      visibility: "public",
      status: "active",
    });
    const publicDocument = db.insertRow("documents", {
      id: "public-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      source_persona_id: publicPersona.id,
      title: "Blue Lantern Field Notes",
      body: "Public document notes about the blue lantern room.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T11:00:00.000Z",
      discussion_thread_id: "public-thread",
    });
    const publicDocumentWithHiddenThread = db.insertRow("documents", {
      id: "public-doc-hidden-thread",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      source_persona_id: publicPersona.id,
      title: "Second Public Field Notes",
      body: "Public source with a hidden thread attached.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T10:00:00.000Z",
      discussion_thread_id: "hidden-thread",
    });
    db.insertRow("documents", {
      id: "public-doc-unsafe-discussion",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      title: "Unsafe Discussion Route Document",
      body: "Public document whose discussion category route is unsafe.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T09:30:00.000Z",
      discussion_thread_id: "unsafe-discussion-thread",
    });
    db.insertRow("documents", {
      id: "private-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      title: "Private Runtime Source",
      body: "Private memory archive canon continuity integrity source.",
      status: "published",
      visibility: "private",
      published_at: "2026-06-23T09:00:00.000Z",
    });
    db.insertRow("documents", {
      id: "community-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      title: "Community Only Source",
      body: "Community-only source.",
      status: "published",
      visibility: "community",
      published_at: "2026-06-23T09:00:00.000Z",
    });
    db.insertRow("documents", {
      id: "draft-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: publicPersona.id,
      title: "Unpublished Draft Source",
      body: "Draft source.",
      status: "draft",
      visibility: "public",
      published_at: null,
    });
    db.insertRow("documents", {
      id: "private-space-doc",
      author_user_id: "creator-owner",
      space_id: privateSpace.id,
      persona_id: publicPersona.id,
      title: "Private Space Source",
      body: "Public document row inside a private Space.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T08:00:00.000Z",
    });
    db.insertRow("documents", {
      id: "unrelated-doc",
      author_user_id: "creator-owner",
      space_id: publicSpace.id,
      persona_id: "other-persona",
      title: "Unrelated Source",
      body: "Unrelated source.",
      status: "published",
      visibility: "public",
      published_at: "2026-06-23T08:00:00.000Z",
    });
    db.insertRow("threads", {
      id: "public-thread",
      category_id: category.id,
      linked_document_id: publicDocument.id,
      title: "Blue Lantern Discussion",
      body: "Public discussion about the blue lantern source.",
      status: "active",
      visibility: "public",
      is_hidden: false,
      comment_count: 2,
    });
    db.insertRow("threads", {
      id: "hidden-thread",
      category_id: category.id,
      linked_document_id: publicDocumentWithHiddenThread.id,
      title: "Hidden Thread Must Stay Hidden",
      body: "Hidden thread body.",
      status: "active",
      visibility: "public",
      is_hidden: true,
      comment_count: 4,
    });
    db.insertRow("threads", {
      id: "community-thread",
      category_id: category.id,
      linked_document_id: publicDocument.id,
      title: "Community Thread Must Stay Hidden",
      body: "Community-only thread body.",
      status: "active",
      visibility: "community",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "unsafe-discussion-thread",
      category_id: unsafeDiscussionCategory.id,
      linked_document_id: "public-doc-unsafe-discussion",
      title: "Unsafe Discussion Thread Must Stay Hidden",
      body: "Unsafe public discussion route body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "public-salon-thread",
      category_id: salonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Blue Lantern Salon Circle",
      body: "Public Salon thread about the blue lantern circle.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "document-linked-salon-thread",
      category_id: salonCategory.id,
      linked_persona_id: publicPersona.id,
      linked_document_id: publicDocument.id,
      title: "Document Linked Salon Thread Must Stay Hidden",
      body: "Document-linked Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "hidden-salon-thread",
      category_id: salonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Hidden Salon Thread Must Stay Hidden",
      body: "Hidden public Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: true,
    });
    db.insertRow("threads", {
      id: "removed-salon-thread",
      category_id: salonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Removed Salon Thread Must Stay Hidden",
      body: "Removed public Salon body.",
      status: "removed",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "community-salon-thread",
      category_id: communitySalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Community Salon Thread Must Stay Hidden",
      body: "Community-only Salon body.",
      status: "active",
      visibility: "community",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "private-salon-thread",
      category_id: privateSalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Private Salon Thread Must Stay Hidden",
      body: "Private Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "unlisted-salon-thread",
      category_id: unlistedSalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Unlisted Salon Thread Must Stay Hidden",
      body: "Unlisted Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "paused-salon-thread",
      category_id: pausedSalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Paused Salon Thread Must Stay Hidden",
      body: "Paused Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "non-salon-thread",
      category_id: nonSalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Canon Circle Thread Must Stay Hidden",
      body: "Non-Salon public body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "unsafe-salon-thread",
      category_id: unsafeSalonCategory.id,
      linked_persona_id: publicPersona.id,
      title: "Unsafe Salon Route Must Stay Hidden",
      body: "Unsafe route public Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("threads", {
      id: "unrelated-salon-thread",
      category_id: salonCategory.id,
      linked_persona_id: "other-persona",
      title: "Unrelated Salon Thread Must Stay Hidden",
      body: "Unrelated public Salon body.",
      status: "active",
      visibility: "public",
      is_hidden: false,
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Context Persona",
      long_description: "Private persona body.",
      visibility: "private",
      public_slug: "private-context-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Ineligible Context Persona",
      visibility: "public",
      public_slug: "ineligible-context-persona",
    });

    const preview = await requestJson(app, "GET", "/personas/public/blue-lantern-guide/context-preview?query=blue%20lantern");
    assert.equal(preview.status, 200);
    assert.deepEqual(preview.body.persona, {
      name: "Blue Lantern Guide",
      publicSlug: "blue-lantern-guide",
    });
    assert.equal(preview.body.query, "blue lantern");
    assert.deepEqual(preview.body.preview.counts, {
      publicProfile: 1,
      publishedDocuments: 3,
      publicDiscussions: 1,
      publicSalonThreads: 1,
    });
    assert.deepEqual(preview.body.preview.sources[0], {
      type: "public_profile",
      title: "Blue Lantern Guide",
      href: "/personas/blue-lantern-guide",
      label: "Public persona profile",
      excerpt: "Public-safe guide to the blue lantern room.",
      matchesQuery: true,
    });
    assert.equal(
      preview.body.preview.sources.some((source: Row) =>
        source.type === "published_document" &&
        source.title === "Blue Lantern Field Notes" &&
        source.href === "/space/field-notes/documents/public-doc" &&
        source.excerpt === "Public document notes about the blue lantern room." &&
        source.matchesQuery === true
      ),
      true
    );
    assert.equal(
      preview.body.preview.sources.some((source: Row) =>
        source.type === "published_document" &&
        source.title === "Second Public Field Notes" &&
        source.href === "/space/field-notes/documents/public-doc-hidden-thread" &&
        source.matchesQuery === false
      ),
      true
    );
    assert.equal(
      preview.body.preview.sources.some((source: Row) =>
        source.type === "public_discussion" &&
        source.title === "Blue Lantern Discussion" &&
        source.href === "/forums/documents-and-codexes/public-thread" &&
        source.excerpt === "Public discussion about the blue lantern source." &&
        source.matchesQuery === true
      ),
      true
    );
    assert.equal(
      preview.body.preview.sources.some((source: Row) =>
        source.type === "public_salon_thread" &&
        source.title === "Blue Lantern Salon Circle" &&
        source.href === "/forums/blue-lantern-salon/public-salon-thread" &&
        source.label === "Public Salon thread" &&
        source.excerpt === "Public Salon thread about the blue lantern circle." &&
        source.matchesQuery === true
      ),
      true
    );
    assert.deepEqual(preview.body.preview.excludedPrivateBuckets, [
      "memory",
      "archive",
      "canon",
      "continuity",
      "integrity",
      "owner_profile",
      "provider_settings",
    ]);

    const previewJson = JSON.stringify(preview.body);
    assert.equal(previewJson.includes(publicPersona.id), false);
    assert.equal(previewJson.includes("creator-owner"), false);
    assert.equal(previewJson.includes("owner_user_id"), false);
    assert.equal(previewJson.includes("\"provider\""), false);
    assert.equal(previewJson.includes("providerUsed"), false);
    assert.equal(previewJson.includes("anthropic"), false);
    assert.equal(previewJson.includes("longDescription"), false);
    assert.equal(previewJson.includes("awakeningPrompt"), false);
    assert.equal(previewJson.includes("styleNotes"), false);
    assert.equal(previewJson.includes("secret-shaped-value"), false);
    assert.equal(previewJson.includes("Private setup prompt"), false);
    assert.equal(previewJson.includes("Owner-only private runtime context"), false);
    assert.equal(previewJson.includes("Private Runtime Source"), false);
    assert.equal(previewJson.includes("Community Only Source"), false);
    assert.equal(previewJson.includes("Unpublished Draft Source"), false);
    assert.equal(previewJson.includes("Private Space Source"), false);
    assert.equal(previewJson.includes("Unrelated Source"), false);
    assert.equal(previewJson.includes("Unsafe Discussion Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Hidden Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Community Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Hidden Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Document Linked Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Removed Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Community Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Private Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Unlisted Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Paused Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Canon Circle Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Unsafe Salon Route Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Unrelated Salon Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("sub-public-salon"), false);
    assert.equal(previewJson.includes("category-salon"), false);
    assert.equal(previewJson.includes("category-unsafe-discussion"), false);
    assert.equal(previewJson.includes("persona_id"), false);
    assert.equal(previewJson.includes("source_persona_id"), false);
    assert.equal(previewJson.includes("linked_document_id"), false);
    assert.equal(previewJson.includes("linked_persona_id"), false);
    assert.equal(previewJson.includes("category_id"), false);

    const events = await requestJson(app, "GET", "/personas/public/blue-lantern-guide/events?limit=20");
    assert.equal(events.status, 200);
    assert.deepEqual(events.body.persona, {
      name: "Blue Lantern Guide",
      publicSlug: "blue-lantern-guide",
    });
    assert.equal(events.body.limit, 20);
    assert.equal(events.body.events.length, 5);
    assert.equal(events.body.events.some((event: Row) => event.eventType === "public_profile"), false);
    assert.equal(
      events.body.events.some((event: Row) =>
        event.eventType === "published_document" &&
        event.label === "Published document" &&
        event.title === "Blue Lantern Field Notes" &&
        event.href === "/space/field-notes/documents/public-doc" &&
        event.occurredAt === "2026-06-23T11:00:00.000Z" &&
        event.excerpt === "Public document notes about the blue lantern room." &&
        event.sourceType === undefined
      ),
      true
    );
    assert.equal(
      events.body.events.some((event: Row) =>
        event.eventType === "published_document" &&
        event.title === "Second Public Field Notes" &&
        event.href === "/space/field-notes/documents/public-doc-hidden-thread" &&
        event.occurredAt === "2026-06-23T10:00:00.000Z"
      ),
      true
    );
    assert.equal(
      events.body.events.some((event: Row) =>
        event.eventType === "public_discussion" &&
        event.label === "Public discussion" &&
        event.title === "Blue Lantern Discussion" &&
        event.href === "/forums/documents-and-codexes/public-thread" &&
        event.excerpt === "Public discussion about the blue lantern source." &&
        event.sourceType === undefined
      ),
      true
    );
    assert.equal(
      events.body.events.some((event: Row) =>
        event.eventType === "public_salon_thread" &&
        event.label === "Public Salon thread" &&
        event.title === "Blue Lantern Salon Circle" &&
        event.href === "/forums/blue-lantern-salon/public-salon-thread" &&
        event.excerpt === "Public Salon thread about the blue lantern circle." &&
        event.sourceType === undefined
      ),
      true
    );
    for (const event of events.body.events) {
      assert.equal(typeof event.title, "string");
      assert.equal(typeof event.href, "string");
      assert.equal(typeof event.occurredAt, "string");
      assert.equal(Number.isNaN(new Date(event.occurredAt).getTime()), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "id"), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "personaId"), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "ownerUserId"), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "linkedPersonaId"), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "linkedDocumentId"), false);
      assert.equal(Object.prototype.hasOwnProperty.call(event, "categoryId"), false);
    }

    const limitedEvents = await requestJson(app, "GET", "/personas/public/blue-lantern-guide/events?limit=2");
    assert.equal(limitedEvents.status, 200);
    assert.equal(limitedEvents.body.limit, 2);
    assert.equal(limitedEvents.body.events.length, 2);

    const eventJson = JSON.stringify(events.body);
    assert.equal(eventJson.includes(publicPersona.id), false);
    assert.equal(eventJson.includes("creator-owner"), false);
    assert.equal(eventJson.includes("owner_user_id"), false);
    assert.equal(eventJson.includes("\"provider\""), false);
    assert.equal(eventJson.includes("providerUsed"), false);
    assert.equal(eventJson.includes("anthropic"), false);
    assert.equal(eventJson.includes("longDescription"), false);
    assert.equal(eventJson.includes("awakeningPrompt"), false);
    assert.equal(eventJson.includes("styleNotes"), false);
    assert.equal(eventJson.includes("secret-shaped-value"), false);
    assert.equal(eventJson.includes("Private setup prompt"), false);
    assert.equal(eventJson.includes("Owner-only private runtime context"), false);
    assert.equal(eventJson.includes("private runtime"), false);
    assert.equal(eventJson.includes("Private Runtime Source"), false);
    assert.equal(eventJson.includes("Community Only Source"), false);
    assert.equal(eventJson.includes("Unpublished Draft Source"), false);
    assert.equal(eventJson.includes("Private Space Source"), false);
    assert.equal(eventJson.includes("Unrelated Source"), false);
    assert.equal(eventJson.includes("Unsafe Discussion Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Hidden Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Community Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Hidden Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Document Linked Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Removed Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Community Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Private Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Unlisted Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Paused Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Canon Circle Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Unsafe Salon Route Must Stay Hidden"), false);
    assert.equal(eventJson.includes("Unrelated Salon Thread Must Stay Hidden"), false);
    assert.equal(eventJson.includes("sub-public-salon"), false);
    assert.equal(eventJson.includes("category-salon"), false);
    assert.equal(eventJson.includes("category-unsafe-discussion"), false);
    assert.equal(eventJson.includes("persona_id"), false);
    assert.equal(eventJson.includes("source_persona_id"), false);
    assert.equal(eventJson.includes("linked_document_id"), false);
    assert.equal(eventJson.includes("linked_persona_id"), false);
    assert.equal(eventJson.includes("category_id"), false);

    const privatePreview = await requestJson(app, "GET", "/personas/public/private-context-persona/context-preview?query=blue");
    assert.equal(privatePreview.status, 404);

    const ineligiblePreview = await requestJson(app, "GET", "/personas/public/ineligible-context-persona/context-preview?query=blue");
    assert.equal(ineligiblePreview.status, 404);

    const rawUuidPreview = await requestJson(
      app,
      "GET",
      "/personas/public/550e8400-e29b-41d4-a716-446655440000/context-preview?query=blue"
    );
    assert.equal(rawUuidPreview.status, 404);

    const tooLongPreview = await requestJson(
      app,
      "GET",
      `/personas/public/blue-lantern-guide/context-preview?query=${"a".repeat(121)}`
    );
    assert.equal(tooLongPreview.status, 400);

    const privateEvents = await requestJson(app, "GET", "/personas/public/private-context-persona/events");
    assert.equal(privateEvents.status, 404);

    const ineligibleEvents = await requestJson(app, "GET", "/personas/public/ineligible-context-persona/events");
    assert.equal(ineligibleEvents.status, 404);

    const rawUuidEvents = await requestJson(
      app,
      "GET",
      "/personas/public/550e8400-e29b-41d4-a716-446655440000/events"
    );
    assert.equal(rawUuidEvents.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public persona read routes return bounded unavailable when eligibility query hangs", async () => {
  const db = new InMemorySupabase();
  const previousTimeoutMs = process.env.PUBLIC_PERSONA_ROUTE_TIMEOUT_MS;
  process.env.PUBLIC_PERSONA_ROUTE_TIMEOUT_MS = "5";
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Station Replay Alpha Persona",
      short_description: "Public replay-safe guide.",
      visibility: "public",
      public_slug: "station-replay-alpha-persona",
      public_chat_enabled: true,
    });
    db.hangQuery({
      table: "personas",
      operation: "select",
      head: true,
      countRequested: true,
    });

    for (const path of [
      "/personas/public/station-replay-alpha-persona",
      "/personas/public/station-replay-alpha-persona/context-preview",
      "/personas/public/station-replay-alpha-persona/events",
      "/personas/public/roulette",
    ]) {
      const response = await requestJson(app, "GET", path);
      assert.equal(response.status, 503, path);
      assert.equal(response.body.code, "public_persona_route_unavailable", path);
      assert.equal(JSON.stringify(response.body).includes("creator-owner"), false, path);
      assert.equal(JSON.stringify(response.body).includes("station-replay-alpha-persona"), false, path);
    }
  } finally {
    if (previousTimeoutMs == null) {
      delete process.env.PUBLIC_PERSONA_ROUTE_TIMEOUT_MS;
    } else {
      process.env.PUBLIC_PERSONA_ROUTE_TIMEOUT_MS = previousTimeoutMs;
    }
    setSupabaseAdminForTests(null);
  }
});

test("public persona exposure eligibility fails closed when public count cannot load", async () => {
  function queryResult(result: Row) {
    return {
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => result,
      then(onfulfilled: (value: Row) => unknown, onrejected: (reason: unknown) => unknown) {
        return Promise.resolve(result).then(onfulfilled, onrejected);
      },
    };
  }

  const sb = {
    from(table: string) {
      if (table === "profiles") {
        return queryResult({
          data: { id: "private-owner", tier: "private", is_admin: false },
          error: null,
        });
      }

      return queryResult({
        data: null,
        error: { message: "count failed" },
        count: null,
      });
    },
  };

  assert.equal(await ownerCanExposeExistingPublicPersonas(sb, "private-owner"), false);
});
