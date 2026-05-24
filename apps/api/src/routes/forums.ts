import { Router, Request, Response } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";

const createThreadSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(50000),
  linkedSpaceId: z.string().uuid().optional().nullable(),
  linkedPersonaId: z.string().uuid().optional().nullable(),
});

export const forumsRouter = Router();
const sb = getSupabaseAdmin();

// --- Public: list all categories --------------------------------------------
forumsRouter.get("/categories", async (_req: Request, res: Response) => {
  const { data, error } = await sb
    .from("forum_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories: data ?? [] });
});

// --- Public: get category + its threads -------------------------------------
forumsRouter.get("/categories/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const { data: category, error: catErr } = await sb
    .from("forum_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (catErr || !category) return res.status(404).json({ error: "Category not found" });

  const { data: threads, error: threadErr } = await sb
    .from("threads")
    .select(
      `id, title, body, status, score, comment_count, created_at, updated_at,
       author_user_id,
       author:profiles!author_user_id(username, display_name, avatar_url)`
    )
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (threadErr) return res.status(500).json({ error: threadErr.message });

  res.json({ category, threads: threads ?? [] });
});

// --- Auth-gated below --------------------------------------------------------
forumsRouter.use(requireAuth);

// --- Create thread (minimum: Basic tier) ---------------------------
forumsRouter.post(
  "/threads",
  requireTier("private"),
  async (req: Request, res: Response) => {
    const parsed = createThreadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const userId = req.user!.id;

    // Verify category exists
    const { data: category, error: catErr } = await sb
      .from("forum_categories")
      .select("id")
      .eq("id", parsed.data.categoryId)
      .single();

    if (catErr || !category) return res.status(404).json({ error: "Category not found" });

    const { data: thread, error } = await sb
      .from("threads")
      .insert({
        category_id: parsed.data.categoryId,
        author_user_id: userId,
        title: parsed.data.title,
        body: parsed.data.body,
        linked_space_id: parsed.data.linkedSpaceId ?? null,
        linked_persona_id: parsed.data.linkedPersonaId ?? null,
        status: "active",
        score: 0,
        comment_count: 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ thread });
  }
);
