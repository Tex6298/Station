import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "https://jdewavktyemnpehdzvgl.supabase.co";
process.env.SUPABASE_ANON_KEY = "secret-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-role";
process.env.DATABASE_URL = "postgres://secret-user:secret-password@db.example.test/station";
process.env.SUPABASE_ACCESS_TOKEN = "secret-supabase-access-token";
process.env.NEXT_PUBLIC_APP_URL = "https://stationweb-production.up.railway.app";
process.env.API_URL = "https://stationapi-production.up.railway.app";
process.env.JWT_SECRET = "secret-jwt";
process.env.STRIPE_SECRET_KEY = "secret-stripe";
process.env.STRIPE_WEBHOOK_SECRET = "secret-webhook";
process.env.STRIPE_PRICE_BASIC_MONTHLY = "price_basic_monthly";
process.env.STRIPE_PRICE_BASIC_YEARLY = "price_basic_yearly";
process.env.STRIPE_PRICE_CREATOR_MONTHLY = "price_creator_monthly";
process.env.STRIPE_PRICE_CREATOR_YEARLY = "price_creator_yearly";
process.env.STRIPE_PRICE_CANON_MONTHLY = "price_canon_monthly";
process.env.STRIPE_PRICE_CANON_YEARLY = "price_canon_yearly";
process.env.NVIDIA_AI_API_KEY = "secret-nvidia";
process.env.EMBEDDING_PROFILE_CODE = "station_free_1536";
delete process.env.EMBEDDINGS_PROVIDER;
process.env.EMBEDDING_MODEL = "gemini-embedding-2";
process.env.EMBEDDING_DIM = "1536";
process.env.GEMINI_API_KEY = "secret-gemini";
process.env.GOOGLE_API_KEY = "secret-google";
delete process.env.OPENAI_API_KEY;
process.env.REDIS_URL = "redis://secret-redis";
process.env.UPSTASH_REDIS_REST_URL = "https://secret-upstash.example.test";
process.env.UPSTASH_REDIS_REST_TOKEN = "secret-upstash-token";
process.env.RAILWAY_GIT_COMMIT_SHA = "abc123def456";
process.env.RAILWAY_GIT_BRANCH = "main";
process.env.RAILWAY_GIT_REPO_OWNER = "Discern-AI";
process.env.RAILWAY_GIT_REPO_NAME = "Station";
process.env.RAILWAY_DEPLOYMENT_ID = "deployment-123";
process.env.RAILWAY_SERVICE_NAME = "@station/api";
process.env.RAILWAY_ENVIRONMENT_NAME = "production";
delete process.env.SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY;

type Row = Record<string, any>;

const SECRET_MARKERS = [
  "secret-anon-key",
  "secret-service-role",
  "secret-user",
  "secret-password",
  "secret-supabase-access-token",
  "secret-jwt",
  "secret-stripe",
  "secret-webhook",
  "secret-nvidia",
  "secret-gemini",
  "secret-google",
  "secret-openai",
  "social-connector-config-marker",
  "secret-redis",
  "secret-upstash",
];

class ReadinessSupabase {
  failProfiles = false;
  migrationObjectProof = false;
  documentVersionObjectProof = true;
  failEmbeddingProfileRpcProof = false;
  proofDelays: Record<string, number> = {};
  bucketPublic = false;
  bucketMissing = false;
  objectProofQueries: Array<{ schemaName: string; table: string; columns: string }> = [];
  rpcCalls: Array<{ functionName: string; args: Record<string, unknown> }> = [];

  client = {
    from: (table: string) => new ReadinessQuery(this, "public", table),
    rpc: async (functionName: string, args: Record<string, unknown>) => {
      this.rpcCalls.push({ functionName, args });
      await this.delayProof(functionName === "match_memory_items" ? "memory_rpc" : "archive_rpc");
      if (!["match_memory_items", "match_private_archive_chunks"].includes(functionName)) {
        return { data: null, error: { message: "unexpected rpc with secret-service-role" } };
      }
      if (this.failEmbeddingProfileRpcProof || !this.migrationObjectProof) {
        return { data: null, error: { message: "rpc proof failure with secret-service-role" } };
      }
      return { data: [], error: null };
    },
    storage: {
      getBucket: async (bucket: string) => {
        if (bucket !== "persona-files" || this.bucketMissing) {
          return { data: null, error: { message: "missing bucket with secret-service-role" } };
        }
        return {
          data: { id: "persona-files", name: "persona-files", public: this.bucketPublic },
          error: null,
        };
      },
    },
  };

