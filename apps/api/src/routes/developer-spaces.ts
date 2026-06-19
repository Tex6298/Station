import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { describePlatformProviderRoute } from "@station/ai";
import type {
  DeveloperSpaceDocumentLinkVisibility,
  DeveloperSpaceDocumentRole,
  DeveloperSpaceEventVisibility,
  DeveloperSpaceFreshness,
  DeveloperSpaceLiveUpdate,
} from "@station/types";
import { requireAuth, optionalAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { env } from "../lib/env";
import { getSupabaseAdmin } from "../lib/supabase";
import { validateToken } from "../services/auth.service";
import { canCreateDeveloperSpace } from "@station/auth/permissions";
import type { AuthUser } from "@station/types";
import { resolveActiveEmbeddingProfileCode, resolveActiveEmbeddingProvider } from "../services/embedding-key.service";
import {
  accessLevelForDeveloperSpace,
  canReadDeveloperSpace,
  evaluateDeveloperSpaceProviderPolicy,
  extractDeveloperApiKey,
  generateDeveloperSpaceApiKey,
  hashDeveloperSpaceApiKey,
  normaliseSourceRefs,
  serializeDeveloperSpace,
  serializeDeveloperSpaceEvent,
  serializeDeveloperSpaceLinkedDocument,
  serializeDeveloperSpaceNode,
  serializeDeveloperSpaceSnapshot,
  slugifyProjectName,
} from "../services/developer-space.service";
import {
  completeAiTrace,
  recordAiTraceEvent,
  startAiTrace,
} from "../services/ai-observability.service";
import {
  assertDeveloperSpaceUsageAvailable,
  estimateDeveloperSpaceStorageBytes,
  getDeveloperSpaceUsage,
  recordDeveloperSpaceUsage,
} from "../services/developer-space-usage.service";
import { quotaErrorResponse } from "../services/operational-quota.service";
import { broadcastDeveloperSpaceIngestion } from "../services/developer-space-live.service";
import { incrementOperationalRateLimit } from "../services/operational-cache.service";

const visibilitySchema = z.enum(["private", "unlisted", "community", "public"]);
const providerPolicySchema = z.enum([
  "public_synthetic_only",
  "public_context_allowed",
  "private_archive_allowed",
  "owner_byok_only",
  "platform_allowed",
]);
const visualisationSchema = z.enum(["node_field", "timeline", "world_map", "constellation"]);
const topologySchema = z.enum(["radial", "branching", "lattice", "custom"]);
const eventVisibilitySchema = z.enum(["private", "community", "public"]);
const provenanceSchema = z.enum(["api", "imported", "user", "system", "ai_generated"]);
const documentRoleSchema = z.enum(["methodology", "finding", "field_log", "note"]);
const documentLinkVisibilitySchema = z.enum(["owner", "public"]);
const sourceRefsSchema = z.array(z.string().max(500)).max(24).default([]);
const MAX_JSON_CHARS = 32_000;
const MAX_JSON_DEPTH = 8;
const SSE_RETRY_MS = 5_000;
const SSE_POLL_MS = Number(process.env.DEVELOPER_SPACE_SSE_POLL_MS ?? 5_000);
const OPENAI_COMPATIBLE_ROLLBACK_PROFILE = {
  profileCode: "openai_1536",
  provider: "openai",
  dimension: 1536,
  status: "paid_or_rollback_assumption",
};
const INGEST_RATE_LIMIT_RESOURCE = "developer_space_ingest_requests";
const DEFAULT_INGEST_RATE_LIMIT_PER_MINUTE = 120;
const DEFAULT_INGEST_RATE_LIMIT_WINDOW_SECONDS = 60;

type IngestionErrorCategory = "auth" | "validation" | "quota" | "server";

function ingestionErrorBody(input: {
  error: string;
  code: string;
  category: IngestionErrorCategory;
  details?: unknown;
}) {
  return {
    error: input.error,
    code: input.code,
    category: input.category,
    ...(input.details !== undefined ? { details: input.details } : {}),
  };
}

function ingestionAuthError(code: "developer_space_key_missing" | "developer_space_key_invalid", error: string) {
  return ingestionErrorBody({ error, code, category: "auth" });
}

function ingestionValidationError(error: z.ZodError) {
  return ingestionErrorBody({
    error: "Developer Space ingestion payload failed validation.",
    code: "developer_space_validation_failed",
    category: "validation",
    details: error.flatten(),
  });
}

function ingestionServerError(error: string) {
  return ingestionErrorBody({
    error,
    code: "developer_space_server_error",
    category: "server",
  });
}

function ingestionRateLimitError(input: { limit: number; used: number; retryAfter: number }) {
  return {
    error: "Developer Space ingestion rate limit exceeded.",
    code: "developer_space_rate_limited",
    category: "rate_limit",
    resource: INGEST_RATE_LIMIT_RESOURCE,
    limit: input.limit,
    used: input.used,
    retryAfter: input.retryAfter,
  };
}

function jsonDepth(value: unknown, depth = 0): number {
  if (!value || typeof value !== "object") return depth;
  if (depth > MAX_JSON_DEPTH) return depth;
  const values = Array.isArray(value)
    ? value
    : Object.values(value as Record<string, unknown>);
  return values.reduce((max, item) => Math.max(max, jsonDepth(item, depth + 1)), depth);
}

const jsonObjectSchema = z.record(z.unknown()).superRefine((value, ctx) => {
  if (JSON.stringify(value).length > MAX_JSON_CHARS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `JSON payload must be ${MAX_JSON_CHARS} characters or less.`,
    });
  }

  if (jsonDepth(value) > MAX_JSON_DEPTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `JSON payload depth must be ${MAX_JSON_DEPTH} levels or less.`,
    });
  }
});

