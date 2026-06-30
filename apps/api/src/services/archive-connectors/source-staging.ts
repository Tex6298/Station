import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "crypto";
import { getSupabaseAdmin } from "../../lib/supabase";
import {
  fingerprintArchiveConnectorExternalAccount,
  loadArchiveConnectorSourcePreviewCredentialSecret,
} from "./credential-storage";
import {
  loadArchiveConnectorImportIntentForSourcePreview,
  serializeArchiveConnectorImportIntent,
  type ArchiveConnectorImportIntentReadback,
  type ArchiveConnectorImportIntentRow,
} from "./import-intents";

export type ArchiveConnectorSourceStagingRunStatus = "staged" | "superseded" | "revoked";

export type ArchiveConnectorSourceStagingRunRow = {
  id: string;
  owner_user_id: string;
  persona_id: string;
  import_intent_id: string;
  provider: "reddit";
  purpose: "archive_connector";
  source_family: "reddit_user_history";
  source_kind: "saved_items";
  source_key: string;
  source_label: string;
  status: ArchiveConnectorSourceStagingRunStatus;
  page_limit: 10;
  item_count: number;
  post_count: number;
  comment_count: number;
  skipped_count: number;
  truncated: boolean;
  source_snapshot_fingerprint: string;
  encrypted_source_batch: Record<string, unknown>;
  source_read_at: string;
  expires_at: string;
  superseded_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArchiveConnectorSourceStagingRunReadback = {
  id: string;
  provider: "reddit";
  purpose: "archive_connector";
  personaId: string;
  importIntentId: string;
  sourceFamily: "reddit_user_history";
  sourceKind: "saved_items";
  sourceKey: string;
  sourceLabel: string;
  status: ArchiveConnectorSourceStagingRunStatus;
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  skippedCount: number;
  truncated: boolean;
  sourceReadAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveConnectorSourceStagingResult = {
  created: boolean;
  duplicate: boolean;
  staged: boolean;
  intent: ArchiveConnectorImportIntentReadback;
  run: ArchiveConnectorSourceStagingRunReadback;
};

export type ArchiveConnectorSourceStagingErrorCode =
  | "archive_connector_source_staging_encryption_unconfigured"
  | "archive_connector_source_staging_encryption_malformed"
  | "archive_connector_source_staging_account_mismatch"
  | "archive_connector_source_staging_reconnect_required"
  | "archive_connector_source_staging_rate_limited"
  | "archive_connector_source_staging_provider_failed"
  | "archive_connector_source_staging_provider_response_invalid"
  | "archive_connector_source_staging_no_stageable_items"
  | "archive_connector_source_staging_load_failed"
  | "archive_connector_source_staging_write_failed";

export class ArchiveConnectorSourceStagingError extends Error {
  constructor(public readonly code: ArchiveConnectorSourceStagingErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorSourceStagingError";
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const SOURCE_STAGING_BATCH_SCHEMA = "station.archive_connector.source_staging_batch.v1";
const SOURCE_STAGING_SNAPSHOT_SCHEMA = "station.archive_connector.source_staging_snapshot.v1";
const SOURCE_STAGING_ALGORITHM = "aes-256-gcm";
const SOURCE_STAGING_KEY_ENV = "ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY";
const SOURCE_STAGING_TIMEOUT_MS = 5000;
const SOURCE_STAGING_PAGE_LIMIT = 10 as const;
const SOURCE_STAGING_MAX_ITEM_TEXT_LENGTH = 8000;
const SOURCE_STAGING_MAX_TOTAL_TEXT_LENGTH = 40_000;
const SOURCE_STAGING_TTL_MS = 24 * 60 * 60 * 1000;
const REDDIT_SOURCE_STAGING_USER_AGENT = "StationArchiveConnector/1.0 source-staging";

let sourceStagingFetch: FetchLike = (input, init) => fetch(input, init);

export function setArchiveConnectorSourceStagingFetchForTests(fetcher: FetchLike | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setArchiveConnectorSourceStagingFetchForTests can only be used while NODE_ENV is test.");
  }
  sourceStagingFetch = fetcher ?? ((input, init) => fetch(input, init));
}

export async function createArchiveConnectorSourceStagingRun(input: {
  ownerUserId: string;
  intentId: string;
}): Promise<ArchiveConnectorSourceStagingResult> {
  const intent = await loadArchiveConnectorImportIntentForSourcePreview(input);
  const key = requiredArchiveConnectorSourceStagingEncryptionKey();
  const credential = await loadArchiveConnectorSourcePreviewCredentialSecret({
    ownerUserId: input.ownerUserId,
    provider: intent.provider,
  });
  const snapshot = await readRedditSavedItemsSourceStagingSnapshot({
    accessToken: credential.accessToken,
    externalAccountFingerprint: credential.externalAccountFingerprint,
    key,
  });
  if (snapshot.items.length === 0) throw noStageableItems();

  const sourceReadAt = new Date();
  const sourceReadAtIso = sourceReadAt.toISOString();
  const expiresAtIso = new Date(sourceReadAt.getTime() + SOURCE_STAGING_TTL_MS).toISOString();
  const sourceSnapshotFingerprint = sourceStagingSnapshotFingerprint(key, {
    ownerUserId: input.ownerUserId,
    intent,
    truncated: snapshot.truncated,
    items: snapshot.items,
  });

  const existing = await loadExistingStagingRun({
    ownerUserId: input.ownerUserId,
    importIntentId: intent.id,
    sourceSnapshotFingerprint,
    nowIso: sourceReadAtIso,
  });
  if (existing) {
    return {
      created: false,
      duplicate: true,
      staged: false,
      intent: serializeArchiveConnectorImportIntent(intent),
      run: serializeArchiveConnectorSourceStagingRun(existing),
    };
  }

  await supersedeStaleMatchingStagingRuns({
    ownerUserId: input.ownerUserId,
    importIntentId: intent.id,
    sourceSnapshotFingerprint,
    nowIso: sourceReadAtIso,
  });

  const encryptedSourceBatch = encryptArchiveConnectorSourceStagingBatch({
    schema: SOURCE_STAGING_BATCH_SCHEMA,
    provider: "reddit",
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    pageLimit: SOURCE_STAGING_PAGE_LIMIT,
    truncated: snapshot.truncated,
    items: snapshot.items,
  }, key);

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .insert({
      owner_user_id: input.ownerUserId,
      persona_id: intent.persona_id,
      import_intent_id: intent.id,
      provider: "reddit",
      purpose: "archive_connector",
      source_family: "reddit_user_history",
      source_kind: "saved_items",
      source_key: intent.source_key,
      source_label: intent.source_label,
      status: "staged",
      page_limit: SOURCE_STAGING_PAGE_LIMIT,
      item_count: snapshot.items.length,
      post_count: snapshot.postCount,
      comment_count: snapshot.commentCount,
      skipped_count: snapshot.skippedCount,
      truncated: snapshot.truncated,
      source_snapshot_fingerprint: sourceSnapshotFingerprint,
      encrypted_source_batch: encryptedSourceBatch,
      source_read_at: sourceReadAtIso,
      expires_at: expiresAtIso,
    })
    .select("*")
    .single();

  if (error || !data) {
    const duplicate = await loadExistingStagingRun({
      ownerUserId: input.ownerUserId,
      importIntentId: intent.id,
      sourceSnapshotFingerprint,
      nowIso: sourceReadAtIso,
    });
    if (duplicate) {
      return {
        created: false,
        duplicate: true,
        staged: false,
        intent: serializeArchiveConnectorImportIntent(intent),
        run: serializeArchiveConnectorSourceStagingRun(duplicate),
      };
    }

    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_write_failed",
      "Could not write archive connector source staging run."
    );
  }

  const stagedRun = data as ArchiveConnectorSourceStagingRunRow;
  await supersedeCurrentStagingRuns({
    ownerUserId: input.ownerUserId,
    importIntentId: intent.id,
    nowIso: sourceReadAtIso,
    exceptRunId: stagedRun.id,
  });

  return {
    created: true,
    duplicate: false,
    staged: true,
    intent: serializeArchiveConnectorImportIntent(intent),
    run: serializeArchiveConnectorSourceStagingRun(stagedRun),
  };
}

export async function revokeArchiveConnectorSourceStagingRunsForProvider(input: {
  ownerUserId: string;
  provider: string;
}) {
  if (input.provider !== "reddit") return;

  const nowIso = new Date().toISOString();
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .update({
      status: "revoked",
      revoked_at: nowIso,
    })
    .eq("owner_user_id", input.ownerUserId)
    .eq("provider", "reddit")
    .eq("purpose", "archive_connector")
    .eq("status", "staged")
    .gt("expires_at", nowIso);

  if (error) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_write_failed",
      "Could not revoke archive connector source staging runs."
    );
  }
}

