import { Router, Request, Response } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import {
  bumpCommunityActivity,
  castCommunityVote,
  isCommunityWitnessKind,
  listCommunityWitnessSummaries,
  listModerationActions,
  recordModerationAction,
  removeCommunityWitness,
  serializeModerationAction,
  setCommunityWitness,
} from "../services/community.service";
import { notifyThreadComment } from "../services/community-notifications.service";
import {
  serializeCommentDiscussionProvenance,
  withCommunityAuthorshipProvenance,
} from "../services/community-provenance.service";
import { canReadSubcommunity, loadSubcommunityForCategory } from "../services/community-subcommunities.service";

const createCommentSchema = z.object({
  parentType: z.enum(["thread", "document", "space_page"]),
  parentId: z.string().uuid(),
  body: z.string().min(1).max(10000),
});
const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});
const moderationSchema = z.object({
  action: z.enum(["pin", "unpin", "hide", "unhide", "remove", "restore"]),
  reason: z.string().max(500).optional(),
});
type CommentParentType = z.infer<typeof createCommentSchema>["parentType"];

function isCommentParentType(value: string): value is CommentParentType {
  return value === "thread" || value === "document" || value === "space_page";
}

export const commentsRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

function canSeeCommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

function canReadDocument(document: any, user?: AuthenticatedUser | null) {
  if (!document) return false;
  if (document.author_user_id === user?.id || user?.isAdmin) return true;
  if (document.status !== "published") return false;
  const visibility = document.visibility ?? "private";
  if (visibility === "public" || visibility === "unlisted") return true;
  return (visibility === "community" || visibility === "members") && canSeeCommunity(user);
}

function canReadThread(thread: any, user?: AuthenticatedUser | null) {
  if (!thread) return false;
  if (thread.author_user_id === user?.id || user?.isAdmin) return thread.status !== "removed";
  if (thread.status === "removed" || thread.is_hidden) return false;
  const visibility = thread.visibility ?? "public";
  if (visibility === "public" || visibility === "unlisted") return true;
  return visibility === "community" && canSeeCommunity(user);
}

function canDiscussDocument(document: any, user?: AuthenticatedUser | null) {
  if (!canReadDocument(document, user)) return false;
  return (
    document.status === "published" &&
    document.comments_enabled !== false &&
    ["public", "community", "members", "unlisted"].includes(document.visibility)
  );
}

async function validateReadableParent(parentType: CommentParentType, parentId: string, user?: AuthenticatedUser | null) {
  const sb = getSupabaseAdmin();

  if (parentType === "thread") {
    const { data: thread } = await sb
      .from("threads")
      .select("id, category_id, status, visibility, is_hidden, author_user_id")
      .eq("id", parentId)
      .single();
    if (!canReadThread(thread, user)) return false;
    try {
      const subcommunity = await loadSubcommunityForCategory(thread.category_id);
      return !subcommunity || canReadSubcommunity(subcommunity, user);
    } catch {
      return false;
    }
  }

  if (parentType === "document") {
    const { data: document } = await sb
      .from("documents")
      .select("id, status, visibility, comments_enabled, author_user_id")
      .eq("id", parentId)
      .single();
    return canDiscussDocument(document, user);
  }

  const { data: page } = await sb
    .from("space_pages")
    .select("id, comments_enabled, is_published, space_id")
    .eq("id", parentId)
    .single();
  if (!page?.comments_enabled) return false;

  const { data: space } = await sb
    .from("spaces")
    .select("id, is_public, owner_user_id")
    .eq("id", page.space_id)
    .single();
  const ownerAccess = space?.owner_user_id === user?.id || user?.isAdmin;
  return Boolean(space && (ownerAccess || (page.is_published && space.is_public)));
}

