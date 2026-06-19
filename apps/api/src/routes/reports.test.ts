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
      {
        id: "admin-user",
        email: "admin@example.test",
        tier: "canon",
        is_admin: true,
      },
      {
        id: "visitor-user",
        email: "visitor@example.test",
        tier: "visitor",
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
    ["admin-token", { id: "admin-user", email: "admin@example.test" }],
    ["visitor-token", { id: "visitor-user", email: "visitor@example.test" }],
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
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: ReportsSupabase, private table: string) {}

  select() {
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
      rows = (Array.isArray(this.payload) ? this.payload : [this.payload as Row])
        .map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = this.db.timestamp();
      }
    } else {
      rows = this.matchingRows();
    }

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

    const visitorBlocked = await requestJson(app, "POST", "/reports", {
      token: "visitor-token",
      body: {
        targetType: "document",
        targetId: "doc-1",
        reason: "spam",
      },
    });
    assert.equal(visitorBlocked.status, 403);
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

    const duplicate = await requestJson(app, "POST", "/reports", {
      token: "owner-token",
      body: {
        targetType: "persona",
        targetId: "persona-1",
        reason: "unsafe impersonation",
      },
    });

    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(duplicate.body.report.id, "moderation_reports-1");
    assert.equal(db.tables.moderation_reports.length, 1);

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

