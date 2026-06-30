import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "../../lib/supabase";
import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  type ArchiveConnectorProviderId,
} from "./credential-contract";
import {
  archiveConnectorAccountScopeReadback,
  archiveConnectorConnectionScopeState,
  archiveConnectorScopeProfileFromValue,
  archiveConnectorScopesForProfile,
  normalizeArchiveConnectorGrantedScopes,
  type ArchiveConnectorScopeProfile,
} from "./source-scope-contract";

export type ArchiveConnectorCredentialStatus = "active" | "revoked";
export type ArchiveConnectorCredentialStorageErrorCode =
  | "archive_connector_credential_encryption_unconfigured"
  | "archive_connector_credential_encryption_malformed"
  | "archive_connector_credential_write_failed"
  | "archive_connector_credential_load_failed"
  | "archive_connector_credential_revoke_failed"
  | "archive_connector_source_credential_provider_unsupported"
  | "archive_connector_source_credential_unavailable"
  | "archive_connector_source_credential_not_source_ready"
  | "archive_connector_source_credential_payload_invalid"
  | "archive_connector_source_credential_decrypt_failed"
  | "archive_connector_source_credential_token_invalid"
  | "archive_connector_oauth_state_write_failed"
  | "archive_connector_oauth_state_invalid";

export type ArchiveConnectorCredentialRow = {
  id?: string;
  owner_user_id: string;
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  encrypted_credential: Record<string, unknown>;
  credential_fingerprint: string;
  external_account_fingerprint: string | null;
  account_label: string | null;
  status: ArchiveConnectorCredentialStatus;
  scope_profile?: ArchiveConnectorScopeProfile | null;
  granted_scopes?: string[] | null;
  created_at?: string;
  updated_at?: string;
  rotated_at?: string | null;
  revoked_at?: string | null;
};

export type ArchiveConnectorOAuthStateRow = {
  id?: string;
  owner_user_id: string;
  session_id_hash: string;
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  nonce_hash: string;
  csrf_hash: string;
  local_redirect_path: string | null;
  expires_at: string;
  consumed_at?: string | null;
  scope_profile?: ArchiveConnectorScopeProfile | null;
  created_at?: string;
  updated_at?: string;
};

export type ArchiveConnectorCredentialReadback = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  status: ArchiveConnectorCredentialStatus;
  configured: boolean;
  accountLabel: string | null;
  fingerprintPresent: boolean;
  externalAccountFingerprintPresent: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  rotatedAt: string | null;
  revokedAt: string | null;
  scopeProfile: ArchiveConnectorScopeProfile;
  grantedScopes: string[];
  connectionScopeState: "account_proof_only" | "source_scope_ready" | "scope_missing";
  reconnectRequiredForSourceInventory: boolean;
};

export type ArchiveConnectorOAuthStateReadback = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  expiresAt: string;
  consumedAt: string | null;
  localRedirectPath: string | null;
  scopeProfile: ArchiveConnectorScopeProfile;
};

export type ArchiveConnectorSourceCredentialSecret = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  scopeProfile: "source_inventory";
  grantedScopes: string[];
  tokenType: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number | null;
};

export class ArchiveConnectorCredentialStorageError extends Error {
  constructor(public readonly code: ArchiveConnectorCredentialStorageErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorCredentialStorageError";
  }
}

const ARCHIVE_CONNECTOR_CREDENTIAL_SCHEMA = "station.archive_connector.credential.v1";
const ARCHIVE_CONNECTOR_CREDENTIAL_ALGORITHM = "aes-256-gcm";
const ARCHIVE_CONNECTOR_CREDENTIAL_KEY_ENV = "ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY";
const ARCHIVE_CONNECTOR_PURPOSE = "archive_connector" as const;

export function archiveConnectorCredentialEncryptionConfigured() {
  try {
    return Boolean(archiveConnectorCredentialEncryptionKey());
  } catch {
    return false;
  }
}

