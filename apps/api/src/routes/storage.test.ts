import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { storageRouter } from "./storage";
import {
  estimateStorageBytes,
  getStorageUsage,
  releaseStorageBytes,
  reserveStorageBytes,
  StorageLimitError,
  storageLimitBytesForTier,
} from "../services/storage.service";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";
process.env.EMBEDDING_PROFILE_CODE = "openai_1536";
delete process.env.EMBEDDINGS_PROVIDER;
delete process.env.OPENAI_API_KEY;

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";
const SECOND_PERSONA_ID = "44444444-4444-4444-8444-444444444444";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        tier: "private",
        is_admin: false,
      },
      {
        id: OTHER_ID,
        email: "other@example.test",
        tier: "visitor",
        is_admin: false,
      },
    ],
    storage_usage: [
      {
        user_id: OWNER_ID,
        bytes_used: 0,
        bytes_limit: 100,
        updated_at: "2026-06-06T09:00:00.000Z",
      },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
      },
      {
        id: SECOND_PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Beacon",
      },
    ],
    persona_files: [],
    import_jobs: [],
    memory_items: [],
    memory_item_lifecycle: [],
    canon_items: [],
    continuity_candidates: [],
    calibration_sessions: [],
    continuity_records: [],
    integrity_sessions: [],
    documents: [],
    archived_chat_transcripts: [],
  };

  failInsertTables = new Set<string>();
  failSelectTables = new Set<string>();
  removedStoragePaths: string[] = [];
  signedUploadPaths: string[] = [];
  storageDownloads = new Map<string, string>();
  rpcCalls: Array<{ functionName: string; args: Record<string, unknown> }> = [];

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-06T10:00:00.000Z");
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
    rpc: async (functionName: string, args: Record<string, any>) => {
      this.rpcCalls.push({ functionName, args });
      if (functionName === "reserve_storage_bytes") {
        return this.reserveStorage(String(args.p_user_id), Number(args.p_bytes));
      }
      if (functionName === "release_storage_bytes") {
        return this.releaseStorage(String(args.p_user_id), Number(args.p_bytes));
      }
      return { data: null, error: { message: `No ${functionName} RPC in tests.` } };
    },
    storage: {
      from: (_bucket: string) => ({
        createSignedUploadUrl: async (path: string) => {
          this.signedUploadPaths.push(path);
          return {
            data: {
              signedUrl: `https://storage.example.test/${path}`,
              token: `token:${path}`,
            },
            error: null,
          };
        },
        remove: async (paths: string[]) => {
          this.removedStoragePaths.push(...paths);
          return { data: paths, error: null };
        },
        download: async (path: string) => ({
          data: { text: async () => this.storageDownloads.get(path) ?? "downloaded archive text" },
          error: null,
        }),
      }),
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

  private ensureStorageUsage(userId: string) {
    const existing = this.rows("storage_usage").find((row) => row.user_id === userId);
    if (existing) return existing;

    const profile = this.rows("profiles").find((row) => row.id === userId);
    const row = {
      user_id: userId,
      bytes_used: 0,
      bytes_limit: storageLimitBytesForTier(profile?.tier ?? "visitor"),
      updated_at: this.timestamp(),
    };
    this.rows("storage_usage").push(row);
    return row;
  }

  private reserveStorage(userId: string, bytes: number) {
    if (bytes < 0) {
      return { data: null, error: { message: "Storage byte reservation must be non-negative." } };
    }
    const row = this.ensureStorageUsage(userId);
    if (row.bytes_used + bytes > row.bytes_limit) {
      return { data: null, error: { message: "Storage Limit Reached" } };
    }
    row.bytes_used += bytes;
    row.updated_at = this.timestamp();
    return { data: clone(row), error: null };
  }

  private releaseStorage(userId: string, bytes: number) {
    if (bytes < 0) {
      return { data: null, error: { message: "Storage byte release must be non-negative." } };
    }
    const row = this.ensureStorageUsage(userId);
    row.bytes_used = Math.max(0, row.bytes_used - bytes);
    row.updated_at = this.timestamp();
    return { data: clone(row), error: null };
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };

    if (table !== "storage_usage") row.id ??= this.nextId(table);

    if (table === "persona_files") {
      row.file_type ??= null;
      row.file_size ??= null;
      row.source_type ??= "upload";
      row.processed ??= false;
      row.created_at ??= now;
    }

    if (table === "import_jobs") {
      row.status ??= "queued";
      row.file_id ??= null;
      row.error_message ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "memory_items") {
      row.title ??= null;
      row.summary ??= null;
      row.embedding ??= null;
      row.relevance_weight ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "archived_chat_transcripts") {
      row.source_summary ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "continuity_candidates") {
      row.archived_chat_transcript_id ??= null;
      row.source_table ??= null;
      row.source_id ??= null;
      row.source_label ??= null;
      row.status ??= "pending";
      row.source_message_ids ??= [];
      row.accepted_target_type ??= null;
      row.accepted_target_id ??= null;
      row.accepted_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "memory_item_lifecycle") {
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
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
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

  private async execute(mode?: "single" | "maybeSingle") {
    let rows: Row[];

    if (this.operation === "insert") {
      if (this.db.failInsertTables.has(this.table)) {
        return { data: null, error: { message: `Forced insert failure for ${this.table}.` } };
      }
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
      if (this.db.failSelectTables.has(this.table)) {
        return { data: null, error: { message: `Forced select failure for ${this.table}.` } };
      }
      rows = this.matchingRows();
    }

    const data = clone(rows);

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }

    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: null };
    }

    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function storageRow(db: InMemorySupabase, userId = OWNER_ID) {
  const row = db.tables.storage_usage.find((usage) => usage.user_id === userId);
  assert.ok(row);
  return row;
}