// --- Public: list comments by parent ----------------------------------------
commentsRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
  const parentType = String(req.query.parentType || "");
  const parentId   = String(req.query.parentId   || "");
  if (!parentType || !parentId || !isCommentParentType(parentType)) {
    return res.json({ comments: [] });
  }

  const canRead = await validateReadableParent(parentType, parentId, req.user);
  if (!canRead) return res.status(404).json({ error: "Comment parent not found" });

  const sb = getSupabaseAdmin();
  let query = sb
    .from("comments")
    .select(
      `id, body, status, score, is_pinned, is_hidden, reported_count, created_at, updated_at, parent_type, parent_id, author_user_id,
       authorship_kind, authorship_source_type, authorship_source_id, authorship_persona_id,
       author:profiles!author_user_id(username, display_name, avatar_url)`
    )
    .eq("status", "active")
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  query = query.eq("parent_type", parentType).eq("parent_id", parentId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  const witnessSummaries = await listCommunityWitnessSummaries({
    viewerUserId: req.user?.id,
    targetType: "comment",
    targetIds: (data ?? []).map((comment) => comment.id),
  }).catch(() => ({}));
  res.json({
    comments: (data ?? []).map((comment) => ({
      ...withCommunityAuthorshipProvenance(comment),
      ...(witnessSummaries as Record<string, any>)[comment.id],
      discussion_provenance: serializeCommentDiscussionProvenance(),
    })),
  });
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
    const sb = getSupabaseAdmin();

    // Validate parent exists and comments are enabled
    if (parentType === "document") {
      const { data: doc } = await sb
        .from("documents")
        .select("id, status, visibility, comments_enabled, author_user_id")
        .eq("id", parentId)
        .single();
      if (!doc) return res.status(404).json({ error: "Document not found" });
      if (!canReadDocument(doc, req.user)) return res.status(404).json({ error: "Document not found" });
      if (["private"].includes(doc.visibility) || doc.status !== "published") {
        return res.status(400).json({ error: "This document cannot be discussed publicly" });
      }
      if (!doc.comments_enabled) return res.status(400).json({ error: "Comments are disabled for this document" });
    } else if (parentType === "space_page") {
      const { data: page } = await sb
        .from("space_pages")
        .select("id, comments_enabled, is_published, space_id")
        .eq("id", parentId)
        .single();
      if (!page) return res.status(404).json({ error: "Page not found" });
      if (!page.comments_enabled) return res.status(400).json({ error: "Comments are disabled for this page" });

      const { data: space } = await sb
        .from("spaces")
        .select("id, is_public, owner_user_id")
        .eq("id", page.space_id)
        .single();
      const ownerAccess = space?.owner_user_id === req.user!.id || req.user!.isAdmin;
      if (!space || (!ownerAccess && (!page.is_published || !space.is_public))) {
        return res.status(404).json({ error: "Page not found" });
      }
    } else if (parentType === "thread") {
      const { data: thread } = await sb
        .from("threads")
        .select("id, category_id, status, visibility, is_hidden, author_user_id")
        .eq("id", parentId)
        .single();
      if (!thread) return res.status(404).json({ error: "Thread not found" });
      if (!canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });
      const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
      if (!subcommunityLookup.ok) return;
      const subcommunity = subcommunityLookup.subcommunity;
      if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
        return res.status(404).json({ error: "Thread not found" });
      }
      if (thread.status === "locked") return res.status(400).json({ error: "This thread is locked" });
      if (thread.status === "removed") return res.status(404).json({ error: "Thread not found" });
    }

    const { data: comment, error } = await sb
      .from("comments")
      .insert({
        author_user_id: userId,
        parent_type: parentType,
        parent_id: parentId,
        authorship_kind: "user_authored",
        authorship_source_type: null,
        authorship_source_id: null,
        authorship_persona_id: null,
        body,
        status: "active",
        is_pinned: false,
        is_hidden: false,
        reported_count: 0,
        score: 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    await bumpCommunityActivity(userId, "comment").catch(() => undefined);

    // Bump comment_count on thread
    if (parentType === "thread") {
      try {
        await sb.rpc("increment_thread_comment_count", { thread_id: parentId });
      } catch {
        // Non-fatal - comment_count is denormalised, can sync later
      }
      await notifyThreadComment({
        threadId: parentId,
        commentId: comment.id,
        commenterUserId: userId,
      }).catch(() => undefined);
    }

    res.status(201).json({
      comment: {
        ...withCommunityAuthorshipProvenance(comment),
        witness_counts: { helpful: 0, grounded: 0, careful: 0 },
        viewer_witnesses: [],
        discussion_provenance: serializeCommentDiscussionProvenance(),
      },
    });
  }
);

commentsRouter.put("/:id/witness/:kind", requireTier("private"), async (req: Request, res: Response) => {
  if (!isCommunityWitnessKind(req.params.kind)) return res.status(400).json({ error: "Unsupported witness kind." });
  const target = await loadReadableCommentForWitness(req.params.id, req.user, res);
  if (!target) return;
  if (target.author_user_id === req.user!.id) {
    return res.status(400).json({ error: "You cannot witness your own contribution." });
  }

  await setCommunityWitness({
    witnessUserId: req.user!.id,
    targetType: "comment",
    targetId: target.id,
    witnessKind: req.params.kind,
  });
  return res.status(200).json({
    witness: await witnessSummaryFor("comment", target.id, req.user!.id),
  });
});