export function encryptArchiveConnectorCredential(secretMaterial: unknown) {
  const key = requiredArchiveConnectorCredentialEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ARCHIVE_CONNECTOR_CREDENTIAL_ALGORITHM, key, iv);
  const plaintext = stableSecretMaterial(secretMaterial);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    schema: ARCHIVE_CONNECTOR_CREDENTIAL_SCHEMA,
    algorithm: ARCHIVE_CONNECTOR_CREDENTIAL_ALGORITHM,
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

export function fingerprintArchiveConnectorCredential(provider: ArchiveConnectorProviderId, secretMaterial: unknown) {
  return createHash("sha256")
    .update(`station.archive_connector.credential:${provider}:${stableSecretMaterial(secretMaterial)}`)
    .digest("hex")
    .slice(0, 16);
}

export function fingerprintArchiveConnectorExternalAccount(provider: ArchiveConnectorProviderId, rawExternalAccountId: string | null | undefined) {
  const trimmed = rawExternalAccountId?.trim();
  if (!trimmed) return null;
  return createHash("sha256")
    .update(`station.archive_connector.external_account:${provider}:${trimmed}`)
    .digest("hex")
    .slice(0, 16);
}

export function sanitizeArchiveConnectorAccountLabel(value: string | null | undefined) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (/token|secret|cookie|credential|oauth|code|private|source|body|snippet|payload|external|account[_ -]?id|bearer|sk-/i.test(trimmed)) {
    return null;
  }
  return trimmed.slice(0, 80);
}

export async function storeArchiveConnectorCredential(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
  secretMaterial: unknown;
  scopeProfile?: ArchiveConnectorScopeProfile;
  grantedScopes?: string[] | null;
  accountLabel?: string | null;
  rawExternalAccountId?: string | null;
}) {
  const sb = getSupabaseAdmin();
  const activeRows = await loadArchiveConnectorCredentialRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: false,
  });
  const encryptedCredential = encryptArchiveConnectorCredential(input.secretMaterial);
  const credentialFingerprint = fingerprintArchiveConnectorCredential(input.provider, input.secretMaterial);
  const externalAccountFingerprint = fingerprintArchiveConnectorExternalAccount(input.provider, input.rawExternalAccountId);
  const accountLabel = sanitizeArchiveConnectorAccountLabel(input.accountLabel);
  const scopeProfile = scopeProfileFromCredentialInput(input.scopeProfile);
  const grantedScopes = grantedScopesFromCredentialInput(input.provider, input.grantedScopes);
  const now = new Date().toISOString();

  await revokeActiveArchiveConnectorCredentialRows(input.ownerUserId, input.provider, now);

  const { data, error } = await (sb as any)
    .from("archive_connector_credentials")
    .insert({
      owner_user_id: input.ownerUserId,
      provider: input.provider,
      purpose: ARCHIVE_CONNECTOR_PURPOSE,
      encrypted_credential: encryptedCredential,
      credential_fingerprint: credentialFingerprint,
      external_account_fingerprint: externalAccountFingerprint,
      account_label: accountLabel,
      status: "active",
      scope_profile: scopeProfile,
      granted_scopes: grantedScopes,
      rotated_at: activeRows.length > 0 ? now : null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_credential_write_failed",
      "Could not save archive connector credential."
    );
  }

  return serializeArchiveConnectorCredentialReadback(data as ArchiveConnectorCredentialRow);
}

export async function loadArchiveConnectorCredentialReadbacks(ownerUserId: string) {
  const rows = await loadArchiveConnectorCredentialRows(ownerUserId, { includeRevoked: true });
  return rows
    .filter((row) => isArchiveConnectorProviderId(row.provider))
    .map(serializeArchiveConnectorCredentialReadback);
}

export async function revokeArchiveConnectorCredential(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
}) {
  const now = new Date().toISOString();
  await revokeActiveArchiveConnectorCredentialRows(input.ownerUserId, input.provider, now);
  const rows = await loadArchiveConnectorCredentialRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: true,
  });
  return rows
    .filter((row) => isArchiveConnectorProviderId(row.provider))
    .map(serializeArchiveConnectorCredentialReadback);
}