function createStorageApp() {
  const app = express();
  app.use(express.json());
  app.use("/storage", storageRouter);
  return app;
}

async function createPersonaFilesApp() {
  const { personaFilesRouter } = await import("./persona-files.js");
  const app = express();
  app.use(express.json());
  app.use("/persona-files", personaFilesRouter);
  return app;
}

async function createImportsApp() {
  const { importsRouter } = await import("./imports.js");
  const app = express();
  app.use(express.json());
  app.use("/imports", importsRouter);
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

async function waitFor(predicate: () => boolean, timeoutMs = 1000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(predicate(), true);
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

function resetStorageFake() {
  setSupabaseAdminForTests(null);
}

test("storage service reserves, releases, clamps, and enforces tier limits", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    assert.equal(storageLimitBytesForTier("visitor"), 0);
    assert.equal(storageLimitBytesForTier("private"), 5 * 1024 * 1024 * 1024);
    assert.equal(storageLimitBytesForTier("unknown"), 0);
    assert.equal(estimateStorageBytes("hello"), 5);

    const reserved = await reserveStorageBytes(OWNER_ID, 40);
    assert.equal(reserved.bytes_used, 40);
    assert.equal(storageRow(db).bytes_used, 40);

    const released = await releaseStorageBytes(OWNER_ID, 15);
    assert.equal(released.bytes_used, 25);

    const clamped = await releaseStorageBytes(OWNER_ID, 999);
    assert.equal(clamped.bytes_used, 0);
    assert.equal(storageRow(db).bytes_used, 0);

    await assert.rejects(
      () => reserveStorageBytes(OWNER_ID, 101),
      StorageLimitError
    );
    assert.equal(storageRow(db).bytes_used, 0);
  } finally {
    resetStorageFake();
  }
});