commentsRouter.delete("/:id/witness/:kind", requireTier("private"), async (req: Request, res: Response) => {
  if (!isCommunityWitnessKind(req.params.kind)) return res.status(400).json({ error: "Unsupported witness kind." });
  const target = await loadReadableCommentForWitness(req.params.id, req.user, res);
  if (!target) return;
  if (target.author_user_id === req.user!.id) {
    return res.status(400).json({ error: "You cannot witness your own contribution." });
  }

  await removeCommunityWitness({
    witnessUserId: req.user!.id,
    targetType: "comment",
    targetId: target.id,
    witnessKind: req.params.kind,
  });
  return res.status(200).json({
    witness: await witnessSummaryFor("comment", target.id, req.user!.id),
  });
});

// --- Vote on a comment -------------------------------------------------------
commentsRouter.post("/:id/vote", requireTier("private"), async (req: Request, res: Response) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: comment } = await sb
    .from("comments")
    .select("id, author_user_id, parent_type, parent_id, status, is_hidden")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!comment || comment.status !== "active" || comment.is_hidden) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const canRead = await validateReadableParent(comment.parent_type as CommentParentType, comment.parent_id, req.user);
  if (!canRead) return res.status(404).json({ error: "Comment not found" });

  try {
    const vote = await castCommunityVote({
      voterUserId: req.user!.id,
      targetType: "comment",
      targetId: comment.id,
      value: parsed.data.value,
    });
    const { data: updated } = await sb
      .from("comments")
      .select("id, score, vote_count")
      .eq("id", comment.id)
      .single();

    return res.status(201).json({ vote, comment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not vote on comment.";
    return res.status(400).json({ error: message });
  }
});

// --- Admin moderation action readback ---------------------------------------
commentsRouter.get("/:id/moderation-actions", async (req: Request, res: Response) => {
  if (!req.user!.isAdmin) return res.status(403).json({ error: "Admin access required." });

  const sb = getSupabaseAdmin();
  const { data: comment } = await sb
    .from("comments")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  const actions = await listModerationActions("comment", comment.id).catch(() => []);
  return res.json({ moderationActions: actions.map(serializeModerationAction) });
});

// --- Admin comment moderation ------------------------------------------------
commentsRouter.patch("/:id/moderation", async (req: Request, res: Response) => {
  if (!req.user!.isAdmin) return res.status(403).json({ error: "Admin access required." });

  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: comment } = await sb
    .from("comments")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  const update: Record<string, unknown> = {};
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
    .from("comments")
    .update(update)
    .eq("id", comment.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const action = await recordModerationAction({
    moderatorUserId: req.user!.id,
    targetType: "comment",
    targetId: comment.id,
    actionType: parsed.data.action,
    reason: parsed.data.reason,
  }).catch(() => null);

  return res.json({
    comment: updated,
    moderationAction: action ? serializeModerationAction(action) : null,
  });
});

// --- Delete own comment ------------------------------------------------------
commentsRouter.delete("/:id", async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const sb = getSupabaseAdmin();

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
    .update({ status: "removed", moderation_state: "removed" } as any)
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

async function loadSubcommunityForCategoryOrRespond(
  categoryId: string,
  res: Response
): Promise<{ ok: true; subcommunity: Awaited<ReturnType<typeof loadSubcommunityForCategory>> } | { ok: false }> {
  try {
    return { ok: true, subcommunity: await loadSubcommunityForCategory(categoryId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify subcommunity visibility.";
    res.status(500).json({ error: message });
    return { ok: false };
  }
}

async function loadReadableCommentForWitness(
  commentId: string,
  user: AuthenticatedUser | undefined,
  res: Response
) {
  const sb = getSupabaseAdmin();
  const { data: comment } = await sb
    .from("comments")
    .select("id, author_user_id, parent_type, parent_id, status, is_hidden")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment || comment.status !== "active" || comment.is_hidden) {
    res.status(404).json({ error: "Comment not found" });
    return null;
  }

  const canRead = await validateReadableParent(comment.parent_type as CommentParentType, comment.parent_id, user);
  if (!canRead) {
    res.status(404).json({ error: "Comment not found" });
    return null;
  }

  return comment;
}

async function witnessSummaryFor(targetType: "thread" | "comment", targetId: string, viewerUserId: string) {
  const summaries = await listCommunityWitnessSummaries({
    viewerUserId,
    targetType,
    targetIds: [targetId],
  });
  return summaries[targetId] ?? { witness_counts: { helpful: 0, grounded: 0, careful: 0 }, viewer_witnesses: [] };
}
