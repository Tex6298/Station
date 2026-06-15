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
