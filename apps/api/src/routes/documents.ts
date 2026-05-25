import { Router } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";

const visibilitySchema = z.enum(["private", "unlisted", "community", "public", "members"]);
const sourceTypeSchema = z.enum(["canon", "integrity", "archive_file", "archive_import"]);

const createSchema = z.object({
  spaceId: z.string().uuid().optional(),
  personaId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  body: z.string().max(100000).optional(),
  documentType: z
    .enum(["post", "essay", "manifesto", "constitution", "update", "other"])
    .default("post"),
  visibility: visibilitySchema.default("public"),
  commentsEnabled: z.boolean().default(true),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

const publishSchema = z.object({
  visibility: visibilitySchema.optional(),
});

const publishFromContinuitySchema = z.object({
  sourceType: sourceTypeSchema,
  sourceId: z.string().uuid(),
  spaceId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens.")
    .optional(),
  documentType: z
    .enum(["post", "essay", "manifesto", "constitution", "update", "other"])
    .default("essay"),
  visibility: visibilitySchema.default("public"),
  publish: z.boolean().default(true),
  commentsEnabled: z.boolean().default(true),
});

export const documentsRouter = Router();

const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);
const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

function normalizeVisibility(visibility: z.infer<typeof visibilitySchema>) {
  return visibility === "members" ? "community" : visibility;
}

function isCommunityEligible(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

function canReadDocument(document: any, user?: AuthenticatedUser | null) {
  if (document.author_user_id === user?.id || user?.isAdmin) return true;
  if (document.status !== "published") return false;
  if (document.visibility === "public" || document.visibility === "unlisted") return true;
  if (document.visibility === "community" || document.visibility === "members") {
    return isCommunityEligible(user);
  }
  return false;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return slug || "continuity-note";
}

async function uniqueSlug(authorUserId: string, preferred: string) {
  const sb = getSupabaseAdmin();
  const base = slugify(preferred);
  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data } = await sb
      .from("documents")
      .select("id")
      .eq("author_user_id", authorUserId)
      .eq("slug", candidate)
      .single();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function provenanceLabel(value: string) {
  return PROVENANCE_LABELS[value] ?? "Continuity source";
}

function formatContinuityBody(source: LoadedContinuitySource) {
  const header = [
    `Provenance: ${provenanceLabel(source.provenanceType)}`,
    `Source: ${source.sourceLabel}`,
    source.personaName ? `Persona: ${source.personaName}` : null,
  ].filter(Boolean).join("\n");

  return `${header}\n\n${source.body}`.trim();
}

interface LoadedContinuitySource {
  sourceType: "canon" | "integrity" | "archive_file" | "archive_import";
  sourceId: string;
  sourceLabel: string;
  provenanceType: "archive_import" | "integrity_session" | "persona_derived";
  personaId: string;
  personaName: string | null;
  title: string;
  body: string;
}

async function loadOwnedSpace(spaceId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("spaces")
    .select("id, slug, title, owner_user_id")
    .eq("id", spaceId)
    .single();

  return data?.owner_user_id === ownerUserId ? data : null;
}

async function loadPersonaName(personaId: string | null) {
  if (!personaId) return null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("personas")
    .select("id, name")
    .eq("id", personaId)
    .single();
  return data?.name ?? null;
}

async function loadOwnedContinuitySource(
  sourceType: LoadedContinuitySource["sourceType"],
  sourceId: string,
  ownerUserId: string
): Promise<LoadedContinuitySource | null> {
  const sb = getSupabaseAdmin();

  if (sourceType === "canon") {
    const { data } = await sb
      .from("canon_items")
      .select("id, persona_id, title, content, priority, source_type")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .single();
    if (!data) return null;
    const personaName = await loadPersonaName(data.persona_id);
    const title = data.title || "Canon note";
    return {
      sourceType,
      sourceId: data.id,
      sourceLabel: `Canon / priority ${data.priority}`,
      provenanceType: "persona_derived",
      personaId: data.persona_id,
      personaName,
      title,
      body: data.content,
    };
  }

  if (sourceType === "integrity") {
    const { data } = await sb
      .from("calibration_sessions")
      .select("id, persona_id, session_title, transcript, extracted_style_notes, extracted_public_rules, extracted_private_rules, extracted_uncertainty_rules, save_target")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .single();
    if (!data?.persona_id) return null;
    const personaName = await loadPersonaName(data.persona_id);
    const extracted = [
      data.extracted_style_notes && `Style\n${data.extracted_style_notes}`,
      data.extracted_public_rules && `Public rules\n${data.extracted_public_rules}`,
      data.extracted_uncertainty_rules && `Uncertainty rules\n${data.extracted_uncertainty_rules}`,
    ].filter(Boolean).join("\n\n");
    return {
      sourceType,
      sourceId: data.id,
      sourceLabel: `Integrity Session / ${data.save_target}`,
      provenanceType: "integrity_session",
      personaId: data.persona_id,
      personaName,
      title: data.session_title || "Integrity Session notes",
      body: extracted || data.transcript || "No extracted Integrity Session notes yet.",
    };
  }

  if (sourceType === "archive_file") {
    const { data } = await sb
      .from("persona_files")
      .select("id, persona_id, file_name, file_type, file_size, source_type, processed, created_at")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .single();
    if (!data) return null;
    const personaName = await loadPersonaName(data.persona_id);
    return {
      sourceType,
      sourceId: data.id,
      sourceLabel: `Archive file / ${data.source_type}`,
      provenanceType: "archive_import",
      personaId: data.persona_id,
      personaName,
      title: data.file_name,
      body: [
        `Archive file: ${data.file_name}`,
        data.file_type ? `Type: ${data.file_type}` : null,
        data.file_size ? `Size: ${data.file_size} bytes` : null,
        `Processing status: ${data.processed ? "processed" : "queued"}`,
      ].filter(Boolean).join("\n"),
    };
  }

  const { data } = await sb
    .from("import_jobs")
    .select("id, persona_id, kind, status, source_name, error_message, created_at, updated_at")
    .eq("id", sourceId)
    .eq("owner_user_id", ownerUserId)
    .single();
  if (!data) return null;
  const personaName = await loadPersonaName(data.persona_id);
  return {
    sourceType,
    sourceId: data.id,
    sourceLabel: `Archive import / ${data.kind}`,
    provenanceType: "archive_import",
    personaId: data.persona_id,
    personaName,
    title: data.source_name,
    body: [
      `Imported archive source: ${data.source_name}`,
      `Kind: ${data.kind}`,
      `Status: ${data.status}`,
      data.error_message ? `Import note: ${data.error_message}` : "Imported source text remains private; this is a curated public reference.",
    ].join("\n"),
  };
}

// -- Public: read published public documents -----------------------------------
documentsRouter.get("/public/:id", optionalAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("documents")
    .select("id, title, slug, body, document_type, status, visibility, published_at, created_at, author_user_id, persona_id, space_id, provenance_type, source_type, source_id, source_label, source_persona_id")
    .eq("id", req.params.id)
    .single();

  if (error || !data || !canReadDocument(data, req.user)) {
    return res.status(404).json({ error: "Document not found." });
  }
  return res.json({ document: data });
});

// -- Authenticated routes ------------------------------------------------------
documentsRouter.use(requireAuth);

// GET /documents - list the user's own documents
documentsRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { personaId, spaceId } = req.query;

  let query = sb
    .from("documents")
    .select("id, title, slug, document_type, status, visibility, published_at, created_at, updated_at, space_id, persona_id, provenance_type, source_type, source_id, source_label, source_persona_id")
    .eq("author_user_id", req.user!.id)
    .order("updated_at", { ascending: false });

  if (spaceId) query = query.eq("space_id", spaceId as string);
  if (personaId) query = query.eq("persona_id", personaId as string);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ documents: data ?? [] });
});

