import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setSupabaseAdminForTests } from "../../lib/supabase";
import {
  SocialConnectorCredentialStorageError,
  decryptSocialConnectorCredentialForTests,
  loadSocialConnectorCredentialReadbacks,
  revokeSocialConnectorCredential,
  socialConnectorCredentialEncryptionConfigured,
  storeSocialConnectorCredential,
} from "./credential-storage";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class SocialConnectorStorageSupabase {
  tableCalls: string[] = [];
  failSelect = false;
  failInsert = false;
  failUpdate = false;
  tables: Record<string, Row[]> = {
    social_connector_credentials: [],
  };

  client = {
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

  constructor(private db: SocialConnectorStorageSupabase, private table: string) {}

  select() {
    return this;
  }

  insert(payload: Row) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
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

  private async execute(mode?: "single") {
    if (this.operation === "select" && this.db.failSelect) {
      return { data: null, error: { message: "db details should stay bounded" } };
    }
    if (this.operation === "insert" && this.db.failInsert) {
      return { data: null, error: { message: "db details should stay bounded" } };
    }
    if (this.operation === "update" && this.db.failUpdate) {
      return { data: null, error: { message: "db details should stay bounded" } };
    }

    let rows: Row[];
    if (this.operation === "insert") {
      const row = {
        id: `${this.table}-${this.db.rows(this.table).length + 1}`,
        created_at: `2026-07-06T11:0${this.db.rows(this.table).length}:00.000Z`,
        updated_at: `2026-07-06T11:0${this.db.rows(this.table).length}:00.000Z`,
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      rows = [row];
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        row.updated_at = "2026-07-06T11:05:00.000Z";
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

const validKey = "social-connector-credential-test-key-32-plus";
const secretMaterial = {
  schema: "station.social_connector.manual_credential.v1",
  provider: "bluesky",
  identifier: "social-handle-fixture",
  appPassword: "app-password-fixture",
  accessToken: "access-token-fixture",
  refreshToken: "refresh-token-fixture",
  oauthCode: "oauth-code-fixture",
  providerAccountId: "provider-account-fixture",
  callbackValue: "callback-value-fixture",
  envValue: "env-value-fixture",
};

const forbidden = [
  "social-handle-fixture",
  "app-password-fixture",
  "access-token-fixture",
  "refresh-token-fixture",
  "oauth-code-fixture",
  "provider-account-fixture",
  "callback-value-fixture",
  "env-value-fixture",
];

async function withSocialConnectorKey(value: string | null, fn: () => Promise<void>) {
  const previous = process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
  try {
    if (value === null) {
      delete process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
    } else {
      process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY = value;
    }
    await fn();
  } finally {
    if (previous === undefined) {
      delete process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
    } else {
      process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY = previous;
    }
  }
}

test("social connector credentials fail closed before storage without a valid key", async () => {
  const db = new SocialConnectorStorageSupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    await withSocialConnectorKey(null, async () => {
      assert.equal(socialConnectorCredentialEncryptionConfigured(), false);
      await assert.rejects(
        () => storeSocialConnectorCredential({
          ownerUserId: "owner-user",
          provider: "bluesky",
          credentialMaterial: secretMaterial,
        }),
        (error: any) =>
          error instanceof SocialConnectorCredentialStorageError &&
          error.code === "social_connector_credential_encryption_unconfigured",
      );
    });

    await withSocialConnectorKey("short", async () => {
      assert.equal(socialConnectorCredentialEncryptionConfigured(), false);
      await assert.rejects(
        () => storeSocialConnectorCredential({
          ownerUserId: "owner-user",
          provider: "bluesky",
          credentialMaterial: secretMaterial,
        }),
        (error: any) =>
          error instanceof SocialConnectorCredentialStorageError &&
          error.code === "social_connector_credential_encryption_malformed",
      );
    });

    assert.deepEqual(db.tableCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential storage encrypts payloads and returns metadata only", async () => {
  const db = new SocialConnectorStorageSupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    await withSocialConnectorKey(validKey, async () => {
      assert.equal(socialConnectorCredentialEncryptionConfigured(), true);
      const readback = await storeSocialConnectorCredential({
        ownerUserId: "owner-user",
        provider: "bluesky",
        credentialMaterial: secretMaterial,
      });
      const row = db.rows("social_connector_credentials")[0];
      const stored = JSON.stringify(row);
      const rendered = JSON.stringify(readback);

      assert.equal(row.owner_user_id, "owner-user");
      assert.equal(row.provider, "bluesky");
      assert.equal(row.purpose, "social_connector");
      assert.equal(row.credential_category, "manual_credential");
      assert.equal(row.status, "active");
      assert.equal(row.encrypted_credential.schema, "station.social_connector.credential.v1");
      assert.equal(row.encrypted_credential.algorithm, "aes-256-gcm");
      assert.equal(typeof row.credential_fingerprint, "string");
      assert.equal(row.credential_fingerprint.length, 16);
      assert.deepEqual(decryptSocialConnectorCredentialForTests(row.encrypted_credential), secretMaterial);

      assert.deepEqual(readback, {
        provider: "bluesky",
        providerLabel: "Bluesky",
        purpose: "social_connector",
        status: "active",
        category: "manual_credential",
        configured: true,
        createdAt: "2026-07-06T11:00:00.000Z",
        updatedAt: "2026-07-06T11:00:00.000Z",
        rotatedAt: null,
        revokedAt: null,
        safety: {
          secretValuesReturned: false,
          rawEncryptedPayloadReturned: false,
          oauthInThisSlice: false,
          providerLookupInThisSlice: false,
          postingInThisSlice: false,
        },
      });

      for (const value of forbidden) {
        assert.equal(stored.includes(value), false, `${value} persisted in plaintext`);
        assert.equal(rendered.includes(value), false, `${value} leaked into readback`);
      }
      assert.equal(rendered.includes("ciphertext"), false);
      assert.equal(db.tableCalls.includes("social_connections"), false);
      assert.equal(db.tableCalls.includes("social_posts"), false);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential readbacks are owner-scoped and active credentials are unique", async () => {
  const db = new SocialConnectorStorageSupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    await withSocialConnectorKey(validKey, async () => {
      await storeSocialConnectorCredential({
        ownerUserId: "owner-user",
        provider: "bluesky",
        credentialMaterial: { ...secretMaterial, appPassword: "first-app-password-fixture" },
        now: "2026-07-06T11:10:00.000Z",
      });
      await storeSocialConnectorCredential({
        ownerUserId: "other-user",
        provider: "bluesky",
        credentialMaterial: { ...secretMaterial, appPassword: "other-app-password-fixture" },
        now: "2026-07-06T11:11:00.000Z",
      });
      await storeSocialConnectorCredential({
        ownerUserId: "owner-user",
        provider: "bluesky",
        credentialMaterial: { ...secretMaterial, appPassword: "second-app-password-fixture" },
        now: "2026-07-06T11:12:00.000Z",
      });

      const ownerRows = db.rows("social_connector_credentials").filter((row) => row.owner_user_id === "owner-user");
      assert.equal(ownerRows.length, 2);
      assert.equal(ownerRows.filter((row) => row.status === "active").length, 1);
      assert.equal(ownerRows.filter((row) => row.status === "revoked").length, 1);
      assert.equal(ownerRows.find((row) => row.status === "active")?.rotated_at, "2026-07-06T11:12:00.000Z");

      const readbacks = await loadSocialConnectorCredentialReadbacks("owner-user");
      assert.equal(readbacks.length, 2);
      assert.equal(readbacks.every((row) => row.provider === "bluesky"), true);
      assert.equal(readbacks.some((row) => row.status === "active"), true);
      assert.equal(JSON.stringify(readbacks).includes("other-user"), false);

      const revoked = await revokeSocialConnectorCredential({
        ownerUserId: "owner-user",
        provider: "bluesky",
        now: "2026-07-06T11:13:00.000Z",
      });
      assert.equal(revoked.filter((row) => row.status === "active").length, 0);
      assert.equal(db.rows("social_connector_credentials").filter((row) => row.owner_user_id === "owner-user" && row.status === "active").length, 0);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential storage returns bounded failures", async () => {
  const loadFailDb = new SocialConnectorStorageSupabase();
  setSupabaseAdminForTests(loadFailDb.client as any);

  try {
    await withSocialConnectorKey(validKey, async () => {
      loadFailDb.failSelect = true;
      await assert.rejects(
        () => storeSocialConnectorCredential({
          ownerUserId: "owner-user",
          provider: "bluesky",
          credentialMaterial: secretMaterial,
        }),
        (error: any) =>
          error instanceof SocialConnectorCredentialStorageError &&
          error.code === "social_connector_credential_load_failed" &&
          !/social_connector_credentials|sql|stack|db details/i.test(error.message),
      );
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const insertFailDb = new SocialConnectorStorageSupabase();
  setSupabaseAdminForTests(insertFailDb.client as any);

  try {
    await withSocialConnectorKey(validKey, async () => {
      insertFailDb.failInsert = true;
      await assert.rejects(
        () => storeSocialConnectorCredential({
          ownerUserId: "owner-user",
          provider: "bluesky",
          credentialMaterial: secretMaterial,
        }),
        (error: any) =>
          error instanceof SocialConnectorCredentialStorageError &&
          error.code === "social_connector_credential_write_failed" &&
          !/social_connector_credentials|sql|stack|db details/i.test(error.message),
      );
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("social connector credential migration and source stay inside dormant storage scope", () => {
  const migration = readFileSync("infra/supabase/migrations/072_social_connector_credentials.sql", "utf8");
  const storageSource = readFileSync("apps/api/src/services/social-connectors/credential-storage.ts", "utf8");

  assert.match(migration, /create table if not exists public\.social_connector_credentials/);
  assert.match(migration, /owner_user_id/);
  assert.match(migration, /provider in \('bluesky'\)/);
  assert.match(migration, /purpose = 'social_connector'/);
  assert.match(migration, /credential_category = 'manual_credential'/);
  assert.match(migration, /encrypted_credential\s+jsonb not null/);
  assert.match(migration, /social_connector_credentials_owner_provider_active_idx/);
  assert.match(migration, /where status = 'active'/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /auth\.uid\(\) = owner_user_id/);
  assert.doesNotMatch(migration, /\b(access_token|refresh_token|app_password|admin_key|oauth_code|callback_url|webhook_payload|provider_account_id)\b|social_connections|social_posts/i);
  assert.doesNotMatch(migration, /\bhandle\s+(text|varchar)|\bprovider_account/i);

  assert.doesNotMatch(storageSource, /fetch\s*\(|dispatchPost|postTo[A-Z]|social_connections|social_posts|OAuth|tokenExchange|callbackUrl|webhook|new Queue|Worker\(|redis|cloudflare|stripe|billing/i);
  assert.doesNotMatch(storageSource, /providerSdk|providerClient|externalPost|scheduled_for|sent_at|error_message/i);
});
