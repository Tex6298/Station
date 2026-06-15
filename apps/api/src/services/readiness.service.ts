import { env } from "../lib/env";
import { getSupabaseAdmin } from "../lib/supabase";
import { resolveActiveEmbeddingProfileCode, resolveActiveEmbeddingProvider } from "./embedding-key.service";
import { operationalCacheStatus } from "./operational-cache.service";

const PERSONA_FILES_BUCKET = "persona-files";
const CHECK_TIMEOUT_MS = 1500;
const SUPABASE_MANAGEMENT_TIMEOUT_MS = 5000;
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
const SUPABASE_MANAGEMENT_API_BASE = "https://api.supabase.com";
const BACKEND_MIGRATION_OBJECT_PROOF_LATEST = {
  version: "025-029",
  name: "public_schema_object_and_rpc_proof",
};

type CheckStatus = {
  ok: boolean;
  checked: boolean;
  error?: "not_configured" | "query_failed" | "timeout" | "not_supported" | "unauthorized" | "config_mismatch";
};

type SupabaseManagementFetch = (
  input: string,
  init: { method: "GET"; headers: Record<string, string> }
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

let supabaseManagementFetchForTests: SupabaseManagementFetch | null = null;

export function setSupabaseManagementFetchForTests(fetcher: SupabaseManagementFetch | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setSupabaseManagementFetchForTests can only be used while NODE_ENV is test.");
  }
  supabaseManagementFetchForTests = fetcher;
}

type UrlStatus = {
  configured: boolean;
  valid: boolean;
  https: boolean;
  localhost: boolean;
  railway: boolean;
};

type EmbeddingProvider = "openai" | "gemini";
type EmbeddingProfileCode = "station_free_1536" | "openai_1536";

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
    embeddingProfileCode: EmbeddingProfileCode;
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
      appUrlConfigured: boolean;
      siteUrlMatchesApp: boolean;
      appUrlRedirectAllowed: boolean;
      passwordResetRedirectAllowed: boolean;
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
      embeddingProfileCode: EmbeddingProfileCode;
      embeddingProvider: EmbeddingProvider;
      embeddingsConfigured: boolean;
      openaiEmbeddings: boolean;
      geminiEmbeddings: boolean;
    };
    redis: {
      railwayRedis: boolean;
      upstashRest: boolean;
      configured: boolean;
      operationalCache: {
        enabled: boolean;
        kind: "disabled" | "upstash_rest" | "test";
        disabledReason?: string;
        environment: string;
      };
    };
  };
};

type MigrationReadiness = DeploymentReadiness["readiness"]["migrations"];

