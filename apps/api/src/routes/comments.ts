import { Router, Request, Response } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";

const createCommentSchema = z.object({
  parentType: z.enum(["thread", "document", "space_page"]),
  parentId: z.string().uuid(),
  body: z.string().min(1).max(10000),
});

export const commentsRouter = Router();
const sb = getSupabaseAdmin();

// --- Public: list comments by parent ----------------------------------------
commentsRouter.get("/", async (req: Request, res: Response) => {
  const parentType = String(req.query.parentType || "");
  const parentId   = String(req.query.parentId   || "");

  let query = sb
    .from("comments")
    .select(
      `id, body, status, score, created_at, updated_at, parent_type, parent_id, author_user_id,
       author:profiles!author_user_id(username, display_name, avatar_url)`
    )
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (parentType) query = query.eq("parent_type", parentType);
  if (parentId)   query = query.eq("parent_id", parentId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ comments: data ?? [] });
});

// --- Auth-gated below --------------------------------------------------------
commentsRouter.use(requireAuth);

// --- Post a comment (minimum: Basic tier) --------------------------
commentsRouter.post(
  "/",
  requireTier("private"),
  async (req: Request, res: Response) => {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { parentType, parentId, body } = parsed.data;
    const userId = req.user!.id;

    // Validate parent exists and comments are enabled
    if (parentType === "document") {
      const { data: doc } = await sb
        .from("documents")
        .select("id, comments_enabled")
        .eq("id", parentId)
        .single();
      if (!doc) return res.status(404).json({ error: "Document not found" });
      if (!doc.comments_enabled) return res.status(400).json({ error: "Comments are disabled for this document" });
    } else if (parentType === "space_page") {
      const { data: page } = await sb
        .from("space_pages")
        .select("id, comments_enabled")
        .eq("id", parentId)
        .single();
      if (!page) return res.status(404).json({ error: "Page not found" });
      if (!page.comments_enabled) return res.status(400).json({ error: "Comments are disabled for this page" });
    } else if (parentType === "thread") {
      const { data: thread } = await sb
        .from("threads")
        .select("id, status")
        .eq("id", parentId)
        .single();
      if (!thread) return res.status(404).json({ error: "Thread not found" });
      if (thread.status === "locked") return res.status(400).json({ error: "This thread is locked" });
      if (thread.status === "removed") return res.status(404).json({ error: "Thread not found" });
    }

    const { data: comment, error } = await sb
      .from("comments")
      .insert({
        author_user_id: userId,
        parent_type: parentType,
        parent_id: parentId,
        body,
        status: "active",
        score: 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Bump comment_count on thread
    if (parentType === "thread") {
      await sb.rpc("increment_thread_comment_count", { thread_id: parentId }).catch(() => {
        // Non-fatal - comment_count is denormalised, can sync later
      });
    }

    res.status(201).json({ comment });
  }
);

// --- Delete own comment ------------------------------------------------------
commentsRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data: comment, error: findErr } = await sb
    .from("comments")
    .select("id, author_user_id")
    .eq("id", req.params.id)
    .single();

  if (findErr || !comment) return res.status(404).json({ error: "Comment not found" });
  if (comment.author_user_id !== userId && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { error } = await sb
    .from("comments")
    .update({ status: "removed" })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