const createSpaceSchema = z.object({
  projectName: z.string().min(1).max(120),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  description: z.string().max(4000).optional(),
  visibility: visibilitySchema.default("private"),
  providerPolicy: providerPolicySchema.default("public_synthetic_only"),
  visualisationType: visualisationSchema.default("node_field"),
  visualisationConfig: jsonObjectSchema.default({}),
});

const updateSpaceSchema = createSpaceSchema.partial();

const providerPolicyEvaluationSchema = z.object({
  requestedContext: z.enum(["public_synthetic", "public_context", "private_archive"]).default("public_synthetic"),
  providerMode: z.enum(["platform", "owner_byok"]).default("platform"),
  privateArchiveRequested: z.boolean().optional(),
});

const nodeStateSchema = z.object({
  nodeName: z.string().min(1).max(120).optional(),
  topologyType: topologySchema.default("custom"),
  fragmentCount: z.number().int().min(0).max(10_000_000).default(0),
  selfSimilarityScore: z.number().min(0).max(1).nullable().optional(),
  dimensionality: z.number().int().min(0).max(100_000).nullable().optional(),
  metrics: jsonObjectSchema.default({}),
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
});

const eventSchema = z.object({
  eventType: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.:-]+$/),
  eventLabel: z.string().max(220).optional(),
  nodeId: z.string().min(1).max(160).optional(),
  eventData: jsonObjectSchema.default({}),
  similarityScore: z.number().min(0).max(1).nullable().optional(),
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const snapshotSchema = z.object({
  snapshotData: jsonObjectSchema,
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const batchImportSchema = z.object({
  nodes: z.array(nodeStateSchema.extend({ nodeId: z.string().min(1).max(160) })).max(250).default([]),
  events: z.array(eventSchema).max(500).default([]),
  snapshots: z.array(snapshotSchema).max(100).default([]),
});

const attachDocumentSchema = z.object({
  documentId: z.string().min(1).max(120),
  role: documentRoleSchema.default("note"),
  linkVisibility: documentLinkVisibilitySchema.default("owner"),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

const attachProjectSchema = z.object({
  projectId: z.string().uuid().nullable(),
});

const templateDocumentSchema = z.object({
  role: documentRoleSchema.default("note"),
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(100_000).optional(),
  linkVisibility: documentLinkVisibilitySchema.default("owner"),
  publish: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

export const developerSpacesRouter = Router();

async function loadSpaceForIngestion(req: any, res: any) {
  const rawKey = extractDeveloperApiKey(req.headers["x-station-developer-key"] ?? req.headers.authorization);
  if (!rawKey) {
    res.status(401).json(ingestionAuthError(
      "developer_space_key_missing",
      "Missing Developer Space API key.",
    ));
    return null;
  }

  const apiKeyHash = hashDeveloperSpaceApiKey(rawKey);
  const sb = getSupabaseAdmin();

  const { data: ingestionKey } = await sb
    .from("developer_space_ingestion_keys")
    .select("*")
    .eq("key_hash", apiKeyHash)
    .eq("status", "active")
    .maybeSingle();

  if (ingestionKey) {
    await sb
      .from("developer_space_ingestion_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", ingestionKey.id);

    const { data: keyedSpace, error: keyedSpaceError } = await sb
      .from("developer_spaces")
      .select("*")
      .eq("id", ingestionKey.developer_space_id)
      .single();

    if (keyedSpaceError || !keyedSpace) {
      res.status(401).json(ingestionAuthError(
        "developer_space_key_invalid",
        "Invalid Developer Space API key.",
      ));
      return null;
    }

    return { space: keyedSpace, ingestionKeyId: ingestionKey.id as string };
  }

  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("api_key_hash", apiKeyHash)
    .single();

  if (error || !data) {
    res.status(401).json(ingestionAuthError(
      "developer_space_key_invalid",
      "Invalid Developer Space API key.",
    ));
    return null;
  }

  return { space: data, ingestionKeyId: null };
}

async function enforceIngestionRateLimit(
  res: Response,
  input: { space: { id: string; owner_user_id: string }; ingestionKeyId: string | null }
) {
  const limit = positiveIntFromEnv(
    "DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE",
    DEFAULT_INGEST_RATE_LIMIT_PER_MINUTE,
  );
  const windowSeconds = positiveIntFromEnv(
    "DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS",
    DEFAULT_INGEST_RATE_LIMIT_WINDOW_SECONDS,
  );
  let result;
  try {
    result = await incrementOperationalRateLimit({
      scope: {
        ownerUserId: input.space.owner_user_id,
        developerSpaceId: input.space.id,
        resourceId: input.ingestionKeyId ?? "legacy-key",
        operation: "ingest_requests",
      },
      limit,
      windowSeconds,
      parts: ["developer-space-ingestion"],
    });
  } catch {
    res.status(500).json(ingestionServerError("Could not check Developer Space ingestion rate limit."));
    return false;
  }

  if (result.allowed) return true;
  res.status(429).json(ingestionRateLimitError({
    limit: result.limit,
    used: result.used,
    retryAfter: result.retryAfter ?? result.windowSeconds,
  }));
  return false;
}

async function findNodeByExternalId(developerSpaceId: string, externalId?: string | null) {
  if (!externalId) return null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("developer_space_nodes")
    .select("*")
    .eq("developer_space_id", developerSpaceId)
    .eq("external_id", externalId)
    .maybeSingle();
  return data ?? null;
}

async function recordUsageSilently(
  space: { id: string; owner_user_id: string },
  delta: Parameters<typeof recordDeveloperSpaceUsage>[1]
) {
  await recordDeveloperSpaceUsage(space, delta).catch(() => null);
}

async function enforceUsageQuota(
  res: Response,
  space: { id: string; owner_user_id: string },
  delta: Parameters<typeof recordDeveloperSpaceUsage>[1]
) {
  try {
    await assertDeveloperSpaceUsageAvailable(space, delta);
    return true;
  } catch (error) {
    const quotaError = quotaErrorResponse(error);
    if (quotaError) {
      res.status(quotaError.status).json({
        ...quotaError.body,
        category: "quota",
      });
      return false;
    }
    throw error;
  }
}

function eventVisibilitiesForAccess(access: "owner" | "member" | "public"): DeveloperSpaceEventVisibility[] {
  if (access === "owner") return ["private", "community", "public"];
  if (access === "member") return ["community", "public"];
  return ["public"];
}

function latestIso(values: Array<string | null | undefined>) {
  const dates = values.filter((value): value is string => typeof value === "string" && value.length > 0);
  if (dates.length === 0) return null;
  return dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}

function slugifyDocumentTitle(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);

  return slug || `developer-space-note-${Date.now()}`;
}

async function uniqueDocumentSlug(authorUserId: string, preferred: string) {
  const sb = getSupabaseAdmin();
  const base = slugifyDocumentTitle(preferred);
  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data } = await sb
      .from("documents")
      .select("id")
      .eq("author_user_id", authorUserId)
      .eq("slug", candidate)
      .single();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function defaultTemplateTitle(projectName: string, role: DeveloperSpaceDocumentRole) {
  const labels: Record<DeveloperSpaceDocumentRole, string> = {
    methodology: "Methodology",
    finding: "Finding",
    field_log: "Field log",
    note: "Research note",
  };
  return `${projectName} ${labels[role]}`;
}

function defaultTemplateBody(projectName: string, role: DeveloperSpaceDocumentRole) {
  const labels: Record<DeveloperSpaceDocumentRole, string> = {
    methodology: "Methodology notes",
    finding: "Findings",
    field_log: "Field log",
    note: "Research note",
  };
  return `# ${projectName} ${labels[role]}\n\n`;
}

function documentTypeForRole(role: DeveloperSpaceDocumentRole) {
  if (role === "methodology" || role === "finding") return "research";
  if (role === "field_log") return "field_log";
  return "archive_note";
}

function activeEmbeddingDimension() {
  const value = Number.parseInt(process.env.EMBEDDING_DIM ?? String(env.EMBEDDING_DIM ?? 1536), 10);
  return Number.isInteger(value) && value > 0 ? value : 1536;
}

function positiveIntFromEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function buildDeveloperSpaceProviderPosture(decision: ReturnType<typeof evaluateDeveloperSpaceProviderPolicy>) {
  const platformRoute = describePlatformProviderRoute({
    platformNvidiaKey: process.env.NVIDIA_AI_API_KEY ?? env.NVIDIA_AI_API_KEY,
  });
  const embeddingProfileCode = resolveActiveEmbeddingProfileCode();
  const embeddingProvider = resolveActiveEmbeddingProvider();

  return {
    providerPolicy: decision.providerPolicy,
    requestedContext: decision.requestedContext,
    providerMode: decision.providerMode,
    selectedProviderRoute: decision.providerMode === "owner_byok" ? "owner_byok" : platformRoute.label,
    platformRoute,
    context: {
      allowed: decision.allowed,
      denialReason: decision.denialReason,
      includePublicContext: decision.includePublicContext,
    },
    privateArchive: {
      requested: decision.requestedContext === "private_archive",
      permitted: decision.includePrivateArchive,
      gate: decision.includePrivateArchive
        ? "explicit_private_archive_allowed"
        : decision.requestedContext === "private_archive"
          ? "denied_without_private_archive_allowed"
          : "not_requested",
    },
    embeddingProfile: {
      profileCode: embeddingProfileCode,
      provider: embeddingProvider,
      dimension: activeEmbeddingDimension(),
      activeUse: embeddingProfileCode === "station_free_1536"
        ? "active_product_testing"
        : "openai_compatible_paid_or_rollback",
      rollbackProfile: OPENAI_COMPATIBLE_ROLLBACK_PROFILE,
    },
  };
}

function isOwnerOrAdmin(space: any, user?: AuthenticatedUser | null) {
  return space.owner_user_id === user?.id || user?.isAdmin;
}

function isPublicSafeLinkedDocument(document: any) {
  return document.status === "published" && document.visibility === "public";
}

function publicDocumentLinkIsReadable(link: any, document: any) {
  return link.link_visibility === "public" && isPublicSafeLinkedDocument(document);
}

async function loadDeveloperSpaceForOwner(id: string, user: AuthenticatedUser) {
  const sb = getSupabaseAdmin();
  const { data: space, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !space) return { status: 404 as const, error: "Developer Space not found." };
  if (!isOwnerOrAdmin(space, user)) return { status: 403 as const, error: "Not authorised." };
  return { status: 200 as const, space };
}

async function loadLinkedDocumentsForSpace(space: any, access: "owner" | "member" | "public") {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("developer_space_documents")
    .select("*")
    .eq("developer_space_id", space.id)
    .order("sort_order", { ascending: true });

  if (access !== "owner") query = query.eq("link_visibility", "public");

  const { data: links, error: linkError } = await query;
  if (linkError) throw new Error(linkError.message);

  const documentIds = [...new Set((links ?? []).map((link: any) => link.document_id))];
  if (documentIds.length === 0) {
    return {
      linkedDocuments: [],
      linkRows: [],
      documentRows: [],
    };
  }

  const { data: documents, error: documentError } = await sb
    .from("documents")
    .select("id, author_user_id, title, slug, body, document_type, status, visibility, published_at, created_at, updated_at")
    .in("id", documentIds);

  if (documentError) throw new Error(documentError.message);

  const documentById = new Map((documents ?? []).map((document: any) => [document.id, document]));
  const readablePairs = (links ?? [])
    .map((link: any) => ({ link, document: documentById.get(link.document_id) }))
    .filter(({ link, document }: any) => {
      if (!document) return false;
      if (access === "owner") return true;
      return publicDocumentLinkIsReadable(link, document);
    });

  return {
    linkedDocuments: readablePairs.map(({ link, document }: any) =>
      serializeDeveloperSpaceLinkedDocument(link, document)
    ),
    linkRows: readablePairs.map(({ link }: any) => link),
    documentRows: readablePairs.map(({ document }: any) => document),
  };
}

function buildFreshness(
  space: any,
  nodes: any[],
  events: any[],
  latestSnapshot: any | null,
  linkedRows: { links: any[]; documents: any[] },
  emittedAt: string
): DeveloperSpaceFreshness {
  const latestNodeAt = latestIso(nodes.flatMap((node) => [node.last_event_at, node.updated_at, node.created_at]));
  const latestEventAt = latestIso(events.flatMap((event) => [event.occurred_at, event.created_at]));
  const latestSnapshotAt = latestSnapshot
    ? latestIso([latestSnapshot.occurred_at, latestSnapshot.created_at])
    : null;
  const latestDocumentAt = latestIso([
    ...linkedRows.links.flatMap((link) => [link.updated_at, link.created_at]),
    ...linkedRows.documents.flatMap((document) => [document.updated_at, document.published_at, document.created_at]),
  ]);
  const spaceUpdatedAt = space.updated_at ?? space.created_at ?? emittedAt;
  const streamId = [
    spaceUpdatedAt,
    latestNodeAt ?? "nodes:none",
    latestEventAt ?? "events:none",
    latestSnapshotAt ?? "snapshots:none",
    latestDocumentAt ?? "documents:none",
    nodes.length,
    events.length,
    latestSnapshot?.id ?? "snapshot:none",
    linkedRows.links.length,
  ].join("|");

  return {
    streamId,
    spaceUpdatedAt,
    latestNodeAt,
    latestEventAt,
    latestSnapshotAt,
    emittedAt,
  };
}

async function buildDeveloperSpaceLiveUpdate(
  slug: string,
  user?: AuthenticatedUser | null
): Promise<{ status: 200; update: DeveloperSpaceLiveUpdate } | { status: 403 | 404 | 500; error: string }> {
  const sb = getSupabaseAdmin();
  const { data: space, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !space) return { status: 404, error: "Developer Space not found." };
  if (!canReadDeveloperSpace(space.visibility, space.owner_user_id, user)) {
    return { status: 403, error: "This Developer Space is not public." };
  }

  const access = accessLevelForDeveloperSpace(space.owner_user_id, user);
  const eventVisibility = eventVisibilitiesForAccess(access);

  const [nodesResult, eventsResult, snapshotsResult] = await Promise.all([
    sb
      .from("developer_space_nodes")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("last_event_at", { ascending: false, nullsFirst: false })
      .limit(80),
    sb
      .from("developer_space_events")
      .select("*")
      .eq("developer_space_id", space.id)
      .in("visibility", eventVisibility)
      .order("occurred_at", { ascending: false })
      .limit(80),
    sb
      .from("developer_space_snapshots")
      .select("*")
      .eq("developer_space_id", space.id)
      .in("visibility", eventVisibility)
      .order("occurred_at", { ascending: false })
      .limit(1),
  ]);

  if (nodesResult.error) return { status: 500, error: nodesResult.error.message };
  if (eventsResult.error) return { status: 500, error: eventsResult.error.message };
  if (snapshotsResult.error) return { status: 500, error: snapshotsResult.error.message };

  const nodes = nodesResult.data ?? [];
  const events = eventsResult.data ?? [];
  const latestSnapshot = snapshotsResult.data?.[0] ?? null;
  let linkedDocumentsResult: Awaited<ReturnType<typeof loadLinkedDocumentsForSpace>>;
  try {
    linkedDocumentsResult = await loadLinkedDocumentsForSpace(space, access);
  } catch (e) {
    return { status: 500, error: e instanceof Error ? e.message : "Could not load linked documents." };
  }
  const includeRawData = access === "owner";
  const emittedAt = new Date().toISOString();
  const detail = {
    space: serializeDeveloperSpace(space, { includeOperationalFields: access === "owner" }),
    nodes: nodes.map((node) => serializeDeveloperSpaceNode(node, { includeRawData })),
    events: events.map((event) => serializeDeveloperSpaceEvent(event, { includeRawData })),
    latestSnapshot: latestSnapshot ? serializeDeveloperSpaceSnapshot(latestSnapshot, { includeRawData }) : null,
    linkedDocuments: linkedDocumentsResult.linkedDocuments,
    access,
  };

  return {
    status: 200,
    update: {
      kind: "detail",
      detail,
      freshness: buildFreshness(
        space,
        nodes,
        events,
        latestSnapshot,
        {
          links: linkedDocumentsResult.linkRows,
          documents: linkedDocumentsResult.documentRows,
        },
        emittedAt
      ),
      emittedAt,
    },
  };
}

function queryStringValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

async function attachSseQueryUser(req: Request) {
  if (req.user) return;
  const accessToken = queryStringValue(req.query.access_token);
  if (!accessToken) return;

  try {
    const result = await validateToken(accessToken);
    if (result) {
      req.user = {
        id: result.userId,
        tier: result.tier,
        isAdmin: result.isAdmin,
        email: result.email,
      };
    }
  } catch {
    // SSE streams stay public if the optional query token is invalid.
  }
}

function writeSse(res: Response, event: string, data: unknown, id?: string) {
  res.write(`retry: ${SSE_RETRY_MS}\n`);
  if (id) res.write(`id: ${id}\n`);
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function writeSseHeartbeat(res: Response) {
  res.write(`: heartbeat ${new Date().toISOString()}\n\n`);
}

// -- Ingestion API: key-authenticated, no Station user session required -------
developerSpacesRouter.post("/ingest/nodes/:nodeId/state", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;
  if (!(await enforceIngestionRateLimit(res, ingestion))) return;

  const parsed = nodeStateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const externalId = req.params.nodeId;
  const usageDelta = {
    nodes: 1,
    events: 1,
    storageBytes: estimateDeveloperSpaceStorageBytes(req.body),
  };
  if (!(await enforceUsageQuota(res, space, usageDelta))) return;

  const { data: node, error: nodeError } = await sb
    .from("developer_space_nodes")
    .upsert({
      developer_space_id: space.id,
      external_id: externalId,
      node_name: parsed.data.nodeName ?? externalId,
      topology_type: parsed.data.topologyType,
      fragment_count: parsed.data.fragmentCount,
      self_similarity_score: parsed.data.selfSimilarityScore ?? null,
      dimensionality: parsed.data.dimensionality ?? null,
      metrics: parsed.data.metrics,
      last_event_at: now,
    }, { onConflict: "developer_space_id,external_id" })
    .select("*")
    .single();

  if (nodeError || !node) return res.status(500).json(ingestionServerError("Could not upsert node."));

  await sb.from("developer_space_events").insert({
    developer_space_id: space.id,
    node_id: node.id,
    external_node_id: externalId,
    event_type: "node_state_update",
    event_label: `${node.node_name} state updated`,
    event_data: {
      fragmentCount: parsed.data.fragmentCount,
      selfSimilarityScore: parsed.data.selfSimilarityScore ?? null,
      dimensionality: parsed.data.dimensionality ?? null,
      metrics: parsed.data.metrics,
    },
    similarity_score: parsed.data.selfSimilarityScore ?? null,
    source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
    provenance: parsed.data.provenance,
    visibility: "public",
    occurred_at: now,
  });

  await recordUsageSilently(space, usageDelta);
  broadcastDeveloperSpaceIngestion({
    slug: space.slug,
    source: "node",
    counts: { nodes: 1, events: 1 },
  });

  return res.status(202).json({ node: serializeDeveloperSpaceNode(node, { includeRawData: true }) });
});

developerSpacesRouter.post("/ingest/events", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;
  if (!(await enforceIngestionRateLimit(res, ingestion))) return;

  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));
  const usageDelta = {
    events: 1,
    storageBytes: estimateDeveloperSpaceStorageBytes(req.body),
  };
  if (!(await enforceUsageQuota(res, space, usageDelta))) return;

  const sb = getSupabaseAdmin();
  const node = await findNodeByExternalId(space.id, parsed.data.nodeId);

  const { data, error } = await sb
    .from("developer_space_events")
    .insert({
      developer_space_id: space.id,
      node_id: node?.id ?? null,
      external_node_id: parsed.data.nodeId ?? null,
      event_type: parsed.data.eventType,
      event_label: parsed.data.eventLabel ?? null,
      event_data: parsed.data.eventData,
      similarity_score: parsed.data.similarityScore ?? null,
      source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
      provenance: parsed.data.provenance,
      visibility: parsed.data.visibility,
      occurred_at: parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json(ingestionServerError("Could not ingest event."));

  if (node) {
    await sb
      .from("developer_space_nodes")
      .update({ last_event_at: parsed.data.occurredAt ?? new Date().toISOString() })
      .eq("id", node.id);
  }

  await recordUsageSilently(space, usageDelta);
  broadcastDeveloperSpaceIngestion({
    slug: space.slug,
    source: "event",
    counts: { events: 1 },
  });

  return res.status(202).json({ event: serializeDeveloperSpaceEvent(data, { includeRawData: true }) });
});

developerSpacesRouter.post("/ingest/snapshots", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;
  if (!(await enforceIngestionRateLimit(res, ingestion))) return;

  const parsed = snapshotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));
  const usageDelta = {
    snapshots: 1,
    storageBytes: estimateDeveloperSpaceStorageBytes(req.body),
  };
  if (!(await enforceUsageQuota(res, space, usageDelta))) return;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_space_snapshots")
    .insert({
      developer_space_id: space.id,
      snapshot_data: parsed.data.snapshotData,
      source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
      provenance: parsed.data.provenance,
      visibility: parsed.data.visibility,
      occurred_at: parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json(ingestionServerError("Could not ingest snapshot."));
  await recordUsageSilently(space, usageDelta);
  broadcastDeveloperSpaceIngestion({
    slug: space.slug,
    source: "snapshot",
    counts: { snapshots: 1 },
  });
  return res.status(202).json({ snapshot: serializeDeveloperSpaceSnapshot(data, { includeRawData: true }) });
});

developerSpacesRouter.post("/ingest/import", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;
  if (!(await enforceIngestionRateLimit(res, ingestion))) return;

  const parsed = batchImportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));
  const usageDelta = {
    nodes: parsed.data.nodes.length,
    events: parsed.data.events.length,
    snapshots: parsed.data.snapshots.length,
    storageBytes: estimateDeveloperSpaceStorageBytes(req.body),
  };
  if (!(await enforceUsageQuota(res, space, usageDelta))) return;

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const nodes = [];

  for (const nodeInput of parsed.data.nodes) {
    const { data: node, error } = await sb
      .from("developer_space_nodes")
      .upsert({
        developer_space_id: space.id,
        external_id: nodeInput.nodeId,
        node_name: nodeInput.nodeName ?? nodeInput.nodeId,
        topology_type: nodeInput.topologyType,
        fragment_count: nodeInput.fragmentCount,
        self_similarity_score: nodeInput.selfSimilarityScore ?? null,
        dimensionality: nodeInput.dimensionality ?? null,
        metrics: nodeInput.metrics,
        last_event_at: now,
      }, { onConflict: "developer_space_id,external_id" })
      .select("*")
      .single();
    if (error) return res.status(500).json(ingestionServerError("Could not import Developer Space node."));
    nodes.push(node);
  }

  const eventsPayload = [];
  for (const event of parsed.data.events) {
    const node = await findNodeByExternalId(space.id, event.nodeId);
    eventsPayload.push({
      developer_space_id: space.id,
      node_id: node?.id ?? null,
      external_node_id: event.nodeId ?? null,
      event_type: event.eventType,
      event_label: event.eventLabel ?? null,
      event_data: event.eventData,
      similarity_score: event.similarityScore ?? null,
      source_refs: normaliseSourceRefs(event.sourceRefs),
      provenance: event.provenance,
      visibility: event.visibility,
      occurred_at: event.occurredAt ?? now,
    });
  }

  const snapshotsPayload = parsed.data.snapshots.map((snapshot) => ({
    developer_space_id: space.id,
    snapshot_data: snapshot.snapshotData,
    source_refs: normaliseSourceRefs(snapshot.sourceRefs),
    provenance: snapshot.provenance,
    visibility: snapshot.visibility,
    occurred_at: snapshot.occurredAt ?? now,
  }));

  if (eventsPayload.length > 0) {
    const { error } = await sb.from("developer_space_events").insert(eventsPayload);
    if (error) return res.status(500).json(ingestionServerError("Could not import Developer Space events."));
  }

  if (snapshotsPayload.length > 0) {
    const { error } = await sb.from("developer_space_snapshots").insert(snapshotsPayload);
    if (error) return res.status(500).json(ingestionServerError("Could not import Developer Space snapshots."));
  }

  await recordUsageSilently(space, usageDelta);
  broadcastDeveloperSpaceIngestion({
    slug: space.slug,
    source: "import",
    counts: {
      nodes: nodes.length,
      events: eventsPayload.length,
      snapshots: snapshotsPayload.length,
    },
  });

  return res.status(202).json({
    imported: {
      nodes: nodes.length,
      events: eventsPayload.length,
      snapshots: snapshotsPayload.length,
    },
  });
});


