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
    ],
    persona_files: [],
    import_jobs: [],
    memory_items: [],
    canon_items: [],
    calibration_sessions: [],
    documents: [],
    archived_chat_transcripts: [],
  };

  failInsertTables = new Set<string>();
  removedStoragePaths: string[] = [];
  signedUploadPaths: string[] = [];
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
        download: async (_path: string) => ({
          data: { text: async () => "downloaded archive text" },
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
