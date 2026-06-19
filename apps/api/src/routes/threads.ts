import { Router, Request, Response } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import {
  castCommunityVote,
  listModerationActions,
  listViewerVotes,
  recordModerationAction,
  serializeModerationAction,
} from "../services/community.service";
import {
  serializeCommentDiscussionProvenance,
  serializeThreadDiscussionProvenance,
} from "../services/community-provenance.service";

export const threadsRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

const moderationSchema = z.object({
  action: z.enum(["lock", "unlock", "pin", "unpin", "hide", "unhide", "remove", "restore"]),
  reason: z.string().max(500).optional(),
});

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

function serializeThreadDocumentLink(document: any) {
  if (!document) return document;
  return {
    id: document.id,
    title: document.title,
    space: document.space ?? null,
  };
}

// --- Public: get thread + its comments --------------------------------------
threadsRouter.get("/:id", optionalAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const sb = getSupabaseAdmin();

  const { data: thread, error: threadErr } = await sb
    .from("threads")
    .select(
      `*, author:profiles!author_user_id(username, display_name, avatar_url),
       category:forum_categories!category_id(id, slug, title),
       document:documents!linked_document_id(id, title, provenance_type, source_type, source_persona_id, space:spaces!space_id(slug))`
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

  const [viewerThreadVotes, viewerCommentVotes, moderationActions] = await Promise.all([
    listViewerVotes({
      voterUserId: req.user?.id,
      targetType: "thread",
      targetIds: [thread.id],
    }).catch(() => ({})),
    listViewerVotes({
      voterUserId: req.user?.id,
      targetType: "comment",
      targetIds: (comments ?? []).map((comment) => comment.id),
    }).catch(() => ({})),
    req.user?.isAdmin
      ? listModerationActions("thread", thread.id).catch(() => [])
      : Promise.resolve([]),
  ]);

  res.json({
    thread: {
      ...thread,
      document: serializeThreadDocumentLink(thread.document),
      viewer_vote: (viewerThreadVotes as Record<string, number>)[thread.id] ?? 0,
      discussion_provenance: serializeThreadDiscussionProvenance(thread),
    },
    comments: (comments ?? []).map((comment) => ({
      ...comment,
      viewer_vote: (viewerCommentVotes as Record<string, number>)[comment.id] ?? 0,
      discussion_provenance: serializeCommentDiscussionProvenance(),
    })),
    moderationActions: moderationActions.map(serializeModerationAction),
  });
});

// --- Auth-gated below --------------------------------------------------------
threadsRouter.use(requireAuth);

// --- Vote on a thread --------------------------------------------------------
threadsRouter.post("/:id/vote", async (req: Request, res: Response) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, status, visibility, is_hidden, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread || !canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });

  try {
    const vote = await castCommunityVote({
      voterUserId: req.user!.id,
      targetType: "thread",
      targetId: thread.id,
      value: parsed.data.value,
    });
    const { data: updated } = await sb
      .from("threads")
      .select("id, score, vote_count, hot_score")
      .eq("id", thread.id)
      .single();

    return res.status(201).json({ vote, thread: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not vote on thread.";
    return res.status(400).json({ error: message });
  }
});

// --- Admin moderation actions ------------------------------------------------
threadsRouter.patch("/:id/moderation", async (req: Request, res: Response) => {
  if (!req.user!.isAdmin) return res.status(403).json({ error: "Admin access required." });

  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const update: Record<string, unknown> = {};
  if (parsed.data.action === "lock") update.status = "locked";
  if (parsed.data.action === "unlock") update.status = "active";
  if (parsed.data.action === "pin") update.is_pinned = true;
  if (parsed.data.action === "unpin") update.is_pinned = false;
  if (parsed.data.action === "hide") {
    update.is_hidden = true;
    update.moderation_state = "hidden";
  }
  if (parsed.data.action === "unhide") {
    update.is_hidden = false;
    update.moderation_state = "normal";
  }
  if (parsed.data.action === "remove") {
    update.status = "removed";
    update.moderation_state = "removed";
  }
  if (parsed.data.action === "restore") {
    update.status = "active";
    update.is_hidden = false;
    update.moderation_state = "normal";
  }

  const { data: updated, error } = await sb
    .from("threads")
    .update(update)
    .eq("id", thread.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const action = await recordModerationAction({
    moderatorUserId: req.user!.id,
    targetType: "thread",
    targetId: thread.id,
    actionType: parsed.data.action,
    reason: parsed.data.reason,
  }).catch(() => null);

  return res.json({
    thread: updated,
    moderationAction: action ? serializeModerationAction(action) : null,
  });
});

// --- Delete own thread -------------------------------------------------------
threadsRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const sb = getSupabaseAdmin();

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
    .update({ status: "removed", moderation_state: "removed" } as any)
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
