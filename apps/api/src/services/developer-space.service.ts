import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type {
  DeveloperSpaceDetail,
  DeveloperSpaceLinkedDocument,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceObservedRuntimeContext,
  DeveloperSpaceObservedRuntimeFieldVisibility,
  DeveloperSpaceProviderPolicy,
  DeveloperSpacePublicFieldControls,
  DeveloperSpaceRecord,
  DeveloperSpaceSnapshot,
  DeveloperSpaceVisibility,
} from "@station/types";
import type { AuthenticatedUser } from "../middleware/require-auth";

const API_KEY_PREFIX = "station_dev_";
const WEBHOOK_SIGNING_SECRET_PREFIX = "station_whsec_";
const WEBHOOK_SIGNING_SECRET_ENCRYPTION_SCHEMA = "station.developer_space.webhook_signing_secret.v1";
const WEBHOOK_SIGNING_SECRET_ENCRYPTION_ALGORITHM = "aes-256-gcm";
const WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY_ENV = "DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY";
const DEFAULT_PROVIDER_POLICY: DeveloperSpaceProviderPolicy = "public_synthetic_only";
const PROVIDER_POLICIES = new Set<DeveloperSpaceProviderPolicy>([
  "public_synthetic_only",
  "public_context_allowed",
  "private_archive_allowed",
  "owner_byok_only",
  "platform_allowed",
]);

const PAID_TIERS = new Set(["private", "creator", "canon", "institutional"]);
const SENSITIVE_JSON_KEYS = new Set([
  "authorization",
  "apikey",
  "accesstoken",
  "clientsecret",
  "cookie",
  "credentials",
  "key",
  "password",
  "prompt",
  "raw",
  "refreshtoken",
  "secret",
  "secretkey",
  "setcookie",
  "token",
]);
const SENSITIVE_JSON_KEY_FRAGMENTS = ["password", "token", "secret", "credential", "cookie"];
const PUBLIC_FIELD_CONTROL_KEYS = {
  nodeMetricKeys: "nodeMetricKeys",
  eventDataKeys: "eventDataKeys",
  snapshotDataKeys: "snapshotDataKeys",
} as const;
const OBSERVED_RUNTIME_CLASSIFICATION_SCHEMA = "station.observed_runtime.classifications.v1";
const OBSERVED_RUNTIME_FIELD_VISIBILITIES = new Set<DeveloperSpaceObservedRuntimeFieldVisibility>([
  "public",
  "member",
  "owner",
  "private",
  "secret",
]);

export type DeveloperSpacePolicyContext = "public_synthetic" | "public_context" | "private_archive";
export type DeveloperSpaceProviderMode = "platform" | "owner_byok";

export type DeveloperSpaceProviderPolicyDecision = {
  providerPolicy: DeveloperSpaceProviderPolicy;
  requestedContext: DeveloperSpacePolicyContext;
  providerMode: DeveloperSpaceProviderMode;
  allowed: boolean;
  includePrivateArchive: boolean;
  includePublicContext: boolean;
  usePlatformProvider: boolean;
  requireOwnerByok: boolean;
  denialReason: string | null;
  observability: {
    providerPolicy: DeveloperSpaceProviderPolicy;
    requestedContext: DeveloperSpacePolicyContext;
    providerMode: DeveloperSpaceProviderMode;
    allowed: boolean;
    includePrivateArchive: boolean;
    includePublicContext: boolean;
    denialReason: string | null;
  };
};

export function slugifyProjectName(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);

  return slug || `developer-space-${Date.now()}`;
}

