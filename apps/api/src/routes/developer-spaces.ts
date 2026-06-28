import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { describePlatformProviderRoute } from "@station/ai";
import type {
  DeveloperSpaceAgentAuditExport,
  DeveloperSpaceAgentAuditExportAction,
  DeveloperSpaceAgentAuditExportArtifact,
  DeveloperSpaceAgentAuditExportItem,
  DeveloperSpaceAgentConfirmationRecord,
  DeveloperSpaceAgentConfirmationStatus,
  DeveloperSpaceAgentExecutionReceiptAction,
  DeveloperSpaceAgentExecutionReceiptRecord,
  DeveloperSpaceAgentActionPreview,
  DeveloperSpaceAgentActionRegistryEntry,
  DeveloperSpaceAgentAllowedAction,
  DeveloperSpaceAgentFutureAction,
  DeveloperSpaceAgentLayoutSuggestion,
  DeveloperSpaceAgentRunJobReadiness,
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
  decryptDeveloperSpaceWebhookSigningSecret,
  developerSpaceWebhookSigningSecretEncryptionConfigured,
  encryptDeveloperSpaceWebhookSigningSecret,
  evaluateDeveloperSpaceProviderPolicy,
  extractDeveloperApiKey,
  fingerprintDeveloperSpaceWebhookSigningSecret,
  generateDeveloperSpaceApiKey,
  generateDeveloperSpaceWebhookSigningSecret,
  hashDeveloperSpaceApiKey,
  hashDeveloperSpaceWebhookSigningSecret,
  normaliseDeveloperSpacePublicFieldControls,
  normaliseSourceRefs,
  observedRuntimeClassificationMetadata,
  prepareObservedRuntimeClassifiedData,
  serializeDeveloperSpace,
  serializeDeveloperSpaceEvent,
  serializeDeveloperSpaceLinkedDocument,
  serializeDeveloperSpaceNode,
  serializeDeveloperSpaceObservedRuntimeContext,
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
import { sanitizeJobErrorMessage } from "../services/background-jobs.service";
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
const observedRuntimeContextTypeSchema = z.enum(["zone", "resource", "edge", "provenance"]);
const documentRoleSchema = z.enum(["methodology", "finding", "field_log", "note"]);
const documentLinkVisibilitySchema = z.enum(["owner", "public"]);
const sourceRefsSchema = z.array(z.string().max(500)).max(24).default([]);
const observedRuntimeFieldVisibilitySchema = z.enum(["public", "member", "owner", "private", "secret"]);
const observedRuntimeFieldClassificationsSchema = z.record(observedRuntimeFieldVisibilitySchema).optional();
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
const DEFAULT_OBSERVED_RUNTIME_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS = 300;
const DEVELOPER_SPACE_AGENT_ALLOWED_ACTIONS: readonly DeveloperSpaceAgentAllowedAction[] = [
  "read_developer_space_brief",
  "read_observed_runtime_status",
  "read_provider_policy_posture",
  "read_evidence_path",
  "read_logs",
  "draft_project_update",
];
const DEVELOPER_SPACE_AGENT_FUTURE_ACTIONS: readonly DeveloperSpaceAgentFutureAction[] = [
  "publish_to_page",
  "update_layout",
  "push_to_repo",
  "run_job",
  "update_observatory",
  "request_capability",
  "save_project_update_draft",
  "rotate_ingestion_key",
  "create_webhook_signing_secret",
];
const DEVELOPER_SPACE_AGENT_ACTION_REGISTRY: readonly DeveloperSpaceAgentActionRegistryEntry[] = [
  {
    action: "read_developer_space_brief",
    label: "Read Developer Space brief",
    description: "Summarize owner-visible Space posture, counts, and route hints without raw payloads.",
    mode: "read",
    requiresConfirmation: false,
    futureLane: false,
  },
  {
    action: "read_observed_runtime_status",
    label: "Read observed runtime status",
    description: "Read counts, latest timestamps, event labels, and node labels without metrics or event payloads.",
    mode: "read",
    requiresConfirmation: false,
    futureLane: false,
  },
  {
    action: "read_provider_policy_posture",
    label: "Read provider policy posture",
    description: "Preview provider policy gates and platform/owner BYOK posture without provider execution.",
    mode: "read",
    requiresConfirmation: false,
    futureLane: false,
  },
  {
    action: "read_evidence_path",
    label: "Read evidence path",
    description: "List linked evidence titles, roles, publication states, and visibility without document body excerpts.",
    mode: "read",
    requiresConfirmation: false,
    futureLane: false,
  },
  {
    action: "read_logs",
    label: "Read activity log",
    description: "Summarize recent owner-visible Developer Space activity from existing Station data without raw logs or payloads.",
    mode: "read",
    requiresConfirmation: false,
    futureLane: false,
  },
  {
    action: "draft_project_update",
    label: "Draft project update",
    description: "Draft owner-review copy from safe counts and labels; nothing is published.",
    mode: "draft_preview",
    requiresConfirmation: true,
    futureLane: false,
  },
  ...DEVELOPER_SPACE_AGENT_FUTURE_ACTIONS.map((action) => ({
    action,
    label: action.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase()),
    description: action === "save_project_update_draft"
      ? "Confirmed owner action that saves a private linked project-update draft without publishing."
      : action === "publish_to_page"
        ? "Confirmed owner action that publishes a selected reviewed private draft to the public Developer Space evidence path."
      : action === "update_observatory"
        ? "Confirmed owner action that publishes one sanitized public observatory status note."
      : "Registered future Phase 2D vocabulary. This PR does not execute or mutate this action.",
    mode: "future" as const,
    requiresConfirmation: true,
    futureLane: true,
  })),
];
const DEVELOPER_SPACE_AGENT_ALLOWED_ACTION_SET = new Set<string>(DEVELOPER_SPACE_AGENT_ALLOWED_ACTIONS);
const DEVELOPER_SPACE_AGENT_FUTURE_ACTION_SET = new Set<string>(DEVELOPER_SPACE_AGENT_FUTURE_ACTIONS);
const DEVELOPER_SPACE_AGENT_CONFIRMATION_DEFAULT_EXPIRY_MINUTES = 24 * 60;
const DEVELOPER_SPACE_AGENT_CONFIRMATION_MAX_EXPIRY_MINUTES = 7 * 24 * 60;
const DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION: DeveloperSpaceAgentExecutionReceiptAction = "request_capability";
const DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION: DeveloperSpaceAgentExecutionReceiptAction = "save_project_update_draft";
const DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION: DeveloperSpaceAgentExecutionReceiptAction = "publish_to_page";
const DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION: DeveloperSpaceAgentExecutionReceiptAction = "update_observatory";
const DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION: DeveloperSpaceAgentFutureAction = "update_layout";
const DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION: DeveloperSpaceAgentFutureAction = "run_job";
const DEVELOPER_SPACE_AGENT_STATUS_NOTE_MAX_LENGTH = 360;
const DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE = "developer_agent.status_note";
const DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_CATEGORIES = [
  "provider_config",
  "cache_config",
  "cloudflare_adapter",
  "repo_access",
  "railway_env",
  "supabase_schema",
  "stripe_webhook",
  "worker_runtime",
  "human_review",
  "roadmap_decision",
] as const;
const DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_DEFAULT_CATEGORY = "roadmap_decision";
const DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_DEFAULT_SUMMARY =
  "Review this requested capability before opening a new implementation lane.";
const DEVELOPER_SPACE_AGENT_SECRET_SHAPED_TEXT_PATTERN = new RegExp([
  String.raw`\b(?:postgres(?:ql)?|redis|mysql):\/\/\S+`,
  String.raw`https?:\/\/[^/\s:@]+:[^/\s@]+@`,
  String.raw`bearer\s+[a-z0-9._~+/-]+=*`,
  String.raw`\b(?:sk|pk|rk|whsec|ghp|pat)[_-][a-z0-9._-]+\b`,
  String.raw`\bgithub` + String.raw`_pat_[a-z0-9_]+\b`,
  String.raw`\bxox` + String.raw`[baprs]?-[a-z0-9-]+\b`,
  String.raw`\bA` + String.raw`KIA[0-9A-Z]{16}\b`,
  String.raw`\bAI` + String.raw`za[0-9A-Za-z_-]{35}\b`,
  String.raw`eyJ[a-z0-9_-]{20,}`,
  String.raw`-{5}BEGIN`,
  String.raw`\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b`,
  String.raw`\b(?:authorization|cookie|token|api[\s_-]?key|x[\s_-]?api[\s_-]?key|service[\s_-]?role|secret|password|webhook[\s_-]?secret|db[\s_-]?url|database[\s_-]?url)\s*[:=]\s*[^,;]+`,
  String.raw`\b(?:(?:raw|private|system|user)[\s_-]?prompt|prompt|completion|provider[\s_-]?payload|private[\s_-]?text|raw[\s_-]?body|archive[\s_-]?excerpt)\s*[:=]\s*[^.;]+`,
].join("|"), "i");
const DEVELOPER_SPACE_AGENT_EXECUTABLE_ACTIONS = new Set<string>([
  DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION,
  DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION,
  DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION,
  DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
]);
const DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTIONS: readonly DeveloperSpaceAgentAuditExportAction[] = [
  DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION,
  DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION,
  DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION,
  DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
  DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION,
  DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION,
];
const DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTION_SET = new Set<string>(DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTIONS);
const DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_LIMIT = 100;
const DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_OMITTED_FIELDS = [
  "owner_user_id",
  "developer_space_id",
  "confirmation_id",
  "receipt_id",
  "preview_hash",
  "target_document_id",
  "dedupe_key",
  "document_body",
  "raw_prompt",
  "provider_payload",
  "tokens",
  "cookies",
  "keys",
  "connection_strings",
  "shell_command",
  "job_payload",
  "queue_payload",
] as const;
const DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_BOUNDARIES = [
  "No live Developer Space visual config was changed.",
  "No public observatory output changed.",
  "No provider call, job, worker, repo, deploy, billing, key, signing secret, Cloudflare, Redis, Railway, or Supabase config action ran.",
  "The suggestion records minimized labels and summaries only; raw config, route ids, prompts, provider payloads, keys, tokens, cookies, and connection strings are omitted.",
];
const DEVELOPER_SPACE_AGENT_VISUAL_MODE_LABELS: Record<string, string> = {
  node_field: "Node field",
  timeline: "Timeline",
  world_map: "World map",
  constellation: "Constellation",
};
const DEVELOPER_SPACE_AGENT_DEFAULT_WIDGETS = [
  { type: "visualisation", title: "Live visualisation", zone: "main", position: 0, visible: true },
  { type: "event_stream", title: "Event stream", zone: "main", position: 1, visible: true },
  { type: "reading_guide", title: "How to read this", zone: "side", position: 0, visible: true },
  { type: "project_notes", title: "Project notes", zone: "side", position: 1, visible: true },
  { type: "current_nodes", title: "Current nodes", zone: "side", position: 2, visible: true },
  { type: "latest_snapshot", title: "Latest snapshot", zone: "side", position: 3, visible: true },
] as const;
const DEVELOPER_SPACE_AGENT_RUN_JOB_BOUNDARIES = [
  "No job was executed.",
  "No worker, queue, shell, provider, external dispatch, Redis, Upstash, deploy, repo, billing, key, signing secret, Railway, Supabase config, or Cloudflare action ran.",
  "No receipt was created because run_job is not executable in this lane.",
  "Readiness metadata omits commands, queue payloads, prompts, provider payloads, raw ids, keys, tokens, cookies, and connection strings.",
];
const DEVELOPER_SPACE_AGENT_RUN_JOB_OMITTED_FIELDS = [
  "shell_command",
  "queue_payload",
  "worker_payload",
  "provider_payload",
  "prompt",
  "raw_ids",
  "tokens",
  "cookies",
  "keys",
  "connection_strings",
] as const;
const DEVELOPER_SPACE_AGENT_RUN_JOB_TARGETS = [
  {
    key: "developer_space_replay",
    label: "Developer Space replay readiness check",
    prerequisites: [
      "Named owner-scoped job target",
      "Timeout budget",
      "Retry policy",
      "Idempotency key",
      "Owner-visible status readback",
      "Worker or queue implementation accepted by a later lane",
    ],
  },
  {
    key: "export_package",
    label: "Export package assembly readiness check",
    prerequisites: [
      "Owner-scoped package target",
      "Retryable package status",
      "Idempotency key",
      "Failed-package readback",
      "Worker or queue implementation accepted by a later lane",
    ],
  },
  {
    key: "archive_import",
    label: "Archive import backfill readiness check",
    prerequisites: [
      "Owner-scoped import target",
      "Storage reservation plan",
      "Retry policy",
      "Idempotency key",
      "Owner-visible failure status",
      "Worker or queue implementation accepted by a later lane",
    ],
  },
] as const;
const DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_BOUNDARIES = [
  "No autonomous agent loop ran.",
  "No provider call was made.",
  "No document, layout, key, signing secret, repo, deploy, worker, billing, export, webhook, or observed-runtime target was mutated.",
];
const DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_BOUNDARIES = [
  "No autonomous agent loop ran.",
  "No provider call was made.",
  "No public page, layout, key, signing secret, repo, deploy, worker, billing, export, webhook, or observed-runtime target was mutated.",
  "A private owner-only draft document was saved for human review.",
];
const DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_BOUNDARIES = [
  "No autonomous agent loop ran.",
  "No provider call was made.",
  "Only the selected owner-reviewed private draft document was published.",
  "No layout, key, signing secret, repo, deploy, worker, billing, export, webhook, or observed-runtime target was mutated.",
  "Receipt metadata omits document bodies, route-only ids, prompts, provider payloads, keys, tokens, cookies, environment values, and preview hashes.",
];
const DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES = [
  "No autonomous agent loop ran.",
  "No provider call was made.",
  "Only one owner-approved public status note event was created.",
  "No layout, key, signing secret, repo, deploy, worker, billing, export, webhook, document body, or observed-runtime target was mutated.",
  "Receipt metadata omits raw ids, prompts, provider payloads, keys, tokens, cookies, environment values, and preview hashes.",
];

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

function ingestionSignatureError(code: string, error: string) {
  return ingestionErrorBody({ error, code, category: "auth" });
}

function signingSecretConfigError() {
  return ingestionErrorBody({
    error: "Developer Space webhook signing secret encryption is not configured.",
    code: "developer_space_webhook_signing_secret_encryption_unconfigured",
    category: "server",
  });
}

const DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES = {
  rotateApiKey: {
    error: "Could not rotate Developer Space API key.",
    code: "developer_space_api_key_rotate_failed",
  },
  loadIngestionKeys: {
    error: "Could not load Developer Space ingestion keys.",
    code: "developer_space_ingestion_key_load_failed",
  },
  createIngestionKey: {
    error: "Could not create Developer Space ingestion key.",
    code: "developer_space_ingestion_key_create_failed",
  },
  revokeIngestionKey: {
    error: "Could not revoke Developer Space ingestion key.",
    code: "developer_space_ingestion_key_revoke_failed",
  },
  revokeApiKey: {
    error: "Could not revoke Developer Space API key.",
    code: "developer_space_api_key_revoke_failed",
  },
  createSigningSecret: {
    error: "Could not create Developer Space webhook signing secret.",
    code: "developer_space_webhook_signing_secret_create_failed",
  },
  revokeSigningSecret: {
    error: "Could not revoke Developer Space webhook signing secret.",
    code: "developer_space_webhook_signing_secret_revoke_failed",
  },
} as const;

function ingestionValidationError(error: z.ZodError) {
  return ingestionErrorBody({
    error: "Developer Space ingestion payload failed validation.",
    code: "developer_space_validation_failed",
    category: "validation",
    details: error.flatten(),
  });
}

function ingestionClassificationValidationError(error: unknown) {
  return ingestionErrorBody({
    error: "Developer Space observed-runtime classifications failed validation.",
    code: "developer_space_observed_runtime_classification_failed",
    category: "validation",
    details: error instanceof Error ? error.message : "Invalid observed-runtime classifications.",
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
  fieldClassifications: observedRuntimeFieldClassificationsSchema,
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
});

const eventSchema = z.object({
  eventType: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.:-]+$/),
  eventLabel: z.string().max(220).optional(),
  nodeId: z.string().min(1).max(160).optional(),
  eventData: jsonObjectSchema.default({}),
  fieldClassifications: observedRuntimeFieldClassificationsSchema,
  similarityScore: z.number().min(0).max(1).nullable().optional(),
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const snapshotSchema = z.object({
  snapshotData: jsonObjectSchema,
  fieldClassifications: observedRuntimeFieldClassificationsSchema,
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const observedRuntimeContextSchema = z.object({
  contextType: observedRuntimeContextTypeSchema,
  externalId: z.string().min(1).max(160).optional(),
  sourceRef: z.string().min(1).max(500).optional(),
  payload: jsonObjectSchema,
  fieldClassifications: observedRuntimeFieldClassificationsSchema,
  provenance: provenanceSchema.default("imported"),
  occurredAt: z.string().datetime().optional(),
});

const batchImportSchema = z.object({
  nodes: z.array(nodeStateSchema.extend({ nodeId: z.string().min(1).max(160) })).max(250).default([]),
  events: z.array(eventSchema).max(500).default([]),
  snapshots: z.array(snapshotSchema).max(100).default([]),
  supportingContext: z.array(observedRuntimeContextSchema).max(500).default([]),
});

const observedRuntimeWebhookSchema = z.object({
  schema: z.literal("station.observed_runtime.webhook.v1"),
  deliveryId: z.string().min(8).max(160).optional(),
  source: z.object({
    runtimeHostedBy: z.literal("external"),
    stationRole: z.literal("observer"),
  }).passthrough(),
  observedAt: z.string().datetime(),
  payload: batchImportSchema,
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

const createIngestionKeySchema = z.object({
  label: z.string().trim().min(1).max(80).default("Named ingestion key"),
});

const templateDocumentSchema = z.object({
  role: documentRoleSchema.default("note"),
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(100_000).optional(),
  linkVisibility: documentLinkVisibilitySchema.default("owner"),
  publish: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

const developerSpaceAgentActionPreviewSchema = z.object({
  action: z.string().trim().min(1).max(80).regex(/^[a-z0-9_:-]+$/),
  input: jsonObjectSchema.default({}),
});

const capabilityRequestCategorySchema = z.enum(DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_CATEGORIES);
const developerSpaceAgentStatusNoteSchema = z.string().trim().min(1).max(DEVELOPER_SPACE_AGENT_STATUS_NOTE_MAX_LENGTH);

const createDeveloperSpaceAgentConfirmationSchema = z.object({
  action: z.string().trim().min(1).max(80).regex(/^[a-z0-9_:-]+$/),
  targetDocumentId: z.string().trim().min(1).max(120).optional(),
  capabilityCategory: capabilityRequestCategorySchema.optional(),
  capabilitySummary: z.string().trim().min(1).max(600).optional(),
  statusNote: developerSpaceAgentStatusNoteSchema.optional(),
  input: z.object({
    category: capabilityRequestCategorySchema.optional(),
    summary: z.string().trim().min(1).max(600).optional(),
    statusNote: developerSpaceAgentStatusNoteSchema.optional(),
  }).passthrough().optional(),
  expiresInMinutes: z.number().int().min(5).max(DEVELOPER_SPACE_AGENT_CONFIRMATION_MAX_EXPIRY_MINUTES)
    .default(DEVELOPER_SPACE_AGENT_CONFIRMATION_DEFAULT_EXPIRY_MINUTES),
}).superRefine((value, ctx) => {
  if (value.action === DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION) {
    const category = value.capabilityCategory ?? value.input?.category;
    const summary = value.capabilitySummary ?? value.input?.summary;
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilityCategory"],
        message: "Capability request category is required.",
      });
    }
    if (!summary?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilitySummary"],
        message: "Capability request summary is required.",
      });
    }

    const unsafeInput = developerSpaceAgentUnsafeCapabilityInputReason(value.input ?? {});
    if (unsafeInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["input"],
        message: unsafeInput,
      });
    }
    if (summary && developerSpaceAgentSecretLikeText(summary)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilitySummary"],
        message: "Capability request summary must not include secret-like values.",
      });
    }
  }

  if (value.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    const statusNote = value.statusNote ?? value.input?.statusNote;
    if (!statusNote?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["statusNote"],
        message: "A selected observatory status note is required.",
      });
    }
    if (statusNote && developerSpaceAgentSecretLikeText(statusNote)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["statusNote"],
        message: "Observatory status note must not include secret-like values.",
      });
    }
    const unsafeInput = developerSpaceAgentUnsafeStatusNoteInputReason(value.input ?? {});
    if (unsafeInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["input"],
        message: unsafeInput,
      });
    }
  }

  if (value.action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION) {
    const unsafeInput = developerSpaceAgentUnsafeRunJobInputReason(value.input ?? {});
    if (unsafeInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["input"],
        message: unsafeInput,
      });
    }
  }
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

    return { space: keyedSpace, ingestionKeyId: ingestionKey.id as string, rawKey };
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

  return { space: data, ingestionKeyId: null, rawKey };
}