export function decryptArchiveConnectorSourceStagingBatchForTests(value: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("decryptArchiveConnectorSourceStagingBatchForTests can only be used while NODE_ENV is test.");
  }
  const key = requiredArchiveConnectorSourceStagingEncryptionKey();
  const encrypted = encryptedSourceStagingPayload(value);
  const decipher = createDecipheriv(SOURCE_STAGING_ALGORITHM, key, encrypted.iv);
  decipher.setAuthTag(encrypted.authTag);
  const plaintext = Buffer.concat([
    decipher.update(encrypted.ciphertext),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plaintext) as unknown;
}

function encryptArchiveConnectorSourceStagingBatch(value: unknown, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(SOURCE_STAGING_ALGORITHM, key, iv);
  const plaintext = stableSourceStagingMaterial(value);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    schema: SOURCE_STAGING_BATCH_SCHEMA,
    algorithm: SOURCE_STAGING_ALGORITHM,
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

function archiveConnectorSourceStagingEncryptionKey() {
  const raw = process.env[SOURCE_STAGING_KEY_ENV]?.trim();
  if (!raw) return null;
  if (raw.length < 32) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_malformed",
      `${SOURCE_STAGING_KEY_ENV} must be at least 32 characters.`
    );
  }
  return createHash("sha256").update(raw).digest();
}

