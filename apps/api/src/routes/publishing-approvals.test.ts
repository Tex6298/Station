import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { publishingApprovalsRouter } from "./publishing-approvals";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const DOC_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_DOC_ID = "44444444-4444-4444-8444-444444444444";
const PRIVATE_SOURCE_DOC_ID = "55555555-5555-4555-8555-555555555555";

class PublishingApprovalSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: OWNER_ID, email: "owner@example.test", tier: "creator", is_admin: false },
      { id: OTHER_ID, email: "other@example.test", tier: "creator", is_admin: false },
    ],
    documents: [
      documentRow(DOC_ID, OWNER_ID, "Queue Draft", "draft", "private"),
      documentRow(OTHER_DOC_ID, OTHER_ID, "Other Draft", "draft", "private"),
      documentRow(PRIVATE_SOURCE_DOC_ID, OWNER_ID, "Private Canon Source", "draft", "private", {
        body: "Private canon body should never appear in approval queue responses.",
        provenance_type: "persona_derived",
        source_type: "canon",
        source_id: "66666666-6666-4666-8666-666666666666",
        source_label: "Canon / priority 8",
      }),
    ],
    publishing_approval_items: [],
    publishing_approval_events: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T09:00:00.000Z");
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
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "publishing_approval_items") {
      row.state ??= "draft";
      row.visibility ??= "public";
      row.scheduled_for ??= null;
      row.grounding_summary ??= null;
      row.review_note ??= null;
      row.requested_at ??= now;
      row.approved_at ??= null;
      row.published_at ??= null;
      row.cancelled_at ??= null;
      row.archived_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "publishing_approval_events") {
      row.metadata ??= {};
      row.note ??= null;
      row.created_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: PublishingApprovalSupabase, private table: string) {}

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
    for (const [field, value] of this.filters) rows = rows.filter((row) => row[field] === value);
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

function documentRow(id: string, ownerUserId: string, title: string, status: string, visibility: string, overrides: Row = {}): Row {
  return {
    id,
    author_user_id: ownerUserId,
    space_id: "77777777-7777-4777-8777-777777777777",
    persona_id: null,
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    body: `${title} private draft body.`,
    document_type: "essay",
    status,
    visibility,
    comments_enabled: true,
    published_at: null,
    provenance_type: "user_authored",
    source_type: "manual",
    source_id: null,
    source_label: "User-authored document",
    source_persona_id: null,
    discussion_thread_id: null,
    created_at: "2026-05-25T08:00:00.000Z",
    updated_at: "2026-05-25T08:00:00.000Z",
    ...overrides,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createPublishingApprovalsApp() {
  const app = express();
  app.use(express.json());
  app.use("/publishing/approvals", publishingApprovalsRouter);
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

test("publishing approvals are owner-scoped and redact private document bodies", async () => {
  const db = new PublishingApprovalSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPublishingApprovalsApp();

  try {
    const unauthenticated = await requestJson(app, "GET", "/publishing/approvals");
    assert.equal(unauthenticated.status, 401);

    const otherOwned = await requestJson(app, "POST", "/publishing/approvals", {
      token: "owner-token",
      body: { documentId: OTHER_DOC_ID },
    });
    assert.equal(otherOwned.status, 404);

    const created = await requestJson(app, "POST", "/publishing/approvals", {
      token: "owner-token",
      body: {
        documentId: PRIVATE_SOURCE_DOC_ID,
        visibility: "community",
        note: "Ready for grounding.",
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.approval.state, "grounding_check");
    assert.equal(created.body.approval.visibility, "community");
    assert.equal(created.body.approval.document.source_label, "Canon / priority 8");
    assert.equal(JSON.stringify(created.body).includes("Private canon body should never appear"), false);
    assert.equal(JSON.stringify(created.body).includes("66666666-6666-4666-8666-666666666666"), false);

    const otherList = await requestJson(app, "GET", "/publishing/approvals", { token: "other-token" });
    assert.equal(otherList.status, 200);
    assert.deepEqual(otherList.body.approvals, []);

    const ownerList = await requestJson(app, "GET", "/publishing/approvals", { token: "owner-token" });
    assert.equal(ownerList.status, 200);
    assert.equal(ownerList.body.approvals.length, 1);
    assert.equal(ownerList.body.approvals[0].documentId, PRIVATE_SOURCE_DOC_ID);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("publishing approvals enforce state transitions and publish through owner document", async () => {
  const db = new PublishingApprovalSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPublishingApprovalsApp();

  try {
    const created = await requestJson(app, "POST", "/publishing/approvals", {
      token: "owner-token",
      body: { documentId: DOC_ID, visibility: "public" },
    });
    assert.equal(created.status, 201);
    const approvalId = created.body.approval.id;

    const invalid = await requestJson(app, "POST", `/publishing/approvals/${approvalId}/transition`, {
      token: "owner-token",
      body: { state: "published" },
    });
    assert.equal(invalid.status, 400);
    assert.match(invalid.body.error, /Cannot move/);

    const review = await requestJson(app, "POST", `/publishing/approvals/${approvalId}/transition`, {
      token: "owner-token",
      body: { state: "human_review", groundingSummary: "Grounded against available provenance." },
    });
    assert.equal(review.status, 200);
    assert.equal(review.body.approval.state, "human_review");

    const approved = await requestJson(app, "POST", `/publishing/approvals/${approvalId}/transition`, {
      token: "owner-token",
      body: { state: "approved", note: "Human review accepted." },
    });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.approval.state, "approved");

    const scheduledWithoutDate = await requestJson(app, "POST", `/publishing/approvals/${approvalId}/transition`, {
      token: "owner-token",
      body: { state: "scheduled" },
    });
    assert.equal(scheduledWithoutDate.status, 400);

    const published = await requestJson(app, "POST", `/publishing/approvals/${approvalId}/transition`, {
      token: "owner-token",
      body: { state: "published", visibility: "unlisted" },
    });
    assert.equal(published.status, 200);
    assert.equal(published.body.approval.state, "published");
    assert.equal(published.body.approval.document.status, "published");
    assert.equal(published.body.approval.document.visibility, "unlisted");

    const document = db.tables.documents.find((row) => row.id === DOC_ID);
    assert.equal(document?.status, "published");
    assert.equal(document?.visibility, "unlisted");

    const events = await requestJson(app, "GET", `/publishing/approvals/${approvalId}/events`, {
      token: "owner-token",
    });
    assert.equal(events.status, 200);
    assert.deepEqual(
      events.body.events.map((event: Row) => event.toState).sort(),
      ["approved", "grounding_check", "human_review", "published"].sort(),
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});
