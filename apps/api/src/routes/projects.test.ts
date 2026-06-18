import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { projectsRouter } from "./projects";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", tier: "canon", is_admin: false },
      { id: "other-user", tier: "canon", is_admin: false },
    ],
    projects: [],
    project_members: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-19T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
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
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "projects") {
      row.description ??= null;
      row.visibility ??= "private";
      row.connection_tier ??= "tier_1_showcase";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "project_members") {
      row.role ??= "owner";
      row.status ??= "active";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*") {
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
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    const rows = this.operation === "insert"
      ? (Array.isArray(this.payload) ? this.payload : [this.payload as Row]).map((payload) => this.db.insertRow(this.table, payload))
      : this.matchingRows();

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    if (mode === "maybeSingle") return { data: data[0] ?? null, error: null };
    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createProjectsApp() {
  const app = express();
  app.use(express.json());
  app.use("/projects", projectsRouter);
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
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test("projects routes require auth and validate create payloads", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const unauthenticated = await requestJson(app, "GET", "/projects");
  assert.equal(unauthenticated.status, 401);

  const invalid = await requestJson(app, "POST", "/projects", {
    token: "owner-token",
    body: {
      name: "",
      slug: "Bad Slug",
      visibility: "open",
      connectionTier: "creator",
    },
  });
  assert.equal(invalid.status, 400);

  setSupabaseAdminForTests(null);
});

test("project create writes owner project and deterministic owner member row", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const created = await requestJson<{ project: Row }>(app, "POST", "/projects", {
    token: "owner-token",
    body: {
      name: "Animus Field Lab",
      slug: "animus-field-lab",
      description: "Synthetic public-safe project shell.",
      visibility: "unlisted",
      connectionTier: "tier_1_showcase",
    },
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.project.ownerUserId, "owner-user");
  assert.equal(created.body.project.name, "Animus Field Lab");
  assert.equal(created.body.project.slug, "animus-field-lab");
  assert.equal(created.body.project.visibility, "unlisted");
  assert.equal(created.body.project.connectionTier, "tier_1_showcase");
  assert.equal(db.tables.projects.length, 1);
  assert.deepEqual(
    db.tables.project_members.map((row) => ({
      project_id: row.project_id,
      user_id: row.user_id,
      role: row.role,
      status: row.status,
    })),
    [{ project_id: created.body.project.id, user_id: "owner-user", role: "owner", status: "active" }]
  );

  setSupabaseAdminForTests(null);
});

test("project list and read are scoped to the authenticated owner", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    owner_user_id: "owner-user",
    name: "Owner Project",
    slug: "owner-project",
    visibility: "private",
    connection_tier: "tier_1_showcase",
  });
  db.insertRow("projects", {
    owner_user_id: "other-user",
    name: "Other Project",
    slug: "other-project",
    visibility: "private",
    connection_tier: "tier_1_showcase",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const list = await requestJson<{ projects: Row[] }>(app, "GET", "/projects", { token: "owner-token" });
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.projects.map((project) => project.slug), ["owner-project"]);

  const bySlug = await requestJson<{ project: Row }>(app, "GET", "/projects/owner-project", { token: "owner-token" });
  assert.equal(bySlug.status, 200);
  assert.equal(bySlug.body.project.id, ownerProject.id);

  const byId = await requestJson<{ project: Row }>(app, "GET", `/projects/${ownerProject.id}`, { token: "owner-token" });
  assert.equal(byId.status, 200);
  assert.equal(byId.body.project.slug, "owner-project");

  const blocked = await requestJson(app, "GET", "/projects/other-project", { token: "owner-token" });
  assert.equal(blocked.status, 404);

  setSupabaseAdminForTests(null);
});
