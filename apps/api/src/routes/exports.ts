import { Router } from "express";
import { createHash } from "node:crypto";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import {
  assertDeveloperSpaceUsageAvailable,
  getDeveloperSpaceUsage,
  recordDeveloperSpaceUsage,
  zeroDeveloperSpaceUsage,
} from "../services/developer-space-usage.service";
import {
  assertNoInProgressExportPackage,
  quotaErrorResponse,
} from "../services/operational-quota.service";
import {
  serializeDeveloperSpace,
  serializeDeveloperSpaceEvent,
  serializeDeveloperSpaceLinkedDocument,
  serializeDeveloperSpaceNode,
  serializeDeveloperSpaceSnapshot,
} from "../services/developer-space.service";

export const exportsRouter = Router();
exportsRouter.use(requireAuth);

const INCLUDED_SECTIONS = [
  "persona",
  "memory",
  "canon",
  "archive",
  "archived_chats",
  "continuity_candidates",
  "continuity_records",
  "integrity",
  "published_documents",
  "discussion_refs",
  "moderation_reports",
];

const DEVELOPER_SPACE_INCLUDED_SECTIONS = [
  "space",
  "nodes",
  "events",
  "snapshots",
  "linked_public_documents",
  "usage",
];

const PROJECT_INCLUDED_SECTIONS = [
  "project",
  "attached_developer_spaces",
  "owner_project_evidence_refs",
  "public_project_evidence_refs",
  "trust",
];

function exportRow(row: any) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    developerSpaceId: row.developer_space_id ?? null,
    projectId: row.project_id ?? null,
    packageKind: row.package_kind,
    status: row.status,
    format: row.format,
    includedSections: row.included_sections ?? [],
    contentSummary: row.content_summary ?? {},
    errorMessage: row.error_message ?? null,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadOwnedPersona(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("personas")
    .select("*")
    .eq("id", personaId)
    .single();

  return data?.owner_user_id === ownerUserId ? data : null;
}

async function loadOwnedDeveloperSpace(spaceId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", spaceId)
    .single();

  return data?.owner_user_id === ownerUserId ? data : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function loadOwnedProject(projectIdOrSlug: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("projects")
    .select("*")
    .eq("owner_user_id", ownerUserId);

  query = isUuid(projectIdOrSlug)
    ? query.eq("id", projectIdOrSlug)
    : query.eq("slug", projectIdOrSlug);

  const { data } = await query.single();
  return data?.owner_user_id === ownerUserId ? data : null;
}

function compactRows<T extends Record<string, unknown>>(rows: T[], mapper: (row: T) => Record<string, unknown>) {
  return rows.map(mapper);
}

function discussionCommentVisible(comment: any, ownerUserId: string) {
  if (comment.author_user_id === ownerUserId) return true;
  return comment.status === "active" && comment.is_hidden !== true;
}

async function loadThreadDiscussion(threadId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data: thread, error: threadError } = await sb
    .from("threads")
    .select("id, title, status, visibility, linked_document_id, is_pinned, is_hidden, reported_count, comment_count, created_at, updated_at")
    .eq("id", threadId)
    .single();

  throwIfQueryError({ error: threadError }, "discussion thread export source", { allowMissingSingle: true });
  if (!thread) return null;

  const { data: comments, error: commentsError } = await sb
    .from("comments")
    .select("id, author_user_id, parent_type, parent_id, body, status, is_pinned, is_hidden, reported_count, score, created_at, updated_at")
    .eq("parent_type", "thread")
    .eq("parent_id", thread.id)
    .order("created_at", { ascending: true });

  throwIfQueryError({ error: commentsError }, "discussion comments export source");

  return {
    id: thread.id,
    title: thread.title,
    status: thread.status,
    visibility: thread.visibility,
    linkedDocumentId: thread.linked_document_id,
    moderation: {
      pinned: thread.is_pinned,
      hidden: thread.is_hidden,
      reportedCount: thread.reported_count,
    },
    commentCount: thread.comment_count,
    comments: (comments ?? [])
      .filter((comment: any) => discussionCommentVisible(comment, ownerUserId))
      .map((comment: any) => ({
        id: comment.id,
        authorUserId: comment.author_user_id,
        body: comment.body,
        status: comment.status,
        moderation: {
          pinned: comment.is_pinned,
          hidden: comment.is_hidden,
          reportedCount: comment.reported_count,
        },
        score: comment.score,
        ownerAuthored: comment.author_user_id === ownerUserId,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      })),
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
  };
}

function countBy<T extends Record<string, any>>(rows: T[], key: keyof T) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const value = String(row[key] ?? "unknown");
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function isMissingSingleRow(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message ?? "";
  return error?.code === "PGRST116" || message.includes("Expected one");
}

function throwIfQueryError(
  result: { error?: { code?: string; message?: string } | null },
  label: string,
  options: { allowMissingSingle?: boolean } = {}
) {
  if (!result.error) return;
  if (options.allowMissingSingle && isMissingSingleRow(result.error)) return;
  throw new Error(`${label}: ${result.error.message ?? "query failed"}`);
}

function exportedTargetIds(publishedDocuments: Array<Record<string, any>>) {
  const ids = new Set<string>();
  for (const document of publishedDocuments) {
    ids.add(`document:${document.id}`);
    if (document.discussion?.id) ids.add(`thread:${document.discussion.id}`);
    for (const comment of document.discussion?.comments ?? []) {
      ids.add(`comment:${comment.id}`);
    }
  }
  return ids;
}

const ACTIVE_MODERATION_REPORT_STATUSES = new Set(["open", "reviewing"]);

function moderationReportRefKey(report: Record<string, any>) {
  return `${report.targetType}:${report.targetId}:${report.reason}`;
}

function shouldReplaceModerationReportRef(current: Record<string, any>, next: Record<string, any>) {
  const currentActive = ACTIVE_MODERATION_REPORT_STATUSES.has(current.status);
  const nextActive = ACTIVE_MODERATION_REPORT_STATUSES.has(next.status);
  if (currentActive !== nextActive) return nextActive;

  const currentCreated = Date.parse(current.createdAt ?? "");
  const nextCreated = Date.parse(next.createdAt ?? "");
  if (Number.isNaN(currentCreated)) return true;
  if (Number.isNaN(nextCreated)) return false;
  return nextCreated > currentCreated;
}

