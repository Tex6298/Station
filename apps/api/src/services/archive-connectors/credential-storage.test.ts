import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setSupabaseAdminForTests } from "../../lib/supabase";
import {
  ArchiveConnectorCredentialStorageError,
  archiveConnectorCredentialEncryptionConfigured,
  consumeArchiveConnectorOAuthState,
  createArchiveConnectorOAuthState,
  loadArchiveConnectorCredentialReadbacks,
  revokeArchiveConnectorCredential,
  storeArchiveConnectorCredential,
} from "./credential-storage";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class ArchiveConnectorStorageSupabase {
  tables: Record<string, Row[]> = {
    archive_connector_credentials: [],
    archive_connector_oauth_states: [],
  };

  client = {
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

  constructor(private db: ArchiveConnectorStorageSupabase, private table: string) {}

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
    let rows: Row[];
    if (this.operation === "insert") {
      const row = {
        id: `${this.table}-${this.db.rows(this.table).length + 1}`,
        created_at: "2026-06-29T21:00:00.000Z",
        updated_at: "2026-06-29T21:00:00.000Z",
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      rows = [row];
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        row.updated_at = "2026-06-29T21:05:00.000Z";
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

const validKey = "archive-connector-credential-test-key-32-plus";
const secretMaterial = {
  accessToken: "access-token-fixture",
  refreshToken: "refresh-token-fixture",
  callbackCode: "oauth-code-fixture",
  cookie: "cookie-fixture",
  providerPayload: "provider-payload-fixture",
};

const forbidden = [
  "access-token-fixture",
  "refresh-token-fixture",
  "oauth-code-fixture",
  "cookie-fixture",
  "provider-payload-fixture",
  "raw-external-account-fixture",
  "private-source-body-fixture",
  "archive-snippet-fixture",
  "signed-url-fixture",
  "storage-path-fixture",
  "prompt-fixture",
];

function useFakes(db: ArchiveConnectorStorageSupabase) {
  setSupabaseAdminForTests(db.client as any);
}

function resetFakes() {
  setSupabaseAdminForTests(null);
}

function withArchiveConnectorKey(value: string | null, fn: () => Promise<void> | void) {
  const previous = process.env.ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
  if (value == null) {
    delete process.env.ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
  } else {
    process.env.ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY = value;
  }

  return Promise.resolve(fn()).finally(() => {
    if (previous == null) {
      delete process.env.ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;
    } else {
      process.env.ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY = previous;
    }
  });
}

function assertNoSensitive(value: unknown) {
  const text = JSON.stringify(value);
  for (const fixture of forbidden) {
    assert.equal(text.includes(fixture), false, `${fixture} leaked`);
  }
  assert.equal(text.includes("ciphertext"), false, "ciphertext leaked into safe readback");
  assert.equal(text.includes("authTag"), false, "auth tag leaked into safe readback");
  assert.equal(text.includes("encrypted_credential"), false, "encrypted payload leaked into safe readback");
}

test("archive connector credential writes fail closed when encryption config is missing or malformed", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await withArchiveConnectorKey(null, async () => {
      assert.equal(archiveConnectorCredentialEncryptionConfigured(), false);
      await assert.rejects(
        () => storeArchiveConnectorCredential({
          ownerUserId: "owner-user",
          provider: "reddit",
          secretMaterial,
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_credential_encryption_unconfigured"
      );
    });

    await withArchiveConnectorKey("short", async () => {
      assert.equal(archiveConnectorCredentialEncryptionConfigured(), false);
      await assert.rejects(
        () => storeArchiveConnectorCredential({
          ownerUserId: "owner-user",
          provider: "discord",
          secretMaterial,
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_credential_encryption_malformed"
      );
    });

    assert.equal(db.rows("archive_connector_credentials").length, 0);
  } finally {
    resetFakes();
  }
});

test("archive connector credential replacement encrypts before revoking existing active rows", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await withArchiveConnectorKey(validKey, async () => {
      const created = await storeArchiveConnectorCredential({
        ownerUserId: "owner-user",
        provider: "reddit",
        secretMaterial,
        accountLabel: "Owner Reddit",
        rawExternalAccountId: "raw-external-account-fixture",
      });

      assert.equal(created.status, "active");
      assert.equal(created.provider, "reddit");
      assert.equal(created.purpose, "archive_connector");
      assert.equal("id" in created, false);
      assert.equal(created.accountLabel, "Owner Reddit");
      assert.equal(created.fingerprintPresent, true);
      assert.equal(created.externalAccountFingerprintPresent, true);
      assertNoSensitive(created);

      const stored = db.rows("archive_connector_credentials")[0];
      assert.equal(stored.encrypted_credential.schema, "station.archive_connector.credential.v1");
      assert.equal(JSON.stringify(stored.encrypted_credential).includes("access-token-fixture"), false);
    });

    await withArchiveConnectorKey("short", async () => {
      await assert.rejects(
        () => storeArchiveConnectorCredential({
          ownerUserId: "owner-user",
          provider: "reddit",
          secretMaterial: { accessToken: "replacement-token-fixture" },
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_credential_encryption_malformed"
      );
    });

    const rows = db.rows("archive_connector_credentials");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "active");
    assert.equal(rows[0].revoked_at ?? null, null);
  } finally {
    resetFakes();
  }
});

test("archive connector credential readback is owner and purpose scoped with safe metadata only", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  db.rows("archive_connector_credentials").push({
    id: "wrong-purpose",
    owner_user_id: "owner-user",
    provider: "reddit",
    purpose: "social_publishing",
    encrypted_credential: { ciphertext: "private-source-body-fixture" },
    credential_fingerprint: "wrongpurpose",
    external_account_fingerprint: null,
    account_label: "Wrong Purpose",
    status: "active",
    created_at: "2026-06-29T21:00:00.000Z",
    updated_at: "2026-06-29T21:00:00.000Z",
  });
  useFakes(db);

  try {
    await withArchiveConnectorKey(validKey, async () => {
      await storeArchiveConnectorCredential({
        ownerUserId: "owner-user",
        provider: "discord",
        secretMaterial,
        accountLabel: "credential private-source-body-fixture",
        rawExternalAccountId: "raw-external-account-fixture",
      });
      await storeArchiveConnectorCredential({
        ownerUserId: "other-user",
        provider: "discord",
        secretMaterial: { accessToken: "other-user-token-fixture" },
        accountLabel: "Other Discord",
      });
    });

    const ownerReadbacks = await loadArchiveConnectorCredentialReadbacks("owner-user");
    assert.equal(ownerReadbacks.length, 1);
    assert.equal(ownerReadbacks[0].provider, "discord");
    assert.equal(ownerReadbacks[0].purpose, "archive_connector");
    assert.equal(ownerReadbacks[0].configured, true);
    assert.equal(ownerReadbacks[0].accountLabel, null);
    assert.equal(ownerReadbacks[0].fingerprintPresent, true);
    assert.equal(ownerReadbacks[0].externalAccountFingerprintPresent, true);
    assertNoSensitive(ownerReadbacks);
  } finally {
    resetFakes();
  }
});

test("archive connector credential revoke returns safe metadata only", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await withArchiveConnectorKey(validKey, async () => {
      await storeArchiveConnectorCredential({
        ownerUserId: "owner-user",
        provider: "reddit",
        secretMaterial,
        accountLabel: "Reddit Archive",
      });
    });

    const readbacks = await revokeArchiveConnectorCredential({
      ownerUserId: "owner-user",
      provider: "reddit",
    });

    assert.equal(readbacks.length, 1);
    assert.equal(readbacks[0].status, "revoked");
    assert.equal(readbacks[0].configured, false);
    assert.equal(typeof readbacks[0].revokedAt, "string");
    assertNoSensitive(readbacks);
  } finally {
    resetFakes();
  }
});

test("archive connector OAuth state stores only hashes and consumes exactly once", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    const created = await createArchiveConnectorOAuthState({
      ownerUserId: "owner-user",
      sessionId: "session-fixture",
      provider: "reddit",
      nonce: "nonce-fixture",
      csrf: "csrf-fixture",
      expiresAt: "2026-06-29T22:00:00.000Z",
      localRedirectPath: "/studio/archive",
    });

    assert.equal(created.provider, "reddit");
    assert.equal("id" in created, false);
    assert.equal(created.localRedirectPath, "/studio/archive");
    assert.equal(created.consumedAt, null);
    assertNoSensitive(created);

    const stored = db.rows("archive_connector_oauth_states")[0];
    assert.equal(stored.nonce_hash.includes("nonce-fixture"), false);
    assert.equal(stored.csrf_hash.includes("csrf-fixture"), false);
    assert.equal(stored.session_id_hash.includes("session-fixture"), false);
    assert.equal(typeof stored.session_id_hash, "string");
    assert.equal("session_id" in stored, false);

    const consumed = await consumeArchiveConnectorOAuthState({
      ownerUserId: "owner-user",
      sessionId: "session-fixture",
      provider: "reddit",
      nonce: "nonce-fixture",
      csrf: "csrf-fixture",
      now: "2026-06-29T21:30:00.000Z",
    });

    assert.equal(consumed.provider, "reddit");
    assert.equal("id" in consumed, false);
    assert.equal(consumed.consumedAt, "2026-06-29T21:30:00.000Z");
    assertNoSensitive(consumed);

    await assert.rejects(
      () => consumeArchiveConnectorOAuthState({
        ownerUserId: "owner-user",
        sessionId: "session-fixture",
        provider: "reddit",
        nonce: "nonce-fixture",
        csrf: "csrf-fixture",
        now: "2026-06-29T21:31:00.000Z",
      }),
      (error: any) => error instanceof ArchiveConnectorCredentialStorageError
        && error.code === "archive_connector_oauth_state_invalid"
    );
  } finally {
    resetFakes();
  }
});

