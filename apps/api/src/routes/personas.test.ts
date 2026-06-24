import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import type { PublicPersonaChatResponse, PublicPersonaReportConfirmation } from "@station/types/persona";
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
    threads: [],
    moderation_reports: [],
    token_usage: [],
    token_transactions: [],
    topup_purchases: [],
  };

  private idCounters: Record<string, number> = {};
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

    if (table === "threads") {
      row.title ??= "Untitled thread";
      row.body ??= "";
      row.status ??= "active";
      row.visibility ??= "public";
      row.is_hidden ??= false;
      row.linked_document_id ??= null;
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

    return Promise.resolve({ data: null, error: { message: `Unknown RPC ${name}` } });
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
  options: { token?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
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
    assert.equal(anonymousChat.status, 401);

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

    const rawUuid = await requestJson(app, "POST", "/personas/public/550e8400-e29b-41d4-a716-446655440000/report", {
      token: "visitor-token",
      body: { reason: "public_persona_chat" },
    });
    assert.equal(rawUuid.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
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
      publishedDocuments: 2,
      publicDiscussions: 1,
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
    assert.equal(previewJson.includes("Hidden Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("Community Thread Must Stay Hidden"), false);
    assert.equal(previewJson.includes("persona_id"), false);
    assert.equal(previewJson.includes("source_persona_id"), false);
    assert.equal(previewJson.includes("linked_document_id"), false);
    assert.equal(previewJson.includes("category_id"), false);

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
  } finally {
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
