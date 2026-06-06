import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { spacesRouter } from "./spaces";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
        username: "marty",
        display_name: "Marty",
        avatar_url: null,
        bio: "Researcher and archivist.",
      },
    ],
    spaces: [],
    space_pages: [],
    documents: [],
    personas: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
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

    if (table === "spaces") {
      row.short_description ??= null;
      row.long_description ??= null;
      row.theme ??= "default";
      row.is_public ??= true;
      row.comments_default_enabled ??= true;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "space_pages") {
      row.body ??= "";
      row.comments_enabled ??= false;
      row.is_published ??= true;
      row.sort_order ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "documents") {
      row.body ??= "";
      row.status ??= "draft";
      row.visibility ??= "private";
      row.published_at ??= null;
      row.created_at ??= now;
    }

    if (table === "personas") {
      row.short_description ??= null;
      row.visibility ??= "private";
      row.provider ??= null;
      row.avatar_url ??= null;
      row.created_at ??= now;
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
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createSpacesApp() {
  const app = express();
  app.use(express.json());
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

test("Public Spaces smoke covers authored microsite config and owner/private visibility", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/spaces", {
      token: "owner-token",
      body: {
        title: "Mirror Archive",
        slug: "mirror-archive",
        shortDescription: "A public continuity library.",
        longDescription: "A maintained archive of public Station work.",
        tagline: "Public notes, personas, and canonical essays.",
        theme: "garden",
        layout: "portfolio",
        isPublic: true,
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.space.presentation.theme, "garden");
    assert.equal(created.body.space.presentation.layout, "portfolio");
    assert.equal(created.body.space.presentation.tagline, "Public notes, personas, and canonical essays.");
    assert.equal(db.tables.space_pages.length, 4);

    const spaceId = created.body.space.id;
    const secondSpaceBlocked = await requestJson(app, "POST", "/spaces", {
      token: "owner-token",
      body: {
        title: "Second Archive",
        slug: "second-archive",
      },
    });
    assert.equal(secondSpaceBlocked.status, 403);
    assert.match(secondSpaceBlocked.body.error, /Space limit/);

    db.insertRow("documents", {
      space_id: spaceId,
      author_user_id: "owner-user",
      title: "Published Essay",
      slug: "published-essay",
      document_type: "essay",
      body: "A visitor-readable document.",
      status: "published",
      visibility: "public",
      published_at: "2026-05-25T10:00:00.000Z",
    });
    db.insertRow("documents", {
      space_id: spaceId,
      author_user_id: "owner-user",
      title: "Private Draft",
      slug: "private-draft",
      document_type: "post",
      body: "This must not render publicly.",
      status: "draft",
      visibility: "private",
    });
    db.insertRow("personas", {
      owner_user_id: "owner-user",
      name: "Public Persona",
      short_description: "Readable public collaborator.",
      visibility: "public",
    });
    db.insertRow("personas", {
      owner_user_id: "owner-user",
      name: "Private Persona",
      short_description: "Hidden collaborator.",
      visibility: "private",
    });

    const publicDetail = await requestJson(app, "GET", "/spaces/mirror-archive");
    assert.equal(publicDetail.status, 200);
    assert.equal(publicDetail.body.access, "public");
    assert.equal(publicDetail.body.space.presentation.theme, "garden");
    assert.deepEqual(publicDetail.body.documents.map((doc: Row) => doc.title), ["Published Essay"]);
    assert.deepEqual(publicDetail.body.personas.map((persona: Row) => persona.name), ["Public Persona"]);
    assert.equal(publicDetail.body.pages.some((page: Row) => page.slug === "about"), false);

    const visitorManage = await requestJson(app, "GET", "/spaces/mirror-archive/manage");
    assert.equal(visitorManage.status, 401);

    const updated = await requestJson(app, "PATCH", `/spaces/${spaceId}`, {
      token: "owner-token",
      body: {
        tagline: "Now framed as a research archive.",
        theme: "signal",
        layout: "archive",
        isPublic: false,
      },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.space.presentation.theme, "signal");
    assert.equal(updated.body.space.presentation.layout, "archive");
    assert.equal(updated.body.space.presentation.tagline, "Now framed as a research archive.");
    assert.equal(updated.body.space.is_public, false);

    const blockedPrivate = await requestJson(app, "GET", "/spaces/mirror-archive");
    assert.equal(blockedPrivate.status, 403);

    const ownerPrivate = await requestJson(app, "GET", "/spaces/mirror-archive", {
      token: "owner-token",
    });
    assert.equal(ownerPrivate.status, 200);
    assert.equal(ownerPrivate.body.access, "owner");

    const ownerManage = await requestJson(app, "GET", "/spaces/mirror-archive/manage", {
      token: "owner-token",
    });
    assert.equal(ownerManage.status, 200);
    assert.equal(ownerManage.body.space.presentation.theme, "signal");
  } finally {
    setSupabaseAdminForTests(null);
  }
});
