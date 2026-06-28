import { Router, Request, Response } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import {
  castCommunityVote,
  isCommunityWitnessKind,
  listCommunityWitnessSummaries,
  listModerationActions,
  listViewerVotes,
  recordModerationAction,
  removeCommunityWitness,
  serializeModerationAction,
  setCommunityWitness,
} from "../services/community.service";
import {
  authorizeSubcommunityModeration,
  viewerModerationSafetyActions,
} from "../services/community-moderation-permissions.service";
import { serializeCommunityThreadWatch } from "../services/community-notifications.service";
import {
  serializeCommentDiscussionProvenance,
  serializeThreadDiscussionProvenance,
  withCommunityAuthorshipProvenance,
} from "../services/community-provenance.service";
import { canReadSubcommunity, loadSubcommunityForCategory } from "../services/community-subcommunities.service";

export const threadsRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);
const LEGACY_PUBLIC_FORUM_CATEGORY_SLUGS = new Set(["general", "documents-and-codexes"]);
const THREAD_ERROR_RESPONSES = {
  detailComments: { error: "Could not load thread comments.", code: "thread_comments_load_failed" },
  watchLoad: { error: "Could not load thread watch.", code: "thread_watch_load_failed" },
  watchUpdate: { error: "Could not update thread watch.", code: "thread_watch_update_failed" },
  witness: { error: "Could not update thread recognition.", code: "thread_witness_update_failed" },
  vote: { error: "Could not vote on thread.", code: "thread_vote_failed" },
  moderation: { error: "Could not update thread moderation.", code: "thread_moderation_update_failed" },
  delete: { error: "Could not delete thread.", code: "thread_delete_failed" },
  subcommunityVisibility: { error: "Could not verify subcommunity visibility.", code: "subcommunity_visibility_check_failed" },
} as const;
const THREAD_DETAIL_COMMENTS_SELECT =
  `id, body, status, score, is_pinned, is_hidden, reported_count, created_at, updated_at, author_user_id,
   authorship_kind, authorship_source_type, authorship_source_id, authorship_persona_id,
   author:profiles!author_user_id(username, display_name, avatar_url)`;
const LEGACY_THREAD_DETAIL_COMMENTS_SELECT =
  `id, body, status, score, is_pinned, is_hidden, reported_count, created_at, updated_at, author_user_id,
   author:profiles!author_user_id(username, display_name, avatar_url)`;

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
  const categorySlug = typeof (thread as any).category?.slug === "string" ? (thread as any).category.slug : null;
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res, categorySlug);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const { data: comments, error: commentErr } = await loadThreadDetailComments(sb, id);

  if (commentErr) return res.status(500).json(THREAD_ERROR_RESPONSES.detailComments);

  const [viewerThreadVotes, viewerCommentVotes, moderationActions, threadWitnesses, commentWitnesses, threadModerationActions, commentModerationActions] = await Promise.all([
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
    listCommunityWitnessSummaries({
      viewerUserId: req.user?.id,
      targetType: "thread",
      targetIds: [thread.id],
    }).catch(() => ({})),
    listCommunityWitnessSummaries({
      viewerUserId: req.user?.id,
      targetType: "comment",
      targetIds: (comments ?? []).map((comment) => comment.id),
    }).catch(() => ({})),
    viewerModerationSafetyActions({
      user: req.user,
      subcommunity,
      targetAuthorUserId: thread.author_user_id,
      target: thread,
    }),
    Promise.all((comments ?? []).map(async (comment) => [
      comment.id,
      await viewerModerationSafetyActions({
        user: req.user,
        subcommunity,
        targetAuthorUserId: comment.author_user_id,
        target: comment,
      }),
    ] as const)).then((entries) => Object.fromEntries(entries)),
  ]);

  res.json({
    thread: {
      ...withCommunityAuthorshipProvenance(thread),
      document: serializeThreadDocumentLink(thread.document),
      viewer_vote: (viewerThreadVotes as Record<string, number>)[thread.id] ?? 0,
      viewer_moderation_actions: threadModerationActions,
      ...(threadWitnesses as Record<string, any>)[thread.id],
      discussion_provenance: serializeThreadDiscussionProvenance(thread),
    },
    comments: (comments ?? []).map((comment) => ({
      ...withCommunityAuthorshipProvenance(comment),
      viewer_vote: (viewerCommentVotes as Record<string, number>)[comment.id] ?? 0,
      viewer_moderation_actions: (commentModerationActions as Record<string, string[]>)[comment.id] ?? [],
      ...(commentWitnesses as Record<string, any>)[comment.id],
      discussion_provenance: serializeCommentDiscussionProvenance(),
    })),
    moderationActions: moderationActions.map(serializeModerationAction),
  });
});

