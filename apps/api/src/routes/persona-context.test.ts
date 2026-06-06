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
        content: "Harbor slows down before hard advice.",
        summary: "Pause before hard advice.",
        source_type: "chat",
        relevance_weight: 2,
        created_at: "2026-05-25T09:11:00.000Z",
        updated_at: "2026-05-25T09:11:00.000Z",
      },
      {
        id: "memory-other",
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
    const data = clone(this.matchingRows());

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }

    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createPersonaContextApp() {
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
      memory: 2,
      integrity: 2,
      archive: 2,
    });

    assert.equal(context.sources[0].id, "canon-high");
    assert.equal(context.sources[1].id, "canon-low");
    assert.equal(context.sources.findIndex((source: Row) => source.type === "canon") < context.sources.findIndex((source: Row) => source.type === "memory"), true);
    assert.match(context.systemPrompt, /Canon outranks memory when continuity conflicts/);
    assert.match(context.systemPrompt, /USER PREFERENCE PROFILE/);
    assert.match(context.systemPrompt, /The morning ritual is private continuity context/);
    assert.match(context.systemPrompt, /Stay steady under ambiguity/);
    assert.match(context.systemPrompt, /source-notebook\.md/);
    assert.doesNotMatch(context.systemPrompt, /Other user private note must not leak/);
    assert.doesNotMatch(context.systemPrompt, /Other user canon must not leak/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