test("archive connector OAuth state fails closed on owner session provider purpose expiry and redirect mismatches", async () => {
  const mismatchCases = [
    { ownerUserId: "other-user", sessionId: "session-fixture", provider: "reddit" as const, nonce: "nonce-a", csrf: "csrf-a", now: "2026-06-29T21:00:00.000Z" },
    { ownerUserId: "owner-user", sessionId: "other-session", provider: "reddit" as const, nonce: "nonce-b", csrf: "csrf-b", now: "2026-06-29T21:00:00.000Z" },
    { ownerUserId: "owner-user", sessionId: "session-fixture", provider: "discord" as const, nonce: "nonce-c", csrf: "csrf-c", now: "2026-06-29T21:00:00.000Z" },
    { ownerUserId: "owner-user", sessionId: "session-fixture", provider: "reddit" as const, nonce: "nonce-d", csrf: "wrong-csrf", now: "2026-06-29T21:00:00.000Z" },
    { ownerUserId: "owner-user", sessionId: "session-fixture", provider: "reddit" as const, nonce: "nonce-e", csrf: "csrf-e", now: "2026-06-29T23:00:00.000Z" },
  ];

  for (const [index, mismatch] of mismatchCases.entries()) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      const provider = index === 2 ? "reddit" : mismatch.provider;
      await createArchiveConnectorOAuthState({
        ownerUserId: "owner-user",
        sessionId: "session-fixture",
        provider,
        nonce: mismatch.nonce,
        csrf: mismatch.csrf === "wrong-csrf" ? "csrf-d" : mismatch.csrf,
        expiresAt: index === 4 ? "2026-06-29T22:00:00.000Z" : "2026-06-29T22:30:00.000Z",
      });

      await assert.rejects(
        () => consumeArchiveConnectorOAuthState(mismatch),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_oauth_state_invalid"
      );
    } finally {
      resetFakes();
    }
  }

  const redirectDb = new ArchiveConnectorStorageSupabase();
  useFakes(redirectDb);
  try {
    await assert.rejects(
      () => createArchiveConnectorOAuthState({
        ownerUserId: "owner-user",
        sessionId: "session-fixture",
        provider: "reddit",
        nonce: "nonce-redirect",
        csrf: "csrf-redirect",
        expiresAt: "2026-06-29T22:00:00.000Z",
        localRedirectPath: "https://example.invalid/callback",
      }),
      (error: any) => error instanceof ArchiveConnectorCredentialStorageError
        && error.code === "archive_connector_oauth_state_invalid"
    );
    assert.equal(redirectDb.rows("archive_connector_oauth_states").length, 0);
  } finally {
    resetFakes();
  }
});

test("archive connector credential storage source has no live connector execution", () => {
  const source = readFileSync("apps/api/src/services/archive-connectors/credential-storage.ts", "utf8");

  assert.doesNotMatch(source, /fetch\s*\(|Router\(|express|oauthRedirect\s*\(|callbackRoute|tokenExchange\s*\(|providerSdk/i);
  assert.doesNotMatch(source, /createImportJob|archive_sources|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates/i);
  assert.doesNotMatch(source, /new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
  assert.doesNotMatch(source, /REDDIT_CLIENT|DISCORD_CLIENT|clientSecret|access_token_last_four|refresh_token_last_four/i);
});
