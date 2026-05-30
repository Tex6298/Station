import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { reportsRouter } from "./reports";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class ReportsSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
      },
      {
        id: "other-user",
        email: "other@example.test",
        tier: "private",
        is_admin: false,
      },
    ],
    moderation_reports: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T09:00:00.000Z");
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
    return `${table}-${this.idCounters[table]}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "moderation_reports") {
      row.notes ??= null;
      row.status ??= "open";
      row.reviewed_by ??= null;
      row.reviewed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private operation: "select" | "insert" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: ReportsSupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
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

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    return rows;
  }

  private async execute(mode?: "single") {
    const rows = this.operation === "insert"
      ? (Array.isArray(this.payload) ? this.payload : [this.payload as Row])
          .map((payload) => this.db.insertRow(this.table, payload))
      : this.matchingRows();

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }

    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createReportsApp() {
  const app = express();
  app.use(express.json());
  app.use("/reports", reportsRouter);
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

test("reports route persists reports through Supabase and scopes reporter to auth user", async () => {
  const db = new ReportsSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const blocked = await requestJson(app, "POST", "/reports", {
      body: {
        targetType: "document",
        targetId: "doc-1",
        reason: "spam",
      },
    });
    assert.equal(blocked.status, 401);
    assert.equal(db.tables.moderation_reports.length, 0);

    const created = await requestJson(app, "POST", "/reports", {
      token: "owner-token",
      body: {
        reporterUserId: "spoofed-user",
        status: "resolved",
        targetType: "persona",
        targetId: "persona-1",
        reason: "unsafe impersonation",
      },
    });

    assert.equal(created.status, 201);
    assert.deepEqual(created.body.report, {
      id: "moderation_reports-1",
      reporterUserId: "owner-user",
      targetType: "persona",
      targetId: "persona-1",
      reason: "unsafe impersonation",
      status: "open",
      createdAt: "2026-05-25T09:00:00.000Z",
      updatedAt: "2026-05-25T09:00:00.000Z",
    });
    assert.deepEqual(db.tables.moderation_reports[0], {
      id: "moderation_reports-1",
      reporter_id: "owner-user",
      target_type: "persona",
      target_id: "persona-1",
      reason: "unsafe impersonation",
      notes: null,
      status: "open",
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-05-25T09:00:00.000Z",
      updated_at: "2026-05-25T09:00:00.000Z",
    });

    const withNotes = await requestJson(app, "POST", "/reports", {
      token: "other-token",
      body: {
        targetType: "comment",
        targetId: "comment-1",
        reason: "harassment",
        notes: "Contains direct abuse.",
      },
    });

    assert.equal(withNotes.status, 201);
    assert.equal(withNotes.body.report.reporterUserId, "other-user");
    assert.equal(withNotes.body.report.notes, "Contains direct abuse.");
    assert.equal(db.tables.moderation_reports.length, 2);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
