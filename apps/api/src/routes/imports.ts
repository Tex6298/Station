import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { ingestTextIntoArchive } from "../services/archive.service";
import {
  IMPORT_JOB_SELECT,
  type ImportJobRow,
  countImportArchiveRows,
  loadOwnedImportJob,
  markImportJobCompleted,
  markImportJobFailed,
  markImportJobProcessing,
  sanitizeJobErrorMessage,
  serializeImportJob,
} from "../services/background-jobs.service";
import { storageErrorResponse } from "../services/storage.service";
import {
  assertActiveImportJobQuota,
  quotaErrorResponse,
} from "../services/operational-quota.service";

const chatImportSchema = z.object({
  personaId: z.string().uuid(),
  content: z.string().min(1).max(500000),
  sourceName: z.string().max(200).default("pasted-chat"),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const chatImportRetrySchema = z.object({
  content: z.string().min(1).max(500000).optional(),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const GENERIC_CHAT_IMPORT_SOURCE_NAMES = new Set(["pasted-chat", "pasted-archive"]);
const ARCHIVE_SEARCH_SOURCE_LIMIT = 120;
const ARCHIVE_SEARCH_MAX_LIMIT = 50;

const archiveSearchQuerySchema = z.object({
  q: z.string().max(200).optional().default(""),
  type: z.string().max(60).optional(),
  source: z.string().max(60).optional(),
  personaId: z.string().uuid().optional(),
  status: z.string().max(60).optional(),
  sort: z.enum(["date", "type", "title"]).optional().default("date"),
  limit: z.coerce.number().int().min(1).max(ARCHIVE_SEARCH_MAX_LIMIT).optional().default(30),
});

export const importsRouter = Router();
importsRouter.use(requireAuth);

// -- Import raw text / pasted chat ---------------------------------------------
importsRouter.post("/chat", async (req, res) => {
  const parsed = chatImportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", parsed.data.personaId)
    .single();

  if (!persona || persona.owner_user_id !== userId) {
    return res.status(404).json({ error: "Persona not found." });
  }

  if (isSpecificChatImportSourceName(parsed.data.sourceName)) {
    const existingCompleted = await loadCompletedChatImportBySource(
      persona.id,
      userId,
      parsed.data.sourceName
    );
    if (existingCompleted) {
      const chunksCreated = await countImportArchiveRows(existingCompleted);
      if (chunksCreated > 0) {
        return res.json({
          job: serializeImportJob(existingCompleted),
          chunksCreated,
          imported: true,
          duplicate: true,
          idempotent: true,
        });
      }
    }
  }

  try {
    await assertActiveImportJobQuota({ ownerUserId: userId, personaId: persona.id });
  } catch (error) {
    const quotaError = quotaErrorResponse(error);
    if (quotaError) return res.status(quotaError.status).json(quotaError.body);
    throw error;
  }

  // Create import job
  const { data: job, error: jobError } = await sb
    .from("import_jobs")
    .insert({
      persona_id: persona.id,
      owner_user_id: userId,
      kind: "chat",
      status: "processing",
      source_name: parsed.data.sourceName,
    })
    .select(IMPORT_JOB_SELECT)
    .single();

  if (jobError || !job) {
    return res.status(500).json({ error: jobError?.message ?? "Import job insert failed." });
  }

  try {
    const chunksCreated = await ingestTextIntoArchive({
      personaId: persona.id,
      ownerUserId: userId,
      text: parsed.data.content,
      sourceName: parsed.data.sourceName,
      sourceType: "import",
      relevanceWeight: parsed.data.relevanceWeight ?? 1.5,
      archiveSource: {
        type: "import_job",
        id: job.id,
        name: parsed.data.sourceName,
      },
    });

    const completedJob = await markImportJobCompleted(job.id, userId);

    return res.status(201).json({
      job: serializeImportJob(completedJob ?? job),
      chunksCreated,
      imported: true,
      integrityTrigger: {
        sessionType: "migration",
        personaId: persona.id,
        message: "Imported content is ready. A Migration Integrity Session can help Station carry this history forward.",
      },
    });
  } catch (err) {
    const storageError = storageErrorResponse(err);
    const message = sanitizeJobErrorMessage(
      storageError?.body.error ?? err,
      [parsed.data.content, parsed.data.sourceName]
    );
    if (storageError) {
      await markImportJobFailed(job.id, userId, message).catch(() => undefined);
      return res.status(storageError.status).json({ error: message });
    }

    await markImportJobFailed(job.id, userId, message).catch(() => undefined);
    return res.status(500).json({ error: message });
  }
});

// -- Retry a failed chat import without creating duplicate completed jobs -------
importsRouter.post("/:id/retry", async (req, res) => {
  const parsed = chatImportRetrySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.id;
  const job = await loadOwnedImportJob(req.params.id, userId);
  if (!job) return res.status(404).json({ error: "Import job not found." });

  if (job.kind !== "chat") {
    return res.status(400).json({
      error: "Only chat import jobs can be retried without a persisted file pointer.",
    });
  }

  if (job.status === "completed") {
    return res.json({
      job: serializeImportJob(job),
      chunksCreated: await countImportArchiveRows(job),
      imported: true,
      retried: false,
      idempotent: true,
    });
  }

  if (job.status === "queued" || job.status === "processing") {
    const existingRows = await countImportArchiveRows(job);
    if (existingRows > 0) {
      const completedJob = await markImportJobCompleted(job.id, userId);
      return res.json({
        job: serializeImportJob(completedJob),
        chunksCreated: existingRows,
        imported: true,
        retried: false,
        idempotent: true,
      });
    }

    return res.status(202).json({
      job: serializeImportJob(job),
      imported: false,
      retried: false,
      pending: true,
    });
  }

  if (!parsed.data.content) {
    return res.status(400).json({ error: "content is required to retry a failed chat import." });
  }

  const existingRows = await countImportArchiveRows(job);
  if (existingRows > 0) {
    const completedJob = await markImportJobCompleted(job.id, userId);
    return res.json({
      job: serializeImportJob(completedJob),
      chunksCreated: existingRows,
      imported: true,
      retried: false,
      idempotent: true,
    });
  }

  await markImportJobProcessing(job.id, userId);

  try {
    const chunksCreated = await ingestTextIntoArchive({
      personaId: job.persona_id,
      ownerUserId: userId,
      text: parsed.data.content,
      sourceName: job.source_name,
      sourceType: "import",
      relevanceWeight: parsed.data.relevanceWeight ?? 1.5,
      archiveSource: {
        type: "import_job",
        id: job.id,
        name: job.source_name,
      },
    });

    const completedJob = await markImportJobCompleted(job.id, userId);
    return res.json({
      job: serializeImportJob(completedJob),
      chunksCreated,
      imported: true,
      retried: true,
      idempotent: false,
    });
  } catch (err) {
    const storageError = storageErrorResponse(err);
    const message = sanitizeJobErrorMessage(
      storageError?.body.error ?? err,
      [parsed.data.content, job.source_name]
    );
    const failedJob = await markImportJobFailed(job.id, userId, message).catch(() => null);
    return res.status(storageError?.status ?? 500).json({
      error: message,
      job: failedJob ? serializeImportJob(failedJob) : serializeImportJob({ ...job, status: "failed", error_message: message }),
    });
  }
});


// -- Global private archive summary -------------------------------------------
importsRouter.get("/archive", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const [personas, memoryItems, personaFiles, importJobs, archivedChats, integritySessions, documents] = await Promise.all([
    readRows<any>(
      sb
        .from("personas")
        .select("id, name")
        .eq("owner_user_id", userId)
        .limit(100)
    ),
    readRows<any>(
      sb
        .from("memory_items")
        .select("id, persona_id, title, summary, content, source_type, archive_source_type, archive_source_name, created_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(60)
    ),
    readRows<any>(
      sb
        .from("persona_files")
        .select("id, persona_id, file_name, file_type, source_type, processed, created_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(60)
    ),
    readRows<any>(
      sb
        .from("import_jobs")
        .select("id, persona_id, kind, status, source_name, error_message, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(60)
    ),
    readRows<any>(
      sb
        .from("archived_chat_transcripts")
        .select("id, persona_id, title, source_summary, message_count, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(60)
    ),
    readRows<any>(
      sb
        .from("integrity_sessions")
        .select("id, persona_id, session_type, status, started_at, completed_at, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(60)
    ),
    readRows<any>(
      sb
        .from("documents")
        .select("id, persona_id, title, document_type, status, visibility, created_at, updated_at, published_at")
        .eq("author_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(60)
    ),
  ]);

  const personaNames = new Map(personas.map((persona) => [persona.id, persona.name]));
  const items = [
    ...memoryItems.map((row) => archiveItem({
      id: row.id,
      title: row.title ?? row.archive_source_name ?? "Memory item",
      source: row.archive_source_name ?? row.archive_source_type ?? row.source_type ?? "Memory",
      type: row.archive_source_type ? "archive" : "memory",
      persona: personaLabel(row.persona_id, personaNames),
      date: row.created_at,
      status: "indexed",
      summary: row.summary ?? row.content ?? "Private memory item available for retrieval.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/memory` : "/studio/archive",
    })),
    ...personaFiles.map((row) => archiveItem({
      id: row.id,
      title: row.file_name ?? "Uploaded file",
      source: row.source_type ?? "Upload",
      type: classifyArchiveType(row.file_type, row.file_name),
      persona: personaLabel(row.persona_id, personaNames),
      date: row.created_at,
      status: row.processed ? "processed" : "queued",
      summary: row.processed ? "File is preserved and processed for this persona." : "File is preserved and waiting for processing.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
    })),
    ...importJobs.map((row) => archiveItem({
      id: row.id,
      title: row.source_name ?? "Import job",
      source: row.kind ?? "import",
      type: "import",
      persona: personaLabel(row.persona_id, personaNames),
      date: row.updated_at ?? row.created_at,
      status: row.status ?? "queued",
      summary: row.error_message ?? `Import is ${row.status ?? "queued"}.`,
      href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
    })),
    ...archivedChats.map((row) => archiveItem({
      id: row.id,
      title: row.title ?? "Archived chat",
      source: "Archived chat",
      type: "conversation",
      persona: personaLabel(row.persona_id, personaNames),
      date: row.updated_at ?? row.created_at,
      status: "archived",
      summary: row.source_summary ?? `${row.message_count ?? 0} messages archived as a private transcript.`,
      href: row.persona_id ? `/studio/personas/${row.persona_id}` : "/studio/archive",
    })),
    ...integritySessions.map((row) => archiveItem({
      id: row.id,
      title: `${row.session_type ?? "Integrity"} session`,
      source: "Integrity Session",
      type: "integrity",
      persona: personaLabel(row.persona_id, personaNames),
      date: row.completed_at ?? row.updated_at ?? row.started_at ?? row.created_at,
      status: row.status ?? "in_progress",
      summary: row.status === "completed" ? "Structured continuity outputs are available for review." : "Integrity Session is still in progress.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/calibration` : "/studio/archive",
    })),
    ...documents.map((row) => archiveItem({
      id: row.id,
      title: row.title ?? "Document",
      source: row.document_type ?? "document",
      type: "document",
      persona: personaLabel(row.persona_id, personaNames),
      date: row.published_at ?? row.updated_at ?? row.created_at,
      status: row.status ?? "draft",
      summary: `${row.document_type ?? "document"} · ${row.visibility ?? "private"}`,
      href: "/studio/publishing",
    })),
  ]
    .sort((a, b) => Date.parse(b.date ?? "") - Date.parse(a.date ?? ""))
    .slice(0, 120);

  return res.json({ items });
});

// -- Global private archive search --------------------------------------------
importsRouter.get("/archive/search", async (req, res) => {
  const parsed = archiveSearchQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const search = parsed.data;

  const [
    personas,
    memoryItems,
    canonItems,
    personaFiles,
    importJobs,
    archivedChats,
    continuityRecords,
    integritySessions,
    documents,
  ] = await Promise.all([
    readRowsForSearch<any>(
      "personas",
      sb
        .from("personas")
        .select("id, name")
        .eq("owner_user_id", userId)
        .limit(100)
    ),
    readRowsForSearch<any>(
      "memory_items",
      sb
        .from("memory_items")
        .select("id, persona_id, title, summary, content, source_type, archive_source_type, archive_source_name, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "canon_items",
      sb
        .from("canon_items")
        .select("id, persona_id, title, content, source_type, priority, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "persona_files",
      sb
        .from("persona_files")
        .select("id, persona_id, file_name, file_type, source_type, processed, created_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "import_jobs",
      sb
        .from("import_jobs")
        .select("id, persona_id, kind, status, source_name, error_message, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "archived_chat_transcripts",
      sb
        .from("archived_chat_transcripts")
        .select("id, persona_id, title, source_summary, message_count, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "continuity_records",
      sb
        .from("continuity_records")
        .select("id, persona_id, record_type, title, body, summary, source_label, visibility, occurred_at, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "integrity_sessions",
      sb
        .from("integrity_sessions")
        .select("id, persona_id, session_type, status, clusters_covered, clusters_planned, started_at, completed_at, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
    readRowsForSearch<any>(
      "documents",
      sb
        .from("documents")
        .select("id, persona_id, title, body, document_type, status, visibility, source_label, created_at, updated_at, published_at")
        .eq("author_user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(ARCHIVE_SEARCH_SOURCE_LIMIT)
    ),
  ]);

  const personaNames = new Map(personas.rows.map((persona) => [persona.id, persona.name]));
  const terms = searchTerms(search.q);
  const typeFilter = normalizeFilter(search.type ?? search.source ?? "");
  const statusFilter = normalizeFilter(search.status ?? "");

  const candidates = [
    ...memoryItems.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "memory",
      type: row.archive_source_type ? "archive" : "memory",
      title: row.title ?? row.archive_source_name ?? "Memory item",
      sourceLabel: row.archive_source_name ?? row.archive_source_type ?? row.source_type ?? "Memory",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.updated_at ?? row.created_at,
      status: "indexed",
      summary: row.summary ?? row.content ?? "Private memory item available for retrieval.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/memory` : "/studio/archive",
      fields: [
        field("title", row.title),
        field("summary", row.summary),
        field("content", row.content),
        field("source", row.archive_source_name ?? row.archive_source_type ?? row.source_type),
      ],
    })),
    ...canonItems.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "canon",
      type: "canon",
      title: row.title ?? "Canon item",
      sourceLabel: row.source_type ?? "Canon",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.updated_at ?? row.created_at,
      status: `priority ${row.priority ?? 1}`,
      summary: row.content ?? "Private canon item.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/canon` : "/studio/archive",
      fields: [
        field("title", row.title),
        field("content", row.content),
        field("source", row.source_type),
      ],
    })),
    ...personaFiles.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "persona_file",
      type: classifyArchiveType(row.file_type, row.file_name),
      title: row.file_name ?? "Uploaded file",
      sourceLabel: row.source_type ?? "Upload",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.created_at,
      status: row.processed ? "processed" : "queued",
      summary: row.processed ? "File is preserved and processed for this persona." : "File is preserved and waiting for processing.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
      fields: [
        field("file name", row.file_name),
        field("file type", row.file_type),
        field("source", row.source_type),
      ],
    })),
    ...importJobs.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "import_job",
      type: "import",
      title: row.source_name ?? "Import job",
      sourceLabel: row.kind ?? "import",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.updated_at ?? row.created_at,
      status: row.status ?? "queued",
      summary: row.error_message ? sanitizeJobErrorMessage(row.error_message) : `Import is ${row.status ?? "queued"}.`,
      href: row.persona_id ? `/studio/personas/${row.persona_id}/files` : "/studio/archive",
      fields: [
        field("source", row.source_name),
        field("status", row.status),
        field("error", row.error_message),
        field("kind", row.kind),
      ],
    })),
    ...archivedChats.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "archived_chat",
      type: "conversation",
      title: row.title ?? "Archived chat",
      sourceLabel: "Archived chat",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.updated_at ?? row.created_at,
      status: "archived",
      summary: row.source_summary ?? `${row.message_count ?? 0} messages archived as a private transcript.`,
      href: row.persona_id ? `/studio/personas/${row.persona_id}` : "/studio/archive",
      fields: [
        field("title", row.title),
        field("summary", row.source_summary),
        field("source", "Archived chat"),
      ],
    })),
    ...continuityRecords.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "continuity",
      type: "continuity",
      title: row.title ?? `${row.record_type ?? "Continuity"} record`,
      sourceLabel: row.source_label ?? row.record_type ?? "Continuity",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.occurred_at ?? row.updated_at ?? row.created_at,
      status: row.visibility ?? "private",
      visibility: row.visibility ?? "private",
      summary: row.summary ?? row.body ?? "Private continuity record.",
      href: row.persona_id ? `/studio/personas/${row.persona_id}/timeline` : "/studio/archive",
      fields: [
        field("title", row.title),
        field("summary", row.summary),
        field("body", row.body),
        field("source", row.source_label ?? row.record_type),
      ],
    })),
    ...integritySessions.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "integrity",
      type: "integrity",
      title: `${row.session_type ?? "Integrity"} session`,
      sourceLabel: "Integrity Session",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.completed_at ?? row.updated_at ?? row.started_at ?? row.created_at,
      status: row.status ?? "in_progress",
      summary: integritySearchSummary(row),
      href: row.persona_id ? `/studio/personas/${row.persona_id}/calibration` : "/studio/archive",
      fields: [
        field("session type", row.session_type),
        field("status", row.status),
        field("clusters", [...(row.clusters_covered ?? []), ...(row.clusters_planned ?? [])].join(" ")),
      ],
    })),
    ...documents.rows.map((row) => archiveSearchCandidate({
      id: row.id,
      kind: "document",
      type: "document",
      title: row.title ?? "Document",
      sourceLabel: row.document_type ?? "document",
      personaId: row.persona_id,
      personaName: personaLabel(row.persona_id, personaNames),
      occurredAt: row.published_at ?? row.updated_at ?? row.created_at,
      status: row.status ?? "draft",
      visibility: row.visibility ?? "private",
      summary: row.body ?? `${row.document_type ?? "document"} - ${row.visibility ?? "private"}`,
      href: "/studio/publishing",
      fields: [
        field("title", row.title),
        field("body", row.body),
        field("type", row.document_type),
        field("source", row.source_label),
        field("visibility", row.visibility),
        field("status", row.status),
      ],
    })),
  ];

  const items = candidates
    .filter((item) => matchesArchiveSearchFilters(item, typeFilter, statusFilter, search.personaId))
    .map((item) => {
      const match = archiveSearchMatch(item.fields, terms);
      if (!match) return null;
      const { fields, ...safeItem } = item;
      return { ...safeItem, match };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => compareArchiveSearchItems(a, b, search.sort))
    .slice(0, search.limit);

  const warnings = [
    personas.warning,
    memoryItems.warning,
    canonItems.warning,
    personaFiles.warning,
    importJobs.warning,
    archivedChats.warning,
    continuityRecords.warning,
    integritySessions.warning,
    documents.warning,
  ].filter(Boolean);

  return res.json({
    items,
    warnings,
    query: {
      q: search.q,
      type: search.type ?? search.source ?? null,
      personaId: search.personaId ?? null,
      status: search.status ?? null,
      sort: search.sort,
      limit: search.limit,
    },
    searchedSources: [
      "documents",
      "memory_items",
      "canon_items",
      "persona_files",
      "import_jobs",
      "archived_chat_transcripts",
      "continuity_records",
      "integrity_sessions",
    ],
  });
});

