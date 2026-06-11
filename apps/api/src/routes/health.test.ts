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
  "secret-redis",
  "secret-upstash",
];

class ReadinessSupabase {
  failProfiles = false;
  failMigrations = false;
  migrationObjectProof = false;
  bucketPublic = false;
  bucketMissing = false;

  migrations: Row[] = [
    { version: "20240530000001", name: "001_initial_schema" },
    { version: "20260608000024", name: "024_community_trust_votes_moderation" },
  ];

  client = {
    from: (table: string) => new ReadinessQuery(this, "public", table),
    schema: (schemaName: string) => ({
      from: (table: string) => new ReadinessQuery(this, schemaName, table),
    }),
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
}

class ReadinessQuery {
  private countRequested = false;
  private head = false;
  private limitCount: number | null = null;
  private orderField: string | null = null;
  private ascending = true;

  constructor(
    private db: ReadinessSupabase,
    private schemaName: string,
    private table: string
  ) {}

  select(_columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.countRequested = Boolean(options.count);
    this.head = Boolean(options.head);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderField = field;
    this.ascending = options.ascending ?? true;
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

    if (this.schemaName === "supabase_migrations" && this.table === "schema_migrations") {
      if (this.db.failMigrations) {
        return { data: null, error: { message: "migration failure with secret-password" }, count: null };
      }

      let rows = [...this.db.migrations];
      if (this.orderField) {
        rows.sort((a, b) => {
          if (a[this.orderField!] === b[this.orderField!]) return 0;
          return (a[this.orderField!] > b[this.orderField!] ? 1 : -1) * (this.ascending ? 1 : -1);
        });
      }
      const count = this.countRequested ? rows.length : null;
      if (this.limitCount != null) rows = rows.slice(0, this.limitCount);
      return { data: rows, error: null, count };
    }

    if (this.schemaName === "public" && (this.table === "memory_items" || this.table === "developer_spaces")) {
      if (!this.db.migrationObjectProof) {
        return { data: null, error: { message: "public proof failure with secret-service-role" }, count: null };
      }
      return { data: this.head ? null : [], error: null, count: this.countRequested ? 0 : null };
    }

    return { data: null, error: { message: "unexpected query" }, count: null };
  }
}

test("/health stays cheap while /health/deployment returns non-secret readiness", async () => {
  const db = new ReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createHealthApp();

  try {
    const cheap = await requestJson(app, "GET", "/health");
    assert.equal(cheap.status, 200);
    assert.deepEqual(cheap.body, { ok: true });

    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.checks.databaseUrl, true);
    assert.equal(deployment.body.checks.nvidiaProvider, true);
    assert.equal(deployment.body.checks.embeddingProfileCode, "station_free_1536");
    assert.equal(deployment.body.checks.embeddingProvider, "gemini");
    assert.equal(deployment.body.checks.embeddingsConfigured, true);
    assert.equal(deployment.body.checks.openaiEmbeddings, false);
    assert.equal(deployment.body.checks.geminiEmbeddings, true);
    assert.equal(deployment.body.checks.redisConfigured, true);
    assert.equal(deployment.body.readiness.database.ok, true);
    assert.equal(deployment.body.readiness.migrations.count, 2);
    assert.deepEqual(deployment.body.readiness.migrations.latest, {
      version: "20260608000024",
      name: "024_community_trust_votes_moderation",
    });
    assert.equal(deployment.body.readiness.storage.exists, true);
    assert.equal(deployment.body.readiness.storage.private, true);
    assert.equal(deployment.body.readiness.publicUrls.app.railway, true);
    assert.equal(deployment.body.readiness.publicUrls.api.railway, true);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.checked, false);
    assert.equal(deployment.body.readiness.supabaseAuthRedirects.error, "not_supported");
    assert.equal(deployment.body.readiness.stripe.ready, true);
    assert.equal(deployment.body.readiness.providers.embeddingProfileCode, "station_free_1536");
    assert.equal(deployment.body.readiness.providers.embeddingProvider, "gemini");
    assert.equal(deployment.body.readiness.providers.embeddingsConfigured, true);
    assert.equal(deployment.body.readiness.providers.openaiEmbeddings, false);
    assert.equal(deployment.body.readiness.providers.geminiEmbeddings, true);
    assertNoSecrets(deployment.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("/health/deployment proves backend migrations through public schema objects when history is hidden", async () => {
  const db = new ReadinessSupabase();
  db.failMigrations = true;
  db.migrationObjectProof = true;
  setSupabaseAdminForTests(db.client as any);
  const app = await createHealthApp();

  try {
    const deployment = await requestJson(app, "GET", "/health/deployment");
    assert.equal(deployment.status, 200);
    assert.equal(deployment.body.ok, true);
    assert.equal(deployment.body.ready, false);
    assert.equal(deployment.body.readiness.migrations.ok, true);
    assert.equal(deployment.body.readiness.migrations.count, null);
    assert.deepEqual(deployment.body.readiness.migrations.latest, {
      version: "025-028",
      name: "public_schema_object_proof",
    });
    assertNoSecrets(deployment.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("/health/deployment reports the resolved embedding profile for legacy provider env", async () => {
  const previousProfile = process.env.EMBEDDING_PROFILE_CODE;
  const previousProvider = process.env.EMBEDDINGS_PROVIDER;
  process.env.EMBEDDING_PROFILE_CODE = "";
  process.env.EMBEDDINGS_PROVIDER = "openai";

  const db = new ReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createHealthApp();

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
    setSupabaseAdminForTests(null);
  }
});

test("/health/deployment sanitizes dependency failures", async () => {
  const db = new ReadinessSupabase();
  db.failProfiles = true;
  db.failMigrations = true;
  db.bucketMissing = true;
  setSupabaseAdminForTests(db.client as any);
  const app = await createHealthApp();

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
    setSupabaseAdminForTests(null);
  }
});

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

function assertNoSecrets(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const marker of SECRET_MARKERS) {
    assert.equal(serialized.includes(marker), false, `${marker} leaked in readiness response`);
  }
}
