import { Router, Request, Response } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";

export const threadsRouter = Router();
const sb = getSupabaseAdmin();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

function canSeeCommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

function canReadThread(thread: any, user?: AuthenticatedUser | null) {
  if (!thread) return false;
  if (thread.author_user_id === user?.id || user?.isAdmin) return thread.status !== "removed";
  if (thread.status === "removed" || thread.is_hidden) return false;
  const visibility = thread.visibility ?? "public";
  if (visibility === "public" || visibility === "unlisted") return true;
  return visibility === "community" && canSeeCommunity(user);
}

// --- Public: get thread + its comments --------------------------------------
threadsRouter.get("/:id", optionalAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: thread, error: threadErr } = await sb
    .from("threads")
    .select(
      `*, author:profiles!author_user_id(username, display_name, avatar_url),
       category:forum_categories!category_id(id, slug, title),
       document:documents!linked_document_id(id, title, space:spaces!space_id(slug))`
    )
    .eq("id", id)
    .single();

  if (threadErr || !thread) return res.status(404).json({ error: "Thread not found" });
  if (!canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });

  const { data: comments, error: commentErr } = await sb
    .from("comments")
    .select(
      `id, body, status, score, is_pinned, is_hidden, reported_count, created_at, updated_at, author_user_id,
       author:profiles!author_user_id(username, display_name, avatar_url)`
    )
    .eq("parent_type", "thread")
    .eq("parent_id", id)
    .eq("status", "active")
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (commentErr) return res.status(500).json({ error: commentErr.message });

  res.json({ thread, comments: comments ?? [] });
});

// --- Auth-gated below --------------------------------------------------------
threadsRouter.use(requireAuth);

// --- Delete own thread -------------------------------------------------------
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
