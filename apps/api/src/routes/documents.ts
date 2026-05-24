import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";

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
  visibility: z.enum(["private", "public", "members"]).default("public"),
  commentsEnabled: z.boolean().default(true),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const documentsRouter = Router();

// -- Public: read published public documents -----------------------------------
documentsRouter.get("/public/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("documents")
    .select("id, title, slug, body, document_type, published_at, created_at, author_user_id, persona_id, space_id")
    .eq("id", req.params.id)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();

  if (error || !data) return res.status(404).json({ error: "Document not found." });
  return res.json({ document: data });
});

// -- Authenticated routes ------------------------------------------------------
documentsRouter.use(requireAuth);

// GET /documents - list the user's own documents
documentsRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { spaceId } = req.query;

  let query = sb
    .from("documents")
    .select("id, title, slug, document_type, status, visibility, published_at, created_at, updated_at, space_id, persona_id")
    .eq("author_user_id", req.user!.id)
    .order("updated_at", { ascending: false });

  if (spaceId) query = query.eq("space_id", spaceId as string);

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

  // Non-owners can only see published public docs
  if (data.author_user_id !== userId) {
    if (data.status !== "published" || data.visibility !== "public") {
      return res.status(403).json({ error: "Not authorised." });
    }
  }

  return res.json({ document: data });
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
      visibility: parsed.data.visibility,
      comments_enabled: parsed.data.commentsEnabled,
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
  if (parsed.data.visibility !== undefined)     update.visibility = parsed.data.visibility;
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

// POST /documents/:id/publish
documentsRouter.post("/:id/publish", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("documents")
    .update({ status: "published", visibility: "public", published_at: new Date().toISOString() })
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
