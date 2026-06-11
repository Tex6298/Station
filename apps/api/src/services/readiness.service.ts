import { env } from "../lib/env";
import { getSupabaseAdmin } from "../lib/supabase";

const PERSONA_FILES_BUCKET = "persona-files";
const CHECK_TIMEOUT_MS = 1500;
const BACKEND_MIGRATION_OBJECT_PROOF_LATEST = {
  version: "025-028",
  name: "public_schema_object_proof",
};

type CheckStatus = {
  ok: boolean;
  checked: boolean;
  error?: "not_configured" | "query_failed" | "timeout" | "not_supported";
};

type UrlStatus = {
  configured: boolean;
  valid: boolean;
  https: boolean;
  localhost: boolean;
  railway: boolean;
};

type EmbeddingProvider = "openai" | "gemini";

type DeploymentReadiness = {
  ready: boolean;
  generatedAt: string;
  checks: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    supabaseServiceRoleKey: boolean;
    databaseUrl: boolean;
    anthropicProvider: boolean;
    deepseekProvider: boolean;
    nvidiaProvider: boolean;
    embeddingProvider: EmbeddingProvider;
    embeddingsConfigured: boolean;
    openaiEmbeddings: boolean;
    geminiEmbeddings: boolean;
    stripeBilling: boolean;
    stripePrices: boolean;
    redisConfigured: boolean;
    jwtSecretConfigured: boolean;
  };
  readiness: {
    database: CheckStatus & { configured: boolean };
    migrations: CheckStatus & {
      count: number | null;
      latest: { version: string; name: string | null } | null;
    };
    storage: CheckStatus & {
      bucket: typeof PERSONA_FILES_BUCKET;
      exists: boolean;
      private: boolean | null;
    };
    publicUrls: {
      app: UrlStatus;
      api: UrlStatus;
    };
    supabaseAuthRedirects: CheckStatus & {
      managementApiConfigured: boolean;
      projectRefConfigured: boolean;
    };
    stripe: {
      billingSecrets: boolean;
      priceIds: {
        basicMonthly: boolean;
        basicYearly: boolean;
        creatorMonthly: boolean;
        creatorYearly: boolean;
        canonMonthly: boolean;
        canonYearly: boolean;
      };
      ready: boolean;
    };
    providers: {
      platformChat: boolean;
      anthropic: boolean;
      deepseek: boolean;
      nvidia: boolean;
      embeddingProvider: EmbeddingProvider;
      embeddingsConfigured: boolean;
      openaiEmbeddings: boolean;
      geminiEmbeddings: boolean;
    };
    redis: {
      railwayRedis: boolean;
      upstashRest: boolean;
      configured: boolean;
    };
  };
};

type MigrationReadiness = DeploymentReadiness["readiness"]["migrations"];

export async function buildDeploymentReadiness(now = new Date()): Promise<DeploymentReadiness> {
  const checks = buildStaticChecks();
  const [database, migrations, storage] = await Promise.all([
    checkDatabaseConnectivity(),
    checkMigrationState(),
    checkPersonaFilesBucket(),
  ]);
  const publicUrls = {
    app: urlStatus(env.NEXT_PUBLIC_APP_URL),
    api: urlStatus(env.API_URL),
  };
  const stripe = stripeStatus();
  const providers = providerStatus();
  const redis = redisStatus();
  const supabaseAuthRedirects = supabaseAuthRedirectStatus();

  const ready = [
    database.ok,
    migrations.ok,
    storage.ok,
    storage.exists,
    storage.private === true,
    publicUrls.app.valid,
    publicUrls.app.https,
    !publicUrls.app.localhost,
    publicUrls.api.valid,
    publicUrls.api.https,
    !publicUrls.api.localhost,
    checks.supabaseUrl,
    checks.supabaseAnonKey,
    checks.supabaseServiceRoleKey,
    checks.databaseUrl,
    checks.jwtSecretConfigured,
    supabaseAuthRedirects.ok,
    stripe.ready,
    providers.platformChat,
    providers.embeddingsConfigured,
  ].every(Boolean);

  return {
    ready,
    generatedAt: now.toISOString(),
    checks,
    readiness: {
      database,
      migrations,
      storage,
      publicUrls,
      supabaseAuthRedirects,
      stripe,
      providers,
      redis,
    },
  };
}

