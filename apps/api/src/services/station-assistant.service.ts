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

type AssistantAction = {
  id: string;
  label: string;
  detail: string;
  href: string;
  priority: "critical" | "high" | "normal";
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
        name: row.name,
        visibility: row.visibility ?? "private",
        href: `/studio/personas/${row.id}`,
        updatedAt: row.updated_at ?? row.created_at ?? null,
      })),
      imports: importJobs.slice(0, 6).map((row) => ({
        id: row.id,
        status: row.status ?? "queued",
        sourceName: row.source_name ?? "Untitled import",
        kind: row.kind ?? "import",
        errorMessage: row.error_message ?? null,
        href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
        updatedAt: row.updated_at ?? row.created_at ?? null,
      })),
      documents: documents.slice(0, 6).map((row) => ({
        id: row.id,
        title: row.title,
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
    actions.push({
      id: "review-failed-import",
      label: "Review failed import",
      detail: failed?.source_name ? `${failed.source_name} failed before Station could preserve it cleanly.` : "One import failed before archive processing completed.",
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
      detail: "Check visibility, provenance, and discussion settings before anything enters Discover.",
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
    readRows<any>(
      sb.from("continuity_candidates").select("id, status, created_at").eq("owner_user_id", ownerUserId).order("created_at", { ascending: false }).limit(100)
    ),
    readRows<DocumentRow>(
      sb.from("documents").select("id, title, status, visibility, document_type, updated_at, published_at, created_at").eq("author_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
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
    readRows<any>(
      sb.from("export_packages").select("id, status, created_at, updated_at").eq("owner_user_id", ownerUserId).order("updated_at", { ascending: false }).limit(100)
    ),
  ]);

  const pendingImports = importJobs.filter((job) => job.status === "queued" || job.status === "processing").length;
  const failedImports = importJobs.filter((job) => job.status === "failed").length;
  const draftDocuments = documents.filter((document) => document.status === "draft").length;
  const publishedDocuments = documents.filter((document) => document.status === "published").length;

  const nextActions = buildAssistantSummaryActions({
    personas,
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
        name: persona.name,
        visibility: persona.visibility ?? "private",
      })),
      imports: importJobs.slice(0, 6).map((job) => ({
        id: job.id,
        sourceName: job.source_name ?? "Untitled import",
        status: job.status ?? "queued",
        updatedAt: job.updated_at ?? job.created_at ?? null,
      })),
      documents: documents.slice(0, 6).map((document) => ({
        id: document.id,
        title: document.title,
        status: document.status ?? "draft",
        documentType: document.document_type ?? "essay",
      })),
    },
    nextActions,
  };
}

function buildAssistantSummaryActions(input: {
  personas: PersonaRow[];
  pendingImports: number;
  failedImports: number;
  draftDocuments: number;
  pendingCandidates: number;
  exportPackages: any[];
}) {
  const actions: Array<{ label: string; href: string; kind: "primary" | "secondary" | "caution" }> = [];
  if (input.personas.length === 0) {
    actions.push({ label: "Create the first persona", href: "/studio/new", kind: "primary" });
  }
  if (input.failedImports > 0) {
    actions.push({ label: "Fix failed imports", href: "/studio/archive", kind: "caution" });
  }
  if (input.pendingImports > 0) {
    actions.push({ label: "Check import progress", href: "/studio/archive", kind: "secondary" });
  }
  if (input.pendingCandidates > 0) {
    actions.push({ label: "Review Memory/Canon candidates", href: "/studio", kind: "primary" });
  }
  if (input.draftDocuments > 0) {
    actions.push({ label: "Review publishing drafts", href: "/studio/publish", kind: "primary" });
  }
  if (input.exportPackages.length === 0) {
    actions.push({ label: "Create an export backup", href: "/studio/export", kind: "secondary" });
  }
  if (actions.length === 0) {
    actions.push({ label: "Open global archive", href: "/studio/archive", kind: "primary" });
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
  nextActions?: Array<{ label: string; href: string; kind?: string }>;
};

export type StationAssistantIntent = "archive" | "publish" | "integrity" | "export" | "general";

export function composeStationAssistantReply(message: string, summary: StationAssistantSummary) {
  const intent = classifyAssistantIntent(message);
  const baseActions = summary.nextActions ?? [];
  const actions = actionsForIntent(intent, baseActions);
  const guardrail = "Station Assistant is operational only: no persona canon, no roleplay, no private-to-public move without owner review.";

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
        ? "Publishing next step: review draft visibility, provenance, and human review before anything becomes public."
        : "Publishing next step: create a private draft from selected archive or canon material, keep provenance visible, and require human review before publication.";
    case "integrity":
      return "Continuity next step: run or review an Integrity Session, then accept/edit/reject Memory and Canon candidates rather than writing directly to Canon.";
    case "export":
      return "Export next step: generate a portable archive package and verify that personas, canon, memory, transcripts, documents, and source metadata are included.";
    default:
      return "Next step: use Station Assistant for archive, publishing, export, onboarding, and continuity operations. It is not a persona and does not carry its own Canon.";
  }
}

function actionsForIntent(intent: StationAssistantIntent, fallback: Array<{ label: string; href: string; kind?: string }>) {
  const primary = {
    archive: { label: "Open archive", href: "/studio/archive", kind: "primary" },
    publish: { label: "Open publishing", href: "/studio/publish", kind: "primary" },
    integrity: { label: "Review continuity", href: "/studio", kind: "primary" },
    export: { label: "Open export", href: "/studio/export", kind: "primary" },
    general: fallback[0] ?? { label: "Open Studio", href: "/studio", kind: "primary" },
  }[intent];

  return [primary, ...fallback.filter((action) => action.href !== primary.href)].slice(0, 3);
}
