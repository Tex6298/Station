type ReplayMeasurementPoint = {
  id: string;
  label: string;
  captureSurfaces: string[];
  metrics: string[];
  privacyBoundary: string;
};

type ReplaySetupBlocker = {
  id: string;
  status: "pending_external" | "disabled_pending" | "needs_staging_proof";
  owner: "human_dashboard" | "staging_replay" | "provider_decision";
  evidenceRequired: string[];
};

const MEASUREMENT_POINTS: ReplayMeasurementPoint[] = [
  {
    id: "chat_latency_context_quality",
    label: "Chat latency and context quality",
    captureSurfaces: ["/observability/summary", "/observability/traces", "/conversations/persona/:personaId/context-preview"],
    metrics: ["trace duration_ms", "input/output token counts", "context source counts", "manual quality notes"],
    privacyBoundary: "Capture trace metadata and source counts only; do not store context-preview response bodies, prompt bodies, or private archive excerpts.",
  },
  {
    id: "archive_upload_import_confidence",
    label: "Archive upload/import confidence",
    captureSurfaces: ["/persona-files/persona/:personaId/register", "/imports/:id/status", "/imports/persona/:personaId"],
    metrics: ["job status", "chunks created", "owner-visible error labels", "retry outcome"],
    privacyBoundary: "Capture job IDs, statuses, counts, and sanitized errors; do not capture raw uploaded text.",
  },
  {
    id: "retrieval_relevance",
    label: "Retrieval relevance",
    captureSurfaces: ["/conversations/persona/:personaId/archive-retrieval", "/conversations/persona/:personaId/context-preview"],
    metrics: ["retrieval mode", "authorized chunk count", "skipped source count", "human relevance rating"],
    privacyBoundary: "Use bounded excerpts only during manual review; evidence should store counts, modes, and ratings, not excerpt text.",
  },
  {
    id: "provider_cost_failure_rate",
    label: "Provider cost and failure rate",
    captureSurfaces: ["/observability/summary", "/observability/traces"],
    metrics: ["provider/model", "estimated cost pence", "failure count", "latency"],
    privacyBoundary: "Trace payloads must stay sanitized and must not include provider keys or prompt text.",
  },
  {
    id: "job_failure_recovery",
    label: "Job failure recovery",
    captureSurfaces: ["/imports/:id/status", "/imports/:id/retry", "/exports/:id"],
    metrics: ["failed status count", "retry status", "same-job completion", "sanitized error labels"],
    privacyBoundary: "Capture status transitions and sanitized error labels only.",
  },
  {
    id: "export_trust",
    label: "Export trust",
    captureSurfaces: ["/exports/persona/:personaId", "/exports/developer-spaces/:spaceId", "/exports/:id"],
    metrics: ["package status", "included section counts", "privacy boundary notes", "failure labels"],
    privacyBoundary: "Review generated owner-only manifests deliberately; do not mirror manifest bodies into telemetry.",
  },
  {
    id: "billing_webhook_reliability",
    label: "Billing/webhook path reliability",
    captureSurfaces: ["/billing/status", "/billing/checkout", "/billing/webhook"],
    metrics: ["billing status", "checkout outcome", "webhook verification outcome", "token-credit status"],
    privacyBoundary: "Capture Stripe object IDs and statuses only; do not log webhook secrets or card/payment details.",
  },
];

const SETUP_BLOCKERS: ReplaySetupBlocker[] = [
  {
    id: "supabase_migrations_025_028",
    status: "needs_staging_proof",
    owner: "human_dashboard",
    evidenceRequired: [
      "Staging migration history includes migrations 025 through 028.",
      "Remote vector/RPC smoke proves archive retrieval, lifecycle filtering, provider policy, and retrieval metadata.",
    ],
  },
  {
    id: "cache_provider_selection",
    status: "disabled_pending",
    owner: "provider_decision",
    evidenceRequired: [
      "Redis/Valkey or Upstash role/provider is selected for staging, or explicitly deferred.",
      "Cache remains non-canonical memory until separate durability/export/deletion review.",
    ],
  },
  {
    id: "cloudflare_account_setup",
    status: "disabled_pending",
    owner: "provider_decision",
    evidenceRequired: [
      "Cloudflare Worker/Vectorize account, index, and query privacy contract are selected.",
      "Remote candidates are reauthorized through Station before any private records return.",
    ],
  },
  {
    id: "stripe_replay_resources",
    status: "pending_external",
    owner: "human_dashboard",
    evidenceRequired: [
      "Stripe test prices and webhook secret are configured for staged API.",
      "Replay account can run checkout/webhook smoke without production billing.",
    ],
  },
  {
    id: "provider_config",
    status: "pending_external",
    owner: "human_dashboard",
    evidenceRequired: [
      "At least one platform chat provider is configured for staging.",
      "OpenAI embedding key is configured before remote vector retrieval is considered proven.",
    ],
  },
  {
    id: "replay_account_data",
    status: "pending_external",
    owner: "staging_replay",
    evidenceRequired: [
      "Replay account exists with persona, archive import, continuity, Space/document, discussion, Developer Space, export, and billing path coverage.",
    ],
  },
];

export function buildReplayOptimizationPrep(now = new Date()) {
  return {
    status: "prep_only" as const,
    generatedAt: now.toISOString(),
    policy: {
      optimizeFromReplayEvidenceOnly: true,
      localGuessworkAllowed: false,
      productUiChangesIncluded: false,
      providerSwapsIncluded: false,
    },
    captureSurfaces: [
      "/health/deployment",
      "/observability/summary",
      "/observability/traces",
      "/observability/traces/:traceId",
      "/imports/:id/status",
      "/imports/:id/retry",
      "/exports/:id",
      "/billing/status",
    ],
    measurementPoints: MEASUREMENT_POINTS,
    setupBlockers: SETUP_BLOCKERS,
    handoff: {
      nextStep: "Run staged replay only after remote setup blockers are resolved or explicitly waived.",
      reviewFocus: ["measurement coverage", "staging blockers", "privacy boundaries", "no speculative optimization"],
    },
  };
}