// --- Auth-gated below --------------------------------------------------------
threadsRouter.use(requireAuth);

// --- Current-user thread watch state -----------------------------------------
threadsRouter.get("/:id/watch", async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, status, visibility, is_hidden, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread || !canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const { data, error } = await (sb as any)
    .from("community_thread_watches")
    .select("*")
    .eq("thread_id", thread.id)
    .eq("user_id", req.user!.id)
    .maybeSingle();

  if (error) return res.status(500).json(THREAD_ERROR_RESPONSES.watchLoad);
  return res.json({
    isWatching: Boolean(data && !data.is_muted),
    watch: data ? serializeCommunityThreadWatch(data) : null,
  });
});

threadsRouter.put("/:id/watch", requireTier("private"), async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, status, visibility, is_hidden, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread || !canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const { data, error } = await (sb as any)
    .from("community_thread_watches")
    .upsert(
      {
        user_id: req.user!.id,
        thread_id: thread.id,
        is_muted: false,
      },
      { onConflict: "user_id,thread_id" }
    )
    .select("*")
    .single();

  if (error || !data) return res.status(500).json(THREAD_ERROR_RESPONSES.watchUpdate);
  return res.status(200).json({
    isWatching: true,
    watch: serializeCommunityThreadWatch(data),
  });
});

threadsRouter.delete("/:id/watch", requireTier("private"), async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, status, visibility, is_hidden, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread || !canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const { error } = await (sb as any)
    .from("community_thread_watches")
    .delete()
    .eq("thread_id", thread.id)
    .eq("user_id", req.user!.id);

  if (error) return res.status(500).json(THREAD_ERROR_RESPONSES.watchUpdate);
  return res.json({ isWatching: false, watch: null });
});

threadsRouter.put("/:id/witness/:kind", requireTier("private"), async (req: Request, res: Response) => {
  if (!isCommunityWitnessKind(req.params.kind)) return res.status(400).json({ error: "Unsupported witness kind." });
  const target = await loadReadableThreadForWitness(req.params.id, req.user, res);
  if (!target) return;
  if (target.author_user_id === req.user!.id) {
    return res.status(400).json({ error: "You cannot witness your own contribution." });
  }

  try {
    await setCommunityWitness({
      witnessUserId: req.user!.id,
      targetType: "thread",
      targetId: target.id,
      witnessKind: req.params.kind,
    });
    return res.status(200).json({
      witness: await witnessSummaryFor("thread", target.id, req.user!.id),
    });
  } catch {
    return res.status(500).json(THREAD_ERROR_RESPONSES.witness);
  }
});

threadsRouter.delete("/:id/witness/:kind", requireTier("private"), async (req: Request, res: Response) => {
  if (!isCommunityWitnessKind(req.params.kind)) return res.status(400).json({ error: "Unsupported witness kind." });
  const target = await loadReadableThreadForWitness(req.params.id, req.user, res);
  if (!target) return;
  if (target.author_user_id === req.user!.id) {
    return res.status(400).json({ error: "You cannot witness your own contribution." });
  }

  try {
    await removeCommunityWitness({
      witnessUserId: req.user!.id,
      targetType: "thread",
      targetId: target.id,
      witnessKind: req.params.kind,
    });
    return res.status(200).json({
      witness: await witnessSummaryFor("thread", target.id, req.user!.id),
    });
  } catch {
    return res.status(500).json(THREAD_ERROR_RESPONSES.witness);
  }
});

// --- Vote on a thread --------------------------------------------------------
threadsRouter.post("/:id/vote", requireTier("private"), async (req: Request, res: Response) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, status, visibility, is_hidden, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread || !canReadThread(thread, req.user)) return res.status(404).json({ error: "Thread not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }

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
  } catch {
    return res.status(400).json(THREAD_ERROR_RESPONSES.vote);
  }
});

