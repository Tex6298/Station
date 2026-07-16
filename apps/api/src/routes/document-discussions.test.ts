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
const MEMBER_ID = "22222222-2222-4222-8222-222222222222";
const ADMIN_ID = "22222222-2222-4222-8222-222222222223";
const VISITOR_ID = "22222222-2222-4222-8222-222222222224";
const SPACE_ID = "33333333-3333-4333-8333-333333333333";
const PUBLIC_DOC_ID = "44444444-4444-4444-8444-444444444444";
const COMMUNITY_DOC_ID = "55555555-5555-4555-8555-555555555555";
const UNLISTED_DOC_ID = "66666666-6666-4666-8666-666666666666";
const PRIVATE_DOC_ID = "77777777-7777-4777-8777-777777777777";

class InMemorySupabase {
  missingThreadAuthorshipColumns = false;
  operationErrors = new Map<string, { code?: string; message: string; details?: string }>();

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        username: "owner",
        display_name: "Owner",
        avatar_url: null,
        bio: null,
        tier: "creator",
        is_admin: false,
      },
      {
        id: MEMBER_ID,
        email: "member@example.test",
        username: "member",
        display_name: "Member",
        avatar_url: null,
        bio: null,
        tier: "private",
        is_admin: false,
      },
      {
        id: ADMIN_ID,
        email: "admin@example.test",
        username: "admin",
        display_name: "Admin",
        avatar_url: null,
        bio: null,
        tier: "creator",
        is_admin: true,
      },
      {
        id: VISITOR_ID,
        email: "visitor@example.test",
        username: "visitor",
        display_name: "Visitor",
        avatar_url: null,
        bio: null,
        tier: "visitor",
        is_admin: false,
      },
    ],
    spaces: [
      {
        id: SPACE_ID,
        owner_user_id: OWNER_ID,
        slug: "field-notes",
        title: "Field Notes",
        short_description: "Published continuity field notes.",
        long_description: null,
        theme: null,
        is_public: true,
        comments_default_enabled: true,
        created_at: "2026-05-25T09:00:00.000Z",
        updated_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    space_pages: [],
    personas: [],
    documents: [
      documentRow(PUBLIC_DOC_ID, "Public Field Log", "public-field-log", "public"),
      documentRow(COMMUNITY_DOC_ID, "Community Field Log", "community-field-log", "community"),
      documentRow(UNLISTED_DOC_ID, "Unlisted Field Log", "unlisted-field-log", "unlisted"),
      documentRow(PRIVATE_DOC_ID, "Private Source Note", "private-source-note", "private"),
    ],
    forum_categories: [],
    threads: [],
    comments: [],
    discover_feed: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T10:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["member-token", { id: MEMBER_ID, email: "member@example.test" }],
    ["admin-token", { id: ADMIN_ID, email: "admin@example.test" }],
    ["visitor-token", { id: VISITOR_ID, email: "visitor@example.test" }],
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
    rpc: async (name: string, params: Row) => {
      if (name === "increment_thread_comment_count") {
        const thread = this.rows("threads").find((row) => row.id === params.thread_id);
        if (thread) thread.comment_count = (thread.comment_count ?? 0) + 1;
      }
      return { data: null, error: null };
    },
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

  relatedRow(table: string, row: Row, columns: string | null) {
    const copy = { ...row };
    if (!columns) return copy;

    if (columns.includes("author:profiles")) {
      const author = this.rows("profiles").find((candidate) => candidate.id === row.author_user_id);
      copy.author = author
        ? { username: author.username, display_name: author.display_name, avatar_url: author.avatar_url }
        : null;
    }

    if (table === "threads" && columns.includes("category:forum_categories")) {
      const category = this.rows("forum_categories").find((candidate) => candidate.id === row.category_id);
      copy.category = category ? { id: category.id, slug: category.slug, title: category.title } : null;
    }

    if (table === "threads" && columns.includes("document:documents")) {
      const document = this.rows("documents").find((candidate) => candidate.id === row.linked_document_id);
      const space = document
        ? this.rows("spaces").find((candidate) => candidate.id === document.space_id)
        : null;
      copy.document = document
        ? {
            id: document.id,
            title: document.title,
            provenance_type: document.provenance_type,
            source_type: document.source_type,
            source_persona_id: document.source_persona_id,
            space: space ? { slug: space.slug } : null,
          }
        : null;
    }

    if (table === "documents" && columns.includes("space:spaces")) {
      const space = this.rows("spaces").find((candidate) => candidate.id === row.space_id);
      copy.space = space ? { slug: space.slug, title: space.title } : null;
    }

    if (table === "documents" && columns.includes("persona:personas")) {
      copy.persona = null;
    }

    if (table === "space_pages" && columns.includes("space:spaces")) {
      const space = this.rows("spaces").find((candidate) => candidate.id === row.space_id);
      copy.space = space ? { id: space.id, is_public: space.is_public, owner_user_id: space.owner_user_id } : null;
    }

    return copy;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "documents") {
      row.body ??= "";
      row.status ??= "draft";
      row.visibility ??= "private";
      row.document_type ??= "essay";
      row.comments_enabled ??= true;
      row.published_at ??= null;
      row.provenance_type ??= "user_authored";
      row.source_type ??= "manual";
      row.source_id ??= null;
      row.source_label ??= null;
      row.source_persona_id ??= null;
      row.discussion_thread_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "forum_categories") {
      row.description ??= null;
      row.sort_order ??= 0;
      row.created_at ??= now;
    }

    if (table === "threads") {
      row.linked_space_id ??= null;
      row.linked_persona_id ??= null;
      row.linked_document_id ??= null;
      row.authorship_kind ??= "user_authored";
      row.authorship_source_type ??= null;
      row.authorship_source_id ??= null;
      row.authorship_persona_id ??= null;
      row.visibility ??= "public";
      row.status ??= "active";
      row.score ??= 0;
      row.comment_count ??= 0;
      row.is_pinned ??= false;
      row.is_hidden ??= false;
      row.reported_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "comments") {
      row.authorship_kind ??= "user_authored";
      row.authorship_source_type ??= null;
      row.authorship_source_id ??= null;
      row.authorship_persona_id ??= null;
      row.status ??= "active";
      row.score ??= 0;
      row.is_pinned ??= false;
      row.is_hidden ??= false;
      row.reported_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private ilikeFilters: Array<[string, string]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private rangeSpec: { from: number; to: number } | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private columns: string | null = null;
  private countRequested = false;
  private head = false;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.columns = columns;
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

  ilike(field: string, pattern: string) {
    this.ilikeFilters.push([field, pattern]);
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

  range(from: number, to: number) {
    this.rangeSpec = { from, to };
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

    for (const [field, pattern] of this.ilikeFilters) {
      const needle = pattern.replace(/%/g, "").toLowerCase();
      rows = rows.filter((row) => String(row[field] ?? "").toLowerCase().includes(needle));
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

    if (this.rangeSpec) rows = rows.slice(this.rangeSpec.from, this.rangeSpec.to + 1);
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    const operationErrorKey = `${this.operation}:${this.table}`;
    const operationError = this.db.operationErrors.get(operationErrorKey);
    if (operationError) {
      this.db.operationErrors.delete(operationErrorKey);
      return {
        data: mode === "single" || mode === "maybeSingle" || this.head ? null : [],
        error: operationError,
        count: null,
      };
    }

    let rows: Row[];
    if (
      this.operation === "select" &&
      this.table === "threads" &&
      this.db.missingThreadAuthorshipColumns &&
      /authorship_(kind|source_type|source_id|persona_id)/.test(this.columns ?? "")
    ) {
      return {
        data: null,
        error: {
          message: "Could not find the 'authorship_kind' column of 'threads' in the schema cache",
        },
        count: null,
      };
    }

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

    const projected = rows.map((row) => this.db.relatedRow(this.table, row, this.columns));
    const data = clone(projected);
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

function documentRow(id: string, title: string, slug: string, visibility: string): Row {
  return {
    id,
    author_user_id: OWNER_ID,
    space_id: SPACE_ID,
    persona_id: null,
    title,
    slug,
    body: `${title} body.`,
    document_type: "essay",
    status: "published",
    visibility,
    comments_enabled: true,
    published_at: "2026-05-25T09:10:00.000Z",
    provenance_type: "user_authored",
    source_type: "manual",
    source_id: null,
    source_label: "Manual document",
    source_persona_id: null,
    discussion_thread_id: null,
    created_at: "2026-05-25T09:10:00.000Z",
    updated_at: "2026-05-25T09:10:00.000Z",
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createDiscussionApp() {
  const [
    { documentsRouter },
    { threadsRouter },
    { commentsRouter },
    { discoverRouter },
    { forumsRouter },
    { spacesRouter },
  ] = await Promise.all([
    import("./documents.js"),
    import("./threads.js"),
    import("./comments.js"),
    import("./discover.js"),
    import("./forums.js"),
    import("./spaces.js"),
  ]);

  const app = express();
  app.use(express.json());
  app.use("/documents", documentsRouter);
  app.use("/threads", threadsRouter);
  app.use("/comments", commentsRouter);
  app.use("/discover", discoverRouter);
  app.use("/forums", forumsRouter);
  app.use("/spaces", spacesRouter);
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

const documentHiddenMarker = "private-" + "document-marker";
const documentBearerLabel = "Bear" + "er";
const documentUrl = `https://storage.example.test/documents/${documentHiddenMarker}`;
const documentToken = `document-token-${documentHiddenMarker}`;

function hostileDocumentError(operation: string) {
  return {
    code: "XX999",
    message: [
      `${operation} failed table=documents table=document_versions table=threads table=comments table=forum_categories`,
      `owner_user_id=${OWNER_ID} author_user_id=${OWNER_ID} persona_id=${documentHiddenMarker} space_id=${SPACE_ID}`,
      `document_id=${PUBLIC_DOC_ID} version_id=version-${documentHiddenMarker} source_id=source-${documentHiddenMarker}`,
      `discussion_thread_id=thread-${documentHiddenMarker}`,
      `private draft body ${documentHiddenMarker}`,
      `continuity source content ${documentHiddenMarker}`,
      `snapshot payload ${documentHiddenMarker}`,
      `cleanup internals ${documentHiddenMarker}`,
      `url=${documentUrl}`,
      `token=${documentToken}`,
      `${documentBearerLabel} abc.${documentHiddenMarker}.token`,
      `provider payload: private document content ${documentHiddenMarker}`,
      "SQL stack trace at documentRoute (/station/private/documents.ts:1:2)",
    ].join("; "),
    details: `document details ${documentHiddenMarker}`,
  };
}

function seedDocumentDiscussion(
  db: InMemorySupabase,
  documentId: string,
  options: { pointDocument?: boolean; thread?: Row } = {}
) {
  const document = db.rows("documents").find((row) => row.id === documentId);
  assert.ok(document);
  const category = db.rows("forum_categories").find((row) => row.slug === "documents-and-codexes")
    ?? db.insertRow("forum_categories", {
      slug: "documents-and-codexes",
      title: "Documents & Codexes",
    });
  const thread = db.insertRow("threads", {
    category_id: category.id,
    author_user_id: document.author_user_id,
    linked_space_id: document.space_id,
    linked_persona_id: document.persona_id,
    linked_document_id: document.id,
    title: `Discuss: ${document.title}`,
    body: `Discussion attached to ${document.title}.`,
    visibility: document.visibility === "members" ? "community" : document.visibility,
    status: "active",
    is_hidden: false,
    ...options.thread,
  });
  if (options.pointDocument !== false) document.discussion_thread_id = thread.id;
  return { document, thread };
}

function stableDiscussionFields(thread: Row) {
  const copy = clone(thread);
  delete copy.title;
  delete copy.body;
  delete copy.updated_at;
  return copy;
}

function assertSafeDocumentRouteError(body: unknown) {
  const text = JSON.stringify(body);
  for (const unsafe of [
    documentHiddenMarker,
    documentUrl,
    documentToken,
    documentBearerLabel,
    "table=documents",
    "table=document_versions",
    "table=threads",
    "table=comments",
    "table=forum_categories",
    "owner_user_id",
    "author_user_id",
    "persona_id",
    "space_id",
    "document_id",
    "version_id",
    "source_id",
    "discussion_thread_id",
    "private draft body",
    "continuity source content",
    "snapshot payload",
    "cleanup internals",
    "provider payload",
    "private document content",
    "SQL stack trace",
    "documentRoute",
  ]) {
    assert.equal(text.includes(unsafe), false, unsafe);
  }
}

function addDocumentCanonSource(db: InMemorySupabase) {
  db.insertRow("canon_items", {
    id: "88888888-8888-4888-8888-888888888888",
    persona_id: null,
    owner_user_id: OWNER_ID,
    title: "Public canon note",
    content: "Canon continuity source can become a public document.",
    source_type: "manual",
    priority: 7,
  });
  return "88888888-8888-4888-8888-888888888888";
}

test("document route errors return stable public copy without private details", async () => {
  async function expectRouteError(
    configure: (db: InMemorySupabase) => void,
    run: (app: Express, db: InMemorySupabase) => Promise<{ status: number; body: unknown }>,
    expectedBody: Row
  ) {
    const db = new InMemorySupabase();
    configure(db);
    setSupabaseAdminForTests(db.client as any);
    const app = await createDiscussionApp();

    try {
      const response = await run(app, db);
      assert.equal(response.status, 500);
      assert.deepEqual(response.body, expectedBody);
      assertSafeDocumentRouteError(response.body);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }

  await expectRouteError(
    (db) => db.operationErrors.set("select:documents", hostileDocumentError("document list")),
    (app) => requestJson(app, "GET", "/documents", { token: "owner-token" }),
    { error: "Could not load documents.", code: "document_list_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:document_versions", hostileDocumentError("version history")),
    (app) => requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/versions`, { token: "owner-token" }),
    { error: "Could not load document versions.", code: "document_versions_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("insert:documents", hostileDocumentError("document create")),
    (app) => requestJson(app, "POST", "/documents", {
      token: "owner-token",
      body: {
        spaceId: SPACE_ID,
        title: "New public field note",
        slug: "new-public-field-note",
        body: "Owner-authored public document.",
        visibility: "public",
      },
    }),
    { error: "Could not create document.", code: "document_create_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("insert:document_versions", hostileDocumentError("update snapshot")),
    (app) => requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { title: "Updated field log" },
    }),
    { error: "Could not capture document version.", code: "document_snapshot_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("update:documents", hostileDocumentError("document update")),
    (app) => requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { title: "Updated field log" },
    }),
    { error: "Could not update document.", code: "document_update_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("update:documents", hostileDocumentError("document publish")),
    (app) => requestJson(app, "POST", `/documents/${PRIVATE_DOC_ID}/publish`, {
      token: "owner-token",
      body: { visibility: "public" },
    }),
    { error: "Could not publish document.", code: "document_publish_failed" }
  );

  await expectRouteError(
    (db) => {
      addDocumentCanonSource(db);
      db.operationErrors.set("insert:documents", hostileDocumentError("continuity publish"));
    },
    (app, db) => requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "owner-token",
      body: {
        sourceType: "canon",
        sourceId: db.rows("canon_items")[0].id,
        spaceId: SPACE_ID,
        title: "Published continuity note",
        slug: "published-continuity-note",
        visibility: "public",
      },
    }),
    { error: "Could not publish continuity document.", code: "document_continuity_publish_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("insert:threads", hostileDocumentError("discussion create")),
    (app) => requestJson(app, "POST", `/documents/${PUBLIC_DOC_ID}/discussion`, { token: "owner-token" }),
    { error: "Could not create discussion thread.", code: "document_discussion_create_failed" }
  );

  await expectRouteError(
    (db) => {
      seedDocumentDiscussion(db, PUBLIC_DOC_ID);
      db.operationErrors.set("update:threads", hostileDocumentError("discussion update"));
    },
    (app) => requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: { title: "Updated discussion title" },
    }),
    { error: "Could not update discussion thread.", code: "document_discussion_update_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:threads", hostileDocumentError("discussion cleanup")),
    (app) => requestJson(app, "DELETE", `/documents/${PUBLIC_DOC_ID}`, { token: "owner-token" }),
    { error: "Could not clean up linked document discussion.", code: "document_discussion_cleanup_failed" }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("delete:documents", hostileDocumentError("document delete")),
    (app) => requestJson(app, "DELETE", `/documents/${PUBLIC_DOC_ID}`, { token: "owner-token" }),
    { error: "Could not delete document.", code: "document_delete_failed" }
  );
});

test("published document discussion readback recovers an existing linked thread when the document pointer is missing", async () => {
  const db = new InMemorySupabase();
  db.missingThreadAuthorshipColumns = true;
  const category = db.insertRow("forum_categories", {
    slug: "documents-and-codexes",
    title: "Documents & Codexes",
  });
  const linkedThread = db.insertRow("threads", {
    category_id: category.id,
    author_user_id: OWNER_ID,
    linked_space_id: SPACE_ID,
    linked_document_id: PUBLIC_DOC_ID,
    title: "Discuss: Public Field Log",
    body: "Discussion attached to the public replay document.",
    visibility: "public",
    status: "active",
    is_hidden: false,
    comment_count: 2,
  });
  setSupabaseAdminForTests(db.client as any);
  const app = await createDiscussionApp();

  try {
    const publicLink = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/discussion`);
    assert.equal(publicLink.status, 200);
    assert.equal(publicLink.body.eligible, true);
    assert.equal(publicLink.body.discussion.id, linkedThread.id);
    assert.equal(publicLink.body.discussion.linked_document_id, PUBLIC_DOC_ID);
    assert.equal(publicLink.body.discussion.category.slug, "documents-and-codexes");
    assert.deepEqual(publicLink.body.discussion.discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
      document_provenance_type: "user_authored",
      document_source_type: "manual",
      source_persona_id: null,
    });

    const hiddenThread = db.rows("threads").find((row) => row.id === linkedThread.id);
    if (hiddenThread) hiddenThread.is_hidden = true;

    const hiddenLink = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/discussion`);
    assert.equal(hiddenLink.status, 200);
    assert.equal(hiddenLink.body.eligible, true);
    assert.equal(hiddenLink.body.discussion, null);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner customizes one helper-created document discussion without linkage or moderation drift", async () => {
  const db = new InMemorySupabase();
  const document = db.rows("documents").find((row) => row.id === PUBLIC_DOC_ID)!;
  document.comments_enabled = false;
  setSupabaseAdminForTests(db.client as any);
  const app = await createDiscussionApp();

  try {
    const enabled = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { commentsEnabled: true },
    });
    assert.equal(enabled.status, 200);
    assert.equal(db.rows("threads").length, 1);
    const threadId = enabled.body.discussion.id;
    assert.equal(document.discussion_thread_id, threadId);

    const stored = db.rows("threads").find((row) => row.id === threadId)!;
    Object.assign(stored, {
      status: "locked",
      moderation_state: "reviewing",
      score: 7,
      comment_count: 3,
      vote_count: 4,
      hot_score: 8.05,
      is_pinned: true,
      reported_count: 2,
    });
    const stableBefore = stableDiscussionFields(stored);
    const pointerBefore = document.discussion_thread_id;

    const customized = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: {
        title: "  What belongs in continuity?  ",
        body: "  Share a principle for deciding what should remain durable.  ",
      },
    });
    assert.equal(customized.status, 200);
    assert.equal(customized.body.discussion.id, threadId);
    assert.equal(customized.body.discussion.title, "What belongs in continuity?");
    assert.equal(customized.body.discussion.body, "Share a principle for deciding what should remain durable.");
    assert.deepEqual(customized.body.discussion.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(db.rows("threads").length, 1);
    assert.equal(document.discussion_thread_id, pointerBefore);
    assert.deepEqual(stableDiscussionFields(stored), stableBefore);

    const discussionRead = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/discussion`);
    assert.equal(discussionRead.status, 200);
    assert.equal(discussionRead.body.discussion.id, threadId);
    assert.equal(discussionRead.body.discussion.title, "What belongs in continuity?");
    assert.equal(discussionRead.body.discussion.body, "Share a principle for deciding what should remain durable.");

    const threadRead = await requestJson(app, "GET", `/threads/${threadId}`);
    assert.equal(threadRead.status, 200);
    assert.equal(threadRead.body.thread.title, "What belongs in continuity?");
    assert.equal(threadRead.body.thread.body, "Share a principle for deciding what should remain durable.");

    const repeated = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: {
        title: "What belongs in continuity?",
        body: "Share a principle for deciding what should remain durable.",
      },
    });
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.discussion.id, threadId);
    assert.equal(db.rows("threads").length, 1);
    assert.deepEqual(stableDiscussionFields(stored), stableBefore);

    const titleOnly = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: { title: "A narrower continuity question" },
    });
    assert.equal(titleOnly.status, 200);
    assert.equal(titleOnly.body.discussion.title, "A narrower continuity question");
    assert.equal(titleOnly.body.discussion.body, "Share a principle for deciding what should remain durable.");

    const bodyOnly = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: { body: "A revised prompt that leaves the title intact." },
    });
    assert.equal(bodyOnly.status, 200);
    assert.equal(bodyOnly.body.discussion.title, "A narrower continuity question");
    assert.equal(bodyOnly.body.discussion.body, "A revised prompt that leaves the title intact.");
    assert.equal(db.rows("threads").length, 1);
    assert.equal(document.discussion_thread_id, pointerBefore);
    assert.deepEqual(stableDiscussionFields(stored), stableBefore);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("document discussion customization is owner or admin only and recovers an unpointed linked thread", async () => {
  const db = new InMemorySupabase();
  const { document, thread } = seedDocumentDiscussion(db, PUBLIC_DOC_ID, { pointDocument: false });
  const original = clone(thread);
  setSupabaseAdminForTests(db.client as any);
  const app = await createDiscussionApp();

  try {
    const anonymous = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      body: { title: "Anonymous edit" },
    });
    assert.equal(anonymous.status, 401);

    const visitor = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "visitor-token",
      body: { title: "Visitor edit" },
    });
    assert.equal(visitor.status, 403);

    const nonOwner = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "member-token",
      body: { title: "Member edit" },
    });
    assert.equal(nonOwner.status, 403);
    assert.deepEqual(thread, original);

    const admin = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "admin-token",
      body: { body: "Administrator correction on the existing linked discussion." },
    });
    assert.equal(admin.status, 200);
    assert.equal(admin.body.discussion.id, thread.id);
    assert.equal(admin.body.discussion.title, original.title);
    assert.equal(admin.body.discussion.body, "Administrator correction on the existing linked discussion.");
    assert.equal(document.discussion_thread_id, null);
    assert.equal(db.rows("threads").length, 1);

    const owner = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
      body: { title: "Owner-approved discussion title" },
    });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.discussion.id, thread.id);
    assert.equal(owner.body.discussion.title, "Owner-approved discussion title");
    assert.equal(owner.body.discussion.body, "Administrator correction on the existing linked discussion.");
    assert.equal(document.discussion_thread_id, null);
    assert.equal(db.rows("threads").length, 1);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("document discussion customization fails closed for ineligible, missing, and malformed targets", async () => {
  async function expectFailClosed(
    configure: (db: InMemorySupabase) => void,
    body: unknown,
    expectedStatus: number,
  ) {
    const db = new InMemorySupabase();
    configure(db);
    const before = clone(db.tables);
    setSupabaseAdminForTests(db.client as any);
    const app = await createDiscussionApp();

    try {
      const response = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}/discussion`, {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, expectedStatus);
      assert.deepEqual(db.tables, before);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }

  await expectFailClosed(
    (db) => {
      const { document } = seedDocumentDiscussion(db, PUBLIC_DOC_ID);
      document.comments_enabled = false;
    },
    { title: "Disabled discussion edit" },
    400,
  );

  await expectFailClosed(
    (db) => {
      const { document, thread } = seedDocumentDiscussion(db, PUBLIC_DOC_ID);
      document.visibility = "private";
      thread.visibility = "private";
    },
    { body: "Private discussion edit" },
    400,
  );

  await expectFailClosed(
    () => undefined,
    { title: "Missing discussion edit" },
    404,
  );

  await expectFailClosed(
    (db) => {
      const unrelated = seedDocumentDiscussion(db, COMMUNITY_DOC_ID).thread;
      const document = db.rows("documents").find((row) => row.id === PUBLIC_DOC_ID)!;
      document.discussion_thread_id = unrelated.id;
    },
    { title: "Cross-document pointer edit" },
    404,
  );

  await expectFailClosed(() => undefined, {}, 400);
  await expectFailClosed(() => undefined, { title: "   " }, 400);
  await expectFailClosed(() => undefined, { body: 42 }, 400);
  await expectFailClosed(() => undefined, { title: "x".repeat(301) }, 400);
  await expectFailClosed(() => undefined, { body: "x".repeat(50001) }, 400);
  await expectFailClosed(
    () => undefined,
    { title: "Valid title", status: "locked" },
    400,
  );
});

test("owner document deletion tombstones only its linked discussion artifact", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createDiscussionApp();

  try {
    const discussion = await requestJson(app, "POST", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
    });
    assert.equal(discussion.status, 201);
    const linkedThreadId = discussion.body.discussion.id;

    const comment = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: linkedThreadId,
        body: "Preserve this comment under the cleanup tombstone.",
      },
    });
    assert.equal(comment.status, 201);
    const linkedThreadAfterComment = db.rows("threads").find((row) => row.id === linkedThreadId);
    assert.equal(linkedThreadAfterComment.comment_count, 1);

    const category = db.rows("forum_categories").find((row) => row.slug === "documents-and-codexes");
    assert.ok(category);
    const unrelatedThread = db.insertRow("threads", {
      category_id: category.id,
      author_user_id: OWNER_ID,
      title: "Unrelated public thread",
      body: "This thread is not linked to the deleted document.",
      visibility: "public",
      status: "active",
      is_hidden: false,
    });

    const memberDelete = await requestJson(app, "DELETE", `/documents/${PUBLIC_DOC_ID}`, {
      token: "member-token",
    });
    assert.equal(memberDelete.status, 404);

    const deleted = await requestJson(app, "DELETE", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
    });
    assert.equal(deleted.status, 200);
    assert.deepEqual(deleted.body, {
      deleted: true,
      documentId: PUBLIC_DOC_ID,
      cleanup: {
        strategy: "linked_discussion_tombstone",
        linkedDiscussionThreadsHidden: 1,
        linkedDiscussionThreadIds: [linkedThreadId],
        commentsPreserved: 1,
        commentsDeleted: 0,
        unrelatedThreadsTouched: 0,
      },
    });

    assert.equal(db.rows("documents").some((row) => row.id === PUBLIC_DOC_ID), false);
    const linkedThread = db.rows("threads").find((row) => row.id === linkedThreadId);
    assert.equal(linkedThread.status, "locked");
    assert.equal(linkedThread.is_hidden, true);
    assert.equal(linkedThread.linked_document_id, PUBLIC_DOC_ID);
    assert.equal(db.rows("comments").filter((row) => row.parent_id === linkedThreadId).length, 1);

    const visitorDocument = await requestJson(app, "GET", `/documents/public/${PUBLIC_DOC_ID}`);
    assert.equal(visitorDocument.status, 404);

    const visitorDiscussion = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/discussion`);
    assert.equal(visitorDiscussion.status, 404);

    const visitorThread = await requestJson(app, "GET", `/threads/${linkedThreadId}`);
    assert.equal(visitorThread.status, 404);

    const memberThread = await requestJson(app, "GET", `/threads/${linkedThreadId}`, {
      token: "member-token",
    });
    assert.equal(memberThread.status, 404);

    const unrelatedRead = await requestJson(app, "GET", `/threads/${unrelatedThread.id}`);
    assert.equal(unrelatedRead.status, 200);
    assert.equal(unrelatedRead.body.thread.title, "Unrelated public thread");

    const categoryRead = await requestJson(app, "GET", "/forums/categories/documents-and-codexes");
    assert.equal(categoryRead.status, 200);
    assert.equal(
      categoryRead.body.threads.some((thread: Row) => thread.id === linkedThreadId),
      false
    );
    assert.equal(
      categoryRead.body.threads.some((thread: Row) => thread.id === unrelatedThread.id),
      true
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("published document discussions respect public, community, unlisted, and private boundaries", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createDiscussionApp();

  try {
    const publicDiscussion = await requestJson(app, "POST", `/documents/${PUBLIC_DOC_ID}/discussion`, {
      token: "owner-token",
    });
    assert.equal(publicDiscussion.status, 201);
    assert.equal(publicDiscussion.body.discussion.visibility, "public");
    assert.equal(publicDiscussion.body.discussion.linked_document_id, PUBLIC_DOC_ID);
    assert.deepEqual(publicDiscussion.body.discussion.discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
      document_provenance_type: "user_authored",
      document_source_type: "manual",
      source_persona_id: null,
    });
    assert.deepEqual(publicDiscussion.body.discussion.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(publicDiscussion.body.discussion.authorship_source_id, undefined);

    const publicLink = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/discussion`);
    assert.equal(publicLink.status, 200);
    assert.equal(publicLink.body.discussion.id, publicDiscussion.body.discussion.id);
    assert.deepEqual(publicLink.body.discussion.discussion_provenance, publicDiscussion.body.discussion.discussion_provenance);

    const comment = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: publicDiscussion.body.discussion.id,
        body: "This public copy can collect replies safely.",
      },
    });
    assert.equal(comment.status, 201);

    const publicThread = await requestJson(app, "GET", `/threads/${publicDiscussion.body.discussion.id}`);
    assert.equal(publicThread.status, 200);
    assert.equal(publicThread.body.comments.length, 1);
    assert.deepEqual(publicThread.body.thread.discussion_provenance, publicDiscussion.body.discussion.discussion_provenance);
    assert.deepEqual(publicThread.body.thread.authorship_provenance, publicDiscussion.body.discussion.authorship_provenance);
    assert.deepEqual(publicThread.body.comments[0].authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.deepEqual(publicThread.body.comments[0].discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });

    const privateDiscussion = await requestJson(app, "POST", `/documents/${PRIVATE_DOC_ID}/discussion`, {
      token: "owner-token",
    });
    assert.equal(privateDiscussion.status, 400);

    const privateComment = await requestJson(app, "POST", "/comments", {
      token: "owner-token",
      body: {
        parentType: "document",
        parentId: PRIVATE_DOC_ID,
        body: "This should not attach to a private source.",
      },
    });
    assert.equal(privateComment.status, 400);

    const communityDiscussion = await requestJson(app, "POST", `/documents/${COMMUNITY_DOC_ID}/discussion`, {
      token: "owner-token",
    });
    assert.equal(communityDiscussion.status, 201);
    assert.equal(communityDiscussion.body.discussion.visibility, "community");

    const visitorCommunityThread = await requestJson(app, "GET", `/threads/${communityDiscussion.body.discussion.id}`);
    assert.equal(visitorCommunityThread.status, 404);

    const memberCommunityThread = await requestJson(app, "GET", `/threads/${communityDiscussion.body.discussion.id}`, {
      token: "member-token",
    });
    assert.equal(memberCommunityThread.status, 200);

    const unlistedDiscussion = await requestJson(app, "POST", `/documents/${UNLISTED_DOC_ID}/discussion`, {
      token: "owner-token",
    });
    assert.equal(unlistedDiscussion.status, 201);
    assert.equal(unlistedDiscussion.body.discussion.visibility, "unlisted");

    const visitorUnlistedThread = await requestJson(app, "GET", `/threads/${unlistedDiscussion.body.discussion.id}`);
    assert.equal(visitorUnlistedThread.status, 200);

    const visitorCategory = await requestJson(app, "GET", "/forums/categories/documents-and-codexes");
    assert.equal(visitorCategory.status, 200);
    assert.deepEqual(
      visitorCategory.body.threads.map((thread: Row) => thread.linked_document_id),
      [PUBLIC_DOC_ID]
    );

    const memberCategory = await requestJson(app, "GET", "/forums/categories/documents-and-codexes", {
      token: "member-token",
    });
    assert.equal(memberCategory.status, 200);
    assert.equal(
      memberCategory.body.threads.some((thread: Row) => thread.linked_document_id === COMMUNITY_DOC_ID),
      true
    );
    assert.equal(
      memberCategory.body.threads.some((thread: Row) => thread.linked_document_id === UNLISTED_DOC_ID),
      false
    );

    const visitorFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=20");
    assert.equal(visitorFeed.status, 200);
    assert.equal(
      visitorFeed.body.items.some((item: Row) => item.title === "Discuss: Public Field Log"),
      false
    );
    assert.equal(
      visitorFeed.body.items.find((item: Row) => item.title === "Public Field Log")?.discussionThreadId,
      publicDiscussion.body.discussion.id
    );
    assert.equal(
      visitorFeed.body.items.some((item: Row) => item.title === "Community Field Log"),
      false
    );
    assert.equal(
      visitorFeed.body.items.some((item: Row) => item.title === "Unlisted Field Log"),
      false
    );

    const memberFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=20", {
      token: "member-token",
    });
    assert.equal(memberFeed.status, 200);
    assert.equal(
      memberFeed.body.items.find((item: Row) => item.title === "Community Field Log")?.discussionThreadId,
      communityDiscussion.body.discussion.id
    );

    const visitorSpace = await requestJson(app, "GET", "/spaces/field-notes");
    assert.equal(visitorSpace.status, 200);
    assert.deepEqual(visitorSpace.body.documents.map((doc: Row) => doc.title), ["Public Field Log"]);
    assert.equal(visitorSpace.body.documents[0].discussion_thread_id, publicDiscussion.body.discussion.id);

    const memberSpace = await requestJson(app, "GET", "/spaces/field-notes", {
      token: "member-token",
    });
    assert.equal(memberSpace.status, 200);
    assert.equal(
      memberSpace.body.documents.some((doc: Row) => doc.title === "Community Field Log"),
      true
    );
    assert.equal(
      memberSpace.body.documents.some((doc: Row) => doc.title === "Unlisted Field Log"),
      false
    );

    const privatized = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { visibility: "private" },
    });
    assert.equal(privatized.status, 200);
    assert.equal(privatized.body.discussion, null);

    const hiddenPublicThread = await requestJson(app, "GET", `/threads/${publicDiscussion.body.discussion.id}`);
    assert.equal(hiddenPublicThread.status, 404);

    const repeatedPrivatized = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { visibility: "private" },
    });
    assert.equal(repeatedPrivatized.status, 200);
    assert.equal(repeatedPrivatized.body.document.visibility, "private");
    assert.equal(repeatedPrivatized.body.discussion, null);

    const stillHiddenPublicThread = await requestJson(app, "GET", `/threads/${publicDiscussion.body.discussion.id}`);
    assert.equal(stillHiddenPublicThread.status, 404);

    const publicDocument = await requestJson(app, "GET", `/documents/public/${PUBLIC_DOC_ID}`);
    assert.equal(publicDocument.status, 404);

    const ownerDocument = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
    });
    assert.equal(ownerDocument.status, 200);
    assert.equal(ownerDocument.body.document.visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});
