import { Router, Request, Response } from "express";
import { z } from "zod";
import type { ThreadVisibility } from "@station/db";
import type {
  CommunityModerationSafetyAction,
  DelegatedModerationReportRecord,
  ModerationReportTargetContext,
} from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import {
  bumpCommunityActivity,
  ensureCommunityProfile,
  listCommunityWitnessSummaries,
  listViewerVotes,
  serializeCommunityProfile,
} from "../services/community.service";
import {
  serializeThreadDiscussionProvenance,
  withCommunityAuthorshipProvenance,
} from "../services/community-provenance.service";
import {
  canCreateSubcommunity,
  canListSubcommunity,
  canManageSubcommunityModerators,
  canModerateSubcommunity,
  canReadSubcommunity,
  assignSubcommunityModerator,
  loadSubcommunityForCategory,
  loadSubcommunityModerators,
  revokeSubcommunityModerator,
  serializeSubcommunity,
} from "../services/community-subcommunities.service";

const createThreadSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(50000),
  linkedSpaceId: z.string().uuid().optional().nullable(),
  linkedPersonaId: z.string().uuid().optional().nullable(),
  linkedDocumentId: z.string().uuid().optional().nullable(),
});
const createSubcommunitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(80),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["canon", "developer"]),
  visibility: z.enum(["public", "community"]).default("public"),
  linkedSpaceId: z.string().uuid().optional().nullable(),
  linkedDeveloperSpaceId: z.string().uuid().optional().nullable(),
});
const moderatorAssignmentSchema = z.object({
  userId: z.string().min(1),
});
const delegatedReportQueueQuerySchema = z.object({
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
const DELEGATED_REPORT_PREFETCH_LIMIT = 500;

export const forumsRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

function canSeeCommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

function listableThreadVisibilities(user?: AuthenticatedUser | null): ThreadVisibility[] {
  return canSeeCommunity(user)
    ? ["public", "community"]
    : ["public"];
}

function canReadLinkedDocument(document: any, user?: AuthenticatedUser | null) {
  if (!document) return false;
  if (document.author_user_id === user?.id || user?.isAdmin) return true;
  if (document.status !== "published") return false;
  const visibility = document.visibility ?? "private";
  if (visibility === "public" || visibility === "unlisted") return true;
  return (visibility === "community" || visibility === "members") && canSeeCommunity(user);
}

function threadVisibilityForDocument(document: any): ThreadVisibility {
  if (document.visibility === "community" || document.visibility === "members") return "community";
  if (document.visibility === "unlisted") return "unlisted";
  return "public";
}

async function validateThreadLinks(
  input: z.infer<typeof createThreadSchema>,
  user: AuthenticatedUser
): Promise<
  | { ok: true; visibility: ThreadVisibility }
  | { ok: false; status: number; error: string }
> {
  const sb = getSupabaseAdmin();
  let visibility: ThreadVisibility = "public";

  if (input.linkedDocumentId) {
    const { data: document } = await sb
      .from("documents")
      .select("id, status, visibility, comments_enabled, author_user_id")
      .eq("id", input.linkedDocumentId)
      .single();

    if (!document || !canReadLinkedDocument(document, user)) {
      return { ok: false, status: 404, error: "Linked document not found" };
    }

    if (
      document.status !== "published" ||
      document.comments_enabled === false ||
      document.visibility === "private"
    ) {
      return { ok: false, status: 400, error: "Linked document cannot be discussed publicly." };
    }

    visibility = threadVisibilityForDocument(document);
  }

  if (input.linkedSpaceId) {
    const { data: space } = await sb
      .from("spaces")
      .select("id, is_public")
      .eq("id", input.linkedSpaceId)
      .single();

    if (!space) return { ok: false, status: 404, error: "Linked Space not found" };
    if (!space.is_public) {
      return { ok: false, status: 400, error: "Linked Space must be public." };
    }
  }

  if (input.linkedPersonaId) {
    const { data: persona } = await sb
      .from("personas")
      .select("id, visibility")
      .eq("id", input.linkedPersonaId)
      .single();

    if (!persona) return { ok: false, status: 404, error: "Linked persona not found" };
    if (persona.visibility !== "public") {
      return { ok: false, status: 400, error: "Linked persona must be public." };
    }
  }

  return { ok: true, visibility };
}

// --- Public: list all categories --------------------------------------------
forumsRouter.get("/categories", optionalAuth, async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("forum_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data: subcommunities, error: subcommunityError } = await (sb as any)
    .from("community_subcommunities")
    .select("*");
  if (subcommunityError) return res.status(500).json({ error: subcommunityError.message });
  const subByCategory = new Map<string, any>((subcommunities ?? []).map((row: any) => [row.category_id, row]));
  const categories = (data ?? [])
    .map((category: any) => {
      const subcommunity = subByCategory.get(category.id);
      if (subcommunity && !canListSubcommunity(subcommunity, req.user)) return null;
      return {
        ...category,
        subcommunity: subcommunity ? serializeSubcommunity(subcommunity, req.user) : null,
      };
    })
    .filter(Boolean);

  res.json({ categories });
});

forumsRouter.get("/subcommunities", optionalAuth, async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  const subcommunities = (data ?? [])
    .filter((row: any) => canListSubcommunity(row, req.user))
    .map((row: any) => serializeSubcommunity(row, req.user));
  return res.json({ subcommunities });
});

forumsRouter.get("/subcommunities/mine", optionalAuth, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required." });

  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("community_subcommunities")
    .select("*")
    .order("created_at", { ascending: false });
  if (!req.user.isAdmin) query = query.eq("owner_user_id", req.user.id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ subcommunities: (data ?? []).map((row: any) => serializeSubcommunity(row, req.user)) });
});

