import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { settingsRouter } from "./settings";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class AiSettingsSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: "sk-owner-openai-1234",
        byok_anthropic_key: null,
        byok_deepseek_key: "sk-owner-deepseek-5678",
      },
      {
        id: "other-user",
        email: "other@example.test",
        tier: "creator",
        is_admin: false,
        ai_mode: "byok",
        byok_openai_key: "sk-other-openai-4444",
        byok_anthropic_key: null,
        byok_deepseek_key: null,
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
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class Query {
  private filters: Array<[string, unknown]> = [];
  private patch: Row | null = null;

  constructor(private db: AiSettingsSupabase, private table: string) {}

  select() {
    return this;
  }

  update(patch: Row) {
    this.patch = patch;
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

    if (!row) {
      return Promise.resolve({ data: null, error: { message: `Expected one ${this.table} row.` } });
    }

    if (this.patch) Object.assign(row, this.patch);
    return Promise.resolve({ data: row, error: null });
  }
}

function createSettingsProofApp() {
  const app = express();
  app.use(express.json());
  app.use("/settings", settingsRouter);
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

function useSettingsFakes(db: AiSettingsSupabase) {
  setSupabaseAdminForTests(db.client as any);
}

function resetSettingsFakes() {
  setSupabaseAdminForTests(null);
}

function assertNoRawKeys(body: unknown) {
  const serialized = JSON.stringify(body);
  assert.equal(serialized.includes("sk-owner-openai"), false);
  assert.equal(serialized.includes("sk-owner-deepseek"), false);
  assert.equal(serialized.includes("sk-owner-anthropic"), false);
  assert.equal(serialized.includes("sk-other-openai"), false);
}

test("AI provider settings require auth and return masked owner readback only", async () => {
  const db = new AiSettingsSupabase();
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const visitor = await requestJson(app, "GET", "/settings/ai-provider");
    assert.equal(visitor.status, 401);

    const owner = await requestJson(app, "GET", "/settings/ai-provider", { token: "owner-token" });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.settings.aiMode, "platform");
    assert.deepEqual(
      owner.body.settings.supportedProviders.map((provider: Row) => provider.provider),
      ["openai", "anthropic", "deepseek"]
    );
    assert.equal(owner.body.settings.supportedProviders[0].configured, true);
    assert.equal(owner.body.settings.supportedProviders[0].keyLastFour, "1234");
    assert.equal(owner.body.settings.supportedProviders[1].configured, false);
    assert.equal(owner.body.settings.supportedProviders[2].keyLastFour, "5678");
    assert.equal(
      owner.body.settings.supportedProviders.some((provider: Row) => provider.provider === "gemini"),
      false
    );
    assert.equal(
      owner.body.settings.supportedProviders.some((provider: Row) => provider.provider === "nvidia"),
      false
    );
    assert.match(owner.body.settings.policy.gemini, /embeddings-only/i);
    assert.match(owner.body.settings.policy.nvidia, /do not use/i);
    assertNoRawKeys(owner.body);
  } finally {
    resetSettingsFakes();
  }
});

test("AI provider settings update ai_mode, store supported keys, and clear keys owner-scoped", async () => {
  const db = new AiSettingsSupabase();
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const updated = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: {
        aiMode: "byok",
        keys: {
          anthropic: " sk-owner-anthropic-9999 ",
        },
        clearKeys: {
          openai: true,
        },
      },
    });

    assert.equal(updated.status, 200);
    const ownerProfile = db.rows("profiles").find((row) => row.id === "owner-user")!;
    const otherProfile = db.rows("profiles").find((row) => row.id === "other-user")!;
    assert.equal(ownerProfile.ai_mode, "byok");
    assert.equal(ownerProfile.byok_openai_key, null);
    assert.equal(ownerProfile.byok_anthropic_key, "sk-owner-anthropic-9999");
    assert.equal(ownerProfile.byok_deepseek_key, "sk-owner-deepseek-5678");
    assert.equal(otherProfile.byok_openai_key, "sk-other-openai-4444");

    const providers = updated.body.settings.supportedProviders;
    assert.equal(providers.find((provider: Row) => provider.provider === "openai").configured, false);
    assert.equal(providers.find((provider: Row) => provider.provider === "anthropic").configured, true);
    assert.equal(providers.find((provider: Row) => provider.provider === "anthropic").keyLastFour, "9999");
    assertNoRawKeys(updated.body);
  } finally {
    resetSettingsFakes();
  }
});

test("AI provider settings reject unsupported provider keys and set-clear conflicts", async () => {
  const db = new AiSettingsSupabase();
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const unsupported = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: { keys: { gemini: "sk-gemini-not-supported-1234" } },
    });
    assert.equal(unsupported.status, 400);
    assertNoRawKeys(unsupported.body);

    const conflict = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: {
        keys: { deepseek: "sk-owner-deepseek-0000" },
        clearKeys: { deepseek: true },
      },
    });
    assert.equal(conflict.status, 400);
    assert.match(JSON.stringify(conflict.body), /Set or clear/);
    assertNoRawKeys(conflict.body);
  } finally {
    resetSettingsFakes();
  }
});
