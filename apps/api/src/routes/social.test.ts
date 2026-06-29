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

class SocialReadinessSupabase {
  tableCalls: string[] = [];

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
      },
    ],
  };

  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
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
      return new ProfileQuery(this, table);
    },
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class ProfileQuery {
  private filters: Array<[string, unknown]> = [];

  constructor(private db: SocialReadinessSupabase, private table: string) {}

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
        ? { data: row, error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }

  insert() {
    throw new Error(`${this.table} insert should not run in social readiness tests.`);
  }

  update() {
    throw new Error(`${this.table} update should not run in social readiness tests.`);
  }

  delete() {
    throw new Error(`${this.table} delete should not run in social readiness tests.`);
  }
}

async function createSocialApp() {
  const { socialRouter } = await import("./social.js");
  const app = express();
  app.use(express.json());
  app.use("/social", socialRouter);
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

function assertNoSensitiveSocialReadback(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    "owner-token",
    "social-secret-marker",
    "social-handle-marker",
    "provider-account-marker",
    "refresh_token",
    "access_token",
    "app_password",
    "application_password",
    "admin_key",
    "oauth_code",
    "callback_url",
    "external_url",
    "authUrl",
    "social_connections",
    "social_posts",
    "SQL",
    "stack",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into social readback`);
  }
}

test("social readiness requires an authenticated owner session", async () => {
  const db = new SocialReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    const response = await requestJson(app, "GET", "/social/readiness");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Missing or invalid Authorization header.");
    assert.equal(db.tableCalls.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social readiness returns status categories without credentials or provider rows", async () => {
  const db = new SocialReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createSocialApp();

  try {
    const response = await requestJson(app, "GET", "/social/readiness", {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.mode, "readback_only");
    assert.equal(response.body.credentialStorageAccepted, false);
    assert.equal(response.body.postingEnabled, false);
    assert.equal(response.body.connectionActionsEnabled, false);
    assert.equal(response.body.teaserGenerationEnabled, false);
    assert.deepEqual(
      response.body.supportedProviders.map((provider: Row) => provider.platform),
      ["bluesky", "mastodon", "tumblr", "linkedin", "reddit", "wordpress", "ghost"]
    );
    assert.deepEqual(
      response.body.supportedProviders.map((provider: Row) => provider.status),
      ["paused", "paused", "paused", "paused", "paused", "paused", "paused"]
    );
    assert.deepEqual(
      response.body.supportedProviders
        .filter((provider: Row) => provider.authStyle === "oauth")
        .map((provider: Row) => [provider.platform, typeof provider.oauthAppConfigured]),
      [["tumblr", "boolean"], ["linkedin", "boolean"], ["reddit", "boolean"]]
    );
    assert.deepEqual(Object.keys(response.body.oauthApps), ["tumblr", "linkedin", "reddit"]);
    for (const appStatus of Object.values(response.body.oauthApps) as Row[]) {
      assert.equal(typeof appStatus.configured, "boolean");
      assert.match(appStatus.status, /^(configured|missing)$/);
    }
    assert.deepEqual(response.body.safety, {
      externalPosting: "paused",
      credentialStorage: "not_accepted",
      providerCalls: "disabled",
      queueDispatch: "disabled",
      webhookHandling: "disabled",
    });
    assert.deepEqual(db.tableCalls, ["profiles"]);
    assertNoSensitiveSocialReadback(response.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("legacy social action routes fail closed before social table writes or provider calls", async () => {
  const db = new SocialReadinessSupabase();
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

  try {
    for (const [method, path, body] of routes) {
      const response = await requestJson(app, method, path, {
        token: "owner-token",
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
  } finally {
    setSupabaseAdminForTests(null);
  }
});
