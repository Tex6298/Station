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

function trimText(value: string, limit: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit - 3).trim()}...` : clean;
}