  async delayProof(id: string) {
    const delayMs = this.proofDelays[id] ?? 0;
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

class ReadinessQuery {
  private countRequested = false;
  private head = false;
  private limitCount: number | null = null;
  private columns: string | null = null;

  constructor(
    private db: ReadinessSupabase,
    private schemaName: string,
    private table: string
  ) {}

  select(_columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.columns = _columns;
    this.countRequested = Boolean(options.count);
    this.head = Boolean(options.head);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute() {
    if (this.schemaName === "public" && this.table === "profiles") {
      if (this.db.failProfiles) {
        return { data: null, error: { message: "database failure with secret-service-role" }, count: null };
      }
      return { data: this.head ? null : [], error: null, count: this.countRequested ? 0 : null };
    }

    if (
      this.schemaName === "public" &&
      (this.table === "memory_items" || this.table === "developer_spaces" || this.table === "documents" || this.table === "document_versions")
    ) {
      this.db.objectProofQueries.push({ schemaName: this.schemaName, table: this.table, columns: this.columns ?? "*" });
      await this.db.delayProof(proofIdForTable(this.table));
      if (!this.db.migrationObjectProof) {
        return { data: null, error: { message: "public proof failure with secret-service-role" }, count: null };
      }
      if (
        !this.db.documentVersionObjectProof &&
        this.table === "document_versions"
      ) {
        return { data: null, error: { message: "document version proof failure with secret-service-role" }, count: null };
      }
      return { data: this.head ? null : [], error: null, count: this.countRequested ? 0 : null };
    }

    return { data: null, error: { message: "unexpected query" }, count: null };
  }
}

test("/health stays cheap while /health/deployment returns non-secret readiness", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  const { app, authFetch } = await setupHealthApp(db);

  try {
    const cheap = await requestJson(app, "GET", "/health");
    assert.equal(cheap.status, 200);
    assert.deepEqual(cheap.body, { ok: true });

    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, true);
    assert.deepEqual(deployment.body.deploymentIdentity, {
      railwayGitCommitSha: "abc123def456",
      railwayGitBranch: "main",
      railwayGitRepoOwner: "Discern-AI",
      railwayGitRepoName: "Station",
      railwayDeploymentId: "deployment-123",
      railwayServiceName: "@station/api",
      railwayEnvironmentName: "production",
    });
    assert.equal(deployment.body.checks.databaseUrl, true);
    assert.equal(deployment.body.checks.nvidiaProvider, true);
    assert.equal(deployment.body.checks.embeddingProfileCode, "station_free_1536");
    assert.equal(deployment.body.checks.embeddingProvider, "gemini");
    assert.equal(deployment.body.checks.embeddingsConfigured, true);
    assert.equal(deployment.body.checks.openaiEmbeddings, false);
    assert.equal(deployment.body.checks.geminiEmbeddings, true);
    assert.equal(deployment.body.checks.redisConfigured, true);
    assert.equal(deployment.body.checks.socialConnectorCredentialEncryptionConfigured, false);
    assert.equal(deployment.body.readiness.database.ok, true);
    assert.equal(deployment.body.readiness.migrations.count, null);
    assert.deepEqual(deployment.body.readiness.migrations.latest, {
      version: "025-085",
      name: "public_schema_object_rpc_document_version_and_summary_proof",
    });
    assert.deepEqual(db.objectProofQueries.map((query) => [query.table, query.columns]), [
      ["memory_items", "archive_source_type,archive_source_id,archive_source_name,chunk_index,chunk_count,embedding_provider,embedding_model,embedding_dimension,embedding_index_name,embedding_index_source,embedding_backfill_version"],
      ["developer_spaces", "provider_policy"],
      ["documents", "version,summary"],
      ["document_versions", "id,document_id,owner_user_id,version_number"],
    ]);
    assert.equal(deployment.body.readiness.storage.exists, true);
    assert.equal(deployment.body.readiness.storage.private, true);
    assert.equal(deployment.body.readiness.publicUrls.app.railway, true);
    assert.equal(deployment.body.readiness.publicUrls.api.railway, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.ok, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.checked, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.managementApiConfigured, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.projectRefConfigured, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.appUrlConfigured, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.siteUrlMatchesApp, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.appUrlRedirectAllowed, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.passwordResetRedirectAllowed, true);
    assert.equal("error" in deployment.body.readiness.supabaseAuthRedirects, false);
    assert.equal(deployment.body.readiness.stripe.ready, true);
    assert.equal(deployment.body.readiness.providers.embeddingProfileCode, "station_free_1536");
    assert.equal(deployment.body.readiness.providers.embeddingProvider, "gemini");
    assert.equal(deployment.body.readiness.providers.embeddingsConfigured, true);
    assert.equal(deployment.body.readiness.providers.openaiEmbeddings, false);
    assert.equal(deployment.body.readiness.providers.geminiEmbeddings, true);
    assert.deepEqual(deployment.body.readiness.redis, {
      railwayRedis: true,
      upstashRest: true,
      configured: true,
      queue: {
        provider: "redis_tcp",
        queueConfigured: true,
        workerQueueReady: true,
        cacheConfigured: true,
        upstashRestConfigured: true,
        inlineFallback: true,
        detail: "TCP Redis/Valkey queue configuration is present; protected-alpha inline fallback remains available.",
      },
      operationalCache: {
        enabled: true,
        kind: "upstash_rest",
        environment: "production",
      },
    });
    assert.deepEqual(deployment.body.readiness.socialConnectors, {
      credentialEncryptionConfigured: false,
      hostedCredentialProofReady: false,
    });
    assert.deepEqual(db.rpcCalls.map((call) => call.functionName), [
      "match_memory_items",
      "match_private_archive_chunks",
    ]);
    assert.equal(authFetch.calls.length, 1);
    assert.equal(authFetch.calls[0].input, "https://api.supabase.com/v1/projects/jdewavktyemnpehdzvgl/config/auth");
    assert.equal(authFetch.calls[0].init.method, "GET");
    assert.equal(authFetch.calls[0].init.headers.authorization, "Bearer secret-supabase-access-token");
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment reports social credential encryption config without making deployment readiness depend on it", async () => {
  const cases: Array<{ value: string | undefined; configured: boolean; label: string }> = [
    { value: undefined, configured: false, label: "absent" },
    { value: "short", configured: false, label: "malformed" },
    { value: "social-connector-config-marker-key-32-plus", configured: true, label: "configured" },
  ];

  for (const item of cases) {
    const db = new ReadinessSupabase();
    db.migrationObjectProof = true;

    await withEnvOverride({
      SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: item.value,
    }, async () => {
      const { app } = await setupHealthApp(db);

      try {
        const deployment = await requestJson(app, "GET", "/health/deployment");
        assert.equal(deployment.status, 200, item.label);
        assert.equal(deployment.body.ready, true, item.label);
        assert.equal(
          deployment.body.checks.socialConnectorCredentialEncryptionConfigured,
          item.configured,
          item.label,
        );
        assert.deepEqual(
          deployment.body.readiness.socialConnectors,
          {
            credentialEncryptionConfigured: item.configured,
            hostedCredentialProofReady: item.configured,
          },
          item.label,
        );
        assertNoSecrets(deployment.body);
      } finally {
        await resetHealthFakes();
      }
    });
  }
});

test("/health/deployment reports TCP Redis as configured but operational-cache disabled", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;

  await withEnvOverride({
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    REDIS_URL: "redis://secret-redis",
    REDIS_PRIVATE_URL: "",
    VALKEY_URL: "",
  }, async () => {
    const { app } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.readiness.redis.railwayRedis, true);
      assert.equal(deployment.body.readiness.redis.upstashRest, false);
      assert.equal(deployment.body.readiness.redis.configured, true);
      assert.deepEqual(deployment.body.readiness.redis.queue, {
        provider: "redis_tcp",
        queueConfigured: true,
        workerQueueReady: true,
        cacheConfigured: false,
        upstashRestConfigured: false,
        inlineFallback: true,
        detail: "TCP Redis/Valkey queue configuration is present; protected-alpha inline fallback remains available.",
      });
      assert.deepEqual(deployment.body.readiness.redis.operationalCache, {
        enabled: false,
        kind: "disabled",
        disabledReason: "tcp_redis_configured_without_client",
        environment: "production",
      });
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment reports Upstash REST as cache-only, not worker queue readiness", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;

  await withEnvOverride({
    REDIS_URL: "",
    REDIS_PRIVATE_URL: "",
    VALKEY_URL: "",
    UPSTASH_REDIS_REST_URL: "https://secret-upstash.example.test",
    UPSTASH_REDIS_REST_TOKEN: "secret-upstash-token",
  }, async () => {
    const { app } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.readiness.redis.railwayRedis, false);
      assert.equal(deployment.body.readiness.redis.upstashRest, true);
      assert.equal(deployment.body.readiness.redis.configured, true);
      assert.deepEqual(deployment.body.readiness.redis.queue, {
        provider: "upstash_rest_cache_only",
        queueConfigured: false,
        workerQueueReady: false,
        cacheConfigured: true,
        upstashRestConfigured: true,
        inlineFallback: true,
        detail: "Upstash REST cache is configured, but no BullMQ-compatible TCP queue provider is configured.",
      });
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment reports absent queue provider without blocking inline fallback", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;

  await withEnvOverride({
    REDIS_URL: "",
    REDIS_PRIVATE_URL: "",
    VALKEY_URL: "",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
  }, async () => {
    const { app } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.readiness.redis.configured, false);
      assert.deepEqual(deployment.body.readiness.redis.queue, {
        provider: "not_configured",
        queueConfigured: false,
        workerQueueReady: false,
        cacheConfigured: false,
        upstashRestConfigured: false,
        inlineFallback: true,
        detail: "No queue provider is configured; protected-alpha inline fallback is required.",
      });
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment keeps deployment identity nullable and non-blocking outside Railway", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;

  await withEnvOverride({
    RAILWAY_GIT_COMMIT_SHA: "",
    RAILWAY_GIT_BRANCH: "",
    RAILWAY_GIT_REPO_OWNER: "",
    RAILWAY_GIT_REPO_NAME: "",
    RAILWAY_DEPLOYMENT_ID: "",
    RAILWAY_SERVICE_NAME: "",
    RAILWAY_ENVIRONMENT_NAME: "",
  }, async () => {
    const { app } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.ready, true);
      assert.deepEqual(deployment.body.deploymentIdentity, {
        railwayGitCommitSha: null,
        railwayGitBranch: null,
        railwayGitRepoOwner: null,
        railwayGitRepoName: null,
        railwayDeploymentId: null,
        railwayServiceName: null,
        railwayEnvironmentName: null,
      });
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment proves backend migrations through public schema objects", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, true);
    assert.equal(deployment.body.readiness.migrations.ok, true);
    assert.equal(deployment.body.readiness.migrations.count, null);
    assert.deepEqual(deployment.body.readiness.migrations.latest, {
      version: "025-085",
      name: "public_schema_object_rpc_document_version_and_summary_proof",
    });
    assert.deepEqual(deployment.body.readiness.migrations.proofs, [
      { id: "memory_columns", ok: true, checked: true },
      { id: "developer_space_policy", ok: true, checked: true },
      { id: "documents_version", ok: true, checked: true },
      { id: "document_versions", ok: true, checked: true },
      { id: "memory_rpc", ok: true, checked: true },
      { id: "archive_rpc", ok: true, checked: true },
    ]);
    assert.deepEqual(db.rpcCalls.map((call) => call.functionName), [
      "match_memory_items",
      "match_private_archive_chunks",
    ]);
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment blocks readiness when PR30 document version objects are missing", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  db.documentVersionObjectProof = false;
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.migrations.ok, false);
    assert.equal(deployment.body.readiness.migrations.error, "query_failed");
    assert.deepEqual(deployment.body.readiness.migrations.proofs.find((proof: Row) => proof.id === "document_versions"), {
      id: "document_versions",
      ok: false,
      checked: true,
      error: "query_failed",
    });
    assert.equal(
      db.objectProofQueries.some((query) => query.table === "documents" && query.columns === "version,summary"),
      true
    );
    assert.equal(
      db.objectProofQueries.some((query) => query.table === "document_versions" && query.columns.includes("version_number")),
      true
    );
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment requires PR30 object proof even when migration history is readable", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  db.documentVersionObjectProof = false;

  await withEnvOverride({
    EMBEDDING_PROFILE_CODE: "openai_1536",
    EMBEDDINGS_PROVIDER: "",
    OPENAI_API_KEY: "secret-openai",
    GEMINI_API_KEY: "",
    GOOGLE_API_KEY: "",
  }, async () => {
    const { app } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.ok, true);
      assert.equal(deployment.body.ready, false);
      assert.equal(deployment.body.readiness.migrations.ok, false);
      assert.equal(deployment.body.readiness.migrations.error, "query_failed");
      assert.equal(deployment.body.readiness.providers.embeddingProfileCode, "openai_1536");
      assert.deepEqual(db.rpcCalls, []);
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment blocks free embedding profile readiness without migration 029 RPC proof", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  db.failEmbeddingProfileRpcProof = true;
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.migrations.ok, false);
    assert.equal(deployment.body.readiness.migrations.error, "query_failed");
    assert.deepEqual(deployment.body.readiness.migrations.proofs.filter((proof: Row) => proof.error === "query_failed"), [
      { id: "memory_rpc", ok: false, checked: true, error: "query_failed" },
      { id: "archive_rpc", ok: false, checked: true, error: "query_failed" },
    ]);
    assert.deepEqual(db.rpcCalls.map((call) => call.functionName), [
      "match_memory_items",
      "match_private_archive_chunks",
    ]);
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment names the migration proof that times out", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  db.proofDelays.memory_columns = 20;
  const { setMigrationProofTimeoutMsForTests } = await import("../services/readiness.service.js");
  setMigrationProofTimeoutMsForTests(5);
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.migrations.ok, false);
    assert.equal(deployment.body.readiness.migrations.error, "timeout");
    assert.deepEqual(deployment.body.readiness.migrations.proofs.find((proof: Row) => proof.id === "memory_columns"), {
      id: "memory_columns",
      ok: false,
      checked: true,
      error: "timeout",
    });
    assert.equal(
      deployment.body.readiness.migrations.proofs.some((proof: Row) => proof.ok && proof.id === "archive_rpc"),
      true
    );
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment reports the resolved embedding profile for legacy provider env", async () => {
  const previousProfile = process.env.EMBEDDING_PROFILE_CODE;
  const previousProvider = process.env.EMBEDDINGS_PROVIDER;
  process.env.EMBEDDING_PROFILE_CODE = "";
  process.env.EMBEDDINGS_PROVIDER = "openai";

  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.checks.embeddingProfileCode, "openai_1536");
    assert.equal(deployment.body.checks.embeddingProvider, "openai");
    assert.equal(deployment.body.readiness.providers.embeddingProfileCode, "openai_1536");
    assert.equal(deployment.body.readiness.providers.embeddingProvider, "openai");
    assertNoSecrets(deployment.body);
  } finally {
    if (previousProfile == null) {
      delete process.env.EMBEDDING_PROFILE_CODE;
    } else {
      process.env.EMBEDDING_PROFILE_CODE = previousProfile;
    }
    if (previousProvider == null) {
      delete process.env.EMBEDDINGS_PROVIDER;
    } else {
      process.env.EMBEDDINGS_PROVIDER = previousProvider;
    }
    await resetHealthFakes();
  }
});

test("/health/deployment keeps auth redirect proof non-ready without a management token", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;

  await withEnvOverride({ SUPABASE_ACCESS_TOKEN: "" }, async () => {
    const { app, authFetch } = await setupHealthApp(db);

    try {
      const deployment = await requestJson(app, "GET", "/health/deployment");
      assert.equal(deployment.status, 200);
      assert.equal(deployment.body.ready, false);
      assert.deepEqual(deployment.body.readiness.supabaseAuthRedirects, {
        ok: false,
        checked: false,
        managementApiConfigured: false,
        projectRefConfigured: true,
        appUrlConfigured: true,
        siteUrlMatchesApp: false,
        appUrlRedirectAllowed: false,
        passwordResetRedirectAllowed: false,
        error: "not_configured",
      });
      assert.equal(authFetch.calls.length, 0);
      assertNoSecrets(deployment.body);
    } finally {
      await resetHealthFakes();
    }
  });
});