test("/storage/me returns owner-scoped usage, tier limits, and category estimates", async () => {
  const db = new InMemorySupabase();
  storageRow(db).bytes_used = 65;
  db.insertRow("persona_files", {
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    file_name: "source.txt",
    file_size: 12,
    storage_path: "owner/source.txt",
  });
  db.insertRow("import_jobs", {
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    kind: "chat",
    source_name: "chat export",
    error_message: "parse warning",
  });
  db.insertRow("memory_items", {
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    title: "Memory",
    content: "remember this",
    summary: "short",
  });
  db.insertRow("archived_chat_transcripts", {
    conversation_id: "conversation-1",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    title: "Archived chat",
    transcript_markdown: "User: hello\nAssistant: hi",
    source_summary: "greeting",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createStorageApp();

  try {
    const blocked = await requestJson(app, "GET", "/storage/me");
    assert.equal(blocked.status, 401);

    const response = await requestJson(app, "GET", "/storage/me", {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.storage.bytesUsed, 65);
    assert.equal(response.body.storage.bytesLimit, 100);
    assert.equal(response.body.storage.percentUsed, 65);
    assert.equal(response.body.storage.categories.uploadedFiles, 12);
    assert.equal(response.body.storage.categories.importedContent > 0, true);
    assert.equal(response.body.storage.categories.memoryItems > 0, true);
    assert.equal(response.body.storage.categories.archivedChatTranscripts > 0, true);

    const other = await getStorageUsage(OTHER_ID);
    assert.equal(other.bytesLimit, 0);
    assert.equal(other.bytesUsed, 0);
  } finally {
    resetStorageFake();
  }
});

test("persona file upload preflight and registration keep storage accounting balanced", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaFilesApp();

  try {
    const uploadUrl = await requestJson(app, "GET", `/persona-files/persona/${PERSONA_ID}/upload-url?fileName=source.txt&fileSize=50`, {
      token: "owner-token",
    });

    assert.equal(uploadUrl.status, 200);
    assert.match(uploadUrl.body.storagePath, new RegExp(`${OWNER_ID}/${PERSONA_ID}/`));
    assert.equal(storageRow(db).bytes_used, 0);
    assert.equal(db.signedUploadPaths.length, 1);

    const tooLarge = await requestJson(app, "GET", `/persona-files/persona/${PERSONA_ID}/upload-url?fileName=large.txt&fileSize=101`, {
      token: "owner-token",
    });
    assert.equal(tooLarge.status, 413);
    assert.equal(storageRow(db).bytes_used, 0);
    assert.equal(db.signedUploadPaths.length, 1);

    const registered = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 40,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(registered.status, 201);
    assert.deepEqual(registered.body.jobExecution, {
      mode: "queued",
      workerQueue: false,
      reason: "processing_deferred",
    });
    assert.equal(storageRow(db).bytes_used, 40);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);

    const deleted = await requestJson(app, "DELETE", `/persona-files/${registered.body.file.id}`, {
      token: "owner-token",
    });

    assert.equal(deleted.status, 204);
    assert.equal(storageRow(db).bytes_used, 0);
    assert.equal(db.tables.persona_files.length, 0);
    assert.deepEqual(db.removedStoragePaths, ["owner/source.txt"]);
  } finally {
    resetStorageFake();
  }
});

test("persona file registration is idempotent for exact owner persona storage paths", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaFilesApp();

  try {
    const registered = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(registered.status, 201);
    assert.equal(storageRow(db).bytes_used, 10);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);
    assert.equal(db.tables.import_jobs[0].file_id, registered.body.file.id);

    const duplicate = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(duplicate.body.idempotent, true);
    assert.equal(duplicate.body.repaired, false);
    assert.equal(duplicate.body.file.id, registered.body.file.id);
    assert.equal(duplicate.body.job.id, registered.body.job.id);
    assert.equal(duplicate.body.job.file_id, registered.body.file.id);
    assert.equal(storageRow(db).bytes_used, 10);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);

    const sameNameDifferentPath = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 11,
        storagePath: "owner/source-copy.txt",
        processImmediately: false,
      },
    });

    assert.equal(sameNameDifferentPath.status, 201);
    assert.equal(storageRow(db).bytes_used, 21);
    assert.equal(db.tables.persona_files.length, 2);
    assert.equal(db.tables.import_jobs.length, 2);

    const exactDuplicateWithSameNameElsewhere = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(exactDuplicateWithSameNameElsewhere.status, 200);
    assert.equal(exactDuplicateWithSameNameElsewhere.body.duplicate, true);
    assert.equal(exactDuplicateWithSameNameElsewhere.body.idempotent, true);
    assert.equal(exactDuplicateWithSameNameElsewhere.body.importJobAmbiguous, false);
    assert.equal(exactDuplicateWithSameNameElsewhere.body.job.id, registered.body.job.id);
    assert.equal(storageRow(db).bytes_used, 21);
    assert.equal(db.tables.persona_files.length, 2);
    assert.equal(db.tables.import_jobs.length, 2);

    db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "source.txt",
      file_id: registered.body.file.id,
    });

    const ambiguousJobDuplicate = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(ambiguousJobDuplicate.status, 200);
    assert.equal(ambiguousJobDuplicate.body.duplicate, true);
    assert.equal(ambiguousJobDuplicate.body.idempotent, true);
    assert.equal(ambiguousJobDuplicate.body.importJobAmbiguous, true);
    assert.equal(ambiguousJobDuplicate.body.job, null);
    assert.equal(db.tables.import_jobs.length, 3);

    const samePathDifferentPersona = await requestJson(app, "POST", `/persona-files/persona/${SECOND_PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 12,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(samePathDifferentPersona.status, 201);
    assert.equal(storageRow(db).bytes_used, 33);
    assert.equal(db.tables.persona_files.length, 3);
    assert.equal(db.tables.import_jobs.length, 4);

    const otherOwnerRetry = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "other-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(otherOwnerRetry.status, 404);
    assert.equal(db.tables.persona_files.length, 3);
    assert.equal(db.tables.import_jobs.length, 4);
  } finally {
    resetStorageFake();
  }
});

test("persona file registration rolls back reserved bytes and file rows after job failure", async () => {
  const db = new InMemorySupabase();
  db.failInsertTables.add("import_jobs");
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaFilesApp();

  try {
    const response = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "bad-source.txt",
        fileType: "text/plain",
        fileSize: 40,
        storagePath: "owner/bad-source.txt",
        processImmediately: false,
      },
    });

    assert.equal(response.status, 500);
    assert.equal(storageRow(db).bytes_used, 0);
    assert.equal(db.tables.persona_files.length, 0);
    assert.deepEqual(db.removedStoragePaths, ["owner/bad-source.txt"]);
  } finally {
    resetStorageFake();
  }
});

test("persona file registration makes protected-alpha inline fallback visible", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaFilesApp();
  storageRow(db).bytes_limit = 1000;
  db.storageDownloads.set("owner/inline.txt", "inline fallback import text");

  try {
    const registered = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "inline.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/inline.txt",
        processImmediately: true,
      },
    });

    assert.equal(registered.status, 201);
    assert.deepEqual(registered.body.jobExecution, {
      mode: "inline_fallback",
      workerQueue: false,
      reason: "protected_alpha_no_worker",
    });

    await waitFor(() => db.tables.import_jobs[0]?.status === "completed");
    assert.equal(db.tables.memory_items.length, 1);
  } finally {
    resetStorageFake();
  }
});

test("persona file duplicate lookup failures fail closed without extra storage or jobs", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createPersonaFilesApp();

  try {
    const registered = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(registered.status, 201);
    assert.equal(storageRow(db).bytes_used, 10);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);

    db.failSelectTables.add("persona_files");
    const fileLookupFailed = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(fileLookupFailed.status, 500);
    assert.match(fileLookupFailed.body.error, /persona_files/);
    assert.equal(storageRow(db).bytes_used, 10);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);

    db.failSelectTables.delete("persona_files");
    db.failSelectTables.add("import_jobs");
    const jobLookupFailed = await requestJson(app, "POST", `/persona-files/persona/${PERSONA_ID}/register`, {
      token: "owner-token",
      body: {
        fileName: "source.txt",
        fileType: "text/plain",
        fileSize: 10,
        storagePath: "owner/source.txt",
        processImmediately: false,
      },
    });

    assert.equal(jobLookupFailed.status, 500);
    assert.match(jobLookupFailed.body.error, /import_jobs/);
    assert.equal(storageRow(db).bytes_used, 10);
    assert.equal(db.tables.persona_files.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);
  } finally {
    resetStorageFake();
  }
});

test("file import job runner claims durable file pointers, gates owners, and fails safely", async () => {
  const { runFileImportJobById } = await import("../services/file-import-jobs.service.js");
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  storageRow(db).bytes_limit = 1000;
  db.storageDownloads.set("owner/runner.txt", "runner import text for deterministic job processing");
  db.storageDownloads.set(
    "owner/broken.json",
    JSON.stringify({ unknown: { private: "runner secret should not appear" } })
  );

  try {
    const file = db.insertRow("persona_files", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "runner.txt",
      file_type: "text/plain",
      file_size: 20,
      storage_path: "owner/runner.txt",
    });
    const job = db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "runner.txt",
      file_id: file.id,
    });

    const completed = await runFileImportJobById({
      jobId: job.id,
      ownerUserId: OWNER_ID,
    });

    assert.equal(completed.job.status, "completed");
    assert.equal(completed.execution.mode, "inline_fallback");
    assert.equal(completed.execution.workerQueue, false);
    assert.equal(completed.execution.reason, "processed");
    assert.equal(completed.chunksCreated, 1);
    assert.equal(completed.idempotent, false);
    assert.equal(db.tables.persona_files.find((row) => row.id === file.id).processed, true);
    assert.equal(db.tables.memory_items.some((row) => row.archive_source_id === file.id), true);

    const rerun = await runFileImportJobById({
      jobId: job.id,
      ownerUserId: OWNER_ID,
    });
    assert.equal(rerun.job.status, "completed");
    assert.equal(rerun.idempotent, true);
    assert.equal(rerun.chunksCreated, 1);
    assert.equal(db.tables.memory_items.filter((row) => row.archive_source_id === file.id).length, 1);

    await assert.rejects(
      () => runFileImportJobById({
        jobId: job.id,
        ownerUserId: OTHER_ID,
      }),
      /Import job not found/
    );

    const missingPointerJob = db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "historical.txt",
      file_id: null,
    });

    await assert.rejects(
      () => runFileImportJobById({
        jobId: missingPointerJob.id,
        ownerUserId: OWNER_ID,
      }),
      /File import job is missing a durable file pointer/
    );
    assert.equal(db.tables.import_jobs.find((row) => row.id === missingPointerJob.id).status, "failed");

    const mismatchFile = db.insertRow("persona_files", {
      persona_id: SECOND_PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "mismatch.txt",
      file_type: "text/plain",
      file_size: 20,
      storage_path: "owner/mismatch.txt",
    });
    const mismatchJob = db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "mismatch.txt",
      file_id: mismatchFile.id,
    });

    await assert.rejects(
      () => runFileImportJobById({
        jobId: mismatchJob.id,
        ownerUserId: OWNER_ID,
      }),
      /Import job file persona mismatch/
    );
    assert.equal(db.tables.import_jobs.find((row) => row.id === mismatchJob.id).status, "failed");

    const preserved = db.insertRow("memory_items", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      title: "Preserved archive row",
      content: "This successful archive row must survive later job failure.",
      source_type: "import",
      archive_source_type: "persona_file",
      archive_source_id: "previous-file",
      archive_source_name: "previous import",
    });
    const brokenFile = db.insertRow("persona_files", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "broken.json",
      file_type: "text/plain",
      file_size: 20,
      storage_path: "owner/broken.json",
    });
    const brokenJob = db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "broken.json",
      file_id: brokenFile.id,
    });
    const memoryCountBeforeFailure = db.tables.memory_items.length;

    await assert.rejects(
      () => runFileImportJobById({
        jobId: brokenJob.id,
        ownerUserId: OWNER_ID,
      }),
      /Unsupported JSON import format/
    );

    assert.equal(db.tables.memory_items.length, memoryCountBeforeFailure);
    assert.equal(db.tables.memory_items.some((row) => row.id === preserved.id), true);
    const failedJob = db.tables.import_jobs.find((row) => row.id === brokenJob.id);
    assert.equal(failedJob.status, "failed");
    assert.match(failedJob.error_message, /Unsupported JSON import format/);
    assert.doesNotMatch(failedJob.error_message, /runner secret should not appear/);
  } finally {
    resetStorageFake();
  }
});

test("chat imports reserve text bytes and roll back when archive insert fails", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createImportsApp();
  const content = "Imported memory text for the archive.";

  try {
    const imported = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content,
        sourceName: "chat-import",
      },
    });

    assert.equal(imported.status, 201);
    assert.equal(imported.body.imported, true);
    assert.equal(storageRow(db).bytes_used, estimateStorageBytes(content));
    assert.equal(db.tables.memory_items.length, 1);
    assert.equal(db.tables.import_jobs[0].status, "completed");

    const duplicate = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content: "duplicate content should not create more archive rows",
        sourceName: "chat-import",
      },
    });

    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(duplicate.body.idempotent, true);
    assert.equal(duplicate.body.job.id, imported.body.job.id);
    assert.equal(duplicate.body.chunksCreated, 1);
    assert.equal(db.tables.memory_items.length, 1);
    assert.equal(db.tables.import_jobs.length, 1);

    const firstGenericPaste = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content: "first unnamed pasted archive",
        sourceName: "pasted-archive",
      },
    });
    assert.equal(firstGenericPaste.status, 201);

    const secondGenericPaste = await requestJson(app, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content: "second unnamed pasted archive",
        sourceName: "pasted-archive",
      },
    });
    assert.equal(secondGenericPaste.status, 201);
    assert.equal(secondGenericPaste.body.duplicate, undefined);
    assert.equal(db.tables.memory_items.length, 3);
    assert.equal(db.tables.import_jobs.length, 3);
  } finally {
    resetStorageFake();
  }

  const jobFailingDb = new InMemorySupabase();
  jobFailingDb.failInsertTables.add("import_jobs");
  setSupabaseAdminForTests(jobFailingDb.client as any);
  const jobFailingApp = await createImportsApp();

  try {
    const failedBeforeIngest = await requestJson(jobFailingApp, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content,
        sourceName: "failed-job-import",
      },
    });

    assert.equal(failedBeforeIngest.status, 500);
    assert.match(failedBeforeIngest.body.error, /import_jobs/);
    assert.equal(storageRow(jobFailingDb).bytes_used, 0);
    assert.equal(jobFailingDb.tables.memory_items.length, 0);
    assert.equal(jobFailingDb.tables.import_jobs.length, 0);
  } finally {
    resetStorageFake();
  }

  const failingDb = new InMemorySupabase();
  failingDb.failInsertTables.add("memory_items");
  setSupabaseAdminForTests(failingDb.client as any);
  const failingApp = await createImportsApp();

  try {
    const failed = await requestJson(failingApp, "POST", "/imports/chat", {
      token: "owner-token",
      body: {
        personaId: PERSONA_ID,
        content,
        sourceName: "failed-chat-import",
      },
    });

    assert.equal(failed.status, 500);
    assert.equal(storageRow(failingDb).bytes_used, 0);
    assert.equal(failingDb.tables.memory_items.length, 0);
    assert.equal(failingDb.tables.import_jobs[0].status, "failed");
  } finally {
    resetStorageFake();
  }
});

test("uploaded ChatGPT and Claude JSON parse explicitly while unknown JSON fails before archive memory", async () => {
  const { processUploadedFile } = await import("../services/archive.service.js");
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  storageRow(db).bytes_limit = 1000;

  db.storageDownloads.set(
    "owner/chatgpt.json",
    JSON.stringify({
      mapping: {
        second: {
          message: {
            author: { role: "assistant" },
            content: { parts: ["The answer came second."] },
            create_time: 2,
          },
        },
        first: {
          message: {
            author: { role: "user" },
            content: { parts: ["The question came first."] },
            create_time: 1,
          },
        },
      },
    })
  );
  db.storageDownloads.set(
    "owner/claude.json",
    JSON.stringify({
      chat_messages: [
        { sender: "assistant", text: "Claude second.", created_at: "2026-06-17T10:02:00.000Z" },
        { sender: "human", text: "Claude first.", created_at: "2026-06-17T10:01:00.000Z" },
      ],
    })
  );
  db.storageDownloads.set(
    "owner/unknown.json",
    JSON.stringify({ arbitrary: { private: "this must not become memory" } })
  );

  try {
    const chatGptFile = db.insertRow("persona_files", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "chatgpt.json",
      file_type: "application/json",
      file_size: 10,
      storage_path: "owner/chatgpt.json",
    });
    db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "chatgpt.json",
    });

    const chatGptProcessed = await processUploadedFile({
      personaId: PERSONA_ID,
      ownerUserId: OWNER_ID,
      fileId: chatGptFile.id,
      fileName: "chatgpt.json",
      fileType: "application/json",
      storagePath: "owner/chatgpt.json",
    });

    assert.equal(chatGptProcessed.chunksCreated, 1);
    assert.match(db.tables.memory_items[0].content, /\[user\]: The question came first\./);
    assert.match(db.tables.memory_items[0].content, /\[assistant\]: The answer came second\./);
    assert.equal(db.tables.memory_items[0].archive_source_name, "chatgpt.json (chatgpt import)");
    assert.equal(
      db.tables.memory_item_lifecycle.find((row) => row.memory_item_id === db.tables.memory_items[0].id)?.status,
      "quarantined"
    );
    const chatGptCandidates = db.tables.continuity_candidates.filter((row) => row.source_id === chatGptFile.id);
    assert.deepEqual(chatGptCandidates.map((row) => row.candidate_type).sort(), ["canon", "memory"]);
    assert.equal(chatGptCandidates.every((row) => row.source_table === "persona_files"), true);
    assert.equal(chatGptCandidates.every((row) => row.archived_chat_transcript_id === null), true);
    assert.equal(chatGptCandidates.every((row) => row.owner_user_id === OWNER_ID), true);
    assert.equal(chatGptCandidates.every((row) => row.status === "pending"), true);

    const claudeFile = db.insertRow("persona_files", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "claude.json",
      file_type: "application/json",
      file_size: 10,
      storage_path: "owner/claude.json",
    });
    db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "claude.json",
    });

    const claudeProcessed = await processUploadedFile({
      personaId: PERSONA_ID,
      ownerUserId: OWNER_ID,
      fileId: claudeFile.id,
      fileName: "claude.json",
      fileType: "application/json",
      storagePath: "owner/claude.json",
    });

    assert.equal(claudeProcessed.chunksCreated, 1);
    assert.match(db.tables.memory_items[1].content, /\[user\]: Claude first\./);
    assert.match(db.tables.memory_items[1].content, /\[assistant\]: Claude second\./);
    assert.equal(db.tables.memory_items[1].archive_source_name, "claude.json (claude import)");
    assert.equal(
      db.tables.memory_item_lifecycle.find((row) => row.memory_item_id === db.tables.memory_items[1].id)?.status,
      "quarantined"
    );
    const claudeCandidates = db.tables.continuity_candidates.filter((row) => row.source_id === claudeFile.id);
    assert.deepEqual(claudeCandidates.map((row) => row.candidate_type).sort(), ["canon", "memory"]);
    assert.equal(claudeCandidates.every((row) => row.source_table === "persona_files"), true);
    assert.equal(claudeCandidates.every((row) => row.source_label === "claude.json (claude import)"), true);

    const memoryCountBeforeUnknown = db.tables.memory_items.length;
    const candidateCountBeforeUnknown = db.tables.continuity_candidates.length;
    const storageBeforeUnknown = storageRow(db).bytes_used;
    const unknownFile = db.insertRow("persona_files", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      file_name: "unknown.json",
      file_type: "application/json",
      file_size: 10,
      storage_path: "owner/unknown.json",
    });
    db.insertRow("import_jobs", {
      persona_id: PERSONA_ID,
      owner_user_id: OWNER_ID,
      kind: "file",
      status: "queued",
      source_name: "unknown.json",
    });

    await assert.rejects(
      () => processUploadedFile({
        personaId: PERSONA_ID,
        ownerUserId: OWNER_ID,
        fileId: unknownFile.id,
        fileName: "unknown.json",
        fileType: "text/plain",
        storagePath: "owner/unknown.json",
      }),
      /Unsupported JSON import format/
    );

    assert.equal(db.tables.memory_items.length, memoryCountBeforeUnknown);
    assert.equal(db.tables.continuity_candidates.length, candidateCountBeforeUnknown);
    assert.equal(storageRow(db).bytes_used, storageBeforeUnknown);
    const failedJob = db.tables.import_jobs.find((job) => job.source_name === "unknown.json");
    assert.equal(failedJob.status, "failed");
    assert.match(failedJob.error_message, /Unsupported JSON import format/);
    assert.doesNotMatch(failedJob.error_message, /this must not become memory/);
  } finally {
    resetStorageFake();
  }
});

test("/imports/archive/search is owner-scoped, filtered, and sanitized", async () => {
  const db = new InMemorySupabase();
  const now = "2026-06-06T11:00:00.000Z";

  db.insertRow("memory_items", {
    id: "memory-blue-lantern",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    title: "Blue lantern memory",
    content: "The private blue lantern phrase belongs only to the replay owner.",
    summary: "Blue lantern continuity clue.",
    source_type: "manual",
    created_at: now,
    updated_at: now,
  });
  db.insertRow("memory_items", {
    id: "other-memory-blue-lantern",
    persona_id: PERSONA_ID,
    owner_user_id: OTHER_ID,
    title: "Blue lantern other owner",
    content: "Other owner row must not appear in owner search.",
    summary: "Other owner private memory.",
    source_type: "manual",
    created_at: now,
    updated_at: now,
  });
  db.insertRow("canon_items", {
    id: "canon-silver-compass",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    title: "Silver compass canon",
    content: "Silver compass stays steady across archive work.",
    source_type: "manual",
    priority: 5,
    created_at: now,
    updated_at: now,
  });
  db.insertRow("continuity_records", {
    id: "continuity-meridian",
    owner_user_id: OWNER_ID,
    persona_id: PERSONA_ID,
    record_type: "memory",
    title: "Meridian Loom record",
    body: "Meridian Loom is synthetic staging continuity.",
    summary: "Meridian Loom continuity note.",
    source_label: "Replay continuity",
    visibility: "private",
    occurred_at: now,
    created_at: now,
    updated_at: now,
  });
  db.insertRow("import_jobs", {
    id: "import-broken-secret",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    kind: "chat",
    status: "failed",
    source_name: "Broken ChatGPT export",
    error_message: "Provider failed with sk-test-secret-token and token=super-private-token",
    created_at: now,
    updated_at: now,
  });
  db.insertRow("archived_chat_transcripts", {
    id: "archived-chat-blue",
    conversation_id: "conversation-blue",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    title: "Blue lantern conversation",
    transcript_markdown: "This full transcript must not be returned by search.",
    source_summary: "Archived conversation mentions blue lantern.",
    message_count: 2,
    created_at: now,
    updated_at: now,
  });
  db.insertRow("persona_files", {
    id: "file-compass",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    file_name: "silver-compass-notes.md",
    file_type: "text/markdown",
    source_type: "upload",
    processed: true,
    created_at: now,
  });
  db.insertRow("integrity_sessions", {
    id: "integrity-replay",
    persona_id: PERSONA_ID,
    owner_user_id: OWNER_ID,
    session_type: "baseline",
    status: "completed",
    clusters_covered: ["identity"],
    clusters_planned: ["identity"],
    started_at: now,
    completed_at: now,
    created_at: now,
    updated_at: now,
  });
  db.insertRow("documents", {
    id: "document-replay",
    author_user_id: OWNER_ID,
    persona_id: PERSONA_ID,
    title: "Replay field log",
    body: "Public-safe field log references silver compass.",
    document_type: "field_log",
    status: "draft",
    visibility: "private",
    created_at: now,
    updated_at: now,
  });

  setSupabaseAdminForTests(db.client as any);
  const app = await createImportsApp();

  try {
    const anonymous = await requestJson(app, "GET", "/imports/archive/search?q=blue");
    assert.equal(anonymous.status, 401);

    const owner = await requestJson(app, "GET", "/imports/archive/search?q=blue&limit=10", {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.items.some((item: Row) => item.id === "memory-blue-lantern"), true);
    assert.equal(owner.body.items.some((item: Row) => item.id === "archived-chat-blue"), true);
    assert.equal(owner.body.items.every((item: Row) => item.privacy === "owner_only"), true);
    assert.equal(owner.body.items.some((item: Row) => item.id === "other-memory-blue-lantern"), false);
    assert.doesNotMatch(JSON.stringify(owner.body), /full transcript must not be returned/i);

    const other = await requestJson(app, "GET", "/imports/archive/search?q=Meridian", {
      token: "other-token",
    });
    assert.equal(other.status, 200);
    assert.deepEqual(other.body.items, []);

    const continuity = await requestJson(app, "GET", "/imports/archive/search?q=Meridian&type=continuity", {
      token: "owner-token",
    });
    assert.equal(continuity.status, 200);
    assert.deepEqual(continuity.body.items.map((item: Row) => item.kind), ["continuity"]);

    const failedImport = await requestJson(app, "GET", "/imports/archive/search?q=Broken&type=import&status=failed", {
      token: "owner-token",
    });
    assert.equal(failedImport.status, 200);
    assert.equal(failedImport.body.items.length, 1);
    assert.equal(failedImport.body.items[0].kind, "import_job");
    assert.match(failedImport.body.items[0].summary, /\[redacted\]/);
    assert.doesNotMatch(JSON.stringify(failedImport.body), /sk-test-secret-token/);
    assert.doesNotMatch(JSON.stringify(failedImport.body), /super-private-token/);

    const bounded = await requestJson(app, "GET", "/imports/archive/search?limit=2", {
      token: "owner-token",
    });
    assert.equal(bounded.status, 200);
    assert.equal(bounded.body.items.length <= 2, true);
  } finally {
    resetStorageFake();
  }
});

test("archive memory writes reserve bytes and release them on insert rollback", async () => {
  const { addMemoryItem } = await import("../services/archive.service.js");
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    const memory = await addMemoryItem({
      personaId: PERSONA_ID,
      ownerUserId: OWNER_ID,
      title: "Archive memory",
      content: "Remember this archive fact.",
      summary: "Archive fact.",
      sourceType: "chat",
    });

    assert.equal(memory.title, "Archive memory");
    assert.equal(
      storageRow(db).bytes_used,
      estimateStorageBytes("Archive memory\nRemember this archive fact.\nArchive fact.")
    );
  } finally {
    resetStorageFake();
  }

  const failingDb = new InMemorySupabase();
  failingDb.failInsertTables.add("memory_items");
  setSupabaseAdminForTests(failingDb.client as any);

  try {
    await assert.rejects(() => addMemoryItem({
      personaId: PERSONA_ID,
      ownerUserId: OWNER_ID,
      title: "Failed memory",
      content: "This should not leak reserved bytes.",
      summary: "Rollback.",
      sourceType: "chat",
    }));

    assert.equal(storageRow(failingDb).bytes_used, 0);
    assert.equal(failingDb.tables.memory_items.length, 0);
  } finally {
    resetStorageFake();
  }
});

test("archive memory writes active embedding metadata and rejects mixed dimensions", async () => {
  const { addMemoryItem } = await import("../services/archive.service.js");
  const restoreFetch = mockEmbeddingFetch(new Array(1536).fill(0.001));
  process.env.OPENAI_API_KEY = "test-openai-key";
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    const memory = await addMemoryItem({
      personaId: PERSONA_ID,
      ownerUserId: OWNER_ID,
      title: "Embedded archive memory",
      content: "This vector should match the active retrieval index.",
      summary: "Vector contract.",
      sourceType: "chat",
    });

    assert.equal(memory.embedding.length, 1536);
    assert.equal(memory.embedding_provider, "openai");
    assert.equal(memory.embedding_model, "text-embedding-3-small");
    assert.equal(memory.embedding_dimension, 1536);
    assert.equal(memory.embedding_index_name, "memory_items_embedding_1536");
    assert.equal(memory.embedding_index_source, "supabase_pgvector");
    assert.equal(memory.embedding_backfill_version, 1);
  } finally {
    resetStorageFake();
    restoreFetch();
    delete process.env.OPENAI_API_KEY;
  }

  const restoreBadFetch = mockEmbeddingFetch([0.1, 0.2]);
  process.env.OPENAI_API_KEY = "test-openai-key";
  const failingDb = new InMemorySupabase();
  setSupabaseAdminForTests(failingDb.client as any);

  try {
    await assert.rejects(
      () => addMemoryItem({
        personaId: PERSONA_ID,
        ownerUserId: OWNER_ID,
        title: "Bad vector memory",
        content: "This provider response should be rejected before insert.",
        sourceType: "chat",
      }),
      /Embedding dimension mismatch: expected 1536, received 2/
    );
    assert.equal(storageRow(failingDb).bytes_used, 0);
    assert.equal(failingDb.tables.memory_items.length, 0);
  } finally {
    resetStorageFake();
    restoreBadFetch();
    delete process.env.OPENAI_API_KEY;
  }
});

function mockEmbeddingFetch(vector: number[]) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => ({ data: [{ index: 0, embedding: vector }] }),
    text: async () => "",
  })) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = originalFetch;
  };
}
