import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "../../lib/supabase";
import {
  SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM,
  SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV,
  SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA,
  SOCIAL_CONNECTOR_PURPOSE,
  isSocialConnectorProviderId,
  socialConnectorCredentialReadback,
  type SocialConnectorCredentialCategory,
  type SocialConnectorCredentialReadback,
  type SocialConnectorCredentialStatus,
  type SocialConnectorProviderId,
} from "./credential-contract";

export type SocialConnectorCredentialStorageErrorCode =
  | "social_connector_credential_encryption_unconfigured"
  | "social_connector_credential_encryption_malformed"
  | "social_connector_credential_provider_unsupported"
  | "social_connector_credential_write_failed"
  | "social_connector_credential_load_failed"
  | "social_connector_credential_revoke_failed"
  | "social_connector_credential_payload_invalid"
  | "social_connector_credential_decrypt_failed";

export type SocialConnectorCredentialRow = {
  id?: string;
  owner_user_id: string;
  provider: SocialConnectorProviderId;
  purpose: typeof SOCIAL_CONNECTOR_PURPOSE;
  credential_category: SocialConnectorCredentialCategory;
  encrypted_credential: Record<string, unknown>;
  credential_fingerprint: string;
  status: SocialConnectorCredentialStatus;
  created_at?: string;
  updated_at?: string;
  rotated_at?: string | null;
  revoked_at?: string | null;
};

export class SocialConnectorCredentialStorageError extends Error {
  constructor(public readonly code: SocialConnectorCredentialStorageErrorCode, message: string) {
    super(message);
    this.name = "SocialConnectorCredentialStorageError";
  }
}

export function socialConnectorCredentialEncryptionConfigured() {
  try {
    return Boolean(socialConnectorCredentialEncryptionKey());
  } catch {
    return false;
  }
}

export function encryptSocialConnectorCredential(secretMaterial: unknown) {
  const key = requiredSocialConnectorCredentialEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM, key, iv);
  const plaintext = stableSecretMaterial(secretMaterial);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    schema: SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA,
    algorithm: SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM,
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

export function decryptSocialConnectorCredentialForTests(encryptedCredential: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("decryptSocialConnectorCredentialForTests can only be used while NODE_ENV is test.");
  }
  return decryptSocialConnectorCredential(encryptedCredential);
}

export function fingerprintSocialConnectorCredential(
  provider: SocialConnectorProviderId,
  secretMaterial: unknown,
) {
  return createHash("sha256")
    .update(`station.social_connector.credential:${provider}:${stableSecretMaterial(secretMaterial)}`)
    .digest("hex")
    .slice(0, 16);
}

export async function storeSocialConnectorCredential(input: {
  ownerUserId: string;
  provider: SocialConnectorProviderId;
  credentialMaterial: unknown;
  category?: SocialConnectorCredentialCategory;
  now?: string;
}): Promise<SocialConnectorCredentialReadback> {
  if (!isSocialConnectorProviderId(input.provider)) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_provider_unsupported",
      "Social connector provider is not supported.",
    );
  }

  const category = input.category ?? "manual_credential";
  const encryptedCredential = encryptSocialConnectorCredential(input.credentialMaterial);
  const credentialFingerprint = fingerprintSocialConnectorCredential(input.provider, input.credentialMaterial);
  const activeRows = await loadSocialConnectorCredentialRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: false,
  });
  const now = input.now ?? new Date().toISOString();

  await revokeActiveSocialConnectorCredentialRows(input.ownerUserId, input.provider, now);

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("social_connector_credentials")
    .insert({
      owner_user_id: input.ownerUserId,
      provider: input.provider,
      purpose: SOCIAL_CONNECTOR_PURPOSE,
      credential_category: category,
      encrypted_credential: encryptedCredential,
      credential_fingerprint: credentialFingerprint,
      status: "active",
      rotated_at: activeRows.length > 0 ? now : null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_write_failed",
      "Could not save social connector credential.",
    );
  }

  return serializeSocialConnectorCredentialReadback(data as SocialConnectorCredentialRow);
}

export async function loadSocialConnectorCredentialReadbacks(ownerUserId: string) {
  const rows = await loadSocialConnectorCredentialRows(ownerUserId, { includeRevoked: true });
  return rows
    .filter((row) => isSocialConnectorProviderId(row.provider))
    .map(serializeSocialConnectorCredentialReadback);
}