export async function loadArchiveConnectorSourceCredentialSecret(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
}): Promise<ArchiveConnectorSourceCredentialSecret> {
  if (!isArchiveConnectorProviderId(input.provider)) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_source_credential_provider_unsupported",
      "Archive connector provider is not supported."
    );
  }

  const rows = await loadArchiveConnectorCredentialRows(input.ownerUserId, {
    provider: input.provider,
    includeRevoked: false,
  });
  if (rows.length !== 1) throw sourceCredentialUnavailable();

  const row = rows[0];
  if (
    row.owner_user_id !== input.ownerUserId ||
    row.provider !== input.provider ||
    row.purpose !== ARCHIVE_CONNECTOR_PURPOSE ||
    row.status !== "active"
  ) {
    throw sourceCredentialUnavailable();
  }

  assertStoredSourceCredentialReady(row);
  const decrypted = decryptArchiveConnectorCredential(row.encrypted_credential);
  return sourceCredentialSecretFromTokenMaterial(input.provider, decrypted);
}

export function serializeArchiveConnectorCredentialReadback(row: ArchiveConnectorCredentialRow): ArchiveConnectorCredentialReadback {
  const scopeProfile = archiveConnectorScopeProfileFromValue(row.scope_profile) ?? "connect";
  const grantedScopes = normalizeArchiveConnectorGrantedScopes(
    row.provider,
    row.granted_scopes && row.granted_scopes.length > 0
      ? row.granted_scopes
      : archiveConnectorScopesForProfile(row.provider, "connect"),
  );
  const scopeState = archiveConnectorAccountScopeReadback({
    provider: row.provider,
    grantedScopes,
    accountLabel: row.account_label,
    externalAccountFingerprintPresent: Boolean(row.external_account_fingerprint),
  });

  return {
    provider: row.provider,
    purpose: ARCHIVE_CONNECTOR_PURPOSE,
    status: row.status,
    configured: row.status === "active",
    accountLabel: row.account_label ?? null,
    fingerprintPresent: Boolean(row.credential_fingerprint),
    externalAccountFingerprintPresent: Boolean(row.external_account_fingerprint),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    rotatedAt: row.rotated_at ?? null,
    revokedAt: row.revoked_at ?? null,
    scopeProfile,
    grantedScopes: scopeState.connectionScopeState === "source_scope_ready"
      ? grantedScopes
      : archiveConnectorScopesForProfile(row.provider, "connect"),
    connectionScopeState: scopeState.connectionScopeState,
    reconnectRequiredForSourceInventory: scopeState.reconnectRequiredForSourceInventory,
  };
}

function assertStoredSourceCredentialReady(row: ArchiveConnectorCredentialRow) {
  const scopeProfile = archiveConnectorScopeProfileFromValue(row.scope_profile);
  const grantedScopes = normalizeArchiveConnectorGrantedScopes(row.provider, row.granted_scopes);
  const scopeState = archiveConnectorConnectionScopeState({
    provider: row.provider,
    grantedScopes,
  });

  if (
    scopeProfile !== "source_inventory" ||
    scopeState.connectionScopeState !== "source_scope_ready" ||
    !sameScopeSet(grantedScopes, archiveConnectorScopesForProfile(row.provider, "source_inventory"))
  ) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_source_credential_not_source_ready",
      "Archive connector source credential is not source-ready."
    );
  }
}

