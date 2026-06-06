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
delete process.env.OPENAI_API_KEY;

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";
const CONVERSATION_ID = "44444444-4444-4444-8444-444444444444";

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
        id: OTHER_ID,
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
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "A private continuity persona.",
        long_description: "Keeps useful chat continuity.",
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Return with context.",
        style_notes: "Steady and precise.",
        sort_order: 0,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
    ],
    conversations: [
      {
        id: CONVERSATION_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Harbor working chat",
        mode: "private",
        status: "active",
        archived_at: null,
        message_count: 0,
        created_at: "2026-05-26T09:10:00.000Z",
        updated_at: "2026-05-26T09:10:00.000Z",
      },
    ],
    conversation_messages: [
      messageRow("55555555-5555-4555-8555-555555555551", "user", "Remember that Harbor should ask before turning private grief into public material.", "2026-05-26T09:11:00.000Z"),
      messageRow("55555555-5555-4555-8555-555555555552", "assistant", "I will keep private grief bounded and ask before public transformation.", "2026-05-26T09:12:00.000Z"),
      messageRow("55555555-5555-4555-8555-555555555553", "user", "Always preserve continuity before novelty when we are working with the archive.", "2026-05-26T09:13:00.000Z"),
      messageRow("55555555-5555-4555-8555-555555555554", "assistant", "Canon candidate: continuity comes first when archive material is active.", "2026-05-26T09:14:00.000Z"),
    ],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    memory_items: [],
    canon_items: [],
    persona_files: [],
    import_jobs: [],
    calibration_sessions: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-26T10:00:00.000Z");
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

    if (table === "archived_chat_transcripts") {
      row.source_summary ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "continuity_candidates") {
      row.status ??= "pending";
      row.source_message_ids ??= [];
      row.accepted_target_type ??= null;
      row.accepted_target_id ??= null;
      row.accepted_at ??= null;
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

    if (table === "canon_items") {
      row.title ??= null;
      row.source_type ??= "manual";
      row.priority ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;

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

  private async execute(mode?: "single") {
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

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }

    return { data, error: null };
  }
}

function messageRow(id: string, role: string, content: string, createdAt: string) {
  return {
    id,
    conversation_id: CONVERSATION_ID,
    role,
    content,
    tokens_used: null,
    provider_used: role === "assistant" ? "test-model" : null,
    created_at: createdAt,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createConversationArchiveApp() {
  const { conversationsRouter } = await import("./conversations.js");
  const app = express();
  app.use(express.json());
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

test("owner can archive a chat into private continuity candidates", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createConversationArchiveApp();

  try {
    const blocked = await requestJson(app, "POST", `/conversations/${CONVERSATION_ID}/archive`, {
      token: "other-token",
    });
    assert.equal(blocked.status, 403);

    const archived = await requestJson(app, "POST", `/conversations/${CONVERSATION_ID}/archive`, {
      token: "owner-token",
    });
    assert.equal(archived.status, 201);
    assert.equal(archived.body.conversation.status, "archived");
    assert.equal(archived.body.conversation.message_count, 4);
    assert.equal(archived.body.archive.transcript.messageCount, 4);
    assert.match(archived.body.archive.transcript.transcriptMarkdown, /Always preserve continuity before novelty/);
    assert.equal(archived.body.archive.candidates.length, 2);

    const blockedChat = await requestJson(app, "POST", `/conversations/persona/${PERSONA_ID}/chat`, {
      token: "owner-token",
      body: {
        conversationId: CONVERSATION_ID,
        content: "Continue this archived chat.",
      },
    });
    assert.equal(blockedChat.status, 409);

    const memoryCandidate = archived.body.archive.candidates.find((candidate: Row) => candidate.candidateType === "memory");
    const canonCandidate = archived.body.archive.candidates.find((candidate: Row) => candidate.candidateType === "canon");
    assert.ok(memoryCandidate);
    assert.ok(canonCandidate);

    const blockedCandidate = await requestJson(app, "PATCH", `/conversations/candidates/${memoryCandidate.id}`, {
      token: "other-token",
      body: { action: "accept" },
    });
    assert.equal(blockedCandidate.status, 404);

    const accepted = await requestJson(app, "PATCH", `/conversations/candidates/${memoryCandidate.id}`, {
      token: "owner-token",
      body: {
        action: "accept",
        title: "Boundary memory",
        content: "Harbor asks before turning private grief into public material.",
      },
    });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.body.candidate.status, "accepted");
    assert.equal(accepted.body.candidate.acceptedTargetType, "memory");
    assert.equal(db.tables.memory_items.length, 1);
    assert.equal(db.tables.memory_items[0].title, "Boundary memory");
    assert.equal(db.tables.memory_items[0].owner_user_id, OWNER_ID);

    const rejected = await requestJson(app, "PATCH", `/conversations/candidates/${canonCandidate.id}`, {
      token: "owner-token",
      body: { action: "reject" },
    });
    assert.equal(rejected.status, 200);
    assert.equal(rejected.body.candidate.status, "rejected");
    assert.equal(db.tables.canon_items.length, 0);

    const readBack = await requestJson(app, "GET", `/conversations/${CONVERSATION_ID}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.equal(readBack.body.messages.length, 4);
    assert.equal(readBack.body.archive.candidates.find((candidate: Row) => candidate.id === memoryCandidate.id).status, "accepted");

    const context = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=private%20grief`, {
      token: "owner-token",
    });
    assert.equal(context.status, 200);
    assert.equal(context.body.context.counts.archive, 1);
    assert.match(context.body.context.systemPrompt, /Harbor asks before turning private grief into public material/);
    assert.match(context.body.context.systemPrompt, /Harbor working chat/);

    const otherContext = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=private%20grief`, {
      token: "other-token",
    });
    assert.equal(otherContext.status, 403);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