// -- Public gallery for Discover-style browsing -------------------------------
developerSpacesRouter.get("/public", optionalAuth, async (_req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(24);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ spaces: (data ?? []).map((space) => serializeDeveloperSpace(space, { includeOperationalFields: false })) });
});

// -- User-facing Developer Space management -----------------------------------
developerSpacesRouter.get("/", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("owner_user_id", req.user!.id)
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const assignedProjectIds = Array.from(new Set((data ?? [])
    .map((space) => space.project_id)
    .filter((projectId): projectId is string => typeof projectId === "string" && projectId.length > 0)));

  const { data: projects, error: projectsError } = assignedProjectIds.length > 0
    ? await sb
      .from("projects")
      .select("id, name, slug")
      .eq("owner_user_id", req.user!.id)
    : { data: [], error: null };

  if (projectsError) return res.status(500).json({ error: projectsError.message });

  const ownerProjectsById = new Map((projects ?? []).map((project) => [project.id, project]));
  return res.json({
    spaces: (data ?? []).map((space) => {
      const assignment = space.project_id ? ownerProjectsById.get(space.project_id) ?? null : null;
      return {
        ...serializeDeveloperSpace(space),
        projectId: assignment?.id ?? null,
        assignedProjectName: assignment?.name ?? null,
        assignedProjectSlug: assignment?.slug ?? null,
      };
    }),
  });
});

