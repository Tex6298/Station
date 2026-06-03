import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { ingestTextIntoArchive } from "../services/archive.service";
import { storageErrorResponse } from "../services/storage.service";

const chatImportSchema = z.object({
  personaId: z.string().uuid(),
  content: z.string().min(1).max(500000),
  sourceName: z.string().max(200).default("pasted-chat"),
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

  // Create import job
  const { data: job } = await sb
    .from("import_jobs")
    .insert({
      persona_id: persona.id,
      owner_user_id: userId,
      kind: "chat",
      status: "processing",
      source_name: parsed.data.sourceName,
    })
    .select("id, kind, status, source_name, error_message, created_at, updated_at")
    .single();

  try {
    const chunksCreated = await ingestTextIntoArchive({
      personaId: persona.id,
      ownerUserId: userId,
      text: parsed.data.content,
      sourceName: parsed.data.sourceName,
      sourceType: "import",
      relevanceWeight: parsed.data.relevanceWeight ?? 1.5,
    });

    const { data: completedJob } = await sb
      .from("import_jobs")
      .update({ status: "completed" })
      .eq("id", job!.id)
      .select("id, kind, status, source_name, error_message, created_at, updated_at")
      .single();

    return res.status(201).json({
      job: completedJob ?? job,
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
    if (storageError) {
      await sb
        .from("import_jobs")
        .update({ status: "failed", error_message: storageError.body.error })
        .eq("id", job!.id);
      return res.status(storageError.status).json(storageError.body);
    }

    const message = err instanceof Error ? err.message : "Import failed.";
    await sb
      .from("import_jobs")
      .update({ status: "failed", error_message: message })
      .eq("id", job!.id);
    return res.status(500).json({ error: message });
  }
});

// -- Poll import job status -----------------------------------------------------
importsRouter.get("/:id/status", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: job, error } = await sb
    .from("import_jobs")
    .select("id, kind, status, source_name, error_message, created_at, updated_at")
    .eq("id", req.params.id)
    .eq("owner_user_id", userId)
    .single();

  if (error || !job) return res.status(404).json({ error: "Import job not found." });
  return res.json({ job });
});

// -- List all import jobs for a persona ----------------------------------------
importsRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("import_jobs")
    .select("id, kind, status, source_name, error_message, created_at, updated_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ jobs: data });
});