export async function buildDeploymentReadiness(now = new Date()): Promise<DeploymentReadiness> {
  const checks = buildStaticChecks();
  const [database, migrations, storage, supabaseAuthRedirects] = await Promise.all([
    checkDatabaseConnectivity(),
    checkMigrationState(),
    checkPersonaFilesBucket(),
    checkSupabaseAuthRedirects(),
  ]);
  const publicUrls = {
    app: urlStatus(env.NEXT_PUBLIC_APP_URL),
    api: urlStatus(env.API_URL),
  };
  const stripe = stripeStatus();
  const providers = providerStatus();
  const redis = redisStatus();

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
    embeddingProfileCode: providers.embeddingProfileCode,
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
  const embeddingProfileCode = resolveActiveEmbeddingProfileCode();
  if (history.ok && embeddingProfileCode !== "station_free_1536") return history;

  // Supabase's REST layer can hide supabase_migrations; public objects prove the
  // backend migrations we need when history is unavailable in staging. The
  // active free embedding profile additionally requires the provider-aware 029
  // RPC signatures before deployment readiness can go true.
  const objectProof = await checkBackendMigrationObjects(sb);
  if (embeddingProfileCode === "station_free_1536") return objectProof;
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

    if (resolveActiveEmbeddingProfileCode() === "station_free_1536") {
      const rpcProof = await checkEmbeddingProfileRpcObjects(sb);
      if (!rpcProof.ok) return rpcProof;
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

async function checkEmbeddingProfileRpcObjects(sb: any): Promise<MigrationReadiness> {
  if (typeof sb.rpc !== "function") {
    return { ok: false, checked: false, count: null, latest: null, error: "not_supported" };
  }

  const zeroVector = new Array<number>(1536).fill(0);
  const commonArgs = {
    query_embedding: zeroVector,
    match_count: 1,
    p_embedding_provider: "gemini",
    p_embedding_model: "gemini-embedding-2",
    p_embedding_index_name: "memory_items_embedding_1536",
  };

  const memoryResult = await withTimeout<any>(
    sb.rpc("match_memory_items", {
      p_persona_id: ZERO_UUID,
      ...commonArgs,
    }),
    CHECK_TIMEOUT_MS
  );
  if (memoryResult.error) {
    return { ok: false, checked: true, count: null, latest: null, error: "query_failed" };
  }

  const archiveResult = await withTimeout<any>(
    sb.rpc("match_private_archive_chunks", {
      p_persona_id: ZERO_UUID,
      p_owner_user_id: ZERO_UUID,
      ...commonArgs,
    }),
    CHECK_TIMEOUT_MS
  );
  if (archiveResult.error) {
    return { ok: false, checked: true, count: null, latest: null, error: "query_failed" };
  }

  return { ok: true, checked: true, count: null, latest: BACKEND_MIGRATION_OBJECT_PROOF_LATEST };
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

async function checkSupabaseAuthRedirects(): Promise<DeploymentReadiness["readiness"]["supabaseAuthRedirects"]> {
  const projectRef = projectRefFromSupabaseUrl(env.SUPABASE_URL);
  const targets = authRedirectTargets(env.NEXT_PUBLIC_APP_URL);
  const base = {
    managementApiConfigured: hasValue(env.SUPABASE_ACCESS_TOKEN),
    projectRefConfigured: hasValue(projectRef),
    appUrlConfigured: targets != null,
    siteUrlMatchesApp: false,
    appUrlRedirectAllowed: false,
    passwordResetRedirectAllowed: false,
  };

  if (!base.managementApiConfigured || !projectRef || !targets) {
    return { ok: false, checked: false, ...base, error: "not_configured" };
  }

  try {
    const response = await withTimeout(
      supabaseManagementFetch(`${SUPABASE_MANAGEMENT_API_BASE}/v1/projects/${encodeURIComponent(projectRef)}/config/auth`, {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
        },
      }),
      SUPABASE_MANAGEMENT_TIMEOUT_MS
    );

    if (response.status === 401 || response.status === 403) {
      return { ok: false, checked: true, ...base, error: "unauthorized" };
    }
    if (!response.ok) {
      return { ok: false, checked: true, ...base, error: "query_failed" };
    }

    const body = await withTimeout(response.json(), SUPABASE_MANAGEMENT_TIMEOUT_MS);
    const siteUrl = normalizeUrlForCompare((body as any)?.site_url);
    const allowedRedirects = redirectAllowList((body as any)?.uri_allow_list)
      .map(normalizeUrlForCompare)
      .filter((value): value is string => value != null);
    const siteUrlMatchesApp = siteUrl === targets.appUrl;
    const appUrlRedirectAllowed = allowedRedirects.includes(targets.appUrl);
    const passwordResetRedirectAllowed = allowedRedirects.includes(targets.passwordResetUrl);
    const ok = siteUrlMatchesApp && appUrlRedirectAllowed && passwordResetRedirectAllowed;

    return {
      ok,
      checked: true,
      ...base,
      siteUrlMatchesApp,
      appUrlRedirectAllowed,
      passwordResetRedirectAllowed,
      error: ok ? undefined : "config_mismatch",
    };
  } catch (error) {
    return {
      ok: false,
      checked: true,
      ...base,
      error: isTimeout(error) ? "timeout" : "query_failed",
    };
  }
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
  const embeddingProvider = resolveActiveEmbeddingProvider();
  const embeddingProfileCode = resolveActiveEmbeddingProfileCode();
  const openaiConfigured = hasValue(env.OPENAI_API_KEY);
  const geminiConfigured = hasValue(env.GEMINI_API_KEY) || hasValue(env.GOOGLE_API_KEY);
  return {
    platformChat: anthropic || deepseek || nvidia,
    anthropic,
    deepseek,
    nvidia,
    embeddingProfileCode,
    embeddingProvider,
    embeddingsConfigured: embeddingProvider === "gemini" ? geminiConfigured : openaiConfigured,
    openaiEmbeddings: openaiConfigured,
    geminiEmbeddings: geminiConfigured,
  };
}

function redisStatus(): DeploymentReadiness["readiness"]["redis"] {
  const railwayRedis = hasValue(env.REDIS_URL) || hasValue(env.REDIS_PRIVATE_URL) || hasValue(env.VALKEY_URL);
  const upstashRest = hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN);
  const operationalCache = operationalCacheStatus();
  return {
    railwayRedis,
    upstashRest,
    configured: railwayRedis || upstashRest,
    operationalCache,
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
    if (!parsed.hostname.endsWith(".supabase.co")) return null;
    const [projectRef] = parsed.hostname.split(".");
    return /^[a-z0-9]{20}$/.test(projectRef) ? projectRef : null;
  } catch {
    return null;
  }
}

function authRedirectTargets(appUrl: string | undefined) {
  const normalizedAppUrl = normalizeUrlForCompare(appUrl);
  if (!normalizedAppUrl) return null;

  try {
    const passwordResetUrl = normalizeUrlForCompare(new URL("/reset-password/update", `${normalizedAppUrl}/`).toString());
    return passwordResetUrl
      ? { appUrl: normalizedAppUrl, passwordResetUrl }
      : null;
  } catch {
    return null;
  }
}

function redirectAllowList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value.split(/[,\n]+/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeUrlForCompare(value: unknown) {
  if (typeof value !== "string" || !hasValue(value)) return null;
  try {
    const parsed = new URL(value.trim());
    parsed.hash = "";
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/g, "");
    }
    return parsed.toString().replace(/\/$/g, "");
  } catch {
    return value.trim().replace(/\/+$/g, "");
  }
}

function hasValue(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function supabaseManagementFetch(input: string, init: { method: "GET"; headers: Record<string, string> }) {
  const fetcher = supabaseManagementFetchForTests ?? globalThis.fetch;
  return fetcher(input, init) as ReturnType<SupabaseManagementFetch>;
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
