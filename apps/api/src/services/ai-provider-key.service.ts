import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "../lib/supabase";

export const SUPPORTED_AI_BYOK_PROVIDERS = ["openai", "anthropic", "deepseek"] as const;
export type SupportedAiByokProvider = typeof SUPPORTED_AI_BYOK_PROVIDERS[number];
export type AiProviderStorageStatus = "encrypted" | "legacy_plaintext" | "revoked" | "none";

const AI_PROVIDER_KEY_ENCRYPTION_SCHEMA = "station.ai_provider.byok_key.v1";
const AI_PROVIDER_KEY_ENCRYPTION_ALGORITHM = "aes-256-gcm";
const AI_PROVIDER_KEY_ENCRYPTION_KEY_ENV = "AI_PROVIDER_KEY_ENCRYPTION_KEY";
const KEY_COLUMNS: Record<SupportedAiByokProvider, "byok_openai_key" | "byok_anthropic_key" | "byok_deepseek_key"> = {
  openai: "byok_openai_key",
  anthropic: "byok_anthropic_key",
  deepseek: "byok_deepseek_key",
};

export type LegacyAiProviderProfile = Partial<Record<(typeof KEY_COLUMNS)[SupportedAiByokProvider], string | null>>;

export type AiProviderByokSecretRow = {
  id?: string;
  owner_user_id: string;
  provider: SupportedAiByokProvider;
  encrypted_key: Record<string, unknown>;
  key_fingerprint: string;
  key_last_four: string;
  status: "active" | "revoked";
  created_at?: string;
  updated_at?: string;
  rotated_at?: string | null;
  revoked_at?: string | null;
};

export type AiProviderReadback = {
  provider: SupportedAiByokProvider;
  label: string;
  configured: boolean;
  keyLastFour: string | null;
  storageStatus: AiProviderStorageStatus;
  updatedAt: string | null;
  rotatedAt: string | null;
  revokedAt: string | null;
};

export type RuntimeAiProviderKeys = {
  openai: string | null;
  anthropic: string | null;
  deepseek: string | null;
};

export class AiProviderKeyStorageError extends Error {
  constructor(
    public readonly code: "ai_provider_key_encryption_unconfigured" | "ai_provider_key_payload_malformed",
    message: string
  ) {
    super(message);
    this.name = "AiProviderKeyStorageError";
  }
}

function providerKeyEncryptionKey() {
  const raw = process.env[AI_PROVIDER_KEY_ENCRYPTION_KEY_ENV]?.trim();
  if (!raw) return null;
  return createHash("sha256").update(raw).digest();
}

export function aiProviderKeyEncryptionConfigured() {
  return Boolean(providerKeyEncryptionKey());
}

