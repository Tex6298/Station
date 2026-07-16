import { Router } from "express";
import { z } from "zod";
import {
  encodeSpacePresentation,
  normalizeSpacePresentation,
  SPACE_LAYOUT_IDS,
  SPACE_THEME_IDS,
} from "@station/config/space-presentation";
import type { DocumentVisibility } from "@station/db";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import { serializePublicPersona } from "../lib/persona-serialization";
import { canExposeExistingPublicPersona } from "../lib/public-persona-eligibility";
import { canCreateSpace } from "@station/auth/permissions";
import type { AuthUser } from "@station/types";

const spaceThemeSchema = z.enum(SPACE_THEME_IDS);
const spaceLayoutSchema = z.enum(SPACE_LAYOUT_IDS);

const createSpaceSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  title: z.string().min(1).max(100),
  shortDescription: z.string().max(300).optional(),
  longDescription: z.string().max(5000).optional(),
  tagline: z.string().max(160).optional(),
  theme: spaceThemeSchema.optional(),
  layout: spaceLayoutSchema.optional(),
  isPublic: z.boolean().default(false),
  commentsDefaultEnabled: z.boolean().default(true),
});

const updateSpaceSchema = createSpaceSchema.partial();

const createPageSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  pageType: z.enum(["home", "about", "personas", "documents", "custom"]).default("custom"),
  body: z.string().max(50000).optional(),
  commentsEnabled: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

const updatePageSchema = createPageSchema.partial();

export const spacesRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);
const SPACE_ERROR_RESPONSES = {
  publicRead: { error: "Could not load Space.", code: "space_public_load_failed" },
  ownerList: { error: "Could not load your Spaces.", code: "space_list_failed" },
  create: { error: "Could not create Space.", code: "space_create_failed" },
  update: { error: "Could not update Space.", code: "space_update_failed" },
  delete: { error: "Could not delete Space.", code: "space_delete_failed" },
  pageCreate: { error: "Could not create Space page.", code: "space_page_create_failed" },
  pageUpdate: { error: "Could not update Space page.", code: "space_page_update_failed" },
} as const;

function listedDocumentVisibilities(user: AuthenticatedUser | undefined, ownerAccess: boolean): DocumentVisibility[] {
  if (ownerAccess || (user && COMMUNITY_TIERS.has(user.tier))) {
    return ["public", "community", "members"];
  }
  return ["public"];
}

function serializeSpace(space: any) {
  if (!space) return space;

  return {
    ...space,
    presentation: normalizeSpacePresentation(space.theme),
  };
}

function isMissingSingleError(error: any) {
  const message = String(error?.message ?? "");
  return error?.code === "PGRST116" || message.includes("Expected one");
}

async function publicSpacePersonaEligibility(sb: any, ownerUserId: string) {
  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("id, tier, is_admin")
    .eq("id", ownerUserId)
    .maybeSingle();

  if (profileError) return { eligible: false, error: true };
  if (!profile) return { eligible: false, error: false };

  const { count, error: countError } = await sb
    .from("personas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", ownerUserId)
    .eq("visibility", "public");

  if (countError || count === null) return { eligible: false, error: true };

  return {
    eligible: canExposeExistingPublicPersona(
      {
        id: ownerUserId,
        tier: profile.tier ?? "visitor",
        isAdmin: profile.is_admin ?? false,
      },
      count ?? 0
    ),
    error: false,
  };
}

function buildPresentation(payload: {
  tagline?: string;
  theme?: string;
  layout?: string;
  shortDescription?: string;
}, existing?: unknown) {
  const base = normalizeSpacePresentation(existing);
  const tagline = payload.tagline ?? (base.tagline || payload.shortDescription || "");
  return encodeSpacePresentation({
    theme: payload.theme ?? base.theme,
    layout: payload.layout ?? base.layout,
    tagline,
  });
}

// -- Public routes (no auth) ---------------------------------------------------

