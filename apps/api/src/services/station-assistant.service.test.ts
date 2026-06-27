import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { composeStationAssistantReply, type StationAssistantSummary } from "./station-assistant.service";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { assistantRouter } from "../routes/assistant";
import { importsRouter } from "../routes/imports";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

const summary: StationAssistantSummary = {
  counts: {
    personas: 2,
    activeConversations: 1,
    archivedConversations: 3,
    memoryItems: 11,
    canonItems: 4,
    pendingContinuityCandidates: 2,
    draftDocuments: 1,
    publishedDocuments: 5,
    pendingImports: 1,
    failedImports: 1,
    spaces: 0,
    developerSpaces: 1,
    exportPackages: 0,
  },
  recent: {
    personas: [{ id: "33333333-3333-4333-8333-333333333333", name: "Harbor", visibility: "private" }],
    imports: [{ id: "import-1", sourceName: "claude-export.json", status: "failed" }],
    documents: [{ id: "doc-1", title: "Field log", status: "draft", documentType: "field_log" }],
  },
  nextActions: [
    {
      id: "import-review-33333333-3333-4333-8333-333333333333",
      kind: "import_review",
      label: "Review Memory/Canon candidates",
      detail: "2 imported candidates need owner review.",
      href: "/studio/personas/33333333-3333-4333-8333-333333333333/files",
      priority: "critical",
      count: 2,
      status: "pending",
    },
    {
      id: "review-failed-import",
      kind: "import_issue",
      label: "Fix failed imports",
      detail: "One failed import needs review.",
      href: "/studio/archive",
      priority: "critical",
      status: "failed",
    },
  ],
};

test("Station Assistant routes archive requests to archive/import actions", () => {
  const reply = composeStationAssistantReply("help me import a ChatGPT archive", summary);

  assert.equal(reply.role, "assistant");
  assert.equal(reply.intent, "archive");
  assert.match(reply.content, /Archive next step/);
  assert.equal(reply.actions[0].kind, "import_review");
  assert.match(reply.guardrail, /operational only/);
});

test("Station Assistant keeps publishing behind human review and provenance", () => {
  const reply = composeStationAssistantReply("publish this codex", summary);

  assert.equal(reply.intent, "publish");
  assert.match(reply.content, /provenance/);
  assert.match(reply.content, /owner review/);
  assert.match(reply.content, /linked discussion readback/);
  assert.match(reply.content, /retract to private/);
  assert.match(reply.content, /does not delete artifacts/);
  assert.equal(reply.actions[0].href, "/studio/publishing");
  assert.doesNotMatch(reply.content, /cleanup/i);
});

test("Station Assistant does not present itself as a persona", () => {
  const reply = composeStationAssistantReply("what should I do next?", summary);

  assert.doesNotMatch(reply.content, /my canon/i);
  assert.match(reply.guardrail, /no persona canon/);
});