// GET /documents/:id - get a single document (owner or public)
documentsRouter.get("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("documents")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Document not found." });

  if (!canReadDocument(data, req.user)) {
    return res.status(data.author_user_id === userId ? 404 : 403).json({ error: "Not authorised." });
  }

  return res.json({ document: data, access: data.author_user_id === userId ? "owner" : "reader" });
});

// POST /documents - create a document (creator tier)
documentsRouter.post("/", requireTier("creator"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  // If spaceId provided, verify ownership
  if (parsed.data.spaceId) {
    const { data: space } = await sb
      .from("spaces")
      .select("id, owner_user_id")
      .eq("id", parsed.data.spaceId)
      .single();
    if (!space || space.owner_user_id !== userId) {
      return res.status(403).json({ error: "Space not found or not yours." });
    }
  }

  const { data, error } = await sb
    .from("documents")
    .insert({
      author_user_id: userId,
      space_id: parsed.data.spaceId ?? null,
      persona_id: parsed.data.personaId ?? null,
      title: parsed.data.title,
      slug: parsed.data.slug,
      body: parsed.data.body ?? "",
      document_type: parsed.data.documentType,
      status: "draft",
      visibility: normalizeVisibility(parsed.data.visibility),
      comments_enabled: parsed.data.commentsEnabled,
      provenance_type: "user_authored",
      source_type: "manual",
      source_id: null,
      source_label: "User-authored document",
      source_persona_id: parsed.data.personaId ?? null,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ document: data });
});

