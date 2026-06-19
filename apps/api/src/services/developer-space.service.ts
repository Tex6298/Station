import { createHash, randomBytes } from "crypto";
import type {
  DeveloperSpaceDetail,
  DeveloperSpaceLinkedDocument,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceProviderPolicy,
  DeveloperSpacePublicFieldControls,
  DeveloperSpaceRecord,
  DeveloperSpaceSnapshot,
  DeveloperSpaceVisibility,
} from "@station/types";
import type { AuthenticatedUser } from "../middleware/require-auth";

const API_KEY_PREFIX = "station_dev_";
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
    providerPolicy: normaliseDeveloperSpaceProviderPolicy(row.provider_policy),
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
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null } = {}
): DeveloperSpaceNode {
  const includeRawData = options.includeRawData ?? false;
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
    metrics: includeRawData
      ? row.metrics ?? {}
      : publicSafeDeveloperSpaceData(row.metrics ?? {}, options.publicFieldKeys) as Record<string, unknown>,
    lastEventAt: row.last_event_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeDeveloperSpaceEvent(
  row: any,
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null } = {}
): DeveloperSpaceEvent {
  const includeRawData = options.includeRawData ?? false;
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    nodeId: row.node_id ?? null,
    externalNodeId: row.external_node_id ?? null,
    eventType: row.event_type,
    eventLabel: row.event_label ?? null,
    eventData: includeRawData
      ? row.event_data ?? {}
      : publicSafeDeveloperSpaceData(row.event_data ?? {}, options.publicFieldKeys) as Record<string, unknown>,
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
  options: { includeRawData?: boolean; publicFieldKeys?: string[] | null } = {}
): DeveloperSpaceSnapshot {
  const includeRawData = options.includeRawData ?? false;
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    snapshotData: includeRawData
      ? row.snapshot_data ?? {}
      : publicSafeDeveloperSpaceData(row.snapshot_data ?? {}, options.publicFieldKeys) as Record<string, unknown>,
    sourceRefs: normaliseSourceRefs(row.source_refs),
    provenance: row.provenance ?? "api",
    visibility: row.visibility ?? "public",
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