async function checkIngestionRateLimit(
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
    return {
      allowed: false as const,
      status: 500,
      body: ingestionServerError("Could not check Developer Space ingestion rate limit."),
    };
  }

  if (result.allowed) return { allowed: true as const };
  return {
    allowed: false as const,
    status: 429,
    body: ingestionRateLimitError({
      limit: result.limit,
      used: result.used,
      retryAfter: result.retryAfter ?? result.windowSeconds,
    }),
  };
}

async function enforceIngestionRateLimit(
  res: Response,
  input: { space: { id: string; owner_user_id: string }; ingestionKeyId: string | null }
) {
  const result = await checkIngestionRateLimit(input);
  if (result.allowed) return true;
  res.status(result.status).json(result.body);
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

function prefixObservedRuntimeMetadata(
  metadata: ReturnType<typeof prepareObservedRuntimeClassifiedData>["metadata"],
  prefix: string
) {
  if (!metadata) return null;
  return {
    schema: metadata.schema,
    fields: Object.fromEntries(
      Object.entries(metadata.fields).map(([path, visibility]) => [`${prefix}.${path}`, visibility])
    ),
  };
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

function serializeDeveloperSpaceIngestionKey(row: any) {
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    ownerUserId: row.owner_user_id,
    label: row.label ?? null,
    status: row.status,
    keyLastFour: row.key_last_four,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? null,
    revokedAt: row.revoked_at ?? null,
  };
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

type DeveloperSpaceAgentReadback = {
  nodes: any[];
  events: any[];
  snapshots: any[];
  supportingContext: any[];
  webhookReceipts: any[];
  agentConfirmations: any[];
  agentReceipts: any[];
  linkedDocuments: Awaited<ReturnType<typeof loadLinkedDocumentsForSpace>>["linkedDocuments"];
};

function developerSpaceAgentRegistry() {
  return DEVELOPER_SPACE_AGENT_ACTION_REGISTRY.map((entry) => ({ ...entry }));
}

function safeAgentText(value: unknown, fallback: string, maxLength = 160) {
  const raw = typeof value === "string" && value.trim() ? value : fallback;
  const sanitized = sanitizeJobErrorMessage(raw);
  const normalized = sanitized.trim() || fallback;
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3).trim()}...` : normalized;
}

function developerSpaceAgentCapabilityCategoryLabel(category: string) {
  return category
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function developerSpaceAgentCapabilityCategory(value: unknown) {
  return DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_CATEGORIES.includes(value as any)
    ? value as typeof DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_CATEGORIES[number]
    : DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_DEFAULT_CATEGORY;
}

function developerSpaceAgentSecretLikeText(value: string) {
  return DEVELOPER_SPACE_AGENT_SECRET_SHAPED_TEXT_PATTERN.test(value);
}

function developerSpaceAgentUnsafeCapabilityInputReason(value: unknown, path: string[] = []): string | null {
  if (!value || typeof value !== "object") {
    return typeof value === "string" && developerSpaceAgentSecretLikeText(value)
      ? "Capability request input must not include secret-like values."
      : null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = developerSpaceAgentUnsafeCapabilityInputReason(value[index], [...path, String(index)]);
      if (result) return result;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/token|secret|password|cookie|authorization|service[_-]?role|api[_-]?key|private[_-]?key|connection|string|database[_-]?url|pooler|raw[_-]?prompt|provider[_-]?payload/i.test(key)) {
      return "Capability request input includes an unsupported sensitive field.";
    }
    if (typeof child === "string" && developerSpaceAgentSecretLikeText(child)) {
      return "Capability request input must not include secret-like values.";
    }
    const result = developerSpaceAgentUnsafeCapabilityInputReason(child, [...path, key]);
    if (result) return result;
  }

  return null;
}

function developerSpaceAgentUnsafeStatusNoteInputReason(value: unknown, path: string[] = []): string | null {
  if (!value || typeof value !== "object") {
    return typeof value === "string" && developerSpaceAgentSecretLikeText(value)
      ? "Observatory status note input must not include secret-like values."
      : null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = developerSpaceAgentUnsafeStatusNoteInputReason(value[index], [...path, String(index)]);
      if (result) return result;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/token|secret|password|cookie|authorization|service[_-]?role|api[_-]?key|private[_-]?key|connection|string|database[_-]?url|pooler|raw[_-]?prompt|provider[_-]?payload|private[_-]?text|raw[_-]?body|archive[_-]?excerpt/i.test(key)) {
      return "Observatory status note input includes an unsupported sensitive field.";
    }
    if (typeof child === "string" && developerSpaceAgentSecretLikeText(child)) {
      return "Observatory status note input must not include secret-like values.";
    }
    const result = developerSpaceAgentUnsafeStatusNoteInputReason(child, [...path, key]);
    if (result) return result;
  }

  return null;
}

function developerSpaceAgentUnsafeRunJobInputReason(value: unknown, path: string[] = []): string | null {
  if (!value || typeof value !== "object") {
    return typeof value === "string" && developerSpaceAgentSecretLikeText(value)
      ? "Run-job readiness input must not include secret-like values."
      : null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = developerSpaceAgentUnsafeRunJobInputReason(value[index], [...path, String(index)]);
      if (result) return result;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/\bcmd\b|command|shell|script|argv|args|exec|spawn|queue[_-]?payload|worker[_-]?payload|job[_-]?payload|token|secret|password|cookie|authorization|service[_-]?role|api[_-]?key|private[_-]?key|connection|string|database[_-]?url|pooler|raw[_-]?prompt|provider[_-]?payload|private[_-]?text|raw[_-]?body|archive[_-]?excerpt/i.test(key)) {
      return "Run-job readiness input includes an unsupported execution or sensitive field.";
    }
    if (typeof child === "string" && developerSpaceAgentSecretLikeText(child)) {
      return "Run-job readiness input must not include secret-like values.";
    }
    const result = developerSpaceAgentUnsafeRunJobInputReason(child, [...path, key]);
    if (result) return result;
  }

  return null;
}

function developerSpaceAgentCapabilityRequest(input: {
  capabilityCategory?: unknown;
  capabilitySummary?: unknown;
  input?: Record<string, unknown>;
}) {
  const category = developerSpaceAgentCapabilityCategory(
    input.capabilityCategory ?? input.input?.category,
  );
  const summary = safeAgentText(
    input.capabilitySummary ?? input.input?.summary,
    DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_DEFAULT_SUMMARY,
    360,
  );
  return {
    category,
    categoryLabel: developerSpaceAgentCapabilityCategoryLabel(category),
    summary,
  };
}

type DeveloperSpaceAgentStatusNote = {
  note: string;
  eventType: string;
  eventLabel: string;
  visibility: "public";
  provenance: "user";
  occurredAt?: string | null;
};

function developerSpaceAgentStatusNote(input: {
  statusNote?: unknown;
  input?: Record<string, unknown>;
}): DeveloperSpaceAgentStatusNote | null {
  const rawNote = input.statusNote ?? input.input?.statusNote;
  if (typeof rawNote !== "string" || !rawNote.trim()) return null;
  const note = safeAgentText(
    rawNote,
    "",
    DEVELOPER_SPACE_AGENT_STATUS_NOTE_MAX_LENGTH,
  );
  if (!note) return null;
  return {
    note,
    eventType: DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE,
    eventLabel: `Status note: ${safeAgentText(note, "Project status update", 120)}`,
    visibility: "public",
    provenance: "user",
  };
}

function developerSpaceAgentStatusNoteFromPayload(payload: unknown): DeveloperSpaceAgentStatusNote {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const statusNote = record.statusNote && typeof record.statusNote === "object"
    ? record.statusNote as Record<string, unknown>
    : record;
  const note = safeAgentText(statusNote.note, "Owner-approved observatory status update.", DEVELOPER_SPACE_AGENT_STATUS_NOTE_MAX_LENGTH);
  const eventType = typeof statusNote.eventType === "string"
    ? safeAgentText(statusNote.eventType, DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE, 100)
    : DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE;
  return {
    note,
    eventType: eventType === DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE
      ? DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE
      : DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE,
    eventLabel: safeAgentText(statusNote.eventLabel, `Status note: ${safeAgentText(note, "Project status update", 120)}`, 160),
    visibility: "public",
    provenance: "user",
    occurredAt: typeof statusNote.occurredAt === "string" ? safeAgentText(statusNote.occurredAt, "", 80) : null,
  };
}

function developerSpaceAgentCapabilityRequestFromPayload(payload: unknown) {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const request = record.capabilityRequest && typeof record.capabilityRequest === "object"
    ? record.capabilityRequest as Record<string, unknown>
    : record;
  const category = developerSpaceAgentCapabilityCategory(request.category);
  return {
    category,
    categoryLabel: safeAgentText(
      request.categoryLabel,
      developerSpaceAgentCapabilityCategoryLabel(category),
      80,
    ),
    summary: safeAgentText(
      request.summary,
      DEVELOPER_SPACE_AGENT_CAPABILITY_REQUEST_DEFAULT_SUMMARY,
      360,
    ),
  };
}

function safeAgentFact(label: string, value: string | number | boolean | null | undefined) {
  return {
    label,
    value: typeof value === "string" ? safeAgentText(value, "unknown", 120) : value ?? null,
  };
}

type DeveloperSpaceAgentWidgetSummary = {
  type: string;
  title: string;
  zone: "main" | "side";
  position: number;
  visible: boolean;
};

function developerSpaceAgentVisualMode(value: unknown): DeveloperSpaceAgentLayoutSuggestion["currentVisualMode"] {
  return value === "timeline" || value === "world_map" || value === "constellation" || value === "node_field"
    ? value
    : "node_field";
}

function developerSpaceAgentVisualModeLabel(value: DeveloperSpaceAgentLayoutSuggestion["currentVisualMode"]) {
  return DEVELOPER_SPACE_AGENT_VISUAL_MODE_LABELS[value] ?? "Node field";
}

function developerSpaceAgentSuggestedVisualMode(
  currentMode: DeveloperSpaceAgentLayoutSuggestion["currentVisualMode"],
): DeveloperSpaceAgentLayoutSuggestion["suggestedVisualMode"] {
  return currentMode === "timeline" ? "constellation" : "timeline";
}

function developerSpaceAgentLayoutWidgets(config: unknown): DeveloperSpaceAgentWidgetSummary[] {
  const record = config && typeof config === "object" ? config as Record<string, unknown> : {};
  const provided = Array.isArray(record.widgets) ? record.widgets : [];
  const byType = new Map<string, Record<string, unknown>>();
  for (const value of provided) {
    if (!value || typeof value !== "object") continue;
    const widget = value as Record<string, unknown>;
    if (typeof widget.type !== "string") continue;
    if (!DEVELOPER_SPACE_AGENT_DEFAULT_WIDGETS.some((fallback) => fallback.type === widget.type)) continue;
    byType.set(widget.type, widget);
  }

  return DEVELOPER_SPACE_AGENT_DEFAULT_WIDGETS.map((fallback) => {
    const candidate = byType.get(fallback.type);
    const zone = candidate?.zone === "main" || candidate?.zone === "side"
      ? candidate.zone
      : fallback.zone;
    return {
      type: fallback.type,
      title: safeAgentAuditText(candidate?.title, fallback.title, 80),
      zone,
      position: typeof candidate?.position === "number" && Number.isFinite(candidate.position)
        ? Math.max(0, Math.floor(candidate.position))
        : fallback.position,
      visible: candidate?.visible !== false,
    };
  }).sort((left, right) => left.zone.localeCompare(right.zone) || left.position - right.position || left.title.localeCompare(right.title));
}

function developerSpaceAgentVisibleWidgetLabels(widgets: DeveloperSpaceAgentWidgetSummary[], zone: "main" | "side") {
  const labels = widgets
    .filter((widget) => widget.zone === zone && widget.visible)
    .sort((left, right) => left.position - right.position)
    .map((widget) => safeAgentAuditText(widget.title, "Widget", 80));
  return labels.length > 0 ? labels : ["none"];
}

function developerSpaceAgentWidgetLabel(widgets: DeveloperSpaceAgentWidgetSummary[], type: string, fallback: string) {
  return safeAgentAuditText(widgets.find((widget) => widget.type === type)?.title, fallback, 80);
}

function developerSpaceAgentLayoutSuggestion(space: any): DeveloperSpaceAgentLayoutSuggestion {
  const currentVisualMode = developerSpaceAgentVisualMode(space?.visualisation_type);
  const suggestedVisualMode = developerSpaceAgentSuggestedVisualMode(currentVisualMode);
  const currentVisualModeLabel = developerSpaceAgentVisualModeLabel(currentVisualMode);
  const suggestedVisualModeLabel = developerSpaceAgentVisualModeLabel(suggestedVisualMode);
  const widgets = developerSpaceAgentLayoutWidgets(space?.visualisation_config);
  const mainLabels = developerSpaceAgentVisibleWidgetLabels(widgets, "main");
  const sideLabels = developerSpaceAgentVisibleWidgetLabels(widgets, "side");
  const affectedWidgetLabels = [
    developerSpaceAgentWidgetLabel(widgets, "visualisation", "Live visualisation"),
    developerSpaceAgentWidgetLabel(widgets, "event_stream", "Event stream"),
    developerSpaceAgentWidgetLabel(widgets, "latest_snapshot", "Latest snapshot"),
  ];

  return {
    currentVisualMode,
    currentVisualModeLabel,
    suggestedVisualMode,
    suggestedVisualModeLabel,
    beforeSummary: safeAgentAuditText(
      `${currentVisualModeLabel} mode currently shows main panel widgets: ${mainLabels.join(", ")}; side rail widgets: ${sideLabels.join(", ")}.`,
      "Current layout summary omitted.",
      360,
    ),
    afterSummary: safeAgentAuditText(
      `Suggested ${suggestedVisualModeLabel} readback would foreground ${affectedWidgetLabels.join(", ")} for owner review without changing the live layout.`,
      "Suggested layout summary omitted.",
      360,
    ),
    rationale: "Make the public observatory story easier to review before any future owner-applied layout change.",
    affectedPanelLabels: ["Main panel", "Side rail"],
    affectedWidgetLabels,
    boundaries: DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_BOUNDARIES,
  };
}

function developerSpaceAgentLayoutSuggestionFromPayload(payload: unknown): DeveloperSpaceAgentLayoutSuggestion {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const source = record.layoutSuggestion && typeof record.layoutSuggestion === "object"
    ? record.layoutSuggestion as Record<string, unknown>
    : record;
  const currentVisualMode = developerSpaceAgentVisualMode(source.currentVisualMode);
  const suggestedVisualMode = developerSpaceAgentVisualMode(source.suggestedVisualMode);
  const currentVisualModeLabel = safeAgentAuditText(
    source.currentVisualModeLabel,
    developerSpaceAgentVisualModeLabel(currentVisualMode),
    80,
  );
  const suggestedVisualModeLabel = safeAgentAuditText(
    source.suggestedVisualModeLabel,
    developerSpaceAgentVisualModeLabel(suggestedVisualMode),
    80,
  );
  const stringList = (value: unknown, fallback: string[]) => {
    const values = Array.isArray(value) ? value : fallback;
    return values
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 8)
      .map((item) => safeAgentAuditText(item, "Layout item", 120));
  };

  return {
    currentVisualMode,
    currentVisualModeLabel,
    suggestedVisualMode,
    suggestedVisualModeLabel,
    beforeSummary: safeAgentAuditText(source.beforeSummary, "Current layout summary omitted.", 360),
    afterSummary: safeAgentAuditText(source.afterSummary, "Suggested layout summary omitted.", 360),
    rationale: safeAgentAuditText(source.rationale, "Owner should review this suggestion before any future layout change.", 220),
    affectedPanelLabels: stringList(source.affectedPanelLabels, ["Main panel", "Side rail"]),
    affectedWidgetLabels: stringList(source.affectedWidgetLabels, ["Live visualisation", "Event stream"]),
    boundaries: stringList(source.boundaries, DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_BOUNDARIES),
  };
}

function developerSpaceAgentLayoutSuggestionPreview(
  action: string,
  suggestion: DeveloperSpaceAgentLayoutSuggestion,
): DeveloperSpaceAgentActionPreview {
  return {
    action,
    status: "previewed",
    summary: `Layout suggestion ready for owner review: ${suggestion.currentVisualModeLabel} to ${suggestion.suggestedVisualModeLabel}. No live layout is changed.`,
    sections: [
      {
        title: "Layout suggestion",
        summary: suggestion.rationale,
        facts: [
          safeAgentFact("Current visual mode", suggestion.currentVisualModeLabel),
          safeAgentFact("Suggested visual mode", suggestion.suggestedVisualModeLabel),
          safeAgentFact("Execution available", false),
          safeAgentFact("Mutation available", false),
          safeAgentFact("External dispatch", false),
        ],
        items: [
          { title: "Current layout", detail: suggestion.beforeSummary, status: "before" },
          { title: "Suggested layout", detail: suggestion.afterSummary, status: "after" },
          {
            title: "Affected widgets",
            detail: suggestion.affectedWidgetLabels.join(", "),
            status: "owner_review",
          },
        ],
      },
      {
        title: "No-mutation boundaries",
        items: suggestion.boundaries.map((boundary) => ({
          title: safeAgentAuditText(boundary, "No live layout was changed.", 180),
          status: "not_executed",
        })),
      },
    ],
    requiresConfirmation: true,
    futureLane: true,
  };
}

function developerSpaceAgentLayoutSuggestionConfirmationPayload(
  entry: DeveloperSpaceAgentActionRegistryEntry,
  space: any,
) {
  const suggestion = developerSpaceAgentLayoutSuggestion(space);
  return {
    action: DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION,
    label: safeAgentText(entry.label, "Update layout", 120),
    description: safeAgentText(entry.description, "Suggest a layout change for owner review.", 220),
    mode: entry.mode,
    requiresConfirmation: true,
    futureLane: true,
    previewStatus: "previewed" as const,
    summary: `Layout suggestion: ${suggestion.currentVisualModeLabel} to ${suggestion.suggestedVisualModeLabel}. No live layout is changed.`,
    executionAvailable: false,
    mutationAvailable: false,
    layoutSuggestion: suggestion,
    sections: developerSpaceAgentLayoutSuggestionPreview(DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION, suggestion).sections,
  };
}

function developerSpaceAgentRunJobTarget(input: {
  jobTarget?: unknown;
  target?: unknown;
  input?: Record<string, unknown>;
}) {
  const rawTarget = input.jobTarget ?? input.target ?? input.input?.jobTarget ?? input.input?.target;
  const target = typeof rawTarget === "string"
    ? safeAgentAuditText(rawTarget, "unknown", 80).toLowerCase().replace(/[^a-z0-9_:-]/g, "_")
    : "developer_space_replay";
  const known = DEVELOPER_SPACE_AGENT_RUN_JOB_TARGETS.find((candidate) => candidate.key === target);
  if (known) return known;
  return {
    key: target || "unknown",
    label: "Unrecognized job target",
    prerequisites: [
      "Named supported job target",
      "Owner-visible status readback",
      "Timeout budget",
      "Retry policy",
      "Idempotency key",
      "Worker or queue implementation accepted by a later lane",
    ],
  };
}

function developerSpaceAgentRunJobReadiness(input: {
  jobTarget?: unknown;
  target?: unknown;
  input?: Record<string, unknown>;
}): DeveloperSpaceAgentRunJobReadiness {
  const target = developerSpaceAgentRunJobTarget(input);
  const recognized = DEVELOPER_SPACE_AGENT_RUN_JOB_TARGETS.some((candidate) => candidate.key === target.key);
  return {
    requestedTarget: safeAgentAuditText(target.key, "unknown", 80),
    targetLabel: safeAgentAuditText(target.label, "Unrecognized job target", 120),
    recognized,
    readiness: "unready",
    prerequisites: target.prerequisites.map((item) => safeAgentAuditText(item, "Readiness prerequisite", 140)),
    timeoutExpectation: "Future execution must define an owner-visible timeout budget before any job can run.",
    retryExpectation: "Future execution must define retry limits and terminal failure readback before any job can run.",
    idempotencyExpectation: "Future execution must use a stable owner-scoped idempotency key before enqueueing work.",
    boundaries: DEVELOPER_SPACE_AGENT_RUN_JOB_BOUNDARIES,
    omittedFields: [...DEVELOPER_SPACE_AGENT_RUN_JOB_OMITTED_FIELDS],
  };
}

function developerSpaceAgentRunJobReadinessFromPayload(payload: unknown): DeveloperSpaceAgentRunJobReadiness {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const source = record.runJobReadiness && typeof record.runJobReadiness === "object"
    ? record.runJobReadiness as Record<string, unknown>
    : record;
  const stringList = (value: unknown, fallback: readonly string[]) => {
    const values = Array.isArray(value) ? value : fallback;
    return values
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 10)
      .map((item) => safeAgentAuditText(item, "Run-job readiness item", 160));
  };
  const requestedTarget = safeAgentAuditText(source.requestedTarget, "unknown", 80);
  const target = DEVELOPER_SPACE_AGENT_RUN_JOB_TARGETS.find((candidate) => candidate.key === requestedTarget);

  return {
    requestedTarget,
    targetLabel: safeAgentAuditText(source.targetLabel, target?.label ?? "Unrecognized job target", 120),
    recognized: source.recognized === true,
    readiness: "unready",
    prerequisites: stringList(source.prerequisites, target?.prerequisites ?? [
      "Named supported job target",
      "Owner-visible status readback",
      "Timeout budget",
      "Retry policy",
      "Idempotency key",
    ]),
    timeoutExpectation: safeAgentAuditText(source.timeoutExpectation, "Future execution must define an owner-visible timeout budget before any job can run.", 220),
    retryExpectation: safeAgentAuditText(source.retryExpectation, "Future execution must define retry limits and terminal failure readback before any job can run.", 220),
    idempotencyExpectation: safeAgentAuditText(source.idempotencyExpectation, "Future execution must use a stable owner-scoped idempotency key before enqueueing work.", 220),
    boundaries: stringList(source.boundaries, DEVELOPER_SPACE_AGENT_RUN_JOB_BOUNDARIES),
    omittedFields: stringList(source.omittedFields, DEVELOPER_SPACE_AGENT_RUN_JOB_OMITTED_FIELDS),
  };
}

function developerSpaceAgentRunJobReadinessPreview(
  action: string,
  readiness: DeveloperSpaceAgentRunJobReadiness,
): DeveloperSpaceAgentActionPreview {
  return {
    action,
    status: "previewed",
    summary: `Run-job readiness dry-run for ${readiness.targetLabel}: ${readiness.recognized ? "recognized but unready" : "unrecognized and unready"}. No job is executed.`,
    sections: [
      {
        title: "Run-job readiness",
        summary: "This is a dry-run contract only. Station records what would be required before a later lane can execute work.",
        facts: [
          safeAgentFact("Requested target", readiness.targetLabel),
          safeAgentFact("Recognized target", readiness.recognized),
          safeAgentFact("Readiness", readiness.readiness),
          safeAgentFact("Execution available", false),
          safeAgentFact("Mutation available", false),
          safeAgentFact("External dispatch", false),
        ],
        items: [
          {
            title: "Timeout expectation",
            detail: readiness.timeoutExpectation,
            status: "required_before_execution",
          },
          {
            title: "Retry expectation",
            detail: readiness.retryExpectation,
            status: "required_before_execution",
          },
          {
            title: "Idempotency expectation",
            detail: readiness.idempotencyExpectation,
            status: "required_before_execution",
          },
        ],
      },
      {
        title: "Prerequisites",
        items: readiness.prerequisites.map((title) => ({
          title,
          status: "unready",
        })),
      },
      {
        title: "No-execution boundaries",
        items: readiness.boundaries.map((boundary) => ({
          title: safeAgentAuditText(boundary, "No job was executed.", 180),
          status: "not_executed",
        })),
      },
    ],
    requiresConfirmation: true,
    futureLane: true,
  };
}

function developerSpaceAgentRunJobReadinessConfirmationPayload(
  entry: DeveloperSpaceAgentActionRegistryEntry,
  input: {
    jobTarget?: unknown;
    target?: unknown;
    input?: Record<string, unknown>;
  },
) {
  const readiness = developerSpaceAgentRunJobReadiness(input);
  return {
    action: DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION,
    label: safeAgentText(entry.label, "Run job", 120),
    description: safeAgentText(entry.description, "Dry-run job readiness for owner review.", 220),
    mode: entry.mode,
    requiresConfirmation: true,
    futureLane: true,
    previewStatus: "previewed" as const,
    summary: `Run-job readiness dry-run: ${readiness.targetLabel} is ${readiness.recognized ? "recognized but unready" : "unrecognized and unready"}. No job is executed.`,
    executionAvailable: false,
    mutationAvailable: false,
    runJobReadiness: readiness,
    sections: developerSpaceAgentRunJobReadinessPreview(DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION, readiness).sections,
  };
}

function countByValue(rows: any[], field: string) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const key = safeAgentText(row?.[field], "unknown", 80);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function countFacts(prefix: string, counts: Record<string, number>) {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => safeAgentFact(`${prefix}: ${label}`, value));
}

function latestRows(rows: any[], dateField: string, limit: number) {
  return [...rows]
    .sort((a, b) => Date.parse(b?.[dateField] ?? "") - Date.parse(a?.[dateField] ?? ""))
    .slice(0, limit);
}

async function loadDeveloperSpaceAgentReadback(space: any): Promise<DeveloperSpaceAgentReadback> {
  const sb = getSupabaseAdmin();
  const [nodesResult, eventsResult, snapshotsResult, contextResult, webhookReceiptResult, agentConfirmationResult, agentReceiptResult] = await Promise.all([
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
      .order("occurred_at", { ascending: false })
      .limit(80),
    sb
      .from("developer_space_snapshots")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("occurred_at", { ascending: false })
      .limit(10),
    (sb as any)
      .from("developer_space_observed_runtime_context")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("occurred_at", { ascending: false })
      .limit(80),
    (sb as any)
      .from("developer_space_observed_runtime_webhook_receipts")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("created_at", { ascending: false })
      .limit(20),
    (sb as any)
      .from("developer_space_agent_confirmations")
      .select("*")
      .eq("developer_space_id", space.id)
      .eq("owner_user_id", space.owner_user_id)
      .order("requested_at", { ascending: false })
      .limit(20),
    (sb as any)
      .from("developer_space_agent_execution_receipts")
      .select("*")
      .eq("developer_space_id", space.id)
      .eq("owner_user_id", space.owner_user_id)
      .order("dispatched_at", { ascending: false })
      .limit(20),
  ]);

  if (nodesResult.error) throw new Error(nodesResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (snapshotsResult.error) throw new Error(snapshotsResult.error.message);
  if (contextResult.error) throw new Error(contextResult.error.message);
  if (webhookReceiptResult.error && !developerSpaceObservedRuntimeWebhookReceiptStoreUnavailable(webhookReceiptResult.error)) {
    throw new Error(webhookReceiptResult.error.message);
  }
  if (agentConfirmationResult.error && !developerSpaceAgentConfirmationStoreUnavailable(agentConfirmationResult.error)) {
    throw new Error(agentConfirmationResult.error.message);
  }
  if (agentReceiptResult.error && !developerSpaceAgentExecutionReceiptStoreUnavailable(agentReceiptResult.error)) {
    throw new Error(agentReceiptResult.error.message);
  }

  const linkedDocumentsResult = await loadLinkedDocumentsForSpace(space, "owner");
  return {
    nodes: nodesResult.data ?? [],
    events: eventsResult.data ?? [],
    snapshots: snapshotsResult.data ?? [],
    supportingContext: contextResult.data ?? [],
    webhookReceipts: webhookReceiptResult.error ? [] : webhookReceiptResult.data ?? [],
    agentConfirmations: agentConfirmationResult.error ? [] : agentConfirmationResult.data ?? [],
    agentReceipts: agentReceiptResult.error ? [] : agentReceiptResult.data ?? [],
    linkedDocuments: linkedDocumentsResult.linkedDocuments,
  };
}

type DeveloperSpaceAgentActivityItem = {
  source: string;
  category: string;
  title: string;
  detail: string;
  status: string;
  timestamp: string | null;
};

function activityTimestamp(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
}

function activityItem(input: DeveloperSpaceAgentActivityItem) {
  return {
    title: safeAgentText(input.title, "Activity", 140),
    detail: [
      `Source: ${safeAgentText(input.source, "station", 80)}`,
      `Category: ${safeAgentText(input.category, "activity", 80)}`,
      `Timestamp: ${input.timestamp ?? "not recorded"}`,
      input.detail,
    ].join(" / "),
    status: safeAgentText(input.status, "recorded", 80),
  };
}

function developerSpaceWebhookReceiptStatus(row: any) {
  const response = row?.response_body && typeof row.response_body === "object"
    ? row.response_body as Record<string, unknown>
    : {};
  return safeAgentText(response.status ?? response.code ?? "recorded", "recorded", 80);
}

function buildDeveloperSpaceAgentActivityReadback(
  space: any,
  readback: DeveloperSpaceAgentReadback
): DeveloperSpaceAgentActionPreview {
  const projectName = safeAgentText(space.project_name, "Developer Space", 120);
  const activity = [
    ...readback.linkedDocuments.map((link) => ({
      source: "developer_space_documents",
      category: "evidence",
      title: `Evidence: ${safeAgentText(link.document.title, "Untitled evidence", 120)}`,
      detail: `Role: ${safeAgentText(link.role, "note", 40)} / Visibility: ${safeAgentText(link.linkVisibility, "owner", 40)} / Document: ${safeAgentText(link.document.status, "draft", 40)} ${safeAgentText(link.document.visibility, "private", 40)}`,
      status: link.document.publishedAt ? "published" : safeAgentText(link.document.status, "draft", 40),
      timestamp: activityTimestamp(link.document.updatedAt ?? link.document.publishedAt ?? link.document.createdAt),
    })),
    ...readback.events.map((event) => ({
      source: "developer_space_events",
      category: "observed_runtime_event",
      title: `Runtime event: ${safeAgentText(event.event_label ?? event.event_type, "Untitled event", 120)}`,
      detail: `Type: ${safeAgentText(event.event_type, "event", 80)} / Visibility: ${safeAgentText(event.visibility, "public", 40)} / Provenance: ${safeAgentText(event.provenance, "api", 40)}`,
      status: safeAgentText(event.visibility, "public", 40),
      timestamp: activityTimestamp(event.occurred_at ?? event.created_at),
    })),
    ...readback.nodes.map((node) => ({
      source: "developer_space_nodes",
      category: "observed_runtime_node",
      title: `Runtime node: ${safeAgentText(node.node_name, "Untitled node", 120)}`,
      detail: `Topology: ${safeAgentText(node.topology_type, "custom", 40)} / Fragments: ${Number(node.fragment_count ?? 0)}`,
      status: node.last_event_at ? "recent_event" : "node_state",
      timestamp: activityTimestamp(node.last_event_at ?? node.updated_at ?? node.created_at),
    })),
    ...readback.snapshots.map((snapshot) => ({
      source: "developer_space_snapshots",
      category: "observed_runtime_snapshot",
      title: "Runtime snapshot",
      detail: `Visibility: ${safeAgentText(snapshot.visibility, "public", 40)} / Provenance: ${safeAgentText(snapshot.provenance, "api", 40)}`,
      status: safeAgentText(snapshot.visibility, "public", 40),
      timestamp: activityTimestamp(snapshot.occurred_at ?? snapshot.created_at),
    })),
    ...readback.supportingContext.map((context) => ({
      source: "developer_space_observed_runtime_context",
      category: "supporting_context",
      title: `Supporting context: ${safeAgentText(context.context_type, "context", 80)}`,
      detail: `Provenance: ${safeAgentText(context.provenance, "imported", 40)} / External label omitted`,
      status: safeAgentText(context.context_type, "context", 80),
      timestamp: activityTimestamp(context.occurred_at ?? context.created_at),
    })),
    ...readback.webhookReceipts.map((receipt) => ({
      source: "developer_space_observed_runtime_webhook_receipts",
      category: "webhook_receipt",
      title: "Observed runtime webhook receipt",
      detail: "Delivery identifier and payload hash omitted.",
      status: developerSpaceWebhookReceiptStatus(receipt),
      timestamp: activityTimestamp(receipt.created_at),
    })),
    ...readback.agentConfirmations.map((confirmation) => ({
      source: "developer_space_agent_confirmations",
      category: "developer_agent_confirmation",
      title: `Developer Agent confirmation: ${safeAgentText(confirmation.action, "action", 80)}`,
      detail: "Confirmation id, owner id, preview hash, and sanitized payload omitted.",
      status: safeAgentText(effectiveDeveloperSpaceAgentConfirmationStatus(confirmation), "pending", 40),
      timestamp: activityTimestamp(confirmation.requested_at ?? confirmation.created_at),
    })),
    ...readback.agentReceipts.map((receipt) => ({
      source: "developer_space_agent_execution_receipts",
      category: "developer_agent_receipt",
      title: `Developer Agent receipt: ${safeAgentText(receipt.action, "action", 80)}`,
      detail: "Receipt id, confirmation id, owner id, and receipt payload omitted.",
      status: safeAgentText(receipt.status, "recorded", 40),
      timestamp: activityTimestamp(receipt.dispatched_at ?? receipt.created_at),
    })),
  ]
    .sort((left, right) => Date.parse(right.timestamp ?? "") - Date.parse(left.timestamp ?? ""))
    .slice(0, 14);

  return {
    action: "read_logs",
    status: "previewed",
    summary: `${projectName} activity readback uses existing Station data only. Raw logs, payloads, ids, document bodies, prompts, metrics, snapshots, webhook bodies, headers, and secrets are omitted.`,
    sections: [
      {
        title: "Sanitized activity sources",
        facts: [
          safeAgentFact("Evidence/document rows", readback.linkedDocuments.length),
          safeAgentFact("Runtime events", readback.events.length),
          safeAgentFact("Runtime nodes", readback.nodes.length),
          safeAgentFact("Runtime snapshots", readback.snapshots.length),
          safeAgentFact("Supporting context rows", readback.supportingContext.length),
          safeAgentFact("Webhook receipts", readback.webhookReceipts.length),
          safeAgentFact("Agent confirmations", readback.agentConfirmations.length),
          safeAgentFact("Agent receipts", readback.agentReceipts.length),
        ],
      },
      {
        title: "Recent sanitized activity",
        summary: activity.length > 0
          ? "Rows are bounded, owner-only, and ordered newest first."
          : "No owner-visible activity rows are available yet.",
        items: activity.map(activityItem),
      },
      {
        title: "Omitted raw fields",
        items: [
          "Raw infrastructure logs",
          "Raw event data, metrics, snapshots, and supporting-context payloads",
          "Webhook bodies, headers, payload hashes, and delivery ids",
          "Document bodies, prompts, provider payloads, private archive excerpts, owner ids, route ids, keys, tokens, cookies, and connection strings",
        ].map((title) => ({
          title,
          status: "omitted",
        })),
      },
    ],
    requiresConfirmation: false,
    futureLane: false,
  };
}

function futureLaneAgentPreview(action: string, input: Record<string, unknown> = {}, space?: any): DeveloperSpaceAgentActionPreview {
  if (action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION) {
    return {
      action,
      status: "previewed",
      summary: "Approved owner confirmation can save one private Developer Space project-update draft. Nothing is published or sent externally.",
      sections: [
        {
          title: "Private draft boundary",
          facts: [
            safeAgentFact("Registered action", action),
            safeAgentFact("Document status", "draft"),
            safeAgentFact("Document visibility", "private"),
            safeAgentFact("Developer Space link", "owner"),
            safeAgentFact("External dispatch", false),
          ],
        },
      ],
      requiresConfirmation: true,
      futureLane: true,
    };
  }

  if (action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION) {
    return developerSpaceAgentLayoutSuggestionPreview(
      action,
      developerSpaceAgentLayoutSuggestion(space),
    );
  }

  if (action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION) {
    return developerSpaceAgentRunJobReadinessPreview(
      action,
      developerSpaceAgentRunJobReadiness({ input }),
    );
  }

  if (action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    const statusNote = developerSpaceAgentStatusNote({ input });
    if (!statusNote || developerSpaceAgentSecretLikeText(statusNote.note)) {
      return {
        action,
        status: "requires_future_lane",
        summary: "Select a sanitized public status note before requesting an update_observatory confirmation.",
        sections: [
          {
            title: "Status note boundary",
            facts: [
              safeAgentFact("Registered action", action),
              safeAgentFact("Required payload", "statusNote"),
              safeAgentFact("Visibility after execution", "public"),
              safeAgentFact("External dispatch", false),
            ],
            items: DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES.map((boundary) => ({
              title: safeAgentText(boundary, "No external action executed.", 160),
              status: "boundary",
            })),
          },
        ],
        requiresConfirmation: true,
        futureLane: true,
      };
    }

    return {
      action,
      status: "previewed",
      summary: `Owner-approved observatory status note is ready for confirmation: ${statusNote.note}`,
      sections: [
        {
          title: "Selected public status note",
          facts: [
            safeAgentFact("Event type", statusNote.eventType),
            safeAgentFact("Visibility", statusNote.visibility),
            safeAgentFact("Provenance", statusNote.provenance),
            safeAgentFact("External dispatch", false),
          ],
          items: [
            {
              title: statusNote.eventLabel,
              detail: statusNote.note,
              status: "pending_owner_confirmation",
            },
          ],
        },
        {
          title: "Boundaries",
          items: DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES.map((boundary) => ({
            title: safeAgentText(boundary, "No external action executed.", 160),
            status: "boundary",
          })),
        },
      ],
      requiresConfirmation: true,
      futureLane: true,
    };
  }

  if (action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION) {
    return {
      action,
      status: "requires_future_lane",
      summary: "Publishing requires selecting an owner-reviewed private draft from the Developer Space evidence list.",
      sections: [
        {
          title: "Publish target boundary",
          facts: [
            safeAgentFact("Registered action", action),
            safeAgentFact("Required target", "Owner-only private draft linked to this Developer Space"),
            safeAgentFact("Current behavior", "Use the selected draft control; no default document is selected."),
            safeAgentFact("External dispatch", false),
          ],
        },
      ],
      requiresConfirmation: true,
      futureLane: true,
    };
  }

  return {
    action,
    status: "requires_future_lane",
    summary: "This action is registered as future Phase 2D vocabulary, but this lane does not execute or mutate it.",
    sections: [
      {
        title: "Future lane boundary",
        facts: [
          safeAgentFact("Registered action", action),
          safeAgentFact("Current behavior", "No execution, no mutation, no provider call."),
          safeAgentFact("Future requirement", "Owner confirmation and a dedicated implementation lane."),
        ],
      },
    ],
    requiresConfirmation: true,
    futureLane: true,
  };
}

function buildDeveloperSpaceProjectUpdateDraft(space: any, readback: DeveloperSpaceAgentReadback) {
  const projectName = safeAgentText(space.project_name, "Developer Space", 120);
  const latestEventAt = latestIso(readback.events.flatMap((event) => [event.occurred_at, event.created_at]));
  const latestNodeAt = latestIso(readback.nodes.flatMap((node) => [node.last_event_at, node.updated_at, node.created_at]));
  const latestSnapshotAt = latestIso(readback.snapshots.flatMap((snapshot) => [snapshot.occurred_at, snapshot.created_at]));
  const title = `${projectName} project update draft`;
  const body = [
    `# ${title}`,
    "",
    `${projectName} currently has ${readback.nodes.length} observed nodes, ${readback.events.length} observed events, and ${readback.snapshots.length} snapshots in the Developer Space readback.`,
    latestEventAt ? `Latest observed event timestamp: ${latestEventAt}.` : "No observed event timestamp is available yet.",
    latestNodeAt ? `Latest node signal timestamp: ${latestNodeAt}.` : "No node signal timestamp is available yet.",
    latestSnapshotAt ? `Latest snapshot timestamp: ${latestSnapshotAt}.` : "No snapshot timestamp is available yet.",
    `Owner-linked evidence count: ${readback.linkedDocuments.length}.`,
    "",
    "Owner review checklist:",
    "- Confirm public claims against linked evidence before publication.",
    "- Keep this draft private until a human intentionally publishes it.",
    "- Do not treat this draft as a provider execution, deploy, key change, or observed-runtime mutation.",
  ].join("\n");

  return {
    title,
    body,
    summary: `${projectName} private project-update draft saved for owner review.`,
    latestEventAt,
    latestNodeAt,
    latestSnapshotAt,
    counts: {
      nodes: readback.nodes.length,
      events: readback.events.length,
      snapshots: readback.snapshots.length,
      linkedEvidence: readback.linkedDocuments.length,
    },
  };
}