// -- Poll import job status -----------------------------------------------------
importsRouter.get("/:id/status", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: job, error } = await sb
    .from("import_jobs")
    .select(IMPORT_JOB_SELECT)
    .eq("id", req.params.id)
    .eq("owner_user_id", userId)
    .single();

  if (error || !job) return res.status(404).json({ error: "Import job not found." });
  return res.json({ job: serializeImportJob(job) });
});

// -- List all import jobs for a persona ----------------------------------------
importsRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("import_jobs")
    .select(IMPORT_JOB_SELECT)
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ jobs: (data ?? []).map(serializeImportJob) });
});

async function loadCompletedChatImportBySource(
  personaId: string,
  ownerUserId: string,
  sourceName: string
) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("import_jobs")
    .select(IMPORT_JOB_SELECT)
    .eq("persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .eq("kind", "chat")
    .eq("status", "completed")
    .eq("source_name", sourceName)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) return null;
  return (data?.[0] ?? null) as ImportJobRow | null;
}

function isSpecificChatImportSourceName(sourceName: string) {
  const normalized = sourceName.trim().toLowerCase();
  return normalized.length > 0 && !GENERIC_CHAT_IMPORT_SOURCE_NAMES.has(normalized);
}

async function readRows<T>(query: PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>) {
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

async function readRowsForSearch<T>(
  source: string,
  query: PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>
) {
  const { data, error } = await query;
  if (error) {
    return {
      rows: [],
      warning: `${source} could not be searched in this response.`,
    };
  }

  return {
    rows: data ?? [],
    warning: null,
  };
}

function personaLabel(personaId: string | null | undefined, personaNames: Map<string, string>) {
  if (!personaId) return "Shared/global";
  return personaNames.get(personaId) ?? "Unknown persona";
}

function archiveItem(input: {
  id: string;
  title: string;
  source: string;
  type: string;
  persona: string;
  date?: string | null;
  status: string;
  summary: string;
  href: string;
}) {
  return {
    ...input,
    summary: trimText(input.summary, 220),
    date: input.date ?? null,
  };
}

function classifyArchiveType(fileType?: string | null, fileName?: string | null) {
  const value = `${fileType ?? ""} ${fileName ?? ""}`.toLowerCase();
  if (/png|jpe?g|webp|gif|image/.test(value)) return "image";
  if (/json|csv|parquet|data/.test(value)) return "data";
  return "document";
}

function archiveSearchCandidate(input: {
  id: string;
  kind: string;
  type: string;
  title: string;
  sourceLabel: string;
  personaId?: string | null;
  personaName: string;
  occurredAt?: string | null;
  status: string;
  visibility?: string | null;
  summary: string;
  href: string;
  fields: Array<{ field: string; value: string }>;
}) {
  return {
    id: input.id,
    kind: input.kind,
    type: input.type,
    title: sanitizeSearchText(input.title, 120, "Untitled archive item"),
    source: sanitizeSearchText(input.sourceLabel, 80, "Archive"),
    sourceLabel: sanitizeSearchText(input.sourceLabel, 80, "Archive"),
    persona: input.personaName,
    personaId: input.personaId ?? null,
    personaName: input.personaName,
    date: input.occurredAt ?? null,
    occurredAt: input.occurredAt ?? null,
    status: sanitizeSearchText(input.status, 80, "unknown"),
    visibility: input.visibility ?? undefined,
    summary: sanitizeSearchText(input.summary, 260, "Private archive item."),
    href: input.href,
    privacy: "owner_only" as const,
    fields: input.fields,
  };
}

function field(fieldName: string, value: unknown) {
  return {
    field: fieldName,
    value: typeof value === "string" ? value : value == null ? "" : String(value),
  };
}

function searchTerms(query: string | undefined) {
  return normalizeSearchText(query ?? "")
    .split(" ")
    .map((term) => term.trim())
    .filter(Boolean);
}

function archiveSearchMatch(fields: Array<{ field: string; value: string }>, terms: string[]) {
  if (terms.length === 0) {
    return {
      field: "recent",
      reason: "Recent owner-only archive item.",
    };
  }

  for (const item of fields) {
    const normalized = normalizeSearchText(item.value);
    if (terms.every((term) => normalized.includes(term))) {
      return {
        field: item.field,
        reason: `Matched ${item.field}.`,
      };
    }
  }

  const combined = normalizeSearchText(fields.map((item) => item.value).join(" "));
  if (terms.every((term) => combined.includes(term))) {
    return {
      field: "combined",
      reason: "Matched combined private archive metadata.",
    };
  }

  return null;
}

function matchesArchiveSearchFilters(
  item: ReturnType<typeof archiveSearchCandidate>,
  typeFilter: string,
  statusFilter: string,
  personaId?: string
) {
  if (personaId && item.personaId !== personaId) return false;
  if (statusFilter && normalizeFilter(item.status) !== statusFilter) return false;

  if (!typeFilter) return true;
  if (typeFilter === "global" || typeFilter === "shared" || typeFilter === "sharedglobal") {
    return item.persona === "Shared/global";
  }

  const values = [
    item.kind,
    item.type,
    item.source,
    item.sourceLabel,
  ].map(normalizeFilter);

  return values.includes(typeFilter);
}

function compareArchiveSearchItems(
  a: Omit<ReturnType<typeof archiveSearchCandidate>, "fields">,
  b: Omit<ReturnType<typeof archiveSearchCandidate>, "fields">,
  sort: "date" | "type" | "title"
) {
  if (sort === "title") return a.title.localeCompare(b.title);
  if (sort === "type") return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);

  const aTime = Date.parse(a.occurredAt ?? "");
  const bTime = Date.parse(b.occurredAt ?? "");
  return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
}

function integritySearchSummary(row: any) {
  const covered = Array.isArray(row.clusters_covered) ? row.clusters_covered.length : 0;
  const planned = Array.isArray(row.clusters_planned) ? row.clusters_planned.length : 0;
  if (row.status === "completed") {
    return `Completed Integrity Session with ${covered} covered cluster${covered === 1 ? "" : "s"}.`;
  }

  return `Integrity Session is ${row.status ?? "in progress"} with ${planned} planned cluster${planned === 1 ? "" : "s"}.`;
}

function sanitizeSearchText(value: unknown, limit: number, fallback: string) {
  const raw = typeof value === "string" ? value : value == null ? "" : String(value);
  const safe = raw.trim() ? sanitizeJobErrorMessage(raw) : fallback;
  return trimText(safe, limit);
}

function normalizeSearchText(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeFilter(value: string) {
  return value
    .replace(/[_\s/-]+/g, "")
    .trim()
    .toLowerCase();
}

function trimText(value: string, limit: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit - 3).trim()}...` : clean;
}
