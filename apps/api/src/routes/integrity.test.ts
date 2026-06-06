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
delete process.env.ANTHROPIC_API_KEY;
delete process.env.OPENAI_API_KEY;

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
        byok_openai_key: null,
      },
      {
        id: OTHER_ID,
        email: "other@example.test",
        tier: "creator",
        is_admin: false,
        byok_openai_key: null,
      },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "A private continuity persona.",
        long_description: "Keeps private and public continuity separated.",
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Return to the harbor light before improvising.",
        style_notes: "Warm and precise.",
        sort_order: 0,
        created_at: "2026-06-06T08:00:00.000Z",
        updated_at: "2026-06-06T08:00:00.000Z",
      },
    ],
    integrity_questions: [
      {
        id: "question-identity-anchor",
        cluster: "identity",
        question: "Who is Harbor when they are most themselves?",
        turn_type: "anchor",
        sort_order: 1,
        active: true,
        created_at: "2026-06-06T08:01:00.000Z",
      },
      {
        id: "question-identity-followup",
        cluster: "identity",
        question: "What should Harbor keep intact when moving into public space?",
        turn_type: "optional_followup",
        sort_order: 2,
        active: true,
        created_at: "2026-06-06T08:01:01.000Z",
      },
      {
        id: "question-relationship-anchor",
        cluster: "relationship",
        question: "What role does Harbor play for the owner?",
        turn_type: "anchor",
        sort_order: 1,
        active: true,
        created_at: "2026-06-06T08:01:02.000Z",
      },
      {
        id: "question-tone-anchor",
        cluster: "tone",
        question: "How should Harbor sound at their best?",
        turn_type: "anchor",
        sort_order: 1,
        active: true,
        created_at: "2026-06-06T08:01:03.000Z",
      },
    ],
    integrity_sessions: [],
    integrity_session_turns: [],
    integrity_session_outputs: [],
    persona_preferences: [],
    memory_items: [],
    canon_items: [],
    calibration_sessions: [],
    persona_files: [],
    import_jobs: [],
    archived_chat_transcripts: [],
    conversations: [],
    conversation_messages: [],
    continuity_candidates: [],
    continuity_records: [],
  };

  private idCounter = 0;
  private clock = Date.parse("2026-06-06T09:00:00.000Z");
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
    rpc: async () => ({ data: null, error: null }),
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

  upsertRow(table: string, payload: Row) {
    if (table === "persona_preferences") {
      const existing = this.rows(table).find(
        (row) => row.owner_user_id === payload.owner_user_id && row.persona_id === payload.persona_id
      );
      if (existing) {
        Object.assign(existing, payload, { updated_at: this.timestamp() });
        return existing;
      }
    }
    return this.insertRow(table, payload);
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  private nextUuid() {
    this.idCounter += 1;
    return `00000000-0000-4000-8000-${String(this.idCounter).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextUuid();

    if (table === "integrity_sessions") {
      row.status ??= "in_progress";
      row.clusters_covered ??= [];
      row.clusters_planned ??= [];
      row.started_at ??= now;
      row.completed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "integrity_session_turns") {
      row.answer ??= null;
      row.created_at ??= now;
    }

    if (table === "integrity_session_outputs") {
      row.status ??= "pending";
      row.edited_content ??= null;
      row.written_to ??= null;
      row.written_target_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "canon_items") {
      row.title ??= null;
      row.source_type ??= "manual";
      row.priority ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "memory_items") {
      row.title ??= null;
      row.summary ??= null;
      row.source_type ??= "manual";
      row.relevance_weight ??= 1;
      row.embedding ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_preferences") {
      row.warmth_level ??= "high";
      row.playfulness ??= "moderate";
      row.register_preference ??= "balanced";
      row.depth_preference ??= "expansive";
      row.challenge_preference ??= "balanced";
      row.disclaimer_sensitivity ??= "low";
      row.relationship_tone ??= "companion";
      row.recurring_topics ??= [];
      row.tone_notes ??= [];
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
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
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

  upsert(payload: Row | Row[]) {
    this.operation = "upsert";
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

  private async execute(mode?: "single") {
    let rows: Row[];

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "upsert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.upsertRow(this.table, payload));
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

    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createIntegrityApp() {
  const [{ integrityRouter }, { personasRouter }, { conversationsRouter }] = await Promise.all([
    import("./integrity.js"),
    import("./personas.js"),
    import("./conversations.js"),
  ]);

  const app = express();
  app.use(express.json());
  app.use("/integrity", integrityRouter);
  app.use("/personas", personasRouter);
  app.use("/conversations", conversationsRouter);
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

test("integrity lifecycle selects the question bank, falls back deterministically, and reviews outputs", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createIntegrityApp();

  try {
    const visitor = await requestJson(app, "POST", "/integrity/start", {
      body: { personaId: PERSONA_ID },
    });
    assert.equal(visitor.status, 401);

    const otherUser = await requestJson(app, "POST", "/integrity/start", {
      token: "other-token",
      body: { personaId: PERSONA_ID },
    });
    assert.equal(otherUser.status, 404);

    const started = await requestJson(app, "POST", "/integrity/start", {
      token: "owner-token",
      body: { personaId: PERSONA_ID, sessionType: "periodic" },
    });
    assert.equal(started.status, 201);
    assert.deepEqual(started.body.clustersPlanned, ["identity", "relationship", "tone"]);
    assert.equal(started.body.cluster, "identity");
    assert.equal(started.body.question, "Who is Harbor when they are most themselves?");

    const longAnswer = [
      "Harbor should stay steady, warm, and careful with public continuity boundaries",
      "while never turning private owner memory into public performance.",
    ].join(" ");
    const followup = await requestJson(app, "POST", "/integrity/answer", {
      token: "owner-token",
      body: {
        sessionId: started.body.sessionId,
        turnId: started.body.turnId,
        answer: longAnswer,
      },
    });
    assert.equal(followup.status, 200);
    assert.equal(followup.body.nextType, "followup");
    assert.equal(followup.body.question, "What should Harbor keep intact when moving into public space?");

    const summary = await requestJson(app, "POST", "/integrity/answer", {
      token: "owner-token",
      body: {
        sessionId: started.body.sessionId,
        turnId: followup.body.turnId,
        answer: "Keep private memories out of public replies.",
      },
    });
    assert.equal(summary.status, 200);
    assert.equal(summary.body.nextType, "summary");
    assert.match(summary.body.summary, /You described identity/);
    assert.match(summary.body.summary, /private owner memory/);

    const nextAnchor = await requestJson(app, "POST", "/integrity/confirm-summary", {
      token: "owner-token",
      body: {
        sessionId: started.body.sessionId,
        cluster: "identity",
        correction: "Public claims should stay bounded and provenance-aware.",
      },
    });
    assert.equal(nextAnchor.status, 200);
    assert.equal(nextAnchor.body.nextType, "anchor");
    assert.equal(nextAnchor.body.cluster, "relationship");

    const completed = await requestJson(app, "POST", "/integrity/end-early", {
      token: "owner-token",
      body: { sessionId: started.body.sessionId },
    });
    assert.equal(completed.status, 200);
    assert.equal(completed.body.nextType, "end");
    assert.equal(completed.body.outputsGenerated, 3);
    assert.equal(db.rows("integrity_sessions")[0].status, "completed");

    const otherOutputs = await requestJson(app, "GET", `/integrity/outputs/${started.body.sessionId}`, {
      token: "other-token",
    });
    assert.equal(otherOutputs.status, 404);

    const outputs = await requestJson(app, "GET", `/integrity/outputs/${started.body.sessionId}`, {
      token: "owner-token",
    });
    assert.equal(outputs.status, 200);
    assert.equal(outputs.body.status, "ready");
    assert.equal(outputs.body.outputs.length, 3);

    const [firstOutput, secondOutput] = outputs.body.outputs;
    const rejectOther = await requestJson(app, "PATCH", `/integrity/outputs/${firstOutput.id}`, {
      token: "other-token",
      body: { action: "reject" },
    });
    assert.equal(rejectOther.status, 404);

    const rejected = await requestJson(app, "PATCH", `/integrity/outputs/${firstOutput.id}`, {
      token: "owner-token",
      body: { action: "reject" },
    });
    assert.equal(rejected.status, 200);
    assert.equal(rejected.body.output.status, "rejected");

    const edited = await requestJson(app, "PATCH", `/integrity/outputs/${secondOutput.id}`, {
      token: "owner-token",
      body: {
        action: "edit",
        editedContent: "Harbor keeps public claims bounded and provenance-aware.",
      },
    });
    assert.equal(edited.status, 200);
    assert.equal(edited.body.output.status, "edited");
    assert.equal(edited.body.output.written_to, "canon");
    assert.equal(edited.body.output.edited_content, "Harbor keeps public claims bounded and provenance-aware.");

    const canon = db.rows("canon_items");
    assert.equal(canon.length, 1);
    assert.equal(canon[0].owner_user_id, OWNER_ID);
    assert.equal(canon[0].persona_id, PERSONA_ID);
    assert.equal(canon[0].source_type, "integrity_session");
    assert.equal(canon[0].content, "Harbor keeps public claims bounded and provenance-aware.");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("integrity outputs feed runtime context while completed sessions satisfy public preflight", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createIntegrityApp();

  try {
    const blocked = await requestJson(app, "PATCH", `/personas/${PERSONA_ID}`, {
      token: "owner-token",
      body: { visibility: "public" },
    });
    assert.equal(blocked.status, 409);
    assert.equal(blocked.body.integrityRequired, true);

    const session = db.insertRow("integrity_sessions", {
      owner_user_id: OWNER_ID,
      persona_id: PERSONA_ID,
      session_type: "pre_publication",
      status: "completed",
      clusters_covered: ["identity", "relationship", "tone"],
      clusters_planned: ["identity", "relationship", "tone"],
      completed_at: "2026-06-06T09:30:00.000Z",
    });
    const output = db.insertRow("integrity_session_outputs", {
      session_id: session.id,
      owner_user_id: OWNER_ID,
      persona_id: PERSONA_ID,
      output_type: "preference",
      content: "Harbor should sound direct, warm, and non-confessional in public replies.",
      status: "pending",
    });

    const allowed = await requestJson(app, "PATCH", `/personas/${PERSONA_ID}`, {
      token: "owner-token",
      body: { visibility: "public" },
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.persona.visibility, "public");

    const accepted = await requestJson(app, "PATCH", `/integrity/outputs/${output.id}`, {
      token: "owner-token",
      body: {
        action: "accept",
        editedContent: "Use a direct, warm, non-confessional public voice.",
      },
    });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.output.written_to, "preference_profile");

    const preferences = db.rows("persona_preferences");
    assert.equal(preferences.length, 1);
    assert.deepEqual(preferences[0].tone_notes, ["Use a direct, warm, non-confessional public voice."]);

    const context = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=public%20voice`, {
      token: "owner-token",
    });
    assert.equal(context.status, 200);
    assert.equal(context.body.context.counts.integrity, 1);
    assert.match(context.body.context.systemPrompt, /USER PREFERENCE PROFILE/);
    assert.match(context.body.context.systemPrompt, /direct, warm, non-confessional public voice/);

    const otherContext = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=public%20voice`, {
      token: "other-token",
    });
    assert.equal(otherContext.status, 403);

    const persona = await requestJson(app, "GET", `/personas/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(persona.status, 200);
    assert.equal(persona.body.persona.continuity.integritySessionCount, 1);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