type DeveloperSpaceAgentPublishTarget = {
  document: any;
  link: any;
  title: string;
  role: DeveloperSpaceDocumentRole;
};

function developerSpaceAgentPublishTargetUnavailable(
  code: "developer_space_agent_publish_target_required" | "developer_space_agent_publish_target_ineligible",
  error: string
) {
  return {
    status: 400 as const,
    code,
    error,
    executionAvailable: false,
  };
}

function developerSpaceAgentDocumentRole(value: unknown): DeveloperSpaceDocumentRole {
  return value === "methodology" || value === "finding" || value === "field_log" || value === "note"
    ? value
    : "field_log";
}

function isDeveloperSpaceAgentSavedDraft(space: any, document: any, link: any) {
  const sourceLabel = typeof document.source_label === "string" ? document.source_label : "";
  return (
    document.author_user_id === space.owner_user_id
    && document.status === "draft"
    && document.visibility === "private"
    && document.provenance_type === "ai_assisted"
    && document.source_type === "manual"
    && document.source_id === space.id
    && sourceLabel.startsWith("Developer Agent safe readback:")
    && link.owner_user_id === space.owner_user_id
    && link.link_visibility === "owner"
    && link.document_role === "field_log"
  );
}

async function loadDeveloperSpaceAgentPublishTarget(input: {
  space: any;
  targetDocumentId?: string | null;
}): Promise<
  | ({ status: 200 } & DeveloperSpaceAgentPublishTarget)
  | ReturnType<typeof developerSpaceAgentPublishTargetUnavailable>
  | { status: 500; error: string; code: string; executionAvailable: false }
