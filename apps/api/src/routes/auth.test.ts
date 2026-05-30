import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import {
  canCreatePersona,
  canCreateSpace,
  canCreateThread,
  canPublishDocuments,
  hasTier,
  isAdmin,
} from "@station/auth";
import { setSupabaseAdminForTests, setSupabaseAuthClientFactoryForTests } from "../lib/supabase";
import { optionalAuth, requireAuth } from "../middleware/require-auth";
import { authRouter } from "./auth";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class AuthTestSupabase {
  createdUserPayloads: Row[] = [];
  signOutTokens: Array<string | undefined> = [];

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
      },
      {
        id: "admin-user",
        email: "admin@example.test",
        tier: "private",
        is_admin: true,
      },
      {
        id: "new-user",
        email: "new@example.test",
        tier: "visitor",
        is_admin: false,
      },
    ],
  };

  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["admin-token", { id: "admin-user", email: "admin@example.test" }],
  ]);

  client = {
    auth: {
      admin: {
        createUser: async (payload: Row) => {
          this.createdUserPayloads.push(payload);
          return {
            data: { user: { id: "new-user", email: payload.email } },
            error: null,
          };
        },
      },
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token) ?? null;
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => new ProfileQuery(this, table),
  };

  authClient(accessToken?: string) {
    return {
      auth: {
        signInWithPassword: async (input: { email: string; password: string }) => {
          const profile = this.tables.profiles.find((row) => row.email === input.email);
          if (!profile || input.password === "bad-password") {
            return { data: { user: null, session: null }, error: { message: "Invalid credentials." } };
          }

          return {
            data: {
              user: { id: profile.id, email: input.email },
              session: {
                access_token: `${profile.id}-access-token`,
                refresh_token: `${profile.id}-refresh-token`,
              },
            },
            error: null,
          };
        },
        signOut: async () => {
          this.signOutTokens.push(accessToken);
          return { error: null };
        },
      },
    };
  }

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class ProfileQuery {
  private filters: Array<[string, unknown]> = [];

  constructor(private db: AuthTestSupabase, private table: string) {}

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
}

function createAuthProofApp() {
  const app = express();
  app.use(express.json());
  app.get("/required", requireAuth, (req, res) => res.status(200).json({ user: req.user }));
  app.get("/optional", optionalAuth, (req, res) => res.status(200).json({ user: req.user ?? null }));
  app.use("/auth", authRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; authHeader?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.authHeader) {
      headers.Authorization = options.authHeader;
    } else if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

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

function useAuthFakes(db: AuthTestSupabase) {
  setSupabaseAdminForTests(db.client as any);
  setSupabaseAuthClientFactoryForTests((accessToken) => db.authClient(accessToken) as any);
}

function resetAuthFakes() {
  setSupabaseAdminForTests(null);
  setSupabaseAuthClientFactoryForTests(null);
}

test("requireAuth rejects missing and malformed Bearer tokens", async () => {
  const db = new AuthTestSupabase();
  useAuthFakes(db);
  const app = createAuthProofApp();

  try {
    const missing = await requestJson(app, "GET", "/required");
    assert.equal(missing.status, 401);
    assert.equal(missing.body.error, "Missing or invalid Authorization header.");

    const malformed = await requestJson(app, "GET", "/required", {
      authHeader: "Basic not-a-bearer-token",
    });
    assert.equal(malformed.status, 401);
    assert.equal(malformed.body.error, "Missing or invalid Authorization header.");
  } finally {
    resetAuthFakes();
  }
});

test("requireAuth rejects invalid tokens and normalizes valid req.user", async () => {
  const db = new AuthTestSupabase();
  useAuthFakes(db);
  const app = createAuthProofApp();

  try {
    const invalid = await requestJson(app, "GET", "/required", { token: "invalid-token" });
    assert.equal(invalid.status, 401);
    assert.equal(invalid.body.error, "Invalid or expired token.");

    const valid = await requestJson(app, "GET", "/required", { token: "owner-token" });
    assert.equal(valid.status, 200);
    assert.deepEqual(valid.body.user, {
      id: "owner-user",
      email: "owner@example.test",
      tier: "creator",
      isAdmin: false,
    });
  } finally {
    resetAuthFakes();
  }
});

test("/auth/me returns normalized user and /auth/signout requires auth", async () => {
  const db = new AuthTestSupabase();
  useAuthFakes(db);
  const app = createAuthProofApp();

  try {
    const me = await requestJson(app, "GET", "/auth/me", { token: "admin-token" });
    assert.equal(me.status, 200);
    assert.deepEqual(me.body.user, {
      id: "admin-user",
      email: "admin@example.test",
      tier: "private",
      isAdmin: true,
    });

    const blockedSignout = await requestJson(app, "POST", "/auth/signout");
    assert.equal(blockedSignout.status, 401);

    const signout = await requestJson(app, "POST", "/auth/signout", { token: "owner-token" });
    assert.equal(signout.status, 204);
    assert.equal(signout.body, null);
    assert.deepEqual(db.signOutTokens, ["owner-token"]);
  } finally {
    resetAuthFakes();
  }
});

test("optionalAuth ignores missing and invalid tokens while preserving valid users", async () => {
  const db = new AuthTestSupabase();
  useAuthFakes(db);
  const app = createAuthProofApp();

  try {
    const missing = await requestJson(app, "GET", "/optional");
    assert.equal(missing.status, 200);
    assert.equal(missing.body.user, null);

    const invalid = await requestJson(app, "GET", "/optional", { token: "invalid-token" });
    assert.equal(invalid.status, 200);
    assert.equal(invalid.body.user, null);

    const valid = await requestJson(app, "GET", "/optional", { token: "owner-token" });
    assert.equal(valid.status, 200);
    assert.equal(valid.body.user.id, "owner-user");
  } finally {
    resetAuthFakes();
  }
});

test("signup deliberately confirms beta users before returning a session", async () => {
  const db = new AuthTestSupabase();
  useAuthFakes(db);
  const app = createAuthProofApp();

  try {
    const created = await requestJson(app, "POST", "/auth/signup", {
      body: {
        email: "new@example.test",
        password: "long-enough-password",
        username: "new_user",
        displayName: "New User",
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.userId, "new-user");
    assert.equal(created.body.email, "new@example.test");
    assert.equal(created.body.tier, "visitor");
    assert.equal(created.body.accessToken, "new-user-access-token");
    assert.equal(db.createdUserPayloads.length, 1);
    assert.equal(db.createdUserPayloads[0].email_confirm, true);
  } finally {
    resetAuthFakes();
  }
});

test("tier and admin permission helpers use normalized AuthUser shape", () => {
  const visitor = { id: "visitor", tier: "visitor" as const, email: "visitor@example.test" };
  const creator = { id: "creator", tier: "creator" as const, email: "creator@example.test" };
  const admin = { id: "admin", tier: "visitor" as const, isAdmin: true, email: "admin@example.test" };

  assert.equal(isAdmin(admin), true);
  assert.equal(isAdmin(visitor), false);
  assert.equal(hasTier(null, "visitor"), true);
  assert.equal(hasTier(visitor, "private"), false);
  assert.equal(hasTier(creator, "creator"), true);
  assert.equal(canCreatePersona(visitor, 0), false);
  assert.equal(canCreatePersona(creator, 250), true);
  assert.equal(canCreateSpace(creator, 0), true);
  assert.equal(canCreateSpace(creator, 1), false);
  assert.equal(canCreateThread(visitor), false);
  assert.equal(canCreateThread(creator), true);
  assert.equal(canPublishDocuments(creator), true);
  assert.equal(canCreateSpace(admin, 999), true);
});