function decryptArchiveConnectorCredential(encryptedCredential: Record<string, unknown>) {
  const encrypted = encryptedCredentialPayload(encryptedCredential);
  const key = requiredArchiveConnectorCredentialEncryptionKey();

  let plaintext: string;
  try {
    const decipher = createDecipheriv(ARCHIVE_CONNECTOR_CREDENTIAL_ALGORITHM, key, encrypted.iv);
    decipher.setAuthTag(encrypted.authTag);
    plaintext = Buffer.concat([
      decipher.update(encrypted.ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_source_credential_decrypt_failed",
      "Archive connector source credential could not be decrypted."
    );
  }

  try {
    return JSON.parse(plaintext) as unknown;
  } catch {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_source_credential_payload_invalid",
      "Archive connector source credential payload is invalid."
    );
  }
}

function encryptedCredentialPayload(value: Record<string, unknown>) {
  if (
    !value ||
    value.schema !== ARCHIVE_CONNECTOR_CREDENTIAL_SCHEMA ||
    value.algorithm !== ARCHIVE_CONNECTOR_CREDENTIAL_ALGORITHM
  ) {
    throw sourceCredentialPayloadInvalid();
  }

  return {
    iv: boundedBase64UrlBuffer(value.iv, 12, 12),
    ciphertext: boundedBase64UrlBuffer(value.ciphertext, 1, 64 * 1024),
    authTag: boundedBase64UrlBuffer(value.authTag, 16, 16),
  };
}

function boundedBase64UrlBuffer(value: unknown, minBytes: number, maxBytes: number) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw sourceCredentialPayloadInvalid();
  }
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value, "base64url");
  } catch {
    throw sourceCredentialPayloadInvalid();
  }
  if (decoded.length < minBytes || decoded.length > maxBytes) throw sourceCredentialPayloadInvalid();
  return decoded;
}

function sourceCredentialSecretFromTokenMaterial(
  provider: ArchiveConnectorProviderId,
  value: unknown,
): ArchiveConnectorSourceCredentialSecret {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw sourceCredentialTokenInvalid();
  const material = value as Record<string, unknown>;
  if (
    material.schema !== "station.archive_connector.oauth_token.v1" ||
    material.provider !== provider ||
    material.scopeProfile !== "source_inventory"
  ) {
    throw sourceCredentialTokenInvalid();
  }

  const tokenGrantedScopes = arrayOfStrings(material.grantedScopes);
  const grantedScopes = normalizeArchiveConnectorGrantedScopes(provider, tokenGrantedScopes);
  if (
    !sameScopeSet(grantedScopes, archiveConnectorScopesForProfile(provider, "source_inventory")) ||
    tokenGrantedScopes.some((scope) => !grantedScopes.includes(scope.trim()))
  ) {
    throw sourceCredentialTokenInvalid();
  }

  const accessToken = boundedSecretToken(material.accessToken);
  if (!accessToken) throw sourceCredentialTokenInvalid();

  return {
    provider,
    purpose: ARCHIVE_CONNECTOR_PURPOSE,
    scopeProfile: "source_inventory",
    grantedScopes,
    tokenType: boundedNullableLabel(material.tokenType, 40),
    accessToken,
    refreshToken: boundedNullableSecretToken(material.refreshToken),
    expiresInSeconds: boundedNullableExpiresIn(material.expiresInSeconds),
  };
}

function scopeProfileFromCredentialInput(
  explicitScopeProfile: ArchiveConnectorScopeProfile | undefined,
) {
  if (explicitScopeProfile) return explicitScopeProfile;
  return "connect" satisfies ArchiveConnectorScopeProfile;
}

function grantedScopesFromCredentialInput(
  provider: ArchiveConnectorProviderId,
  explicitGrantedScopes: string[] | null | undefined,
) {
  const normalized = normalizeArchiveConnectorGrantedScopes(
    provider,
    explicitGrantedScopes ?? archiveConnectorScopesForProfile(provider, "connect"),
  );
  const scopeState = archiveConnectorConnectionScopeState({ provider, grantedScopes: normalized });
  return scopeState.connectionScopeState === "source_scope_ready"
    ? archiveConnectorScopesForProfile(provider, "source_inventory")
    : archiveConnectorScopesForProfile(provider, "connect");
}

export async function createArchiveConnectorOAuthState(input: {
  ownerUserId: string;
  sessionId: string;
  provider: ArchiveConnectorProviderId;
  nonce: string;
  csrf: string;
  expiresAt: string;
  localRedirectPath?: string | null;
  scopeProfile?: ArchiveConnectorScopeProfile;
}) {
  const sb = getSupabaseAdmin();
  const localRedirectPath = sanitizeLocalRedirectPath(input.localRedirectPath);
  const { data, error } = await (sb as any)
    .from("archive_connector_oauth_states")
    .insert({
      owner_user_id: input.ownerUserId,
      session_id_hash: hashArchiveConnectorOAuthValue("session", input.sessionId),
      provider: input.provider,
      purpose: ARCHIVE_CONNECTOR_PURPOSE,
      nonce_hash: hashArchiveConnectorOAuthValue("nonce", input.nonce),
      csrf_hash: hashArchiveConnectorOAuthValue("csrf", input.csrf),
      local_redirect_path: localRedirectPath,
      expires_at: input.expiresAt,
      consumed_at: null,
      scope_profile: input.scopeProfile ?? "connect",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_oauth_state_write_failed",
      "Could not save archive connector OAuth state."
    );
  }

  return serializeArchiveConnectorOAuthStateReadback(data as ArchiveConnectorOAuthStateRow);
}

