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
process.env.DEEPSEEK_API_KEY = "";
process.env.NVIDIA_AI_API_KEY = "";
process.env.ANTHROPIC_API_KEY = "";

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
    memory_item_lifecycle: [],
    canon_items: [],
    persona_files: [],
    import_jobs: [],
    calibration_sessions: [],
  };

  failInsertTables = new Set<string>();
  failInsertMessages = new Map<string, string>();
  missingImportJobFileIdColumn = false;

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
      row.archived_chat_transcript_id ??= null;
      row.source_table ??= null;
      row.source_id ??= null;
      row.source_label ??= null;
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
      row.archive_source_type ??= null;
      row.archive_source_id ??= null;
      row.archive_source_name ??= null;
      row.chunk_index ??= null;
      row.chunk_count ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "memory_item_lifecycle") {
      row.status ??= "active";
      row.trust_level ??= "inferred";
      row.confidence ??= 0.6;
      row.evidence ??= [];
      row.reinforcement_count ??= 0;
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

    if (table === "import_jobs") {
      row.error_message ??= null;
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
  private selectedColumns = "*";

  constructor(private db: InMemorySupabase, private table: string) {}

  select(columns = "*") {
    this.selectedColumns = columns;
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
    let rows: Row[];

    if (this.operation === "insert") {
      if (this.db.failInsertTables.has(this.table)) {
        return {
          data: mode === "single" ? null : [],
          error: {
            message: this.db.failInsertMessages.get(this.table) ?? `Injected ${this.table} insert failure.`,
          },
        };
      }
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      if (this.table === "memory_items") {
        const invalid = payloads.find((payload) =>
          payload.relevance_weight !== undefined && !Number.isInteger(payload.relevance_weight)
        );
        if (invalid) {
          return {
            data: mode === "single" ? null : [],
            error: { message: `invalid input syntax for type integer: "${invalid.relevance_weight}"` },
          };
        }
      }
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

    if (
      this.table === "import_jobs" &&
      this.db.missingImportJobFileIdColumn &&
      this.selectedColumns.includes("file_id")
    ) {
      return {
        data: mode === "single" ? null : [],
        error: { message: "column import_jobs.file_id does not exist" },
      };
    }

    const data = clone(rows);

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }

    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: null };
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
  const [{ conversationsRouter }, { importsRouter }] = await Promise.all([
    import("./conversations.js"),
    import("./imports.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use("/conversations", conversationsRouter);
  app.use("/imports", importsRouter);
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
    assert.equal(archived.body.archive.retrieval.chunksCreated > 0, true);
    assert.equal(db.tables.memory_items.some((row) => row.archive_source_type === "archived_chat_transcript"), true);
    assert.equal(archived.body.archive.candidates.length, 2);

    const blockedChat = await requestJson(app, "POST", `/conversations/persona/${PERSONA_ID}/chat`, {
      token: "owner-token",
      body: {
        conversationId: CONVERSATION_ID,
        content: "Continue this archived chat.",
      },
    });
    assert.equal(blockedChat.status, 409);
    assert.equal(blockedChat.body.code, "conversation_archived");
    assert.equal(blockedChat.body.classification, "archived_state");

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
    const acceptedMemory = db.tables.memory_items.find((row) => row.title === "Boundary memory");
    assert.ok(acceptedMemory);
    assert.equal(acceptedMemory.owner_user_id, OWNER_ID);
    assert.equal(acceptedMemory.archive_source_type, "archived_chat_transcript");

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
    assert.equal(context.body.context.counts.archive >= 1, true);
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

test("chat reports missing platform provider config before provider calls", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createConversationArchiveApp();

  try {
    const response = await requestJson(app, "POST", `/conversations/persona/${PERSONA_ID}/chat`, {
      token: "owner-token",
      body: {
        conversationId: CONVERSATION_ID,
        content: "Can you continue the live chat?",
      },
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "provider_config_missing");
    assert.equal(response.body.classification, "provider_config");
    assert.doesNotMatch(JSON.stringify(response.body), /Can you continue the live chat/);

    const trace = db.tables.ai_trace_sessions[0];
    assert.equal(trace.metadata.runtimeBudget.schema, "station.chat_runtime_budget.v1");
    assert.equal(trace.metadata.runtimeBudget.productionSafe, true);
    assert.equal(trace.metadata.runtimeBudget.buckets.recentTurns.itemCount, 5);
    assert.equal(trace.metadata.runtimeBudget.truncation.history.retained, 4);
    assert.doesNotMatch(JSON.stringify(trace.metadata.runtimeBudget), /Always preserve continuity before novelty/);

    const budgetEvent = db.tables.ai_trace_events.find((event) => event.label === "Chat runtime budget assembled");
    assert.ok(budgetEvent);
    assert.equal(budgetEvent.payload.runtimeBudget.schema, "station.chat_runtime_budget.v1");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner can review import-backed continuity candidates without exposing them cross-owner", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createConversationArchiveApp();

  try {
    const importFile = db.insertRow("persona_files", {
      id: "import-file-chatgpt",
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "chatgpt-export.json",
      file_type: "application/json",
      source_type: "upload",
      processed: true,
    });
    const archivedSourceMemory = db.insertRow("memory_items", {
      id: "import-source-memory",
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      title: "Imported archive source",
      content: "Original imported archive material remains available after review.",
      source_type: "import",
      archive_source_type: "persona_file",
      archive_source_id: importFile.id,
      archive_source_name: "chatgpt-export.json",
    });
    db.insertRow("memory_item_lifecycle", {
      memory_item_id: archivedSourceMemory.id,
      owner_user_id: OWNER_ID,
      persona_id: PERSONA_ID,
      status: "quarantined",
    });
    const memoryCandidate = db.insertRow("continuity_candidates", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      candidate_type: "memory",
      title: "Imported memory candidate",
      content: "Harbor remembers that import review must precede runtime use.",
      rationale: "Generated from parsed ChatGPT import review seed.",
      archived_chat_transcript_id: null,
      source_table: "persona_files",
      source_id: importFile.id,
      source_label: "chatgpt-export.json",
    });
    const canonCandidate = db.insertRow("continuity_candidates", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      candidate_type: "canon",
      title: "Imported canon candidate",
      content: "Imported material needs owner review before becoming canon.",
      rationale: "Generated from parsed ChatGPT import review seed.",
      archived_chat_transcript_id: null,
      source_table: "persona_files",
      source_id: importFile.id,
      source_label: "chatgpt-export.json",
    });
    const rejectedCandidate = db.insertRow("continuity_candidates", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      candidate_type: "memory",
      title: "Imported rejected candidate",
      content: "This imported candidate should be rejected without deleting source material.",
      rationale: "Generated from parsed ChatGPT import review seed.",
      archived_chat_transcript_id: null,
      source_table: "persona_files",
      source_id: importFile.id,
      source_label: "chatgpt-export.json",
    });
    db.insertRow("continuity_candidates", {
      persona_id: PERSONA_ID,
      owner_user_id: OTHER_ID,
      candidate_type: "memory",
      title: "Other owner import candidate",
      content: "Other owner import candidate must not leak.",
      source_table: "persona_files",
      source_id: importFile.id,
      source_label: "other-owner.json",
    });

    const pendingList = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/candidates?source=import&status=pending`, {
      token: "owner-token",
    });
    assert.equal(pendingList.status, 200);
    assert.equal(pendingList.body.summary.pending, 3);
    assert.equal(pendingList.body.summary.importBacked, 3);
    assert.deepEqual(
      pendingList.body.candidates.map((candidate: Row) => candidate.sourceLabel),
      ["chatgpt-export.json", "chatgpt-export.json", "chatgpt-export.json"]
    );
    assert.equal(pendingList.body.candidates.every((candidate: Row) => candidate.sourceTable === "persona_files"), true);
    assert.doesNotMatch(JSON.stringify(pendingList.body), /Other owner import candidate/);

    const otherPendingList = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/candidates?source=import&status=pending`, {
      token: "other-token",
    });
    assert.equal(otherPendingList.status, 403);
    assert.doesNotMatch(JSON.stringify(otherPendingList.body), /Other owner import candidate/);

    const blocked = await requestJson(app, "PATCH", `/conversations/candidates/${memoryCandidate.id}`, {
      token: "other-token",
      body: { action: "accept" },
    });
    assert.equal(blocked.status, 404);

    const acceptedMemory = await requestJson(app, "PATCH", `/conversations/candidates/${memoryCandidate.id}`, {
      token: "owner-token",
      body: {
        action: "accept",
        title: "Reviewed import memory",
        content: "Owner accepted this imported memory after review.",
      },
    });
    assert.equal(acceptedMemory.status, 200);
    assert.equal(acceptedMemory.body.candidate.status, "accepted");
    assert.equal(acceptedMemory.body.candidate.sourceTable, "persona_files");
    assert.equal(acceptedMemory.body.candidate.sourceId, importFile.id);
    assert.equal(acceptedMemory.body.target.source_type, "import");
    assert.equal(acceptedMemory.body.target.archive_source_type, "persona_file");
    assert.equal(acceptedMemory.body.target.archive_source_id, importFile.id);
    assert.equal(Number.isInteger(acceptedMemory.body.target.relevance_weight), true);
    assert.equal(acceptedMemory.body.target.relevance_weight, 2);

    const activatedLifecycle = db.tables.memory_item_lifecycle.find(
      (row) => row.memory_item_id === acceptedMemory.body.target.id
    );
    assert.equal(activatedLifecycle?.status, "active");
    assert.equal(activatedLifecycle?.trust_level, "user_stated");

    const acceptedCanon = await requestJson(app, "PATCH", `/conversations/candidates/${canonCandidate.id}`, {
      token: "owner-token",
      body: { action: "accept" },
    });
    assert.equal(acceptedCanon.status, 200);
    assert.equal(acceptedCanon.body.candidate.status, "accepted");
    assert.equal(acceptedCanon.body.target.source_type, "import");

    const rejectedImport = await requestJson(app, "PATCH", `/conversations/candidates/${rejectedCandidate.id}`, {
      token: "owner-token",
      body: { action: "reject" },
    });
    assert.equal(rejectedImport.status, 200);
    assert.equal(rejectedImport.body.candidate.status, "rejected");

    const sourceRow = db.tables.memory_items.find((row) => row.id === archivedSourceMemory.id);
    assert.ok(sourceRow);
    assert.equal(sourceRow.archive_source_id, importFile.id);
    assert.equal(
      db.tables.memory_item_lifecycle.find((row) => row.memory_item_id === archivedSourceMemory.id)?.status,
      "quarantined"
    );

    const reviewedList = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/candidates?source=import&status=reviewed`, {
      token: "owner-token",
    });
    assert.equal(reviewedList.status, 200);
    assert.equal(reviewedList.body.summary.reviewed, 3);
    assert.deepEqual(
      reviewedList.body.candidates.map((candidate: Row) => candidate.status).sort(),
      ["accepted", "accepted", "rejected"]
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("chat import jobs expose completed and failed status transitions owner-only", async () => {
  const db = new InMemorySupabase();
  db.missingImportJobFileIdColumn = true;
  setSupabaseAdminForTests(db.client as any);
  const app = await createConversationArchiveApp();

  try {
    const imported = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        sourceName: "migration-chat.txt",
        content: "This imported chat is long enough to become archive memory for job reliability testing.",
      },
    });
    assert.equal(imported.status, 201);
    assert.equal(imported.body.job.status, "completed");
    assert.equal(imported.body.imported, true);
    assert.equal(imported.body.integrityTrigger.sessionType, "migration");
    assert.equal(db.tables.import_jobs[0].status, "completed");
    assert.equal(db.tables.memory_items.some((row) => row.source_type === "import"), true);

    const ownerStatus = await requestJson(app, "GET", `/imports/${imported.body.job.id}/status`, {
      token: "owner-token",
    });
    assert.equal(ownerStatus.status, 200);
    assert.equal(ownerStatus.body.job.status, "completed");

    const otherStatus = await requestJson(app, "GET", `/imports/${imported.body.job.id}/status`, {
      token: "other-token",
    });
    assert.equal(otherStatus.status, 404);

    const listed = await requestJson(app, "GET", `/imports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.deepEqual(listed.body.jobs.map((job: Row) => job.status), ["completed"]);

    const otherList = await requestJson(app, "GET", `/imports/persona/${PERSONA_ID}`, {
      token: "other-token",
    });
    assert.equal(otherList.status, 200);
    assert.deepEqual(otherList.body.jobs, []);

    db.failInsertTables.add("memory_items");
    const failed = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        sourceName: "broken-import.txt",
        content: "This import should fail after the job row is created.",
      },
    });
    assert.equal(failed.status, 500);
    assert.match(failed.body.error, /Injected memory_items insert failure/);

    const failedJob = db.tables.import_jobs.find((job) => job.source_name === "broken-import.txt");
    assert.equal(failedJob.status, "failed");
    assert.match(failedJob.error_message, /Injected memory_items insert failure/);

    const failedStatus = await requestJson(app, "GET", `/imports/${failedJob.id}/status`, {
      token: "owner-token",
    });
    assert.equal(failedStatus.status, 200);
    assert.equal(failedStatus.body.job.status, "failed");
    assert.match(failedStatus.body.job.error_message, /Injected memory_items insert failure/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("background job retry reuses failed chat import jobs and redacts private failure text", async () => {
  const db = new InMemorySupabase();
  const app = await createConversationArchiveApp();
  const privateContent = "private retry transcript says never leak this archive sentence";
  setSupabaseAdminForTests(db.client as any);

  try {
    db.failInsertTables.add("memory_items");
    db.failInsertMessages.set(
      "memory_items",
      `Provider failure included ${privateContent} and sk-test-secret-token.`
    );

    const failed = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        sourceName: "retry-import.txt",
        content: privateContent,
      },
    });
    assert.equal(failed.status, 500);
    assert.doesNotMatch(failed.body.error, /never leak this archive sentence/);
    assert.doesNotMatch(failed.body.error, /sk-test-secret-token/);

    const failedJob = db.tables.import_jobs.find((job) => job.source_name === "retry-import.txt");
    assert.equal(failedJob.status, "failed");
    assert.doesNotMatch(failedJob.error_message, /never leak this archive sentence/);
    assert.doesNotMatch(failedJob.error_message, /sk-test-secret-token/);

    const otherRetry = await requestJson(app, "POST", `/imports/${failedJob.id}/retry`, {
      token: "other-token",
      body: { content: privateContent },
    });
    assert.equal(otherRetry.status, 404);

    db.failInsertTables.delete("memory_items");
    db.failInsertMessages.delete("memory_items");

    const retried = await requestJson(app, "POST", `/imports/${failedJob.id}/retry`, {
      token: "owner-token",
      body: { content: privateContent },
    });
    assert.equal(retried.status, 200);
    assert.equal(retried.body.job.id, failedJob.id);
    assert.equal(retried.body.job.status, "completed");
    assert.equal(retried.body.retried, true);
    assert.equal(retried.body.imported, true);

    const rowsAfterRetry = db.tables.memory_items.filter((row) => row.archive_source_id === failedJob.id);
    assert.equal(rowsAfterRetry.length, retried.body.chunksCreated);
    assert.equal(rowsAfterRetry.length > 0, true);

    failedJob.status = "processing";
    const recoveredProcessing = await requestJson(app, "POST", `/imports/${failedJob.id}/retry`, {
      token: "owner-token",
      body: { content: "new text must not create duplicate archive rows" },
    });
    assert.equal(recoveredProcessing.status, 200);
    assert.equal(recoveredProcessing.body.idempotent, true);
    assert.equal(recoveredProcessing.body.retried, false);
    assert.equal(recoveredProcessing.body.recoveredFrom, "archive_rows_already_exist");
    assert.equal(recoveredProcessing.body.job.status, "completed");
    assert.equal(db.tables.memory_items.filter((row) => row.archive_source_id === failedJob.id).length, rowsAfterRetry.length);

    failedJob.status = "failed";
    failedJob.error_message = "Partial failure after archive rows were already inserted.";
    const recoveredFailedPartial = await requestJson(app, "POST", `/imports/${failedJob.id}/retry`, {
      token: "owner-token",
      body: {},
    });
    assert.equal(recoveredFailedPartial.status, 200);
    assert.equal(recoveredFailedPartial.body.idempotent, true);
    assert.equal(recoveredFailedPartial.body.retried, false);
    assert.equal(recoveredFailedPartial.body.recoveredFrom, "partial_archive_rows");
    assert.equal(recoveredFailedPartial.body.job.status, "completed");
    assert.equal(recoveredFailedPartial.body.job.error_message, null);
    assert.equal(db.tables.memory_items.filter((row) => row.archive_source_id === failedJob.id).length, rowsAfterRetry.length);

    const repeated = await requestJson(app, "POST", `/imports/${failedJob.id}/retry`, {
      token: "owner-token",
      body: { content: "new text must not create duplicate archive rows" },
    });
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.idempotent, true);
    assert.equal(repeated.body.retried, false);
    assert.equal(repeated.body.recoveredFrom, null);
    assert.equal(db.tables.memory_items.filter((row) => row.archive_source_id === failedJob.id).length, rowsAfterRetry.length);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