// GET /spaces/:slug - public Space view
spacesRouter.get("/:slug", optionalAuth, async (req, res) => {
  const sb = getSupabaseAdmin();

  const { data: space, error } = await sb
    .from("spaces")
    .select("*")
    .eq("slug", req.params.slug)
    .single();

  if (error || !space) return res.status(404).json({ error: "Space not found." });

  const hasOwnerAccess = Boolean(req.user?.isAdmin || req.user?.id === space.owner_user_id);
  if (!space.is_public && !hasOwnerAccess) {
    return res.status(403).json({ error: "This Space is private." });
  }

  const documentVisibilities = listedDocumentVisibilities(req.user, hasOwnerAccess);
  const [
    pagesResult,
    documentResults,
    personasResult,
    personaEligibility,
  ] = await Promise.all([
    sb
      .from("space_pages")
      .select("id, slug, title, page_type, body, sort_order, is_published, comments_enabled")
      .eq("space_id", space.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    Promise.all(documentVisibilities.map((visibility) =>
      sb
        .from("documents")
        .select("id, title, slug, document_type, body, summary, visibility, published_at, created_at, provenance_type, source_type, source_label, discussion_thread_id")
        .eq("space_id", space.id)
        .eq("status", "published")
        .eq("visibility", visibility)
        .order("published_at", { ascending: false })
        .limit(20)
    )),
    sb
      .from("personas")
      .select("name, short_description, visibility, avatar_url, public_slug, public_chat_enabled, public_anonymous_chat_enabled")
      .eq("owner_user_id", space.owner_user_id)
      .eq("visibility", "public"),
    publicSpacePersonaEligibility(sb, space.owner_user_id),
  ]);
  if (
    pagesResult.error ||
    personasResult.error ||
    documentResults.some((result) => result.error) ||
    personaEligibility.error
  ) {
    return res.status(500).json(SPACE_ERROR_RESPONSES.publicRead);
  }

  // Fetch owner profile for display
  const { data: owner, error: ownerError } = await sb
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("id", space.owner_user_id)
    .single();
  if (ownerError && !isMissingSingleError(ownerError)) {
    return res.status(500).json(SPACE_ERROR_RESPONSES.publicRead);
  }

  return res.json({
    access: hasOwnerAccess ? "owner" : "public",
    space: serializeSpace(space),
    pages: pagesResult.data ?? [],
    documents: documentResults
      .flatMap((result) => result.data ?? [])
      .sort((a, b) => new Date(b.published_at ?? b.created_at ?? 0).getTime() - new Date(a.published_at ?? a.created_at ?? 0).getTime())
      .slice(0, 20),
    personas: personaEligibility.eligible ? (personasResult.data ?? []).map(serializePublicPersona) : [],
    owner,
  });
});

// -- Authenticated routes ------------------------------------------------------
spacesRouter.use(requireAuth);

// GET /spaces/:slug/manage - owner Space settings
spacesRouter.get("/:slug/manage", async (req, res) => {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("spaces")
    .select("*")
    .eq("slug", req.params.slug)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Space not found." });
  return res.json({ space: serializeSpace(data) });
});

// GET /spaces - list the current user's spaces
spacesRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("spaces")
    .select("id, slug, title, short_description, long_description, theme, is_public, created_at, updated_at")
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(SPACE_ERROR_RESPONSES.ownerList);
  return res.json({ spaces: (data ?? []).map(serializeSpace) });
});

// POST /spaces - create a Space (creator tier minimum)
spacesRouter.post("/", requireTier("creator"), async (req, res) => {
  const parsed = createSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  // Check space count against tier limit
  const { count, error: countError } = await sb
    .from("spaces")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId);
  if (countError) return res.status(500).json(SPACE_ERROR_RESPONSES.create);

  const authUser: AuthUser = { id: userId, tier: req.user!.tier, isAdmin: req.user!.isAdmin };
  if (!canCreateSpace(authUser, count ?? 0)) {
    return res.status(403).json({
      error: `You have reached the Space limit for your tier. Upgrade to create more.`,
    });
  }

  // Check slug uniqueness
  const { data: existing, error: existingError } = await sb
    .from("spaces")
    .select("id")
    .eq("slug", parsed.data.slug)
    .single();
  if (existingError && !isMissingSingleError(existingError)) {
    return res.status(500).json(SPACE_ERROR_RESPONSES.create);
  }

  if (existing) return res.status(409).json({ error: "That slug is already taken." });

  const { data, error } = await sb
    .from("spaces")
    .insert({
      owner_user_id: userId,
      slug: parsed.data.slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription ?? null,
      long_description: parsed.data.longDescription ?? null,
      theme: buildPresentation(parsed.data),
      is_public: parsed.data.isPublic,
      comments_default_enabled: parsed.data.commentsDefaultEnabled,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json(SPACE_ERROR_RESPONSES.create);

  // Auto-create default pages
  await sb.from("space_pages").insert([
    { space_id: data.id, slug: "home",    title: "Home",    page_type: "home",      sort_order: 0, is_published: true,  body: `Welcome to ${parsed.data.title}.` },
    { space_id: data.id, slug: "about",   title: "About",   page_type: "about",     sort_order: 1, is_published: false, body: "" },
    { space_id: data.id, slug: "posts",   title: "Posts",   page_type: "documents", sort_order: 2, is_published: true,  body: "" },
    { space_id: data.id, slug: "personas",title: "Personas",page_type: "personas",  sort_order: 3, is_published: false, body: "" },
  ]);

  return res.status(201).json({ space: serializeSpace(data) });
});

// PATCH /spaces/:id - update Space settings
spacesRouter.patch("/:id", async (req, res) => {
  const parsed = updateSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined)               update.title = parsed.data.title;
  if (parsed.data.shortDescription !== undefined)    update.short_description = parsed.data.shortDescription;
  if (parsed.data.longDescription !== undefined)     update.long_description = parsed.data.longDescription;
  if (parsed.data.isPublic !== undefined)            update.is_public = parsed.data.isPublic;
  if (parsed.data.commentsDefaultEnabled !== undefined) update.comments_default_enabled = parsed.data.commentsDefaultEnabled;

  const presentationChanged =
    parsed.data.theme !== undefined ||
    parsed.data.layout !== undefined ||
    parsed.data.tagline !== undefined;

  if (presentationChanged) {
    const { data: existingSpace, error: loadError } = await sb
      .from("spaces")
      .select("theme")
      .eq("id", req.params.id)
      .eq("owner_user_id", req.user!.id)
      .single();

    if (loadError && !isMissingSingleError(loadError)) {
      return res.status(500).json(SPACE_ERROR_RESPONSES.update);
    }
    if (!existingSpace) return res.status(404).json({ error: "Space not found." });
    update.theme = buildPresentation(parsed.data, existingSpace.theme);
  }

  const { data, error } = await sb
    .from("spaces")
    .update(update)
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error && !isMissingSingleError(error)) return res.status(500).json(SPACE_ERROR_RESPONSES.update);
  if (!data) return res.status(404).json({ error: "Space not found." });
  return res.json({ space: serializeSpace(data) });
});

