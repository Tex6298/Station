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
    ai_provider_byok_secrets: [],
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
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private orderSpec: { field: string; ascending: boolean } | null = null;

  constructor(private db: AiSettingsSupabase, private table: string) {}

  select() {
    return this;
  }

  update(patch: Row) {
    this.operation = "update";
    this.payload = patch;
    return this;
  }

  insert(payload: Row) {
    this.operation = "insert";
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

  private matchingRows() {
    let rows = [...this.db.rows(this.table)].filter((candidate) =>
      this.filters.every(([field, value]) => candidate[field] === value)
    );

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((left, right) => {
        if (left[field] === right[field]) return 0;
        if (left[field] == null) return 1;
        if (right[field] == null) return -1;
        return (left[field] > right[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    return rows;
  }

  private async execute(mode?: "single") {
    let rows: Row[];
    if (this.operation === "insert") {
      const row = {
        id: `${this.table}-${this.db.rows(this.table).length + 1}`,
        created_at: "2026-06-28T12:00:00.000Z",
        updated_at: "2026-06-28T12:00:00.000Z",
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      rows = [row];
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        row.updated_at = "2026-06-28T12:05:00.000Z";
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
  assert.equal(serialized.includes("owner-openai-rotated"), false);
  assert.equal(serialized.includes("sk-gemini-not-supported"), false);
  assert.equal(serialized.includes("ciphertext"), false);
  assert.equal(serialized.includes("authTag"), false);
  assert.equal(serialized.includes("encrypted_key"), false);
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
    assert.equal(owner.body.settings.supportedProviders[0].storageStatus, "legacy_plaintext");
    assert.equal(owner.body.settings.supportedProviders[1].configured, false);
    assert.equal(owner.body.settings.supportedProviders[2].keyLastFour, "5678");
    assert.equal(owner.body.settings.supportedProviders[2].storageStatus, "legacy_plaintext");
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

test("AI provider settings require encryption config before storing keys", async () => {
  const db = new AiSettingsSupabase();
  const previousKey = process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
  delete process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const missingConfig = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: {
        keys: {
          openai: "owner-openai-rotated-9999",
        },
      },
    });

    assert.equal(missingConfig.status, 503);
    assert.deepEqual(missingConfig.body, {
      error: "AI provider key encryption is not configured.",
      code: "ai_provider_key_encryption_unconfigured",
    });
    assert.equal(db.rows("ai_provider_byok_secrets").length, 0);
    assert.equal(db.rows("profiles").find((row) => row.id === "owner-user")!.byok_openai_key, "sk-owner-openai-1234");
    assertNoRawKeys(missingConfig.body);
  } finally {
    resetSettingsFakes();
    if (previousKey == null) {
      delete process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
    } else {
      process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY = previousKey;
    }
  }
});

test("AI provider settings encrypt supported keys, clear legacy keys, and keep updates owner-scoped", async () => {
  const db = new AiSettingsSupabase();
  const previousKey = process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
  process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY = "test-ai-provider-key-encryption-key";
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const updated = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: {
        aiMode: "byok",
        keys: {
          openai: " owner-openai-rotated-9999 ",
        },
        clearKeys: {
          deepseek: true,
        },
      },
    });

    assert.equal(updated.status, 200);
    const ownerProfile = db.rows("profiles").find((row) => row.id === "owner-user")!;
    const otherProfile = db.rows("profiles").find((row) => row.id === "other-user")!;
    assert.equal(ownerProfile.ai_mode, "byok");
    assert.equal(ownerProfile.byok_openai_key, null);
    assert.equal(ownerProfile.byok_anthropic_key, null);
    assert.equal(ownerProfile.byok_deepseek_key, null);
    assert.equal(otherProfile.byok_openai_key, "sk-other-openai-4444");

    const rows = db.rows("ai_provider_byok_secrets");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].owner_user_id, "owner-user");
    assert.equal(rows[0].provider, "openai");
    assert.equal(rows[0].status, "active");
    assert.equal(rows[0].key_last_four, "9999");
    assert.equal(typeof rows[0].key_fingerprint, "string");
    assert.equal(rows[0].key_fingerprint.length, 12);
    assert.equal(typeof rows[0].encrypted_key.ciphertext, "string");
    assert.equal(JSON.stringify(rows[0].encrypted_key).includes("owner-openai-rotated-9999"), false);
    assert.equal(typeof rows[0].rotated_at, "string");

    const providers = updated.body.settings.supportedProviders;
    assert.equal(providers.find((provider: Row) => provider.provider === "openai").configured, true);
    assert.equal(providers.find((provider: Row) => provider.provider === "openai").keyLastFour, "9999");
    assert.equal(providers.find((provider: Row) => provider.provider === "openai").storageStatus, "encrypted");
    assert.equal(providers.find((provider: Row) => provider.provider === "deepseek").configured, false);
    assert.equal(providers.find((provider: Row) => provider.provider === "deepseek").storageStatus, "none");
    assertNoRawKeys(updated.body);
  } finally {
    resetSettingsFakes();
    if (previousKey == null) {
      delete process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
    } else {
      process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY = previousKey;
    }
  }
});

test("AI provider settings clear revokes active encrypted keys and returns revoked metadata", async () => {
  const db = new AiSettingsSupabase();
  const previousKey = process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
  process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY = "test-ai-provider-key-encryption-key";
  useSettingsFakes(db);
  const app = createSettingsProofApp();

  try {
    const created = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: { keys: { openai: "owner-openai-rotated-9999" } },
    });
    assert.equal(created.status, 200);

    const cleared = await requestJson(app, "PATCH", "/settings/ai-provider", {
      token: "owner-token",
      body: { clearKeys: { openai: true } },
    });

    assert.equal(cleared.status, 200);
    const row = db.rows("ai_provider_byok_secrets")[0];
    assert.equal(row.status, "revoked");
    assert.equal(typeof row.revoked_at, "string");
    assert.equal(db.rows("profiles").find((profile) => profile.id === "owner-user")!.byok_openai_key, null);

    const openai = cleared.body.settings.supportedProviders.find((provider: Row) => provider.provider === "openai");
    assert.equal(openai.configured, false);
    assert.equal(openai.storageStatus, "revoked");
    assert.equal(openai.keyLastFour, "9999");
    assert.equal(typeof openai.revokedAt, "string");
    assertNoRawKeys(cleared.body);
  } finally {
    resetSettingsFakes();
    if (previousKey == null) {
      delete process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY;
    } else {
      process.env.AI_PROVIDER_KEY_ENCRYPTION_KEY = previousKey;
    }
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