export function generateDeveloperSpaceApiKey(): string {
  return `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function hashDeveloperSpaceApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function generateDeveloperSpaceWebhookSigningSecret(): string {
  return `${WEBHOOK_SIGNING_SECRET_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function hashDeveloperSpaceWebhookSigningSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function fingerprintDeveloperSpaceWebhookSigningSecret(secret: string): string {
  return hashDeveloperSpaceWebhookSigningSecret(secret).slice(0, 12);
}

function webhookSigningSecretEncryptionKey() {
  const raw = process.env[WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY_ENV]?.trim();
  if (!raw) return null;
  return createHash("sha256").update(raw).digest();
}

export function developerSpaceWebhookSigningSecretEncryptionConfigured() {
  return Boolean(webhookSigningSecretEncryptionKey());
}

export function encryptDeveloperSpaceWebhookSigningSecret(secret: string) {
  const key = webhookSigningSecretEncryptionKey();
  if (!key) {
    throw new Error(`${WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY_ENV} is required for Developer Space webhook signing secrets.`);
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv(WEBHOOK_SIGNING_SECRET_ENCRYPTION_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    schema: WEBHOOK_SIGNING_SECRET_ENCRYPTION_SCHEMA,
    algorithm: WEBHOOK_SIGNING_SECRET_ENCRYPTION_ALGORITHM,
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authTag: authTag.toString("base64url"),
  };
}

export function decryptDeveloperSpaceWebhookSigningSecret(payload: unknown) {
  const key = webhookSigningSecretEncryptionKey();
  if (!key) {
    throw new Error(`${WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY_ENV} is required for Developer Space webhook signing secrets.`);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Developer Space webhook signing secret payload is malformed.");
  }
  const encrypted = payload as Record<string, unknown>;
  if (
    encrypted.schema !== WEBHOOK_SIGNING_SECRET_ENCRYPTION_SCHEMA ||
    encrypted.algorithm !== WEBHOOK_SIGNING_SECRET_ENCRYPTION_ALGORITHM ||
    typeof encrypted.iv !== "string" ||
    typeof encrypted.ciphertext !== "string" ||
    typeof encrypted.authTag !== "string"
  ) {
    throw new Error("Developer Space webhook signing secret payload is malformed.");
  }
  const decipher = createDecipheriv(
    WEBHOOK_SIGNING_SECRET_ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(encrypted.iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function normaliseDeveloperSpaceProviderPolicy(value: unknown): DeveloperSpaceProviderPolicy {
  return typeof value === "string" && PROVIDER_POLICIES.has(value as DeveloperSpaceProviderPolicy)
    ? value as DeveloperSpaceProviderPolicy
    : DEFAULT_PROVIDER_POLICY;
}

export function evaluateDeveloperSpaceProviderPolicy(input: {
  providerPolicy: unknown;
  requestedContext: DeveloperSpacePolicyContext;
  providerMode: DeveloperSpaceProviderMode;
}): DeveloperSpaceProviderPolicyDecision {
  const providerPolicy = normaliseDeveloperSpaceProviderPolicy(input.providerPolicy);
  const includePrivateArchive = input.requestedContext === "private_archive" && providerPolicy === "private_archive_allowed";
  const includePublicContext = input.requestedContext === "public_context"
    && providerPolicy !== "public_synthetic_only";
  const requireOwnerByok = providerPolicy === "owner_byok_only";
  const usePlatformProvider = input.providerMode === "platform";

  let denialReason: string | null = null;
  if (input.requestedContext === "private_archive" && providerPolicy !== "private_archive_allowed") {
    denialReason = "private_archive_requires_private_archive_allowed";
  } else if (input.requestedContext === "public_context" && providerPolicy === "public_synthetic_only") {
    denialReason = "public_context_not_allowed";
  } else if (requireOwnerByok && input.providerMode !== "owner_byok") {
    denialReason = "owner_byok_required";
  }

  const allowed = denialReason === null;
  return {
    providerPolicy,
    requestedContext: input.requestedContext,
    providerMode: input.providerMode,
    allowed,
    includePrivateArchive,
    includePublicContext,
    usePlatformProvider,
    requireOwnerByok,
    denialReason,
    observability: {
      providerPolicy,
      requestedContext: input.requestedContext,
      providerMode: input.providerMode,
      allowed,
      includePrivateArchive,
      includePublicContext,
      denialReason,
    },
  };
}

export function normaliseSourceRefs(refs: unknown): string[] {
  if (!Array.isArray(refs)) return [];
  return refs
    .filter((ref): ref is string => typeof ref === "string" && ref.trim().length > 0)
    .map((ref) => ref.trim())
    .slice(0, 24);
}

function normalisePublicFieldKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_.:-]{1,80}$/.test(trimmed)) return null;
  return trimmed;
}

function normalisePublicFieldKeyList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const keys = value
    .map(normalisePublicFieldKey)
    .filter((key): key is string => Boolean(key));
  return [...new Set(keys)].slice(0, 32);
}

export function normaliseDeveloperSpacePublicFieldControls(config: unknown): DeveloperSpacePublicFieldControls | null {
  if (!config || typeof config !== "object") return null;
  const controls = (config as Record<string, unknown>).publicFieldControls;
  if (!controls || typeof controls !== "object" || Array.isArray(controls)) return null;
  const input = controls as Record<string, unknown>;
  const normalised: DeveloperSpacePublicFieldControls = {};
  for (const key of Object.values(PUBLIC_FIELD_CONTROL_KEYS)) {
    const keys = normalisePublicFieldKeyList(input[key]);
    if (keys !== undefined) normalised[key] = keys;
  }
  return Object.keys(normalised).length > 0 ? normalised : null;
}

function normaliseSensitiveJsonKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isSensitiveJsonKey(key: string): boolean {
  const normalised = normaliseSensitiveJsonKey(key);
  if (SENSITIVE_JSON_KEYS.has(normalised)) return true;
  if (normalised.endsWith("apikey")) return true;
  if (normalised.startsWith("raw")) return true;
  return SENSITIVE_JSON_KEY_FRAGMENTS.some((fragment) => normalised.includes(fragment));
}

export function publicSafeDeveloperSpaceData(value: unknown, allowedKeys?: string[] | null): unknown {
  if (Array.isArray(value)) return value.map((item) => publicSafeDeveloperSpaceData(item));
  if (!value || typeof value !== "object") return value;
  const allowed = allowedKeys ? new Set(allowedKeys) : null;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isSensitiveJsonKey(key))
      .filter(([key]) => !allowed || allowed.has(key))
      .map(([key, nested]) => [key, publicSafeDeveloperSpaceData(nested)])
  );
}

