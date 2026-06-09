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
const MEMORY_REPLACEMENT_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_MEMORY_ID = "55555555-5555-4555-8555-555555555555";

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
        short_description: "A continuity persona with public visibility.",
        long_description: "Keeps a stable private working memory.",
        visibility: "public",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Return to the harbor light before improvising.",
        style_notes: "Warm, precise, and grounded.",
        sort_order: 0,
        created_at: "2026-05-25T09:00:00.000Z",
        updated_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    memory_items: [
      {
        id: "memory-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Ritual memory",
        content: "Harbor remembers the morning ritual and the blue notebook.",
        summary: "The morning ritual is private continuity context.",
        source_type: "manual",
        relevance_weight: 4,
        created_at: "2026-05-25T09:10:00.000Z",
        updated_at: "2026-05-25T09:10:00.000Z",
      },
      {
        id: "memory-2",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Tone memory",
        content: "Quarantined memory must not leak into runtime context.",
        summary: "Quarantined memory must not leak.",
        source_type: "chat",
        relevance_weight: 2,
        created_at: "2026-05-25T09:11:00.000Z",
        updated_at: "2026-05-25T09:11:00.000Z",
      },
      {
        id: "memory-rejected",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Rejected memory",
        content: "Rejected memory must not leak into runtime context.",
        summary: "Rejected memory must not leak.",
        source_type: "manual",
        relevance_weight: 10,
        created_at: "2026-05-25T09:12:00.000Z",
        updated_at: "2026-05-25T09:12:00.000Z",
      },
      {
        id: "memory-expired",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Expired memory",
        content: "Expired memory must not leak into runtime context.",
        summary: "Expired memory must not leak.",
        source_type: "manual",
        relevance_weight: 9,
        created_at: "2026-05-25T09:13:00.000Z",
        updated_at: "2026-05-25T09:13:00.000Z",
      },
      {
        id: "memory-superseded",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Old nickname",
        content: "Old nickname must not leak after supersession.",
        summary: "Old nickname must not leak.",
        source_type: "manual",
        relevance_weight: 8,
        created_at: "2026-05-25T09:14:00.000Z",
        updated_at: "2026-05-25T09:14:00.000Z",
      },
      {
        id: MEMORY_REPLACEMENT_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Current nickname",
        content: "The current nickname is Harbor Light.",
        summary: "Current nickname: Harbor Light.",
        source_type: "manual",
        relevance_weight: 3,
        created_at: "2026-05-25T09:15:00.000Z",
        updated_at: "2026-05-25T09:15:00.000Z",
      },
      {
        id: OTHER_MEMORY_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other private memory",
        content: "Other user private note must not leak.",
        summary: "Other user private note must not leak.",
        source_type: "manual",
        relevance_weight: 10,
        created_at: "2026-05-25T09:12:00.000Z",
        updated_at: "2026-05-25T09:12:00.000Z",
      },
    ],
    memory_item_lifecycle: [
      lifecycleRow("memory-1", "active"),
      lifecycleRow("memory-2", "quarantined"),
      lifecycleRow("memory-rejected", "rejected"),
      lifecycleRow("memory-expired", "active", { expires_at: "2020-01-01T00:00:00.000Z" }),
      lifecycleRow("memory-superseded", "superseded", { superseded_by_memory_item_id: MEMORY_REPLACEMENT_ID }),
      lifecycleRow(MEMORY_REPLACEMENT_ID, "active"),
      lifecycleRow(OTHER_MEMORY_ID, "active", { owner_user_id: OTHER_ID }),
    ],
    owner_memory_blocks: [
      {
        id: "owner-block-1",
        owner_user_id: OWNER_ID,
        title: "Owner working style",
        content: "Shared owner memory says careful recall beats novelty.",
        scope: "working_style",
        trust_level: "user_stated",
        status: "active",
        confidence: 1,
        source_refs: [],
        created_at: "2026-05-25T09:03:00.000Z",
        updated_at: "2026-05-25T09:18:00.000Z",
      },
      {
        id: "owner-block-rejected",
        owner_user_id: OWNER_ID,
        title: "Rejected shared memory",
        content: "Rejected owner memory block must not leak.",
        scope: "shared_user_profile",
        trust_level: "user_stated",
        status: "rejected",
        confidence: 1,
        source_refs: [],
        created_at: "2026-05-25T09:03:00.000Z",
        updated_at: "2026-05-25T09:19:00.000Z",
      },
      {
        id: "owner-block-other",
        owner_user_id: OTHER_ID,
        title: "Other shared memory",
        content: "Other owner memory block must not leak.",
        scope: "shared_user_profile",
        trust_level: "user_stated",
        status: "active",
        confidence: 1,
        source_refs: [],
        created_at: "2026-05-25T09:03:00.000Z",
        updated_at: "2026-05-25T09:20:00.000Z",
      },
    ],
    persona_memory_cycle_states: [
      {
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        last_consolidated_at: null,
        next_threshold_pct: 75,
        settings: { enabled: true },
        created_at: "2026-05-25T09:00:00.000Z",
        updated_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    memory_item_edges: [
      {
        id: "edge-1",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        from_memory_item_id: "memory-superseded",
        to_memory_item_id: MEMORY_REPLACEMENT_ID,
        edge_type: "supersedes",
        confidence: 1,
        note: null,
        created_at: "2026-05-25T09:21:00.000Z",
      },
    ],
    canon_items: [
      {
        id: "canon-high",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Prime directive",
        content: "Canon outranks memory when continuity conflicts.",
        source_type: "manual",
        priority: 9,
        created_at: "2026-05-25T09:05:00.000Z",
        updated_at: "2026-05-25T09:05:00.000Z",
      },
      {
        id: "canon-low",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Secondary truth",
        content: "Use gentle language without losing specificity.",
        source_type: "manual",
        priority: 2,
        created_at: "2026-05-25T09:06:00.000Z",
        updated_at: "2026-05-25T09:06:00.000Z",
      },
      {
        id: "canon-other",
        persona_id: PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other canon",
        content: "Other user canon must not leak.",
        source_type: "manual",
        priority: 10,
        created_at: "2026-05-25T09:07:00.000Z",
        updated_at: "2026-05-25T09:07:00.000Z",
      },
    ],
    persona_files: [
      {
        id: "file-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        file_name: "source-notebook.md",
        file_type: "text/markdown",
        file_size: 1200,
        storage_path: "personas/harbor/source-notebook.md",
        source_type: "upload",
        processed: true,
        created_at: "2026-05-25T09:13:00.000Z",
      },
    ],
    import_jobs: [
      {
        id: "import-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        kind: "chat",
        status: "completed",
        source_name: "old-chat-export.txt",
        error_message: null,
        created_at: "2026-05-25T09:14:00.000Z",
        updated_at: "2026-05-25T09:14:00.000Z",
      },
    ],
    calibration_sessions: [
      {
        id: "integrity-1",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        session_title: "Harbor integrity pass",
        transcript: "Owner describes tone and boundaries.",
        extracted_style_notes: "Stay steady under ambiguity.",
        extracted_public_rules: "Keep public replies bounded and non-confessional.",
        extracted_private_rules: "Name private continuity when the owner asks directly.",
        extracted_uncertainty_rules: "Ask for the missing anchor before inventing one.",
        save_target: "persona",
        created_at: "2026-05-25T09:15:00.000Z",
        updated_at: "2026-05-25T09:16:00.000Z",
      },
    ],
    conversations: [],
    conversation_messages: [],
  };

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
    rpc: async () => ({ data: null, error: { message: "No vector RPC in tests." } }),
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private selectedColumns = "*";
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;

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
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.insertRow(payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = "2026-05-25T10:30:00.000Z";
      }
    } else {
      rows = this.matchingRows();
    }

    rows = this.withRequestedJoins(rows);
    const data = clone(rows);

    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: null };
    }

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }

    return { data, error: null };
  }

  private insertRow(payload: Row | null) {
    const row = {
      id: `${this.table}-${this.db.rows(this.table).length + 1}`,
      created_at: "2026-05-25T10:30:00.000Z",
      updated_at: "2026-05-25T10:30:00.000Z",
      ...(payload ?? {}),
    };
    this.db.rows(this.table).push(row);
    return row;
  }

  private withRequestedJoins(rows: Row[]) {
    if (this.table !== "memory_items" || !this.selectedColumns.includes("memory_item_lifecycle")) {
      return rows;
    }

    return rows.map((row) => ({
      ...row,
      memory_item_lifecycle: this.db.rows("memory_item_lifecycle")
        .filter((lifecycle) => lifecycle.memory_item_id === row.id && lifecycle.owner_user_id === row.owner_user_id),
    }));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createPersonaContextApp() {
  const [{ conversationsRouter }, { memoryRouter }] = await Promise.all([
    import("./conversations.js"),
    import("./memory.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use("/conversations", conversationsRouter);
  app.use("/memory", memoryRouter);
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

test("persona runtime context is owner-only and orders canon ahead of memory", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaContextApp();

  try {
    const visitor = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=harbor%20ritual`);
    assert.equal(visitor.status, 401);

    const otherUser = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=harbor%20ritual`, {
      token: "other-token",
    });
    assert.equal(otherUser.status, 403);

    const owner = await requestJson(app, "GET", `/conversations/persona/${PERSONA_ID}/context-preview?query=harbor%20ritual`, {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);

    const context = owner.body.context;
    assert.deepEqual(context.counts, {
      canon: 2,
      memory: 3,
      integrity: 2,
      archive: 2,
    });

    assert.equal(context.sources[0].id, "canon-high");
    assert.equal(context.sources[1].id, "canon-low");
    assert.equal(context.sources.findIndex((source: Row) => source.type === "canon") < context.sources.findIndex((source: Row) => source.type === "memory"), true);
    assert.match(context.systemPrompt, /Canon outranks memory when continuity conflicts/);
    assert.match(context.systemPrompt, /USER PREFERENCE PROFILE/);
    assert.match(context.systemPrompt, /Shared owner memory says careful recall beats novelty/);
    assert.match(context.systemPrompt, /The morning ritual is private continuity context/);
    assert.match(context.systemPrompt, /Current nickname: Harbor Light/);
    assert.match(context.systemPrompt, /Stay steady under ambiguity/);
    assert.match(context.systemPrompt, /source-notebook\.md/);
    assert.doesNotMatch(context.systemPrompt, /Quarantined memory must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Rejected memory must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Expired memory must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Old nickname must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Rejected owner memory block must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Other owner memory block must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Other user private note must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Other user canon must not leak/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("persona memory briefing is owner-only and reports lifecycle filtering", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaContextApp();

  try {
    const visitor = await requestJson(app, "GET", `/memory/persona/${PERSONA_ID}/briefing`);
    assert.equal(visitor.status, 401);

    const otherUser = await requestJson(app, "GET", `/memory/persona/${PERSONA_ID}/briefing`, {
      token: "other-token",
    });
    assert.equal(otherUser.status, 404);

    const owner = await requestJson(app, "GET", `/memory/persona/${PERSONA_ID}/briefing`, {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.deepEqual(owner.body.briefing.activeMemories.map((memory: Row) => memory.id).sort(), [MEMORY_REPLACEMENT_ID, "memory-1"].sort());
    assert.deepEqual(owner.body.briefing.lifecycleCounts, {
      active: 2,
      quarantined: 1,
      rejected: 1,
      expired: 1,
      superseded: 1,
    });
    assert.deepEqual(owner.body.briefing.sharedBlocks.map((block: Row) => block.id), ["owner-block-1"]);
    assert.equal(owner.body.briefing.edgeCounts.supersedes, 1);
    assert.doesNotMatch(JSON.stringify(owner.body), /Other owner memory block must not leak/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("memory lifecycle updates are owner-only and validate supersession targets", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaContextApp();

  try {
    const otherUser = await requestJson(app, "PATCH", "/memory/memory-1/lifecycle", {
      token: "other-token",
      body: { status: "rejected" },
    });
    assert.equal(otherUser.status, 404);

    const badSupersession = await requestJson(app, "PATCH", "/memory/memory-1/lifecycle", {
      token: "owner-token",
      body: {
        status: "superseded",
        supersededByMemoryItemId: OTHER_MEMORY_ID,
      },
    });
    assert.equal(badSupersession.status, 404);

    const updated = await requestJson(app, "PATCH", "/memory/memory-1/lifecycle", {
      token: "owner-token",
      body: {
        status: "superseded",
        supersededByMemoryItemId: MEMORY_REPLACEMENT_ID,
        evidence: [{ source: "owner_review", note: "Replacement is current." }],
        reinforce: true,
      },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.lifecycle.status, "superseded");
    assert.equal(updated.body.lifecycle.supersededByMemoryItemId, MEMORY_REPLACEMENT_ID);
    assert.equal(updated.body.lifecycle.reinforcementCount, 1);
    assert.deepEqual(updated.body.lifecycle.evidence, [{ source: "owner_review", note: "Replacement is current." }]);
    assert.equal(db.tables.persona_lifecycle_events.some((event) => event.event_type === "memory_graph_update"), true);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

function lifecycleRow(
  memoryItemId: string,
  status: string,
  overrides: Row = {}
) {
  return {
    memory_item_id: memoryItemId,
    owner_user_id: overrides.owner_user_id ?? OWNER_ID,
    persona_id: PERSONA_ID,
    trust_level: "user_stated",
    status,
    confidence: 1,
    decay_rate: 0,
    reinforcement_count: 0,
    last_reinforced_at: null,
    expires_at: null,
    superseded_by_memory_item_id: null,
    evidence: [],
    created_at: "2026-05-25T09:30:00.000Z",
    updated_at: "2026-05-25T09:30:00.000Z",
    ...overrides,
  };
}
