import { Router, Request, Response } from "express";
import { normalizeSpacePresentation } from "@station/config/space-presentation";
import type { DocumentVisibility, ThreadVisibility } from "@station/db";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth } from "../middleware/require-auth";

export const discoverRouter = Router();
const sb = getSupabaseAdmin();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

function canSeeCommunityDocuments(req: Request) {
  return Boolean(req.user && COMMUNITY_TIERS.has(req.user.tier));
}

function discoverableDocumentVisibilities(req: Request): DocumentVisibility[] {
  return canSeeCommunityDocuments(req)
    ? ["public", "community", "members"]
    : ["public"];
}

function discoverableThreadVisibilities(req: Request): ThreadVisibility[] {
  return canSeeCommunityDocuments(req)
    ? ["public", "community"]
    : ["public"];
}

function documentFeedQuery(visibility: DocumentVisibility, tab: string, offset: number, limit: number) {
  return sb
    .from("documents")
    .select(`
      id, title, body, document_type, published_at, created_at, visibility,
      provenance_type, source_type, source_label, discussion_thread_id,
      space:spaces!space_id(slug, title),
      author:profiles!author_user_id(username, display_name, avatar_url),
      persona:personas!persona_id(id, name)
    `)
    .eq("status", "published")
    .eq("visibility", visibility)
    .order(tab === "rising" ? "created_at" : "published_at", { ascending: false })
    .range(offset, offset + limit - 1);
}

// --- Unified feed item shape -------------------------------------------------
// Each item has a normalised shape so the frontend can render generically.
// type: 'document' | 'thread' | 'space' | 'persona'

