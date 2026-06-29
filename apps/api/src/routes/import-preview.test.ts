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

class ImportPreviewSupabase {
  tableCalls: string[] = [];
  writeCalls: string[] = [];
  storageCalls: string[] = [];

  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", email: "owner@example.test", tier: "creator", is_admin: false },
      { id: "other-user", email: "other@example.test", tier: "creator", is_admin: false },
    ],
    personas: [
      { id: "11111111-1111-4111-8111-111111111111", owner_user_id: "owner-user", name: "Owner Persona" },
      { id: "22222222-2222-4222-8222-222222222222", owner_user_id: "other-user", name: "Other Persona" },
    ],
    import_jobs: [],
    persona_files: [],
    memory_items: [],
    canon_items: [],
    continuity_candidates: [],
    documents: [],
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
    from: (table: string) => {
      this.tableCalls.push(table);
      return new PreviewQuery(this, table);
    },
    storage: {
      from: (bucket: string) => {
        this.storageCalls.push(bucket);
        throw new Error("storage should not be touched during import preview");
      },
    },
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class PreviewQuery {
  private filters: Array<[string, unknown]> = [];

  constructor(private db: ImportPreviewSupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  single() {
    const row = this.db.rows(this.table).find((candidate) =>
      this.filters.every(([field, value]) => candidate[field] === value)
    );
    return Promise.resolve(
      row
        ? { data: clone(row), error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }

  insert(payload: unknown) {
    this.db.writeCalls.push(`${this.table}.insert:${JSON.stringify(payload)}`);
    throw new Error(`${this.table} insert should not run during import preview`);
  }

  update(payload: unknown) {
    this.db.writeCalls.push(`${this.table}.update:${JSON.stringify(payload)}`);
    throw new Error(`${this.table} update should not run during import preview`);
  }

  delete() {
    this.db.writeCalls.push(`${this.table}.delete`);
    throw new Error(`${this.table} delete should not run during import preview`);
  }
}

async function createImportPreviewApp() {
  const { importsRouter } = await import("./imports.js");
  const app = express();
  app.use(express.json({ limit: "1mb" }));
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function baseBody(overrides: Row = {}) {
  return {
    personaId: "11111111-1111-4111-8111-111111111111",
    sourceKind: "file",
    sourceName: "source.txt",
    fileType: "text/plain",
    content: "Plain archive text for the preview.",
    ...overrides,
  };
}

function assertNoPreviewWrites(db: ImportPreviewSupabase) {
  assert.equal(db.writeCalls.length, 0);
  assert.equal(db.storageCalls.length, 0);
  for (const table of ["import_jobs", "persona_files", "memory_items", "canon_items", "continuity_candidates", "documents"]) {
    assert.equal(db.tableCalls.includes(table), false, `${table} should not be queried or written during preview`);
    assert.equal(db.rows(table).length, 0, `${table} changed during preview`);
  }
}

function assertSafePreviewBody(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    "private-source-marker",
    "sk-test-secret-token",
    "token=abc123",
    "https://example.invalid",
    "/r/StationLab/comments/private_thread",
    "storage_path",
    "signedUrl",
    "uploadUrl",
    "import_jobs",
    "persona_files",
    "memory_items",
    "canon_items",
    "continuity_candidates",
    "SQL",
    "stack",
    "provider payload",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked from preview response`);
  }
}

test("import preview rejects signed-out and cross-owner requests without source leakage", async () => {
  const db = new ImportPreviewSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createImportPreviewApp();

  try {
    const signedOut = await requestJson(app, "POST", "/imports/preview", {
      body: baseBody({ content: "private-source-marker" }),
    });
    assert.equal(signedOut.status, 401);
    assert.equal(db.tableCalls.length, 0);
    assertSafePreviewBody(signedOut.body);

    const crossOwner = await requestJson(app, "POST", "/imports/preview", {
      token: "owner-token",
      body: baseBody({
        personaId: "22222222-2222-4222-8222-222222222222",
        content: "private-source-marker should not echo",
      }),
    });
    assert.equal(crossOwner.status, 404);
    assert.deepEqual(crossOwner.body, { error: "Persona not found." });
    assertSafePreviewBody(crossOwner.body);
    assertNoPreviewWrites(db);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("import preview summarizes supported local formats without raw source text", async () => {
  const db = new ImportPreviewSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createImportPreviewApp();
  const supportedCases = [
    {
      body: baseBody({ sourceName: "notes.txt", fileType: "text/plain", content: "plain private-source-marker text" }),
      expectedFormat: "text",
      expectedMessages: null,
    },
    {
      body: baseBody({ sourceName: "notes.md", fileType: "text/markdown", content: "# private-source-marker heading" }),
      expectedFormat: "markdown",
      expectedMessages: null,
    },
    {
      body: baseBody({
        sourceName: "chatgpt.json",
        fileType: "application/json",
        content: JSON.stringify({
          title: "Harbor replay private-source-marker",
          mapping: {
            one: {
              message: {
                author: { role: "user" },
                content: { parts: ["private-source-marker user text"] },
                create_time: 1,
              },
            },
          },
        }),
      }),
      expectedFormat: "chatgpt",
      expectedMessages: 1,
    },
    {
      body: baseBody({
        sourceName: "claude.json",
        fileType: "application/json",
        content: JSON.stringify({
          name: "Claude private-source-marker",
          chat_messages: [{ sender: "human", text: "private-source-marker human text", created_at: "2026-06-17T10:01:00.000Z" }],
        }),
      }),
      expectedFormat: "claude",
      expectedMessages: 1,
    },
    {
      body: baseBody({
        sourceName: "reddit.json",
        fileType: "application/json",
        content: JSON.stringify({
          title: "Station private-source-marker",
          subreddit: "StationLab",
          permalink: "/r/StationLab/comments/private_thread",
          selftext: "private-source-marker reddit body",
          author: "thread-owner",
          comments: [
            {
              author: "reply-owner",
              body: "private-source-marker reply body",
              subreddit: "StationLab",
              permalink: "/r/StationLab/comments/private_thread/reply",
              created_utc: 2,
            },
          ],
        }),
      }),
      expectedFormat: "reddit",
      expectedMessages: 2,
    },
    {
      body: baseBody({
        sourceName: "discord.json",
        fileType: "application/json",
        content: JSON.stringify({
          guild: { name: "Station private-source-marker" },
          channel: { name: "archive-lab" },
          messages: [{ timestamp: "2026-06-17T10:01:00.000Z", author: { name: "Builder" }, content: "private-source-marker discord body" }],
        }),
      }),
      expectedFormat: "discord",
      expectedMessages: 1,
    },
    {
      body: baseBody({
        sourceName: "legacy.json",
        fileType: "application/json",
        content: JSON.stringify([{ role: "user", content: "private-source-marker legacy body" }]),
      }),
      expectedFormat: "legacy-message-array",
      expectedMessages: 1,
    },
  ];

  try {
    for (const { body, expectedFormat, expectedMessages } of supportedCases) {
      const response = await requestJson(app, "POST", "/imports/preview", {
        token: "owner-token",
        body,
      });

      assert.equal(response.status, 200, `${body.sourceName} should preview`);
      assert.equal(response.body.preview.status, "preview_ready");
      assert.equal(response.body.preview.format, expectedFormat);
      assert.equal(response.body.preview.messageCount, expectedMessages);
      assert.equal(response.body.preview.noWritePerformed, true);
      assert.equal(response.body.preview.safety.rawSourceReturned, false);
      assert.equal(response.body.preview.safety.storageReserved, false);
      assert.equal(response.body.preview.safety.importJobCreated, false);
      assert.equal(response.body.preview.safety.archiveWritten, false);
      assert.equal(response.body.preview.safety.importReviewCreated, false);
      assert.equal(response.body.preview.safety.providerCalls, false);
      assert.equal(typeof response.body.preview.estimatedCharacters, "number");
      assert.equal(response.body.preview.estimatedCharacters > 0, true);
      assertSafePreviewBody(response.body);
    }

    assertNoPreviewWrites(db);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("import preview returns bounded parser errors and sanitizes hostile labels", async () => {
  const db = new ImportPreviewSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createImportPreviewApp();

  try {
    const malformed = await requestJson(app, "POST", "/imports/preview", {
      token: "owner-token",
      body: baseBody({
        sourceName: "https://example.invalid/private token=abc123 sk-test-secret-token.json",
        fileType: "application/json",
        content: "{\"secret\":\"private-source-marker\"",
      }),
    });
    assert.equal(malformed.status, 400);
    assert.equal(malformed.body.code, "import_preview_parse_failed");
    assert.equal(malformed.body.noWritePerformed, true);
    assert.match(malformed.body.error, /Malformed JSON import/);
    assertSafePreviewBody(malformed.body);

    const unsupported = await requestJson(app, "POST", "/imports/preview", {
      token: "owner-token",
      body: baseBody({
        sourceName: "unknown.json",
        fileType: "application/json",
        content: JSON.stringify({ arbitrary: { private: "private-source-marker" } }),
      }),
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "import_preview_parse_failed");
    assert.match(unsupported.body.error, /Unsupported JSON import format/);
    assertSafePreviewBody(unsupported.body);

    const safeLabel = await requestJson(app, "POST", "/imports/preview", {
      token: "owner-token",
      body: baseBody({
        sourceName: "https://example.invalid/export token=abc123 sk-test-secret-token.txt",
        fileType: "text/plain",
        content: "safe countable text",
      }),
    });
    assert.equal(safeLabel.status, 200);
    assert.equal(safeLabel.body.preview.sourceLabel, "Imported source");
    assertSafePreviewBody(safeLabel.body);
    assertNoPreviewWrites(db);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
