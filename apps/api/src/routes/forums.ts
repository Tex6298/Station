import { Router, Request, Response } from "express";
import { z } from "zod";
import type { ThreadVisibility } from "@station/db";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";

const createThreadSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(50000),
  linkedSpaceId: z.string().uuid().optional().nullable(),
  linkedPersonaId: z.string().uuid().optional().nullable(),
  linkedDocumentId: z.string().uuid().optional().nullable(),
});

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
forumsRouter.get("/categories", async (_req: Request, res: Response) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("forum_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories: data ?? [] });
});

// --- Public: get category + its threads -------------------------------------
forumsRouter.get("/categories/:slug", optionalAuth, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const sb = getSupabaseAdmin();

  const { data: category, error: catErr } = await sb
    .from("forum_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (catErr || !category) return res.status(404).json({ error: "Category not found" });

  const threadResults = await Promise.all(listableThreadVisibilities(req.user).map((visibility) =>
    sb
      .from("threads")
      .select(
        `id, title, body, status, visibility, score, comment_count, linked_document_id,
         is_pinned, is_hidden, reported_count, created_at, updated_at,
         author_user_id,
         author:profiles!author_user_id(username, display_name, avatar_url)`
      )
      .eq("category_id", category.id)
      .eq("status", "active")
      .eq("visibility", visibility)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
  ));

  const threadErr = threadResults.find((result) => result.error)?.error;

  if (threadErr) return res.status(500).json({ error: threadErr.message });

  const threads = threadResults
    .flatMap((result) => result.data ?? [])
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());

  res.json({ category, threads });
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
    const sb = getSupabaseAdmin();

    // Verify category exists
    const { data: category, error: catErr } = await sb
      .from("forum_categories")
      .select("id")
      .eq("id", parsed.data.categoryId)
      .single();

    if (catErr || !category) return res.status(404).json({ error: "Category not found" });

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
    res.status(201).json({ thread });
  }
);