// --- Moderation actions ------------------------------------------------------
threadsRouter.patch("/:id/moderation", async (req: Request, res: Response) => {
  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, author_user_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const authorization = await authorizeSubcommunityModeration({
    user: req.user!,
    action: parsed.data.action,
    categoryId: thread.category_id,
    targetAuthorUserId: thread.author_user_id,
  });
  if (authorization.ok === false) {
    return res.status(authorization.status).json({ error: authorization.error });
  }

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

  if (error) return res.status(500).json(THREAD_ERROR_RESPONSES.moderation);

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
    .select("id, category_id, author_user_id")
    .eq("id", req.params.id)
    .single();

  if (findErr || !thread) return res.status(404).json({ error: "Thread not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Thread not found" });
  }
  if (thread.author_user_id !== userId && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { error } = await sb
    .from("threads")
    .update({ status: "removed", moderation_state: "removed" } as any)
    .eq("id", req.params.id);

  if (error) return res.status(500).json(THREAD_ERROR_RESPONSES.delete);
  res.json({ ok: true });
});

async function loadSubcommunityForCategoryOrRespond(
  categoryId: string,
  res: Response,
  categorySlug?: string | null
): Promise<{ ok: true; subcommunity: Awaited<ReturnType<typeof loadSubcommunityForCategory>> } | { ok: false }> {
  try {
    return { ok: true, subcommunity: await loadSubcommunityForCategory(categoryId) };
  } catch (error) {
    if (isMissingSubcommunitySchemaError(error)) {
      if (isLegacyPublicForumCategory(categorySlug)) {
        return { ok: true, subcommunity: null };
      }
      res.status(404).json({ error: "Thread not found" });
      return { ok: false };
    }
    res.status(500).json(THREAD_ERROR_RESPONSES.subcommunityVisibility);
    return { ok: false };
  }
}

function isLegacyPublicForumCategory(slug: unknown) {
  return typeof slug === "string" && LEGACY_PUBLIC_FORUM_CATEGORY_SLUGS.has(slug);
}

function isMissingSubcommunitySchemaError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : typeof (error as { message?: unknown } | null)?.message === "string"
        ? String((error as { message?: unknown }).message)
        : "";

  return /community_subcommunities/i.test(message) && /schema cache|could not find|does not exist|relation .* does not exist/i.test(message);
}

async function loadThreadDetailComments(sb: ReturnType<typeof getSupabaseAdmin>, threadId: string) {
  const result = await sb
    .from("comments")
    .select(THREAD_DETAIL_COMMENTS_SELECT)
    .eq("parent_type", "thread")
    .eq("parent_id", threadId)
    .eq("status", "active")
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (!isMissingCommentAuthorshipSchemaError(result.error)) return result;

  const legacy = await sb
    .from("comments")
    .select(LEGACY_THREAD_DETAIL_COMMENTS_SELECT)
    .eq("parent_type", "thread")
    .eq("parent_id", threadId)
    .eq("status", "active")
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  return {
    ...legacy,
    data: (legacy.data ?? []).map(withLegacyCommentAuthorship),
  };
}

function withLegacyCommentAuthorship(row: any) {
  return {
    authorship_kind: "user_authored",
    authorship_source_type: null,
    authorship_source_id: null,
    authorship_persona_id: null,
    ...row,
  };
}

function isMissingCommentAuthorshipSchemaError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : typeof (error as { message?: unknown } | null)?.message === "string"
        ? String((error as { message?: unknown }).message)
        : "";

  return /authorship_(kind|source_type|source_id|persona_id)/i.test(message)
    && /comments|schema cache|column|could not find|does not exist/i.test(message);
}

async function loadReadableThreadForWitness(
  threadId: string,
  user: AuthenticatedUser | undefined,
  res: Response
) {
  const sb = getSupabaseAdmin();
  const { data: thread } = await sb
    .from("threads")
    .select("id, category_id, status, visibility, is_hidden, author_user_id")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread || thread.status === "removed" || thread.is_hidden || !canReadThread(thread, user)) {
    res.status(404).json({ error: "Thread not found" });
    return null;
  }

  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(thread.category_id, res);
  if (!subcommunityLookup.ok) return null;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, user)) {
    res.status(404).json({ error: "Thread not found" });
    return null;
  }

  return thread;
}

async function witnessSummaryFor(targetType: "thread" | "comment", targetId: string, viewerUserId: string) {
  const summaries = await listCommunityWitnessSummaries({
    viewerUserId,
    targetType,
    targetIds: [targetId],
  });
  return summaries[targetId] ?? { witness_counts: { helpful: 0, grounded: 0, careful: 0 }, viewer_witnesses: [] };
}