export async function consumeArchiveConnectorOAuthState(input: {
  ownerUserId: string;
  sessionId: string;
  provider: ArchiveConnectorProviderId;
  nonce: string;
  csrf: string;
  now?: string;
}) {
  const row = await loadValidArchiveConnectorOAuthState(input);
  const sb = getSupabaseAdmin();
  const consumedAt = input.now ?? new Date().toISOString();
  const { data: updated, error: updateError } = await (sb as any)
    .from("archive_connector_oauth_states")
    .update({ consumed_at: consumedAt })
    .eq("id", row.id)
    .eq("consumed_at", null)
    .select("*")
    .single();

  if (updateError || !updated) throw invalidOAuthState();
  return serializeArchiveConnectorOAuthStateReadback(updated as ArchiveConnectorOAuthStateRow);
}

export async function validateArchiveConnectorOAuthState(input: {
  ownerUserId: string;
  sessionId: string;
  provider: ArchiveConnectorProviderId;
  nonce: string;
  csrf: string;
  now?: string;
}) {
  const row = await loadValidArchiveConnectorOAuthState(input);
  return serializeArchiveConnectorOAuthStateReadback(row);
}

export function serializeArchiveConnectorOAuthStateReadback(row: ArchiveConnectorOAuthStateRow): ArchiveConnectorOAuthStateReadback {
  return {
    provider: row.provider,
    purpose: ARCHIVE_CONNECTOR_PURPOSE,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at ?? null,
    localRedirectPath: row.local_redirect_path ?? null,
    scopeProfile: archiveConnectorScopeProfileFromValue(row.scope_profile) ?? "connect",
  };
}

function archiveConnectorCredentialEncryptionKey() {
  const raw = process.env[ARCHIVE_CONNECTOR_CREDENTIAL_KEY_ENV]?.trim();
  if (!raw) return null;
  if (raw.length < 32) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_credential_encryption_malformed",
      `${ARCHIVE_CONNECTOR_CREDENTIAL_KEY_ENV} must be at least 32 characters.`
    );
  }
  return createHash("sha256").update(raw).digest();
}

function requiredArchiveConnectorCredentialEncryptionKey() {
  const key = archiveConnectorCredentialEncryptionKey();
  if (!key) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_credential_encryption_unconfigured",
      `${ARCHIVE_CONNECTOR_CREDENTIAL_KEY_ENV} is required for archive connector credentials.`
    );
  }
  return key;
}

async function loadArchiveConnectorCredentialRows(
  ownerUserId: string,
  options: { provider?: ArchiveConnectorProviderId; includeRevoked: boolean }
) {
  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("archive_connector_credentials")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("purpose", ARCHIVE_CONNECTOR_PURPOSE);

  if (options.provider) query = query.eq("provider", options.provider);
  if (!options.includeRevoked) query = query.eq("status", "active");

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_credential_load_failed",
      "Could not load archive connector credential metadata."
    );
  }
  return (data ?? []) as ArchiveConnectorCredentialRow[];
}

async function revokeActiveArchiveConnectorCredentialRows(
  ownerUserId: string,
  provider: ArchiveConnectorProviderId,
  revokedAt: string
) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("archive_connector_credentials")
    .update({ status: "revoked", revoked_at: revokedAt })
    .eq("owner_user_id", ownerUserId)
    .eq("provider", provider)
    .eq("purpose", ARCHIVE_CONNECTOR_PURPOSE)
    .eq("status", "active");

  if (error) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_credential_revoke_failed",
      "Could not revoke archive connector credential."
    );
  }
}

