import { createHash, randomBytes } from "crypto";
import type {
  DeveloperSpaceDetail,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceRecord,
  DeveloperSpaceSnapshot,
  DeveloperSpaceVisibility,
} from "@station/types";
import type { AuthenticatedUser } from "../middleware/require-auth";

const API_KEY_PREFIX = "station_dev_";

const PAID_TIERS = new Set(["private", "creator", "canon", "institutional"]);

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

export function normaliseSourceRefs(refs: unknown): string[] {
  if (!Array.isArray(refs)) return [];
  return refs
    .filter((ref): ref is string => typeof ref === "string" && ref.trim().length > 0)
    .map((ref) => ref.trim())
    .slice(0, 24);
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
    visualisationType: row.visualisation_type,
    visualisationConfig: row.visualisation_config ?? {},
    apiKeyLastFour: includeOperationalFields ? row.api_key_last_four ?? null : null,
    apiKeyCreatedAt: includeOperationalFields ? row.api_key_created_at ?? null : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeDeveloperSpaceNode(row: any): DeveloperSpaceNode {
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
    metrics: row.metrics ?? {},
    lastEventAt: row.last_event_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeDeveloperSpaceEvent(row: any): DeveloperSpaceEvent {
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    nodeId: row.node_id ?? null,
    externalNodeId: row.external_node_id ?? null,
    eventType: row.event_type,
    eventLabel: row.event_label ?? null,
    eventData: row.event_data ?? {},
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

export function serializeDeveloperSpaceSnapshot(row: any): DeveloperSpaceSnapshot {
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    snapshotData: row.snapshot_data ?? {},
    sourceRefs: normaliseSourceRefs(row.source_refs),
    provenance: row.provenance ?? "api",
    visibility: row.visibility ?? "public",
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}
