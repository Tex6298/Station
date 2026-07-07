import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { decryptSocialConnectorCredentialForTests } from "../services/social-connectors/credential-storage";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

const OWNER_TOKEN = "owner-token";
const OTHER_TOKEN = "other-token";
const VALID_SOCIAL_CONNECTOR_KEY = "social-connector-route-test-key-32-plus";
const IDENTIFIER_ALPHA = "manual-blue-identifier-alpha";
const IDENTIFIER_BETA = "manual-blue-identifier-beta";
const CREDENTIAL_ALPHA = "manual-blue-credential-alpha";
const CREDENTIAL_BETA = "manual-blue-credential-beta";

class SocialRouteSupabase {
  tableCalls: string[] = [];
  writeCalls: string[] = [];
  failSelectTables = new Set<string>();
  failInsertTables = new Set<string>();
  failUpdateTables = new Set<string>();

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
        tier: "creator",
        is_admin: false,
      },
    ],
    social_connector_credentials: [],
  };

  private usersByToken = new Map([
    [OWNER_TOKEN, { id: "owner-user", email: "owner@example.test" }],
    [OTHER_TOKEN, { id: "other-user", email: "other@example.test" }],
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
}

class Query {
  private filters: Array<[string, unknown]> = [];
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private orderSpec: { field: string; ascending: boolean } | null = null;

  constructor(private db: SocialRouteSupabase, private table: string) {}

  select(_columns?: string) {
    return this;
  }

  insert(payload: Row) {
    if (this.table !== "social_connector_credentials") {
      this.db.writeCalls.push(`${this.table}.insert`);
      throw new Error(`${this.table} insert should not run in social route tests.`);
    }
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    if (this.table !== "social_connector_credentials") {
      this.db.writeCalls.push(`${this.table}.update`);
      throw new Error(`${this.table} update should not run in social route tests.`);
    }
    this.operation = "update";
    this.payload = payload;
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

  single() {
    return this.execute("single");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  delete() {
    this.db.writeCalls.push(`${this.table}.delete`);
    throw new Error(`${this.table} delete should not run in social route tests.`);
  }

  private async execute(mode?: "single") {
    if (this.operation === "select" && this.db.failSelectTables.has(this.table)) {
      return { data: null, error: { message: `SQL select failed in ${this.table} owner_user_id=owner-user stack` } };
    }
    if (this.operation === "insert" && this.db.failInsertTables.has(this.table)) {
      return { data: null, error: { message: `SQL insert failed in ${this.table} owner_user_id=owner-user stack` } };
    }
    if (this.operation === "update" && this.db.failUpdateTables.has(this.table)) {
      return { data: null, error: { message: `SQL update failed in ${this.table} owner_user_id=owner-user stack` } };
    }

    let rows: Row[];
    if (this.operation === "insert") {
      this.db.writeCalls.push(`${this.table}.insert`);
      const row = {
        id: `${this.table}-${this.db.rows(this.table).length + 1}`,
        created_at: `2026-07-07T10:0${this.db.rows(this.table).length}:00.000Z`,
        updated_at: `2026-07-07T10:0${this.db.rows(this.table).length}:00.000Z`,
        rotated_at: null,
        revoked_at: null,
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      rows = [row];
    } else if (this.operation === "update") {
      this.db.writeCalls.push(`${this.table}.update`);
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        row.updated_at = "2026-07-07T10:09:00.000Z";
      }
    } else {
      rows = this.matchingRows();
    }

    if (mode === "single") {
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }

    return { data: rows, error: null };
  }

  private matchingRows() {
    let rows = this.db.rows(this.table).filter((candidate) =>
      this.filters.every(([field, value]) => candidate[field] === value)
    );

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows = [...rows].sort((left, right) => {
        if (left[field] === right[field]) return 0;
        if (left[field] == null) return 1;
        if (right[field] == null) return -1;
        return (left[field] > right[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    return rows;
  }
}

async function createSocialApp() {
  const { socialRouter } = await import("./social.js");
  const app = express();
  app.use(express.json({ strict: false }));
  app.use("/social", socialRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string | null; body?: unknown } = {},
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

function validCredentialBody(
  overrides: Partial<{ provider: string; identifier: unknown; appPassword: unknown; extra: unknown }> = {},
) {
  const body: Row = {
    provider: overrides.provider ?? "bluesky",
    credential: {
      identifier: overrides.identifier ?? IDENTIFIER_ALPHA,
      appPassword: overrides.appPassword ?? CREDENTIAL_ALPHA,
    },
  };
  if (Object.prototype.hasOwnProperty.call(overrides, "extra")) {
    body.extra = overrides.extra;
  }
  return body;
}

function socialCredentialRows(db: SocialRouteSupabase) {
  return db.rows("social_connector_credentials");
}

function seedSocialCredential(
  db: SocialRouteSupabase,
  overrides: Partial<Row> = {},
) {
  db.rows("social_connector_credentials").push({
    id: `seeded-social-credential-${db.rows("social_connector_credentials").length + 1}`,
    owner_user_id: "owner-user",
    provider: "bluesky",
    purpose: "social_connector",
    credential_category: "manual_credential",
    encrypted_credential: { ciphertext: "encrypted-payload-fixture" },
    credential_fingerprint: "fingerprint-fixture",
    status: "active",
    created_at: "2026-07-07T09:00:00.000Z",
    updated_at: "2026-07-07T09:00:00.000Z",
    rotated_at: null,
    revoked_at: null,
    ...overrides,
  });
}

function assertNoSensitiveSocialReadback(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    OWNER_TOKEN,
    OTHER_TOKEN,
    "owner-user",
    "other-user",
    IDENTIFIER_ALPHA,
    IDENTIFIER_BETA,
    CREDENTIAL_ALPHA,
    CREDENTIAL_BETA,
    "social-secret-marker",
    "social-handle-marker",
    "provider-account-marker",
    "refresh_token",
    "access_token",
    "app_password",
    "application_password",
    "appPassword",
    "identifier",
    "admin_key",
    "oauth_code",
    "callback_url",
    "external_url",
    "authUrl",
    "encrypted_credential",
    "credential_fingerprint",
    "ciphertext",
    "authTag",
    "social_connections",
    "social_posts",
    "SQL",
    "stack",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into social readback`);
  }
}

function assertCredentialRouteSafety(body: Row) {
  assert.equal(body.tokenDecryptEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.postingEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.legacySocialTablesEnabled, false);
}

test("social connector credential routes require an authenticated owner session", async () => {
  const db = new SocialRouteSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    const routes: Array<[string, string, unknown?]> = [
      ["GET", "/social/connectors/credentials"],
      ["POST", "/social/connectors/credentials", validCredentialBody()],
      ["DELETE", "/social/connectors/credentials/bluesky"],
    ];

    for (const [method, path, body] of routes) {
      const response = await requestJson(app, method, path, { body });
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.equal(response.body.error, "Missing or invalid Authorization header.");
    }

    assert.deepEqual(db.tableCalls, []);
    assert.deepEqual(socialCredentialRows(db), []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential GET returns owner metadata only", async () => {
  const db = new SocialRouteSupabase();
  seedSocialCredential(db, {
    owner_user_id: "owner-user",
    status: "revoked",
    created_at: "2026-07-07T09:00:00.000Z",
    updated_at: "2026-07-07T09:05:00.000Z",
    revoked_at: "2026-07-07T09:05:00.000Z",
  });
  seedSocialCredential(db, {
    owner_user_id: "owner-user",
    status: "active",
    created_at: "2026-07-07T09:10:00.000Z",
    updated_at: "2026-07-07T09:10:00.000Z",
  });
  seedSocialCredential(db, {
    owner_user_id: "other-user",
    encrypted_credential: { ciphertext: "other-owner-encrypted-payload" },
  });
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    const response = await requestJson<Row>(app, "GET", "/social/connectors/credentials", {
      token: OWNER_TOKEN,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "social_connector_credentials_read");
    assert.equal(response.body.purpose, "social_connector");
    assert.equal(response.body.ownerOnly, true);
    assert.equal(response.body.providers.length, 1);
    assert.equal(response.body.providers[0].provider, "bluesky");
    assert.equal(response.body.providers[0].connectionStatus, "connected");
    assert.equal(response.body.providers[0].credential.status, "active");
    assert.equal(response.body.providers[0].credential.configured, true);
    assert.deepEqual(Object.keys(response.body.providers[0].credential).sort(), [
      "category",
      "configured",
      "createdAt",
      "provider",
      "providerLabel",
      "purpose",
      "revokedAt",
      "rotatedAt",
      "safety",
      "status",
      "updatedAt",
    ]);
    assertCredentialRouteSafety(response.body);
    assertCredentialRouteSafety(response.body.providers[0]);
    assertNoSensitiveSocialReadback(response.body);
    assert.equal(db.tableCalls.includes("social_connections"), false);
    assert.equal(db.tableCalls.includes("social_posts"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential POST stores trimmed Bluesky credentials through encrypted storage only", async () => {
  const db = new SocialRouteSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_SOCIAL_CONNECTOR_KEY }, async () => {
      const response = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
        token: OWNER_TOKEN,
        body: validCredentialBody({
          identifier: `  ${IDENTIFIER_ALPHA}  `,
          appPassword: `  ${CREDENTIAL_ALPHA}  `,
        }),
      });

      assert.equal(response.status, 201);
      assert.equal(response.body.status, "social_connector_credential_stored");
      assert.equal(response.body.provider, "bluesky");
      assert.equal(response.body.connectionStatus, "connected");
      assert.equal(response.body.credential.status, "active");
      assert.equal(response.body.credential.configured, true);
      assert.equal(response.body.credentialWritesEnabled, true);
      assertCredentialRouteSafety(response.body);
      assertNoSensitiveSocialReadback(response.body);

      const rows = socialCredentialRows(db);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].owner_user_id, "owner-user");
      assert.equal(rows[0].provider, "bluesky");
      assert.equal(rows[0].purpose, "social_connector");
      assert.equal(rows[0].credential_category, "manual_credential");
      assert.equal(rows[0].status, "active");
      assert.equal(typeof rows[0].credential_fingerprint, "string");
      assert.equal(rows[0].credential_fingerprint.length, 16);
      assert.deepEqual(decryptSocialConnectorCredentialForTests(rows[0].encrypted_credential), {
        identifier: IDENTIFIER_ALPHA,
        appPassword: CREDENTIAL_ALPHA,
      });
      assert.equal(JSON.stringify(rows[0]).includes(IDENTIFIER_ALPHA), false);
      assert.equal(JSON.stringify(rows[0]).includes(CREDENTIAL_ALPHA), false);
      assert.equal(db.tableCalls.includes("social_connections"), false);
      assert.equal(db.tableCalls.includes("social_posts"), false);
      assert.deepEqual(db.writeCalls, [
        "social_connector_credentials.update",
        "social_connector_credentials.insert",
      ]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential POST replaces the owner's active Bluesky credential", async () => {
  const db = new SocialRouteSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_SOCIAL_CONNECTOR_KEY }, async () => {
      const first = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
        token: OWNER_TOKEN,
        body: validCredentialBody({
          identifier: IDENTIFIER_ALPHA,
          appPassword: CREDENTIAL_ALPHA,
        }),
      });
      const second = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
        token: OWNER_TOKEN,
        body: validCredentialBody({
          identifier: IDENTIFIER_BETA,
          appPassword: CREDENTIAL_BETA,
        }),
      });

      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      const ownerRows = socialCredentialRows(db).filter((row) => row.owner_user_id === "owner-user");
      assert.equal(ownerRows.length, 2);
      assert.equal(ownerRows.filter((row) => row.status === "active").length, 1);
      assert.equal(ownerRows.filter((row) => row.status === "revoked").length, 1);
      assert.equal(ownerRows.find((row) => row.status === "revoked")?.revoked_at != null, true);
      assert.equal(ownerRows.find((row) => row.status === "active")?.rotated_at != null, true);
      assertNoSensitiveSocialReadback(second.body);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential POST rejects invalid payloads before storage", async () => {
  const invalidBodies: unknown[] = [
    undefined,
    null,
    "scalar",
    ["array"],
    { provider: "mastodon", credential: { identifier: IDENTIFIER_ALPHA, appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky" },
    { provider: "bluesky", credential: null },
    { provider: "bluesky", credential: { identifier: IDENTIFIER_ALPHA } },
    { provider: "bluesky", credential: { appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky", credential: { identifier: "", appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky", credential: { identifier: "   ", appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky", credential: { identifier: IDENTIFIER_ALPHA, appPassword: "" } },
    { provider: "bluesky", credential: { identifier: ["array"], appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky", credential: { identifier: IDENTIFIER_ALPHA, appPassword: CREDENTIAL_ALPHA, extra: "field" } },
    validCredentialBody({ extra: "field" }),
    { provider: "bluesky", credential: { identifier: "x".repeat(257), appPassword: CREDENTIAL_ALPHA } },
    { provider: "bluesky", credential: { identifier: IDENTIFIER_ALPHA, appPassword: "x".repeat(513) } },
  ];

  for (const body of invalidBodies) {
    const db = new SocialRouteSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createSocialApp();

    try {
      await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_SOCIAL_CONNECTOR_KEY }, async () => {
        const response = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
          token: OWNER_TOKEN,
          body,
        });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "social_connector_credential_invalid");
        assert.equal(response.body.status, "invalid_request");
        assert.equal(response.body.credentialWritesEnabled, false);
        assertCredentialRouteSafety(response.body);
        assertNoSensitiveSocialReadback(response.body);
        assert.equal(db.tableCalls.includes("social_connector_credentials"), false);
        assert.deepEqual(socialCredentialRows(db), []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("social connector credential scalar JSON gets the bounded invalid error in the full app", async () => {
  const db = new SocialRouteSupabase();
  setSupabaseAdminForTests(db.client as any);
  const { createApp } = await import("../app.js");
  const app = createApp();

  try {
    await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_SOCIAL_CONNECTOR_KEY }, async () => {
      const response = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
        token: OWNER_TOKEN,
        body: "scalar",
      });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "social_connector_credential_invalid");
      assert.equal(response.body.status, "invalid_request");
      assert.equal(response.body.credentialWritesEnabled, false);
      assertCredentialRouteSafety(response.body);
      assertNoSensitiveSocialReadback(response.body);
      assert.equal(db.tableCalls.includes("social_connector_credentials"), false);
      assert.deepEqual(socialCredentialRows(db), []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential POST requires encryption config before database work", async () => {
  for (const key of [null, "short"]) {
    const db = new SocialRouteSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createSocialApp();

    try {
      await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: key }, async () => {
        const response = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
          token: OWNER_TOKEN,
          body: validCredentialBody(),
        });

        assert.equal(response.status, 503);
        assert.equal(response.body.code, "social_connector_credential_encryption_required");
        assert.equal(response.body.status, "encryption_required");
        assert.equal(response.body.credentialWritesEnabled, false);
        assertCredentialRouteSafety(response.body);
        assertNoSensitiveSocialReadback(response.body);
        assert.equal(db.tableCalls.includes("social_connector_credentials"), false);
        assert.deepEqual(socialCredentialRows(db), []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("social connector credential storage failures return bounded unavailable errors", async () => {
  const appWithDb = async (db: SocialRouteSupabase) => {
    setSupabaseAdminForTests(db.client as any);
    return createSocialApp();
  };

  const listFailDb = new SocialRouteSupabase();
  listFailDb.failSelectTables.add("social_connector_credentials");
  let app = await appWithDb(listFailDb);
  try {
    const response = await requestJson<Row>(app, "GET", "/social/connectors/credentials", {
      token: OWNER_TOKEN,
    });
    assert.equal(response.status, 503);
    assert.equal(response.body.code, "social_connector_credential_unavailable");
    assertNoSensitiveSocialReadback(response.body);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const replaceFailDb = new SocialRouteSupabase();
  replaceFailDb.failInsertTables.add("social_connector_credentials");
  app = await appWithDb(replaceFailDb);
  try {
    await withEnv({ SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_SOCIAL_CONNECTOR_KEY }, async () => {
      const response = await requestJson<Row>(app, "POST", "/social/connectors/credentials", {
        token: OWNER_TOKEN,
        body: validCredentialBody(),
      });
      assert.equal(response.status, 503);
      assert.equal(response.body.code, "social_connector_credential_unavailable");
      assertNoSensitiveSocialReadback(response.body);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const revokeFailDb = new SocialRouteSupabase();
  seedSocialCredential(revokeFailDb);
  revokeFailDb.failUpdateTables.add("social_connector_credentials");
  app = await appWithDb(revokeFailDb);
  try {
    const response = await requestJson<Row>(app, "DELETE", "/social/connectors/credentials/bluesky", {
      token: OWNER_TOKEN,
    });
    assert.equal(response.status, 503);
    assert.equal(response.body.code, "social_connector_credential_unavailable");
    assertNoSensitiveSocialReadback(response.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential DELETE is Bluesky-only, idempotent, and local-only", async () => {
  const db = new SocialRouteSupabase();
  seedSocialCredential(db, {
    owner_user_id: "owner-user",
    status: "active",
    created_at: "2026-07-07T09:30:00.000Z",
  });
  seedSocialCredential(db, {
    owner_user_id: "other-user",
    status: "active",
    encrypted_credential: { ciphertext: "other-owner-encrypted-payload" },
  });
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    const invalidProvider = await requestJson<Row>(app, "DELETE", "/social/connectors/credentials/mastodon", {
      token: OWNER_TOKEN,
    });
    assert.equal(invalidProvider.status, 400);
    assert.equal(invalidProvider.body.code, "social_connector_credential_invalid");

    const invalidBody = await requestJson<Row>(app, "DELETE", "/social/connectors/credentials/bluesky", {
      token: OWNER_TOKEN,
      body: { revokeProviderSide: true },
    });
    assert.equal(invalidBody.status, 400);
    assert.equal(invalidBody.body.code, "social_connector_credential_invalid");

    const revoked = await requestJson<Row>(app, "DELETE", "/social/connectors/credentials/bluesky", {
      token: OWNER_TOKEN,
      body: {},
    });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.status, "social_connector_credential_revoked");
    assert.equal(revoked.body.connectionStatus, "revoked");
    assert.equal(revoked.body.credential.status, "revoked");
    assert.equal(revoked.body.localCredentialRevokeEnabled, true);
    assertCredentialRouteSafety(revoked.body);
    assertNoSensitiveSocialReadback(revoked.body);

    const repeated = await requestJson<Row>(app, "DELETE", "/social/connectors/credentials/bluesky", {
      token: OWNER_TOKEN,
    });
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.status, "social_connector_credential_revoke_noop");
    assert.equal(repeated.body.connectionStatus, "revoked");
    assertNoSensitiveSocialReadback(repeated.body);

    const ownerRows = socialCredentialRows(db).filter((row) => row.owner_user_id === "owner-user");
    const otherRows = socialCredentialRows(db).filter((row) => row.owner_user_id === "other-user");
    assert.equal(ownerRows.every((row) => row.status === "revoked"), true);
    assert.equal(otherRows.every((row) => row.status === "active"), true);
    assert.equal(db.tableCalls.includes("social_connections"), false);
    assert.equal(db.tableCalls.includes("social_posts"), false);
    assert.equal(db.writeCalls.every((call) => call === "social_connector_credentials.update"), true);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social readiness remains paused and legacy action routes fail closed", async () => {
  const db = new SocialRouteSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();
  const hostileBody = {
    platform: "mastodon",
    handle: "social-handle-marker",
    accessToken: "social-secret-marker",
    refreshToken: "social-secret-marker-refresh",
    providerAccountId: "provider-account-marker",
    code: "social-secret-marker-code",
    documentId: "doc-1",
    content: "post body that should never dispatch",
  };

  try {
    const readiness = await requestJson<Row>(app, "GET", "/social/readiness", {
      token: OWNER_TOKEN,
    });
    assert.equal(readiness.status, 200);
    assert.equal(readiness.body.mode, "readback_only");
    assert.equal(readiness.body.credentialStorageAccepted, false);
    assert.equal(readiness.body.postingEnabled, false);
    assert.equal(readiness.body.connectionActionsEnabled, false);
    assert.equal(readiness.body.teaserGenerationEnabled, false);
    assert.deepEqual(
      readiness.body.supportedProviders.map((provider: Row) => provider.platform),
      ["bluesky", "mastodon", "tumblr", "linkedin", "reddit", "wordpress", "ghost"],
    );
    assert.deepEqual(
      readiness.body.supportedProviders.map((provider: Row) => provider.status),
      ["paused", "paused", "paused", "paused", "paused", "paused", "paused"],
    );
    assert.deepEqual(readiness.body.safety, {
      externalPosting: "paused",
      credentialStorage: "not_accepted",
      providerCalls: "disabled",
      queueDispatch: "disabled",
      webhookHandling: "disabled",
    });
    assertNoSensitiveSocialReadback(readiness.body);

    const routes: Array<[string, string, unknown?]> = [
      ["GET", "/social/connections"],
      ["POST", "/social/connections/simple", hostileBody],
      ["GET", "/social/auth/tumblr"],
      ["GET", "/social/callback/tumblr?code=social-secret-marker-code&state=social-secret-marker-state"],
      ["PATCH", "/social/connections/connection-1", hostileBody],
      ["DELETE", "/social/connections/connection-1"],
      ["POST", "/social/compose", hostileBody],
      ["GET", "/social/posts"],
      ["POST", "/social/generate-teaser", hostileBody],
    ];

    for (const [method, path, body] of routes) {
      const response = await requestJson<Row>(app, method, path, {
        token: OWNER_TOKEN,
        body,
      });

      assert.equal(response.status, 423, `${method} ${path}`);
      assert.deepEqual(response.body, {
        error: "Social publishing connectors are paused while credential storage and posting safety are reviewed.",
        code: "social_connectors_paused",
        credentialStorageAccepted: false,
        postingEnabled: false,
        connectionActionsEnabled: false,
      });
      assertNoSensitiveSocialReadback(response.body);
    }

    assert.equal(db.tableCalls.every((table) => table === "profiles"), true);
    assert.equal(db.tableCalls.includes("social_connections"), false);
    assert.equal(db.tableCalls.includes("social_posts"), false);
    assert.equal(db.tableCalls.includes("documents"), false);
    assert.deepEqual(socialCredentialRows(db), []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social route source stays inside owner credential and paused publishing scope", () => {
  const routeSource = readFileSync("apps/api/src/routes/social.ts", "utf8");

  assert.equal(existsSync("apps/api/src/services/social.service.ts"), false);
  assert.match(routeSource, /socialRouter\.get\("\/readiness"/);
  assert.match(routeSource, /socialRouter\.get\("\/connectors\/credentials"/);
  assert.match(routeSource, /socialRouter\.post\("\/connectors\/credentials"/);
  assert.match(routeSource, /socialRouter\.delete\("\/connectors\/credentials\/:provider"/);
  assert.match(routeSource, /social_connectors_paused/);
  assert.match(routeSource, /storeSocialConnectorCredential/);
  assert.doesNotMatch(routeSource, /social_connections|social_posts|dispatchPost|postTo[A-Z]|fetch\(|new Queue|Worker\(|emitWebhook|billingClient/i);
  assert.doesNotMatch(routeSource, /providerSdk|providerClient|externalPost\s*\(|scheduled_for|sent_at|error_message/i);
  assert.doesNotMatch(routeSource, /tokenExchange\s*\(|refreshToken\s*\(|stateHandle|accountLookup|profileLookup|providerTokenRevocation\s*\(/i);
  assert.doesNotMatch(routeSource, /Settings|document\.|documents\.|public syndication|stripe|cloudflare|redis/i);
});