async function loadValidArchiveConnectorOAuthState(input: {
  ownerUserId: string;
  sessionId: string;
  provider: ArchiveConnectorProviderId;
  nonce: string;
  csrf: string;
  now?: string;
}) {
  const sb = getSupabaseAdmin();
  const nonceHash = hashArchiveConnectorOAuthValue("nonce", input.nonce);
  const csrfHash = hashArchiveConnectorOAuthValue("csrf", input.csrf);
  const sessionIdHash = hashArchiveConnectorOAuthValue("session", input.sessionId);
  const { data, error } = await (sb as any)
    .from("archive_connector_oauth_states")
    .select("*")
    .eq("nonce_hash", nonceHash)
    .eq("provider", input.provider)
    .eq("purpose", ARCHIVE_CONNECTOR_PURPOSE)
    .single();

  if (error || !data) throw invalidOAuthState();

  const row = data as ArchiveConnectorOAuthStateRow;
  if (
    row.owner_user_id !== input.ownerUserId ||
    row.session_id_hash !== sessionIdHash ||
    row.provider !== input.provider ||
    row.purpose !== ARCHIVE_CONNECTOR_PURPOSE ||
    row.csrf_hash !== csrfHash ||
    row.consumed_at ||
    Date.parse(row.expires_at) <= Date.parse(input.now ?? new Date().toISOString())
  ) {
    throw invalidOAuthState();
  }

  return row;
}

function hashArchiveConnectorOAuthValue(kind: "session" | "nonce" | "csrf", value: string) {
  return createHash("sha256")
    .update(`station.archive_connector.oauth.${kind}:${value}`)
    .digest("hex");
}

function sanitizeLocalRedirectPath(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    throw new ArchiveConnectorCredentialStorageError(
      "archive_connector_oauth_state_invalid",
      "Archive connector OAuth redirect must be a local path."
    );
  }
  return trimmed.slice(0, 200);
}

function arrayOfStrings(value: unknown) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw sourceCredentialTokenInvalid();
  }
  return value as string[];
}

function boundedSecretToken(value: unknown) {
  if (typeof value !== "string") return null;
  if (value.length < 1 || value.length > 4096 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}

function boundedNullableSecretToken(value: unknown) {
  if (value == null) return null;
  const token = boundedSecretToken(value);
  if (!token) throw sourceCredentialTokenInvalid();
  return token;
}

function boundedNullableLabel(value: unknown, maxLength: number) {
  if (value == null) return null;
  if (typeof value !== "string") throw sourceCredentialTokenInvalid();
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw sourceCredentialTokenInvalid();
  }
  return trimmed;
}

function boundedNullableExpiresIn(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 315_360_000) {
    throw sourceCredentialTokenInvalid();
  }
  return Math.floor(value);
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
        .map(([key, entry]) => [key, sortJsonValue(entry)])
    );
  }
  return value;
}

function invalidOAuthState() {
  return new ArchiveConnectorCredentialStorageError(
    "archive_connector_oauth_state_invalid",
    "Archive connector OAuth state is invalid or expired."
  );
}

function isArchiveConnectorProviderId(value: unknown): value is ArchiveConnectorProviderId {
  return ARCHIVE_CONNECTOR_PROVIDER_IDS.includes(value as ArchiveConnectorProviderId);
}

function sameScopeSet(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && right.every((scope) => left.includes(scope));
}

function sourceCredentialUnavailable() {
  return new ArchiveConnectorCredentialStorageError(
    "archive_connector_source_credential_unavailable",
    "Archive connector source credential is unavailable."
  );
}

function sourceCredentialPayloadInvalid() {
  return new ArchiveConnectorCredentialStorageError(
    "archive_connector_source_credential_payload_invalid",
    "Archive connector source credential payload is invalid."
  );
}

function sourceCredentialTokenInvalid() {
  return new ArchiveConnectorCredentialStorageError(
    "archive_connector_source_credential_token_invalid",
    "Archive connector source credential token material is invalid."
  );
}