developerSpacesRouter.post("/", requireAuth, requireTier("canon"), async (req, res) => {
  const parsed = createSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const slug = parsed.data.slug ?? slugifyProjectName(parsed.data.projectName);

  const { count } = await sb
    .from("developer_spaces")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", req.user!.id);

  const authUser: AuthUser = {
    id: req.user!.id,
    tier: req.user!.tier,
    isAdmin: req.user!.isAdmin,
    email: req.user!.email,
  };

  if (!canCreateDeveloperSpace(authUser, count ?? 0)) {
    return res.status(403).json({
      error: "You have reached the Developer Space limit for your tier. Upgrade to create more.",
    });
  }

  const { data, error } = await sb
    .from("developer_spaces")
    .insert({
      owner_user_id: req.user!.id,
      project_name: parsed.data.projectName,
      slug,
      description: parsed.data.description ?? null,
      visibility: parsed.data.visibility,
      provider_policy: parsed.data.providerPolicy,
      visualisation_type: parsed.data.visualisationType,
      visualisation_config: parsed.data.visualisationConfig,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.post("/:id/api-key", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: space, error: loadError } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (loadError || !space) return res.status(404).json({ error: "Developer Space not found." });
  if (space.owner_user_id !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Not authorised." });
  }

  const apiKey = generateDeveloperSpaceApiKey();
  const apiKeyHash = hashDeveloperSpaceApiKey(apiKey);
  const now = new Date().toISOString();

  await sb
    .from("developer_space_ingestion_keys")
    .update({ status: "revoked", revoked_at: now })
    .eq("developer_space_id", space.id)
    .eq("status", "active");

  const { error: keyError } = await sb
    .from("developer_space_ingestion_keys")
    .insert({
      developer_space_id: space.id,
      owner_user_id: space.owner_user_id,
      key_hash: apiKeyHash,
      key_last_four: apiKey.slice(-4),
      label: "Default ingestion key",
      status: "active",
    })
    .select("*")
    .single();

  if (keyError) return res.status(500).json({ error: keyError.message });

  const { data, error } = await sb
    .from("developer_spaces")
    .update({
      api_key_hash: apiKeyHash,
      api_key_last_four: apiKey.slice(-4),
      api_key_created_at: now,
    })
    .eq("id", space.id)
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not rotate API key." });
  return res.status(201).json({ apiKey, space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.post("/:id/api-key/revoke", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: space, error: loadError } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (loadError || !space) return res.status(404).json({ error: "Developer Space not found." });
  if (space.owner_user_id !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Not authorised." });
  }

  const now = new Date().toISOString();
  await sb
    .from("developer_space_ingestion_keys")
    .update({ status: "revoked", revoked_at: now })
    .eq("developer_space_id", space.id)
    .eq("status", "active");

  const { data, error } = await sb
    .from("developer_spaces")
    .update({
      api_key_hash: null,
      api_key_last_four: null,
      api_key_created_at: null,
    })
    .eq("id", space.id)
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not revoke API key." });
  return res.json({ space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.post("/:id/provider-policy/evaluate", requireAuth, async (req, res) => {
  const parsed = providerPolicyEvaluationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const requestedContext = parsed.data.privateArchiveRequested
    ? "private_archive"
    : parsed.data.requestedContext;
  const decision = evaluateDeveloperSpaceProviderPolicy({
    providerPolicy: ownerLoad.space.provider_policy,
    requestedContext,
    providerMode: parsed.data.providerMode,
  });
  const posture = buildDeveloperSpaceProviderPosture(decision);

  const metadata = {
    domain: "developer_space",
    developerSpaceId: ownerLoad.space.id,
    providerPolicy: decision.providerPolicy,
    requestedContext: decision.requestedContext,
    providerMode: decision.providerMode,
    allowed: decision.allowed,
    denialReason: decision.denialReason,
    providerPosture: posture,
  };
  const trace = await startAiTrace({
    ownerUserId: req.user!.id,
    source: "system",
    metadata,
  });
  await recordAiTraceEvent({
    traceId: trace?.id,
    ownerUserId: req.user!.id,
    eventType: "tool_call",
    label: "Developer Space provider policy evaluation",
    status: decision.allowed ? "completed" : "skipped",
    provider: decision.providerMode,
    payload: {
      ...decision.observability,
      providerPosture: posture,
    },
  });
  await completeAiTrace({ traceId: trace?.id });

  const responseDecision = { ...decision, posture };
  if (!decision.allowed) return res.status(403).json({ decision: responseDecision });
  return res.json({ decision: responseDecision });
});

developerSpacesRouter.post("/:id/documents", requireAuth, async (req, res) => {
  const parsed = attachDocumentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const { data: document, error: documentError } = await sb
    .from("documents")
    .select("*")
    .eq("id", parsed.data.documentId)
    .single();

  if (documentError || !document) return res.status(404).json({ error: "Document not found." });
  if (document.author_user_id !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Not authorised for that document." });
  }

  if (parsed.data.linkVisibility === "public" && !isPublicSafeLinkedDocument(document)) {
    return res.status(400).json({
      error: "Public Developer Space links require a published public document.",
    });
  }

  const { data: link, error } = await sb
    .from("developer_space_documents")
    .upsert({
      developer_space_id: ownerLoad.space.id,
      document_id: document.id,
      owner_user_id: ownerLoad.space.owner_user_id,
      document_role: parsed.data.role,
      link_visibility: parsed.data.linkVisibility,
      sort_order: parsed.data.sortOrder,
    }, { onConflict: "developer_space_id,document_id" })
    .select("*")
    .single();

  if (error || !link) return res.status(500).json({ error: error?.message ?? "Could not link document." });

  const linkedDocuments = await loadLinkedDocumentsForSpace(ownerLoad.space, "owner");
  return res.status(201).json({
    link: serializeDeveloperSpaceLinkedDocument(link, document),
    linkedDocuments: linkedDocuments.linkedDocuments,
  });
});

developerSpacesRouter.post("/:id/documents/template", requireAuth, async (req, res) => {
  const parsed = templateDocumentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const linkVisibility: DeveloperSpaceDocumentLinkVisibility =
    parsed.data.publish || parsed.data.linkVisibility === "public" ? "public" : "owner";
  const publishPublic = linkVisibility === "public";
  const now = new Date().toISOString();
  const title = parsed.data.title?.trim() || defaultTemplateTitle(ownerLoad.space.project_name, parsed.data.role);
  const slug = await uniqueDocumentSlug(req.user!.id, title);

  const { data: document, error: documentError } = await sb
    .from("documents")
    .insert({
      author_user_id: req.user!.id,
      space_id: null,
      persona_id: null,
      title,
      slug,
      body: parsed.data.body ?? defaultTemplateBody(ownerLoad.space.project_name, parsed.data.role),
      document_type: documentTypeForRole(parsed.data.role),
      status: publishPublic ? "published" : "draft",
      visibility: publishPublic ? "public" : "private",
      comments_enabled: publishPublic,
      published_at: publishPublic ? now : null,
      provenance_type: "user_authored",
      source_type: "manual",
      source_id: ownerLoad.space.id,
      source_label: `Developer Space: ${ownerLoad.space.project_name}`,
      source_persona_id: null,
    })
    .select("*")
    .single();

  if (documentError || !document) {
    return res.status(500).json({ error: documentError?.message ?? "Could not create document." });
  }

  const { data: link, error: linkError } = await sb
    .from("developer_space_documents")
    .insert({
      developer_space_id: ownerLoad.space.id,
      document_id: document.id,
      owner_user_id: ownerLoad.space.owner_user_id,
      document_role: parsed.data.role,
      link_visibility: linkVisibility,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (linkError || !link) return res.status(500).json({ error: linkError?.message ?? "Could not link document." });

  const linkedDocuments = await loadLinkedDocumentsForSpace(ownerLoad.space, "owner");
  return res.status(201).json({
    link: serializeDeveloperSpaceLinkedDocument(link, document),
    document,
    linkedDocuments: linkedDocuments.linkedDocuments,
  });
});

developerSpacesRouter.patch("/:id/project", requireAuth, async (req, res) => {
  const parsed = attachProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: space, error: spaceError } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (spaceError || !space) return res.status(404).json({ error: "Developer Space not found." });
  if (space.owner_user_id !== req.user!.id) return res.status(403).json({ error: "Not authorised." });

  if (parsed.data.projectId !== null) {
    const { data: project, error: projectError } = await sb
      .from("projects")
      .select("id")
      .eq("id", parsed.data.projectId)
      .eq("owner_user_id", req.user!.id)
      .maybeSingle();

    if (projectError) return res.status(500).json({ error: projectError.message });
    if (!project) return res.status(404).json({ error: "Project not found." });
  }

  const { data, error } = await sb
    .from("developer_spaces")
    .update({ project_id: parsed.data.projectId })
    .eq("id", space.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not update Developer Space project." });

  const { error: usageError } = await sb
    .from("developer_space_usage")
    .upsert({
      developer_space_id: space.id,
      owner_user_id: space.owner_user_id,
      project_id: parsed.data.projectId,
    }, { onConflict: "developer_space_id" })
    .select("developer_space_id")
    .single();

  if (usageError) return res.status(500).json({ error: usageError.message });

  return res.json({ space: serializeDeveloperSpace(data), projectId: data.project_id ?? null });
});

developerSpacesRouter.get("/:id/usage", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  try {
    const usage = await getDeveloperSpaceUsage(ownerLoad.space);
    return res.json({ usage });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Could not load usage." });
  }
});

developerSpacesRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.projectName !== undefined) updatePayload.project_name = parsed.data.projectName;
  if (parsed.data.slug !== undefined) updatePayload.slug = parsed.data.slug;
  if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
  if (parsed.data.visibility !== undefined) updatePayload.visibility = parsed.data.visibility;
  if (parsed.data.providerPolicy !== undefined) updatePayload.provider_policy = parsed.data.providerPolicy;
  if (parsed.data.visualisationType !== undefined) updatePayload.visualisation_type = parsed.data.visualisationType;
  if (parsed.data.visualisationConfig !== undefined) updatePayload.visualisation_config = parsed.data.visualisationConfig;

  const { data, error } = await sb
    .from("developer_spaces")
    .update(updatePayload)
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Developer Space not found." });
  return res.json({ space: serializeDeveloperSpace(data) });
});

// -- Public/community/owner observatory view ----------------------------------
developerSpacesRouter.get("/:slug/stream", optionalAuth, async (req, res) => {
  await attachSseQueryUser(req);
  const initial = await buildDeveloperSpaceLiveUpdate(req.params.slug, req.user);
  if (initial.status !== 200) return res.status(initial.status).json({ error: initial.error });
  if (initial.update.detail.access !== "owner") {
    await recordUsageSilently({
      id: initial.update.detail.space.id,
      owner_user_id: initial.update.detail.space.ownerUserId,
    }, { publicReads: 1 });
  }

  const once = req.query.once === "1";
  const lastEventId = typeof req.headers["last-event-id"] === "string" ? req.headers["last-event-id"] : null;
  let lastStreamId = lastEventId;

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  function emitUpdate(update: DeveloperSpaceLiveUpdate, force = false) {
    if (!force && update.freshness.streamId === lastStreamId) {
      writeSseHeartbeat(res);
      return;
    }
    lastStreamId = update.freshness.streamId;
    writeSse(res, "developer_space.update", update, update.freshness.streamId);
  }

  emitUpdate(initial.update, lastStreamId === null || once);
  if (once) {
    res.end();
    return;
  }

  const timer = setInterval(async () => {
    const next = await buildDeveloperSpaceLiveUpdate(req.params.slug, req.user);
    if (next.status !== 200) {
      writeSse(res, "developer_space.error", { error: next.error }, new Date().toISOString());
      clearInterval(timer);
      res.end();
      return;
    }
    emitUpdate(next.update);
  }, SSE_POLL_MS);

  req.on("close", () => clearInterval(timer));
});

developerSpacesRouter.get("/:slug", optionalAuth, async (req, res) => {
  const result = await buildDeveloperSpaceLiveUpdate(req.params.slug, req.user);
  if (result.status !== 200) return res.status(result.status).json({ error: result.error });
  if (result.update.detail.access !== "owner") {
    await recordUsageSilently({
      id: result.update.detail.space.id,
      owner_user_id: result.update.detail.space.ownerUserId,
    }, { publicReads: 1 });
  }
  return res.json(result.update.detail);
});
