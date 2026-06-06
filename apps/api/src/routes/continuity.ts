import { Router } from "express";
import { z } from "zod";
import type { ContinuityRecord } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

const recordTypeSchema = z.enum([
  "memory",
  "canon",
  "integrity",
  "archive_file",
  "archive_import",
  "archived_chat",
  "candidate",
  "publication",
  "timeline",
]);

const visibilitySchema = z.enum(["private", "community", "public"]);

const sourceTableSchema = z.enum([
  "documents",
  "conversations",
  "memory_items",
  "canon_items",
  "persona_files",
  "import_jobs",
  "archived_chat_transcripts",
  "continuity_candidates",
  "calibration_sessions",
  "integrity_sessions",
]);

const sourceSchema = z.object({
  table: sourceTableSchema,
  id: z.string().uuid(),
  label: z.string().max(200).optional(),
  version: z.number().int().min(1).optional(),
});

const createRecordSchema = z.object({
  recordType: recordTypeSchema.default("timeline"),
  title: z.string().max(200).optional(),
  body: z.string().max(20000).optional(),
  summary: z.string().max(1000).optional(),
  source: sourceSchema.optional(),
  visibility: visibilitySchema.default("private"),
  version: z.number().int().min(1).default(1),
  metadata: z.record(z.unknown()).default({}),
  occurredAt: z.string().datetime().optional(),
}).refine(
  (value) => Boolean(value.title?.trim() || value.body?.trim() || value.summary?.trim()),
  { message: "At least one of title, body, or summary is required." },
);

const listRecordsSchema = z.object({
  recordType: recordTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const continuityRouter = Router();

continuityRouter.use(requireAuth);

function serializeContinuityRecord(row: any): ContinuityRecord {
  const source = row.source_table
    ? {
      table: row.source_table,
      id: row.source_id,
      label: row.source_label,
      version: row.source_version ?? 1,
    }
    : null;

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    recordType: row.record_type,
    title: row.title,
    body: row.body,
    summary: row.summary,
    source,
    sourceTable: row.source_table,
    sourceId: row.source_id,
    sourceLabel: row.source_label,
    sourceVersion: row.source_version ?? 1,
    visibility: row.visibility,
    version: row.version,
    metadata: row.metadata ?? {},
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadOwnedPersona(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", personaId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error || !data) return null;
  return data;
}

function sourceLabelFor(row: any, table: z.infer<typeof sourceTableSchema>) {
  if (table === "documents") return row.source_label || `Document / ${row.title}`;
  if (table === "conversations") {
    return row.status === "archived"
      ? `Archived conversation / ${row.message_count ?? 0} messages`
      : "Active conversation";
  }
  if (table === "memory_items") return `Memory / ${row.title || "Untitled"}`;
  if (table === "canon_items") return `Canon / priority ${row.priority ?? 1}`;
  if (table === "persona_files") return `Archive file / ${row.source_type ?? "upload"}`;
  if (table === "import_jobs") return `Archive import / ${row.kind ?? "import"}`;
  if (table === "archived_chat_transcripts") return `Archived conversation / ${row.message_count ?? 0} messages`;
  if (table === "continuity_candidates") return `Continuity candidate / ${row.candidate_type ?? "candidate"}`;
  if (table === "integrity_sessions") return `Integrity Session / ${row.session_type ?? "manual"}`;
  return `Integrity Session / ${row.save_target ?? "persona"}`;
}

async function loadOwnedSourceRef(
  source: z.infer<typeof sourceSchema>,
  personaId: string,
  ownerUserId: string
) {
  const sb = getSupabaseAdmin();

  if (source.table === "documents") {
    const { data } = await (sb as any)
      .from("documents")
      .select("id, title, author_user_id, persona_id, source_persona_id, source_label")
      .eq("id", source.id)
      .eq("author_user_id", ownerUserId)
      .single();

    if (!data || (data.persona_id !== personaId && data.source_persona_id !== personaId)) return null;
    return {
      table: source.table,
      id: data.id,
      label: sourceLabelFor(data, source.table),
      version: source.version ?? 1,
    };
  }

  const tableConfig: Record<Exclude<z.infer<typeof sourceTableSchema>, "documents">, { ownerColumn: string; personaColumn: string | null }> = {
    conversations: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    memory_items: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    canon_items: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    persona_files: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    import_jobs: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    archived_chat_transcripts: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    continuity_candidates: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    calibration_sessions: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
    integrity_sessions: { ownerColumn: "owner_user_id", personaColumn: "persona_id" },
  };
  const config = tableConfig[source.table];
  const { data } = await (sb as any)
    .from(source.table)
    .select("*")
    .eq("id", source.id)
    .eq(config.ownerColumn, ownerUserId)
    .single();

  if (!data) return null;
  if (config.personaColumn && data[config.personaColumn] && data[config.personaColumn] !== personaId) return null;

  return {
    table: source.table,
    id: data.id,
    label: sourceLabelFor(data, source.table),
    version: source.version ?? 1,
  };
}

// -- List owner-scoped continuity timeline records for a persona --------------
continuityRouter.get("/persona/:personaId/records", async (req, res) => {
  const parsed = listRecordsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const persona = await loadOwnedPersona(req.params.personaId, ownerUserId);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("continuity_records")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("persona_id", persona.id)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.recordType) {
    query = query.eq("record_type", parsed.data.recordType);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ records: (data ?? []).map(serializeContinuityRecord) });
});

// -- Create a first-class continuity timeline record --------------------------
continuityRouter.post("/persona/:personaId/records", async (req, res) => {
  const parsed = createRecordSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const persona = await loadOwnedPersona(req.params.personaId, ownerUserId);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const source = parsed.data.source
    ? await loadOwnedSourceRef(parsed.data.source, persona.id, ownerUserId)
    : null;
  if (parsed.data.source && !source) {
    return res.status(404).json({ error: "Continuity source not found." });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("continuity_records")
    .insert({
      owner_user_id: ownerUserId,
      persona_id: persona.id,
      record_type: parsed.data.recordType,
      title: parsed.data.title?.trim() || null,
      body: parsed.data.body?.trim() || null,
      summary: parsed.data.summary?.trim() || null,
      source_table: source?.table ?? null,
      source_id: source?.id ?? null,
      source_label: source?.label ?? null,
      source_version: source?.version ?? 1,
      visibility: parsed.data.visibility,
      version: parsed.data.version,
      metadata: parsed.data.metadata,
      occurred_at: parsed.data.occurredAt ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return res.status(500).json({ error: error?.message ?? "Could not create continuity record." });
  }

  return res.status(201).json({ record: serializeContinuityRecord(data) });
});

// -- Read one owner-scoped continuity record ----------------------------------
continuityRouter.get("/records/:recordId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("continuity_records")
    .select("*")
    .eq("id", req.params.recordId)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Continuity record not found." });
  return res.json({ record: serializeContinuityRecord(data) });
});