export function encryptAiProviderKey(rawKey: string) {
  const key = providerKeyEncryptionKey();
  if (!key) {
    throw new AiProviderKeyStorageError(
      "ai_provider_key_encryption_unconfigured",
      `${AI_PROVIDER_KEY_ENCRYPTION_KEY_ENV} is required for AI provider BYOK keys.`
    );
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(AI_PROVIDER_KEY_ENCRYPTION_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(rawKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    schema: AI_PROVIDER_KEY_ENCRYPTION_SCHEMA,
    algorithm: AI_PROVIDER_KEY_ENCRYPTION_ALGORITHM,
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

export function decryptAiProviderKey(payload: unknown) {
  const key = providerKeyEncryptionKey();
  if (!key) {
    throw new AiProviderKeyStorageError(
      "ai_provider_key_encryption_unconfigured",
      `${AI_PROVIDER_KEY_ENCRYPTION_KEY_ENV} is required for AI provider BYOK keys.`
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AiProviderKeyStorageError("ai_provider_key_payload_malformed", "AI provider BYOK encrypted payload is malformed.");
  }

  const encrypted = payload as Record<string, unknown>;
  if (
    encrypted.schema !== AI_PROVIDER_KEY_ENCRYPTION_SCHEMA ||
    encrypted.algorithm !== AI_PROVIDER_KEY_ENCRYPTION_ALGORITHM ||
    typeof encrypted.iv !== "string" ||
    typeof encrypted.ciphertext !== "string" ||
    typeof encrypted.authTag !== "string"
  ) {
    throw new AiProviderKeyStorageError("ai_provider_key_payload_malformed", "AI provider BYOK encrypted payload is malformed.");
  }

  try {
    const decipher = createDecipheriv(
      AI_PROVIDER_KEY_ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(encrypted.iv, "base64url")
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new AiProviderKeyStorageError("ai_provider_key_payload_malformed", "AI provider BYOK encrypted payload is malformed.");
  }
}

export function fingerprintAiProviderKey(provider: SupportedAiByokProvider, rawKey: string) {
  return createHash("sha256").update(`station.ai_provider.byok_key:${provider}:${rawKey}`).digest("hex").slice(0, 12);
}

export function aiProviderKeyLastFour(rawKey: string | null | undefined) {
  const trimmed = rawKey?.trim();
  if (!trimmed || trimmed.length < 8) return null;
  return trimmed.slice(-4);
}

export async function loadAiProviderReadbacks(userId: string, legacyProfile: LegacyAiProviderProfile | null | undefined) {
  const encryptedRows = await loadOwnerAiProviderSecretRows(userId, { includeRevoked: true });
  return serializeAiProviderReadbacks(encryptedRows, legacyProfile);
}

export async function loadRuntimeAiProviderKeys(userId: string, legacyProfile: LegacyAiProviderProfile | null | undefined): Promise<RuntimeAiProviderKeys> {
  const encryptedRows = await loadOwnerAiProviderSecretRows(userId, { includeRevoked: false });
  const activeByProvider = activeSecretRowsByProvider(encryptedRows);
  const keys: RuntimeAiProviderKeys = {
    openai: null,
    anthropic: null,
    deepseek: null,
  };

  for (const provider of SUPPORTED_AI_BYOK_PROVIDERS) {
    const encrypted = activeByProvider.get(provider);
    if (encrypted) {
      keys[provider] = decryptAiProviderKey(encrypted.encrypted_key);
      continue;
    }

    keys[provider] = legacyKey(legacyProfile, provider);
  }

  return keys;
}

export async function rotateAiProviderKey(input: {
  ownerUserId: string;
  provider: SupportedAiByokProvider;
  rawKey: string;
  legacyProfile?: LegacyAiProviderProfile | null;
}) {
  const sb = getSupabaseAdmin();
  const activeRows = await loadOwnerAiProviderSecretRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: false,
  });
  const now = new Date().toISOString();
  const hadExistingKey = activeRows.length > 0 || Boolean(legacyKey(input.legacyProfile, input.provider));
  const encryptedKey = encryptAiProviderKey(input.rawKey);
  const keyFingerprint = fingerprintAiProviderKey(input.provider, input.rawKey);
  const keyLastFour = aiProviderKeyLastFour(input.rawKey) ?? input.rawKey.slice(-4);

  await revokeActiveAiProviderKeyRows(input.ownerUserId, input.provider, now);

  const { data, error } = await (sb as any)
    .from("ai_provider_byok_secrets")
    .insert({
      owner_user_id: input.ownerUserId,
      provider: input.provider,
      encrypted_key: encryptedKey,
      key_fingerprint: keyFingerprint,
      key_last_four: keyLastFour,
      status: "active",
      rotated_at: hadExistingKey ? now : null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error("Could not save AI provider key.");
  await clearLegacyProfileKey(input.ownerUserId, input.provider);
  return data as AiProviderByokSecretRow;
}

export async function revokeAiProviderKey(input: {
  ownerUserId: string;
  provider: SupportedAiByokProvider;
}) {
  const now = new Date().toISOString();
  await revokeActiveAiProviderKeyRows(input.ownerUserId, input.provider, now);
  await clearLegacyProfileKey(input.ownerUserId, input.provider);
}

export function serializeAiProviderReadbacks(
  rows: AiProviderByokSecretRow[],
  legacyProfile: LegacyAiProviderProfile | null | undefined
): AiProviderReadback[] {
  const activeByProvider = activeSecretRowsByProvider(rows);
  const latestByProvider = latestSecretRowsByProvider(rows);

  return SUPPORTED_AI_BYOK_PROVIDERS.map((provider) => {
    const active = activeByProvider.get(provider);
    if (active) {
      return {
        provider,
        label: providerLabel(provider),
        configured: true,
        keyLastFour: active.key_last_four,
        storageStatus: "encrypted" as const,
        updatedAt: active.updated_at ?? null,
        rotatedAt: active.rotated_at ?? null,
        revokedAt: null,
      };
    }

    const legacy = legacyKey(legacyProfile, provider);
    if (legacy) {
      return {
        provider,
        label: providerLabel(provider),
        configured: true,
        keyLastFour: aiProviderKeyLastFour(legacy),
        storageStatus: "legacy_plaintext" as const,
        updatedAt: null,
        rotatedAt: null,
        revokedAt: null,
      };
    }

    const latest = latestByProvider.get(provider);
    if (latest?.status === "revoked") {
      return {
        provider,
        label: providerLabel(provider),
        configured: false,
        keyLastFour: latest.key_last_four ?? null,
        storageStatus: "revoked" as const,
        updatedAt: latest.updated_at ?? null,
        rotatedAt: latest.rotated_at ?? null,
        revokedAt: latest.revoked_at ?? null,
      };
    }

    return {
      provider,
      label: providerLabel(provider),
      configured: false,
      keyLastFour: null,
      storageStatus: "none" as const,
      updatedAt: null,
      rotatedAt: null,
      revokedAt: null,
    };
  });
}

export function legacyKey(profile: LegacyAiProviderProfile | null | undefined, provider: SupportedAiByokProvider) {
  const value = profile?.[KEY_COLUMNS[provider]];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function providerLabel(provider: SupportedAiByokProvider) {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "deepseek":
      return "DeepSeek";
  }
}

async function loadOwnerAiProviderSecretRows(
  ownerUserId: string,
  options: { provider?: SupportedAiByokProvider; includeRevoked: boolean }
) {
  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("ai_provider_byok_secrets")
    .select("*")
    .eq("owner_user_id", ownerUserId);

  if (options.provider) query = query.eq("provider", options.provider);
  if (!options.includeRevoked) query = query.eq("status", "active");

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error("Could not load AI provider key metadata.");
  return (data ?? []) as AiProviderByokSecretRow[];
}

async function revokeActiveAiProviderKeyRows(ownerUserId: string, provider: SupportedAiByokProvider, revokedAt: string) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("ai_provider_byok_secrets")
    .update({ status: "revoked", revoked_at: revokedAt })
    .eq("owner_user_id", ownerUserId)
    .eq("provider", provider)
    .eq("status", "active");

  if (error) throw new Error("Could not revoke AI provider key.");
}

async function clearLegacyProfileKey(ownerUserId: string, provider: SupportedAiByokProvider) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("profiles")
    .update({ [KEY_COLUMNS[provider]]: null })
    .eq("id", ownerUserId);

  if (error) throw new Error("Could not clear legacy AI provider key.");
}

function activeSecretRowsByProvider(rows: AiProviderByokSecretRow[]) {
  const byProvider = new Map<SupportedAiByokProvider, AiProviderByokSecretRow>();
  for (const row of rows) {
    if (row.status !== "active") continue;
    if (!byProvider.has(row.provider)) byProvider.set(row.provider, row);
  }
  return byProvider;
}

function latestSecretRowsByProvider(rows: AiProviderByokSecretRow[]) {
  const byProvider = new Map<SupportedAiByokProvider, AiProviderByokSecretRow>();
  for (const row of rows) {
    if (!byProvider.has(row.provider)) byProvider.set(row.provider, row);
  }
  return byProvider;
}