> {
  const targetDocumentId = input.targetDocumentId?.trim();
  if (!targetDocumentId) {
    return developerSpaceAgentPublishTargetUnavailable(
      "developer_space_agent_publish_target_required",
      "Select an owner-reviewed private draft before requesting a publish confirmation.",
    );
  }

  const sb = getSupabaseAdmin() as any;
  const [linkResult, documentResult] = await Promise.all([
    sb
      .from("developer_space_documents")
      .select("*")
      .eq("developer_space_id", input.space.id)
      .eq("document_id", targetDocumentId)
      .eq("owner_user_id", input.space.owner_user_id)
      .maybeSingle(),
    sb
      .from("documents")
      .select("*")
      .eq("id", targetDocumentId)
      .eq("author_user_id", input.space.owner_user_id)
      .maybeSingle(),
  ]);

  if (linkResult.error || documentResult.error) {
    return {
      status: 500 as const,
      error: "Could not load Developer Agent publish target.",
      code: "developer_space_agent_publish_target_load_failed",
      executionAvailable: false as const,
    };
  }

  const link = linkResult.data;
  const document = documentResult.data;
  if (!link || !document || !isDeveloperSpaceAgentSavedDraft(input.space, document, link)) {
    return developerSpaceAgentPublishTargetUnavailable(
      "developer_space_agent_publish_target_ineligible",
      "Selected document is not an eligible owner-reviewed Developer Agent draft for this Space.",
    );
  }

  return {
    status: 200 as const,
    document,
    link,
    title: safeAgentText(document.title, "Developer Space project update draft", 160),
    role: developerSpaceAgentDocumentRole(link.document_role),
  };
}

function developerSpaceAgentPublishTargetId(payload: unknown) {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (typeof record.targetDocumentId === "string") return record.targetDocumentId;
  const target = record.target && typeof record.target === "object"
    ? record.target as Record<string, unknown>
    : null;
  return typeof target?.documentId === "string" ? target.documentId : null;
}

function developerSpaceAgentPublishConfirmationPayload(
  entry: DeveloperSpaceAgentActionRegistryEntry,
  target: DeveloperSpaceAgentPublishTarget
) {
  const title = safeAgentText(target.title, "Developer Space project update draft", 160);
  return {
    action: DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION,
    label: safeAgentText(entry.label, "Publish to page", 120),
    description: safeAgentText(entry.description, "Publish selected reviewed draft.", 220),
    mode: entry.mode,
    requiresConfirmation: true,
    futureLane: true,
    previewStatus: "previewed",
    summary: `Publish reviewed draft "${title}" to the public Developer Space evidence path.`,
    executionAvailable: true,
    mutationAvailable: true,
    target: {
      documentId: target.document.id,
    },
    sections: [
      {
        title: "Selected draft",
        facts: [
          safeAgentFact("Title", title),
          safeAgentFact("Current status", "draft"),
          safeAgentFact("Current visibility", "private"),
          safeAgentFact("Current link", "owner"),
          safeAgentFact("After approval", "published public evidence"),
          safeAgentFact("External dispatch", false),
        ],
      },
    ],
  };
}

function developerSpaceAgentUpdateObservatoryConfirmationPayload(
  entry: DeveloperSpaceAgentActionRegistryEntry,
  statusNote: DeveloperSpaceAgentStatusNote
) {
  return {
    action: DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    label: safeAgentText(entry.label, "Update observatory", 120),
    description: safeAgentText(entry.description, "Publish one public observatory status note.", 220),
    mode: entry.mode,
    requiresConfirmation: true,
    futureLane: true,
    previewStatus: "previewed",
    summary: `Publish public observatory status note: ${statusNote.note}`,
    executionAvailable: true,
    mutationAvailable: true,
    statusNote,
    sections: [
      {
        title: "Selected public status note",
        facts: [
          safeAgentFact("Event type", statusNote.eventType),
          safeAgentFact("Visibility", statusNote.visibility),
          safeAgentFact("Provenance", statusNote.provenance),
          safeAgentFact("External dispatch", false),
        ],
        items: [
          {
            title: statusNote.eventLabel,
            detail: statusNote.note,
            status: "pending_owner_confirmation",
          },
        ],
      },
      {
        title: "Boundaries",
        items: DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES.map((boundary) => ({
          title: safeAgentText(boundary, "No external action executed.", 160),
          status: "boundary",
        })),
      },
    ],
  };
}

function unsupportedAgentPreview(action: string): DeveloperSpaceAgentActionPreview {
  return {
    action,
    status: "unsupported_action",
    summary: "This developer-agent action is not registered for the current Developer Space command contract.",
    sections: [
      {
        title: "Supported actions",
        items: developerSpaceAgentRegistry().map((entry) => ({
          title: entry.action,
          detail: entry.futureLane ? "future lane only" : entry.mode,
          status: entry.futureLane ? "requires_future_lane" : "available",
        })),
      },
    ],
    requiresConfirmation: false,
    futureLane: false,
  };
}

function providerPolicyFacts(space: any) {
  const providerMode = space.provider_policy === "owner_byok_only" ? "owner_byok" : "platform";
  const synthetic = evaluateDeveloperSpaceProviderPolicy({
    providerPolicy: space.provider_policy,
    requestedContext: "public_synthetic",
    providerMode,
  });
  const publicContext = evaluateDeveloperSpaceProviderPolicy({
    providerPolicy: space.provider_policy,
    requestedContext: "public_context",
    providerMode,
  });
  const privateArchive = evaluateDeveloperSpaceProviderPolicy({
    providerPolicy: space.provider_policy,
    requestedContext: "private_archive",
    providerMode,
  });
  const posture = buildDeveloperSpaceProviderPosture(synthetic);

  return {
    facts: [
      safeAgentFact("Provider policy", synthetic.providerPolicy),
      safeAgentFact("Provider mode", providerMode),
      safeAgentFact("Selected provider route", posture.selectedProviderRoute),
      safeAgentFact("Embedding profile", `${posture.embeddingProfile.provider} / ${posture.embeddingProfile.dimension}`),
      safeAgentFact("Public synthetic", synthetic.allowed ? "allowed" : `blocked: ${synthetic.denialReason}`),
      safeAgentFact("Public context", publicContext.allowed ? "allowed" : `blocked: ${publicContext.denialReason}`),
      safeAgentFact("Private archive", privateArchive.allowed ? "allowed" : `blocked: ${privateArchive.denialReason}`),
    ],
    posture,
  };
}

function buildDeveloperSpaceAgentPreview(
  action: DeveloperSpaceAgentAllowedAction,
  space: any,
  readback: DeveloperSpaceAgentReadback
): DeveloperSpaceAgentActionPreview {
  const projectName = safeAgentText(space.project_name, "Developer Space", 120);
  const latestNodeAt = latestIso(readback.nodes.flatMap((node) => [node.last_event_at, node.updated_at, node.created_at]));
  const latestEventAt = latestIso(readback.events.flatMap((event) => [event.occurred_at, event.created_at]));
  const latestSnapshotAt = latestIso(readback.snapshots.flatMap((snapshot) => [snapshot.occurred_at, snapshot.created_at]));
  const baseFacts = [
    safeAgentFact("Visibility", space.visibility),
    safeAgentFact("Visualisation", space.visualisation_type),
    safeAgentFact("Provider policy", space.provider_policy),
    safeAgentFact("Nodes", readback.nodes.length),
    safeAgentFact("Events", readback.events.length),
    safeAgentFact("Snapshots", readback.snapshots.length),
    safeAgentFact("Supporting context", readback.supportingContext.length),
    safeAgentFact("Linked evidence", readback.linkedDocuments.length),
  ];

  if (action === "read_developer_space_brief") {
    return {
      action,
      status: "previewed",
      summary: `${projectName} has ${readback.nodes.length} nodes, ${readback.events.length} events, and ${readback.linkedDocuments.length} linked evidence items.`,
      sections: [
        {
          title: "Space brief",
          summary: safeAgentText(space.description, "No project description saved.", 220),
          facts: [
            safeAgentFact("Project", projectName),
            ...baseFacts,
            safeAgentFact("Updated", space.updated_at ?? null),
          ],
        },
        {
          title: "Owner route hints",
          items: [
            {
              title: "Public observatory",
              detail: "Read-only visitor surface.",
              href: `/developer-spaces/${space.slug}`,
              status: space.visibility,
            },
            {
              title: "Owner manage view",
              detail: "Owner console for ingestion keys, evidence, widgets, and exports.",
              href: `/developer-spaces/${space.slug}/manage`,
              status: "owner_only",
            },
          ],
        },
      ],
      requiresConfirmation: false,
      futureLane: false,
    };
  }

  if (action === "read_observed_runtime_status") {
    return {
      action,
      status: "previewed",
      summary: `Observed runtime readback has ${readback.nodes.length} nodes and ${readback.events.length} events. No raw metrics, event data, or context payloads are included.`,
      sections: [
        {
          title: "Runtime freshness",
          facts: [
            safeAgentFact("Latest node signal", latestNodeAt),
            safeAgentFact("Latest event", latestEventAt),
            safeAgentFact("Latest snapshot", latestSnapshotAt),
            safeAgentFact("Supporting context rows", readback.supportingContext.length),
          ],
        },
        {
          title: "Recent event labels",
          items: latestRows(readback.events, "occurred_at", 5).map((event) => ({
            title: safeAgentText(event.event_label ?? event.event_type, "Untitled event", 120),
            detail: `${safeAgentText(event.event_type, "event", 80)} / ${safeAgentText(event.visibility, "unknown", 40)}`,
            status: safeAgentText(event.provenance ?? "api", "api", 40),
          })),
        },
        {
          title: "Recent node labels",
          items: latestRows(readback.nodes, "updated_at", 5).map((node) => ({
            title: safeAgentText(node.node_name, "Untitled node", 120),
            detail: `${safeAgentText(node.topology_type, "custom", 40)} / fragments ${Number(node.fragment_count ?? 0)}`,
            status: node.last_event_at ?? "no event timestamp",
          })),
        },
      ],
      requiresConfirmation: false,
      futureLane: false,
    };
  }

  if (action === "read_provider_policy_posture") {
    const provider = providerPolicyFacts(space);
    return {
      action,
      status: "previewed",
      summary: "Provider policy posture previewed without model execution, provider calls, or private archive retrieval.",
      sections: [
        {
          title: "Provider policy posture",
          facts: provider.facts,
        },
      ],
      requiresConfirmation: false,
      futureLane: false,
    };
  }

  if (action === "read_evidence_path") {
    return {
      action,
      status: "previewed",
      summary: `Evidence path has ${readback.linkedDocuments.length} linked documents. Body excerpts are intentionally omitted from the agent preview.`,
      sections: [
        {
          title: "Evidence counts",
          facts: [
            ...countFacts("Role", countByValue(readback.linkedDocuments, "role")),
            ...countFacts("Link visibility", countByValue(readback.linkedDocuments, "linkVisibility")),
          ],
        },
        {
          title: "Linked evidence",
          items: readback.linkedDocuments.slice(0, 12).map((link) => ({
            title: safeAgentText(link.document.title, "Untitled document", 140),
            detail: `${safeAgentText(link.role, "note", 40)} / ${safeAgentText(link.linkVisibility, "owner", 40)} / ${safeAgentText(link.document.status, "draft", 40)} / ${safeAgentText(link.document.visibility, "private", 40)}`,
            status: link.document.publishedAt ? "published" : "not_published",
          })),
        },
      ],
      requiresConfirmation: false,
      futureLane: false,
    };
  }

  if (action === "read_logs") {
    return buildDeveloperSpaceAgentActivityReadback(space, readback);
  }

  const draft = buildDeveloperSpaceProjectUpdateDraft(space, readback);

  return {
    action,
    status: "previewed",
    summary: "Draft project update generated for owner review only. Nothing was published or mutated.",
    sections: [
      {
        title: "Draft update",
        items: [
          {
            title: draft.title,
            detail: safeAgentText(draft.body.replace(/\s+/g, " "), "Draft unavailable.", 500),
            status: "draft_preview",
          },
        ],
      },
      {
        title: "Source counts",
        facts: baseFacts,
      },
    ],
    requiresConfirmation: true,
    futureLane: false,
  };
}

function developerSpaceAgentEntry(action: string) {
  return DEVELOPER_SPACE_AGENT_ACTION_REGISTRY.find((entry) => entry.action === action) ?? null;
}

function developerSpaceAgentConfirmationPayload(
  action: DeveloperSpaceAgentFutureAction,
  entry: DeveloperSpaceAgentActionRegistryEntry
) {
  const preview = futureLaneAgentPreview(action);
  return {
    action,
    label: safeAgentText(entry.label, action, 120),
    description: safeAgentText(entry.description, "Future lane action.", 220),
    mode: entry.mode,
    requiresConfirmation: entry.requiresConfirmation,
    futureLane: true,
    previewStatus: preview.status,
    summary: preview.summary,
    executionAvailable: false,
    mutationAvailable: false,
    sections: preview.sections.map((section) => ({
      title: safeAgentText(section.title, "Boundary", 120),
      ...(section.summary ? { summary: safeAgentText(section.summary, "No summary.", 220) } : {}),
      facts: (section.facts ?? []).map((fact) => ({
        label: safeAgentText(fact.label, "Fact", 80),
        value: typeof fact.value === "string" ? safeAgentText(fact.value, "unknown", 160) : fact.value ?? null,
      })),
      items: (section.items ?? []).map((item) => ({
        title: safeAgentText(item.title, "Item", 120),
        ...(item.detail ? { detail: safeAgentText(item.detail, "No detail.", 220) } : {}),
        ...(item.status ? { status: safeAgentText(item.status, "unknown", 80) } : {}),
      })),
    })),
  };
}

function developerSpaceAgentCapabilityConfirmationPayload(
  entry: DeveloperSpaceAgentActionRegistryEntry,
  request: ReturnType<typeof developerSpaceAgentCapabilityRequest>
) {
  return {
    action: DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION,
    label: safeAgentText(entry.label, "Request capability", 120),
    description: safeAgentText(entry.description, "Future lane action.", 220),
    mode: entry.mode,
    requiresConfirmation: entry.requiresConfirmation,
    futureLane: true,
    previewStatus: "requires_future_lane" as const,
    summary: `Capability request: ${request.categoryLabel} - ${request.summary}`,
    executionAvailable: false,
    mutationAvailable: false,
    capabilityRequest: request,
    sections: [
      {
        title: "Capability request",
        summary: request.summary,
        facts: [
          { label: "Category", value: request.categoryLabel },
          { label: "External execution", value: false },
          { label: "Mutation", value: false },
        ],
        items: [
          {
            title: "Owner triage",
            detail: "Record this request as planning evidence before any implementation lane.",
            status: "owner_review",
          },
        ],
      },
      {
        title: "Boundaries",
        items: DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_BOUNDARIES.map((boundary) => ({
          title: safeAgentText(boundary, "No external action executed.", 160),
          status: "not_executed",
        })),
      },
    ],
  };
}