function requiredArchiveConnectorSourceStagingEncryptionKey() {
  const key = archiveConnectorSourceStagingEncryptionKey();
  if (!key) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_unconfigured",
      `${SOURCE_STAGING_KEY_ENV} is required for archive connector source staging.`
    );
  }
  return key;
}

async function readRedditSavedItemsSourceStagingSnapshot(input: {
  accessToken: string;
  externalAccountFingerprint: string;
  key: Buffer;
}) {
  const identity = await sourceStagingRequest("https://oauth.reddit.com/api/v1/me?raw_json=1", {
    method: "GET",
    headers: redditSourceStagingHeaders(input.accessToken),
  });
  const account = redditIdentityFromPayload(identity);
  const liveFingerprint = fingerprintArchiveConnectorExternalAccount("reddit", account.rawExternalAccountId);
  if (liveFingerprint !== input.externalAccountFingerprint) throw accountMismatch();

  const saved = await sourceStagingRequest(
    `https://oauth.reddit.com/user/${encodeURIComponent(account.username)}/saved?limit=10&raw_json=1`,
    {
      method: "GET",
      headers: redditSourceStagingHeaders(input.accessToken),
    },
  );
  return redditSavedItemsStagingSnapshotFromPayload(saved, input.key);
}

async function sourceStagingRequest(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_STAGING_TIMEOUT_MS);

  let response: Response;
  try {
    response = await sourceStagingFetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    throw providerFailed();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_reconnect_required",
      "Archive connector source staging requires reconnect."
    );
  }
  if (response.status === 429) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_rate_limited",
      "Archive connector source staging was rate limited."
    );
  }
  if (!response.ok) throw providerFailed();

  try {
    return await response.json() as unknown;
  } catch {
    throw providerResponseInvalid();
  }
}

function redditSourceStagingHeaders(accessToken: string) {
  return {
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "User-Agent": REDDIT_SOURCE_STAGING_USER_AGENT,
  };
}

function redditIdentityFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw providerResponseInvalid();
  const record = payload as Record<string, unknown>;
  return {
    rawExternalAccountId: rawAccountIdFromValue(record.id),
    username: redditUsernameFromValue(record.name),
  };
}