test("launch-core private routes require auth and scope assistant summary to the owner", async () => {
  const db = new LaunchCoreRouteDb();
  setSupabaseAdminForTests(db.client as any);
  const app = createLaunchCoreApp();

  try {
    const unauthenticated = await requestJson(app, "GET", "/assistant/summary");
    assert.equal(unauthenticated.status, 401);

    const owner = await requestJson(app, "GET", "/assistant/summary", { token: "owner-token" });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.summary.counts.personas, 1);
    assert.equal(owner.body.summary.counts.memoryItems, 1);
    assert.equal(owner.body.summary.recent.personas[0].id, OWNER_ID_PERSONA);
    assert.equal(owner.body.summary.nextActions.some((action: any) => action.kind === "import_review"), true);
    assert.equal(
      owner.body.summary.nextActions.some((action: any) => action.href === `/studio/personas/${OWNER_ID_PERSONA}/files`),
      true
    );
    assert.equal(owner.body.summary.nextActions.some((action: any) => action.kind === "publishing"), true);
    const publishingAction = owner.body.summary.nextActions.find((action: any) => action.kind === "publishing");
    assert.match(publishingAction.detail, /linked discussion readback/);
    assert.match(publishingAction.detail, /Retract hides/i);
    assert.doesNotMatch(publishingAction.detail, /delete artifacts as cleanup/i);
    assert.equal(owner.body.summary.nextActions.some((action: any) => action.kind === "export"), true);
    assert.equal(JSON.stringify(owner.body.summary).includes("sk-live-secret"), false);
    assert.equal(JSON.stringify(owner.body.summary).includes("private/path/owner-chatgpt.json"), false);
    assert.equal(JSON.stringify(owner.body.summary).includes(OTHER_ID_PERSONA), false);

    const ownerContext = await requestJson(app, "GET", "/assistant/context", { token: "owner-token" });
    assert.equal(ownerContext.status, 200);
    const ownerContextJson = JSON.stringify(ownerContext.body.assistant);
    assert.equal(ownerContextJson.includes("sk-live-secret"), false);
    assert.equal(ownerContextJson.includes("private/path/owner-chatgpt.json"), false);
    assert.equal(ownerContextJson.includes(OTHER_ID_PERSONA), false);
    assert.equal(ownerContext.body.assistant.recent.imports[0].sourceName, "Untitled import");
    assert.equal(ownerContext.body.assistant.recent.imports[0].errorMessage, "storage [redacted] failed");
    assert.equal(ownerContext.body.assistant.nextActions[0].id, "review-failed-import");
    assert.match(ownerContext.body.assistant.nextActions[0].detail, /One import failed/);
    assert.match(ownerContext.body.assistant.nextActions[0].detail, /\[redacted\]/);

    const other = await requestJson(app, "GET", "/assistant/summary", { token: "other-token" });
    assert.equal(other.status, 200);
    assert.equal(other.body.summary.counts.personas, 1);
    assert.equal(other.body.summary.recent.personas[0].id, OTHER_ID_PERSONA);
    assert.equal(
      other.body.summary.recent.personas.some((persona: any) => persona.id === OWNER_ID_PERSONA),
      false
    );
    assert.equal(JSON.stringify(other.body.summary).includes(OWNER_IMPORT_ID), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("launch-core private archive route requires auth and excludes other users rows", async () => {
  const db = new LaunchCoreRouteDb();
  setSupabaseAdminForTests(db.client as any);
  const app = createLaunchCoreApp();

  try {
    const unauthenticated = await requestJson(app, "GET", "/imports/archive");
    assert.equal(unauthenticated.status, 401);

    const owner = await requestJson(app, "GET", "/imports/archive", { token: "owner-token" });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.items.some((item: any) => item.id === OWNER_MEMORY_ID), true);
    assert.equal(owner.body.items.some((item: any) => item.id === OTHER_MEMORY_ID), false);
    assert.equal(owner.body.items.some((item: any) => item.id === OWNER_IMPORT_ID), true);
    assert.equal(owner.body.items.some((item: any) => item.id === OTHER_IMPORT_ID), false);

    const other = await requestJson(app, "GET", "/imports/archive", { token: "other-token" });
    assert.equal(other.status, 200);
    assert.equal(other.body.items.some((item: any) => item.id === OTHER_MEMORY_ID), true);
    assert.equal(other.body.items.some((item: any) => item.id === OWNER_MEMORY_ID), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const OWNER_ID_PERSONA = "33333333-3333-4333-8333-333333333333";
const OTHER_ID_PERSONA = "44444444-4444-4444-8444-444444444444";
const OWNER_MEMORY_ID = "55555555-5555-4555-8555-555555555555";
const OTHER_MEMORY_ID = "66666666-6666-4666-8666-666666666666";
const OWNER_IMPORT_ID = "77777777-7777-4777-8777-777777777777";
const OTHER_IMPORT_ID = "88888888-8888-4888-8888-888888888888";

class LaunchCoreRouteDb {
  tables: Record<string, any[]> = {
    profiles: [
      { id: OWNER_ID, tier: "creator", is_admin: false },
      { id: OTHER_ID, tier: "creator", is_admin: false },
    ],
    personas: [
      { id: OWNER_ID_PERSONA, owner_user_id: OWNER_ID, name: "Owner Persona", visibility: "private", updated_at: "2026-06-16T10:00:00.000Z", created_at: "2026-06-16T09:00:00.000Z" },
      { id: OTHER_ID_PERSONA, owner_user_id: OTHER_ID, name: "Other Persona", visibility: "private", updated_at: "2026-06-16T10:00:00.000Z", created_at: "2026-06-16T09:00:00.000Z" },
    ],
    import_jobs: [
      { id: OWNER_IMPORT_ID, owner_user_id: OWNER_ID, persona_id: OWNER_ID_PERSONA, kind: "chat", status: "failed", source_name: "private/path/owner-chatgpt.json", error_message: "storage token=sk-live-secret failed", updated_at: "2026-06-16T10:04:00.000Z", created_at: "2026-06-16T10:03:00.000Z" },
      { id: OTHER_IMPORT_ID, owner_user_id: OTHER_ID, persona_id: OTHER_ID_PERSONA, kind: "chat", status: "completed", source_name: "other archive", error_message: null, updated_at: "2026-06-16T10:04:00.000Z", created_at: "2026-06-16T10:03:00.000Z" },
    ],
    documents: [
      { id: "99999999-9999-4999-8999-999999999999", author_user_id: OWNER_ID, persona_id: OWNER_ID_PERSONA, title: "Owner Draft", document_type: "codex", status: "draft", visibility: "private", updated_at: "2026-06-16T10:02:00.000Z", created_at: "2026-06-16T10:01:00.000Z", published_at: null },
      { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", author_user_id: OTHER_ID, persona_id: OTHER_ID_PERSONA, title: "Other Draft", document_type: "codex", status: "draft", visibility: "private", updated_at: "2026-06-16T10:02:00.000Z", created_at: "2026-06-16T10:01:00.000Z", published_at: null },
    ],
    integrity_sessions: [],
    memory_items: [
      { id: OWNER_MEMORY_ID, owner_user_id: OWNER_ID, persona_id: OWNER_ID_PERSONA, title: "Owner memory", summary: "Owner memory summary", content: "Owner memory content", source_type: "manual", archive_source_type: null, archive_source_name: null, created_at: "2026-06-16T10:05:00.000Z" },
      { id: OTHER_MEMORY_ID, owner_user_id: OTHER_ID, persona_id: OTHER_ID_PERSONA, title: "Other memory", summary: "Other memory summary", content: "Other memory content", source_type: "manual", archive_source_type: null, archive_source_name: null, created_at: "2026-06-16T10:05:00.000Z" },
    ],
    canon_items: [],
    conversations: [],
    archived_chat_transcripts: [],
    continuity_candidates: [
      { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", owner_user_id: OWNER_ID, persona_id: OWNER_ID_PERSONA, candidate_type: "memory", status: "pending", source_table: "persona_files", source_label: "private/path/owner-chatgpt.json", created_at: "2026-06-16T10:06:00.000Z" },
      { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", owner_user_id: OTHER_ID, persona_id: OTHER_ID_PERSONA, candidate_type: "memory", status: "pending", source_table: "persona_files", source_label: "other.json", created_at: "2026-06-16T10:06:00.000Z" },
    ],
    spaces: [],
    developer_spaces: [],
    export_packages: [],
    persona_files: [],
  };

  usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["other-token", { id: OTHER_ID, email: "other@example.test" }],
  ]);

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token);
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => new LaunchCoreQuery(this, table),
  };

  rows(table: string) {
    return this.tables[table] ?? [];
  }
}

class LaunchCoreQuery {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;

  constructor(private db: LaunchCoreRouteDb, private table: string) {}

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
    const rows = this.matchingRows();
    return Promise.resolve(
      rows.length === 1
        ? { data: clone(rows[0]), error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }

  then(onfulfilled: any, onrejected: any) {
    return Promise.resolve({ data: clone(this.matchingRows()), error: null }).then(onfulfilled, onrejected);
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
}

function createLaunchCoreApp() {
  const app = express();
  app.use(express.json());
  app.use("/assistant", assistantRouter);
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