function effectiveDeveloperSpaceAgentConfirmationStatus(row: any, now = new Date()) {
  if (row.status === "pending" && row.expires_at && Date.parse(row.expires_at) <= now.getTime()) {
    return "expired" as const;
  }
  return row.status as DeveloperSpaceAgentConfirmationStatus;
}

function serializeDeveloperSpaceAgentConfirmation(row: any): DeveloperSpaceAgentConfirmationRecord {
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    ownerUserId: row.owner_user_id,
    action: row.action,
    status: effectiveDeveloperSpaceAgentConfirmationStatus(row),
    summary: safeAgentText(row.summary, "Confirmation requested.", 400),
    previewHash: row.preview_hash,
    sanitizedPayload: row.sanitized_payload ?? {},
    requestedAt: row.requested_at,
    expiresAt: row.expires_at,
    approvedAt: row.approved_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function developerSpaceAgentConfirmationPayloadMatchesHash(row: any) {
  return typeof row.preview_hash === "string"
    && row.preview_hash === payloadHash(row.sanitized_payload ?? {});
}

function developerSpaceAgentExecutionReceiptPayload(
  request = developerSpaceAgentCapabilityRequest({})
): DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"] {
  return {
    action: DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION,
    outcome: "capability_request_recorded" as const,
    executionAvailable: false as const,
    mutationAvailable: false as const,
    externalDispatch: false as const,
    nextStep: `Review this ${request.categoryLabel.toLowerCase()} request before opening a new implementation lane.`,
    boundaries: DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_BOUNDARIES,
    capabilityRequest: request,
  };
}

function developerSpaceAgentDraftDocumentReceiptPayload(input: {
  title: string;
  role: DeveloperSpaceDocumentRole;
}): DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"] {
  return {
    action: DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION,
    outcome: "private_draft_document_saved" as const,
    executionAvailable: false as const,
    mutationAvailable: true,
    externalDispatch: false as const,
    nextStep: "Review the private draft document before any human publication decision.",
    boundaries: DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_BOUNDARIES,
    draftDocument: {
      title: safeAgentText(input.title, "Developer Space project update draft", 160),
      status: "draft" as const,
      visibility: "private" as const,
      linkVisibility: "owner" as const,
      role: input.role,
    },
  };
}

function developerSpaceAgentPublishDocumentReceiptPayload(input: {
  title: string;
  role: DeveloperSpaceDocumentRole;
  publishedAt?: string | null;
}): DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"] {
  return {
    action: DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION,
    outcome: "draft_document_published" as const,
    executionAvailable: true,
    mutationAvailable: true,
    externalDispatch: false as const,
    nextStep: "Review the public Developer Space evidence path and leave future publishing automation blocked.",
    boundaries: DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_BOUNDARIES,
    publishedDocument: {
      title: safeAgentText(input.title, "Developer Space project update draft", 160),
      status: "published" as const,
      visibility: "public" as const,
      linkVisibility: "public" as const,
      role: input.role,
      publishedAt: input.publishedAt ?? null,
    },
  };
}

function developerSpaceAgentObservatoryStatusNoteReceiptPayload(
  statusNote: DeveloperSpaceAgentStatusNote
): DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"] {
  return {
    action: DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    outcome: "observatory_status_note_published" as const,
    executionAvailable: true,
    mutationAvailable: true,
    externalDispatch: false as const,
    nextStep: "Review the public Developer Space observatory and leave broader observatory automation blocked.",
    boundaries: DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES,
    statusNote: {
      note: safeAgentText(statusNote.note, "Owner-approved observatory status update.", DEVELOPER_SPACE_AGENT_STATUS_NOTE_MAX_LENGTH),
      eventType: DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE,
      eventLabel: safeAgentText(statusNote.eventLabel, "Status note", 160),
      visibility: "public",
      provenance: "user",
      occurredAt: statusNote.occurredAt ?? null,
    },
  };
}

function normaliseDeveloperSpaceAgentExecutionReceiptPayload(input: unknown): DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"] {
  const payload = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const action = payload.action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    ? DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    : payload.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      : payload.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        ? DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        : DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION;
  const defaultBoundaries = action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    ? DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_BOUNDARIES
    : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_BOUNDARIES
      : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        ? DEVELOPER_SPACE_AGENT_OBSERVATORY_STATUS_NOTE_BOUNDARIES
      : DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_BOUNDARIES;
  const boundaries = Array.isArray(payload.boundaries)
    ? payload.boundaries
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .slice(0, 8)
        .map((value) => safeAgentText(value, "No external action executed.", 220))
    : defaultBoundaries;

  const draftDocumentPayload = payload.draftDocument && typeof payload.draftDocument === "object"
    ? payload.draftDocument as Record<string, unknown>
    : null;
  const draftRole = developerSpaceAgentDocumentRole(draftDocumentPayload?.role);
  const publishedDocumentPayload = payload.publishedDocument && typeof payload.publishedDocument === "object"
    ? payload.publishedDocument as Record<string, unknown>
    : null;
  const publishedRole = developerSpaceAgentDocumentRole(publishedDocumentPayload?.role);
  const capabilityRequest = developerSpaceAgentCapabilityRequestFromPayload(payload);
  const statusNote = developerSpaceAgentStatusNoteFromPayload(payload);

  return {
    action: action as DeveloperSpaceAgentExecutionReceiptAction,
    outcome: action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
      ? "private_draft_document_saved"
      : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        ? "draft_document_published"
        : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
          ? "observatory_status_note_published"
        : "capability_request_recorded",
    executionAvailable: action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      || action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    mutationAvailable: action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
      || action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      || action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    externalDispatch: false,
    nextStep: safeAgentText(
      typeof payload.nextStep === "string"
        ? payload.nextStep
        : action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
          ? "Review the private draft document before any human publication decision."
          : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
            ? "Review the public Developer Space evidence path and leave future publishing automation blocked."
            : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
              ? "Review the public Developer Space observatory and leave broader observatory automation blocked."
            : "Review this capability request in the roadmap before opening a new implementation lane.",
      "Human review required before any implementation lane.",
      220,
    ),
    boundaries,
    ...(action === DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION
      ? { capabilityRequest }
      : {}),
    ...(action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
      ? {
          draftDocument: {
            title: safeAgentText(
              draftDocumentPayload?.title,
              "Developer Space project update draft",
              160,
            ),
            status: "draft" as const,
            visibility: "private" as const,
            linkVisibility: "owner" as const,
            role: draftRole as DeveloperSpaceDocumentRole,
          },
        }
      : {}),
    ...(action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? {
          publishedDocument: {
            title: safeAgentText(
              publishedDocumentPayload?.title,
              "Developer Space project update draft",
              160,
            ),
            status: "published" as const,
            visibility: "public" as const,
            linkVisibility: "public" as const,
            role: publishedRole as DeveloperSpaceDocumentRole,
            publishedAt: typeof publishedDocumentPayload?.publishedAt === "string"
              ? safeAgentText(publishedDocumentPayload.publishedAt, "published", 80)
              : null,
          },
        }
      : {}),
    ...(action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
      ? {
          statusNote: {
            note: statusNote.note,
            eventType: DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE,
            eventLabel: safeAgentText(statusNote.eventLabel, "Status note", 160),
            visibility: "public" as const,
            provenance: "user" as const,
            occurredAt: statusNote.occurredAt ?? null,
          },
        }
      : {}),
  };
}

