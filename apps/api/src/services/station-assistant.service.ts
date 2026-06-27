import { getSupabaseAdmin } from "../lib/supabase";

type PersonaRow = {
  id: string;
  name: string;
  visibility?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type ImportJobRow = {
  id: string;
  persona_id?: string | null;
  kind?: string | null;
  status?: string | null;
  source_name?: string | null;
  error_message?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type ContinuityCandidateRow = {
  id: string;
  persona_id?: string | null;
  candidate_type?: string | null;
  status?: string | null;
  source_table?: string | null;
  source_label?: string | null;
  created_at?: string | null;
};

type DocumentRow = {
  id: string;
  title: string;
  status?: string | null;
  visibility?: string | null;
  document_type?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

type IntegritySessionRow = {
  id: string;
  persona_id?: string | null;
  status?: string | null;
  session_type?: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type MemoryRow = {
  id: string;
  persona_id?: string | null;
  title?: string | null;
  source_type?: string | null;
  created_at?: string | null;
};

type CanonRow = {
  id: string;
  persona_id?: string | null;
  title?: string | null;
  source_type?: string | null;
  created_at?: string | null;
};

type ExportPackageRow = {
  id: string;
  status?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type AssistantAction = {
  id: string;
  label: string;
  detail: string;
  href: string;
  priority: "critical" | "high" | "normal";
};

export type AssistantActionKind =
  | "studio_setup"
  | "import_review"
  | "import_issue"
  | "import_progress"
  | "archive_search"
  | "publishing"
  | "integrity"
  | "export"
  | "quota_config";

export type AssistantActionCard = {
  id: string;
  kind: AssistantActionKind;
  label: string;
  detail: string;
  href: string;
  priority: "critical" | "high" | "normal";
  count?: number;
  status?: string;
  deferred?: boolean;
};

export async function getStationAssistantContext(ownerUserId: string) {
  const sb = getSupabaseAdmin();

  const [personas, importJobs, documents, integritySessions, memoryItems, canonItems] = await Promise.all([
    readRows<PersonaRow>(
      sb
        .from("personas")
        .select("id, name, visibility, updated_at, created_at")
        .eq("owner_user_id", ownerUserId)
        .order("updated_at", { ascending: false })
        .limit(12)
    ),
    readRows<ImportJobRow>(
      sb
        .from("import_jobs")
        .select("id, persona_id, kind, status, source_name, error_message, updated_at, created_at")
        .eq("owner_user_id", ownerUserId)
        .order("updated_at", { ascending: false })
        .limit(12)
    ),
    readRows<DocumentRow>(
      sb
        .from("documents")
        .select("id, title, status, visibility, document_type, updated_at, published_at, created_at")
        .eq("author_user_id", ownerUserId)
        .order("updated_at", { ascending: false })
        .limit(12)
    ),
    readRows<IntegritySessionRow>(
      sb
        .from("integrity_sessions")
        .select("id, persona_id, status, session_type, completed_at, updated_at, created_at")
        .eq("owner_user_id", ownerUserId)
        .order("updated_at", { ascending: false })
        .limit(12)
    ),
    readRows<MemoryRow>(
      sb
        .from("memory_items")
        .select("id, persona_id, title, source_type, created_at")
        .eq("owner_user_id", ownerUserId)
        .order("created_at", { ascending: false })
        .limit(12)
    ),
    readRows<CanonRow>(
      sb
        .from("canon_items")
        .select("id, persona_id, title, source_type, created_at")
        .eq("owner_user_id", ownerUserId)
        .order("created_at", { ascending: false })
        .limit(12)
    ),
  ]);

  return {
    role: "station_assistant",
    posture: "operational_helper_not_persona",
    summary: buildSummary(personas, importJobs, documents, integritySessions, memoryItems, canonItems),
    counts: {
      personas: personas.length,
      recentImportJobs: importJobs.length,
      recentDocuments: documents.length,
      recentIntegritySessions: integritySessions.length,
      recentMemoryItems: memoryItems.length,
      recentCanonItems: canonItems.length,
    },
    nextActions: buildNextActions(personas, importJobs, documents, integritySessions, memoryItems, canonItems),
    recent: {
      personas: personas.slice(0, 6).map((row) => ({
        id: row.id,
        name: safeSnippet(row.name, 60),
        visibility: row.visibility ?? "private",
        href: `/studio/personas/${row.id}`,
        updatedAt: row.updated_at ?? row.created_at ?? null,
      })),
      imports: importJobs.slice(0, 6).map((row) => ({
        id: row.id,
        status: row.status ?? "queued",
        sourceName: safeSourceLabel(row.source_name, "Untitled import"),
        kind: row.kind ?? "import",
        errorMessage: row.error_message ? safeSnippet(row.error_message, 120) : null,
        href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
        updatedAt: row.updated_at ?? row.created_at ?? null,
      })),
      documents: documents.slice(0, 6).map((row) => ({
        id: row.id,
        title: safeSnippet(row.title, 80),
        status: row.status ?? "draft",
        visibility: row.visibility ?? "private",
        documentType: row.document_type ?? "essay",
        href: "/studio/publishing",
        updatedAt: row.updated_at ?? row.published_at ?? row.created_at ?? null,
      })),
    },
  };
}

async function readRows<T>(query: PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>) {
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

function safeSnippet(value: string | null | undefined, maxLength = 90) {
  const normalized = (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[redacted]")
    .replace(/\b(?:service[_-]?role|api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, "[redacted]")
    .trim();
  if (!normalized) return "";
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
}

function safeSourceLabel(value: string | null | undefined, fallback = "Imported source") {
  const compact = safeSnippet(value, 72);
  if (!compact) return fallback;
  if (/[\\/]/.test(compact)) return fallback;
  return compact;
}

function buildSummary(
  personas: PersonaRow[],
  importJobs: ImportJobRow[],
  documents: DocumentRow[],
  integritySessions: IntegritySessionRow[],
  memoryItems: MemoryRow[],
  canonItems: CanonRow[]
) {
  if (personas.length === 0) {
    return "Start with one persona, then run an Integrity Session before adding public material.";
  }

  const failedImports = importJobs.filter((job) => job.status === "failed").length;
  const completedImports = importJobs.filter((job) => job.status === "completed").length;
  const drafts = documents.filter((document) => document.status === "draft").length;

  if (failedImports > 0) return `${failedImports} import needs review before the archive can be trusted.`;
  if (completedImports > 0 && integritySessions.length === 0) {
    return "Imported material is present; run a Migration Integrity Session to turn it into reviewed continuity.";
  }
  if (drafts > 0) return `${drafts} draft document${drafts === 1 ? " is" : "s are"} waiting for publishing review.`;
  if (memoryItems.length > 0 && canonItems.length === 0) return "Memory exists, but no Canon has been pinned yet.";
  return "The private Studio is ready for continuity work: archive, review, publish selectively, and export regularly.";
}

function buildNextActions(
  personas: PersonaRow[],
  importJobs: ImportJobRow[],
  documents: DocumentRow[],
  integritySessions: IntegritySessionRow[],
  memoryItems: MemoryRow[],
  canonItems: CanonRow[]
): AssistantAction[] {
  const actions: AssistantAction[] = [];
  const firstPersonaId = personas[0]?.id;

  if (personas.length === 0) {
    actions.push({
      id: "create-persona",
      label: "Create the first persona",
      detail: "Use Fresh Start, Awakening, or a document-backed migration path before adding public material.",
      href: "/studio/new",
      priority: "critical",
    });
  }

  if (importJobs.some((job) => job.status === "failed")) {
    const failed = importJobs.find((job) => job.status === "failed");
    const source = safeSourceLabel(failed?.source_name, "One import");
    const error = failed?.error_message ? ` Error: ${safeSnippet(failed.error_message, 90)}` : "";
    actions.push({
      id: "review-failed-import",
      label: "Review failed import",
      detail: `${source} failed before Station could preserve it cleanly.${error}`,
      href: failed?.persona_id ? `/studio/personas/${failed.persona_id}/files` : "/studio/archive",
      priority: "critical",
    });
  }

  if (firstPersonaId && integritySessions.length === 0) {
    actions.push({
      id: "run-integrity",
      label: "Run the first Integrity Session",
      detail: "Capture the persona's core identity, private/public boundaries, and continuity anchors.",
      href: `/studio/personas/${firstPersonaId}/calibration`,
      priority: "high",
    });
  }

  if (firstPersonaId && memoryItems.length > 0 && canonItems.length === 0) {
    actions.push({
      id: "pin-canon",
      label: "Promote key material to Canon",
      detail: "Canon should hold the few things that must always survive context compression.",
      href: `/studio/personas/${firstPersonaId}/canon`,
      priority: "high",
    });
  }

  if (documents.some((document) => document.status === "draft")) {
    actions.push({
      id: "review-drafts",
      label: "Review publishing drafts",
      detail: "Use the approval queue to check visibility, provenance, public readback, linked discussion readback, and retract-to-private boundaries.",
      href: "/studio/publishing",
      priority: "high",
    });
  } else if (personas.length > 0) {
    actions.push({
      id: "draft-document",
      label: "Draft a Station document",
      detail: "Turn private continuity into an essay, codex, field log, or archive note without exposing the source archive.",
      href: "/studio/publish",
      priority: "normal",
    });
  }

  if (personas.length > 0 && importJobs.length === 0) {
    actions.push({
      id: "add-archive-source",
      label: "Add archive source material",
      detail: "Upload or paste conversation history before relying on persona memory.",
      href: firstPersonaId ? `/studio/personas/${firstPersonaId}/files` : "/studio/archive",
      priority: "normal",
    });
  }

  actions.push({
    id: "export-trust",
    label: "Check export readiness",
    detail: "Station's preservation promise depends on users being able to leave with portable archives.",
    href: "/studio/export",
    priority: "normal",
  });

  return actions.slice(0, 6);
}

export async function getStationAssistantSummary(ownerUserId: string): Promise<StationAssistantSummary> {
  const sb = getSupabaseAdmin();

  const [
    personas,
    conversations,
    archivedChats,
    memoryItems,
    canonItems,
    candidates,
    documents,
    integritySessions,
    importJobs,
    spaces,
    developerSpaces,
    exportPackages,
  ] = await Promise.all([
    readRows<PersonaRow>(
      sb.from("personas").select("id, name, visibility, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(20)
    ),
    readRows<any>(
      sb.from("conversations").select("id, status, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<any>(
      sb.from("archived_chat_transcripts").select("id, updated_at, created_at").eq("owner_user_id", ownerUserId).order("created_at", { ascending: false }).limit(100)
    ),
    readRows<MemoryRow>(
      sb.from("memory_items").select("id, persona_id, title, source_type, created_at").eq("owner_user_id", ownerUserId).order("created_at", { ascending: false }).limit(100)
    ),
    readRows<CanonRow>(
      sb.from("canon_items").select("id, persona_id, title, source_type, created_at").eq("owner_user_id", ownerUserId).order("created_at", { ascending: false }).limit(100)
    ),
    readRows<ContinuityCandidateRow>(
      sb.from("continuity_candidates").select("id, persona_id, candidate_type, status, source_table, source_label, created_at").eq("owner_user_id", ownerUserId).order("created_at", { ascending: false }).limit(100)
    ),
    readRows<DocumentRow>(
      sb.from("documents").select("id, title, status, visibility, document_type, updated_at, published_at, created_at").eq("author_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<IntegritySessionRow>(
      sb.from("integrity_sessions").select("id, persona_id, status, session_type, completed_at, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<ImportJobRow>(
      sb.from("import_jobs").select("id, persona_id, kind, status, source_name, error_message, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<any>(
      sb.from("spaces").select("id, title, slug, is_public, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<any>(
      sb.from("developer_spaces").select("id, project_name, slug, visibility, updated_at, created_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
    readRows<ExportPackageRow>(
      sb.from("export_packages").select("id, status, created_at, updated_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
  ]);

  const pendingImports = importJobs.filter((job) => job.status === "queued" || job.status === "processing").length;
  const failedImports = importJobs.filter((job) => job.status === "failed").length;
  const draftDocuments = documents.filter((document) => document.status === "draft").length;
  const publishedDocuments = documents.filter((document) => document.status === "published").length;

  const nextActions = buildAssistantSummaryActions({
    personas,
    importJobs,
    documents,
    integritySessions,
    memoryItems,
    canonItems,
    candidates,
    pendingImports,
    failedImports,
    draftDocuments,
    pendingCandidates: candidates.filter((candidate) => candidate.status === "pending").length,
    exportPackages,
  });

  return {
    counts: {
      personas: personas.length,
      activeConversations: conversations.filter((conversation) => conversation.status !== "archived").length,
      archivedConversations: archivedChats.length + conversations.filter((conversation) => conversation.status === "archived").length,
      memoryItems: memoryItems.length,
      canonItems: canonItems.length,
      pendingContinuityCandidates: candidates.filter((candidate) => candidate.status === "pending").length,
      draftDocuments,
      publishedDocuments,
      pendingImports,
      failedImports,
      spaces: spaces.length,
      developerSpaces: developerSpaces.length,
      exportPackages: exportPackages.length,
    },
    recent: {
      personas: personas.slice(0, 6).map((persona) => ({
        id: persona.id,
        name: safeSnippet(persona.name, 60),
        visibility: persona.visibility ?? "private",
      })),
      imports: importJobs.slice(0, 6).map((job) => ({
        id: job.id,
        sourceName: safeSourceLabel(job.source_name, "Untitled import"),
        status: job.status ?? "queued",
        updatedAt: job.updated_at ?? job.created_at ?? null,
      })),
      documents: documents.slice(0, 6).map((document) => ({
        id: document.id,
        title: safeSnippet(document.title, 80),
        status: document.status ?? "draft",
        documentType: document.document_type ?? "essay",
      })),
    },
    nextActions,
  };
}

function buildAssistantSummaryActions(input: {
  personas: PersonaRow[];
  importJobs: ImportJobRow[];
  documents: DocumentRow[];
  integritySessions: IntegritySessionRow[];
  memoryItems: MemoryRow[];
  canonItems: CanonRow[];
  candidates: ContinuityCandidateRow[];
  pendingImports: number;
  failedImports: number;
  draftDocuments: number;
  pendingCandidates: number;
  exportPackages: ExportPackageRow[];
}) {
  const actions: AssistantActionCard[] = [];
  const firstPersonaId = input.personas[0]?.id;
  const personaNames = new Map(input.personas.map((persona) => [persona.id, safeSnippet(persona.name, 60)]));
  const pendingImportCandidates = input.candidates.filter((candidate) =>
    candidate.status === "pending" && candidate.source_table === "persona_files"
  );

  if (input.personas.length === 0) {
    actions.push({
      id: "create-persona",
      kind: "studio_setup",
      label: "Create the first persona",
      detail: "Create a private persona before importing archive material or publishing.",
      href: "/studio/new",
      priority: "critical",
      status: "missing",
    });
  }
  if (pendingImportCandidates.length > 0) {
    const personaId = pendingImportCandidates[0]?.persona_id ?? firstPersonaId;
    const personaLabel = personaId ? personaNames.get(personaId) ?? "this persona" : "this persona";
    actions.push({
      id: `import-review-${personaId ?? "all"}`,
      kind: "import_review",
      label: "Review import Memory/Canon",
      detail: `${pendingImportCandidates.length} imported candidate${pendingImportCandidates.length === 1 ? "" : "s"} need owner review for ${personaLabel}.`,
      href: personaId ? `/studio/personas/${personaId}/files` : "/studio/archive",
      priority: "critical",
      count: pendingImportCandidates.length,
      status: "pending",
    });
  }
  if (input.failedImports > 0) {
    const failed = input.importJobs.find((job) => job.status === "failed");
    const source = safeSourceLabel(failed?.source_name, "An import");
    const error = failed?.error_message ? ` Error: ${safeSnippet(failed.error_message, 90)}` : "";
    actions.push({
      id: "review-failed-import",
      kind: "import_issue",
      label: "Review failed import",
      detail: `${source} failed before Station could preserve it cleanly.${error}`,
      href: failed?.persona_id ? `/studio/personas/${failed.persona_id}/files` : "/studio/archive",
      priority: "critical",
      count: input.failedImports,
      status: "failed",
    });
  }
  if (input.pendingImports > 0) {
    const active = input.importJobs.find((job) => job.status === "queued" || job.status === "processing");
    actions.push({
      id: "check-import-progress",
      kind: "import_progress",
      label: "Check import progress",
      detail: `${input.pendingImports} import job${input.pendingImports === 1 ? "" : "s"} still need completion before review is reliable.`,
      href: active?.persona_id ? `/studio/personas/${active.persona_id}/files` : "/studio/archive",
      priority: "high",
      count: input.pendingImports,
      status: "processing",
    });
  }
  if (firstPersonaId && !input.integritySessions.some((session) => session.status === "completed" || session.completed_at)) {
    actions.push({
      id: "run-integrity",
      kind: "integrity",
      label: "Run Integrity Session",
      detail: "Capture boundaries and continuity anchors before relying on imported memory.",
      href: `/studio/personas/${firstPersonaId}/calibration`,
      priority: "high",
      status: "missing",
    });
  }
  if (input.draftDocuments > 0) {
    actions.push({
      id: "review-drafts",
      kind: "publishing",
      label: "Review publishing drafts",
      detail: "Use approval publish, public document readback, linked discussion readback, and retract-to-private; retract hides, it does not delete artifacts.",
      href: "/studio/publishing",
      priority: "high",
      count: input.draftDocuments,
      status: "draft",
    });
  }
  if (!input.exportPackages.some((pkg) => pkg.status === "completed")) {
    actions.push({
      id: "export-backup",
      kind: "export",
      label: "Create export backup",
      detail: "Create a portable owner archive so preservation is not only inside Station.",
      href: "/studio/export",
      priority: "high",
      status: "missing",
    });
  }
  if (input.memoryItems.length > 0 || input.importJobs.some((job) => job.status === "completed")) {
    actions.push({
      id: "search-private-archive",
      kind: "archive_search",
      label: "Search private archive",
      detail: "Search owner-private archive material without exposing raw source bodies or transcripts.",
      href: "/studio/archive",
      priority: "normal",
      count: input.memoryItems.length,
    });
  }
  if (input.importJobs.some((job) => job.status === "failed" && /quota|storage|limit/i.test(`${job.source_name ?? ""} ${job.error_message ?? ""}`))) {
    actions.push({
      id: "review-quota-config",
      kind: "quota_config",
      label: "Check storage and quota settings",
      detail: "A failed import looks quota-related; review storage and account settings before retrying.",
      href: "/settings",
      priority: "high",
      status: "attention",
    });
  }
  if (actions.length === 0) {
    actions.push({
      id: "open-archive",
      kind: "archive_search",
      label: "Open private archive",
      detail: "Archive, search, and review private source material before publishing.",
      href: "/studio/archive",
      priority: "normal",
    });
  }
  return actions.slice(0, 5);
}

export type StationAssistantSummary = {
  counts: Record<string, number>;
  recent?: {
    personas?: Array<{ id: string; name: string; visibility?: string }>;
    imports?: Array<{ id: string; sourceName: string; status: string; updatedAt?: string | null }>;
    documents?: Array<{ id: string; title: string; status: string; documentType?: string }>;
  };
  nextActions?: AssistantActionCard[];
};

export type StationAssistantIntent = "archive" | "publish" | "integrity" | "export" | "general";

export function composeStationAssistantReply(message: string, summary: StationAssistantSummary) {
  const intent = classifyAssistantIntent(message);
  const baseActions = summary.nextActions ?? [];
  const actions = actionsForIntent(intent, baseActions);
  const guardrail = "Station Assistant is operational only: no persona canon, no roleplay, no autonomous execution, no private-to-public move without owner review, and no cleanup/delete claims for retract.";

  return {
    role: "assistant" as const,
    intent,
    content: contentForIntent(intent, summary),
    actions,
    guardrail,
  };
}

function classifyAssistantIntent(message: string): StationAssistantIntent {
  const value = message.toLowerCase();
  if (/archive|import|upload|chatgpt|claude|reddit|file/.test(value)) return "archive";
  if (/publish|document|codex|essay|field log|research/.test(value)) return "publish";
  if (/integrity|canon|memory|continuity/.test(value)) return "integrity";
  if (/export|backup|download/.test(value)) return "export";
  return "general";
}

function contentForIntent(intent: StationAssistantIntent, summary: StationAssistantSummary) {
  const failedImports = summary.counts.failedImports ?? 0;
  const draftDocuments = summary.counts.draftDocuments ?? 0;
  switch (intent) {
    case "archive":
      return failedImports > 0
        ? "Archive next step: review failed imports first, then retry or replace the source before trusting memory extraction."
        : "Archive next step: add source material, preserve it privately, then review Memory/Canon candidates before promotion.";
    case "publish":
      return draftDocuments > 0
        ? "Publishing next step: open the approval queue, review visibility and provenance, publish only after owner review, confirm public document and linked discussion readback, then retract to private if needed. Retract hides public reads; it does not delete artifacts."
        : "Publishing next step: create a private draft from selected archive or canon material, keep provenance visible, use owner approval before public readback, and treat retract-to-private as hiding rather than cleanup.";
    case "integrity":
      return "Continuity next step: run or review an Integrity Session, then accept/edit/reject Memory and Canon candidates rather than writing directly to Canon.";
    case "export":
      return "Export next step: generate a portable archive package and verify that personas, canon, memory, transcripts, documents, and source metadata are included.";
    default:
      return "Next step: use Station Assistant for archive, publishing, export, onboarding, and continuity operations. It is not a persona and does not carry its own Canon.";
  }
}

function actionsForIntent(intent: StationAssistantIntent, fallback: AssistantActionCard[]) {
  const wanted: Record<StationAssistantIntent, AssistantActionKind[]> = {
    archive: ["import_review", "import_issue", "import_progress", "archive_search"],
    publish: ["publishing"],
    integrity: ["integrity", "import_review"],
    export: ["export"],
    general: [],
  };
  const selected = wanted[intent].length
    ? fallback.filter((action) => wanted[intent].includes(action.kind))
    : fallback;
  const defaultAction: AssistantActionCard = {
    id: `open-${intent}`,
    kind: intent === "publish" ? "publishing" : intent === "integrity" ? "integrity" : intent === "export" ? "export" : "archive_search",
    label: intent === "publish" ? "Open publishing" : intent === "integrity" ? "Review continuity" : intent === "export" ? "Open export" : "Open private archive",
    detail: "Open the relevant Studio workspace; Assistant will not make changes without an explicit owner action.",
    href: intent === "publish" ? "/studio/publishing" : intent === "integrity" ? "/studio" : intent === "export" ? "/studio/export" : "/studio/archive",
    priority: "normal",
  };

  return [...selected, defaultAction, ...fallback].filter(uniqueAction).slice(0, 3);
}

function uniqueAction(action: AssistantActionCard, index: number, actions: AssistantActionCard[]) {
  return actions.findIndex((item) => item.id === action.id || item.href === action.href) === index;
}