forumsRouter.get("/subcommunities/:slug", optionalAuth, async (req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunities")
    .select("*")
    .eq("slug", req.params.slug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data || !canReadSubcommunity(data, req.user)) return res.status(404).json({ error: "Subcommunity not found" });
  return res.json({ subcommunity: serializeSubcommunity(data, req.user) });
});

// --- Public: get category + its threads -------------------------------------
forumsRouter.get("/categories/:slug", optionalAuth, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const sort = String(req.query.sort ?? "active");
  const search = String(req.query.search ?? "").trim();
  const sb = getSupabaseAdmin();

  const { data: category, error: catErr } = await sb
    .from("forum_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (catErr || !category) return res.status(404).json({ error: "Category not found" });
  const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(category.id, res);
  if (!subcommunityLookup.ok) return;
  const subcommunity = subcommunityLookup.subcommunity;
  if (subcommunity && !canReadSubcommunity(subcommunity, req.user)) {
    return res.status(404).json({ error: "Category not found" });
  }

  const orderColumn = sort === "hot" ? "hot_score" : sort === "new" ? "created_at" : "last_activity_at";

  const threadResults = await Promise.all(listableThreadVisibilities(req.user).map((visibility) =>
    {
      let query = (sb as any)
      .from("threads")
      .select(
        `id, title, body, status, visibility, score, comment_count, linked_document_id, linked_persona_id,
         authorship_kind, authorship_source_type, authorship_source_id, authorship_persona_id,
         is_pinned, is_hidden, reported_count, vote_count, hot_score, last_activity_at, moderation_state, created_at, updated_at,
         author_user_id,
         author:profiles!author_user_id(username, display_name, avatar_url),
         document:documents!linked_document_id(id, provenance_type, source_type, source_persona_id)`
      )
      .eq("category_id", category.id)
      .eq("status", "active")
      .eq("visibility", visibility)
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order(orderColumn, { ascending: false });

      if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
      return query;
    }
  ));

  const threadErr = threadResults.find((result) => result.error)?.error;

  if (threadErr) return res.status(500).json({ error: threadErr.message });

  const threads = threadResults
    .flatMap((result) => result.data ?? [])
    .map((thread) => thread as any)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (sort === "hot") return Number(b.hot_score ?? b.score ?? 0) - Number(a.hot_score ?? a.score ?? 0);
      const column = sort === "new" ? "created_at" : "last_activity_at";
      return new Date(b[column] ?? b.created_at ?? 0).getTime() - new Date(a[column] ?? a.created_at ?? 0).getTime();
    });

  const viewerVotes = await listViewerVotes({
    voterUserId: req.user?.id,
    targetType: "thread",
    targetIds: threads.map((thread) => thread.id),
  }).catch(() => ({}));

  const [authorProfiles, witnessSummaries] = await Promise.all([
    loadCommunityProfiles([...new Set(threads.map((thread) => thread.author_user_id).filter(Boolean))]),
    listCommunityWitnessSummaries({
      viewerUserId: req.user?.id,
      targetType: "thread",
      targetIds: threads.map((thread) => thread.id),
    }).catch(() => ({})),
  ]);
  const enrichedThreads = threads.map((thread) => {
    const threadPayload = { ...thread };
    delete threadPayload.document;
    return {
      ...withCommunityAuthorshipProvenance(threadPayload),
      viewer_vote: (viewerVotes as Record<string, number>)[thread.id] ?? 0,
      author_community_profile: authorProfiles[thread.author_user_id] ?? null,
      ...(witnessSummaries as Record<string, any>)[thread.id],
      discussion_provenance: serializeThreadDiscussionProvenance(thread),
    };
  });

  res.json({
    category: {
      ...category,
      subcommunity: subcommunity ? serializeSubcommunity(subcommunity, req.user) : null,
    },
    threads: enrichedThreads,
  });
});