function serializeDeveloperSpaceAgentExecutionReceipt(row: any): DeveloperSpaceAgentExecutionReceiptRecord {
  const action = row.action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    ? DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    : row.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      : row.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        ? DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        : DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION;
  return {
    action: action as DeveloperSpaceAgentExecutionReceiptAction,
    status: "recorded",
    summary: safeAgentText(
      row.summary,
      action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
        ? "Private project update draft saved for owner review."
        : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
          ? "Reviewed project update draft published to the public Developer Space evidence path."
          : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
            ? "Public observatory status note published."
          : "Capability request receipt recorded. No external action executed.",
      400,
    ),
    receiptPayload: normaliseDeveloperSpaceAgentExecutionReceiptPayload(row.receipt_payload),
    dispatchedAt: row.dispatched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeAgentAuditText(value: unknown, fallback: string, maxLength: number) {
  const text = safeAgentText(value, fallback, maxLength);
  return developerSpaceAgentSecretLikeText(text) ? fallback : text;
}

function safeAgentAuditTimestamp(value: unknown) {
  return typeof value === "string" && !developerSpaceAgentSecretLikeText(value)
    ? safeAgentText(value, "", 80)
    : null;
}

function safeAgentAuditBoundaries(boundaries: string[] | undefined) {
  const values = Array.isArray(boundaries) && boundaries.length > 0
    ? boundaries
    : ["No receipt has been recorded for this confirmation."];
  return values.slice(0, 8).map((boundary) =>
    safeAgentAuditText(boundary, "Boundary omitted from minimized audit export.", 220)
  );
}

function developerSpaceAgentAuditArtifactFromReceiptPayload(
  payload: DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"],
): DeveloperSpaceAgentAuditExportArtifact {
  if (payload.action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION && payload.draftDocument) {
    return {
      type: "private_draft_document",
      label: safeAgentAuditText(payload.draftDocument.title, "Private project-update draft", 160),
      status: "draft",
      visibility: "private",
      linkVisibility: "owner",
      role: payload.draftDocument.role,
    };
  }

  if (payload.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION && payload.publishedDocument) {
    return {
      type: "published_document",
      label: safeAgentAuditText(payload.publishedDocument.title, "Published project update", 160),
      status: "published",
      visibility: "public",
      linkVisibility: "public",
      role: payload.publishedDocument.role,
      publishedAt: safeAgentAuditTimestamp(payload.publishedDocument.publishedAt),
    };
  }

  if (payload.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION && payload.statusNote) {
    return {
      type: "observatory_status_note",
      label: safeAgentAuditText(payload.statusNote.eventLabel || payload.statusNote.note, "Observatory status note", 160),
      status: "published",
      visibility: "public",
      occurredAt: safeAgentAuditTimestamp(payload.statusNote.occurredAt),
    };
  }

  if (payload.capabilityRequest) {
    return {
      type: "capability_request",
      label: safeAgentAuditText(
        `${payload.capabilityRequest.categoryLabel}: ${payload.capabilityRequest.summary}`,
        "Capability request",
        220,
      ),
      status: "recorded",
    };
  }

  return {
    type: "none",
    label: "No artifact recorded",
    status: "missing",
  };
}

function developerSpaceAgentAuditArtifactFromConfirmation(row: any): DeveloperSpaceAgentAuditExportArtifact {
  const action = row.action as DeveloperSpaceAgentAuditExportAction;
  if (action === DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION) {
    const request = developerSpaceAgentCapabilityRequestFromPayload(row.sanitized_payload);
    return {
      type: "capability_request",
      label: safeAgentAuditText(`${request.categoryLabel}: ${request.summary}`, "Capability request", 220),
      status: "requested",
    };
  }
  if (action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION) {
    return {
      type: "private_draft_document",
      label: safeAgentAuditText(row.summary, "Private project-update draft", 160),
      status: "not_recorded",
      visibility: "private",
      linkVisibility: "owner",
      role: "field_log",
    };
  }
  if (action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION) {
    return {
      type: "published_document",
      label: safeAgentAuditText(row.summary, "Selected reviewed draft", 160),
      status: "not_recorded",
      visibility: "public",
      linkVisibility: "public",
    };
  }
  if (action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    const statusNote = developerSpaceAgentStatusNoteFromPayload(row.sanitized_payload);
    return {
      type: "observatory_status_note",
      label: safeAgentAuditText(statusNote.eventLabel || statusNote.note, "Observatory status note", 160),
      status: "not_recorded",
      visibility: "public",
      occurredAt: safeAgentAuditTimestamp(statusNote.occurredAt),
    };
  }
  if (action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION) {
    const suggestion = developerSpaceAgentLayoutSuggestionFromPayload(row.sanitized_payload);
    return {
      type: "layout_suggestion",
      label: safeAgentAuditText(
        `${suggestion.currentVisualModeLabel} to ${suggestion.suggestedVisualModeLabel}`,
        "Layout suggestion",
        160,
      ),
      status: "suggested",
      layoutSuggestion: suggestion,
    };
  }
  if (action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION) {
    const readiness = developerSpaceAgentRunJobReadinessFromPayload(row.sanitized_payload);
    return {
      type: "run_job_readiness",
      label: readiness.targetLabel,
      status: readiness.recognized ? "recognized_unready" : "unrecognized_unready",
      runJobReadiness: readiness,
    };
  }
  return {
    type: "none",
    label: "No artifact recorded",
    status: "missing",
  };
}

function serializeDeveloperSpaceAgentAuditExportItem(
  confirmation: any,
  receipt: any | null,
): DeveloperSpaceAgentAuditExportItem {
  const action = confirmation.action as DeveloperSpaceAgentAuditExportAction;
  const receiptRecord = receipt ? serializeDeveloperSpaceAgentExecutionReceipt(receipt) : null;
  const receiptPayload = receiptRecord?.receiptPayload ?? null;
  const fallbackSummary = action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
    ? "Private project update draft requested."
    : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? "Reviewed draft publish requested."
    : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
      ? "Observatory status-note update requested."
      : action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION
        ? "Layout suggestion recorded for owner review."
        : action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION
          ? "Run-job readiness dry-run recorded for owner review."
          : "Capability request recorded for owner planning.";
  const layoutSuggestion = action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION
    ? developerSpaceAgentLayoutSuggestionFromPayload(confirmation.sanitized_payload)
    : null;
  const runJobReadiness = action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION
    ? developerSpaceAgentRunJobReadinessFromPayload(confirmation.sanitized_payload)
    : null;

  return {
    action,
    confirmationStatus: effectiveDeveloperSpaceAgentConfirmationStatus(confirmation),
    requestedAt: safeAgentAuditTimestamp(confirmation.requested_at) ?? "",
    expiresAt: safeAgentAuditTimestamp(confirmation.expires_at) ?? "",
    approvedAt: safeAgentAuditTimestamp(confirmation.approved_at),
    cancelledAt: safeAgentAuditTimestamp(confirmation.cancelled_at),
    completedAt: receipt ? safeAgentAuditTimestamp(receipt.dispatched_at) : null,
    summary: safeAgentAuditText(confirmation.summary, fallbackSummary, 400),
    receiptStatus: receiptRecord?.status ?? (
      action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION
        || action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION
        ? "not_executable"
        : "missing"
    ),
    receiptSummary: receiptRecord
      ? safeAgentAuditText(receiptRecord.summary, "Receipt recorded.", 400)
      : null,
    artifact: receiptPayload
      ? developerSpaceAgentAuditArtifactFromReceiptPayload(receiptPayload)
      : developerSpaceAgentAuditArtifactFromConfirmation(confirmation),
    idempotency: {
      retrySafe: action !== DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION
        && action !== DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION,
      receiptRecorded: Boolean(receiptRecord),
      repeatUsesExistingReceipt: Boolean(receiptRecord),
    },
    executionAvailable: receiptPayload
      ? receiptPayload.executionAvailable
      : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        || action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    mutationAvailable: receiptPayload
      ? receiptPayload.mutationAvailable
      : action !== DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION
        && action !== DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION
        && action !== DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION,
    externalDispatch: false,
    boundaries: safeAgentAuditBoundaries(receiptPayload?.boundaries ?? layoutSuggestion?.boundaries ?? runJobReadiness?.boundaries),
    omittedFields: [...DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_OMITTED_FIELDS],
  };
}

function buildDeveloperSpaceAgentAuditExport(input: {
  confirmations: any[];
  receipts: any[];
  generatedAt: string;
}): DeveloperSpaceAgentAuditExport {
  const receiptByConfirmationId = new Map<string, any>();
  for (const receipt of input.receipts) {
    if (!DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTION_SET.has(receipt.action)) continue;
    if (typeof receipt.confirmation_id !== "string") continue;
    if (!receiptByConfirmationId.has(receipt.confirmation_id)) {
      receiptByConfirmationId.set(receipt.confirmation_id, receipt);
    }
  }

  const confirmations = [...input.confirmations]
    .filter((row) => DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTION_SET.has(row.action))
    .sort((left, right) => Date.parse(right.requested_at ?? "") - Date.parse(left.requested_at ?? ""))
    .slice(0, DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_LIMIT);

  return {
    generatedAt: input.generatedAt,
    scope: "owner_developer_space",
    actions: [...DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_ACTIONS],
    omittedFields: [...DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_OMITTED_FIELDS],
    retention: {
      source: "developer_space_agent_confirmations_and_receipts",
      note: "Audit export uses minimized owner-scoped confirmation and receipt metadata; private payloads and route identifiers remain omitted.",
    },
    items: confirmations.map((confirmation) =>
      serializeDeveloperSpaceAgentAuditExportItem(
        confirmation,
        typeof confirmation.id === "string"
          ? receiptByConfirmationId.get(confirmation.id) ?? null
          : null,
      )
    ),
  };
}

function developerSpaceAgentConfirmationStoreUnavailable(error: unknown) {
  const anyError = error as { code?: string; message?: string; details?: string };
  const text = `${anyError?.code ?? ""} ${anyError?.message ?? ""} ${anyError?.details ?? ""}`.toLowerCase();
  return text.includes("developer_space_agent_confirmations")
    && (
      text.includes("does not exist")
      || text.includes("schema cache")
      || text.includes("could not find")
      || text.includes("pgrst205")
      || text.includes("42p01")
    );
}

function developerSpaceAgentConfirmationStoreUnavailableBody() {
  return {
    error: "Developer Agent confirmation store is not available in this environment.",
    code: "developer_space_agent_confirmation_store_unavailable",
    executionAvailable: false,
  };
}

function developerSpaceAgentExecutionReceiptStoreUnavailable(error: unknown) {
  const anyError = error as { code?: string; message?: string; details?: string };
  const text = `${anyError?.code ?? ""} ${anyError?.message ?? ""} ${anyError?.details ?? ""}`.toLowerCase();
  return text.includes("developer_space_agent_execution_receipts")
    && (
      text.includes("does not exist")
      || text.includes("schema cache")
      || text.includes("could not find")
      || text.includes("pgrst205")
      || text.includes("42p01")
    );
}

function developerSpaceObservedRuntimeWebhookReceiptStoreUnavailable(error: unknown) {
  const anyError = error as { code?: string; message?: string; details?: string };
  const text = `${anyError?.code ?? ""} ${anyError?.message ?? ""} ${anyError?.details ?? ""}`.toLowerCase();
  return text.includes("developer_space_observed_runtime_webhook_receipts")
    && (
      text.includes("does not exist")
      || text.includes("schema cache")
      || text.includes("could not find")
      || text.includes("pgrst205")
      || text.includes("42p01")
    );
}

function developerSpaceAgentExecutionReceiptStoreUnavailableBody() {
  return {
    error: "Developer Agent receipt store is not available in this environment.",
    code: "developer_space_agent_execution_receipt_store_unavailable",
    executionAvailable: false,
  };
}

async function loadDeveloperSpaceAgentConfirmation(spaceId: string, ownerUserId: string, confirmationId: string) {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_confirmations")
    .select("*")
    .eq("id", confirmationId)
    .eq("developer_space_id", spaceId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) {
    if (developerSpaceAgentConfirmationStoreUnavailable(error)) {
      return {
        status: 503 as const,
        error: developerSpaceAgentConfirmationStoreUnavailableBody().error,
        code: developerSpaceAgentConfirmationStoreUnavailableBody().code,
      };
    }
    return { status: 500 as const, error: "Could not load Developer Agent confirmation." };
  }
  if (!data) return { status: 404 as const, error: "Developer Space agent confirmation not found." };
  return { status: 200 as const, confirmation: data };
}

async function loadDeveloperSpaceAgentExecutionReceipt(spaceId: string, ownerUserId: string, confirmationId: string) {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_execution_receipts")
    .select("*")
    .eq("developer_space_id", spaceId)
    .eq("owner_user_id", ownerUserId)
    .eq("confirmation_id", confirmationId)
    .maybeSingle();

  if (error) {
    if (developerSpaceAgentExecutionReceiptStoreUnavailable(error)) {
      return {
        status: 503 as const,
        error: developerSpaceAgentExecutionReceiptStoreUnavailableBody().error,
        code: developerSpaceAgentExecutionReceiptStoreUnavailableBody().code,
      };
    }
    return { status: 500 as const, error: "Could not load Developer Agent receipt." };
  }
  return { status: 200 as const, receipt: data ?? null };
}

async function loadDocumentByAuthorSlug(authorUserId: string, slug: string) {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("documents")
    .select("*")
    .eq("author_user_id", authorUserId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { status: 500 as const, error: "Could not load Developer Agent draft document." };
  return { status: 200 as const, document: data ?? null };
}

async function saveDeveloperSpaceProjectUpdateDraft(input: {
  space: any;
  confirmationId: string;
}) {
  const sb = getSupabaseAdmin() as any;
  let readback: DeveloperSpaceAgentReadback;
  try {
    readback = await loadDeveloperSpaceAgentReadback(input.space);
  } catch {
    return { status: 500 as const, error: "Could not load Developer Agent draft readback." };
  }
  const draft = buildDeveloperSpaceProjectUpdateDraft(input.space, readback);
  const role: DeveloperSpaceDocumentRole = "field_log";
  const slugHash = payloadHash({
    action: DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION,
    developerSpaceId: input.space.id,
    confirmationId: input.confirmationId,
  }).slice(0, 10);
  const slug = slugifyDocumentTitle(`${draft.title} ${slugHash}`);

  const existing = await loadDocumentByAuthorSlug(input.space.owner_user_id, slug);
  if (existing.status !== 200) return existing;

  let document = existing.document;
  if (!document) {
    const { data, error } = await sb
      .from("documents")
      .insert({
        author_user_id: input.space.owner_user_id,
        space_id: null,
        persona_id: null,
        title: draft.title,
        slug,
        body: draft.body,
        document_type: documentTypeForRole(role),
        status: "draft",
        visibility: "private",
        comments_enabled: false,
        published_at: null,
        provenance_type: "ai_assisted",
        source_type: "manual",
        source_id: input.space.id,
        source_label: `Developer Agent safe readback: ${safeAgentText(input.space.project_name, "Developer Space", 120)}`,
        source_persona_id: null,
      })
      .select("*")
      .single();

    if (error || !data) {
      if ((error as { code?: string } | null)?.code === "23505") {
        const reloaded = await loadDocumentByAuthorSlug(input.space.owner_user_id, slug);
        if (reloaded.status === 200 && reloaded.document) {
          document = reloaded.document;
        } else {
          return reloaded.status === 200
            ? { status: 500 as const, error: "Could not reload Developer Agent draft document." }
            : reloaded;
        }
      } else {
        return { status: 500 as const, error: "Could not create Developer Agent draft document." };
      }
    } else {
      document = data;
    }
  }

  const { data: link, error: linkError } = await sb
    .from("developer_space_documents")
    .upsert({
      developer_space_id: input.space.id,
      document_id: document.id,
      owner_user_id: input.space.owner_user_id,
      document_role: role,
      link_visibility: "owner",
      sort_order: 0,
    }, { onConflict: "developer_space_id,document_id" })
    .select("*")
    .single();

  if (linkError || !link) {
    return { status: 500 as const, error: "Could not link Developer Agent draft document." };
  }

  return {
    status: 200 as const,
    document,
    link,
    draftDocument: {
      title: safeAgentText(document.title, draft.title, 160),
      status: "draft" as const,
      visibility: "private" as const,
      linkVisibility: "owner" as const,
      role,
    },
  };
}

async function publishDeveloperSpaceAgentDraftDocument(input: {
  space: any;
  targetDocumentId?: string | null;
}) {
  const target = await loadDeveloperSpaceAgentPublishTarget(input);
  if (target.status !== 200) return target;

  const sb = getSupabaseAdmin() as any;
  const now = new Date().toISOString();
  const { data: document, error: documentError } = await sb
    .from("documents")
    .update({
      status: "published",
      visibility: "public",
      published_at: now,
    })
    .eq("id", target.document.id)
    .eq("author_user_id", input.space.owner_user_id)
    .select("*")
    .single();

  if (documentError || !document) {
    return {
      status: 500 as const,
      error: "Could not publish Developer Agent draft document.",
      code: "developer_space_agent_publish_document_failed",
      executionAvailable: false as const,
    };
  }

  const { data: link, error: linkError } = await sb
    .from("developer_space_documents")
    .update({
      link_visibility: "public",
    })
    .eq("id", target.link.id)
    .eq("developer_space_id", input.space.id)
    .eq("document_id", target.document.id)
    .eq("owner_user_id", input.space.owner_user_id)
    .select("*")
    .single();

  if (linkError || !link) {
    return {
      status: 500 as const,
      error: "Could not publish Developer Space evidence link.",
      code: "developer_space_agent_publish_link_failed",
      executionAvailable: false as const,
    };
  }

  return {
    status: 200 as const,
    document,
    link,
    publishedDocument: {
      title: safeAgentText(document.title, target.title, 160),
      status: "published" as const,
      visibility: "public" as const,
      linkVisibility: "public" as const,
      role: developerSpaceAgentDocumentRole(link.document_role),
      publishedAt: document.published_at ?? now,
    },
  };
}

async function rollbackDeveloperSpaceAgentDraftPublish(input: {
  space: any;
  targetDocumentId?: string | null;
}) {
  const targetDocumentId = input.targetDocumentId?.trim();
  if (!targetDocumentId) return;
  const sb = getSupabaseAdmin() as any;
  await sb
    .from("documents")
    .update({
      status: "draft",
      visibility: "private",
      published_at: null,
    })
    .eq("id", targetDocumentId)
    .eq("author_user_id", input.space.owner_user_id);
  await sb
    .from("developer_space_documents")
    .update({
      link_visibility: "owner",
    })
    .eq("developer_space_id", input.space.id)
    .eq("document_id", targetDocumentId)
    .eq("owner_user_id", input.space.owner_user_id);
}

function developerSpaceAgentStatusNoteDedupeKey(input: { spaceId: string; confirmationId: string }) {
  return payloadHash({
    action: DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    developerSpaceId: input.spaceId,
    confirmationId: input.confirmationId,
  }).slice(0, 20);
}

async function loadDeveloperSpaceAgentObservatoryStatusEvent(input: {
  space: any;
  confirmationId: string;
}) {
  const dedupeKey = developerSpaceAgentStatusNoteDedupeKey({
    spaceId: input.space.id,
    confirmationId: input.confirmationId,
  });
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_events")
    .select("*")
    .eq("developer_space_id", input.space.id)
    .eq("event_type", DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE);

  if (error) {
    return { status: 500 as const, error: "Could not load Developer Agent status-note event." };
  }

  const event = (data ?? []).find((row: any) => row.event_data?.dedupeKey === dedupeKey) ?? null;
  return { status: 200 as const, event };
}

async function publishDeveloperSpaceAgentObservatoryStatusNote(input: {
  space: any;
  confirmationId: string;
  statusNote: DeveloperSpaceAgentStatusNote;
  occurredAt: string;
}) {
  const existing = await loadDeveloperSpaceAgentObservatoryStatusEvent({
    space: input.space,
    confirmationId: input.confirmationId,
  });
  if (existing.status !== 200) return existing;
  if (existing.event) {
    return {
      status: 200 as const,
      event: existing.event,
      statusNote: {
        ...input.statusNote,
        occurredAt: existing.event.occurred_at ?? input.occurredAt,
      },
    };
  }

  const dedupeKey = developerSpaceAgentStatusNoteDedupeKey({
    spaceId: input.space.id,
    confirmationId: input.confirmationId,
  });
  const statusNote = {
    ...input.statusNote,
    occurredAt: input.occurredAt,
  };
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_events")
    .insert({
      developer_space_id: input.space.id,
      node_id: null,
      external_node_id: null,
      event_type: DEVELOPER_SPACE_AGENT_STATUS_NOTE_EVENT_TYPE,
      event_label: statusNote.eventLabel,
      event_data: {
        statusNote: statusNote.note,
        category: "observatory_status_note",
        source: "owner_confirmed_developer_agent",
        dedupeKey,
      },
      observed_runtime_classifications: observedRuntimeClassificationMetadata({
        statusNote: "public",
        category: "public",
        source: "public",
        dedupeKey: "owner",
      }),
      similarity_score: null,
      source_refs: [],
      provenance: "user",
      visibility: "public",
      occurred_at: input.occurredAt,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      status: 500 as const,
      error: "Could not publish Developer Agent observatory status note.",
    };
  }

  return {
    status: 200 as const,
    event: data,
    statusNote,
  };
}

async function ensureDeveloperSpaceAgentObservatoryStatusNoteForReceipt(input: {
  space: any;
  confirmation: any;
  receipt: any;
  occurredAt: string;
}) {
  if (input.receipt.action !== DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    return { status: 200 as const };
  }
  const statusNote = developerSpaceAgentStatusNoteFromPayload(
    input.receipt.receipt_payload ?? input.confirmation.sanitized_payload,
  );
  const ensured = await publishDeveloperSpaceAgentObservatoryStatusNote({
    space: input.space,
    confirmationId: input.confirmation.id,
    statusNote,
    occurredAt: input.receipt.dispatched_at ?? input.occurredAt,
  });
  if (ensured.status !== 200) {
    return {
      status: ensured.status,
      error: ensured.error,
      code: "developer_space_agent_status_note_publish_failed",
      executionAvailable: false,
    };
  }
  return { status: 200 as const };
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

  const [nodesResult, eventsResult, snapshotsResult, contextResult] = await Promise.all([
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
    (sb as any)
      .from("developer_space_observed_runtime_context")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("occurred_at", { ascending: false })
      .limit(200),
  ]);

  if (nodesResult.error) return { status: 500, error: nodesResult.error.message };
  if (eventsResult.error) return { status: 500, error: eventsResult.error.message };
  if (snapshotsResult.error) return { status: 500, error: snapshotsResult.error.message };
  if (contextResult.error) return { status: 500, error: contextResult.error.message };

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
  const publicFieldControls = includeRawData
    ? null
    : normaliseDeveloperSpacePublicFieldControls(space.visualisation_config);
  const emittedAt = new Date().toISOString();
  const detail = {
    space: serializeDeveloperSpace(space, { includeOperationalFields: access === "owner" }),
    nodes: nodes.map((node) => serializeDeveloperSpaceNode(node, {
      includeRawData,
      publicFieldKeys: publicFieldControls?.nodeMetricKeys,
      access,
    })),
    events: events.map((event) => serializeDeveloperSpaceEvent(event, {
      includeRawData,
      publicFieldKeys: publicFieldControls?.eventDataKeys,
      access,
    })),
    latestSnapshot: latestSnapshot ? serializeDeveloperSpaceSnapshot(latestSnapshot, {
      includeRawData,
      publicFieldKeys: publicFieldControls?.snapshotDataKeys,
      access,
    }) : null,
    supportingContext: (contextResult.data ?? []).map((context) => serializeDeveloperSpaceObservedRuntimeContext(context, {
      includeRawData,
      access,
    })),
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
  let classifiedNode;
  try {
    classifiedNode = prepareObservedRuntimeClassifiedData({
      data: parsed.data.metrics,
      fieldClassifications: parsed.data.fieldClassifications,
    });
  } catch (error) {
    return res.status(400).json(ingestionClassificationValidationError(error));
  }

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
      metrics: classifiedNode.data,
      observed_runtime_classifications: classifiedNode.metadata,
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
      metrics: classifiedNode.data,
    },
    observed_runtime_classifications: prefixObservedRuntimeMetadata(classifiedNode.metadata, "metrics"),
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
  let classifiedEvent;
  try {
    classifiedEvent = prepareObservedRuntimeClassifiedData({
      data: parsed.data.eventData,
      fieldClassifications: parsed.data.fieldClassifications,
    });
  } catch (error) {
    return res.status(400).json(ingestionClassificationValidationError(error));
  }
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
      event_data: classifiedEvent.data,
      observed_runtime_classifications: classifiedEvent.metadata,
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
  let classifiedSnapshot;
  try {
    classifiedSnapshot = prepareObservedRuntimeClassifiedData({
      data: parsed.data.snapshotData,
      fieldClassifications: parsed.data.fieldClassifications,
    });
  } catch (error) {
    return res.status(400).json(ingestionClassificationValidationError(error));
  }
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
      snapshot_data: classifiedSnapshot.data,
      observed_runtime_classifications: classifiedSnapshot.metadata,
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

async function persistDeveloperSpaceBatchImport(input: {
  res: Response;
  space: { id: string; slug: string; owner_user_id: string };
  payload: z.infer<typeof batchImportSchema>;
  storageBytesSource: unknown;
}) {
  const usageDelta = {
    nodes: input.payload.nodes.length,
    events: input.payload.events.length,
    snapshots: input.payload.snapshots.length,
    storageBytes: estimateDeveloperSpaceStorageBytes(input.storageBytesSource),
  };
  if (!(await enforceUsageQuota(input.res, input.space, usageDelta))) return null;

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const nodes = [];
  let classifiedNodes;
  let classifiedEvents;
  let classifiedSnapshots;
  let classifiedContext;
  try {
    classifiedNodes = input.payload.nodes.map((node) => ({
      input: node,
      classified: prepareObservedRuntimeClassifiedData({
        data: node.metrics,
        fieldClassifications: node.fieldClassifications,
      }),
    }));
    classifiedEvents = input.payload.events.map((event) => ({
      input: event,
      classified: prepareObservedRuntimeClassifiedData({
        data: event.eventData,
        fieldClassifications: event.fieldClassifications,
      }),
    }));
    classifiedSnapshots = input.payload.snapshots.map((snapshot) => ({
      input: snapshot,
      classified: prepareObservedRuntimeClassifiedData({
        data: snapshot.snapshotData,
        fieldClassifications: snapshot.fieldClassifications,
      }),
    }));
    classifiedContext = input.payload.supportingContext.map((context) => ({
      input: context,
      classified: prepareObservedRuntimeClassifiedData({
        data: context.payload,
        fieldClassifications: context.fieldClassifications,
      }),
    }));
  } catch (error) {
    input.res.status(400).json(ingestionClassificationValidationError(error));
    return null;
  }

  for (const { input: nodeInput, classified } of classifiedNodes) {
    const { data: node, error } = await sb
      .from("developer_space_nodes")
      .upsert({
        developer_space_id: input.space.id,
        external_id: nodeInput.nodeId,
        node_name: nodeInput.nodeName ?? nodeInput.nodeId,
        topology_type: nodeInput.topologyType,
        fragment_count: nodeInput.fragmentCount,
        self_similarity_score: nodeInput.selfSimilarityScore ?? null,
        dimensionality: nodeInput.dimensionality ?? null,
        metrics: classified.data,
        observed_runtime_classifications: classified.metadata,
        last_event_at: now,
      }, { onConflict: "developer_space_id,external_id" })
      .select("*")
      .single();
    if (error) {
      input.res.status(500).json(ingestionServerError("Could not import Developer Space node."));
      return null;
    }
    nodes.push(node);
  }

  const eventsPayload = [];
  for (const { input: event, classified } of classifiedEvents) {
    const node = await findNodeByExternalId(input.space.id, event.nodeId);
    eventsPayload.push({
      developer_space_id: input.space.id,
      node_id: node?.id ?? null,
      external_node_id: event.nodeId ?? null,
      event_type: event.eventType,
      event_label: event.eventLabel ?? null,
      event_data: classified.data,
      observed_runtime_classifications: classified.metadata,
      similarity_score: event.similarityScore ?? null,
      source_refs: normaliseSourceRefs(event.sourceRefs),
      provenance: event.provenance,
      visibility: event.visibility,
      occurred_at: event.occurredAt ?? now,
    });
  }

  const snapshotsPayload = classifiedSnapshots.map(({ input: snapshot, classified }) => ({
    developer_space_id: input.space.id,
    snapshot_data: classified.data,
    observed_runtime_classifications: classified.metadata,
    source_refs: normaliseSourceRefs(snapshot.sourceRefs),
    provenance: snapshot.provenance,
    visibility: snapshot.visibility,
    occurred_at: snapshot.occurredAt ?? now,
  }));

  const contextPayload = classifiedContext.map(({ input: context, classified }) => ({
    developer_space_id: input.space.id,
    context_type: context.contextType,
    external_id: context.externalId ?? null,
    source_ref: context.sourceRef ?? null,
    payload: classified.data,
    observed_runtime_classifications: classified.metadata,
    provenance: context.provenance,
    occurred_at: context.occurredAt ?? now,
  }));

  if (eventsPayload.length > 0) {
    const { error } = await sb.from("developer_space_events").insert(eventsPayload);
    if (error) {
      input.res.status(500).json(ingestionServerError("Could not import Developer Space events."));
      return null;
    }
  }

  if (snapshotsPayload.length > 0) {
    const { error } = await sb.from("developer_space_snapshots").insert(snapshotsPayload);
    if (error) {
      input.res.status(500).json(ingestionServerError("Could not import Developer Space snapshots."));
      return null;
    }
  }

  if (contextPayload.length > 0) {
    const { error } = await (sb as any).from("developer_space_observed_runtime_context").insert(contextPayload);
    if (error) {
      input.res.status(500).json(ingestionServerError("Could not import observed runtime context."));
      return null;
    }
  }

  await recordUsageSilently(input.space, usageDelta);
  broadcastDeveloperSpaceIngestion({
    slug: input.space.slug,
    source: "import",
    counts: {
      nodes: nodes.length,
      events: eventsPayload.length,
      snapshots: snapshotsPayload.length,
    },
  });

  return {
    imported: {
      nodes: nodes.length,
      events: eventsPayload.length,
      snapshots: snapshotsPayload.length,
      supportingContext: contextPayload.length,
    },
  };
}

developerSpacesRouter.post("/ingest/import", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;
  if (!(await enforceIngestionRateLimit(res, ingestion))) return;

  const parsed = batchImportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));
  const result = await persistDeveloperSpaceBatchImport({
    res,
    space,
    payload: parsed.data,
    storageBytesSource: req.body,
  });
  if (!result) return;
  return res.status(202).json({
    imported: result.imported,
  });
});

function observedRuntimeWebhookId(req: Request, envelope: z.infer<typeof observedRuntimeWebhookSchema>) {
  const header = req.headers["x-station-webhook-id"] ?? req.headers["idempotency-key"];
  const raw = Array.isArray(header) ? header[0] : header;
  return typeof raw === "string" && raw.trim() ? raw.trim() : envelope.deliveryId ?? null;
}

function stableJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJsonValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, stableJsonValue(nested)])
  );
}

function payloadHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(stableJsonValue(value))).digest("hex");
}

function observedRuntimeProcessingReceiptBody(webhookId: string) {
  return {
    accepted: false,
    replayed: false,
    webhookId,
    status: "processing",
  };
}

function observedRuntimeInProgressBody(webhookId: string) {
  return ingestionErrorBody({
    error: "Observed runtime webhook delivery is already being processed.",
    code: "developer_space_webhook_in_progress",
    category: "validation",
    details: {
      webhookId,
      retryable: true,
    },
  });
}

function observedRuntimeFailedReceiptBody(input: {
  webhookId: string;
  status: number;
  body: unknown;
}) {
  return {
    accepted: false,
    replayed: false,
    webhookId: input.webhookId,
    status: "failed",
    statusCode: input.status,
    body: input.body,
  };
}

function observedRuntimeProcessingFailedBody(status: number) {
  return ingestionErrorBody({
    error: "Observed runtime webhook delivery did not complete.",
    code: "developer_space_webhook_processing_failed",
    category: status >= 500 ? "server" : "validation",
  });
}

function serializeWebhookSigningSecret(row: any) {
  return {
    id: row.id,
    developerSpaceId: row.developer_space_id,
    ownerUserId: row.owner_user_id,
    fingerprint: row.secret_fingerprint,
    lastFour: row.secret_last_four,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? null,
    revokedAt: row.revoked_at ?? null,
  };
}

function observedRuntimeWebhookSignatureToleranceSeconds() {
  return positiveIntFromEnv(
    "DEVELOPER_SPACE_OBSERVED_RUNTIME_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS",
    DEFAULT_OBSERVED_RUNTIME_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS,
  );
}

function parseStationSignatureHeader(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parts = Object.fromEntries(
    raw.split(",")
      .map((part) => part.trim().split("="))
      .filter((part): part is [string, string] => part.length === 2 && part[0].length > 0 && part[1].length > 0)
  );
  const timestamp = Number.parseInt(parts.t ?? "", 10);
  const signature = parts.v1 ?? "";
  if (!Number.isInteger(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return null;
  return { timestamp, signature };
}

function verifyObservedRuntimeWebhookSignature(input: {
  rawBody: Buffer;
  signatureHeader: unknown;
  signingSecret: string;
}) {
  const parsed = parseStationSignatureHeader(input.signatureHeader);
  if (!parsed) {
    return {
      ok: false as const,
      code: "developer_space_webhook_signature_malformed",
      error: "Observed runtime webhook signature is missing or malformed.",
    };
  }

  const toleranceSeconds = observedRuntimeWebhookSignatureToleranceSeconds();
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - parsed.timestamp) > toleranceSeconds) {
    return {
      ok: false as const,
      code: "developer_space_webhook_signature_stale",
      error: "Observed runtime webhook signature timestamp is outside the allowed tolerance.",
    };
  }

  const expected = createHmac("sha256", input.signingSecret)
    .update(`${parsed.timestamp}.`)
    .update(input.rawBody)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(parsed.signature, "hex");
  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return {
      ok: false as const,
      code: "developer_space_webhook_signature_invalid",
      error: "Observed runtime webhook signature is invalid.",
    };
  }

  return { ok: true as const };
}

async function loadActiveObservedRuntimeSigningSecret(developerSpaceId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("developer_space_webhook_signing_secrets")
    .select("*")
    .eq("developer_space_id", developerSpaceId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Could not load Developer Space webhook signing secret.");
  return data ?? null;
}

async function resolveObservedRuntimeWebhookSigningSecret(input: {
  ingestionRawKey: string;
  spaceId: string;
}) {
  const active = await loadActiveObservedRuntimeSigningSecret(input.spaceId);
  if (!active) {
    return { signingSecret: input.ingestionRawKey, dedicatedSecret: null, source: "ingestion_key" as const };
  }
  if (!developerSpaceWebhookSigningSecretEncryptionConfigured()) {
    return { signingSecret: input.ingestionRawKey, dedicatedSecret: null, source: "ingestion_key_fallback_unconfigured" as const };
  }

  return {
    signingSecret: decryptDeveloperSpaceWebhookSigningSecret(active.encrypted_secret),
    dedicatedSecret: active,
    source: "dedicated_secret" as const,
  };
}

async function loadObservedRuntimeWebhookReceipt(input: {
  developerSpaceId: string;
  webhookId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("developer_space_observed_runtime_webhook_receipts")
    .select("*")
    .eq("developer_space_id", input.developerSpaceId)
    .eq("webhook_id", input.webhookId)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Could not check observed runtime webhook receipt.");
  return data ?? null;
}

function existingObservedRuntimeWebhookReceiptResponse(input: {
  existing: any;
  payloadHash: string;
  webhookId: string;
}) {
  if (input.existing.payload_hash !== input.payloadHash) {
    return {
      status: 409,
      body: ingestionErrorBody({
        error: "Observed runtime webhook id has already been used with a different payload.",
        code: "developer_space_webhook_replay_conflict",
        category: "validation",
      }),
    };
  }

  if (input.existing.response_body?.status === "processing") {
    return {
      status: 409,
      body: observedRuntimeInProgressBody(input.webhookId),
    };
  }

  if (input.existing.response_body?.status === "failed") {
    return {
      status: input.existing.response_body.statusCode ?? 500,
      body: input.existing.response_body.body ?? ingestionServerError("Observed runtime webhook delivery did not complete."),
    };
  }

  return {
    status: 200,
    body: {
      accepted: false,
      replayed: true,
      webhookId: input.webhookId,
      imported: input.existing.response_body?.imported ?? {},
    },
  };
}

async function claimObservedRuntimeWebhookReceipt(input: {
  developerSpaceId: string;
  webhookId: string;
  payloadHash: string;
}) {
  const existing = await loadObservedRuntimeWebhookReceipt({
    developerSpaceId: input.developerSpaceId,
    webhookId: input.webhookId,
  });
  if (existing) {
    return {
      claimed: false as const,
      response: existingObservedRuntimeWebhookReceiptResponse({
        existing,
        payloadHash: input.payloadHash,
        webhookId: input.webhookId,
      }),
    };
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("developer_space_observed_runtime_webhook_receipts")
    .insert({
      developer_space_id: input.developerSpaceId,
      webhook_id: input.webhookId,
      payload_hash: input.payloadHash,
      response_body: observedRuntimeProcessingReceiptBody(input.webhookId),
    })
    .select("*")
    .single();

  if (!error && data) {
    return { claimed: true as const, receipt: data };
  }

  const raced = await loadObservedRuntimeWebhookReceipt({
    developerSpaceId: input.developerSpaceId,
    webhookId: input.webhookId,
  });
  if (raced) {
    return {
      claimed: false as const,
      response: existingObservedRuntimeWebhookReceiptResponse({
        existing: raced,
        payloadHash: input.payloadHash,
        webhookId: input.webhookId,
      }),
    };
  }

  throw new Error(error?.message ?? "Could not claim observed runtime webhook receipt.");
}

async function finalizeObservedRuntimeWebhookReceipt(input: {
  receiptId: string;
  responseBody: unknown;
}) {
  const { error } = await (getSupabaseAdmin() as any)
    .from("developer_space_observed_runtime_webhook_receipts")
    .update({ response_body: input.responseBody })
    .eq("id", input.receiptId);
  if (error) throw new Error(error.message ?? "Could not finalize observed runtime webhook receipt.");
}

async function finalizeFailedObservedRuntimeWebhookReceipt(input: {
  receiptId: string;
  webhookId: string;
  status: number;
  body: unknown;
}) {
  await finalizeObservedRuntimeWebhookReceipt({
    receiptId: input.receiptId,
    responseBody: observedRuntimeFailedReceiptBody(input),
  });
}

developerSpacesRouter.post("/ingest/observed-runtime", async (req, res) => {
  const ingestion = await loadSpaceForIngestion(req, res);
  if (!ingestion) return;
  const { space } = ingestion;

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json(ingestionSignatureError(
      "developer_space_webhook_raw_body_required",
      "Observed runtime webhook requires a raw JSON body for signature verification.",
    ));
  }

  let signingMaterial;
  try {
    signingMaterial = await resolveObservedRuntimeWebhookSigningSecret({
      ingestionRawKey: ingestion.rawKey,
      spaceId: space.id,
    });
  } catch {
    return res.status(500).json(ingestionServerError("Could not load Developer Space webhook signing secret."));
  }

  const signature = verifyObservedRuntimeWebhookSignature({
    rawBody: req.body,
    signatureHeader: req.headers["x-station-signature"],
    signingSecret: signingMaterial.signingSecret,
  });
  if (!signature.ok) {
    return res.status(401).json(ingestionSignatureError(signature.code, signature.error));
  }

  if (signingMaterial.dedicatedSecret) {
    await (getSupabaseAdmin() as any)
      .from("developer_space_webhook_signing_secrets")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", signingMaterial.dedicatedSecret.id);
  }

  let body: unknown;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json(ingestionErrorBody({
      error: "Observed runtime webhook body must be valid JSON.",
      code: "developer_space_webhook_json_invalid",
      category: "validation",
    }));
  }

  const parsed = observedRuntimeWebhookSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json(ingestionValidationError(parsed.error));

  const webhookId = observedRuntimeWebhookId(req, parsed.data);
  if (!webhookId) {
    return res.status(400).json(ingestionErrorBody({
      error: "Observed runtime webhook id is required.",
      code: "developer_space_webhook_id_missing",
      category: "validation",
    }));
  }

  const hash = payloadHash(parsed.data.payload);
  let claim;
  try {
    claim = await claimObservedRuntimeWebhookReceipt({
      developerSpaceId: space.id,
      webhookId,
      payloadHash: hash,
    });
  } catch {
    return res.status(500).json(ingestionServerError("Could not claim observed runtime webhook receipt."));
  }
  if (!claim.claimed) return res.status(claim.response.status).json(claim.response.body);

  const rateLimit = await checkIngestionRateLimit(ingestion);
  if (!rateLimit.allowed) {
    try {
      await finalizeFailedObservedRuntimeWebhookReceipt({
        receiptId: claim.receipt.id,
        webhookId,
        status: rateLimit.status,
        body: rateLimit.body,
      });
    } catch {
      return res.status(500).json(ingestionServerError("Could not finalize observed runtime webhook receipt."));
    }
    return res.status(rateLimit.status).json(rateLimit.body);
  }

  const result = await persistDeveloperSpaceBatchImport({
    res,
    space,
    payload: parsed.data.payload,
    storageBytesSource: body,
  });
  if (!result) {
    try {
      await finalizeFailedObservedRuntimeWebhookReceipt({
        receiptId: claim.receipt.id,
        webhookId,
        status: res.statusCode >= 400 ? res.statusCode : 500,
        body: observedRuntimeProcessingFailedBody(res.statusCode >= 400 ? res.statusCode : 500),
      });
    } catch {
      // The original bounded ingestion response has already been sent.
    }
    return;
  }

  const responseBody = {
    accepted: true,
    replayed: false,
    webhookId,
    imported: result.imported,
  };
  try {
    await finalizeObservedRuntimeWebhookReceipt({
      receiptId: claim.receipt.id,
      responseBody,
    });
  } catch {
    return res.status(500).json(ingestionServerError("Could not record observed runtime webhook receipt."));
  }

  return res.status(202).json(responseBody);
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

developerSpacesRouter.get("/:id/agent/actions", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  return res.json({
    actions: developerSpaceAgentRegistry(),
    boundary: {
      autonomousExecution: false,
      mutatesDeveloperSpace: false,
      exposesRawPayloads: false,
      ownerOnly: true,
    },
  });
});

developerSpacesRouter.post("/:id/agent/actions/preview", requireAuth, async (req, res) => {
  const parsed = developerSpaceAgentActionPreviewSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const action = parsed.data.action;
  if (DEVELOPER_SPACE_AGENT_FUTURE_ACTION_SET.has(action)) {
    return res.json(futureLaneAgentPreview(action, parsed.data.input, ownerLoad.space));
  }
  if (!DEVELOPER_SPACE_AGENT_ALLOWED_ACTION_SET.has(action)) {
    return res.status(400).json(unsupportedAgentPreview(action));
  }

  try {
    const readback = await loadDeveloperSpaceAgentReadback(ownerLoad.space);
    return res.json(buildDeveloperSpaceAgentPreview(
      action as DeveloperSpaceAgentAllowedAction,
      ownerLoad.space,
      readback,
    ));
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "Could not preview Developer Space agent action.",
    });
  }
});

developerSpacesRouter.get("/:id/agent/actions/confirmations", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_confirmations")
    .select("*")
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .order("requested_at", { ascending: false });

  if (error) {
    if (developerSpaceAgentConfirmationStoreUnavailable(error)) {
      return res.json({
        confirmations: [],
        setup: {
          confirmationStoreAvailable: false,
          code: developerSpaceAgentConfirmationStoreUnavailableBody().code,
        },
      });
    }
    return res.status(500).json({
      error: "Could not load Developer Agent confirmations.",
      code: "developer_space_agent_confirmations_unavailable",
    });
  }
  return res.json({
    confirmations: (data ?? []).map(serializeDeveloperSpaceAgentConfirmation),
    setup: { confirmationStoreAvailable: true },
  });
});

developerSpacesRouter.get("/:id/agent/actions/receipts", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_execution_receipts")
    .select("*")
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .order("dispatched_at", { ascending: false })
    .limit(20);

  if (error) {
    if (developerSpaceAgentExecutionReceiptStoreUnavailable(error)) {
      return res.json({
        receipts: [],
        setup: {
          receiptStoreAvailable: false,
          code: developerSpaceAgentExecutionReceiptStoreUnavailableBody().code,
        },
      });
    }
    return res.status(500).json({
      error: "Could not load Developer Agent receipts.",
      code: "developer_space_agent_execution_receipts_unavailable",
    });
  }

  return res.json({
    receipts: (data ?? []).map(serializeDeveloperSpaceAgentExecutionReceipt),
    setup: { receiptStoreAvailable: true },
  });
});

developerSpacesRouter.get("/:id/agent/actions/audit-export", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const sb = getSupabaseAdmin() as any;
  const confirmationsResult = await sb
    .from("developer_space_agent_confirmations")
    .select("*")
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .order("requested_at", { ascending: false })
    .limit(DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_LIMIT);

  if (confirmationsResult.error) {
    if (developerSpaceAgentConfirmationStoreUnavailable(confirmationsResult.error)) {
      return res.json({
        auditExport: buildDeveloperSpaceAgentAuditExport({
          confirmations: [],
          receipts: [],
          generatedAt: new Date().toISOString(),
        }),
        setup: {
          confirmationStoreAvailable: false,
          receiptStoreAvailable: false,
          code: developerSpaceAgentConfirmationStoreUnavailableBody().code,
        },
      });
    }
    return res.status(500).json({
      error: "Could not load Developer Agent audit confirmations.",
      code: "developer_space_agent_audit_confirmations_unavailable",
    });
  }

  const receiptsResult = await sb
    .from("developer_space_agent_execution_receipts")
    .select("*")
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .order("dispatched_at", { ascending: false })
    .limit(DEVELOPER_SPACE_AGENT_AUDIT_EXPORT_LIMIT);

  if (receiptsResult.error && !developerSpaceAgentExecutionReceiptStoreUnavailable(receiptsResult.error)) {
    return res.status(500).json({
      error: "Could not load Developer Agent audit receipts.",
      code: "developer_space_agent_audit_receipts_unavailable",
    });
  }

  return res.json({
    auditExport: buildDeveloperSpaceAgentAuditExport({
      confirmations: confirmationsResult.data ?? [],
      receipts: receiptsResult.error ? [] : receiptsResult.data ?? [],
      generatedAt: new Date().toISOString(),
    }),
    setup: {
      confirmationStoreAvailable: true,
      receiptStoreAvailable: !receiptsResult.error,
      ...(receiptsResult.error
        ? { code: developerSpaceAgentExecutionReceiptStoreUnavailableBody().code }
        : {}),
    },
  });
});