test("/health/deployment sanitizes Supabase management auth failures", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  const { app, authFetch } = await setupHealthApp(db, {
    authStatus: 403,
    authConfig: { message: "scope failure with secret-supabase-access-token" },
  });

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.ok, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.checked, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.error, "unauthorized");
    assert.equal(authFetch.calls.length, 1);
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment blocks readiness when Supabase auth redirects are incomplete", async () => {
  const db = new ReadinessSupabase();
  db.migrationObjectProof = true;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { app } = await setupHealthApp(db, {
    authConfig: {
      site_url: `${appUrl}/`,
      uri_allow_list: [appUrl],
    },
  });

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.ok, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.checked, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.siteUrlMatchesApp, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.appUrlRedirectAllowed, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.passwordResetRedirectAllowed, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.error, "config_mismatch");
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

test("/health/deployment sanitizes dependency failures", async () => {
  const db = new ReadinessSupabase();
  db.failProfiles = true;
  db.bucketMissing = true;
  const { app } = await setupHealthApp(db);

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.deepEqual(deployment.body.readiness.database, {
      ok: false,
      checked: true,
      configured: true,
      error: "query_failed",
    });
    assert.equal(deployment.body.readiness.migrations.error, "query_failed");
    assert.equal(deployment.body.readiness.storage.exists, false);
    assert.equal(deployment.body.readiness.storage.error, "query_failed");
    assertNoSecrets(deployment.body);
  } finally {
    await resetHealthFakes();
  }
});