export async function revokeSocialConnectorCredential(input: {
  ownerUserId: string;
  provider: SocialConnectorProviderId;
  now?: string;
}) {
  const revokedAt = input.now ?? new Date().toISOString();
  await revokeActiveSocialConnectorCredentialRows(input.ownerUserId, input.provider, revokedAt);
  const rows = await loadSocialConnectorCredentialRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: true,
  });
  return rows
    .filter((row) => isSocialConnectorProviderId(row.provider))
    .map(serializeSocialConnectorCredentialReadback);
}

export function serializeSocialConnectorCredentialReadback(
  row: SocialConnectorCredentialRow,
): SocialConnectorCredentialReadback {
  return socialConnectorCredentialReadback({
    provider: row.provider,
    status: row.status,
    category: row.credential_category,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    rotatedAt: row.rotated_at ?? null,
    revokedAt: row.revoked_at ?? null,
  });
}

async function loadSocialConnectorCredentialRows(
  ownerUserId: string,
  options: { provider?: SocialConnectorProviderId; includeRevoked: boolean },
) {
  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("social_connector_credentials")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("purpose", SOCIAL_CONNECTOR_PURPOSE);

  if (options.provider) query = query.eq("provider", options.provider);
  if (!options.includeRevoked) query = query.eq("status", "active");

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_load_failed",
      "Could not load social connector credential metadata.",
    );
  }
  return (data ?? []) as SocialConnectorCredentialRow[];
}

async function revokeActiveSocialConnectorCredentialRows(
  ownerUserId: string,
  provider: SocialConnectorProviderId,
  revokedAt: string,
) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("social_connector_credentials")
    .update({ status: "revoked", revoked_at: revokedAt })
    .eq("owner_user_id", ownerUserId)
    .eq("provider", provider)
    .eq("purpose", SOCIAL_CONNECTOR_PURPOSE)
    .eq("status", "active");

  if (error) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_revoke_failed",
      "Could not revoke social connector credential.",
    );
  }
}

function decryptSocialConnectorCredential(encryptedCredential: Record<string, unknown>) {
  const encrypted = encryptedCredentialPayload(encryptedCredential);
  const key = requiredSocialConnectorCredentialEncryptionKey();

  let plaintext: string;
  try {
    const decipher = createDecipheriv(SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM, key, encrypted.iv);
    decipher.setAuthTag(encrypted.authTag);
    plaintext = Buffer.concat([
      decipher.update(encrypted.ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_decrypt_failed",
      "Social connector credential could not be decrypted.",
    );
  }

  try {
    return JSON.parse(plaintext) as unknown;
  } catch {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_payload_invalid",
      "Social connector credential payload is invalid.",
    );
  }
}

function encryptedCredentialPayload(value: Record<string, unknown>) {
  if (
    !value ||
    value.schema !== SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA ||
    value.algorithm !== SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM
  ) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_payload_invalid",
      "Social connector credential payload is invalid.",
    );
  }

  return {
    iv: boundedBase64UrlBuffer(value.iv, 12, 12),
    ciphertext: boundedBase64UrlBuffer(value.ciphertext, 1, 64 * 1024),
    authTag: boundedBase64UrlBuffer(value.authTag, 16, 16),
  };
}

function boundedBase64UrlBuffer(value: unknown, minBytes: number, maxBytes: number) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_payload_invalid",
      "Social connector credential payload is invalid.",
    );
  }
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value, "base64url");
  } catch {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_payload_invalid",
      "Social connector credential payload is invalid.",
    );
  }
  if (decoded.length < minBytes || decoded.length > maxBytes) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_payload_invalid",
      "Social connector credential payload is invalid.",
    );
  }
  return decoded;
}

function socialConnectorCredentialEncryptionKey() {
  const raw = process.env[SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV]?.trim();
  if (!raw) return null;
  if (raw.length < 32) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_encryption_malformed",
      `${SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV} must be at least 32 characters.`,
    );
  }
  return createHash("sha256").update(raw).digest();
}

function requiredSocialConnectorCredentialEncryptionKey() {
  const key = socialConnectorCredentialEncryptionKey();
  if (!key) {
    throw new SocialConnectorCredentialStorageError(
      "social_connector_credential_encryption_unconfigured",
      `${SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV} is required for social connector credentials.`,
    );
  }
  return key;
}

function stableSecretMaterial(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortJsonValue(entry)]),
    );
  }
  return value;
}
