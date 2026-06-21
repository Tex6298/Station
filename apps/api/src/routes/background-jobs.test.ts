import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { backgroundJobsRouter } from "./background-jobs";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class BackgroundJobsTestSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", email: "owner@example.test", tier: "creator", is_admin: false },
      { id: "other-user", email: "other@example.test", tier: "creator", is_admin: false },
    ],
    import_jobs: [
      {
        id: "import-job-1",
        persona_id: "f89e9a31-48a4-4f9a-bf47-49a52477e801",
        owner_user_id: "owner-user",
        kind: "file",
        status: "failed",
        source_name: "archive from https://private.example.test/raw?token=abc",
        file_id: "34dbaf72-8ef6-4af7-8f0f-e08e8debf185",
        error_message:
          "Parse failed at https://private.example.test/raw with Bearer abc.def and private_text=secret-body owner_id=owner-user",
        created_at: "2026-06-21T08:00:00.000Z",
        updated_at: "2026-06-21T08:05:00.000Z",
      },
      {
        id: "other-import-job",
        persona_id: "other-persona",
        owner_user_id: "other-user",
        kind: "chat",
        status: "completed",
        source_name: "other owner's import",
        file_id: null,
        error_message: null,
        created_at: "2026-06-21T07:00:00.000Z",
        updated_at: "2026-06-21T07:01:00.000Z",
      },
    ],
    export_packages: [
      {
        id: "export-job-1",
        owner_user_id: "owner-user",
        persona_id: null,
        developer_space_id: "aa2b4492-a543-40df-8876-b7da59b8b000",
        status: "requested",
        package_kind: "developer_space_json https://private.example.test/package",
        error_message: "Export failed for developer_space_id=aa2b4492-a543-40df-8876-b7da59b8b000 using whsec_test_secret",
        requested_at: "2026-06-21T08:03:00.000Z",
        completed_at: null,
        created_at: "2026-06-21T08:03:00.000Z",
        updated_at: "2026-06-21T08:06:00.000Z",
      },
      {
        id: "other-export-job",
        owner_user_id: "other-user",
        persona_id: "other-persona",
        developer_space_id: null,
        status: "completed",
        package_kind: "persona_export",
        error_message: null,
        requested_at: "2026-06-21T06:00:00.000Z",
        completed_at: "2026-06-21T06:01:00.000Z",
        created_at: "2026-06-21T06:00:00.000Z",
        updated_at: "2026-06-21T06:01:00.000Z",
      },
    ],
  };

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
    from: (table: string) => new Query(this, table),
  };

  rows(table: string) {
    return this.tables[table] ?? [];
  }
}

class Query {
  private filters: Array<[string, unknown]> = [];
  private orderField: string | null = null;
  private orderAscending = true;

  constructor(private db: BackgroundJobsTestSupabase, private table: string) {}

  select(_columns?: string) {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderField = field;
    this.orderAscending = options.ascending ?? true;
    return this;
  }

  limit(count: number) {
    return Promise.resolve({ data: this.readRows().slice(0, count), error: null });
  }

  single() {
    const row = this.readRows()[0] ?? null;
    return Promise.resolve(
      row
        ? { data: row, error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }

  private readRows() {
    let rows = this.db.rows(this.table).filter((candidate) =>
      this.filters.every(([field, value]) => candidate[field] === value)
    );

    if (this.orderField) {
      const field = this.orderField;
      const direction = this.orderAscending ? 1 : -1;
      rows = [...rows].sort((a, b) => String(a[field] ?? "").localeCompare(String(b[field] ?? "")) * direction);
    }

    return rows;
  }
}

function createBackgroundJobsApp() {
  const app = express();
  app.use(express.json());
  app.use("/background-jobs", backgroundJobsRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method, headers });
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

function useBackgroundJobFakes(db: BackgroundJobsTestSupabase) {
  setSupabaseAdminForTests(db.client as any);
}

function resetBackgroundJobFakes() {
  setSupabaseAdminForTests(null);
}

test("owner background job readback requires authentication", async () => {
  const db = new BackgroundJobsTestSupabase();
  useBackgroundJobFakes(db);
  const app = createBackgroundJobsApp();

  try {
    const response = await requestJson(app, "GET", "/background-jobs");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Missing or invalid Authorization header.");
  } finally {
    resetBackgroundJobFakes();
  }
});

test("owner background job readback combines owned import/export summaries safely", async () => {
  const db = new BackgroundJobsTestSupabase();
  useBackgroundJobFakes(db);
  const app = createBackgroundJobsApp();

  try {
    const response = await requestJson(app, "GET", "/background-jobs", { token: "owner-token" });
    assert.equal(response.status, 200);
    assert.equal(response.body.summary.total, 2);
    assert.equal(response.body.summary.queued, 1);
    assert.equal(response.body.summary.failed, 1);

    assert.deepEqual(response.body.jobs.map((job: Row) => job.id), ["export-job-1", "import-job-1"]);
    assert.deepEqual(response.body.jobs.map((job: Row) => job.kind), ["export_assembly", "archive_extraction"]);
    assert.equal(response.body.jobs[0].statusStore, "export_packages");
    assert.equal(response.body.jobs[1].statusStore, "import_jobs");

    const serialized = JSON.stringify(response.body);
    assert.doesNotMatch(serialized, /other-import-job|other-export-job|other-owner/i);
    assert.doesNotMatch(serialized, /owner_user_id|ownerUserId|persona_id|personaId|developer_space_id|developerSpaceId|resourceId/);
    assert.doesNotMatch(serialized, /https:\/\/private\.example\.test/);
    assert.doesNotMatch(serialized, /Bearer abc\.def|whsec_test_secret|secret-body/);
    assert.doesNotMatch(serialized, /f89e9a31-48a4-4f9a-bf47-49a52477e801|aa2b4492-a543-40df-8876-b7da59b8b000/);
    assert.match(response.body.jobs[0].label, /\[redacted-url\]/);
    assert.match(response.body.jobs[1].label, /\[redacted-url\]/);
    assert.match(response.body.jobs[0].errorSummary, /\[redacted-id\]|\[id\]/);
    assert.match(response.body.jobs[1].errorSummary, /Parse failed/);
  } finally {
    resetBackgroundJobFakes();
  }
});

test("owner background job readback reports route-followup kinds as inactive", async () => {
  const db = new BackgroundJobsTestSupabase();
  useBackgroundJobFakes(db);
  const app = createBackgroundJobsApp();

  try {
    const response = await requestJson(app, "GET", "/background-jobs", { token: "owner-token" });
    assert.equal(response.status, 200);
    assert.equal(response.body.summary.inactiveKinds, 4);
    assert.deepEqual(
      response.body.inactiveKinds.map((job: Row) => job.kind).sort(),
      ["developer_space_import_batch", "embedding_backfill", "memory_consolidation", "replay_seed_setup"]
    );
    assert.equal(response.body.inactiveKinds.every((job: Row) => job.status === "inactive"), true);
    assert.equal(response.body.inactiveKinds.every((job: Row) => job.statusStore === "route_followup"), true);
    assert.match(
      response.body.inactiveKinds.find((job: Row) => job.kind === "developer_space_import_batch").reason,
      /until a batch job route exists/
    );
  } finally {
    resetBackgroundJobFakes();
  }
});