test("reports queue and status updates are admin-only and server-owned", async () => {
  const db = new ReportsSupabase();
  const openReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    notes: "Visible only to admins.",
    status: "open",
  });
  const reviewingReport = db.insertRow("moderation_reports", {
    reporter_id: "other-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    status: "reviewing",
  });
  const resolvedReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona",
    target_id: "persona-1",
    reason: "impersonation",
    status: "resolved",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T08:00:00.000Z",
  });
  db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "document",
    target_id: "doc-1",
    reason: "off-topic",
    status: "dismissed",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousQueue = await requestJson(app, "GET", "/reports");
    assert.equal(anonymousQueue.status, 401);

    const visitorQueue = await requestJson(app, "GET", "/reports", {
      token: "visitor-token",
    });
    assert.equal(visitorQueue.status, 403);

    const memberQueue = await requestJson(app, "GET", "/reports", {
      token: "owner-token",
    });
    assert.equal(memberQueue.status, 403);

    const adminQueue = await requestJson(app, "GET", "/reports", {
      token: "admin-token",
    });
    assert.equal(adminQueue.status, 200);
    assert.deepEqual(
      adminQueue.body.reports.map((report: Row) => report.id),
      [reviewingReport.id, openReport.id]
    );
    assert.equal(adminQueue.body.reports[1].notes, "Visible only to admins.");

    const limitedQueue = await requestJson(app, "GET", "/reports?limit=1", {
      token: "admin-token",
    });
    assert.equal(limitedQueue.status, 200);
    assert.deepEqual(limitedQueue.body.reports.map((report: Row) => report.id), [reviewingReport.id]);

    const commentQueue = await requestJson(app, "GET", "/reports?targetType=comment", {
      token: "admin-token",
    });
    assert.equal(commentQueue.status, 200);
    assert.deepEqual(commentQueue.body.reports.map((report: Row) => report.id), [reviewingReport.id]);

    const resolvedQueue = await requestJson(app, "GET", "/reports?status=resolved", {
      token: "admin-token",
    });
    assert.equal(resolvedQueue.status, 200);
    assert.deepEqual(resolvedQueue.body.reports.map((report: Row) => report.id), [resolvedReport.id]);

    const invalidQueue = await requestJson(app, "GET", "/reports?status=deleted", {
      token: "admin-token",
    });
    assert.equal(invalidQueue.status, 400);

    const anonymousUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      body: { status: "resolved" },
    });
    assert.equal(anonymousUpdate.status, 401);

    const visitorUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "visitor-token",
      body: { status: "resolved" },
    });
    assert.equal(visitorUpdate.status, 403);

    const memberUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "owner-token",
      body: { status: "resolved" },
    });
    assert.equal(memberUpdate.status, 403);

    const invalidUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "admin-token",
      body: { status: "open" },
    });
    assert.equal(invalidUpdate.status, 400);

    const adminUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "admin-token",
      body: {
        status: "resolved",
        reviewedBy: "spoofed-user",
        reviewedAt: "2000-01-01T00:00:00.000Z",
      },
    });
    assert.equal(adminUpdate.status, 200);
    assert.equal(adminUpdate.body.report.id, openReport.id);
    assert.equal(adminUpdate.body.report.status, "resolved");
    assert.equal(adminUpdate.body.report.reviewedBy, "admin-user");
    assert.notEqual(adminUpdate.body.report.reviewedAt, "2000-01-01T00:00:00.000Z");
    assert.equal(typeof adminUpdate.body.report.reviewedAt, "string");

    const stored = db.tables.moderation_reports.find((report) => report.id === openReport.id);
    assert.equal(stored?.status, "resolved");
    assert.equal(stored?.reviewed_by, "admin-user");
    assert.notEqual(stored?.reviewed_at, "2000-01-01T00:00:00.000Z");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("reporters can read only their own safe report status records", async () => {
  const db = new ReportsSupabase();
  const ownerOpen = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    notes: "Reporter detail that should stay out of reporter readback.",
    status: "open",
  });
  const ownerResolved = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    notes: "Moderator-only handling note.",
    status: "resolved",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T10:00:00.000Z",
  });
  db.insertRow("moderation_reports", {
    reporter_id: "other-user",
    target_type: "persona",
    target_id: "persona-1",
    reason: "impersonation",
    notes: "Other reporter note.",
    status: "reviewing",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T11:00:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousReadback = await requestJson(app, "GET", "/reports/mine");
    assert.equal(anonymousReadback.status, 401);

    const ownerReadback = await requestJson(app, "GET", "/reports/mine", {
      token: "owner-token",
    });
    assert.equal(ownerReadback.status, 200);
    assert.deepEqual(
      ownerReadback.body.reports.map((report: Row) => report.id),
      [ownerResolved.id, ownerOpen.id]
    );
    assert.deepEqual(ownerReadback.body.reports[0], {
      id: ownerResolved.id,
      targetType: "comment",
      targetId: "comment-1",
      reason: "harassment",
      status: "resolved",
      reviewedAt: "2026-05-25T10:00:00.000Z",
      createdAt: "2026-05-25T09:00:01.000Z",
      updatedAt: "2026-05-25T09:00:01.000Z",
    });
    const ownerResolvedReadback = ownerReadback.body.reports[0] as Row;
    assert.equal(ownerResolvedReadback.notes, undefined);
    assert.equal(ownerResolvedReadback.reviewedBy, undefined);
    assert.equal(ownerResolvedReadback.reporterUserId, undefined);
    assert.equal(ownerReadback.body.reports.some((report: Row) => report.targetId === "persona-1"), false);
    const ownerReadbackJson = JSON.stringify(ownerReadback.body);
    assert.equal(ownerReadbackJson.includes("Reporter detail that should stay out of reporter readback."), false);
    assert.equal(ownerReadbackJson.includes("Moderator-only handling note."), false);
    assert.equal(ownerReadbackJson.includes("reviewed_by"), false);
    assert.equal(ownerReadbackJson.includes("reporter_id"), false);
    assert.equal(ownerReadbackJson.includes("admin-user"), false);

    const statusFiltered = await requestJson(app, "GET", "/reports/mine?status=open", {
      token: "owner-token",
    });
    assert.equal(statusFiltered.status, 200);
    assert.deepEqual(statusFiltered.body.reports.map((report: Row) => report.id), [ownerOpen.id]);

    const targetFiltered = await requestJson(app, "GET", "/reports/mine?targetType=comment", {
      token: "owner-token",
    });
    assert.equal(targetFiltered.status, 200);
    assert.deepEqual(targetFiltered.body.reports.map((report: Row) => report.id), [ownerResolved.id]);

    const invalidFilter = await requestJson(app, "GET", "/reports/mine?status=deleted", {
      token: "owner-token",
    });
    assert.equal(invalidFilter.status, 400);

    const otherReadback = await requestJson(app, "GET", "/reports/mine", {
      token: "other-token",
    });
    assert.equal(otherReadback.status, 200);
    assert.deepEqual(
      otherReadback.body.reports.map((report: Row) => report.targetId),
      ["persona-1"]
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});