function dedupeModerationReportRefs(reports: Array<Record<string, any>>) {
  const byTargetReason = new Map<string, Record<string, any>>();

  for (const report of reports) {
    const key = moderationReportRefKey(report);
    const current = byTargetReason.get(key);
    if (!current || shouldReplaceModerationReportRef(current, report)) {
      byTargetReason.set(key, report);
    }
  }

  return [...byTargetReason.values()].sort((a, b) => {
    const aCreated = Date.parse(a.createdAt ?? "");
    const bCreated = Date.parse(b.createdAt ?? "");
    if (Number.isNaN(aCreated) || Number.isNaN(bCreated)) return 0;
    return bCreated - aCreated;
  });
}

async function loadOwnerDocumentVersionRefs(ownerUserId: string, documentIds: string[]) {
  if (documentIds.length === 0) return new Map<string, Array<Record<string, any>>>();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("document_versions")
    .select("id, document_id, version_number, title, slug, summary, document_type, status, visibility, provenance_type, source_type, source_id, source_label, source_persona_id, captured_at, created_at")
    .eq("owner_user_id", ownerUserId)
    .in("document_id", documentIds)
    .order("version_number", { ascending: false });

  throwIfQueryError({ error }, "document version export source");

  const byDocument = new Map<string, Array<Record<string, any>>>();
  for (const row of data ?? []) {
    const versions = byDocument.get(row.document_id) ?? [];
    versions.push({
      id: row.id,
      versionNumber: row.version_number,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      documentType: row.document_type,
      status: row.status,
      visibility: row.visibility,
      provenanceType: row.provenance_type,
      sourceType: row.source_type,
      sourceId: row.source_id,
      sourceLabel: row.source_label,
      sourcePersonaId: row.source_persona_id,
      capturedAt: row.captured_at,
      createdAt: row.created_at,
    });
    byDocument.set(row.document_id, versions);
  }
  return byDocument;
}

async function loadOwnerModerationReportRefs(ownerUserId: string, publishedDocuments: Array<Record<string, any>>) {
  const sb = getSupabaseAdmin();
  const targetIds = exportedTargetIds(publishedDocuments);
  if (targetIds.size === 0) return [];

  const { data, error } = await sb
    .from("moderation_reports")
    .select("id, reporter_id, target_type, target_id, reason, notes, status, reviewed_by, reviewed_at, created_at, updated_at")
    .eq("reporter_id", ownerUserId)
    .order("created_at", { ascending: false });

  throwIfQueryError({ error }, "moderation report export source");

  const reportRefs = (data ?? [])
    .filter((report: any) => targetIds.has(`${report.target_type}:${report.target_id}`))
    .map((report: any) => ({
      id: report.id,
      targetType: report.target_type,
      targetId: report.target_id,
      reason: report.reason,
      notes: report.notes,
      status: report.status,
      reviewedBy: report.reviewed_by,
      reviewedAt: report.reviewed_at,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    }));

  return dedupeModerationReportRefs(reportRefs);
}

