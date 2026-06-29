import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const OWNER_AUTH_MARKER = "owner-session-marker";

class ArchiveConnectorReadinessSupabase {
  tableCalls: string[] = [];
  writeCalls: string[] = [];
  insertErrorTables = new Set<string>();

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
      },
    ],
    archive_connector_oauth_states: [],
  };

  private usersByToken = new Map([
    [OWNER_AUTH_MARKER, { id: "owner-user", email: "owner@example.test" }],
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
      return new Query(this, table);
    },
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  addUserToken(token: string, user: { id: string; email: string; tier?: string; isAdmin?: boolean }) {
    this.usersByToken.set(token, { id: user.id, email: user.email });
    if (!this.rows("profiles").some((profile) => profile.id === user.id)) {
      this.rows("profiles").push({
        id: user.id,
        email: user.email,
        tier: user.tier ?? "creator",
        is_admin: user.isAdmin ?? false,
      });
    }
  }
}

class Query {
  private filters: Array<[string, unknown]> = [];
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;

  constructor(private db: ArchiveConnectorReadinessSupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  insert(payload: Row) {
    if (this.table !== "archive_connector_oauth_states") {
      this.db.writeCalls.push(`${this.table}.insert`);
      throw new Error(`${this.table} insert should not run in archive connector readiness tests.`);
    }
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    if (this.table !== "archive_connector_oauth_states") {
      this.db.writeCalls.push(`${this.table}.update`);
      throw new Error(`${this.table} update should not run in archive connector readiness tests.`);
    }
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  single() {
    if (this.operation === "insert") {
      this.db.writeCalls.push(`${this.table}.insert`);
      if (this.db.insertErrorTables.has(this.table)) {
        return Promise.resolve({
          data: null,
          error: { message: `SQL insert failed in ${this.table} owner_user_id=owner-user stack prompt` },
        });
      }

      const row = {
        id: `${this.table}-${this.db.rows(this.table).length + 1}`,
        created_at: "2026-06-29T22:50:00.000Z",
        updated_at: "2026-06-29T22:50:00.000Z",
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      return Promise.resolve({ data: row, error: null });
    }

    if (this.operation === "update") {
      this.db.writeCalls.push(`${this.table}.update`);
      const rows = this.matchingRows();
      if (rows.length !== 1) {
        return Promise.resolve({
          data: null,
          error: { message: `Expected one ${this.table} row.` },
        });
      }

      Object.assign(rows[0], this.payload);
      rows[0].updated_at = "2026-06-29T22:55:00.000Z";
      return Promise.resolve({ data: rows[0], error: null });
    }

    const row = this.matchingRows()[0];
    return Promise.resolve(
      row
        ? { data: row, error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }

  delete() {
    this.db.writeCalls.push(`${this.table}.delete`);
    throw new Error(`${this.table} delete should not run in archive connector readiness tests.`);
  }

  private matchingRows() {
    return this.db.rows(this.table).filter((candidate) =>
      this.filters.every(([field, value]) => candidate[field] === value)
    );
  }
}

async function createArchiveConnectorApp() {
  const { archiveConnectorsRouter } = await import("./archive-connectors.js");
  const app = express();
  app.use(express.json());
  app.use("/archive-connectors", archiveConnectorsRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
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

function withEnv(updates: Record<string, string | null>, fn: () => Promise<void> | void) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(updates)) {
    previous.set(key, process.env[key]);
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of previous.entries()) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

function archiveConnectorConfiguredEnv() {
  return {
    ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
    REDDIT_CLIENT_ID: "reddit-client-id-marker",
    REDDIT_CLIENT_SECRET: "social-reddit-config-b",
  };
}

function archiveConnectorAuthorizeEnv(updates: Record<string, string | null> = {}) {
  return {
    ...archiveConnectorConfiguredEnv(),
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "reddit-public-client-id-fixture",
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "reddit-private-app-marker",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "discord-public-client-id-fixture",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "discord-private-app-marker",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    ...updates,
  };
}

async function startArchiveConnectorOAuthState(
  app: Express,
  options: {
    provider?: "reddit" | "discord";
    token?: string;
    localRedirectPath?: string;
  } = {},
) {
  const body = options.localRedirectPath == null
    ? undefined
    : { localRedirectPath: options.localRedirectPath };
  return requestJson<Row>(app, "POST", `/archive-connectors/oauth/${options.provider ?? "reddit"}/start`, {
    token: options.token ?? OWNER_AUTH_MARKER,
    body,
  });
}

async function authorizeArchiveConnectorOAuthState(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    stateHandle?: string;
    body?: unknown;
  } = {},
) {
  return requestJson<Row>(app, "POST", `/archive-connectors/oauth/${options.provider ?? "reddit"}/authorize`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body: options.body ?? { stateHandle: options.stateHandle },
  });
}

function assertNoSensitiveArchiveConnectorReadback(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    "ENCRYPTION_KEY",
    "CLIENT_ID",
    "CLIENT_SECRET",
    "archive-readiness-config-marker",
    "archive-reddit-id-marker",
    "archive-reddit-config-b",
    "archive-discord-id-marker",
    "archive-discord-config-b",
    "reddit-client-id-marker",
    "social-reddit-config-b",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "raw-external-account",
    "owner-user",
    "archive_connector_credentials",
    "archive_connector_oauth_states",
    "archive_sources",
    "import_jobs",
    "memory_items",
    "canon_items",
    "continuity_candidates",
    "documents",
    "SQL",
    "stack",
    "signed-url",
    "storage-path",
    "prompt",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into archive connector readiness`);
  }
}

function assertNoSensitiveAuthorizeReadback(body: Row, input: {
  stateHandle?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  rowId?: string;
}) {
  const text = JSON.stringify(body);
  const withoutUrl = JSON.stringify({ ...body, authorizationUrl: "" });
  const outsideUrlForbidden = [
    input.stateHandle ?? "",
    input.clientId ?? "",
    input.redirectUri ?? "",
    "stateHandle",
    "clientId",
    "redirectUri",
    "scope",
    "scopes",
  ].filter(Boolean);
  const everywhereForbidden = [
    input.clientSecret ?? "",
    input.rowId ?? "",
    OWNER_AUTH_MARKER,
    "owner-user",
    "other-user",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "archive_connector_oauth_states",
    "archive_connector_credentials",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "provider_payload",
    "SQL",
    "stack",
    "prompt",
  ].filter(Boolean);

  for (const value of outsideUrlForbidden) {
    assert.equal(withoutUrl.includes(value), false, `${value} leaked outside authorizationUrl`);
  }

  for (const value of everywhereForbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into authorization readback`);
  }
}

function assertNoSensitiveCallbackReadback(body: unknown, input: {
  stateHandle: string;
  code: string;
  rowId?: string;
}) {
  const text = JSON.stringify(body);
  const [nonce, csrf] = input.stateHandle.split(".");
  const forbidden = [
    input.stateHandle,
    nonce,
    csrf,
    input.code,
    input.rowId ?? "",
    OWNER_AUTH_MARKER,
    "owner-user",
    "other-user",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "archive_connector_oauth_states",
    "archive_connector_credentials",
    "access_token",
    "refresh_token",
    "SQL",
    "stack",
    "prompt",
  ].filter(Boolean);

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into OAuth callback readback`);
  }
}

function assertNoSensitiveOAuthStateRow(row: unknown, stateHandle: string, token: string) {
  const text = JSON.stringify(row);
  const [nonce, csrf] = stateHandle.split(".");
  const forbidden = [
    stateHandle,
    nonce,
    csrf,
    token,
    "session-binding-fixture",
    "ENCRYPTION_KEY",
    "CLIENT_ID",
    "CLIENT_SECRET",
    "archive-readiness-config-marker",
    "archive-reddit-id-marker",
    "archive-reddit-config-b",
    "archive-discord-id-marker",
    "archive-discord-config-b",
    "reddit-client-id-marker",
    "social-reddit-config-b",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "SQL",
    "stack",
    "prompt",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into stored OAuth state row`);
  }
}

