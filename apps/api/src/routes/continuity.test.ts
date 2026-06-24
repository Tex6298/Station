import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";
process.env.OPENAI_API_KEY = "";
process.env.GEMINI_API_KEY = "";
process.env.GOOGLE_API_KEY = "";
process.env.ANTHROPIC_API_KEY = "";
process.env.DEEPSEEK_API_KEY = "";
process.env.NVIDIA_AI_API_KEY = "";
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";
process.env.REDIS_URL = "";
process.env.REDIS_PRIVATE_URL = "";
process.env.VALKEY_URL = "";

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: OWNER_ID, email: "owner@example.test", tier: "private", is_admin: false },
      { id: OTHER_ID, email: "other@example.test", tier: "private", is_admin: false },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "A private continuity persona.",
        long_description: "A private home base for continuity work.",
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Stay coherent.",
        style_notes: null,
        sort_order: 0,
        created_at: "2026-05-25T09:00:00.000Z",
        updated_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    memory_items: [],
    canon_items: [],
    persona_files: [],
    import_jobs: [],
    calibration_sessions: [],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    continuity_records: [],
    memory_item_lifecycle: [],
    persona_lifecycle_events: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T10:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["other-token", { id: OTHER_ID, email: "other@example.test" }],
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
    rpc: async (functionName: string) => {
      if (functionName === "reserve_storage_bytes" || functionName === "release_storage_bytes") {
        return { data: null, error: null };
      }

      return { data: null, error: { message: `No ${functionName} RPC in tests.` } };
    },
    from: (table: string) => new QueryBuilder(this, table),
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

    if (table === "memory_items") {
      row.title ??= null;
      row.summary ??= null;
      row.source_type ??= "manual";
      row.relevance_weight ??= 1;
      row.embedding ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "memory_item_lifecycle") {
      row.trust_level ??= "user_stated";
      row.status ??= "active";
      row.confidence ??= 1;
      row.decay_rate ??= 0;
      row.reinforcement_count ??= 0;
      row.last_reinforced_at ??= null;
      row.expires_at ??= null;
      row.superseded_by_memory_item_id ??= null;
      row.evidence ??= [];
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_lifecycle_events") {
      row.event_label ??= null;
      row.event_data ??= {};
      row.created_at ??= now;
    }

    if (table === "canon_items") {
      row.title ??= null;
      row.source_type ??= "manual";
      row.priority ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "import_jobs") {
      row.error_message ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "calibration_sessions") {
      row.session_title ??= null;
      row.transcript ??= "";
      row.extracted_style_notes ??= null;
      row.extracted_public_rules ??= null;
      row.extracted_private_rules ??= null;
      row.extracted_uncertainty_rules ??= null;
      row.save_target ??= "persona";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
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
        : {
          data: null,
          error: { code: "PGRST116", message: `Expected one ${this.table} row.` },
          count,
        };
    }

    if (mode === "maybeSingle") {
      return data.length <= 1
        ? { data: data[0] ?? null, error: null, count }
        : {
          data: null,
          error: { code: "PGRST116", message: `Expected at most one ${this.table} row.` },
          count,
        };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createContinuityApp() {
  const [
    { calibrationRouter },
    { canonRouter },
    { importsRouter },
    { memoryRouter },
    { personasRouter },
  ] = await Promise.all([
    import("./calibration.js"),
    import("./canon.js"),
    import("./imports.js"),
    import("./memory.js"),
    import("./personas.js"),
  ]);

  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/personas", personasRouter);
  app.use("/memory", memoryRouter);
  app.use("/canon", canonRouter);
  app.use("/imports", importsRouter);
  app.use("/calibration", calibrationRouter);
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
      signal: AbortSignal.timeout(5000),
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

test("private continuity loop protects memory, canon, archive, and integrity writes", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createContinuityApp();

  try {
    const blockedMemory = await requestJson(app, "POST", `/memory/persona/${PERSONA_ID}`, {
      token: "other-token",
      body: { content: "Someone else's private note." },
    });
    assert.equal(blockedMemory.status, 404);

    const memory = await requestJson(app, "POST", `/memory/persona/${PERSONA_ID}`, {
      token: "owner-token",
      body: {
        title: "Anchor memory",
        summary: "A stable private memory.",
        content: "Harbor remembers the owner values grounded continuity.",
        relevanceWeight: 2,
      },
    });
    assert.equal(memory.status, 201);
    assert.equal(memory.body.memoryItem.owner_user_id, OWNER_ID);

    const canon = await requestJson(app, "POST", `/canon/persona/${PERSONA_ID}`, {
      token: "owner-token",
      body: {
        title: "Core rule",
        content: "Harbor should preserve continuity before novelty.",
        priority: 7,
      },
    });
    assert.equal(canon.status, 201);
    assert.equal(canon.body.canonItem.priority, 7);

    const archive = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        sourceName: "old-chat",
        content: "This imported chat is long enough to become a memory chunk for the private archive.",
      },
    });
    assert.equal(archive.status, 201);
    assert.equal(archive.body.imported, true);
    assert.equal(archive.body.chunksCreated, 1);

    const started = await requestJson(app, "POST", "/calibration/start", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        sessionTitle: "Harbor integrity pass",
      },
    });
    assert.equal(started.status, 201);
    assert.equal(started.body.session.sessionTitle, "Harbor integrity pass");

    const sessionId = started.body.session.id;
    const answered = await requestJson(app, "POST", `/calibration/${sessionId}/message`, {
      token: "owner-token",
      body: {
        content: "Harbor should sound careful, direct, and steady under ambiguity.",
      },
    });
    assert.equal(answered.status, 200);
    assert.match(answered.body.session.transcript, /careful, direct, and steady/);

    const saved = await requestJson(app, "POST", `/calibration/${sessionId}/save`, {
      token: "owner-token",
      body: { saveTarget: "persona" },
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.saved, true);

    const persona = await requestJson(app, "GET", `/personas/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(persona.status, 200);
    assert.equal(persona.body.persona.continuity.memoryCount, 2);
    assert.equal(persona.body.persona.continuity.canonCount, 1);
    assert.equal(persona.body.persona.continuity.integritySessionCount, 1);
    assert.match(db.tables.personas[0].style_notes, /careful, direct, and steady/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