async function buildPersonaExportManifest(persona: any, packageId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();

  const [
    memoryRes,
    canonRes,
    fileRes,
    importRes,
    chatTranscriptRes,
    candidateRes,
    continuityRecordRes,
    integrityRes,
    personaDocsRes,
    sourceDocsRes,
  ] = await Promise.all([
    sb
      .from("memory_items")
      .select("id, title, content, summary, source_type, relevance_weight, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("canon_items")
      .select("id, title, content, source_type, priority, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("priority", { ascending: false }),
    sb
      .from("persona_files")
      .select("id, file_name, file_type, file_size, storage_path, source_type, processed, created_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("import_jobs")
      .select("id, kind, status, source_name, error_message, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("archived_chat_transcripts")
      .select("id, conversation_id, title, source_summary, message_count, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("continuity_candidates")
      .select("id, archived_chat_transcript_id, candidate_type, title, content, rationale, status, source_message_ids, accepted_target_type, accepted_target_id, accepted_at, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("continuity_records")
      .select("id, record_type, title, body, summary, source_table, source_id, source_label, source_version, visibility, version, metadata, occurred_at, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("calibration_sessions")
      .select("id, session_title, transcript, extracted_style_notes, extracted_public_rules, extracted_private_rules, extracted_uncertainty_rules, save_target, created_at, updated_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false }),
    sb
      .from("documents")
      .select("id, title, slug, document_type, status, visibility, version, published_at, provenance_type, source_type, source_id, source_label, source_persona_id, discussion_thread_id, created_at, updated_at")
      .eq("author_user_id", ownerUserId)
      .eq("persona_id", persona.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    sb
      .from("documents")
      .select("id, title, slug, document_type, status, visibility, version, published_at, provenance_type, source_type, source_id, source_label, source_persona_id, discussion_thread_id, created_at, updated_at")
      .eq("author_user_id", ownerUserId)
      .eq("source_persona_id", persona.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
  ]);

  throwIfQueryError(memoryRes, "memory export source");
  throwIfQueryError(canonRes, "canon export source");
  throwIfQueryError(fileRes, "archive file export source");
  throwIfQueryError(importRes, "archive import export source");
  throwIfQueryError(chatTranscriptRes, "archived chat export source");
  throwIfQueryError(candidateRes, "continuity candidate export source");
  throwIfQueryError(continuityRecordRes, "continuity record export source");
  throwIfQueryError(integrityRes, "integrity export source");
  throwIfQueryError(personaDocsRes, "persona document export source");
  throwIfQueryError(sourceDocsRes, "source document export source");

  const documentsById = new Map<string, any>();
  for (const document of [...(personaDocsRes.data ?? []), ...(sourceDocsRes.data ?? [])]) {
    documentsById.set(document.id, document);
  }
  const documentVersionRefs = await loadOwnerDocumentVersionRefs(ownerUserId, [...documentsById.keys()]);

  const publishedDocuments = await Promise.all([...documentsById.values()].map(async (document) => {
    const discussion = document.discussion_thread_id
      ? await loadThreadDiscussion(document.discussion_thread_id, ownerUserId)
      : null;

    return {
      id: document.id,
      title: document.title,
      slug: document.slug,
      documentType: document.document_type,
      status: document.status,
      visibility: document.visibility,
      version: document.version ?? 1,
      publishedAt: document.published_at,
      provenanceType: document.provenance_type,
      sourceType: document.source_type,
      sourceId: document.source_id,
      sourceLabel: document.source_label,
      sourcePersonaId: document.source_persona_id,
      versions: documentVersionRefs.get(document.id) ?? [],
      discussion,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    };
  }));
  const moderationReportRefs = await loadOwnerModerationReportRefs(ownerUserId, publishedDocuments);

  const memory = compactRows(memoryRes.data ?? [], (row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    summary: row.summary,
    sourceType: row.source_type,
    relevanceWeight: row.relevance_weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const canon = compactRows(canonRes.data ?? [], (row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    sourceType: row.source_type,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const files = compactRows(fileRes.data ?? [], (row: any) => ({
    id: row.id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    sourceType: row.source_type,
    processed: row.processed,
    createdAt: row.created_at,
  }));

  const imports = compactRows(importRes.data ?? [], (row: any) => ({
    id: row.id,
    kind: row.kind,
    status: row.status,
    sourceName: row.source_name,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const chatTranscripts = compactRows(chatTranscriptRes.data ?? [], (row: any) => ({
    id: row.id,
    conversationId: row.conversation_id,
    title: row.title,
    sourceSummary: row.source_summary,
    messageCount: row.message_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const continuityCandidates = compactRows(candidateRes.data ?? [], (row: any) => ({
    id: row.id,
    archivedChatTranscriptId: row.archived_chat_transcript_id,
    candidateType: row.candidate_type,
    title: row.title,
    content: row.content,
    rationale: row.rationale,
    status: row.status,
    sourceMessageIds: row.source_message_ids ?? [],
    acceptedTargetType: row.accepted_target_type,
    acceptedTargetId: row.accepted_target_id,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const continuityRecords = compactRows(continuityRecordRes.data ?? [], (row: any) => ({
    id: row.id,
    recordType: row.record_type,
    title: row.title,
    body: row.body,
    summary: row.summary,
    source: row.source_table
      ? {
        table: row.source_table,
        id: row.source_id,
        label: row.source_label,
        version: row.source_version ?? 1,
      }
      : null,
    visibility: row.visibility,
    version: row.version,
    metadata: row.metadata ?? {},
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const integritySessions = compactRows(integrityRes.data ?? [], (row: any) => ({
    id: row.id,
    sessionTitle: row.session_title,
    transcript: row.transcript,
    extractedStyleNotes: row.extracted_style_notes,
    extractedPublicRules: row.extracted_public_rules,
    extractedPrivateRules: row.extracted_private_rules,
    extractedUncertaintyRules: row.extracted_uncertainty_rules,
    saveTarget: row.save_target,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const counts = {
    memory: memory.length,
    canon: canon.length,
    archiveFiles: files.length,
    archiveImports: imports.length,
    archivedChats: chatTranscripts.length,
    continuityCandidates: continuityCandidates.length,
    continuityRecords: continuityRecords.length,
    integritySessions: integritySessions.length,
    publishedDocuments: publishedDocuments.length,
    documentVersions: publishedDocuments.reduce((sum, document: any) => sum + (document.versions?.length ?? 0), 0),
    discussionComments: publishedDocuments.reduce((sum, document: any) => sum + (document.discussion?.comments?.length ?? 0), 0),
    moderationReports: moderationReportRefs.length,
  };

  const generatedAt = new Date().toISOString();
  return {
    schema: "station.persona.export.v1" as const,
    generatedAt,
    package: {
      id: packageId,
      status: "completed",
      format: "json_markdown",
    },
    privacy: {
      ownerOnly: true,
      note: "This package is generated for the persona owner. Public copies are references; private continuity source rows remain private to the owner.",
    },
    persona: {
      id: persona.id,
      name: persona.name,
      shortDescription: persona.short_description,
      longDescription: persona.long_description,
      visibility: persona.visibility,
      provider: persona.provider,
      awakeningPrompt: persona.awakening_prompt,
      styleNotes: persona.style_notes,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at,
    },
    counts,
    continuity: {
      memory,
      canon,
      archive: {
        files,
        imports,
        chatTranscripts,
      },
      continuityCandidates,
      continuityRecords,
      integritySessions,
    },
    publishedDocumentRefs: publishedDocuments,
    moderationReportRefs,
    publicationState: {
      documentVisibility: countBy(publishedDocuments, "visibility"),
      moderationReportStatus: countBy(moderationReportRefs, "status"),
    },
    trust: {
      provenancePreserved: true,
      publicationStatesPreserved: true,
      documentVersionHistoryPreserved: true,
      continuityRecordVisibilityPreserved: true,
      ownerReportsOnly: true,
      publicCopiesAreSeparateDocuments: true,
      sourceRowsRemainPrivate: true,
      discussionPolicy: "Visible discussion comments are included. Removed or hidden comments are included only when authored by the export owner.",
      moderationReportPolicy: "Only reports filed by the export owner against exported document, thread, or visible comment references are included.",
    },
  };
}

function markdownList(items: Array<Record<string, any>>, titleKey = "title") {
  if (items.length === 0) return "- None";
  return items.map((item) => {
    const title = item[titleKey] ?? item.fileName ?? item.sourceName ?? item.sessionTitle ?? item.id;
    return `- ${title} (${item.id})`;
  }).join("\n");
}

function buildManifestMarkdown(manifest: any) {
  const persona = manifest.persona;
  return [
    `# Station Export: ${persona.name}`,
    "",
    `Generated: ${manifest.generatedAt}`,
    `Package: ${manifest.package.id}`,
    "",
    "## Trust Notes",
    `- Owner-only package: ${manifest.privacy.ownerOnly ? "yes" : "no"}`,
    `- Provenance preserved: ${manifest.trust.provenancePreserved ? "yes" : "no"}`,
    `- Public copies remain separate documents: ${manifest.trust.publicCopiesAreSeparateDocuments ? "yes" : "no"}`,
    `- Discussion policy: ${manifest.trust.discussionPolicy}`,
    "",
    "## Persona",
    `- Name: ${persona.name}`,
    `- Visibility: ${persona.visibility}`,
    `- Provider: ${persona.provider}`,
    persona.shortDescription ? `- Summary: ${persona.shortDescription}` : "- Summary: none",
    "",
    "## Counts",
    ...Object.entries(manifest.counts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Canon",
    markdownList(manifest.continuity.canon),
    "",
    "## Memory",
    markdownList(manifest.continuity.memory),
    "",
    "## Archive Files",
    markdownList(manifest.continuity.archive.files),
    "",
    "## Archive Imports",
    markdownList(manifest.continuity.archive.imports, "sourceName"),
    "",
    "## Archived Chat Transcripts",
    markdownList(manifest.continuity.archive.chatTranscripts),
    "",
    "## Continuity Candidates",
    markdownList(manifest.continuity.continuityCandidates),
    "",
    "## Continuity Timeline Records",
    markdownList(manifest.continuity.continuityRecords),
    "",
    "## Integrity Sessions",
    markdownList(manifest.continuity.integritySessions, "sessionTitle"),
    "",
    "## Published Document References",
    manifest.publishedDocumentRefs.length === 0
      ? "- None"
      : manifest.publishedDocumentRefs.map((document: any) =>
        `- ${document.title} (${document.visibility}, ${document.provenanceType})`
      ).join("\n"),
    "",
    "## Document Version History",
    manifest.publishedDocumentRefs.length === 0
      ? "- None"
      : manifest.publishedDocumentRefs.map((document: any) => {
        const versions = document.versions ?? [];
        return `- ${document.title}: current v${document.version ?? 1}, prior versions ${versions.length}`;
      }).join("\n"),
    "",
    "## Publication States",
    ...Object.entries(manifest.publicationState?.documentVisibility ?? {}).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Moderation Report References",
    manifest.moderationReportRefs.length === 0
      ? "- None"
      : manifest.moderationReportRefs.map((report: any) =>
        `- ${report.reason} (${report.targetType}:${report.targetId}, ${report.status})`
      ).join("\n"),
    "",
  ].join("\n");
}

async function loadLinkedPublicDocumentRefs(developerSpaceId: string) {
  const sb = getSupabaseAdmin();
  const { data: links, error } = await sb
    .from("developer_space_documents")
    .select("*")
    .eq("developer_space_id", developerSpaceId)
    .eq("link_visibility", "public")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const refs = [];
  for (const link of links ?? []) {
    const { data: document, error: documentError } = await sb
      .from("documents")
      .select("id, author_user_id, title, slug, body, document_type, status, visibility, published_at, created_at, updated_at")
      .eq("id", link.document_id)
      .single();

    throwIfQueryError({ error: documentError }, "linked public document export source", { allowMissingSingle: true });
    if (!document || document.status !== "published" || document.visibility !== "public") continue;
    refs.push(serializeDeveloperSpaceLinkedDocument(link, document));
  }

  return refs;
}

async function buildDeveloperSpaceExportManifest(space: any, packageId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const [nodesRes, eventsRes, snapshotsRes, linkedPublicDocumentRefs, usage] = await Promise.all([
    sb
      .from("developer_space_nodes")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("last_event_at", { ascending: false }),
    sb
      .from("developer_space_events")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("occurred_at", { ascending: false }),
    sb
      .from("developer_space_snapshots")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("occurred_at", { ascending: false }),
    loadLinkedPublicDocumentRefs(space.id),
    getDeveloperSpaceUsage(space).catch(() => zeroDeveloperSpaceUsage(space)),
  ]);

  if (nodesRes.error) throw new Error(nodesRes.error.message);
  if (eventsRes.error) throw new Error(eventsRes.error.message);
  if (snapshotsRes.error) throw new Error(snapshotsRes.error.message);

  const nodes = (nodesRes.data ?? []).map((node: any) =>
    serializeDeveloperSpaceNode(node, { includeRawData: true })
  );
  const events = (eventsRes.data ?? []).map((event: any) =>
    serializeDeveloperSpaceEvent(event, { includeRawData: true })
  );
  const snapshots = (snapshotsRes.data ?? []).map((snapshot: any) =>
    serializeDeveloperSpaceSnapshot(snapshot, { includeRawData: true })
  );

  const generatedAt = new Date().toISOString();
  return {
    schema: "station.developer_space.export.v1" as const,
    generatedAt,
    package: {
      id: packageId,
      status: "completed",
      format: "json_markdown",
    },
    privacy: {
      ownerOnly: true,
      note: "This package is generated for the Developer Space owner. Ingestion keys and key hashes are excluded.",
    },
    space: serializeDeveloperSpace(space, { includeOperationalFields: false }),
    counts: {
      nodes: nodes.length,
      events: events.length,
      snapshots: snapshots.length,
      linkedPublicDocuments: linkedPublicDocumentRefs.length,
    },
    usage,
    nodes,
    events,
    snapshots,
    linkedPublicDocumentRefs,
    trust: {
      apiKeysExcluded: true,
      ownerOnlyPackage: true,
      rawIngestionDataIncluded: true,
      linkedDocumentsPublicSafeOnly: true,
      privateLinkedDraftsExcluded: true,
      quotaLimitsIncluded: true,
      ownerUserId,
    },
  };
}

function buildDeveloperSpaceManifestMarkdown(manifest: any) {
  return [
    `# Station Developer Space Export: ${manifest.space.projectName}`,
    "",
    `Generated: ${manifest.generatedAt}`,
    `Package: ${manifest.package.id}`,
    "",
    "## Trust Notes",
    `- Owner-only package: ${manifest.privacy.ownerOnly ? "yes" : "no"}`,
    `- API keys excluded: ${manifest.trust.apiKeysExcluded ? "yes" : "no"}`,
    `- Linked documents public-safe only: ${manifest.trust.linkedDocumentsPublicSafeOnly ? "yes" : "no"}`,
    "",
    "## Space",
    `- Project: ${manifest.space.projectName}`,
    `- Visibility: ${manifest.space.visibility}`,
    `- Visualisation: ${manifest.space.visualisationType}`,
    "",
    "## Counts",
    ...Object.entries(manifest.counts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Usage",
    ...Object.entries(manifest.usage.counters ?? {}).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Nodes",
    markdownList(manifest.nodes, "nodeName"),
    "",
    "## Events",
    markdownList(manifest.events, "eventLabel"),
    "",
    "## Snapshots",
    manifest.snapshots.length === 0
      ? "- None"
      : manifest.snapshots.map((snapshot: any) => `- ${snapshot.id} (${snapshot.occurredAt})`).join("\n"),
    "",
    "## Linked Public Documents",
    manifest.linkedPublicDocumentRefs.length === 0
      ? "- None"
      : manifest.linkedPublicDocumentRefs.map((link: any) =>
        `- ${link.document.title} (${link.role}, ${link.document.visibility})`
      ).join("\n"),
    "",
  ].join("\n");
}

async function loadProjectExportSources(project: any, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data: developerSpaces, error: spacesError } = await sb
    .from("developer_spaces")
    .select("id, owner_user_id, project_id, project_name, slug, description, visibility, visualisation_type, updated_at")
    .eq("project_id", project.id)
    .eq("owner_user_id", ownerUserId)
    .order("updated_at", { ascending: false });

  throwIfQueryError({ error: spacesError }, "Project Developer Space export source");

  const attachedDeveloperSpaces = developerSpaces ?? [];
  const spaceIds = attachedDeveloperSpaces.map((space: any) => space.id);
  if (spaceIds.length === 0) {
    return {
      attachedDeveloperSpaces,
      links: [],
      documentsById: new Map<string, any>(),
    };
  }

  const { data: links, error: linksError } = await sb
    .from("developer_space_documents")
    .select("developer_space_id, document_id, document_role, link_visibility, sort_order, created_at, updated_at")
    .eq("owner_user_id", ownerUserId)
    .in("developer_space_id", spaceIds)
    .order("updated_at", { ascending: false });

  throwIfQueryError({ error: linksError }, "Project evidence link export source");

  const documentIds = [...new Set((links ?? []).map((link: any) => link.document_id))];
  if (documentIds.length === 0) {
    return {
      attachedDeveloperSpaces,
      links: links ?? [],
      documentsById: new Map<string, any>(),
    };
  }

  const { data: documents, error: documentsError } = await sb
    .from("documents")
    .select("id, author_user_id, title, slug, document_type, status, visibility, published_at, provenance_type, source_label, created_at, updated_at")
    .eq("author_user_id", ownerUserId)
    .in("id", documentIds);

  throwIfQueryError({ error: documentsError }, "Project evidence document export source");

  return {
    attachedDeveloperSpaces,
    links: links ?? [],
    documentsById: new Map((documents ?? []).map((document: any) => [document.id, document])),
  };
}

function projectEvidenceSortTime(document: any, link: any) {
  return Date.parse(document?.published_at ?? document?.updated_at ?? link?.updated_at ?? link?.created_at ?? "");
}

function serializeProjectSpaceRef(space: any) {
  return {
    projectName: space.project_name,
    slug: space.slug,
    description: space.description ?? null,
    visibility: space.visibility,
    visualisationType: space.visualisation_type,
    updatedAt: space.updated_at,
  };
}

function serializeOwnerProjectEvidenceRef(link: any, document: any, space: any) {
  const route = link.link_visibility === "public" &&
    document.status === "published" &&
    document.visibility === "public"
    ? {
      routeLabel: "Open observatory",
      routeHref: `/developer-spaces/${encodeURIComponent(space.slug)}`,
    }
    : {};

  return {
    developerSpace: {
      projectName: space.project_name,
      slug: space.slug,
    },
    role: link.document_role,
    linkVisibility: link.link_visibility,
    sortOrder: Number(link.sort_order ?? 0),
    linkedAt: link.created_at,
    updatedAt: link.updated_at,
    document: {
      title: document.title,
      slug: document.slug,
      documentType: document.document_type,
      status: document.status,
      visibility: document.visibility,
      provenanceType: document.provenance_type,
      sourceLabel: document.source_label ?? null,
      publishedAt: document.published_at ?? null,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    },
    ...route,
  };
}

function serializePublicProjectEvidenceRef(link: any, document: any, space: any) {
  return {
    title: document.title,
    kind: link.document_role ?? document.document_type,
    href: `/developer-spaces/${encodeURIComponent(space.slug)}`,
    sourceLabel: "Public Developer Space",
    ...(document.published_at ? { publishedAt: document.published_at } : {}),
    updatedAt: document.updated_at,
  };
}

async function buildProjectExportManifest(project: any, packageId: string, ownerUserId: string) {
  const { attachedDeveloperSpaces, links, documentsById } = await loadProjectExportSources(project, ownerUserId);
  const spacesById = new Map(attachedDeveloperSpaces.map((space: any) => [space.id, space]));

  const ownerProjectEvidenceRefs = links
    .map((link: any) => {
      const space = spacesById.get(link.developer_space_id);
      const document = documentsById.get(link.document_id);
      if (!space || !document) return null;
      return {
        item: serializeOwnerProjectEvidenceRef(link, document, space),
        sortTime: projectEvidenceSortTime(document, link),
      };
    })
    .filter((entry: any): entry is { item: Record<string, any>; sortTime: number } => Boolean(entry))
    .sort((a, b) => {
      if (a.sortTime !== b.sortTime) return b.sortTime - a.sortTime;
      return String(a.item.document?.title ?? "").localeCompare(String(b.item.document?.title ?? ""));
    })
    .map((entry) => entry.item);

  const publicProjectEvidenceRefs = links
    .map((link: any) => {
      const space = spacesById.get(link.developer_space_id);
      const document = documentsById.get(link.document_id);
      if (!space || !document) return null;
      if (space.visibility !== "public") return null;
      if (link.link_visibility !== "public") return null;
      if (document.status !== "published" || document.visibility !== "public") return null;
      return {
        item: serializePublicProjectEvidenceRef(link, document, space),
        sortTime: projectEvidenceSortTime(document, link),
      };
    })
    .filter((entry: any): entry is { item: Record<string, any>; sortTime: number } => Boolean(entry))
    .sort((a, b) => {
      if (a.sortTime !== b.sortTime) return b.sortTime - a.sortTime;
      return String(a.item.title ?? "").localeCompare(String(b.item.title ?? ""));
    })
    .map((entry) => entry.item);

  const generatedAt = new Date().toISOString();
  return {
    schema: "station.project.export_manifest.v1" as const,
    generatedAt,
    package: {
      id: packageId,
      status: "completed",
      format: "json_markdown",
    },
    project: {
      name: project.name,
      slug: project.slug,
      description: project.description ?? null,
      visibility: project.visibility,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    },
    attachedDeveloperSpaces: attachedDeveloperSpaces.map(serializeProjectSpaceRef),
    ownerProjectEvidenceRefs,
    publicProjectEvidenceRefs,
    trust: {
      ownerOnly: true,
      documentBodiesOmitted: true,
      publicReferencesSeparated: true,
      linkedSourceRowsRemainPrivate: true,
      note: "Project manifest packages are owner-only. Document bodies are omitted, public references are separate from owner evidence, and linked source rows remain private.",
    },
  };
}

function buildProjectManifestMarkdown(manifest: any) {
  return [
    `# Station Project Export Manifest: ${manifest.project.name}`,
    "",
    `Generated: ${manifest.generatedAt}`,
    `Package: ${manifest.package.id}`,
    "",
    "## Trust Notes",
    `- Owner-only package: ${manifest.trust.ownerOnly ? "yes" : "no"}`,
    `- Document bodies omitted: ${manifest.trust.documentBodiesOmitted ? "yes" : "no"}`,
    `- Public references separated: ${manifest.trust.publicReferencesSeparated ? "yes" : "no"}`,
    `- Linked source rows remain private: ${manifest.trust.linkedSourceRowsRemainPrivate ? "yes" : "no"}`,
    "",
    "## Project",
    `- Name: ${manifest.project.name}`,
    `- Slug: ${manifest.project.slug}`,
    `- Visibility: ${manifest.project.visibility}`,
    manifest.project.description ? `- Description: ${manifest.project.description}` : "- Description: none",
    "",
    "## Attached Developer Spaces",
    manifest.attachedDeveloperSpaces.length === 0
      ? "- None"
      : manifest.attachedDeveloperSpaces.map((space: any) =>
        `- ${space.projectName} (${space.visibility}, ${space.visualisationType})`
      ).join("\n"),
    "",
    "## Owner Project Evidence References",
    manifest.ownerProjectEvidenceRefs.length === 0
      ? "- None"
      : manifest.ownerProjectEvidenceRefs.map((item: any) =>
        `- ${item.document.title} (${item.role}, ${item.document.status}/${item.document.visibility})`
      ).join("\n"),
    "",
    "## Public Project Evidence References",
    manifest.publicProjectEvidenceRefs.length === 0
      ? "- None"
      : manifest.publicProjectEvidenceRefs.map((item: any) =>
        `- ${item.title} (${item.kind}) -> ${item.href}`
      ).join("\n"),
    "",
  ].join("\n");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function bundleFile(path: string, mediaType: string, content: string) {
  return {
    path,
    mediaType,
    bytes: Buffer.byteLength(content, "utf8"),
    sha256: sha256(content),
    content,
  };
}

function buildExportBundle(row: any) {
  const manifest = row.manifest_json ?? {};
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestMarkdown = row.manifest_markdown ?? "";
  const readme = [
    `# Station Export Bundle`,
    "",
    `Package: ${row.id}`,
    `Kind: ${row.package_kind}`,
    `Format: ${row.format}`,
    `Status: ${row.status}`,
    "",
    "## Contents",
    "- `manifest.json` is the canonical structured owner-only export manifest.",
    "- `manifest.md` is the human-readable Markdown readback for the same package.",
    "",
    "## Privacy",
    "This bundle is returned only to the package owner through the authenticated export route. Preserve it as private material unless you intentionally publish selected excerpts elsewhere.",
    "",
  ].join("\n");
  const files = [
    bundleFile("README.md", "text/markdown; charset=utf-8", readme),
    bundleFile("manifest.json", "application/json; charset=utf-8", manifestJson),
    bundleFile("manifest.md", "text/markdown; charset=utf-8", manifestMarkdown),
  ];

  return {
    schema: "station.export.bundle.v1",
    generatedAt: new Date().toISOString(),
    package: exportRow(row),
    privacy: {
      ownerOnly: true,
      note: "Portable JSON/Markdown bundle readback for the authenticated package owner.",
    },
    integrity: {
      algorithm: "sha256",
      fileCount: files.length,
      files: Object.fromEntries(files.map((file) => [file.path, file.sha256])),
    },
    files,
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasStoredProjectManifestReadback(row: any) {
  const manifest = row.manifest_json;
  if (!isPlainRecord(manifest)) return false;
  const project = manifest.project;
  const packageInfo = manifest.package;
  const trust = manifest.trust;
  return (
    manifest.schema === "station.project.export_manifest.v1" &&
    typeof manifest.generatedAt === "string" &&
    isPlainRecord(packageInfo) &&
    typeof packageInfo.id === "string" &&
    isPlainRecord(project) &&
    typeof project.name === "string" &&
    typeof project.slug === "string" &&
    typeof project.visibility === "string" &&
    Array.isArray(manifest.attachedDeveloperSpaces) &&
    Array.isArray(manifest.ownerProjectEvidenceRefs) &&
    Array.isArray(manifest.publicProjectEvidenceRefs) &&
    isPlainRecord(trust) &&
    trust.ownerOnly === true &&
    trust.documentBodiesOmitted === true &&
    trust.publicReferencesSeparated === true &&
    trust.linkedSourceRowsRemainPrivate === true &&
    typeof row.manifest_markdown === "string" &&
    row.manifest_markdown.trim().length > 0
  );
}

function buildProjectManifestBundle(row: any) {
  const manifestJson = JSON.stringify(row.manifest_json, null, 2);
  const manifestMarkdown = row.manifest_markdown;
  const readme = [
    `# Station Export Bundle`,
    "",
    `Package: ${row.id}`,
    `Kind: ${row.package_kind}`,
    `Format: ${row.format}`,
    `Status: ${row.status}`,
    "",
    "## Contents",
    "- `manifest.json` is the canonical structured owner-only Project manifest readback.",
    "- `manifest.md` is the human-readable Markdown readback for the same package.",
    "",
    "## Privacy",
    "This bundle is returned only to the package owner through the authenticated export route.",
    "It contains only the stored PR249 Project manifest readback; excluded material remains outside this API response.",
    "",
  ].join("\n");
  const files = [
    bundleFile("README.md", "text/markdown; charset=utf-8", readme),
    bundleFile("manifest.json", "application/json; charset=utf-8", manifestJson),
    bundleFile("manifest.md", "text/markdown; charset=utf-8", manifestMarkdown),
  ];

  return {
    schema: "station.export.bundle.v1",
    generatedAt: new Date().toISOString(),
    package: {
      id: row.id,
      packageKind: row.package_kind,
      format: row.format,
      status: row.status,
    },
    privacy: {
      ownerOnly: true,
      note: "Stored Project manifest readback for the authenticated package owner.",
    },
    integrity: {
      algorithm: "sha256",
      fileCount: files.length,
      files: Object.fromEntries(files.map((file) => [file.path, file.sha256])),
    },
    files,
  };
}

async function createExportPackage(persona: any, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const requestedAt = new Date().toISOString();
  await assertNoInProgressExportPackage({
    ownerUserId,
    packageKind: "persona_archive",
    personaId: persona.id,
  });

  const { data: initial, error } = await sb
    .from("export_packages")
    .insert({
      owner_user_id: ownerUserId,
      persona_id: persona.id,
      package_kind: "persona_archive",
      status: "processing",
      format: "json_markdown",
      included_sections: INCLUDED_SECTIONS,
      manifest_json: {},
      manifest_markdown: "",
      content_summary: {},
      requested_at: requestedAt,
      completed_at: null,
    })
    .select("*")
    .single();

  if (error || !initial) throw new Error(error?.message ?? "Could not create export package.");

  try {
    const manifest = await buildPersonaExportManifest(persona, initial.id, ownerUserId);
    const manifestMarkdown = buildManifestMarkdown(manifest);
    const completedAt = new Date().toISOString();

    const { data: completed, error: updateError } = await sb
      .from("export_packages")
      .update({
        status: "completed",
        manifest_json: manifest,
        manifest_markdown: manifestMarkdown,
        content_summary: manifest.counts,
        completed_at: completedAt,
      })
      .eq("id", initial.id)
      .eq("owner_user_id", ownerUserId)
      .select("*")
      .single();

    if (updateError || !completed) throw new Error(updateError?.message ?? "Could not finish export package.");
    return { row: completed, manifest, manifestMarkdown };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish export package.";
    await markExportPackageFailed(initial.id, ownerUserId, message);
    throw new Error(message);
  }
}

async function createDeveloperSpaceExportPackage(space: any, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const requestedAt = new Date().toISOString();
  await assertNoInProgressExportPackage({
    ownerUserId,
    packageKind: "developer_space_archive",
    developerSpaceId: space.id,
  });
  await assertDeveloperSpaceUsageAvailable(space, { exports: 1 });

  const { data: initial, error } = await sb
    .from("export_packages")
    .insert({
      owner_user_id: ownerUserId,
      persona_id: null,
      developer_space_id: space.id,
      package_kind: "developer_space_archive",
      status: "processing",
      format: "json_markdown",
      included_sections: DEVELOPER_SPACE_INCLUDED_SECTIONS,
      manifest_json: {},
      manifest_markdown: "",
      content_summary: {},
      requested_at: requestedAt,
      completed_at: null,
    })
    .select("*")
    .single();

  if (error || !initial) throw new Error(error?.message ?? "Could not create Developer Space export package.");

  try {
    const manifest = await buildDeveloperSpaceExportManifest(space, initial.id, ownerUserId);
    const manifestMarkdown = buildDeveloperSpaceManifestMarkdown(manifest);
    const completedAt = new Date().toISOString();

    const { data: completed, error: updateError } = await sb
      .from("export_packages")
      .update({
        status: "completed",
        manifest_json: manifest,
        manifest_markdown: manifestMarkdown,
        content_summary: manifest.counts,
        completed_at: completedAt,
      })
      .eq("id", initial.id)
      .eq("owner_user_id", ownerUserId)
      .select("*")
      .single();

    if (updateError || !completed) {
      throw new Error(updateError?.message ?? "Could not finish Developer Space export package.");
    }

    await recordDeveloperSpaceUsage(space, { exports: 1 }).catch(() => null);
    return { row: completed, manifest, manifestMarkdown };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish Developer Space export package.";
    await markExportPackageFailed(initial.id, ownerUserId, message);
    throw new Error(message);
  }
}

async function createProjectExportPackage(project: any, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const requestedAt = new Date().toISOString();
  await assertNoInProgressExportPackage({
    ownerUserId,
    packageKind: "project_manifest",
    projectId: project.id,
  });

  const { data: initial, error } = await sb
    .from("export_packages")
    .insert({
      owner_user_id: ownerUserId,
      persona_id: null,
      developer_space_id: null,
      project_id: project.id,
      package_kind: "project_manifest",
      status: "processing",
      format: "json_markdown",
      included_sections: PROJECT_INCLUDED_SECTIONS,
      manifest_json: {},
      manifest_markdown: "",
      content_summary: {},
      requested_at: requestedAt,
      completed_at: null,
    })
    .select("*")
    .single();

  if (error || !initial) throw new Error(error?.message ?? "Could not create Project manifest package.");

  try {
    const manifest = await buildProjectExportManifest(project, initial.id, ownerUserId);
    const manifestMarkdown = buildProjectManifestMarkdown(manifest);
    const completedAt = new Date().toISOString();

    const { data: completed, error: updateError } = await sb
      .from("export_packages")
      .update({
        status: "completed",
        manifest_json: manifest,
        manifest_markdown: manifestMarkdown,
        content_summary: {
          attachedDeveloperSpaces: manifest.attachedDeveloperSpaces.length,
          ownerProjectEvidenceRefs: manifest.ownerProjectEvidenceRefs.length,
          publicProjectEvidenceRefs: manifest.publicProjectEvidenceRefs.length,
        },
        completed_at: completedAt,
      })
      .eq("id", initial.id)
      .eq("owner_user_id", ownerUserId)
      .eq("project_id", project.id)
      .select("*")
      .single();

    if (updateError || !completed) {
      throw new Error(updateError?.message ?? "Could not finish Project manifest package.");
    }

    return { row: completed, manifest, manifestMarkdown };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish Project manifest package.";
    await markExportPackageFailed(initial.id, ownerUserId, message);
    throw new Error(message);
  }
}

async function markExportPackageFailed(packageId: string, ownerUserId: string, message: string) {
  const sb = getSupabaseAdmin();
  await sb
    .from("export_packages")
    .update({
      status: "failed",
      error_message: message,
      completed_at: new Date().toISOString(),
    })
    .eq("id", packageId)
    .eq("owner_user_id", ownerUserId);
}

exportsRouter.get("/developer-spaces/:spaceId", async (req, res) => {
  const space = await loadOwnedDeveloperSpace(req.params.spaceId, req.user!.id);
  if (!space) return res.status(404).json({ error: "Developer Space not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("export_packages")
    .select("id, owner_user_id, persona_id, developer_space_id, package_kind, status, format, included_sections, content_summary, error_message, requested_at, completed_at, created_at, updated_at")
    .eq("developer_space_id", space.id)
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ exports: (data ?? []).map(exportRow) });
});

exportsRouter.post("/developer-spaces/:spaceId", async (req, res) => {
  const space = await loadOwnedDeveloperSpace(req.params.spaceId, req.user!.id);
  if (!space) return res.status(404).json({ error: "Developer Space not found." });

  try {
    const { row, manifest, manifestMarkdown } = await createDeveloperSpaceExportPackage(space, req.user!.id);
    return res.status(201).json({
      exportPackage: exportRow(row),
      manifest,
      manifestMarkdown,
    });
  } catch (error) {
    const quotaError = quotaErrorResponse(error);
    if (quotaError) return res.status(quotaError.status).json(quotaError.body);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Could not create Developer Space export package.",
    });
  }
});

exportsRouter.get("/projects/:projectIdOrSlug", async (req, res) => {
  const project = await loadOwnedProject(req.params.projectIdOrSlug, req.user!.id);
  if (!project) return res.status(404).json({ error: "Project not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("export_packages")
    .select("id, owner_user_id, persona_id, developer_space_id, project_id, package_kind, status, format, included_sections, content_summary, error_message, requested_at, completed_at, created_at, updated_at")
    .eq("project_id", project.id)
    .eq("owner_user_id", req.user!.id)
    .eq("package_kind", "project_manifest")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ exports: (data ?? []).map(exportRow) });
});

exportsRouter.post("/projects/:projectIdOrSlug", async (req, res) => {
  const project = await loadOwnedProject(req.params.projectIdOrSlug, req.user!.id);
  if (!project) return res.status(404).json({ error: "Project not found." });

  try {
    const { row, manifest, manifestMarkdown } = await createProjectExportPackage(project, req.user!.id);
    return res.status(201).json({
      exportPackage: exportRow(row),
      manifest,
      manifestMarkdown,
    });
  } catch (error) {
    const quotaError = quotaErrorResponse(error);
    if (quotaError) return res.status(quotaError.status).json(quotaError.body);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Could not create Project manifest package.",
    });
  }
});

exportsRouter.get("/persona/:personaId", async (req, res) => {
  const persona = await loadOwnedPersona(req.params.personaId, req.user!.id);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("export_packages")
    .select("id, owner_user_id, persona_id, package_kind, status, format, included_sections, content_summary, error_message, requested_at, completed_at, created_at, updated_at")
    .eq("persona_id", persona.id)
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ exports: (data ?? []).map(exportRow) });
});

exportsRouter.post("/persona/:personaId", async (req, res) => {
  const persona = await loadOwnedPersona(req.params.personaId, req.user!.id);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  try {
    const { row, manifest, manifestMarkdown } = await createExportPackage(persona, req.user!.id);
    return res.status(201).json({
      exportPackage: exportRow(row),
      manifest,
      manifestMarkdown,
    });
  } catch (error) {
    const quotaError = quotaErrorResponse(error);
    if (quotaError) return res.status(quotaError.status).json(quotaError.body);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Could not create export package." });
  }
});

exportsRouter.get("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("export_packages")
    .select("*")
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Export package not found." });
  return res.json({
    exportPackage: exportRow(data),
    manifest: data.manifest_json,
    manifestMarkdown: data.manifest_markdown,
  });
});

exportsRouter.get("/:id/bundle", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("export_packages")
    .select("*")
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Export package not found." });
  if (data.status !== "completed") {
    return res.status(409).json({ error: "Export bundle is available only after the package is completed." });
  }
  if (data.package_kind === "project_manifest") {
    if (!hasStoredProjectManifestReadback(data)) {
      return res.status(409).json({
        error: "Project manifest bundle is available only when stored manifest readback is complete.",
      });
    }
    return res.json({ bundle: buildProjectManifestBundle(data) });
  }

  return res.json({ bundle: buildExportBundle(data) });
});