type AuthFetchCall = {
  input: string;
  init: { method: string; headers: Record<string, string> };
};

function createAuthConfigFetch(options: {
  authConfig?: Row;
  authStatus?: number;
} = {}) {
  const calls: AuthFetchCall[] = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const authConfig = options.authConfig ?? {
    site_url: appUrl,
    uri_allow_list: [appUrl, `${appUrl}/reset-password/update`],
  };
  const status = options.authStatus ?? 200;
  return {
    calls,
    fetcher: async (input: string, init: AuthFetchCall["init"]) => {
      calls.push({ input, init });
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => authConfig,
      };
    },
  };
}

async function setupHealthApp(
  db: ReadinessSupabase,
  options: { authConfig?: Row; authStatus?: number } = {}
) {
  const authFetch = createAuthConfigFetch(options);
  setSupabaseAdminForTests(db.client as any);
  const { setSupabaseManagementFetchForTests } = await import("../services/readiness.service.js");
  setSupabaseManagementFetchForTests(authFetch.fetcher);
  return {
    app: await createHealthApp(),
    authFetch,
  };
}

async function resetHealthFakes() {
  const { setSupabaseManagementFetchForTests, setMigrationProofTimeoutMsForTests } = await import("../services/readiness.service.js");
  setSupabaseManagementFetchForTests(null);
  setMigrationProofTimeoutMsForTests(null);
  setSupabaseAdminForTests(null);
}

async function withEnvOverride(values: Record<string, string | undefined>, callback: () => Promise<void>) {
  const { env } = await import("../lib/env.js");
  const previousEnv: Record<string, string | undefined> = {};
  const previousProcess: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    previousEnv[key] = (env as any)[key];
    previousProcess[key] = process.env[key];
    (env as any)[key] = value;
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await callback();
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      (env as any)[key] = value;
    }
    for (const [key, value] of Object.entries(previousProcess)) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function createHealthApp() {
  const { healthRouter } = await import("./health.js");
  const app = express();
  app.use(healthRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method });
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

function proofIdForTable(table: string) {
  switch (table) {
    case "memory_items":
      return "memory_columns";
    case "developer_spaces":
      return "developer_space_policy";
    case "documents":
      return "documents_version";
    case "document_versions":
      return "document_versions";
    default:
      return table;
  }
}

function assertNoSecrets(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const marker of SECRET_MARKERS) {
    assert.equal(serialized.includes(marker), false, `${marker} leaked in readiness response`);
  }
}