function assertDisabledSafety(body: Row) {
  assert.deepEqual(body.safety, {
    credentialWritesEnabled: false,
    oauthStateCreationEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  });

  for (const provider of body.providers) {
    assert.equal(provider.credentialWritesEnabled, false);
    assert.equal(provider.oauthStateCreationEnabled, false);
    assert.equal(provider.oauthRedirectsEnabled, false);
    assert.equal(provider.oauthCallbacksEnabled, false);
    assert.equal(provider.tokenExchangeEnabled, false);
    assert.equal(provider.providerCallsEnabled, false);
    assert.equal(provider.sourceInventoryEnabled, false);
    assert.equal(provider.importWritesEnabled, false);
  }
}

test("archive connector readiness requires an authenticated owner session", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const response = await requestJson(app, "GET", "/archive-connectors/readiness");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Missing or invalid Authorization header.");
    assert.equal(db.tableCalls.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports reddit and discord with missing encryption config bounded", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.purpose, "archive_connector");
      assert.equal(response.body.mode, "readiness_only");
      assert.equal(response.body.ownerOnly, true);
      assert.equal(response.body.credentialStorageAccepted, true);
      assert.equal(response.body.credentialEncryptionConfigured, false);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.id),
        ["reddit", "discord"],
      );
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.status),
        ["credential_encryption_required", "credential_encryption_required"],
      );
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.oauthAppStatus),
        ["missing", "missing"],
      );
      for (const provider of response.body.providers) {
        assert.equal(provider.purpose, "archive_connector");
        assert.equal(provider.ownerOnly, true);
        assert.equal(provider.authStyle, "oauth");
        assert.equal(provider.credentialEncryptionConfigured, false);
        assert.equal(provider.providerOAuthAppConfigAccepted, true);
        assert.equal(provider.oauthAppConfigured, false);
      }
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness flips encryption boolean without enabling routes or social config", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.credentialEncryptionConfigured, true);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_missing", "missing", false],
          ["discord", "provider_app_missing", "missing", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports id-only and secret-only provider app config as partial", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_partial", "partial", false],
          ["discord", "provider_app_partial", "partial", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports configured provider pairs independently", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_configured", "configured", true],
          ["discord", "provider_app_missing", "missing", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports all provider app pairs configured without enabling actions", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppsConfigured, true);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_configured", "configured", true],
          ["discord", "provider_app_configured", "configured", true],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start requires auth and rejects unsupported providers without writes", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const signedOut = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start");
    assert.equal(signedOut.status, 401);
    assert.equal(db.tableCalls.length, 0);
    assert.equal(db.rows("archive_connector_oauth_states").length, 0);

    const unsupported = await requestJson(app, "POST", "/archive-connectors/oauth/mastodon/start", {
      token: OWNER_AUTH_MARKER,
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.deepEqual(db.tableCalls, ["profiles"]);
    assert.equal(db.rows("archive_connector_oauth_states").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start requires configured archive provider app without side leakage", async () => {
  const cases = [
    {
      name: "missing",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
    {
      name: "partial",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
        REDDIT_CLIENT_ID: "reddit-client-id-marker",
        REDDIT_CLIENT_SECRET: "social-reddit-config-b",
        ...setup.env,
      }, async () => {
        const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
          token: OWNER_AUTH_MARKER,
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_provider_app_setup_required");
        assert.equal(response.body.status, "setup_required");
        assert.equal(response.body.provider, "reddit");
        assert.equal("oauthAppStatus" in response.body, false);
        assertDisabledStartSafety(response.body);
        assertNoSensitiveArchiveConnectorReadback(response.body);
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth state start creates bounded state rows for configured providers", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const reddit = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
        token: OWNER_AUTH_MARKER,
        body: { localRedirectPath: "/studio/archive?provider=reddit#ready" },
      });
      const discord = await requestJson(app, "POST", "/archive-connectors/oauth/discord/start", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(reddit.status, 201);
      assert.equal(discord.status, 201);
      assert.equal(reddit.body.status, "oauth_state_created");
      assert.equal(discord.body.status, "oauth_state_created");
      assert.equal(reddit.body.provider, "reddit");
      assert.equal(discord.body.provider, "discord");
      assert.equal(reddit.body.purpose, "archive_connector");
      assert.equal(discord.body.purpose, "archive_connector");
      assert.equal(reddit.body.localRedirectPath, "/studio/archive?provider=reddit#ready");
      assert.equal(discord.body.localRedirectPath, null);
      assert.match(reddit.body.stateHandle, /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/);
      assert.match(discord.body.stateHandle, /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/);
      assert.notEqual(reddit.body.stateHandle, discord.body.stateHandle);
      assertDisabledStartSafety(reddit.body);
      assertDisabledStartSafety(discord.body);
      assertNoSensitiveArchiveConnectorReadback(reddit.body);
      assertNoSensitiveArchiveConnectorReadback(discord.body);

      const rows = db.rows("archive_connector_oauth_states");
      assert.equal(rows.length, 2);
      assert.deepEqual(rows.map((row) => row.provider), ["reddit", "discord"]);
      for (const [index, row] of rows.entries()) {
        const response = index === 0 ? reddit.body : discord.body;
        assert.equal(row.owner_user_id, "owner-user");
        assert.equal(row.purpose, "archive_connector");
        assert.equal(row.consumed_at, null);
        assert.equal(typeof row.session_id_hash, "string");
        assert.equal(typeof row.nonce_hash, "string");
        assert.equal(typeof row.csrf_hash, "string");
        assert.equal(row.session_id_hash.length, 64);
        assert.equal(row.nonce_hash.length, 64);
        assert.equal(row.csrf_hash.length, 64);
        assert.equal(row.expires_at, response.expiresAt);
        assert.equal(row.local_redirect_path, response.localRedirectPath);
        assertNoSensitiveOAuthStateRow(row, response.stateHandle, OWNER_AUTH_MARKER);
      }
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start returns bounded storage failure", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.insertErrorTables.add("archive_connector_oauth_states");
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
    }, async () => {
      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 500);
      assert.equal(response.body.code, "archive_connector_oauth_state_start_failed");
      assert.equal(response.body.status, "start_failed");
      assert.equal(response.body.provider, "reddit");
      assert.equal("stateHandle" in response.body, false);
      assertDisabledStartSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start rejects invalid local redirects without writes", async () => {
  const invalidRedirects = [
    "https://example.invalid/callback",
    "//example.invalid/callback",
    "javascript:alert(1)",
    "/studio\\archive",
    "/studio/archive\u0001",
    `/${"a".repeat(201)}`,
    42,
  ];

  for (const localRedirectPath of invalidRedirects) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      }, async () => {
        const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
          token: OWNER_AUTH_MARKER,
          body: { localRedirectPath },
        });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "archive_connector_local_redirect_invalid");
        assertDisabledStartSafety(response.body);
        assertNoSensitiveArchiveConnectorReadback(response.body);
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth callback verify requires auth and rejects unsupported or malformed input without writes", async () => {
  const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;
  const validCode = "callback-code.fixture_~+/=";

  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await requestJson(signedOutApp, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
      body: { stateHandle: validStateHandle, code: validCode },
    });

    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.deepEqual(signedOutDb.tableCalls, []);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const unsupportedDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(unsupportedDb.client as any);
  const unsupportedApp = await createArchiveConnectorApp();

  try {
    const unsupported = await requestJson(unsupportedApp, "POST", "/archive-connectors/oauth/mastodon/callback/verify", {
      token: OWNER_AUTH_MARKER,
      body: { stateHandle: validStateHandle, code: validCode },
    });

    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.deepEqual(unsupportedDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const malformedBodies = [
    { stateHandle: "not-a-state", code: validCode },
    { stateHandle: validStateHandle, code: "" },
    { stateHandle: validStateHandle, code: "code with spaces" },
    { stateHandle: validStateHandle, code: `${"a".repeat(1025)}` },
    { stateHandle: validStateHandle, code: validCode, ownerUserId: "owner-user" },
    { stateHandle: validStateHandle },
    { code: validCode },
    {},
  ];

  for (const body of malformedBodies) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body,
      });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "archive_connector_callback_invalid");
      assertDisabledCallbackVerifySafety(response.body);
      assertNoSensitiveCallbackReadback(response.body, { stateHandle: validStateHandle, code: validCode });
      assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      assert.deepEqual(db.writeCalls, []);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth callback verify consumes a PR484E state exactly once", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();
  const callbackCode = "callback-code.fixture_~+/=";

  try {
    await withEnv(archiveConnectorConfiguredEnv(), async () => {
      const started = await startArchiveConnectorOAuthState(app, {
        localRedirectPath: "/studio/archive?provider=reddit",
      });
      assert.equal(started.status, 201);

      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body: { stateHandle: started.body.stateHandle, code: callbackCode },
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.status, "oauth_state_verified");
      assert.equal(response.body.provider, "reddit");
      assert.equal(response.body.purpose, "archive_connector");
      assert.equal(response.body.consumed, true);
      assert.equal(response.body.localRedirectPath, "/studio/archive?provider=reddit");
      assertDisabledCallbackVerifySafety(response.body);
      assertNoSensitiveCallbackReadback(response.body, {
        stateHandle: started.body.stateHandle,
        code: callbackCode,
        rowId: db.rows("archive_connector_oauth_states")[0].id,
      });

      const stored = db.rows("archive_connector_oauth_states")[0];
      assert.equal(typeof stored.consumed_at, "string");

      const replay = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body: { stateHandle: started.body.stateHandle, code: callbackCode },
      });

      assert.equal(replay.status, 409);
      assert.equal(replay.body.code, "archive_connector_oauth_state_invalid");
      assertDisabledCallbackVerifySafety(replay.body);
      assertNoSensitiveCallbackReadback(replay.body, {
        stateHandle: started.body.stateHandle,
        code: callbackCode,
        rowId: stored.id,
      });
      assert.deepEqual(db.writeCalls, [
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.update",
      ]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth callback verify fails closed on owner provider session csrf and expiry mismatches", async () => {
  const callbackCode = "callback-code.fixture_~+/=";

  const cases: Array<{
    name: string;
    mutateDb?: (db: ArchiveConnectorReadinessSupabase) => void;
    verifyProvider?: "reddit" | "discord";
    verifyToken?: string;
    stateHandle?: (original: string) => string;
    addToken?: [string, { id: string; email: string; tier?: string; isAdmin?: boolean }];
  }> = [
    {
      name: "owner",
      addToken: ["other-owner-marker", { id: "other-user", email: "other@example.test" }],
      verifyToken: "other-owner-marker",
    },
    {
      name: "session",
      addToken: ["owner-other-session-marker", { id: "owner-user", email: "owner@example.test" }],
      verifyToken: "owner-other-session-marker",
    },
    {
      name: "provider",
      verifyProvider: "discord",
    },
    {
      name: "csrf",
      stateHandle: (original) => `${original.split(".")[0]}.${"c".repeat(43)}`,
    },
    {
      name: "expiry",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].expires_at = "2000-01-01T00:00:00.000Z";
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.addToken) db.addUserToken(...setup.addToken);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorConfiguredEnv(), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);
        setup.mutateDb?.(db);

        const response = await requestJson(app, "POST", `/archive-connectors/oauth/${setup.verifyProvider ?? "reddit"}/callback/verify`, {
          token: setup.verifyToken ?? OWNER_AUTH_MARKER,
          body: {
            stateHandle: setup.stateHandle?.(started.body.stateHandle) ?? started.body.stateHandle,
            code: callbackCode,
          },
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_oauth_state_invalid", setup.name);
        assertDisabledCallbackVerifySafety(response.body);
        assertNoSensitiveCallbackReadback(response.body, {
          stateHandle: started.body.stateHandle,
          code: callbackCode,
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize requires auth and rejects unsupported or malformed input without URL readback", async () => {
  const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;

  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await authorizeArchiveConnectorOAuthState(signedOutApp, {
      token: null,
      body: { stateHandle: validStateHandle },
    });

    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.deepEqual(signedOutDb.tableCalls, []);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const unsupportedDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(unsupportedDb.client as any);
  const unsupportedApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorAuthorizeEnv(), async () => {
      const unsupported = await authorizeArchiveConnectorOAuthState(unsupportedApp, {
        provider: "mastodon",
        body: { stateHandle: validStateHandle },
      });

      assert.equal(unsupported.status, 400);
      assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
      assert.equal("authorizationUrl" in unsupported.body, false);
      assert.deepEqual(unsupportedDb.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const malformedBodies = [
    { stateHandle: "not-a-state" },
    { stateHandle: validStateHandle, code: "callback-code-fixture" },
    { stateHandle: validStateHandle, ownerUserId: "owner-user" },
    {},
    [],
  ];

  for (const body of malformedBodies) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(), async () => {
        const response = await authorizeArchiveConnectorOAuthState(app, { body });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "archive_connector_authorize_invalid");
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: validStateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
        });
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
        assert.deepEqual(db.writeCalls, []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize requires configured provider app without client id leakage", async () => {
  const setupCases = [
    {
      name: "missing",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
    {
      name: "partial",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "reddit-public-client-id-fixture",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
  ];

  for (const setup of setupCases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(setup.env), async () => {
        const response = await authorizeArchiveConnectorOAuthState(app, {
          body: { stateHandle: `${"a".repeat(43)}.${"b".repeat(43)}` },
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_provider_app_setup_required");
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
        });
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
        assert.deepEqual(db.writeCalls, []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize rejects missing invalid and unsafe web app origins", async () => {
  const cases: Array<{
    name: string;
    env: Record<string, string | null>;
    status: number;
    code: string;
  }> = [
    { name: "missing", env: { NEXT_PUBLIC_APP_URL: null }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "malformed", env: { NEXT_PUBLIC_APP_URL: "not a url" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "query", env: { NEXT_PUBLIC_APP_URL: "https://station.example?x=1" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "hash", env: { NEXT_PUBLIC_APP_URL: "https://station.example/#frag" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "credentials", env: { NEXT_PUBLIC_APP_URL: "https://user:pass@station.example" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "scheme", env: { NEXT_PUBLIC_APP_URL: "ftp://station.example" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "http-nonlocal", env: { NEXT_PUBLIC_APP_URL: "http://station.example" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
    { name: "prod-localhost", env: { NEXT_PUBLIC_APP_URL: "http://localhost:3000", NODE_ENV: "production" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
    { name: "railway-localhost", env: { NEXT_PUBLIC_APP_URL: "http://localhost:3000", RAILWAY_ENVIRONMENT_NAME: "production" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(setup.env), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);

        const response = await authorizeArchiveConnectorOAuthState(app, {
          stateHandle: started.body.stateHandle,
        });

        assert.equal(response.status, setup.status, setup.name);
        assert.equal(response.body.code, setup.code, setup.name);
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: started.body.stateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize returns bounded Reddit and Discord authorization URLs without consuming state", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorAuthorizeEnv({ NEXT_PUBLIC_APP_URL: "https://station.example/app" }), async () => {
      const redditStart = await startArchiveConnectorOAuthState(app, { provider: "reddit" });
      const discordStart = await startArchiveConnectorOAuthState(app, { provider: "discord" });
      assert.equal(redditStart.status, 201);
      assert.equal(discordStart.status, 201);

      const reddit = await authorizeArchiveConnectorOAuthState(app, {
        provider: "reddit",
        stateHandle: redditStart.body.stateHandle,
      });
      const redditAgain = await authorizeArchiveConnectorOAuthState(app, {
        provider: "reddit",
        stateHandle: redditStart.body.stateHandle,
      });
      const discord = await authorizeArchiveConnectorOAuthState(app, {
        provider: "discord",
        stateHandle: discordStart.body.stateHandle,
      });

      assert.equal(reddit.status, 200);
      assert.equal(redditAgain.status, 200);
      assert.equal(discord.status, 200);
      assert.equal(reddit.body.authorizationUrl, redditAgain.body.authorizationUrl);
      assertAuthorizationUrlSafety(reddit.body);
      assertAuthorizationUrlSafety(discord.body);
      assertNoSensitiveAuthorizeReadback(reddit.body, {
        stateHandle: redditStart.body.stateHandle,
        clientId: "reddit-public-client-id-fixture",
        clientSecret: "reddit-private-app-marker",
        redirectUri: "https://station.example/archive-connectors/oauth/callback/reddit",
        rowId: db.rows("archive_connector_oauth_states")[0].id,
      });
      assertNoSensitiveAuthorizeReadback(discord.body, {
        stateHandle: discordStart.body.stateHandle,
        clientId: "discord-public-client-id-fixture",
        clientSecret: "discord-private-app-marker",
        redirectUri: "https://station.example/archive-connectors/oauth/callback/discord",
        rowId: db.rows("archive_connector_oauth_states")[1].id,
      });

      const redditUrl = new URL(reddit.body.authorizationUrl);
      assert.equal(`${redditUrl.origin}${redditUrl.pathname}`, "https://www.reddit.com/api/v1/authorize");
      assert.equal(redditUrl.searchParams.get("client_id"), "reddit-public-client-id-fixture");
      assert.equal(redditUrl.searchParams.get("response_type"), "code");
      assert.equal(redditUrl.searchParams.get("state"), redditStart.body.stateHandle);
      assert.equal(redditUrl.searchParams.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/reddit");
      assert.equal(redditUrl.searchParams.get("duration"), "temporary");
      assert.equal(redditUrl.searchParams.get("scope"), "identity");
      assert.equal(redditUrl.searchParams.has("client_secret"), false);

      const discordUrl = new URL(discord.body.authorizationUrl);
      assert.equal(`${discordUrl.origin}${discordUrl.pathname}`, "https://discord.com/oauth2/authorize");
      assert.equal(discordUrl.searchParams.get("client_id"), "discord-public-client-id-fixture");
      assert.equal(discordUrl.searchParams.get("response_type"), "code");
      assert.equal(discordUrl.searchParams.get("state"), discordStart.body.stateHandle);
      assert.equal(discordUrl.searchParams.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/discord");
      assert.equal(discordUrl.searchParams.get("scope"), "identify");
      assert.equal(discordUrl.searchParams.has("client_secret"), false);

      for (const row of db.rows("archive_connector_oauth_states")) {
        assert.equal(row.consumed_at, null);
      }
      assert.deepEqual(db.writeCalls, [
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.insert",
      ]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth authorize validates existing state without consuming and fails closed on mismatches", async () => {
  const cases: Array<{
    name: string;
    mutateDb?: (db: ArchiveConnectorReadinessSupabase) => void;
    verifyProvider?: "reddit" | "discord";
    verifyToken?: string;
    stateHandle?: (original: string) => string;
    addToken?: [string, { id: string; email: string; tier?: string; isAdmin?: boolean }];
  }> = [
    {
      name: "owner",
      addToken: ["other-owner-marker", { id: "other-user", email: "other@example.test" }],
      verifyToken: "other-owner-marker",
    },
    {
      name: "session",
      addToken: ["owner-other-session-marker", { id: "owner-user", email: "owner@example.test" }],
      verifyToken: "owner-other-session-marker",
    },
    {
      name: "provider",
      verifyProvider: "discord",
    },
    {
      name: "csrf",
      stateHandle: (original) => `${original.split(".")[0]}.${"c".repeat(43)}`,
    },
    {
      name: "expiry",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].expires_at = "2000-01-01T00:00:00.000Z";
      },
    },
    {
      name: "consumed",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].consumed_at = "2026-06-29T23:00:00.000Z";
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.addToken) db.addUserToken(...setup.addToken);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);
        setup.mutateDb?.(db);

        const response = await authorizeArchiveConnectorOAuthState(app, {
          provider: setup.verifyProvider ?? "reddit",
          token: setup.verifyToken ?? OWNER_AUTH_MARKER,
          stateHandle: setup.stateHandle?.(started.body.stateHandle) ?? started.body.stateHandle,
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_oauth_state_invalid", setup.name);
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: started.body.stateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector readiness source stays read-only and route-only", () => {
  const routeSource = readFileSync("apps/api/src/routes/archive-connectors.ts", "utf8");
  const readinessSource = readFileSync("apps/api/src/services/archive-connectors/readiness.ts", "utf8");
  const source = `${routeSource}\n${readinessSource}`;
  const sourceWithoutAcceptedArchiveConfig = source.replace(
    /ARCHIVE_CONNECTOR_(REDDIT|DISCORD)_CLIENT_(ID|SECRET)/g,
    "",
  );
  const stateCreateMatches = routeSource.match(/createArchiveConnectorOAuthState/g) ?? [];
  const stateConsumeMatches = routeSource.match(/consumeArchiveConnectorOAuthState/g) ?? [];
  const stateValidateMatches = routeSource.match(/validateArchiveConnectorOAuthState/g) ?? [];

  assert.equal(stateCreateMatches.length, 2);
  assert.equal(stateConsumeMatches.length, 2);
  assert.equal(stateValidateMatches.length, 2);
  assert.doesNotMatch(readinessSource, /createArchiveConnectorOAuthState/i);
  assert.doesNotMatch(readinessSource, /consumeArchiveConnectorOAuthState/i);
  assert.doesNotMatch(readinessSource, /validateArchiveConnectorOAuthState/i);
  assert.doesNotMatch(source, /storeArchiveConnectorCredential|revokeArchiveConnectorCredential/i);
  assert.doesNotMatch(routeSource, /res\.redirect|redirect\s*\(/i);
  assert.doesNotMatch(sourceWithoutAcceptedArchiveConfig, /REDDIT_CLIENT_ID|REDDIT_CLIENT_SECRET|DISCORD_CLIENT_ID|DISCORD_CLIENT_SECRET/i);
  assert.doesNotMatch(source, /fetch\s*\(|providerSdk|access_token|refresh_token/i);
  assert.doesNotMatch(source, /archive_sources|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates/i);
  assert.doesNotMatch(source, /new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
});

function assertDisabledStartSafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.oauthCallbacksEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertDisabledCallbackVerifySafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertAuthorizationUrlSafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.oauthCallbacksEnabled, true);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}