function redditSavedItemsStagingSnapshotFromPayload(payload: unknown, key: Buffer) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw providerResponseInvalid();
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw providerResponseInvalid();

  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.children)) throw providerResponseInvalid();
  const after = record.after;
  if (after != null && typeof after !== "string") throw providerResponseInvalid();

  let totalTextLength = 0;
  let skippedCount = 0;
  const items: Array<{
    ordinal: number;
    kind: "post" | "comment";
    normalizedText: string;
    itemFingerprint: string;
  }> = [];

  for (const [index, child] of record.children.slice(0, SOURCE_STAGING_PAGE_LIMIT).entries()) {
    const normalized = normalizedStagingItem(child);
    if (!normalized) {
      skippedCount += 1;
      continue;
    }

    const remaining = SOURCE_STAGING_MAX_TOTAL_TEXT_LENGTH - totalTextLength;
    if (remaining <= 0) {
      skippedCount += 1;
      continue;
    }

    const boundedText = normalized.normalizedText.length > remaining
      ? normalized.normalizedText.slice(0, remaining).trim()
      : normalized.normalizedText;
    if (!boundedText) {
      skippedCount += 1;
      continue;
    }

    totalTextLength += boundedText.length;
    items.push({
      ordinal: index + 1,
      kind: normalized.kind,
      normalizedText: boundedText,
      itemFingerprint: keyedDigest(key, stableSourceStagingMaterial({
        kind: normalized.kind,
        normalizedText: boundedText,
      })),
    });
  }

  const postCount = items.filter((item) => item.kind === "post").length;
  const commentCount = items.filter((item) => item.kind === "comment").length;
  return {
    items,
    postCount,
    commentCount,
    skippedCount,
    truncated: typeof after === "string" && after.trim().length > 0,
  };
}

function normalizedStagingItem(child: unknown) {
  if (!child || typeof child !== "object" || Array.isArray(child)) return null;
  const record = child as Record<string, unknown>;
  const kind = record.kind;
  const data = record.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const item = data as Record<string, unknown>;

  if (kind === "t3") {
    const normalizedText = boundedNormalizedSourceText([
      textValue(item.title),
      textValue(item.selftext),
    ].filter(Boolean).join(" "));
    return normalizedText ? { kind: "post" as const, normalizedText } : null;
  }

  if (kind === "t1") {
    const normalizedText = boundedNormalizedSourceText(textValue(item.body));
    return normalizedText ? { kind: "comment" as const, normalizedText } : null;
  }

  return null;
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function boundedNormalizedSourceText(value: string) {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SOURCE_STAGING_MAX_ITEM_TEXT_LENGTH)
    .trim();
  return normalized || null;
}

function sourceStagingSnapshotFingerprint(
  key: Buffer,
  input: {
    ownerUserId: string;
    intent: ArchiveConnectorImportIntentRow;
    truncated: boolean;
    items: Array<{ kind: "post" | "comment"; itemFingerprint: string }>;
  },
) {
  return keyedDigest(key, stableSourceStagingMaterial({
    schema: SOURCE_STAGING_SNAPSHOT_SCHEMA,
    ownerUserId: input.ownerUserId,
    importIntentId: input.intent.id,
    provider: input.intent.provider,
    sourceKey: input.intent.source_key,
    truncated: input.truncated,
    items: input.items.map((item) => ({
      kind: item.kind,
      itemFingerprint: item.itemFingerprint,
    })),
  }));
}

async function loadExistingStagingRun(input: {
  ownerUserId: string;
  importIntentId: string;
  sourceSnapshotFingerprint: string;
  nowIso: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .select("*")
    .eq("owner_user_id", input.ownerUserId)
    .eq("import_intent_id", input.importIntentId)
    .eq("source_snapshot_fingerprint", input.sourceSnapshotFingerprint)
    .eq("status", "staged")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_load_failed",
      "Could not load archive connector source staging runs."
    );
  }

  return ((data ?? []) as ArchiveConnectorSourceStagingRunRow[])
    .find((row) => Date.parse(row.expires_at) > Date.parse(input.nowIso)) ?? null;
}

