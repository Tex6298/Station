import assert from "node:assert/strict";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setSupabaseAdminForTests } from "../../lib/supabase";
import {
  ArchiveConnectorCredentialStorageError,
  archiveConnectorCredentialEncryptionConfigured,
  consumeArchiveConnectorOAuthState,
  createArchiveConnectorOAuthState,
  encryptArchiveConnectorCredential,
  fingerprintArchiveConnectorExternalAccount,
  loadArchiveConnectorAccountCredentialSecret,
  loadArchiveConnectorCredentialReadbacks,
  loadArchiveConnectorSourceInventoryCredentialSecret,
  loadArchiveConnectorSourceCredentialSecret,
  revokeArchiveConnectorCredential,
  storeArchiveConnectorCredential,
  updateArchiveConnectorCredentialAccountMetadata,
  validateArchiveConnectorOAuthState,
} from "./credential-storage";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

class ArchiveConnectorStorageSupabase {
  tableCalls: string[] = [];
  tables: Record<string, Row[]> = {
    archive_connector_credentials: [],
    archive_connector_oauth_states: [],
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

function sourceTokenMaterial(provider: "reddit" | "discord", overrides: Row = {}) {
  const grantedScopes = provider === "reddit"
    ? ["identity", "mysubreddits", "history"]
    : ["identify", "guilds"];
  return {
    schema: "station.archive_connector.oauth_token.v1",
    provider,
    scopeProfile: "source_inventory",
    tokenType: "bearer",
    accessToken: `${provider}-source-access-token-fixture`,
    refreshToken: `${provider}-source-refresh-token-fixture`,
    expiresInSeconds: provider === "reddit" ? 3600 : 7200,
    scope: grantedScopes.join(" "),
    grantedScopes,
    ...overrides,
  };
}

function accountTokenMaterial(
  provider: "reddit" | "discord",
  scopeProfile: "connect" | "source_inventory" = "connect",
  overrides: Row = {},
) {
  const grantedScopes = provider === "reddit"
    ? scopeProfile === "source_inventory" ? ["identity", "mysubreddits", "history"] : ["identity"]
    : scopeProfile === "source_inventory" ? ["identify", "guilds"] : ["identify"];
  return {
    schema: "station.archive_connector.oauth_token.v1",
    provider,
    scopeProfile,
    tokenType: "bearer",
    accessToken: `${provider}-${scopeProfile}-access-token-fixture`,
    refreshToken: `${provider}-${scopeProfile}-refresh-token-fixture`,
    expiresInSeconds: provider === "reddit" ? 3600 : 7200,
    scope: grantedScopes.join(" "),
    grantedScopes,
    ...overrides,
  };
}

function sourceCredentialRow(input: {
  ownerUserId?: string;
  provider?: "reddit" | "discord" | "mastodon";
  purpose?: string;
  status?: string;
  scopeProfile?: string;
  grantedScopes?: string[];
  encryptedCredential?: Record<string, unknown>;
  tokenMaterial?: Row;
  externalAccountFingerprint?: string | null;
  accountLabel?: string | null;
} = {}) {
  const provider = input.provider ?? "reddit";
  const supportedProvider = provider === "discord" ? "discord" : "reddit";
  const grantedScopes = input.grantedScopes ?? (
    provider === "discord" ? ["identify", "guilds"] : ["identity", "mysubreddits", "history"]
  );
  return {
    id: "source-row-fixture",
    owner_user_id: input.ownerUserId ?? "owner-user",
    provider,
    purpose: input.purpose ?? "archive_connector",
    encrypted_credential: input.encryptedCredential ?? encryptArchiveConnectorCredential(
      input.tokenMaterial ?? sourceTokenMaterial(supportedProvider),
    ),
    credential_fingerprint: "source-credential-fingerprint",
    external_account_fingerprint: input.externalAccountFingerprint ?? null,
    account_label: input.accountLabel ?? null,
    status: input.status ?? "active",
    scope_profile: input.scopeProfile ?? "source_inventory",
    granted_scopes: grantedScopes,
    created_at: "2026-06-29T21:00:00.000Z",
    updated_at: "2026-06-29T21:00:00.000Z",
    rotated_at: null,
    revoked_at: input.status === "revoked" ? "2026-06-29T21:05:00.000Z" : null,
  };
}

function accountCredentialRow(input: {
  ownerUserId?: string;
  provider?: "reddit" | "discord" | "mastodon";
  purpose?: string;
  status?: string;
  scopeProfile?: "connect" | "source_inventory" | string;
  grantedScopes?: string[];
  encryptedCredential?: Record<string, unknown>;
  tokenMaterial?: Row;
  externalAccountFingerprint?: string | null;
  accountLabel?: string | null;
} = {}) {
  const provider = input.provider ?? "reddit";
  const supportedProvider = provider === "discord" ? "discord" : "reddit";
  const scopeProfile = input.scopeProfile ?? "connect";
  const supportedScopeProfile = scopeProfile === "source_inventory" ? "source_inventory" : "connect";
  const grantedScopes = input.grantedScopes ?? (
    provider === "discord"
      ? supportedScopeProfile === "source_inventory" ? ["identify", "guilds"] : ["identify"]
      : supportedScopeProfile === "source_inventory" ? ["identity", "mysubreddits", "history"] : ["identity"]
  );
  return {
    id: "account-row-fixture",
    owner_user_id: input.ownerUserId ?? "owner-user",
    provider,
    purpose: input.purpose ?? "archive_connector",
    encrypted_credential: input.encryptedCredential ?? encryptArchiveConnectorCredential(
      input.tokenMaterial ?? accountTokenMaterial(supportedProvider, supportedScopeProfile),
    ),
    credential_fingerprint: "account-credential-fingerprint",
    external_account_fingerprint: input.externalAccountFingerprint ?? null,
    account_label: input.accountLabel ?? null,
    status: input.status ?? "active",
    scope_profile: scopeProfile,
    granted_scopes: grantedScopes,
    created_at: "2026-06-29T21:00:00.000Z",
    updated_at: "2026-06-29T21:00:00.000Z",
    rotated_at: null,
    revoked_at: input.status === "revoked" ? "2026-06-29T21:05:00.000Z" : null,
  };
}

function encryptInvalidJsonPlaintext(plaintext: string) {
  const key = createHash("sha256").update(validKey).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    schema: "station.archive_connector.credential.v1",
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

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

test("archive connector credential storage does not infer source readiness from profile or secret material alone", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await withArchiveConnectorKey(validKey, async () => {
      const created = await storeArchiveConnectorCredential({
        ownerUserId: "owner-user",
        provider: "reddit",
        secretMaterial,
        scopeProfile: "source_inventory",
        accountLabel: "Owner Reddit",
      });

      assert.equal(created.scopeProfile, "source_inventory");
      assert.deepEqual(created.grantedScopes, ["identity"]);
      assert.equal(created.connectionScopeState, "account_proof_only");
      assert.equal(created.reconnectRequiredForSourceInventory, true);
      assert.deepEqual(db.rows("archive_connector_credentials")[0].granted_scopes, ["identity"]);
      assertNoSensitive(created);

      const secretScopeOnly = await storeArchiveConnectorCredential({
        ownerUserId: "owner-user",
        provider: "reddit",
        secretMaterial: {
          ...secretMaterial,
          scopeProfile: "source_inventory",
          grantedScopes: ["identity", "mysubreddits", "history"],
        },
        accountLabel: "Owner Reddit",
      });

      assert.equal(secretScopeOnly.scopeProfile, "connect");
      assert.deepEqual(secretScopeOnly.grantedScopes, ["identity"]);
      assert.equal(secretScopeOnly.connectionScopeState, "account_proof_only");
      assert.equal(secretScopeOnly.reconnectRequiredForSourceInventory, true);
      assert.equal(db.rows("archive_connector_credentials")[1].scope_profile, "connect");
      assert.deepEqual(db.rows("archive_connector_credentials")[1].granted_scopes, ["identity"]);
      assertNoSensitive(secretScopeOnly);
    });
  } finally {
    resetFakes();
  }
});

test("archive connector source credential decrypt returns internal source-ready Reddit and Discord secrets", async () => {
  for (const provider of ["reddit", "discord"] as const) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        db.rows("archive_connector_credentials").push(sourceCredentialRow({ provider }));

        const secret = await loadArchiveConnectorSourceCredentialSecret({
          ownerUserId: "owner-user",
          provider,
        });

        assert.deepEqual(Object.keys(secret).sort(), [
          "accessToken",
          "expiresInSeconds",
          "grantedScopes",
          "provider",
          "purpose",
          "refreshToken",
          "scopeProfile",
          "tokenType",
        ].sort());
        assert.equal(secret.provider, provider);
        assert.equal(secret.purpose, "archive_connector");
        assert.equal(secret.scopeProfile, "source_inventory");
        assert.deepEqual(
          secret.grantedScopes,
          provider === "reddit" ? ["identity", "mysubreddits", "history"] : ["identify", "guilds"],
        );
        assert.equal(secret.accessToken, `${provider}-source-access-token-fixture`);
        assert.equal(secret.refreshToken, `${provider}-source-refresh-token-fixture`);
        assert.equal(secret.tokenType, "bearer");
        assert.equal(secret.expiresInSeconds, provider === "reddit" ? 3600 : 7200);
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector source inventory credential helper requires source readiness and account proof", async () => {
  for (const provider of ["reddit", "discord"] as const) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        db.rows("archive_connector_credentials").push(sourceCredentialRow({
          provider,
          externalAccountFingerprint: `${provider}-account-fingerprint`,
          accountLabel: provider === "reddit" ? "Owner Reddit" : "Owner Discord",
        }));

        const secret = await loadArchiveConnectorSourceInventoryCredentialSecret({
          ownerUserId: "owner-user",
          provider,
        });

        assert.deepEqual(Object.keys(secret).sort(), [
          "accessToken",
          "accountLabel",
          "externalAccountFingerprintPresent",
          "grantedScopes",
          "provider",
          "purpose",
          "scopeProfile",
        ].sort());
        assert.equal(secret.provider, provider);
        assert.equal(secret.purpose, "archive_connector");
        assert.equal(secret.scopeProfile, "source_inventory");
        assert.equal(secret.externalAccountFingerprintPresent, true);
        assert.equal(secret.accountLabel, provider === "reddit" ? "Owner Reddit" : "Owner Discord");
        assert.deepEqual(
          secret.grantedScopes,
          provider === "reddit" ? ["identity", "mysubreddits", "history"] : ["identify", "guilds"],
        );
        assert.equal(secret.accessToken, `${provider}-source-access-token-fixture`);
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector source inventory credential helper fails closed before provider fetch prerequisites", async () => {
  const cases: Array<{ name: string; row?: () => Row; code: string }> = [
    {
      name: "missing",
      code: "archive_connector_source_credential_unavailable",
    },
    {
      name: "connect-proof-only",
      row: () => accountCredentialRow({
        externalAccountFingerprint: "reddit-account-fingerprint",
      }),
      code: "archive_connector_source_credential_not_source_ready",
    },
    {
      name: "source-ready-without-account-proof",
      row: () => sourceCredentialRow(),
      code: "archive_connector_source_inventory_account_lookup_required",
    },
    {
      name: "source-ready-with-invalid-token",
      row: () => sourceCredentialRow({
        externalAccountFingerprint: "reddit-account-fingerprint",
        tokenMaterial: sourceTokenMaterial("reddit", { accessToken: "bad\u0001token" }),
      }),
      code: "archive_connector_source_credential_token_invalid",
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        if (setup.row) db.rows("archive_connector_credentials").push(setup.row());

        await assert.rejects(
          () => loadArchiveConnectorSourceInventoryCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === setup.code,
          setup.name,
        );
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector account credential decrypt returns internal connect and source credential secrets", async () => {
  for (const provider of ["reddit", "discord"] as const) {
    for (const scopeProfile of ["connect", "source_inventory"] as const) {
      const db = new ArchiveConnectorStorageSupabase();
      useFakes(db);

      try {
        await withArchiveConnectorKey(validKey, async () => {
          db.rows("archive_connector_credentials").push(accountCredentialRow({ provider, scopeProfile }));

          const secret = await loadArchiveConnectorAccountCredentialSecret({
            ownerUserId: "owner-user",
            provider,
          });

          assert.deepEqual(Object.keys(secret).sort(), [
            "accessToken",
            "grantedScopes",
            "provider",
            "purpose",
            "scopeProfile",
          ].sort());
          assert.equal(secret.provider, provider);
          assert.equal(secret.purpose, "archive_connector");
          assert.equal(secret.scopeProfile, scopeProfile);
          assert.deepEqual(
            secret.grantedScopes,
            provider === "reddit"
              ? scopeProfile === "source_inventory" ? ["identity", "mysubreddits", "history"] : ["identity"]
              : scopeProfile === "source_inventory" ? ["identify", "guilds"] : ["identify"],
          );
          assert.equal(secret.accessToken, `${provider}-${scopeProfile}-access-token-fixture`);
        });
      } finally {
        resetFakes();
      }
    }
  }
});

test("archive connector account credential decrypt rejects unsupported providers before storage access", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await assert.rejects(
      () => loadArchiveConnectorAccountCredentialSecret({
        ownerUserId: "owner-user",
        provider: "mastodon" as any,
      }),
      (error: any) => error instanceof ArchiveConnectorCredentialStorageError
        && error.code === "archive_connector_account_credential_provider_unsupported"
    );
    assert.deepEqual(db.tableCalls, []);
  } finally {
    resetFakes();
  }
});

test("archive connector account credential decrypt fails closed on eligibility and exact scope mismatches", async () => {
  const cases: Array<{ name: string; row?: Row; code: string }> = [
    {
      name: "missing",
      code: "archive_connector_account_credential_unavailable",
    },
    {
      name: "revoked",
      row: { status: "revoked" },
      code: "archive_connector_account_credential_unavailable",
    },
    {
      name: "wrong-owner",
      row: { ownerUserId: "other-user" },
      code: "archive_connector_account_credential_unavailable",
    },
    {
      name: "wrong-purpose",
      row: { purpose: "social_publishing" },
      code: "archive_connector_account_credential_unavailable",
    },
    {
      name: "stored-extra-scope",
      row: { grantedScopes: ["identity", "history"] },
      code: "archive_connector_account_credential_not_account_ready",
    },
    {
      name: "stored-duplicate-scope",
      row: { grantedScopes: ["identity", "identity"] },
      code: "archive_connector_account_credential_not_account_ready",
    },
    {
      name: "stored-reordered-source-scope",
      row: {
        scopeProfile: "source_inventory",
        grantedScopes: ["history", "identity", "mysubreddits"],
        tokenMaterial: accountTokenMaterial("reddit", "source_inventory"),
      },
      code: "archive_connector_account_credential_not_account_ready",
    },
    {
      name: "token-missing-scope",
      row: {
        tokenMaterial: accountTokenMaterial("reddit", "connect", {
          grantedScopes: [],
          scope: "",
        }),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "token-extra-scope",
      row: {
        tokenMaterial: accountTokenMaterial("reddit", "connect", {
          grantedScopes: ["identity", "history"],
          scope: "identity history",
        }),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "token-duplicate-scope",
      row: {
        tokenMaterial: accountTokenMaterial("reddit", "connect", {
          grantedScopes: ["identity", "identity"],
          scope: "identity identity",
        }),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "token-reordered-source-scope",
      row: {
        scopeProfile: "source_inventory",
        grantedScopes: ["identity", "mysubreddits", "history"],
        tokenMaterial: accountTokenMaterial("reddit", "source_inventory", {
          grantedScopes: ["history", "identity", "mysubreddits"],
          scope: "history identity mysubreddits",
        }),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "token-provider-mismatch",
      row: {
        tokenMaterial: accountTokenMaterial("discord", "connect"),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "stored-connect-token-source-profile-mismatch",
      row: {
        scopeProfile: "connect",
        grantedScopes: ["identity"],
        tokenMaterial: accountTokenMaterial("reddit", "source_inventory"),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
    {
      name: "stored-source-token-connect-profile-mismatch",
      row: {
        scopeProfile: "source_inventory",
        grantedScopes: ["identity", "mysubreddits", "history"],
        tokenMaterial: accountTokenMaterial("reddit", "connect"),
      },
      code: "archive_connector_account_credential_token_invalid",
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        if (setup.row) db.rows("archive_connector_credentials").push(accountCredentialRow(setup.row));

        await assert.rejects(
          () => loadArchiveConnectorAccountCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === setup.code,
          setup.name,
        );
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector account metadata update stores only safe metadata and rejects account mismatches", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await withArchiveConnectorKey(validKey, async () => {
      db.rows("archive_connector_credentials").push(
        accountCredentialRow({
          accountLabel: "Old Reddit",
          externalAccountFingerprint: null,
        }),
        accountCredentialRow({
          ownerUserId: "other-user",
          accountLabel: "Other Reddit",
          externalAccountFingerprint: null,
        }),
      );

      const credential = await updateArchiveConnectorCredentialAccountMetadata({
        ownerUserId: "owner-user",
        provider: "reddit",
        rawExternalAccountId: "reddit-raw-account-id-fixture",
        accountLabel: "Owner Reddit",
      });

      assert.equal(credential.accountLabel, "Owner Reddit");
      assert.equal(credential.externalAccountFingerprintPresent, true);
      assertNoSensitive(credential);

      const stored = db.rows("archive_connector_credentials").find((row) => row.owner_user_id === "owner-user");
      const other = db.rows("archive_connector_credentials").find((row) => row.owner_user_id === "other-user");
      assert.equal(stored?.account_label, "Owner Reddit");
      assert.equal(
        stored?.external_account_fingerprint,
        fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      );
      assert.equal(JSON.stringify(stored).includes("reddit-raw-account-id-fixture"), false);
      assert.equal(other?.account_label, "Other Reddit");
      assert.equal(other?.external_account_fingerprint, null);

      await assert.rejects(
        () => updateArchiveConnectorCredentialAccountMetadata({
          ownerUserId: "owner-user",
          provider: "reddit",
          rawExternalAccountId: "different-reddit-account",
          accountLabel: "Different Reddit",
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_account_metadata_mismatch"
      );

      assert.equal(stored?.account_label, "Owner Reddit");
      assert.equal(
        stored?.external_account_fingerprint,
        fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      );
    });
  } finally {
    resetFakes();
  }
});

test("archive connector source credential decrypt rejects unsupported providers before storage access", async () => {
  const db = new ArchiveConnectorStorageSupabase();
  useFakes(db);

  try {
    await assert.rejects(
      () => loadArchiveConnectorSourceCredentialSecret({
        ownerUserId: "owner-user",
        provider: "mastodon" as any,
      }),
      (error: any) => error instanceof ArchiveConnectorCredentialStorageError
        && error.code === "archive_connector_source_credential_provider_unsupported"
    );
    assert.deepEqual(db.tableCalls, []);
  } finally {
    resetFakes();
  }
});

test("archive connector source credential decrypt hides missing revoked wrong-owner wrong-purpose and unsupported rows", async () => {
  const cases: Array<{ name: string; row?: Row }> = [
    { name: "missing" },
    { name: "revoked", row: { status: "revoked" } },
    { name: "wrong-owner", row: { ownerUserId: "other-user" } },
    { name: "wrong-purpose", row: { purpose: "social_publishing" } },
    { name: "unsupported-row", row: { provider: "mastodon" } },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        if (setup.row) db.rows("archive_connector_credentials").push(sourceCredentialRow(setup.row));

        await assert.rejects(
          () => loadArchiveConnectorSourceCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === "archive_connector_source_credential_unavailable",
          setup.name,
        );
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector source credential decrypt requires stored metadata and decrypted material to agree", async () => {
  const cases: Array<{ name: string; row: Row; code: string }> = [
    {
      name: "stored-connect-only-with-source-token",
      row: {
        scopeProfile: "connect",
        grantedScopes: ["identity"],
        tokenMaterial: sourceTokenMaterial("reddit"),
      },
      code: "archive_connector_source_credential_not_source_ready",
    },
    {
      name: "stored-source-with-connect-token",
      row: {
        tokenMaterial: sourceTokenMaterial("reddit", {
          scopeProfile: "connect",
          grantedScopes: ["identity"],
          scope: "identity",
        }),
      },
      code: "archive_connector_source_credential_token_invalid",
    },
    {
      name: "stored-source-with-extra-stored-scope",
      row: {
        grantedScopes: ["identity", "mysubreddits", "history", "read"],
        tokenMaterial: sourceTokenMaterial("reddit"),
      },
      code: "archive_connector_source_credential_not_source_ready",
    },
    {
      name: "stored-source-with-duplicate-stored-scope",
      row: {
        grantedScopes: ["identity", "mysubreddits", "history", "identity"],
        tokenMaterial: sourceTokenMaterial("reddit"),
      },
      code: "archive_connector_source_credential_not_source_ready",
    },
    {
      name: "stored-source-with-unordered-stored-scope",
      row: {
        grantedScopes: ["history", "identity", "mysubreddits"],
        tokenMaterial: sourceTokenMaterial("reddit"),
      },
      code: "archive_connector_source_credential_not_source_ready",
    },
    {
      name: "wrong-token-provider",
      row: {
        tokenMaterial: sourceTokenMaterial("discord"),
      },
      code: "archive_connector_source_credential_token_invalid",
    },
    {
      name: "missing-source-scope",
      row: {
        tokenMaterial: sourceTokenMaterial("reddit", {
          grantedScopes: ["identity", "history"],
          scope: "identity history",
        }),
      },
      code: "archive_connector_source_credential_token_invalid",
    },
    {
      name: "extra-source-scope",
      row: {
        tokenMaterial: sourceTokenMaterial("reddit", {
          grantedScopes: ["identity", "mysubreddits", "history", "read"],
          scope: "identity mysubreddits history read",
        }),
      },
      code: "archive_connector_source_credential_token_invalid",
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        db.rows("archive_connector_credentials").push(sourceCredentialRow(setup.row));

        await assert.rejects(
          () => loadArchiveConnectorSourceCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === setup.code,
          setup.name,
        );
      });
    } finally {
      resetFakes();
    }
  }
});

test("archive connector source credential decrypt fails closed on encryption config and payload failures", async () => {
  let sourceReadyRow: Row;
  await withArchiveConnectorKey(validKey, async () => {
    sourceReadyRow = sourceCredentialRow();
  });

  const missingConfigDb = new ArchiveConnectorStorageSupabase();
  missingConfigDb.rows("archive_connector_credentials").push(sourceReadyRow!);
  useFakes(missingConfigDb);
  try {
    await withArchiveConnectorKey(null, async () => {
      await assert.rejects(
        () => loadArchiveConnectorSourceCredentialSecret({
          ownerUserId: "owner-user",
          provider: "reddit",
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_credential_encryption_unconfigured"
      );
    });
  } finally {
    resetFakes();
  }

  const malformedConfigDb = new ArchiveConnectorStorageSupabase();
  malformedConfigDb.rows("archive_connector_credentials").push(sourceReadyRow!);
  useFakes(malformedConfigDb);
  try {
    await withArchiveConnectorKey("short", async () => {
      await assert.rejects(
        () => loadArchiveConnectorSourceCredentialSecret({
          ownerUserId: "owner-user",
          provider: "reddit",
        }),
        (error: any) => error instanceof ArchiveConnectorCredentialStorageError
          && error.code === "archive_connector_credential_encryption_malformed"
      );
    });
  } finally {
    resetFakes();
  }

  await withArchiveConnectorKey(validKey, async () => {
    const validEncrypted = sourceCredentialRow().encrypted_credential;
    const payloadCases: Array<{ name: string; encryptedCredential: Record<string, unknown>; code: string }> = [
      {
        name: "wrong-schema",
        encryptedCredential: { ...validEncrypted, schema: "wrong" },
        code: "archive_connector_source_credential_payload_invalid",
      },
      {
        name: "wrong-algorithm",
        encryptedCredential: { ...validEncrypted, algorithm: "aes-128-gcm" },
        code: "archive_connector_source_credential_payload_invalid",
      },
      {
        name: "bad-iv",
        encryptedCredential: { ...validEncrypted, iv: "bad!" },
        code: "archive_connector_source_credential_payload_invalid",
      },
      {
        name: "bad-ciphertext",
        encryptedCredential: { ...validEncrypted, ciphertext: "" },
        code: "archive_connector_source_credential_payload_invalid",
      },
      {
        name: "bad-auth-tag",
        encryptedCredential: { ...validEncrypted, authTag: "bad!" },
        code: "archive_connector_source_credential_payload_invalid",
      },
      {
        name: "decrypt-auth-failure",
        encryptedCredential: { ...validEncrypted, authTag: "A".repeat(22) },
        code: "archive_connector_source_credential_decrypt_failed",
      },
      {
        name: "invalid-json",
        encryptedCredential: encryptInvalidJsonPlaintext("{not-json"),
        code: "archive_connector_source_credential_payload_invalid",
      },
    ];

    for (const setup of payloadCases) {
      const db = new ArchiveConnectorStorageSupabase();
      useFakes(db);
      try {
        db.rows("archive_connector_credentials").push(sourceCredentialRow({
          encryptedCredential: setup.encryptedCredential,
        }));

        await assert.rejects(
          () => loadArchiveConnectorSourceCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === setup.code,
          setup.name,
        );
      } finally {
        resetFakes();
      }
    }
  });
});

test("archive connector source credential decrypt fails closed on invalid token material fields", async () => {
  const tokenCases: Array<{ name: string; tokenMaterial: Row }> = [
    {
      name: "wrong-schema",
      tokenMaterial: sourceTokenMaterial("reddit", { schema: "wrong" }),
    },
    {
      name: "missing-access-token",
      tokenMaterial: sourceTokenMaterial("reddit", { accessToken: undefined }),
    },
    {
      name: "malformed-access-token",
      tokenMaterial: sourceTokenMaterial("reddit", { accessToken: "bad\u0001token" }),
    },
    {
      name: "malformed-refresh-token",
      tokenMaterial: sourceTokenMaterial("reddit", { refreshToken: "bad\u0001refresh" }),
    },
    {
      name: "malformed-token-type",
      tokenMaterial: sourceTokenMaterial("reddit", { tokenType: "x".repeat(41) }),
    },
    {
      name: "malformed-expiry",
      tokenMaterial: sourceTokenMaterial("reddit", { expiresInSeconds: -1 }),
    },
    {
      name: "missing-granted-scopes",
      tokenMaterial: sourceTokenMaterial("reddit", { grantedScopes: undefined }),
    },
    {
      name: "non-string-granted-scope",
      tokenMaterial: sourceTokenMaterial("reddit", { grantedScopes: ["identity", 7] }),
    },
    {
      name: "unordered-granted-scopes",
      tokenMaterial: sourceTokenMaterial("reddit", {
        grantedScopes: ["history", "identity", "mysubreddits"],
        scope: "history identity mysubreddits",
      }),
    },
    {
      name: "duplicate-granted-scopes",
      tokenMaterial: sourceTokenMaterial("reddit", {
        grantedScopes: ["identity", "mysubreddits", "history", "identity"],
      }),
    },
    {
      name: "raw-scope-mismatch",
      tokenMaterial: sourceTokenMaterial("reddit", {
        scope: "identity mysubreddits history read",
      }),
    },
  ];

  for (const setup of tokenCases) {
    const db = new ArchiveConnectorStorageSupabase();
    useFakes(db);

    try {
      await withArchiveConnectorKey(validKey, async () => {
        db.rows("archive_connector_credentials").push(sourceCredentialRow({
          tokenMaterial: setup.tokenMaterial,
        }));

        await assert.rejects(
          () => loadArchiveConnectorSourceCredentialSecret({
            ownerUserId: "owner-user",
            provider: "reddit",
          }),
          (error: any) => error instanceof ArchiveConnectorCredentialStorageError
            && error.code === "archive_connector_source_credential_token_invalid",
          setup.name,
        );
      });
    } finally {
      resetFakes();
    }
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

    const validated = await validateArchiveConnectorOAuthState({
      ownerUserId: "owner-user",
      sessionId: "session-fixture",
      provider: "reddit",
      nonce: "nonce-fixture",
      csrf: "csrf-fixture",
      now: "2026-06-29T21:25:00.000Z",
    });

    assert.equal(validated.provider, "reddit");
    assert.equal(validated.consumedAt, null);
    assert.equal(db.rows("archive_connector_oauth_states")[0].consumed_at, null);
    assertNoSensitive(validated);

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