// --- Auth-gated below --------------------------------------------------------
forumsRouter.use(requireAuth);

forumsRouter.get("/subcommunities/:slug/moderation/reports", async (req: Request, res: Response) => {
  const parsed = delegatedReportQueueQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const subcommunity = await loadSubcommunityBySlug(req.params.slug);
  if (!subcommunity) return res.status(404).json({ error: "Subcommunity not found." });

  const allowed = await canReadDelegatedModerationQueue(subcommunity, req.user);
  if (!allowed) return res.status(403).json({ error: "Subcommunity moderator access required." });

  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("moderation_reports")
    .select("*")
    .in("target_type", ["thread", "comment"])
    .order("created_at", { ascending: false })
    .limit(DELEGATED_REPORT_PREFETCH_LIMIT);

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  } else {
    query = query.in("status", ["open", "reviewing"]);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const reports = (await delegatedReportsForSubcommunity(data ?? [], subcommunity)).slice(0, parsed.data.limit);
  return res.json({ reports });
});

forumsRouter.get("/subcommunities/:slug/moderators", async (req: Request, res: Response) => {
  const subcommunity = await loadSubcommunityBySlug(req.params.slug);
  if (!subcommunity) return res.status(404).json({ error: "Subcommunity not found." });
  if (!canManageSubcommunityModerators(subcommunity, req.user)) {
    return res.status(403).json({ error: "Subcommunity owner or admin access required." });
  }

  try {
    const moderators = await loadSubcommunityModerators(subcommunity.id);
    return res.json({ moderators });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load subcommunity moderators.";
    return res.status(500).json({ error: message });
  }
});