function isAllowedObservedRuntimeField(
  visibility: DeveloperSpaceObservedRuntimeFieldVisibility,
  access: DeveloperSpaceDetail["access"]
) {
  if (visibility === "secret") return false;
  if (access === "owner") return true;
  if (visibility === "owner" || visibility === "private") return false;
  return visibility === "public" || (access === "member" && visibility === "member");
}

function normaliseObservedRuntimeClassificationPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_.:-]{1,160}$/.test(trimmed)) return null;
  return trimmed;
}

export function normaliseObservedRuntimeFieldClassifications(value: unknown): Record<string, DeveloperSpaceObservedRuntimeFieldVisibility> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const fields = raw.fields && typeof raw.fields === "object" && !Array.isArray(raw.fields)
    ? raw.fields as Record<string, unknown>
    : raw;
  const entries = Object.entries(fields);
  if (entries.length === 0) return null;
  if (entries.length > 256) {
    throw new Error("Observed runtime field classifications must include 256 fields or fewer.");
  }

  const normalised: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility> = {};
  for (const [rawPath, rawVisibility] of entries) {
    const path = normaliseObservedRuntimeClassificationPath(rawPath);
    if (!path) throw new Error("Observed runtime field classification paths must be safe dotted keys.");
    if (typeof rawVisibility !== "string" || !OBSERVED_RUNTIME_FIELD_VISIBILITIES.has(rawVisibility as DeveloperSpaceObservedRuntimeFieldVisibility)) {
      throw new Error(`Observed runtime field classification for ${path} is invalid.`);
    }
    const visibility = rawVisibility as DeveloperSpaceObservedRuntimeFieldVisibility;
    if (isSensitiveJsonKey(path) && visibility !== "secret") {
      throw new Error(`Observed runtime field ${path} must be classified as secret.`);
    }
    normalised[path] = visibility;
  }
  return normalised;
}

export function observedRuntimeClassificationMetadata(
  value: unknown
): { schema: typeof OBSERVED_RUNTIME_CLASSIFICATION_SCHEMA; fields: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility> } | null {
  const fields = normaliseObservedRuntimeFieldClassifications(value);
  return fields ? { schema: OBSERVED_RUNTIME_CLASSIFICATION_SCHEMA, fields } : null;
}

function leafPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [prefix].filter(Boolean);
  if (!value || typeof value !== "object") return [prefix].filter(Boolean);
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    leafPaths(nested, prefix ? `${prefix}.${key}` : key)
  );
}

function filterObservedRuntimeValue(
  value: unknown,
  fields: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>,
  access: DeveloperSpaceDetail["access"],
  prefix = ""
): unknown {
  if (Array.isArray(value)) {
    const visibility = fields[prefix];
    return visibility && isAllowedObservedRuntimeField(visibility, access) ? value : undefined;
  }
  if (!value || typeof value !== "object") {
    const visibility = fields[prefix];
    return visibility && isAllowedObservedRuntimeField(visibility, access) ? value : undefined;
  }

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const filtered = filterObservedRuntimeValue(nested, fields, access, path);
    if (filtered !== undefined) output[key] = filtered;
  }
  return output;
}

export function prepareObservedRuntimeClassifiedData(input: {
  data: Record<string, unknown>;
  fieldClassifications?: unknown;
}) {
  const metadata = observedRuntimeClassificationMetadata(input.fieldClassifications);
  if (!metadata) return { data: input.data, metadata: null };

  for (const path of leafPaths(input.data)) {
    if (!metadata.fields[path]) {
      throw new Error(`Observed runtime field ${path} is missing a classification.`);
    }
  }
  const persistedFields = Object.fromEntries(
    Object.entries(metadata.fields).filter(([, visibility]) => visibility !== "secret")
  ) as Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;

  return {
    data: filterObservedRuntimeValue(input.data, metadata.fields, "owner") as Record<string, unknown>,
    metadata: Object.keys(persistedFields).length > 0
      ? { schema: metadata.schema, fields: persistedFields }
      : null,
  };
}

function dataForDeveloperSpaceAccess(input: {
  data: Record<string, unknown>;
  metadata?: unknown;
  access: DeveloperSpaceDetail["access"];
  includeRawData: boolean;
  publicFieldKeys?: string[] | null;
}) {
  const fields = normaliseObservedRuntimeFieldClassifications(input.metadata);
  if (fields) {
    const filtered = filterObservedRuntimeValue(input.data, fields, input.access) as Record<string, unknown>;
    return input.access === "owner"
      ? filtered
      : publicSafeDeveloperSpaceData(filtered, input.publicFieldKeys) as Record<string, unknown>;
  }
  return input.includeRawData
    ? input.data
    : publicSafeDeveloperSpaceData(input.data, input.publicFieldKeys) as Record<string, unknown>;
}

export function extractDeveloperApiKey(headerValue?: string | string[]): string | null {
  if (!headerValue) return null;
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase().startsWith("bearer ")) return trimmed.slice(7).trim();
  return trimmed;
}

export function canReadDeveloperSpace(
  visibility: DeveloperSpaceVisibility,
  ownerUserId: string,
  user?: AuthenticatedUser | null
): boolean {
  if (ownerUserId === user?.id || user?.isAdmin) return true;
  if (visibility === "public" || visibility === "unlisted") return true;
  if (visibility === "community") return !!user && PAID_TIERS.has(user.tier);
  return false;
}

export function accessLevelForDeveloperSpace(
  ownerUserId: string,
  user?: AuthenticatedUser | null
): DeveloperSpaceDetail["access"] {
  if (ownerUserId === user?.id || user?.isAdmin) return "owner";
  if (user && PAID_TIERS.has(user.tier)) return "member";
  return "public";
}