developerSpacesRouter.post("/:id/agent/actions/confirmations", requireAuth, async (req, res) => {
  const parsed = createDeveloperSpaceAgentConfirmationSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const action = parsed.data.action;
  if (DEVELOPER_SPACE_AGENT_ALLOWED_ACTION_SET.has(action)) {
    return res.status(400).json({
      error: "This Developer Agent action is preview-only and does not require a durable confirmation.",
      code: "developer_space_agent_confirmation_not_required",
    });
  }
  if (!DEVELOPER_SPACE_AGENT_FUTURE_ACTION_SET.has(action)) {
    return res.status(400).json({
      error: "This Developer Agent action is not registered for confirmation.",
      code: "developer_space_agent_confirmation_unsupported_action",
    });
  }

  const entry = developerSpaceAgentEntry(action);
  if (!entry?.futureLane || !entry.requiresConfirmation) {
    return res.status(400).json({
      error: "This Developer Agent action is not confirmable in the current lane.",
      code: "developer_space_agent_confirmation_not_required",
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + parsed.data.expiresInMinutes * 60_000).toISOString();
  let sanitizedPayload: Record<string, unknown>;
  if (action === DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION) {
    sanitizedPayload = developerSpaceAgentCapabilityConfirmationPayload(
      entry,
      developerSpaceAgentCapabilityRequest(parsed.data),
    );
  } else if (action === DEVELOPER_SPACE_AGENT_LAYOUT_SUGGESTION_ACTION) {
    sanitizedPayload = developerSpaceAgentLayoutSuggestionConfirmationPayload(entry, ownerLoad.space);
  } else if (action === DEVELOPER_SPACE_AGENT_RUN_JOB_READINESS_ACTION) {
    sanitizedPayload = developerSpaceAgentRunJobReadinessConfirmationPayload(entry, parsed.data);
  } else if (action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    const statusNote = developerSpaceAgentStatusNote(parsed.data);
    if (!statusNote) {
      return res.status(400).json({
        error: "A selected observatory status note is required.",
        code: "developer_space_agent_status_note_required",
        executionAvailable: false,
      });
    }
    sanitizedPayload = developerSpaceAgentUpdateObservatoryConfirmationPayload(entry, statusNote);
  } else if (action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION) {
    const target = await loadDeveloperSpaceAgentPublishTarget({
      space: ownerLoad.space,
      targetDocumentId: parsed.data.targetDocumentId,
    });
    if (target.status !== 200) {
      return res.status(target.status).json({
        error: target.error,
        code: target.code,
        executionAvailable: target.executionAvailable,
      });
    }
    sanitizedPayload = developerSpaceAgentPublishConfirmationPayload(entry, target);
  } else {
    sanitizedPayload = developerSpaceAgentConfirmationPayload(action as DeveloperSpaceAgentFutureAction, entry);
  }
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_confirmations")
    .insert({
      developer_space_id: ownerLoad.space.id,
      owner_user_id: ownerLoad.space.owner_user_id,
      action,
      status: "pending",
      summary: sanitizedPayload.summary,
      preview_hash: payloadHash(sanitizedPayload),
      sanitized_payload: sanitizedPayload,
      requested_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error && developerSpaceAgentConfirmationStoreUnavailable(error)) {
      return res.status(503).json(developerSpaceAgentConfirmationStoreUnavailableBody());
    }
    return res.status(500).json({
      error: "Could not create Developer Agent confirmation.",
      code: "developer_space_agent_confirmation_create_failed",
      executionAvailable: false,
    });
  }
  return res.status(201).json({
    confirmation: serializeDeveloperSpaceAgentConfirmation(data),
    executionAvailable: action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      || action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    message: action === DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION
      ? "Capability request recorded for owner triage. No external action executed."
      : action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        ? "Publish confirmation recorded for the selected reviewed draft."
        : action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
          ? "Observatory status-note confirmation recorded for owner review."
        : "Confirmation recorded for owner review only. Execution is unavailable in this lane.",
  });
});

developerSpacesRouter.post("/:id/agent/actions/confirmations/:confirmationId/approve", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const loaded = await loadDeveloperSpaceAgentConfirmation(
    ownerLoad.space.id,
    ownerLoad.space.owner_user_id,
    req.params.confirmationId,
  );
  if (loaded.status !== 200) return res.status(loaded.status).json({
    error: loaded.error,
    ...("code" in loaded ? { code: loaded.code } : {}),
    executionAvailable: false,
  });

  const now = new Date();
  const effectiveStatus = effectiveDeveloperSpaceAgentConfirmationStatus(loaded.confirmation, now);
  if (effectiveStatus === "expired") {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from("developer_space_agent_confirmations")
      .update({ status: "expired" })
      .eq("id", loaded.confirmation.id)
      .eq("developer_space_id", ownerLoad.space.id)
      .eq("owner_user_id", ownerLoad.space.owner_user_id)
      .select("*")
      .single();
    if (error || !data) {
      if (error && developerSpaceAgentConfirmationStoreUnavailable(error)) {
        return res.status(503).json(developerSpaceAgentConfirmationStoreUnavailableBody());
      }
      return res.status(500).json({
        error: "Could not expire Developer Agent confirmation.",
        code: "developer_space_agent_confirmation_expire_failed",
        executionAvailable: false,
      });
    }
    return res.status(409).json({
      error: "Developer Agent confirmation has expired.",
      code: "developer_space_agent_confirmation_expired",
      confirmation: serializeDeveloperSpaceAgentConfirmation(data),
      executionAvailable: false,
    });
  }
  if (effectiveStatus !== "pending") {
    return res.status(409).json({
      error: `Developer Agent confirmation is ${effectiveStatus}.`,
      code: "developer_space_agent_confirmation_not_pending",
      confirmation: serializeDeveloperSpaceAgentConfirmation(loaded.confirmation),
      executionAvailable: false,
    });
  }

  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_confirmations")
    .update({ status: "approved", approved_at: now.toISOString() })
    .eq("id", loaded.confirmation.id)
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .select("*")
    .single();

  if (error || !data) {
    if (error && developerSpaceAgentConfirmationStoreUnavailable(error)) {
      return res.status(503).json(developerSpaceAgentConfirmationStoreUnavailableBody());
    }
    return res.status(500).json({
      error: "Could not approve Developer Agent confirmation.",
      code: "developer_space_agent_confirmation_approve_failed",
      executionAvailable: false,
    });
  }
  return res.json({
    confirmation: serializeDeveloperSpaceAgentConfirmation(data),
    executionAvailable: data.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      || data.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
    message: data.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
      ? "Confirmation approved. The selected reviewed draft can now be published."
      : data.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
        ? "Confirmation approved. The selected observatory status note can now be published."
      : "Confirmation approved. Execution is unavailable in this lane.",
  });
});

developerSpacesRouter.post("/:id/agent/actions/confirmations/:confirmationId/cancel", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const loaded = await loadDeveloperSpaceAgentConfirmation(
    ownerLoad.space.id,
    ownerLoad.space.owner_user_id,
    req.params.confirmationId,
  );
  if (loaded.status !== 200) return res.status(loaded.status).json({
    error: loaded.error,
    ...("code" in loaded ? { code: loaded.code } : {}),
    executionAvailable: false,
  });

  const effectiveStatus = effectiveDeveloperSpaceAgentConfirmationStatus(loaded.confirmation);
  if (effectiveStatus === "cancelled") {
    return res.json({
      confirmation: serializeDeveloperSpaceAgentConfirmation(loaded.confirmation),
      executionAvailable: false,
      message: "Confirmation already cancelled. No action executed.",
    });
  }
  if (effectiveStatus === "approved") {
    return res.status(409).json({
      error: "Approved Developer Agent confirmations cannot be cancelled in this lane.",
      code: "developer_space_agent_confirmation_already_approved",
      confirmation: serializeDeveloperSpaceAgentConfirmation(loaded.confirmation),
      executionAvailable: false,
    });
  }

  const now = new Date();
  const patch = effectiveStatus === "expired"
    ? { status: "expired" }
    : { status: "cancelled", cancelled_at: now.toISOString() };
  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_confirmations")
    .update(patch)
    .eq("id", loaded.confirmation.id)
    .eq("developer_space_id", ownerLoad.space.id)
    .eq("owner_user_id", ownerLoad.space.owner_user_id)
    .select("*")
    .single();

  if (error || !data) {
    if (error && developerSpaceAgentConfirmationStoreUnavailable(error)) {
      return res.status(503).json(developerSpaceAgentConfirmationStoreUnavailableBody());
    }
    return res.status(500).json({
      error: "Could not cancel Developer Agent confirmation.",
      code: "developer_space_agent_confirmation_cancel_failed",
      executionAvailable: false,
    });
  }
  return res.json({
    confirmation: serializeDeveloperSpaceAgentConfirmation(data),
    executionAvailable: false,
    message: effectiveStatus === "expired"
      ? "Confirmation expired. No action executed."
      : "Confirmation cancelled. No action executed.",
  });
});

developerSpacesRouter.post("/:id/agent/actions/confirmations/:confirmationId/execute", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const loaded = await loadDeveloperSpaceAgentConfirmation(
    ownerLoad.space.id,
    ownerLoad.space.owner_user_id,
    req.params.confirmationId,
  );
  if (loaded.status !== 200) return res.status(loaded.status).json({
    error: loaded.error,
    ...("code" in loaded ? { code: loaded.code } : {}),
    executionAvailable: false,
  });

  const now = new Date();
  const effectiveStatus = effectiveDeveloperSpaceAgentConfirmationStatus(loaded.confirmation, now);
  if (effectiveStatus === "expired") {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from("developer_space_agent_confirmations")
      .update({ status: "expired" })
      .eq("id", loaded.confirmation.id)
      .eq("developer_space_id", ownerLoad.space.id)
      .eq("owner_user_id", ownerLoad.space.owner_user_id)
      .select("*")
      .single();
    if (error || !data) {
      if (error && developerSpaceAgentConfirmationStoreUnavailable(error)) {
        return res.status(503).json(developerSpaceAgentConfirmationStoreUnavailableBody());
      }
      return res.status(500).json({
        error: "Could not expire Developer Agent confirmation.",
        code: "developer_space_agent_confirmation_expire_failed",
        executionAvailable: false,
      });
    }
    return res.status(409).json({
      error: "Developer Agent confirmation has expired.",
      code: "developer_space_agent_confirmation_expired",
      executionAvailable: false,
    });
  }

  if (effectiveStatus !== "approved") {
    return res.status(409).json({
      error: "Developer Agent confirmation must be approved before a receipt can be recorded.",
      code: "developer_space_agent_confirmation_not_approved",
      executionAvailable: false,
    });
  }

  if (!DEVELOPER_SPACE_AGENT_EXECUTABLE_ACTIONS.has(loaded.confirmation.action)) {
    return res.status(409).json({
      error: "This approved Developer Agent action remains blocked in the receipt harness.",
      code: "developer_space_agent_execution_action_blocked",
      executionAvailable: false,
    });
  }

  if (!developerSpaceAgentConfirmationPayloadMatchesHash(loaded.confirmation)) {
    return res.status(409).json({
      error: "Developer Agent confirmation payload no longer matches its review hash.",
      code: "developer_space_agent_confirmation_payload_mismatch",
      executionAvailable: false,
    });
  }

  const existing = await loadDeveloperSpaceAgentExecutionReceipt(
    ownerLoad.space.id,
    ownerLoad.space.owner_user_id,
    loaded.confirmation.id,
  );
  if (existing.status !== 200) return res.status(existing.status).json({
    error: existing.error,
    ...("code" in existing ? { code: existing.code } : {}),
    executionAvailable: false,
  });
  if (existing.receipt) {
    const receiptAction = existing.receipt.action === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
      ? DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
      : existing.receipt.action === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        ? DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        : existing.receipt.action === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
          ? DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
      : DEVELOPER_SPACE_AGENT_EXECUTION_RECEIPT_ACTION;
    const ensured = await ensureDeveloperSpaceAgentObservatoryStatusNoteForReceipt({
      space: ownerLoad.space,
      confirmation: loaded.confirmation,
      receipt: existing.receipt,
      occurredAt: now.toISOString(),
    });
    if (ensured.status !== 200) {
      return res.status(ensured.status).json({
        error: ensured.error,
        code: ensured.code,
        executionAvailable: ensured.executionAvailable,
      });
    }
    return res.json({
      receipt: serializeDeveloperSpaceAgentExecutionReceipt(existing.receipt),
      idempotent: true,
      executionAvailable: receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
        || receiptAction === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
      message: receiptAction === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
        ? "Private project update draft receipt was already recorded. No duplicate draft was created."
        : receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
          ? "Reviewed project update draft was already published. No duplicate receipt or publication was created."
        : receiptAction === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
          ? "Public observatory status note was already published. No duplicate note or receipt was created."
        : "Capability request receipt was already recorded. No external action executed.",
    });
  }

  const receiptAction = loaded.confirmation.action as DeveloperSpaceAgentExecutionReceiptAction;
  let receiptPayload: DeveloperSpaceAgentExecutionReceiptRecord["receiptPayload"];
  let receiptSummary = "Capability request receipt recorded for owner planning. No external action executed.";
  let successMessage = "Capability request receipt recorded. No external action executed.";
  let executionAvailable = false;
  let publishedTargetDocumentId: string | null = null;

  if (receiptAction === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION) {
    const saved = await saveDeveloperSpaceProjectUpdateDraft({
      space: ownerLoad.space,
      confirmationId: loaded.confirmation.id,
    });
    if (saved.status !== 200) {
      return res.status(saved.status).json({
        error: saved.error,
        code: "developer_space_agent_draft_document_save_failed",
        executionAvailable: false,
      });
    }
    receiptPayload = developerSpaceAgentDraftDocumentReceiptPayload({
      title: saved.draftDocument.title,
      role: saved.draftDocument.role,
    });
    receiptSummary = "Private project update draft saved for owner review. Nothing was published.";
    successMessage = "Private project update draft saved. Public publishing and external execution remain unavailable.";
  } else if (receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION) {
    const targetDocumentId = developerSpaceAgentPublishTargetId(loaded.confirmation.sanitized_payload);
    const published = await publishDeveloperSpaceAgentDraftDocument({
      space: ownerLoad.space,
      targetDocumentId,
    });
    if (published.status !== 200) {
      return res.status(published.status).json({
        error: published.error,
        code: published.code,
        executionAvailable: published.executionAvailable,
      });
    }
    receiptPayload = developerSpaceAgentPublishDocumentReceiptPayload({
      title: published.publishedDocument.title,
      role: published.publishedDocument.role,
      publishedAt: published.publishedDocument.publishedAt,
    });
    publishedTargetDocumentId = targetDocumentId;
    receiptSummary = "Reviewed project update draft published to the public Developer Space evidence path.";
    successMessage = "Reviewed project update draft published to the public Developer Space evidence path.";
    executionAvailable = true;
  } else if (receiptAction === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION) {
    const statusNote = developerSpaceAgentStatusNoteFromPayload(loaded.confirmation.sanitized_payload);
    const published = await publishDeveloperSpaceAgentObservatoryStatusNote({
      space: ownerLoad.space,
      confirmationId: loaded.confirmation.id,
      statusNote,
      occurredAt: now.toISOString(),
    });
    if (published.status !== 200) {
      return res.status(published.status).json({
        error: published.error,
        code: "developer_space_agent_status_note_publish_failed",
        executionAvailable: false,
      });
    }
    receiptPayload = developerSpaceAgentObservatoryStatusNoteReceiptPayload(published.statusNote);
    receiptSummary = `Public observatory status note published: ${published.statusNote.note}`;
    successMessage = "Public observatory status note published to the Developer Space event stream.";
    executionAvailable = true;
  } else {
    const capabilityRequest = developerSpaceAgentCapabilityRequestFromPayload(loaded.confirmation.sanitized_payload);
    receiptPayload = developerSpaceAgentExecutionReceiptPayload(capabilityRequest);
    receiptSummary = `Capability request recorded: ${capabilityRequest.categoryLabel} - ${capabilityRequest.summary}`;
    successMessage = "Capability request recorded for owner triage. No external action executed.";
  }

  const { data, error } = await (getSupabaseAdmin() as any)
    .from("developer_space_agent_execution_receipts")
    .insert({
      developer_space_id: ownerLoad.space.id,
      owner_user_id: ownerLoad.space.owner_user_id,
      confirmation_id: loaded.confirmation.id,
      action: receiptAction,
      status: "recorded",
      summary: receiptSummary,
      receipt_payload: receiptPayload,
      dispatched_at: now.toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    if ((error as { code?: string } | null)?.code === "23505") {
      const receipt = await loadDeveloperSpaceAgentExecutionReceipt(
        ownerLoad.space.id,
        ownerLoad.space.owner_user_id,
        loaded.confirmation.id,
      );
      if (receipt.status === 200 && receipt.receipt) {
        const ensured = await ensureDeveloperSpaceAgentObservatoryStatusNoteForReceipt({
          space: ownerLoad.space,
          confirmation: loaded.confirmation,
          receipt: receipt.receipt,
          occurredAt: now.toISOString(),
        });
        if (ensured.status !== 200) {
          return res.status(ensured.status).json({
            error: ensured.error,
            code: ensured.code,
            executionAvailable: ensured.executionAvailable,
          });
        }
        return res.json({
          receipt: serializeDeveloperSpaceAgentExecutionReceipt(receipt.receipt),
          idempotent: true,
          executionAvailable: receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
            || receiptAction === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION,
          message: receiptAction === DEVELOPER_SPACE_AGENT_DRAFT_DOCUMENT_ACTION
            ? "Private project update draft receipt was already recorded. No duplicate draft was created."
            : receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION
              ? "Reviewed project update draft was already published. No duplicate receipt or publication was created."
            : receiptAction === DEVELOPER_SPACE_AGENT_OBSERVATORY_UPDATE_ACTION
              ? "Public observatory status note was already published. No duplicate note or receipt was created."
            : "Capability request receipt was already recorded. No external action executed.",
        });
      }
    }
    if (receiptAction === DEVELOPER_SPACE_AGENT_PUBLISH_DOCUMENT_ACTION) {
      await rollbackDeveloperSpaceAgentDraftPublish({
        space: ownerLoad.space,
        targetDocumentId: publishedTargetDocumentId,
      });
    }
    if (error && developerSpaceAgentExecutionReceiptStoreUnavailable(error)) {
      return res.status(503).json(developerSpaceAgentExecutionReceiptStoreUnavailableBody());
    }
    return res.status(500).json({
      error: "Could not record Developer Agent receipt.",
      code: "developer_space_agent_execution_receipt_create_failed",
      executionAvailable: false,
    });
  }

  return res.status(201).json({
    receipt: serializeDeveloperSpaceAgentExecutionReceipt(data),
    idempotent: false,
    executionAvailable,
    message: successMessage,
  });
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

  if (keyError) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.rotateApiKey);

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

  if (error || !data) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.rotateApiKey);
  return res.status(201).json({ apiKey, space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.get("/:id/ingestion-keys", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const { data, error } = await getSupabaseAdmin()
    .from("developer_space_ingestion_keys")
    .select("*")
    .eq("developer_space_id", ownerLoad.space.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.loadIngestionKeys);
  return res.json({ keys: (data ?? []).map(serializeDeveloperSpaceIngestionKey) });
});

developerSpacesRouter.post("/:id/ingestion-keys", requireAuth, async (req, res) => {
  const parsed = createIngestionKeySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const apiKey = generateDeveloperSpaceApiKey();
  const { data, error } = await getSupabaseAdmin()
    .from("developer_space_ingestion_keys")
    .insert({
      developer_space_id: ownerLoad.space.id,
      owner_user_id: ownerLoad.space.owner_user_id,
      key_hash: hashDeveloperSpaceApiKey(apiKey),
      key_last_four: apiKey.slice(-4),
      label: parsed.data.label,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.createIngestionKey);
  return res.status(201).json({ apiKey, key: serializeDeveloperSpaceIngestionKey(data) });
});

developerSpacesRouter.post("/:id/ingestion-keys/:keyId/revoke", requireAuth, async (req, res) => {
  const ownerLoad = await loadDeveloperSpaceForOwner(req.params.id, req.user!);
  if (ownerLoad.status !== 200) return res.status(ownerLoad.status).json({ error: ownerLoad.error });

  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("developer_space_ingestion_keys")
    .update({ status: "revoked", revoked_at: now })
    .eq("id", req.params.keyId)
    .eq("developer_space_id", ownerLoad.space.id)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.revokeIngestionKey);
  if (!data) return res.status(404).json({ error: "Ingestion key not found." });
  return res.json({ key: serializeDeveloperSpaceIngestionKey(data) });
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

  if (error || !data) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.revokeApiKey);
  return res.json({ space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.post("/:id/observed-runtime-signing-secret", requireAuth, async (req, res) => {
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
  if (!developerSpaceWebhookSigningSecretEncryptionConfigured()) {
    return res.status(503).json(signingSecretConfigError());
  }

  const now = new Date().toISOString();
  await (sb as any)
    .from("developer_space_webhook_signing_secrets")
    .update({ status: "revoked", revoked_at: now })
    .eq("developer_space_id", space.id)
    .eq("status", "active");

  const signingSecret = generateDeveloperSpaceWebhookSigningSecret();
  const { data: secret, error } = await (sb as any)
    .from("developer_space_webhook_signing_secrets")
    .insert({
      developer_space_id: space.id,
      owner_user_id: space.owner_user_id,
      encrypted_secret: encryptDeveloperSpaceWebhookSigningSecret(signingSecret),
      secret_hash: hashDeveloperSpaceWebhookSigningSecret(signingSecret),
      secret_fingerprint: fingerprintDeveloperSpaceWebhookSigningSecret(signingSecret),
      secret_last_four: signingSecret.slice(-4),
      status: "active",
    })
    .select("*")
    .single();

  if (error || !secret) {
    return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.createSigningSecret);
  }

  return res.status(201).json({
    signingSecret,
    secret: serializeWebhookSigningSecret(secret),
  });
});

developerSpacesRouter.post("/:id/observed-runtime-signing-secret/revoke", requireAuth, async (req, res) => {
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
  const { data, error } = await (sb as any)
    .from("developer_space_webhook_signing_secrets")
    .update({ status: "revoked", revoked_at: now })
    .eq("developer_space_id", space.id)
    .eq("status", "active")
    .select("*");

  if (error) return res.status(500).json(DEVELOPER_SPACE_CREDENTIAL_ERROR_RESPONSES.revokeSigningSecret);
  const revoked = Array.isArray(data) ? data.map(serializeWebhookSigningSecret) : [];
  return res.json({ revoked });
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
  const { data: existing, error: loadError } = await sb
    .from("developer_spaces")
    .select("id, owner_user_id")
    .eq("id", req.params.id)
    .single();

  if (loadError || !existing) return res.status(404).json({ error: "Developer Space not found." });
  if (existing.owner_user_id !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Not authorised." });
  }

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
