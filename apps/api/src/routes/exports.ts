import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";

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
];

function exportRow(row: any) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
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

function compactRows<T extends Record<string, unknown>>(rows: T[], mapper: (row: T) => Record<string, unknown>) {
  return rows.map(mapper);
}

function discussionCommentVisible(comment: any, ownerUserId: string) {
  if (comment.author_user_id === ownerUserId) return true;
  return comment.status === "active" && comment.is_hidden !== true;
}

async function loadThreadDiscussion(threadId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, title, status, visibility, linked_document_id, is_pinned, is_hidden, reported_count, comment_count, created_at, updated_at")
    .eq("id", threadId)
    .single();

  if (!thread) return null;

  const { data: comments } = await sb
    .from("comments")
    .select("id, author_user_id, parent_type, parent_id, body, status, is_pinned, is_hidden, reported_count, score, created_at, updated_at")
    .eq("parent_type", "thread")
    .eq("parent_id", thread.id)
    .order("created_at", { ascending: true });

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
      .select("id, title, slug, document_type, status, visibility, published_at, provenance_type, source_type, source_id, source_label, source_persona_id, discussion_thread_id, created_at, updated_at")
      .eq("author_user_id", ownerUserId)
      .eq("persona_id", persona.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    sb
      .from("documents")
      .select("id, title, slug, document_type, status, visibility, published_at, provenance_type, source_type, source_id, source_label, source_persona_id, discussion_thread_id, created_at, updated_at")
      .eq("author_user_id", ownerUserId)
      .eq("source_persona_id", persona.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
  ]);

  const documentsById = new Map<string, any>();
  for (const document of [...(personaDocsRes.data ?? []), ...(sourceDocsRes.data ?? [])]) {
    documentsById.set(document.id, document);
  }

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
      publishedAt: document.published_at,
      provenanceType: document.provenance_type,
      sourceType: document.source_type,
      sourceId: document.source_id,
      sourceLabel: document.source_label,
      sourcePersonaId: document.source_persona_id,
      discussion,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    };
  }));

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
    discussionComments: publishedDocuments.reduce((sum, document: any) => sum + (document.discussion?.comments?.length ?? 0), 0),
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
    trust: {
      provenancePreserved: true,
      publicationStatesPreserved: true,
      continuityRecordVisibilityPreserved: true,
      publicCopiesAreSeparateDocuments: true,
      sourceRowsRemainPrivate: true,
      discussionPolicy: "Visible discussion comments are included. Removed or hidden comments are included only when authored by the export owner.",
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
  ].join("\n");
}

async function createExportPackage(persona: any, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const requestedAt = new Date().toISOString();

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
}

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