// DELETE /spaces/:id
spacesRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("spaces")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id);

  if (error) return res.status(500).json(SPACE_ERROR_RESPONSES.delete);
  return res.status(204).send();
});

// -- Pages ----------------------------------------------------------------------

// POST /spaces/:id/pages
spacesRouter.post("/:id/pages", async (req, res) => {
  const parsed = createPageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: space, error: spaceError } = await sb.from("spaces").select("id, owner_user_id").eq("id", req.params.id).single();
  if (spaceError && !isMissingSingleError(spaceError)) {
    return res.status(500).json(SPACE_ERROR_RESPONSES.pageCreate);
  }
  if (!space || space.owner_user_id !== req.user!.id) return res.status(404).json({ error: "Space not found." });

  const { count, error: countError } = await sb.from("space_pages").select("id", { count: "exact", head: true }).eq("space_id", space.id);
  if (countError) return res.status(500).json(SPACE_ERROR_RESPONSES.pageCreate);

  const { data, error } = await sb
    .from("space_pages")
    .insert({
      space_id: space.id,
      slug: parsed.data.slug,
      title: parsed.data.title,
      page_type: parsed.data.pageType,
      body: parsed.data.body ?? "",
      comments_enabled: parsed.data.commentsEnabled,
      is_published: parsed.data.isPublished,
      sort_order: parsed.data.sortOrder ?? (count ?? 0),
    })
    .select("*")
    .single();

  if (error) return res.status(500).json(SPACE_ERROR_RESPONSES.pageCreate);
  return res.status(201).json({ page: data });
});

// PATCH /spaces/:id/pages/:pageId
spacesRouter.patch("/:id/pages/:pageId", async (req, res) => {
  const parsed = updatePageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: space, error: spaceError } = await sb.from("spaces").select("id, owner_user_id").eq("id", req.params.id).single();
  if (spaceError && !isMissingSingleError(spaceError)) {
    return res.status(500).json(SPACE_ERROR_RESPONSES.pageUpdate);
  }
  if (!space || space.owner_user_id !== req.user!.id) return res.status(403).json({ error: "Not authorised." });

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined)          update.title = parsed.data.title;
  if (parsed.data.body !== undefined)           update.body = parsed.data.body;
  if (parsed.data.isPublished !== undefined)    update.is_published = parsed.data.isPublished;
  if (parsed.data.commentsEnabled !== undefined) update.comments_enabled = parsed.data.commentsEnabled;

  const { data, error } = await sb
    .from("space_pages")
    .update(update)
    .eq("id", req.params.pageId)
    .eq("space_id", space.id)
    .select("*")
    .single();

  if (error) return res.status(500).json(SPACE_ERROR_RESPONSES.pageUpdate);
  return res.json({ page: data });
});
