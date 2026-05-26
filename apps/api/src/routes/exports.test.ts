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

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_PERSONA_ID = "44444444-4444-4444-8444-444444444444";
const SPACE_ID = "55555555-5555-4555-8555-555555555555";
const DOC_ID = "66666666-6666-4666-8666-666666666666";
const PRIVATE_DOC_ID = "77777777-7777-4777-8777-777777777777";
const THREAD_ID = "88888888-8888-4888-8888-888888888888";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        username: "owner",
        display_name: "Owner",
        avatar_url: null,
        tier: "creator",
        is_admin: false,
      },
      {
        id: OTHER_ID,
        email: "other@example.test",
        username: "other",
        display_name: "Other",
        avatar_url: null,
        tier: "creator",
        is_admin: false,
      },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "Continuity keeper.",
        long_description: "Private long-form continuity brief.",
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Wake with durable context.",
        style_notes: "Careful, direct, steady.",
        sort_order: 0,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
      {
        id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        name: "Other",
        short_description: null,
        long_description: null,
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: null,
        style_notes: null,
        sort_order: 0,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
    ],
    spaces: [
      {
        id: SPACE_ID,
        owner_user_id: OWNER_ID,
        slug: "harbor-space",
        title: "Harbor Space",
        short_description: null,
        long_description: null,
        theme: null,
        is_public: true,
        comments_default_enabled: true,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
    ],
    memory_items: [
      {
        id: "memory-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Anchor memory",
        content: "Harbor remembers the owner values grounded continuity.",
        summary: "A stable private memory.",
        source_type: "manual",
        relevance_weight: 2,
        embedding: null,
        created_at: "2026-05-26T09:01:00.000Z",
        updated_at: "2026-05-26T09:01:00.000Z",
      },
      {
        id: "memory-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other memory",
        content: "Other owner memory must not leak.",
        summary: null,
        source_type: "manual",
        relevance_weight: 1,
        embedding: null,
        created_at: "2026-05-26T09:01:00.000Z",
        updated_at: "2026-05-26T09:01:00.000Z",
      },
    ],
    canon_items: [
      {
        id: "canon-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Core rule",
        content: "Preserve continuity before novelty.",
        source_type: "manual",
        priority: 8,
        created_at: "2026-05-26T09:02:00.000Z",
        updated_at: "2026-05-26T09:02:00.000Z",
      },
    ],
    persona_files: [
      {
        id: "file-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        file_name: "source-notebook.md",
        file_type: "text/markdown",
        file_size: 2048,
        storage_path: "private/source-notebook.md",
        source_type: "upload",
        processed: true,
        created_at: "2026-05-26T09:03:00.000Z",
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
        created_at: "2026-05-26T09:04:00.000Z",
        updated_at: "2026-05-26T09:04:00.000Z",
      },
    ],
    archived_chat_transcripts: [
      {
        id: "transcript-1",
        conversation_id: "conversation-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Harbor working chat",
        transcript_markdown: "# Harbor working chat\n\nPrivate transcript text.",
        message_count: 4,
        source_summary: "user: Preserve continuity before novelty.",
        created_at: "2026-05-26T09:04:30.000Z",
        updated_at: "2026-05-26T09:04:30.000Z",
      },
      {
        id: "transcript-other",
        conversation_id: "conversation-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other private chat",
        transcript_markdown: "# Other private chat",
        message_count: 2,
        source_summary: "Other owner transcript must not leak.",
        created_at: "2026-05-26T09:04:30.000Z",
        updated_at: "2026-05-26T09:04:30.000Z",
      },
    ],
    continuity_candidates: [
      {
        id: "candidate-1",
        archived_chat_transcript_id: "transcript-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        candidate_type: "memory",
        title: "Archive boundary memory",
        content: "Harbor asks before turning private grief into public material.",
        rationale: "Generated from archived chat.",
        status: "accepted",
        source_message_ids: ["55555555-5555-4555-8555-555555555555"],
        accepted_target_type: "memory",
        accepted_target_id: "memory-1",
        accepted_at: "2026-05-26T09:04:45.000Z",
        created_at: "2026-05-26T09:04:35.000Z",
        updated_at: "2026-05-26T09:04:45.000Z",
      },
      {
        id: "candidate-other",
        archived_chat_transcript_id: "transcript-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        candidate_type: "memory",
        title: "Other candidate",
        content: "Other owner candidate must not leak.",
        rationale: null,
        status: "pending",
        source_message_ids: [],
        accepted_target_type: null,
        accepted_target_id: null,
        accepted_at: null,
        created_at: "2026-05-26T09:04:35.000Z",
        updated_at: "2026-05-26T09:04:35.000Z",
      },
    ],
    calibration_sessions: [
      {
        id: "integrity-1",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        session_title: "Harbor integrity pass",
        transcript: "Private transcript is owner exportable.",
        extracted_style_notes: "Speak steadily.",
        extracted_public_rules: "Keep public claims bounded.",
        extracted_private_rules: "Private rules remain owner-only.",
        extracted_uncertainty_rules: "Name uncertainty.",
        save_target: "persona",
        created_at: "2026-05-26T09:05:00.000Z",
        updated_at: "2026-05-26T09:05:00.000Z",
      },
    ],
    documents: [
      {
        id: DOC_ID,
        author_user_id: OWNER_ID,
        space_id: SPACE_ID,
        persona_id: PERSONA_ID,
        title: "Published Continuity Note",
        slug: "published-continuity-note",
        body: "Public copy body is not required for export refs.",
        document_type: "essay",
        status: "published",
        visibility: "public",
        comments_enabled: true,
        published_at: "2026-05-26T09:06:00.000Z",
        provenance_type: "persona_derived",
        source_type: "canon",
        source_id: "canon-1",
        source_label: "Canon / priority 8",
        source_persona_id: PERSONA_ID,
        discussion_thread_id: THREAD_ID,
        created_at: "2026-05-26T09:06:00.000Z",
        updated_at: "2026-05-26T09:06:00.000Z",
      },
      {
        id: PRIVATE_DOC_ID,
        author_user_id: OWNER_ID,
        space_id: SPACE_ID,
        persona_id: PERSONA_ID,
        title: "Private Draft",
        slug: "private-draft",
        body: "This private draft should not appear in published refs.",
        document_type: "essay",
        status: "draft",
        visibility: "private",
        comments_enabled: true,
        published_at: null,
        provenance_type: "user_authored",
        source_type: "manual",
        source_id: null,
        source_label: "Manual document",
        source_persona_id: PERSONA_ID,
        discussion_thread_id: null,
        created_at: "2026-05-26T09:07:00.000Z",
        updated_at: "2026-05-26T09:07:00.000Z",
      },
    ],
    threads: [
      {
        id: THREAD_ID,
        category_id: "category-1",
        author_user_id: OWNER_ID,
        linked_space_id: SPACE_ID,
        linked_persona_id: PERSONA_ID,
        linked_document_id: DOC_ID,
        title: "Discuss: Published Continuity Note",
        body: "Thread body.",
        status: "active",
        visibility: "public",
        is_pinned: false,
        is_hidden: false,
        reported_count: 1,
        score: 0,
        comment_count: 4,
        created_at: "2026-05-26T09:08:00.000Z",
        updated_at: "2026-05-26T09:08:00.000Z",
      },
    ],
    comments: [
      commentRow("comment-visible", OTHER_ID, "Visible community response.", "active", false),
      commentRow("comment-hidden-other", OTHER_ID, "Hidden other-user moderation note must not leak.", "active", true),
      commentRow("comment-removed-other", OTHER_ID, "Removed other-user comment must not leak.", "removed", false),
      commentRow("comment-hidden-owner", OWNER_ID, "Owner-authored hidden note stays in owner export.", "removed", true),
    ],
    export_packages: [],
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

    if (table === "export_packages") {
      row.package_kind ??= "persona_archive";
      row.status ??= "completed";
      row.format ??= "json_markdown";
      row.included_sections ??= [];
      row.manifest_json ??= {};
      row.manifest_markdown ??= "";
      row.content_summary ??= {};
      row.error_message ??= null;
      row.requested_at ??= now;
      row.completed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
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

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
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
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function commentRow(id: string, authorUserId: string, body: string, status: string, isHidden: boolean): Row {
  return {
    id,
    author_user_id: authorUserId,
    parent_type: "thread",
    parent_id: THREAD_ID,
    body,
    status,
    is_pinned: false,
    is_hidden: isHidden,
    reported_count: 0,
    score: 0,
    created_at: "2026-05-26T09:09:00.000Z",
    updated_at: "2026-05-26T09:09:00.000Z",
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createExportsApp() {
  const { exportsRouter } = await import("./exports.js");
  const app = express();
  app.use(express.json());
  app.use("/exports", exportsRouter);
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

test("owner can export persona archive while preserving provenance and privacy boundaries", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    const blocked = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "other-token",
    });
    assert.equal(blocked.status, 404);

    const created = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.exportPackage.status, "completed");
    assert.equal(created.body.manifest.schema, "station.persona.export.v1");
    assert.equal(created.body.manifest.persona.name, "Harbor");
    assert.equal(created.body.manifest.counts.memory, 1);
    assert.equal(created.body.manifest.counts.canon, 1);
    assert.equal(created.body.manifest.counts.archiveFiles, 1);
    assert.equal(created.body.manifest.counts.archiveImports, 1);
    assert.equal(created.body.manifest.counts.archivedChats, 1);
    assert.equal(created.body.manifest.counts.continuityCandidates, 1);
    assert.equal(created.body.manifest.counts.integritySessions, 1);
    assert.equal(created.body.manifest.counts.publishedDocuments, 1);
    assert.equal(created.body.manifest.trust.provenancePreserved, true);
    assert.equal(created.body.manifest.trust.sourceRowsRemainPrivate, true);

    const manifestText = JSON.stringify(created.body.manifest);
    assert.match(manifestText, /Harbor remembers the owner values grounded continuity/);
    assert.match(manifestText, /Preserve continuity before novelty/);
    assert.match(manifestText, /private\/source-notebook\.md/);
    assert.match(manifestText, /Harbor working chat/);
    assert.match(manifestText, /Archive boundary memory/);
    assert.match(manifestText, /Private transcript is owner exportable/);
    assert.doesNotMatch(manifestText, /Other owner memory must not leak/);
    assert.doesNotMatch(manifestText, /Other owner transcript must not leak/);
    assert.doesNotMatch(manifestText, /Other owner candidate must not leak/);
    assert.doesNotMatch(manifestText, /Private Draft/);

    const documentRef = created.body.manifest.publishedDocumentRefs[0];
    assert.equal(documentRef.provenanceType, "persona_derived");
    assert.equal(documentRef.sourceType, "canon");
    assert.equal(documentRef.sourceLabel, "Canon / priority 8");
    assert.equal(documentRef.visibility, "public");

    const exportedComments = documentRef.discussion.comments.map((comment: Row) => comment.body);
    assert.deepEqual(exportedComments.sort(), [
      "Owner-authored hidden note stays in owner export.",
      "Visible community response.",
    ].sort());
    assert.equal(
      exportedComments.some((body: string) => body.includes("Hidden other-user")),
      false
    );
    assert.equal(
      exportedComments.some((body: string) => body.includes("Removed other-user")),
      false
    );

    const listed = await requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports.length, 1);
    assert.equal(listed.body.exports[0].contentSummary.discussionComments, 2);

    const readBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.match(readBack.body.manifestMarkdown, /Station Export: Harbor/);
    assert.match(readBack.body.manifestMarkdown, /Provenance preserved: yes/);

    const blockedRead = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "other-token",
    });
    assert.equal(blockedRead.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
