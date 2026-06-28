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

type ReplaySetupProof = {
  id: string;
  status: "setup_proven";
  evidence: string[];
  remainingRisk?: string;
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
    id: "supabase_auth_redirects",
    status: "pending_external",
    owner: "human_dashboard",
    evidenceRequired: [
      "Supabase Auth site URL and allowed redirects include the Railway web URL.",
      "The password-reset target /reset-password/update is deployed and included in the redirect allow-list.",
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
    id: "cloudflare_account_setup",
    status: "disabled_pending",
    owner: "provider_decision",
    evidenceRequired: [
      "Cloudflare Worker/Vectorize account, index, and query privacy contract are selected or explicitly deferred.",
      "Remote candidates are reauthorized through Station before any private records return.",
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

const SETUP_PROOFS: ReplaySetupProof[] = [
  {
    id: "remote_database",
    status: "setup_proven",
    evidence: [
      "Public /health/deployment reports database ok true from the deployed API.",
    ],
  },
  {
    id: "supabase_migrations_025_028",
    status: "setup_proven",
    evidence: [
      "Supabase MCP history includes migrations 025 through 028 on staging.",
      "Public /health/deployment proves the public schema objects introduced by migrations 025 through 028.",
    ],
    remainingRisk: "Migration 029 and the current bounded replay retrieval path are tracked by station_free_1536_retrieval_path.",
  },
  {
    id: "station_free_1536_retrieval_path",
    status: "setup_proven",
    evidence: [
      "PR432 proves hosted /health/deployment selects station_free_1536 with Gemini embeddings configured.",
      "Migration 029 provider-aware memory and archive RPC proofs are green on staging.",
      "The bounded staging replay corpus has Gemini/1536/backfill-v2 memory rows and read-only hostile retrieval smoke passed without storing raw private corpus text.",
    ],
    remainingRisk: "Future corpus, provider, model, dimension, or index changes need a fresh scoped reindex and hostile retrieval smoke.",
  },
  {
    id: "persona_files_storage",
    status: "setup_proven",
    evidence: [
      "Public /health/deployment reports persona-files bucket exists, private true, and storage ok true.",
    ],
    remainingRisk: "Signed upload/read smoke remains useful before replaying archive imports.",
  },
  {
    id: "nvidia_platform_chat",
    status: "setup_proven",
    evidence: [
      "Public /health/deployment reports platform chat true and NVIDIA true.",
      "PR433 proves the Station provider router selects nvidia_openai_compatible with the current openai/gpt-oss-120b model label.",
      "A synthetic-only NVIDIA probe returned a non-empty response through the OpenAI-compatible route without recording prompt or completion text.",
    ],
    remainingRisk: "Exact-output compliance was noisy in the synthetic probe, and the current OpenAI-compatible adapter does not parse provider usage tokens from NVIDIA responses. Keep private/sensitive replay blocked until MIMIR accepts provider/data-policy boundaries.",
  },
  {
    id: "operational_cache_boundary",
    status: "setup_proven",
    evidence: [
      "The API has an optional operational-cache boundary for runtime-context cache, idempotency, rate-limit, and short-lived queue state.",
      "/health/deployment reports only non-secret Redis/Upstash booleans plus operational-cache provider kind/enabled/disabled status.",
      "Redis/Valkey is not canonical memory in current replay scope; any memory-truth promotion needs separate durability/export/deletion/audit review.",
    ],
    remainingRisk: "Provider-specific staging smoke is useful only when a replay flow depends on cache behavior rather than Supabase persistence.",
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
    setupProofs: SETUP_PROOFS,
    setupBlockers: SETUP_BLOCKERS,
    handoff: {
      nextStep: "Run staged replay only after remaining external blockers are resolved or explicitly waived.",
      reviewFocus: ["measurement coverage", "staging blockers", "privacy boundaries", "no speculative optimization"],
    },
  };
}
