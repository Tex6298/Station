import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { processUploadedFile } from "../services/archive.service";
import { releaseStorageBytes, reserveStorageBytes, storageErrorResponse } from "../services/storage.service";

/**
 * File upload flow:
 * 1. Client calls GET /persona-files/persona/:id/upload-url to get a signed upload URL
 * 2. Client uploads file directly to Supabase Storage using that URL
 * 3. Client calls POST /persona-files/persona/:id/register to record the file and trigger processing
 */

const registerSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().optional(),
  fileSize: z.number().int().positive(),
  storagePath: z.string().min(1),
  sourceType: z.enum(["upload", "import", "calibration", "generated"]).default("upload"),
  processImmediately: z.boolean().default(true),
});

export const personaFilesRouter = Router();
personaFilesRouter.use(requireAuth);

// -- List files for a persona --------------------------------------------------
personaFilesRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("persona_files")
    .select("id, persona_id, file_name, file_type, file_size, storage_path, source_type, processed, created_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ files: data });
});

// -- Get a signed upload URL (client uploads directly to Storage) --------------
personaFilesRouter.get("/persona/:personaId/upload-url", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { fileName } = req.query;
  const fileSize = Number(req.query.fileSize);

  if (!fileName || typeof fileName !== "string") {
    return res.status(400).json({ error: "fileName query param required." });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return res.status(400).json({ error: "fileSize query param required." });
  }

  // Verify persona ownership
  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .single();

  if (!persona || persona.owner_user_id !== userId) {
    return res.status(404).json({ error: "Persona not found." });
  }

  try {
    await reserveStorageBytes(userId, fileSize);
    await releaseStorageBytes(userId, fileSize);
  } catch (error) {
    const storageError = storageErrorResponse(error);
    if (storageError) return res.status(storageError.status).json(storageError.body);
    throw error;
  }

  const storagePath = `${userId}/${persona.id}/${Date.now()}_${fileName}`;

  const { data, error } = await sb.storage
    .from("persona-files")
    .createSignedUploadUrl(storagePath);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ uploadUrl: data.signedUrl, storagePath, token: data.token });
});

// -- Register a file after upload + optionally trigger processing --------------
personaFilesRouter.post("/persona/:personaId/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .single();

  if (!persona || persona.owner_user_id !== userId) {
    return res.status(404).json({ error: "Persona not found." });
  }

  const existingFile = await loadRegisteredFileByStoragePath(
    persona.id,
    userId,
    parsed.data.storagePath
  );
  if (existingFile) {
    let jobState: Awaited<ReturnType<typeof loadOrRepairFileImportJob>>;
    try {
      jobState = await loadOrRepairFileImportJob({
        personaId: persona.id,
        ownerUserId: userId,
        sourceName: existingFile.file_name,
      });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Import job repair failed." });
    }

    return res.json({
      file: existingFile,
      job: jobState.job,
      duplicate: true,
      idempotent: true,
      repaired: jobState.repaired,
      importJobAmbiguous: jobState.ambiguous,
    });
  }

  try {
    await reserveStorageBytes(userId, parsed.data.fileSize);
  } catch (error) {
    const storageError = storageErrorResponse(error);
    if (storageError) {
      return res.status(storageError.status).json(storageError.body);
    }
    throw error;
  }

  let storageReserved = true;
  let insertedFile: { id: string; storage_path?: string | null } | null = null;

  try {
    // Insert file record
    const { data: file, error: fileErr } = await sb
      .from("persona_files")
      .insert({
        persona_id: persona.id,
        owner_user_id: userId,
        file_name: parsed.data.fileName,
        file_type: parsed.data.fileType ?? null,
        file_size: parsed.data.fileSize,
        storage_path: parsed.data.storagePath,
        source_type: parsed.data.sourceType,
        processed: false,
      })
      .select("*")
      .single();

    if (fileErr || !file) throw new Error(fileErr?.message ?? "File insert failed.");
    insertedFile = file;

    // Create import job
    const { data: job, error: jobErr } = await sb
      .from("import_jobs")
      .insert({
        persona_id: persona.id,
        owner_user_id: userId,
        kind: "file",
        status: "queued",
        source_name: parsed.data.fileName,
      })
      .select("id, status")
      .single();

    if (jobErr || !job) throw new Error(jobErr?.message ?? "Import job insert failed.");

    // Process synchronously for now (queue in v2)
    if (parsed.data.processImmediately) {
      processUploadedFile({
        personaId: persona.id,
        ownerUserId: userId,
        fileId: file.id,
        fileName: parsed.data.fileName,
        fileType: parsed.data.fileType ?? null,
        storagePath: parsed.data.storagePath,
      }).catch(console.error); // fire and forget
    }

    return res.status(201).json({ file, job });
  } catch (error) {
    if (insertedFile?.id) {
      try {
        await sb.from("persona_files").delete().eq("id", insertedFile.id);
      } catch {
        // Best-effort cleanup after a failed registration.
      }
    }
    if (insertedFile?.storage_path) {
      try {
        await sb.storage.from("persona-files").remove([insertedFile.storage_path]);
      } catch {
        // Best-effort cleanup after a failed registration.
      }
    }
    if (storageReserved) await releaseStorageBytes(userId, parsed.data.fileSize).catch(() => null);
    const storageError = storageErrorResponse(error);
    if (storageError) return res.status(storageError.status).json(storageError.body);
    return res.status(500).json({ error: error instanceof Error ? error.message : "File insert failed." });
  }
});

// -- Delete a file (removes from storage + DB) ---------------------------------
personaFilesRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: file } = await sb
    .from("persona_files")
    .select("id, storage_path, owner_user_id, file_size")
    .eq("id", req.params.id)
    .single();

  if (!file || file.owner_user_id !== userId) {
    return res.status(404).json({ error: "File not found." });
  }

  // Remove from Storage
  await sb.storage.from("persona-files").remove([file.storage_path]);

  // Remove DB record
  await sb.from("persona_files").delete().eq("id", file.id);

  if (file.file_size) {
    await releaseStorageBytes(userId, file.file_size).catch(() => null);
  }

  return res.status(204).send();
});

async function loadRegisteredFileByStoragePath(
  personaId: string,
  ownerUserId: string,
  storagePath: string
) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("persona_files")
    .select("id, persona_id, owner_user_id, file_name, file_type, file_size, storage_path, source_type, processed, created_at")
    .eq("persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .eq("storage_path", storagePath)
    .limit(1);

  if (error) return null;
  return data?.[0] ?? null;
}

async function loadOrRepairFileImportJob(input: {
  personaId: string;
  ownerUserId: string;
  sourceName: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("import_jobs")
    .select("id, status")
    .eq("persona_id", input.personaId)
    .eq("owner_user_id", input.ownerUserId)
    .eq("kind", "file")
    .eq("source_name", input.sourceName)
    .order("created_at", { ascending: false });

  if (!error && data?.length === 1) {
    return { job: data[0], repaired: false, ambiguous: false };
  }

  if (!error && data && data.length > 1) {
    return { job: null, repaired: false, ambiguous: true };
  }

  const { data: job, error: jobErr } = await sb
    .from("import_jobs")
    .insert({
      persona_id: input.personaId,
      owner_user_id: input.ownerUserId,
      kind: "file",
      status: "queued",
      source_name: input.sourceName,
    })
    .select("id, status")
    .single();

  if (jobErr || !job) throw new Error(jobErr?.message ?? "Import job repair failed.");
  return { job, repaired: true, ambiguous: false };
}
