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
const SPACE_ID = "44444444-4444-4444-8444-444444444444";
const CANON_ID = "55555555-5555-4555-8555-555555555555";
const INTEGRITY_ID = "66666666-6666-4666-8666-666666666666";
const FILE_ID = "77777777-7777-4777-8777-777777777777";
const IMPORT_ID = "88888888-8888-4888-8888-888888888888";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        username: "owner",
        display_name: "Owner",
        avatar_url: null,
        bio: "Continuity publisher.",
        tier: "creator",
        is_admin: false,
      },
      {
        id: OTHER_ID,
        email: "other@example.test",
        username: "other",
        display_name: "Other",
        avatar_url: null,
        bio: null,
        tier: "creator",
        is_admin: false,
      },
    ],
    spaces: [
      {
        id: SPACE_ID,
        owner_user_id: OWNER_ID,
        slug: "mirror-archive",
        title: "Mirror Archive",
        short_description: "A public continuity library.",
        long_description: "Published fragments from private Studio work.",
        theme: null,
        is_public: true,
        comments_default_enabled: true,
        created_at: "2026-05-25T09:00:00.000Z",
        updated_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    space_pages: [],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "Public-facing continuity persona.",
        visibility: "public",
        provider: "platform",
        avatar_url: null,
        created_at: "2026-05-25T09:01:00.000Z",
      },
    ],
    documents: [],
    canon_items: [
      {
        id: CANON_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Prime directive",
        content: "Canon continuity should outrank improvised memory.",
        source_type: "manual",
        priority: 9,
        created_at: "2026-05-25T09:02:00.000Z",
      },
    ],
    calibration_sessions: [
      {
        id: INTEGRITY_ID,
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        session_title: "Harbor public rules",
        transcript: "Private transcript that remains the source record.",
        extracted_style_notes: "Speak with steady precision.",
        extracted_public_rules: "Keep public claims bounded.",
        extracted_private_rules: "Do not expose private owner details.",
        extracted_uncertainty_rules: "Ask before inventing missing anchors.",
        save_target: "public_mode",
        created_at: "2026-05-25T09:03:00.000Z",
        updated_at: "2026-05-25T09:04:00.000Z",
      },
    ],
    persona_files: [
      {
        id: FILE_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        file_name: "source-notebook.md",
        file_type: "text/markdown",
        file_size: 1024,
        storage_path: "private/source-notebook.md",
        source_type: "upload",
        processed: true,
        created_at: "2026-05-25T09:05:00.000Z",
      },
    ],
    import_jobs: [
      {
        id: IMPORT_ID,
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        kind: "chat",
        status: "completed",
        source_name: "old-chat-export.txt",
        error_message: null,
        created_at: "2026-05-25T09:06:00.000Z",
        updated_at: "2026-05-25T09:06:00.000Z",
      },
    ],
    threads: [],
    forum_categories: [],
    discover_feed: [],
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

  relatedDocument(row: Row, columns: string | null) {
    if (!columns) return row;
    const document = { ...row };
    if (columns.includes("space:spaces")) {
      const space = this.rows("spaces").find((candidate) => candidate.id === row.space_id);
      document.space = space ? { slug: space.slug, title: space.title } : null;
    }
    if (columns.includes("author:profiles")) {
      const author = this.rows("profiles").find((candidate) => candidate.id === row.author_user_id);
      document.author = author
        ? { username: author.username, display_name: author.display_name, avatar_url: author.avatar_url }
        : null;
    }
    if (columns.includes("persona:personas")) {
      const persona = this.rows("personas").find((candidate) => candidate.id === row.persona_id);
      document.persona = persona ? { id: persona.id, name: persona.name } : null;
    }
    return document;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `${table}-${this.idCounters[table]}`;
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
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
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

    const projected = this.table === "documents"
      ? rows.map((row) => this.db.relatedDocument(row, this.columns))
      : rows;
    const data = clone(projected);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    if (mode === "maybeSingle") {
      return data.length <= 1
        ? { data: data[0] ?? null, error: null, count }
        : { data: null, error: { message: `Expected at most one ${this.table} row.` }, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function createPublicationApp() {
  const [{ documentsRouter }, { discoverRouter }, { spacesRouter }] = await Promise.all([
    import("./documents.js"),
    import("./discover.js"),
    import("./spaces.js"),
  ]);

  const app = express();
  app.use(express.json());
  app.use("/documents", documentsRouter);
  app.use("/discover", discoverRouter);
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

function publishBody(sourceType: string, sourceId: string, visibility: string, title: string) {
  return {
    sourceType,
    sourceId,
    spaceId: SPACE_ID,
    title,
    visibility,
    publish: true,
  };
}

test("continuity artifacts publish as separate provenance-labelled documents", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPublicationApp();

  try {
    const blocked = await requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "other-token",
      body: publishBody("canon", CANON_ID, "public", "Blocked canon copy"),
    });
    assert.equal(blocked.status, 404);

    const canon = await requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "owner-token",
      body: publishBody("canon", CANON_ID, "public", "Published Canon"),
    });
    assert.equal(canon.status, 201);
    assert.equal(canon.body.document.provenance_type, "persona_derived");
    assert.equal(canon.body.document.source_type, "canon");
    assert.equal(canon.body.document.source_id, CANON_ID);
    assert.equal(canon.body.document.visibility, "public");
    assert.match(canon.body.document.body, /Canon continuity should outrank improvised memory/);
    assert.equal(db.tables.canon_items[0].content, "Canon continuity should outrank improvised memory.");

    const integrity = await requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "owner-token",
      body: publishBody("integrity", INTEGRITY_ID, "community", "Community Integrity Notes"),
    });
    assert.equal(integrity.status, 201);
    assert.equal(integrity.body.document.provenance_type, "integrity_session");
    assert.equal(integrity.body.document.source_type, "integrity");
    assert.equal(integrity.body.document.source_id, INTEGRITY_ID);
    assert.equal(integrity.body.document.source_label, "Integrity Session / public_mode");
    assert.equal(integrity.body.document.source_persona_id, PERSONA_ID);
    assert.match(integrity.body.document.body, /Speak with steady precision/);
    assert.match(integrity.body.document.body, /Keep public claims bounded/);
    assert.doesNotMatch(integrity.body.document.body, /Do not expose private owner details/);
    assert.doesNotMatch(integrity.body.document.body, /Private transcript/);

    const unlistedArchive = await requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "owner-token",
      body: publishBody("archive_import", IMPORT_ID, "unlisted", "Unlisted Archive Reference"),
    });
    assert.equal(unlistedArchive.status, 201);
    assert.equal(unlistedArchive.body.document.provenance_type, "archive_import");

    const privateFile = await requestJson(app, "POST", "/documents/publish-from-continuity", {
      token: "owner-token",
      body: publishBody("archive_file", FILE_ID, "private", "Private File Draft"),
    });
    assert.equal(privateFile.status, 201);
    assert.equal(privateFile.body.document.visibility, "private");

    const publicRead = await requestJson(app, "GET", `/documents/public/${canon.body.document.id}`);
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.body.document.source_label, "Canon / priority 9");

    const unlistedRead = await requestJson(app, "GET", `/documents/public/${unlistedArchive.body.document.id}`);
    assert.equal(unlistedRead.status, 200);

    const privateRead = await requestJson(app, "GET", `/documents/public/${privateFile.body.document.id}`);
    assert.equal(privateRead.status, 404);

    const ownerPrivateRead = await requestJson(app, "GET", `/documents/${privateFile.body.document.id}`, {
      token: "owner-token",
    });
    assert.equal(ownerPrivateRead.status, 200);
    assert.equal(ownerPrivateRead.body.access, "owner");

    const visitorSpace = await requestJson(app, "GET", "/spaces/mirror-archive");
    assert.equal(visitorSpace.status, 200);
    assert.deepEqual(visitorSpace.body.documents.map((doc: Row) => doc.title), ["Published Canon"]);
    assert.equal(visitorSpace.body.documents[0].provenance_type, "persona_derived");

    const memberSpace = await requestJson(app, "GET", "/spaces/mirror-archive", {
      token: "owner-token",
    });
    assert.equal(memberSpace.status, 200);
    assert.equal(memberSpace.body.documents.some((doc: Row) => doc.title === "Community Integrity Notes"), true);
    assert.equal(memberSpace.body.documents.some((doc: Row) => doc.title === "Unlisted Archive Reference"), false);

    const visitorFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=20");
    assert.equal(visitorFeed.status, 200);
    assert.deepEqual(
      visitorFeed.body.items.filter((item: Row) => item.type === "document").map((item: Row) => item.title),
      ["Published Canon"],
    );
    assert.equal(
      visitorFeed.body.items.some((item: Row) => item.type === "space" && item.title === "Mirror Archive"),
      true,
    );

    const memberFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=20", {
      token: "owner-token",
    });
    assert.equal(memberFeed.status, 200);
    assert.equal(memberFeed.body.items.some((item: Row) => item.title === "Community Integrity Notes"), true);
    assert.equal(memberFeed.body.items.some((item: Row) => item.title === "Unlisted Archive Reference"), false);

    const history = await requestJson(app, "GET", `/documents?personaId=${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(history.status, 200);
    assert.equal(history.body.documents.length, 4);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