// --- GET /discover/feed?tab=new|rising|featured&limit=20&offset=0 ------------
discoverRouter.get("/feed", optionalAuth, async (req: Request, res: Response) => {
  const tab    = String(req.query.tab    ?? "new");
  const limit  = Math.min(Number(req.query.limit  ?? 20), 50);
  const offset = Number(req.query.offset ?? 0);

  try {
    const [docResults, threadResults] = await Promise.all([
      Promise.all(
        discoverableDocumentVisibilities(req).map((visibility) =>
          documentFeedQuery(visibility, tab, offset, limit)
        )
      ),
      // Active forum threads
      Promise.all(discoverableThreadVisibilities(req).map((visibility) =>
        sb
          .from("threads")
          .select(`
            id, title, body, visibility, linked_document_id, score, comment_count, is_hidden, created_at,
            category:forum_categories!category_id(slug, title),
            author:profiles!author_user_id(username, display_name, avatar_url)
          `)
          .eq("status", "active")
          .eq("visibility", visibility)
          .eq("is_hidden", false)
          .order(tab === "rising" ? "comment_count" : "created_at", { ascending: false })
          .range(offset, offset + limit - 1)
      )),
    ]);

    // Normalise into a unified feed shape
    const docRows = docResults.flatMap((result) => result.data ?? []);
    const docItems = docRows.map((d: any) => ({
      id:          d.id,
      type:        "document" as const,
      title:       d.title,
      excerpt:     d.body ? d.body.slice(0, 220).replace(/\n/g, " ") + (d.body.length > 220 ? "..." : "") : null,
      href:        d.space ? `/space/${d.space.slug}/documents/${d.id}` : `/documents/${d.id}`,
      meta:        d.document_type,
      visibility:  d.visibility,
      provenanceType: d.provenance_type,
      sourceType:  d.source_type,
      sourceLabel: d.source_label,
      discussionThreadId: d.discussion_thread_id ?? null,
      space:       d.space  ?? null,
      author:      d.author ?? null,
      persona:     d.persona ?? null,
      score:       0,
      replyCount:  0,
      createdAt:   d.published_at ?? d.created_at,
      promoted:    false,
    }));

    const threadRows = threadResults.flatMap((result) => result.data ?? []);
    const threadItems = threadRows.filter((t: any) => !t.linked_document_id).map((t: any) => ({
      id:         t.id,
      type:       "thread" as const,
      title:      t.title,
      excerpt:    t.body ? t.body.slice(0, 220).replace(/\n/g, " ") + (t.body.length > 220 ? "..." : "") : null,
      href:       t.category ? `/forums/${t.category.slug}/${t.id}` : `/forums/${t.id}`,
      meta:       t.category?.title ?? "Forum",
      space:      null,
      author:     t.author ?? null,
      persona:    null,
      score:      t.score,
      replyCount: t.comment_count,
      createdAt:  t.created_at,
      promoted:   false,
    }));

    // Interleave docs and threads, then sort
    let items = [...docItems, ...threadItems];

    if (tab === "rising") {
      // Rising: weight = replyCount * 3 + score, decay by age
      items = items.sort((a, b) => {
        const ageA = (Date.now() - new Date(a.createdAt).getTime()) / 3600000;
        const ageB = (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
        const scoreA = (a.replyCount * 3 + a.score) / Math.pow(ageA + 2, 1.5);
        const scoreB = (b.replyCount * 3 + b.score) / Math.pow(ageB + 2, 1.5);
        return scoreB - scoreA;
      });
    } else if (tab === "featured") {
      // Featured: pull from discover_feed table (admin-curated)
      const { data: featured } = await sb
        .from("discover_feed")
        .select("*")
        .eq("event_type", "featured")
        .order("created_at", { ascending: false })
        .limit(limit);

      return res.json({ items: featured ?? [], tab });
    } else {
      // New: most recent first
      items = items.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json({ items: items.slice(0, limit), tab });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- GET /discover/sidebar --- data for the logged-in sidebar ----------------
discoverRouter.get("/sidebar", optionalAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id ?? null;

  try {
    const [recentDocs, recentThreads, personas, stats] = await Promise.all([
      // User's recent published documents
      userId
        ? sb.from("documents").select("id, title, published_at, space:spaces!space_id(slug)").eq("author_user_id", userId).eq("status", "published").order("published_at", { ascending: false }).limit(5)
        : Promise.resolve({ data: [] }),

      // User's recent threads
      userId
        ? sb.from("threads").select("id, title, created_at, category:forum_categories!category_id(slug)").eq("author_user_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(5)
        : Promise.resolve({ data: [] }),

      // User's personas
      userId
        ? sb.from("personas").select("id, name, visibility, provider").eq("owner_user_id", userId).order("created_at", { ascending: false }).limit(8)
        : Promise.resolve({ data: [] }),

      // Platform-wide stats (public)
      Promise.all([
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("personas").select("id", { count: "exact", head: true }),
        sb.from("documents").select("id", { count: "exact", head: true }).eq("status", "published"),
        sb.from("threads").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]),
    ]);

    const [membersRes, personasRes, docsRes, threadsRes] = stats;

    res.json({
      recentPosts: [
        ...(recentDocs.data ?? []).map((d: any) => ({
          id: d.id, title: d.title, type: "document",
          href: d.space ? `/space/${d.space.slug}/documents/${d.id}` : `/documents/${d.id}`,
          date: d.published_at,
        })),
        ...(recentThreads.data ?? []).map((t: any) => ({
          id: t.id, title: t.title, type: "thread",
          href: t.category ? `/forums/${t.category.slug}/${t.id}` : `/forums`,
          date: t.created_at,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
      personas: personas.data ?? [],
      stats: {
        members:  membersRes.count  ?? 0,
        personas: personasRes.count ?? 0,
        posts:    docsRes.count     ?? 0,
        threads:  threadsRes.count  ?? 0,
      },
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- GET /discover/search?q= -------------------------------------------------
discoverRouter.get("/search", optionalAuth, async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json({ documents: [], threads: [], spaces: [], personas: [] });

  const [docResults, threadResults, spaces, personas] = await Promise.all([
    Promise.all(discoverableDocumentVisibilities(req).map((visibility) =>
      sb
        .from("documents")
        .select("id, title, body, document_type, visibility, provenance_type, source_type, source_label, discussion_thread_id, space:spaces!space_id(slug)")
        .eq("status", "published")
        .eq("visibility", visibility)
        .ilike("title", `%${q}%`)
        .limit(8)
    )),
    Promise.all(discoverableThreadVisibilities(req).map((visibility) =>
      sb.from("threads")
        .select("id, title, body, visibility, linked_document_id, category:forum_categories!category_id(slug, title)")
        .eq("status", "active")
        .eq("visibility", visibility)
        .eq("is_hidden", false)
        .ilike("title", `%${q}%`)
        .limit(8)
    )),
    sb.from("spaces").select("id, slug, title, short_description, theme").eq("is_public", true).ilike("title", `%${q}%`).limit(6),
    sb.from("personas").select("id, name, short_description, visibility").eq("visibility", "public").ilike("name", `%${q}%`).limit(6),
  ]);

  res.json({
    documents: docResults.flatMap((result) => result.data ?? []).slice(0, 8),
    threads:   threadResults.flatMap((result) => result.data ?? []).filter((thread: any) => !thread.linked_document_id).slice(0, 8),
    spaces:    (spaces.data ?? []).map((space: any) => ({
      ...space,
      presentation: normalizeSpacePresentation(space.theme),
    })),
    personas:  personas.data ?? [],
  });
});