function buildStaticChecks() {
  const stripe = stripeStatus();
  const providers = providerStatus();
  const redis = redisStatus();

  return {
    supabaseUrl: hasValue(env.SUPABASE_URL),
    supabaseAnonKey: hasValue(env.SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: hasValue(env.SUPABASE_SERVICE_ROLE_KEY),
    databaseUrl: hasValue(env.DATABASE_URL),
    anthropicProvider: providers.anthropic,
    deepseekProvider: providers.deepseek,
    nvidiaProvider: providers.nvidia,
    embeddingProvider: providers.embeddingProvider,
    embeddingsConfigured: providers.embeddingsConfigured,
    openaiEmbeddings: providers.openaiEmbeddings,
    geminiEmbeddings: providers.geminiEmbeddings,
    stripeBilling: stripe.billingSecrets,
    stripePrices: stripe.ready,
    redisConfigured: redis.configured,
    jwtSecretConfigured: env.JWT_SECRET !== "change-me-in-production",
  };
}

async function checkDatabaseConnectivity(): Promise<CheckStatus & { configured: boolean }> {
  if (!hasValue(env.SUPABASE_URL) || !hasValue(env.SUPABASE_SERVICE_ROLE_KEY)) {
    return { ok: false, checked: false, configured: false, error: "not_configured" };
  }

  try {
    const sb = getSupabaseAdmin();
    const result = await withTimeout<any>(
      sb.from("profiles").select("id", { count: "exact", head: true }).limit(1),
      CHECK_TIMEOUT_MS
    );
    return result.error
      ? { ok: false, checked: true, configured: true, error: "query_failed" }
      : { ok: true, checked: true, configured: true };
  } catch (error) {
    return { ok: false, checked: true, configured: true, error: isTimeout(error) ? "timeout" : "query_failed" };
  }
}

async function checkMigrationState(): Promise<MigrationReadiness> {
  if (!hasValue(env.SUPABASE_URL) || !hasValue(env.SUPABASE_SERVICE_ROLE_KEY)) {
    return { ok: false, checked: false, count: null, latest: null, error: "not_configured" };
  }

  const sb = getSupabaseAdmin() as any;
  const history = await checkSupabaseMigrationHistory(sb);
  if (history.ok) return history;

  // Supabase's REST layer can hide supabase_migrations; public objects prove the
  // backend migrations we need when history is unavailable in staging.
  const objectProof = await checkBackendMigrationObjects(sb);
  return objectProof.ok ? objectProof : history;
}

async function checkSupabaseMigrationHistory(sb: any): Promise<MigrationReadiness> {
  try {
    if (typeof sb.schema !== "function") {
      return { ok: false, checked: false, count: null, latest: null, error: "not_supported" };
    }

    const result: any = await withTimeout(
      sb
        .schema("supabase_migrations")
        .from("schema_migrations")
        .select("version,name", { count: "exact" })
        .order("version", { ascending: false })
        .limit(1),
      CHECK_TIMEOUT_MS
    );

    if (result.error) {
      return { ok: false, checked: true, count: null, latest: null, error: "query_failed" };
    }

    const latest = Array.isArray(result.data) ? result.data[0] : null;
    return {
      ok: true,
      checked: true,
      count: typeof result.count === "number" ? result.count : null,
      latest: latest
        ? {
          version: String(latest.version ?? ""),
          name: latest.name == null ? null : String(latest.name),
        }
        : null,
    };
  } catch (error) {
    return {
      ok: false,
      checked: true,
      count: null,
      latest: null,
      error: isTimeout(error) ? "timeout" : "query_failed",
    };
  }
}

async function checkBackendMigrationObjects(sb: any): Promise<MigrationReadiness> {
  try {
    const memoryColumns =
      "archive_source_type,archive_source_id,archive_source_name,chunk_index,chunk_count,embedding_provider,embedding_model,embedding_dimension,embedding_index_name,embedding_index_source,embedding_backfill_version";
    const memoryResult = await withTimeout<any>(
      sb.from("memory_items").select(memoryColumns, { head: true }).limit(1),
      CHECK_TIMEOUT_MS
    );
    if (memoryResult.error) {
      return { ok: false, checked: true, count: null, latest: null, error: "query_failed" };
    }

    const developerSpaceResult = await withTimeout<any>(
      sb.from("developer_spaces").select("provider_policy", { head: true }).limit(1),
      CHECK_TIMEOUT_MS
    );
    if (developerSpaceResult.error) {
      return { ok: false, checked: true, count: null, latest: null, error: "query_failed" };
    }

    return {
      ok: true,
      checked: true,
      count: null,
      latest: BACKEND_MIGRATION_OBJECT_PROOF_LATEST,
    };
  } catch (error) {
    return {
      ok: false,
      checked: true,
      count: null,
      latest: null,
      error: isTimeout(error) ? "timeout" : "query_failed",
    };
  }
}

async function checkPersonaFilesBucket(): Promise<DeploymentReadiness["readiness"]["storage"]> {
  if (!hasValue(env.SUPABASE_URL) || !hasValue(env.SUPABASE_SERVICE_ROLE_KEY)) {
    return {
      ok: false,
      checked: false,
      bucket: PERSONA_FILES_BUCKET,
      exists: false,
      private: null,
      error: "not_configured",
    };
  }

  try {
    const sb = getSupabaseAdmin() as any;
    const result = await withTimeout<any>(sb.storage.getBucket(PERSONA_FILES_BUCKET), CHECK_TIMEOUT_MS);
    if (result.error || !result.data) {
      return {
        ok: false,
        checked: true,
        bucket: PERSONA_FILES_BUCKET,
        exists: false,
        private: null,
        error: "query_failed",
      };
    }

    const isPrivate = result.data.public === false;
    return {
      ok: isPrivate,
      checked: true,
      bucket: PERSONA_FILES_BUCKET,
      exists: true,
      private: isPrivate,
    };
  } catch (error) {
    return {
      ok: false,
      checked: true,
      bucket: PERSONA_FILES_BUCKET,
      exists: false,
      private: null,
      error: isTimeout(error) ? "timeout" : "query_failed",
    };
  }
}

function supabaseAuthRedirectStatus(): DeploymentReadiness["readiness"]["supabaseAuthRedirects"] {
  return {
    ok: false,
    checked: false,
    managementApiConfigured: hasValue(env.SUPABASE_ACCESS_TOKEN),
    projectRefConfigured: hasValue(projectRefFromSupabaseUrl(env.SUPABASE_URL)),
    error: "not_supported",
  };
}

function stripeStatus(): DeploymentReadiness["readiness"]["stripe"] {
  const priceIds = {
    basicMonthly: hasValue(env.STRIPE_PRICE_BASIC_MONTHLY),
    basicYearly: hasValue(env.STRIPE_PRICE_BASIC_YEARLY),
    creatorMonthly: hasValue(env.STRIPE_PRICE_CREATOR_MONTHLY),
    creatorYearly: hasValue(env.STRIPE_PRICE_CREATOR_YEARLY),
    canonMonthly: hasValue(env.STRIPE_PRICE_CANON_MONTHLY),
    canonYearly: hasValue(env.STRIPE_PRICE_CANON_YEARLY),
  };
  const billingSecrets = hasValue(env.STRIPE_SECRET_KEY) && hasValue(env.STRIPE_WEBHOOK_SECRET);
  return {
    billingSecrets,
    priceIds,
    ready: billingSecrets && Object.values(priceIds).every(Boolean),
  };
}

function providerStatus(): DeploymentReadiness["readiness"]["providers"] {
  const anthropic = hasValue(env.ANTHROPIC_API_KEY);
  const deepseek = hasValue(env.DEEPSEEK_API_KEY);
  const nvidia = hasValue(env.NVIDIA_AI_API_KEY);
  const embeddingProvider: EmbeddingProvider = env.EMBEDDINGS_PROVIDER === "gemini" ? "gemini" : "openai";
  const openaiConfigured = hasValue(env.OPENAI_API_KEY);
  const geminiConfigured = hasValue(env.GEMINI_API_KEY) || hasValue(env.GOOGLE_API_KEY);
  return {
    platformChat: anthropic || deepseek || nvidia,
    anthropic,
    deepseek,
    nvidia,
    embeddingProvider,
    embeddingsConfigured: embeddingProvider === "gemini" ? geminiConfigured : openaiConfigured,
    openaiEmbeddings: openaiConfigured,
    geminiEmbeddings: geminiConfigured,
  };
}

function redisStatus(): DeploymentReadiness["readiness"]["redis"] {
  const railwayRedis = hasValue(env.REDIS_URL) || hasValue(env.REDIS_PRIVATE_URL) || hasValue(env.VALKEY_URL);
  const upstashRest = hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN);
  return {
    railwayRedis,
    upstashRest,
    configured: railwayRedis || upstashRest,
  };
}

function urlStatus(value: string | undefined): UrlStatus {
  if (!hasValue(value)) {
    return { configured: false, valid: false, https: false, localhost: false, railway: false };
  }

  try {
    const parsed = new URL(value);
    const localhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    return {
      configured: true,
      valid: true,
      https: parsed.protocol === "https:",
      localhost,
      railway: parsed.hostname.endsWith(".railway.app"),
    };
  } catch {
    return { configured: true, valid: false, https: false, localhost: false, railway: false };
  }
}

function projectRefFromSupabaseUrl(value: string | undefined) {
  if (!hasValue(value)) return null;
  try {
    const parsed = new URL(value);
    const [projectRef] = parsed.hostname.split(".");
    return projectRef || null;
  } catch {
    return null;
  }
}

function hasValue(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("readiness_timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isTimeout(error: unknown) {
  return error instanceof Error && error.message === "readiness_timeout";
}
