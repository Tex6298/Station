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

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: OWNER_ID, email: "owner@example.test", tier: "private", is_admin: false },
      { id: OTHER_ID, email: "other@example.test", tier: "private", is_admin: false },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        visibility: "private",
        provider: "platform",
        created_at: "2026-06-06T04:00:00.000Z",
        updated_at: "2026-06-06T04:00:00.000Z",
      },
    ],
    continuity_records: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        record_type: "memory",
        title: "Existing memory marker",
        body: "Existing private continuity body.",
        summary: "Existing summary.",
        source_table: "memory_items",
        source_id: "55555555-5555-4555-8555-555555555555",
        source_label: "Memory / Existing",
        source_version: 1,
        visibility: "private",
        version: 1,
        metadata: { imported: false },
        occurred_at: "2026-06-06T04:01:00.000Z",
        created_at: "2026-06-06T04:02:00.000Z",
        updated_at: "2026-06-06T04:02:00.000Z",
      },
    ],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-06T05:00:00.000Z");
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

    if (table === "continuity_records") {
      row.persona_id ??= null;
      row.title ??= null;
      row.body ??= null;
      row.summary ??= null;
      row.source_table ??= null;
      row.source_id ??= null;
      row.source_label ??= null;
      row.source_version ??= 1;
      row.visibility ??= "private";
      row.version ??= 1;
      row.metadata ??= {};
      row.occurred_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" = "select";
  private payload: Row | Row[] | null = null;

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
    } else {
      rows = this.matchingRows();
    }

    const data = clone(rows);

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

async function createContinuityRecordsApp() {
  const { continuityRouter } = await import("./continuity.js");
  const app = express();
  app.use(express.json());
  app.use("/continuity", continuityRouter);
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

test("owner can create and read continuity alpha records without spoofing ownership", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createContinuityRecordsApp();

  try {
    const visitor = await requestJson(app, "GET", `/continuity/persona/${PERSONA_ID}/records`);
    assert.equal(visitor.status, 401);

    const otherList = await requestJson(app, "GET", `/continuity/persona/${PERSONA_ID}/records`, {
      token: "other-token",
    });
    assert.equal(otherList.status, 404);

    const created = await requestJson(app, "POST", `/continuity/persona/${PERSONA_ID}/records`, {
      token: "owner-token",
      body: {
        ownerUserId: OTHER_ID,
        recordType: "timeline",
        title: "First continuity marker",
        body: "The owner names a stable timeline marker.",
        source: {
          table: "archived_chat_transcripts",
          id: "66666666-6666-4666-8666-666666666666",
          label: "Archived chat / Harbor working chat",
          version: 2,
        },
        visibility: "private",
        metadata: { confidence: "high" },
        occurredAt: "2026-06-06T04:30:00.000Z",
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.record.ownerUserId, OWNER_ID);
    assert.equal(created.body.record.source.version, 2);
    assert.equal(created.body.record.sourceTable, "archived_chat_transcripts");
    assert.equal(created.body.record.sourceVersion, 2);
    assert.equal(db.tables.continuity_records.at(-1)!.owner_user_id, OWNER_ID);
    assert.equal(db.tables.continuity_records.at(-1)!.ownerUserId, undefined);

    const listed = await requestJson(app, "GET", `/continuity/persona/${PERSONA_ID}/records?recordType=timeline`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.records.length, 1);
    assert.equal(listed.body.records[0].id, created.body.record.id);
    assert.deepEqual(listed.body.records[0].metadata, { confidence: "high" });

    const readBack = await requestJson(app, "GET", `/continuity/records/${created.body.record.id}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.equal(readBack.body.record.title, "First continuity marker");

    const blockedRead = await requestJson(app, "GET", `/continuity/records/${created.body.record.id}`, {
      token: "other-token",
    });
    assert.equal(blockedRead.status, 404);

    const invalid = await requestJson(app, "POST", `/continuity/persona/${PERSONA_ID}/records`, {
      token: "owner-token",
      body: {
        recordType: "timeline",
        source: { table: "memory_items" },
      },
    });
    assert.equal(invalid.status, 400);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