async function supersedeStaleMatchingStagingRuns(input: {
  ownerUserId: string;
  importIntentId: string;
  sourceSnapshotFingerprint: string;
  nowIso: string;
}) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .update({
      status: "superseded",
      superseded_at: input.nowIso,
    })
    .eq("owner_user_id", input.ownerUserId)
    .eq("import_intent_id", input.importIntentId)
    .eq("source_snapshot_fingerprint", input.sourceSnapshotFingerprint)
    .eq("status", "staged");

  if (error) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_write_failed",
      "Could not supersede stale archive connector source staging runs."
    );
  }
}

async function supersedeCurrentStagingRuns(input: {
  ownerUserId: string;
  importIntentId: string;
  nowIso: string;
  exceptRunId: string;
}) {
  const sb = getSupabaseAdmin();
  const { error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .update({
      status: "superseded",
      superseded_at: input.nowIso,
    })
    .eq("owner_user_id", input.ownerUserId)
    .eq("import_intent_id", input.importIntentId)
    .eq("status", "staged")
    .neq("id", input.exceptRunId)
    .gt("expires_at", input.nowIso);

  if (error) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_write_failed",
      "Could not supersede archive connector source staging runs."
    );
  }
}

export function serializeArchiveConnectorSourceStagingRun(
  row: ArchiveConnectorSourceStagingRunRow,
): ArchiveConnectorSourceStagingRunReadback {
  return {
    id: row.id,
    provider: "reddit",
    purpose: "archive_connector",
    personaId: row.persona_id,
    importIntentId: row.import_intent_id,
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
    status: row.status,
    pageLimit: 10,
    itemCount: row.item_count,
    postCount: row.post_count,
    commentCount: row.comment_count,
    skippedCount: row.skipped_count,
    truncated: row.truncated,
    sourceReadAt: row.source_read_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function encryptedSourceStagingPayload(value: Record<string, unknown>) {
  if (
    !value ||
    value.schema !== SOURCE_STAGING_BATCH_SCHEMA ||
    value.algorithm !== SOURCE_STAGING_ALGORITHM
  ) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_malformed",
      "Archive connector source staging encrypted batch is malformed."
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
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_malformed",
      "Archive connector source staging encrypted batch is malformed."
    );
  }
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value, "base64url");
  } catch {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_malformed",
      "Archive connector source staging encrypted batch is malformed."
    );
  }
  if (decoded.length < minBytes || decoded.length > maxBytes) {
    throw new ArchiveConnectorSourceStagingError(
      "archive_connector_source_staging_encryption_malformed",
      "Archive connector source staging encrypted batch is malformed."
    );
  }
  return decoded;
}

function rawAccountIdFromValue(value: unknown) {
  if (typeof value !== "string") throw providerResponseInvalid();
  const trimmed = value.trim();
  if (
    trimmed.length < 1 ||
    trimmed.length > 200 ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw providerResponseInvalid();
  }
  return trimmed;
}

function redditUsernameFromValue(value: unknown) {
  if (typeof value !== "string") throw providerResponseInvalid();
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(trimmed)) throw providerResponseInvalid();
  return trimmed;
}

function keyedDigest(key: Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function stableSourceStagingMaterial(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSourceStagingMaterial).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) =>
      `${JSON.stringify(key)}:${stableSourceStagingMaterial(record[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function accountMismatch() {
  return new ArchiveConnectorSourceStagingError(
    "archive_connector_source_staging_account_mismatch",
    "Archive connector source staging account proof does not match the connected account."
  );
}

function providerFailed() {
  return new ArchiveConnectorSourceStagingError(
    "archive_connector_source_staging_provider_failed",
    "Archive connector source staging provider request failed."
  );
}

function providerResponseInvalid() {
  return new ArchiveConnectorSourceStagingError(
    "archive_connector_source_staging_provider_response_invalid",
    "Archive connector source staging provider response was invalid."
  );
}

function noStageableItems() {
  return new ArchiveConnectorSourceStagingError(
    "archive_connector_source_staging_no_stageable_items",
    "Archive connector source staging found no stageable items."
  );
}