export function serializeDeveloperSpace(row: any, options: { includeOperationalFields?: boolean } = {}): DeveloperSpaceRecord {
  const includeOperationalFields = options.includeOperationalFields ?? true;
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    projectName: row.project_name,
    slug: row.slug,
    description: row.description ?? null,
    visibility: row.visibility,
    providerPolicy: normaliseDeveloperSpaceProviderPolicy(includeOperationalFields ? row.provider_policy : null),
    visualisationType: row.visualisation_type,
    visualisationConfig: row.visualisation_config ?? {},
    apiKeyLastFour: includeOperationalFields ? row.api_key_last_four ?? null : null,
    apiKeyCreatedAt: includeOperationalFields ? row.api_key_created_at ?? null : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeDeveloperSpaceNode(
  row: any,
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null; access?: DeveloperSpaceDetail["access"] } = {}
): DeveloperSpaceNode {
  const includeRawData = options.includeRawData ?? false;
  const access = options.access ?? (includeRawData ? "owner" : "public");
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    externalId: row.external_id,
    nodeName: row.node_name,
    topologyType: row.topology_type,
    fragmentCount: Number(row.fragment_count ?? 0),
    selfSimilarityScore: row.self_similarity_score === null || row.self_similarity_score === undefined
      ? null
      : Number(row.self_similarity_score),
    dimensionality: row.dimensionality === null || row.dimensionality === undefined
      ? null
      : Number(row.dimensionality),
    metrics: dataForDeveloperSpaceAccess({
      data: row.metrics ?? {},
      metadata: row.observed_runtime_classifications,
      access,
      includeRawData,
      publicFieldKeys: options.publicFieldKeys,
    }),
    lastEventAt: row.last_event_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeDeveloperSpaceEvent(
  row: any,
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null; access?: DeveloperSpaceDetail["access"] } = {}
): DeveloperSpaceEvent {
  const includeRawData = options.includeRawData ?? false;
  const access = options.access ?? (includeRawData ? "owner" : "public");
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    nodeId: row.node_id ?? null,
    externalNodeId: row.external_node_id ?? null,
    eventType: row.event_type,
    eventLabel: row.event_label ?? null,
    eventData: dataForDeveloperSpaceAccess({
      data: row.event_data ?? {},
      metadata: row.observed_runtime_classifications,
      access,
      includeRawData,
      publicFieldKeys: options.publicFieldKeys,
    }),
    similarityScore: row.similarity_score === null || row.similarity_score === undefined
      ? null
      : Number(row.similarity_score),
    sourceRefs: normaliseSourceRefs(row.source_refs),
    provenance: row.provenance ?? "api",
    visibility: row.visibility ?? "public",
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export function serializeDeveloperSpaceSnapshot(
  row: any,
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null; access?: DeveloperSpaceDetail["access"] } = {}
): DeveloperSpaceSnapshot {
  const includeRawData = options.includeRawData ?? false;
  const access = options.access ?? (includeRawData ? "owner" : "public");
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    snapshotData: dataForDeveloperSpaceAccess({
      data: row.snapshot_data ?? {},
      metadata: row.observed_runtime_classifications,
      access,
      includeRawData,
      publicFieldKeys: options.publicFieldKeys,
    }),
    sourceRefs: normaliseSourceRefs(row.source_refs),
    provenance: row.provenance ?? "api",
    visibility: row.visibility ?? "public",
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export function serializeDeveloperSpaceObservedRuntimeContext(
  row: any,
  options: { includeRawData?: boolean; access?: DeveloperSpaceDetail["access"] } = {}
): DeveloperSpaceObservedRuntimeContext {
  const includeRawData = options.includeRawData ?? false;
  const access = options.access ?? (includeRawData ? "owner" : "public");
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    contextType: row.context_type,
    externalId: row.external_id ?? null,
    sourceRef: row.source_ref ?? null,
    payload: dataForDeveloperSpaceAccess({
      data: row.payload ?? {},
      metadata: row.observed_runtime_classifications,
      access,
      includeRawData,
    }),
    provenance: row.provenance ?? "imported",
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

function excerpt(value: string | null | undefined, length = 220) {
  const clean = (value ?? "").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trim()}...` : clean;
}

export function serializeDeveloperSpaceLinkedDocument(
  link: any,
  document: any
): DeveloperSpaceLinkedDocument {
  return {
    id: link.id,
    developerSpaceId: link.developer_space_id,
    documentId: link.document_id,
    ownerUserId: link.owner_user_id,
    role: link.document_role,
    linkVisibility: link.link_visibility,
    sortOrder: Number(link.sort_order ?? 0),
    createdAt: link.created_at,
    updatedAt: link.updated_at,
    document: {
      id: document.id,
      title: document.title,
      slug: document.slug,
      excerpt: excerpt(document.body),
      documentType: document.document_type,
      status: document.status,
      visibility: document.visibility,
      publishedAt: document.published_at ?? null,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    },
  };
}
