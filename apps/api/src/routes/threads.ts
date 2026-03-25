import { Router, Request, Response } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

export const threadsRouter = Router();
const sb = getSupabaseAdmin();

// ─── Public: get thread + its comments ──────────────────────────────────────
threadsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: thread, error: threadErr } = await sb
    .from("threads")
    .select(
      `*, author:profiles!author_user_id(username, display_name, avatar_url),
       category:forum_categories!category_id(id, slug, title)`
    )
    .eq("id", id)
    .single();

  if (threadErr || !thread) return res.status(404).json({ error: "Thread not found" });
  if (thread.status === "removed") return res.status(404).json({ error: "Thread not found" });

  const { data: comments, error: commentErr } = await sb
    .from("comments")
    .select(
      `id, body, status, score, created_at, updated_at, author_user_id,
       author:profiles!author_user_id(username, display_name, avatar_url)`
    )
    .eq("parent_type", "thread")
    .eq("parent_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (commentErr) return res.status(500).json({ error: commentErr.message });

  res.json({ thread, comments: comments ?? [] });
});

// ─── Auth-gated below ────────────────────────────────────────────────────────
threadsRouter.use(requireAuth);

// ─── Delete own thread ───────────────────────────────────────────────────────
threadsRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data: thread, error: findErr } = await sb
    .from("threads")
    .select("id, author_user_id")
    .eq("id", req.params.id)
    .single();

  if (findErr || !thread) return res.status(404).json({ error: "Thread not found" });
  if (thread.author_user_id !== userId && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { error } = await sb
    .from("threads")
    .update({ status: "removed" })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