// PATCH /documents/:id - update a document
documentsRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined)          update.title = parsed.data.title;
  if (parsed.data.body !== undefined)           update.body = parsed.data.body;
  if (parsed.data.visibility !== undefined)     update.visibility = normalizeVisibility(parsed.data.visibility);
  if (parsed.data.documentType !== undefined)   update.document_type = parsed.data.documentType;
  if (parsed.data.commentsEnabled !== undefined) update.comments_enabled = parsed.data.commentsEnabled;
  if (parsed.data.status !== undefined)         update.status = parsed.data.status;

  const { data, error } = await sb
    .from("documents")
    .update(update)
    .eq("id", req.params.id)
    .eq("author_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Document not found." });
  return res.json({ document: data });
});

// POST /documents/publish-from-continuity
documentsRouter.post("/publish-from-continuity", requireTier("creator"), async (req, res) => {
  const parsed = publishFromContinuitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const space = await loadOwnedSpace(parsed.data.spaceId, userId);
  if (!space) return res.status(404).json({ error: "Space not found." });

  const source = await loadOwnedContinuitySource(parsed.data.sourceType, parsed.data.sourceId, userId);
  if (!source) return res.status(404).json({ error: "Continuity source not found." });

  const title = parsed.data.title?.trim() || source.title;
  const visibility = normalizeVisibility(parsed.data.visibility);
  const status = parsed.data.publish ? "published" : "draft";
  const slug = await uniqueSlug(userId, parsed.data.slug || title);

  const { data, error } = await sb
    .from("documents")
    .insert({
      author_user_id: userId,
      space_id: space.id,
      persona_id: source.personaId,
      title,
      slug,
      body: formatContinuityBody(source),
      document_type: parsed.data.documentType,
      status,
      visibility,
      comments_enabled: parsed.data.commentsEnabled,
      published_at: parsed.data.publish ? new Date().toISOString() : null,
      provenance_type: source.provenanceType,
      source_type: source.sourceType,
      source_id: source.sourceId,
      source_label: source.sourceLabel,
      source_persona_id: source.personaId,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ document: data, space });
});

// POST /documents/:id/publish
documentsRouter.post("/:id/publish", async (req, res) => {
  const parsed = publishSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const update: Record<string, unknown> = {
    status: "published",
    published_at: new Date().toISOString(),
  };
  if (parsed.data.visibility) update.visibility = normalizeVisibility(parsed.data.visibility);

  const { data, error } = await sb
    .from("documents")
    .update(update)
    .eq("id", req.params.id)
    .eq("author_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Document not found." });
  return res.json({ document: data });
});

// DELETE /documents/:id
documentsRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("documents")
    .delete()
    .eq("id", req.params.id)
    .eq("author_user_id", req.user!.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