forumsRouter.post("/subcommunities/:slug/moderators", async (req: Request, res: Response) => {
  const parsed = moderatorAssignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const subcommunity = await loadSubcommunityBySlug(req.params.slug);
  if (!subcommunity) return res.status(404).json({ error: "Subcommunity not found." });
  if (!canManageSubcommunityModerators(subcommunity, req.user)) {
    return res.status(403).json({ error: "Subcommunity owner or admin access required." });
  }

  try {
    const moderator = await assignSubcommunityModerator({
      subcommunity,
      targetUserId: parsed.data.userId,
      actorUserId: req.user!.id,
    });
    return res.status(201).json({ moderator });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not assign subcommunity moderator.";
    const status = message.includes("not found") ? 404 : message.includes("owner") ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

forumsRouter.delete("/subcommunities/:slug/moderators/:userId", async (req: Request, res: Response) => {
  const subcommunity = await loadSubcommunityBySlug(req.params.slug);
  if (!subcommunity) return res.status(404).json({ error: "Subcommunity not found." });
  if (!canManageSubcommunityModerators(subcommunity, req.user)) {
    return res.status(403).json({ error: "Subcommunity owner or admin access required." });
  }

  try {
    const moderator = await revokeSubcommunityModerator({
      subcommunityId: subcommunity.id,
      targetUserId: req.params.userId,
    });
    if (!moderator) return res.status(404).json({ error: "Subcommunity moderator not found." });
    return res.json({ moderator });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not revoke subcommunity moderator.";
    return res.status(500).json({ error: message });
  }
});

forumsRouter.post("/subcommunities", async (req: Request, res: Response) => {
  if (!canCreateSubcommunity(req.user)) {
    return res.status(403).json({ error: "Canon tier or admin access required." });
  }

  const parsed = createSubcommunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const linkCheck = await validateSubcommunityLinks(parsed.data, req.user!);
  if ("error" in linkCheck) return res.status(linkCheck.status).json({ error: linkCheck.error });

  const { data: category, error: categoryError } = await (sb as any)
    .from("forum_categories")
    .insert({
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      sort_order: 100,
    })
    .select("*")
    .single();

  if (categoryError || !category) {
    return res.status(500).json({ error: categoryError?.message ?? "Failed to create subcommunity category." });
  }

  const { data, error } = await (sb as any)
    .from("community_subcommunities")
    .insert({
      category_id: category.id,
      owner_user_id: req.user!.id,
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      subcommunity_type: parsed.data.type,
      visibility: parsed.data.visibility,
      status: "active",
      linked_space_id: parsed.data.linkedSpaceId ?? null,
      linked_developer_space_id: parsed.data.linkedDeveloperSpaceId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to create subcommunity." });
  return res.status(201).json({ subcommunity: serializeSubcommunity(data, req.user) });
});

// --- Create thread (minimum: Basic tier) ---------------------------
forumsRouter.post(
  "/threads",
  requireTier("private"),
  async (req: Request, res: Response) => {
    const parsed = createThreadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const userId = req.user!.id;
    const sb = getSupabaseAdmin();

    // Verify category exists
    const { data: category, error: catErr } = await sb
      .from("forum_categories")
      .select("id")
      .eq("id", parsed.data.categoryId)
      .single();

    if (catErr || !category) return res.status(404).json({ error: "Category not found" });
    const subcommunityLookup = await loadSubcommunityForCategoryOrRespond(category.id, res);
    if (!subcommunityLookup.ok) return;
    const subcommunity = subcommunityLookup.subcommunity;
    if (subcommunity && !canReadSubcommunity(subcommunity, req.user!)) {
      return res.status(404).json({ error: "Category not found" });
    }

    const links = await validateThreadLinks(parsed.data, req.user!);
    if (links.ok === false) return res.status(links.status).json({ error: links.error });

    const { data: thread, error } = await sb
      .from("threads")
      .insert({
        category_id: parsed.data.categoryId,
        author_user_id: userId,
        title: parsed.data.title,
        body: parsed.data.body,
        linked_space_id: parsed.data.linkedSpaceId ?? null,
        linked_persona_id: parsed.data.linkedPersonaId ?? null,
        linked_document_id: parsed.data.linkedDocumentId ?? null,
        authorship_kind: "user_authored",
        authorship_source_type: null,
        authorship_source_id: null,
        authorship_persona_id: null,
        status: "active",
        visibility: links.visibility,
        is_pinned: false,
        is_hidden: false,
        reported_count: 0,
        score: 0,
        comment_count: 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    await Promise.all([
      ensureCommunityProfile(userId).catch(() => undefined),
      bumpCommunityActivity(userId, "thread").catch(() => undefined),
    ]);
    res.status(201).json({ thread: withCommunityAuthorshipProvenance(thread) });
  }
);

async function loadCommunityProfiles(userIds: string[]) {
  if (userIds.length === 0) return {};
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_user_profiles")
    .select("*")
    .in("user_id", userIds);

  if (error) return {};
  return Object.fromEntries((data ?? []).map((row: any) => [row.user_id, serializeCommunityProfile(row)]));
}

async function loadSubcommunityBySlug(slug: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("community_subcommunities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

async function canReadDelegatedModerationQueue(subcommunity: any, user?: AuthenticatedUser | null) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!canSeeCommunity(user)) return false;
  try {
    return await canModerateSubcommunity(subcommunity, user);
  } catch {
    return false;
  }
}

async function delegatedReportsForSubcommunity(
  rows: any[],
  subcommunity: any
): Promise<DelegatedModerationReportRecord[]> {
  const reports: DelegatedModerationReportRecord[] = [];

  for (const row of rows) {
    const resolved = await resolveDelegatedReportTarget(row, subcommunity);
    if (!resolved) continue;
    reports.push({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      reason: row.reason,
      status: row.status,
      targetContext: resolved,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  return reports;
}

async function resolveDelegatedReportTarget(
  report: any,
  subcommunity: any
): Promise<ModerationReportTargetContext | null> {
  if (report.target_type === "thread") {
    const thread = await loadThreadForDelegatedReport(report.target_id);
    if (!thread || thread.category_id !== subcommunity.category_id) return null;
    return delegatedThreadTargetContext(thread);
  }

  if (report.target_type === "comment") {
    const comment = await loadCommentForDelegatedReport(report.target_id);
    if (!comment || comment.parent_type !== "thread") return null;
    const thread = await loadThreadForDelegatedReport(comment.parent_id);
    if (!thread || thread.category_id !== subcommunity.category_id) return null;
    return delegatedCommentTargetContext(comment, thread);
  }

  return null;
}

async function loadThreadForDelegatedReport(threadId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("threads")
    .select("id, title, status, visibility, is_hidden, moderation_state, category_id")
    .eq("id", threadId)
    .maybeSingle();
  return data ?? null;
}

async function loadCommentForDelegatedReport(commentId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("comments")
    .select("id, parent_type, parent_id, status, is_hidden, moderation_state")
    .eq("id", commentId)
    .maybeSingle();
  return data ?? null;
}

function delegatedThreadTargetContext(thread: any): ModerationReportTargetContext {
  return {
    targetType: "thread",
    targetId: thread.id,
    title: thread.title ?? null,
    status: thread.status ?? null,
    visibility: thread.visibility ?? null,
    moderationState: thread.moderation_state ?? null,
    isHidden: thread.is_hidden ?? false,
    routeHref: null,
    routeLabel: thread.title ?? thread.id,
    canOpenRoute: false,
    unavailableReason: "Delegated queue route hints do not expose category slugs yet.",
    supportedActions: delegatedModerationActionsForTarget(thread),
  };
}

function delegatedCommentTargetContext(comment: any, thread: any): ModerationReportTargetContext {
  return {
    targetType: "comment",
    targetId: comment.id,
    title: thread.title ?? null,
    parentType: "thread",
    parentId: thread.id,
    status: comment.status ?? null,
    moderationState: comment.moderation_state ?? null,
    isHidden: comment.is_hidden ?? false,
    routeHref: null,
    routeLabel: thread.title ?? thread.id,
    canOpenRoute: false,
    unavailableReason: "Delegated queue route hints do not expose category slugs yet.",
    supportedActions: delegatedModerationActionsForTarget(comment),
  };
}

function delegatedModerationActionsForTarget(
  target: { status?: string | null; is_hidden?: boolean | null }
): CommunityModerationSafetyAction[] {
  if (target.status === "removed") return ["restore"];
  if (target.is_hidden) return ["unhide", "remove"];
  return ["hide", "remove"];
}

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

async function validateSubcommunityLinks(
  input: z.infer<typeof createSubcommunitySchema>,
  user: AuthenticatedUser
): Promise<{ ok: true } | { status: number; error: string }> {
  const sb = getSupabaseAdmin();

  if (input.linkedSpaceId) {
    const { data: space } = await (sb as any)
      .from("spaces")
      .select("id, owner_user_id, is_public")
      .eq("id", input.linkedSpaceId)
      .maybeSingle();

    if (!space) return { status: 404, error: "Linked Space not found." };
    if (space.owner_user_id !== user.id && !user.isAdmin) {
      return { status: 403, error: "You do not own the linked Space." };
    }
    if (!space.is_public) {
      return { status: 400, error: "Linked Space must be public." };
    }
  }

  if (input.linkedDeveloperSpaceId) {
    const { data: developerSpace } = await (sb as any)
      .from("developer_spaces")
      .select("id, owner_user_id, visibility")
      .eq("id", input.linkedDeveloperSpaceId)
      .maybeSingle();

    if (!developerSpace) return { status: 404, error: "Linked Developer Space not found." };
    if (developerSpace.owner_user_id !== user.id && !user.isAdmin) {
      return { status: 403, error: "You do not own the linked Developer Space." };
    }
    if (developerSpace.visibility === "private") {
      return { status: 400, error: "Linked Developer Space must not be private." };
    }
  }

  return { ok: true };
}
