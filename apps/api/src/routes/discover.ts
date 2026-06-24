import { Router, Request, Response } from "express";
import { normalizeSpacePresentation } from "@station/config/space-presentation";
import type {
  DeveloperSpaceEventVisibility,
  DeveloperSpaceVisibility,
  PublicProjectSearchResult,
} from "@station/types";
import type { DocumentVisibility, ThreadVisibility } from "@station/db";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth } from "../middleware/require-auth";
import { serializeDeveloperSpaceEvent } from "../services/developer-space.service";
import {
  isSafePublicPersonaSlug,
  publicPersonaChatCapability,
  publicPersonaRouteHref,
} from "../lib/persona-serialization";
import { ownerCanExposeExistingPublicPersonas } from "../lib/public-persona-eligibility";

export const discoverRouter = Router();
const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);
const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function discoverableSubcommunityVisibilities(req: Request) {
  return canSeeCommunityDocuments(req)
    ? ["public", "community"]
    : ["public"];
}

function discoverableDeveloperSpaceVisibilities(req: Request): DeveloperSpaceVisibility[] {
  return canSeeCommunityDocuments(req)
    ? ["public", "community"]
    : ["public"];
}

function discoverableDeveloperSpaceEventVisibilities(req: Request): DeveloperSpaceEventVisibility[] {
  return canSeeCommunityDocuments(req)
    ? ["public", "community"]
    : ["public"];
}

function excerpt(value?: string | null, max = 220) {
  if (!value) return null;
  const normalized = value.replace(/\n/g, " ");
  return normalized.slice(0, max) + (normalized.length > max ? "..." : "");
}

function scalarSummary(value: unknown, max = 80) {
  return excerpt(String(value).replace(/\s+/g, " "), max);
}

function emptyPrivateSearchResults() {
  return {
    documents: [],
    continuityRecords: [],
    memoryItems: [],
    canonItems: [],
    archiveFiles: [],
    importJobs: [],
    archivedChats: [],
  };
}

function safeForumCategoryHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/forums/${slug}`
    : null;
}

function publicSalonSearchResults(rows: any[]) {
  return rows.flatMap((row) => {
    const categorySlug = row.category?.slug ?? row.slug;
    const href = safeForumCategoryHref(categorySlug);
    if (!href) return [];
    return [{
      slug: categorySlug,
      categorySlug,
      title: row.title,
      description: row.description ?? null,
      type: "salon",
      label: "Salon",
      visibility: row.visibility,
      status: row.status,
      href,
    }];
  });
}

function safePublicProjectHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/projects/public/${slug}`
    : null;
}

function publicProjectSearchResults(rows: any[], limit = 6): PublicProjectSearchResult[] {
  const bySlug = new Map<string, any>();
  for (const row of rows) {
    if (row.visibility !== "public") continue;
    const href = safePublicProjectHref(row.slug);
    if (!href || bySlug.has(row.slug)) continue;
    bySlug.set(row.slug, row);
  }

  return [...bySlug.values()]
    .sort((a, b) => {
      const byDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime();
      if (byDate !== 0) return byDate;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""));
    })
    .slice(0, limit)
    .map((row) => ({
      name: row.name,
      slug: row.slug,
      description: row.description ?? null,
      visibility: "public",
      href: `/projects/public/${row.slug}`,
      type: "project",
      label: "Public Project",
    }));
}

async function publicPersonaSearchResults(
  sb: ReturnType<typeof getSupabaseAdmin>,
  rows: any[]
) {
  const results = [];
  for (const row of rows) {
    if (!isSafePublicPersonaSlug(row.public_slug)) continue;
    if (!await ownerCanExposeExistingPublicPersonas(sb, row.owner_user_id)) continue;
    const href = publicPersonaRouteHref(row.public_slug);
    if (!href) continue;
    results.push({
      name: row.name,
      short_description: row.short_description ?? null,
      avatar_url: row.avatar_url ?? null,
      publicSlug: row.public_slug,
      href,
      publicChat: publicPersonaChatCapability(row),
    });
  }
  return results;
}

async function ownerPrivateSearchResults(ownerUserId: string, q: string) {
  const sb = getSupabaseAdmin();
  const like = `%${q}%`;

  const [
    documents,
    continuityRecords,
    memoryItems,
    canonItems,
    archiveFiles,
    importJobs,
    archivedChats,
  ] = await Promise.all([
    sb
      .from("documents")
      .select("id, title, slug, document_type, status, visibility, persona_id, space_id, updated_at")
      .eq("author_user_id", ownerUserId)
      .ilike("title", like)
      .order("updated_at", { ascending: false })
      .limit(8),
    sb
      .from("continuity_records")
      .select("id, persona_id, record_type, title, summary, visibility, source_table, source_id, updated_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("title", like)
      .order("updated_at", { ascending: false })
      .limit(8),
    sb
      .from("memory_items")
      .select("id, persona_id, title, summary, source_type, relevance_weight, updated_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("title", like)
      .order("updated_at", { ascending: false })
      .limit(8),
    sb
      .from("canon_items")
      .select("id, persona_id, title, source_type, priority, updated_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("title", like)
      .order("updated_at", { ascending: false })
      .limit(8),
    sb
      .from("persona_files")
      .select("id, persona_id, file_name, file_type, source_type, processed, created_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("file_name", like)
      .order("created_at", { ascending: false })
      .limit(8),
    sb
      .from("import_jobs")
      .select("id, persona_id, kind, status, source_name, error_message, updated_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("source_name", like)
      .order("updated_at", { ascending: false })
      .limit(8),
    sb
      .from("archived_chat_transcripts")
      .select("id, persona_id, conversation_id, title, source_summary, message_count, updated_at")
      .eq("owner_user_id", ownerUserId)
      .ilike("title", like)
      .order("updated_at", { ascending: false })
      .limit(8),
  ]);

  return {
    documents: documents.data ?? [],
    continuityRecords: continuityRecords.data ?? [],
    memoryItems: memoryItems.data ?? [],
    canonItems: canonItems.data ?? [],
    archiveFiles: archiveFiles.data ?? [],
    importJobs: importJobs.data ?? [],
    archivedChats: archivedChats.data ?? [],
  };
}

function documentFeedQuery(
  sb: ReturnType<typeof getSupabaseAdmin>,
  visibility: DocumentVisibility,
  tab: string,
  offset: number,
  limit: number
) {
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

async function canShowFeaturedItem(item: any, req: Request) {
  const sb = getSupabaseAdmin();

  if (item.item_type === "document") {
    const { data } = await sb
      .from("documents")
      .select("id, status, visibility")
      .eq("id", item.item_id)
      .single();
    if (!data || data.status !== "published") return false;
    if (data.visibility === "public") return true;
    return (data.visibility === "community" || data.visibility === "members") && canSeeCommunityDocuments(req);
  }

  if (item.item_type === "thread") {
    const { data } = await sb
      .from("threads")
      .select("id, status, visibility, is_hidden, linked_document_id")
      .eq("id", item.item_id)
      .single();
    if (!data || data.status !== "active" || data.is_hidden || data.linked_document_id) return false;
    if (data.visibility === "public") return true;
    return data.visibility === "community" && canSeeCommunityDocuments(req);
  }

  if (item.item_type === "space") {
    const { data } = await sb
      .from("spaces")
      .select("id, is_public")
      .eq("id", item.item_id)
      .single();
    return Boolean(data?.is_public);
  }

  if (item.item_type === "persona") {
    const { data } = await sb
      .from("personas")
      .select("id, visibility")
      .eq("id", item.item_id)
      .single();
    return data?.visibility === "public";
  }

  if (item.item_type === "developer_space") {
    const { data } = await sb
      .from("developer_spaces")
      .select("id, visibility")
      .eq("id", item.item_id)
      .single();
    if (data?.visibility === "public") return true;
    return data?.visibility === "community" && canSeeCommunityDocuments(req);
  }

  return false;
}

async function developerSpaceFeedItems(req: Request, tab: string, offset: number, limit: number) {
  const sb = getSupabaseAdmin();
  const [spaceResults] = await Promise.all([
    Promise.all(discoverableDeveloperSpaceVisibilities(req).map((visibility) =>
      sb
        .from("developer_spaces")
        .select(`
          id, owner_user_id, slug, project_name, description, visibility,
          visualisation_type, created_at, updated_at,
          owner:profiles!owner_user_id(username, display_name, avatar_url)
        `)
        .eq("visibility", visibility)
        .order(tab === "rising" ? "updated_at" : "created_at", { ascending: false })
        .range(offset, offset + limit - 1)
    )),
  ]);

  const eventVisibility = discoverableDeveloperSpaceEventVisibilities(req);
  const rows = spaceResults.flatMap((result) => result.data ?? []);

  return Promise.all(rows.map(async (space: any) => {
    const [nodesResult, eventsResult] = await Promise.all([
      sb
        .from("developer_space_nodes")
        .select("id")
        .eq("developer_space_id", space.id)
        .limit(200),
      sb
        .from("developer_space_events")
        .select("*")
        .eq("developer_space_id", space.id)
        .in("visibility", eventVisibility)
        .order("occurred_at", { ascending: false })
        .limit(12),
    ]);

    const safeEvents = (eventsResult.data ?? []).map((event: any) =>
      serializeDeveloperSpaceEvent(event, { includeRawData: false })
    );
    const latestEvent = safeEvents[0] ?? null;
    const latestEventSummary = latestEvent
      ? excerpt(Object.entries(latestEvent.eventData ?? {})
        .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${scalarSummary(value)}`)
        .join(" / "))
      : null;

    return {
      id: space.id,
      type: "developer_space" as const,
      title: space.project_name,
      excerpt: excerpt(space.description),
      href: `/developer-spaces/${space.slug}`,
      meta: space.visualisation_type,
      visibility: space.visibility,
      space: null,
      author: space.owner ?? null,
      persona: null,
      score: safeEvents.length + (nodesResult.data?.length ?? 0),
      replyCount: safeEvents.length,
      createdAt: latestEvent?.occurredAt ?? space.updated_at ?? space.created_at,
      promoted: false,
      developerSpace: {
        slug: space.slug,
        visualisationType: space.visualisation_type,
        nodeCount: nodesResult.data?.length ?? 0,
        eventCount: safeEvents.length,
        latestEventLabel: latestEvent?.eventLabel ?? null,
        latestEventType: latestEvent?.eventType ?? null,
        latestEventAt: latestEvent?.occurredAt ?? null,
        latestEventSummary,
      },
    };
  }));
}

// --- Unified feed item shape -------------------------------------------------
// Each item has a normalised shape so the frontend can render generically.
// type: 'document' | 'thread' | 'space' | 'persona'

// --- GET /discover/feed?tab=new|rising|featured&limit=20&offset=0 ------------
discoverRouter.get("/feed", optionalAuth, async (req: Request, res: Response) => {
  const tab    = String(req.query.tab    ?? "new");
  const limit  = Math.min(Number(req.query.limit  ?? 20), 50);
  const offset = Number(req.query.offset ?? 0);
  const sb = getSupabaseAdmin();

  try {
    const [docResults, threadResults, developerSpaceItems] = await Promise.all([
      Promise.all(
        discoverableDocumentVisibilities(req).map((visibility) =>
          documentFeedQuery(sb, visibility, tab, offset, limit)
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
      developerSpaceFeedItems(req, tab, offset, limit),
    ]);

    // Normalise into a unified feed shape
    const docRows = docResults.flatMap((result) => result.data ?? []);
    const docItems = docRows.map((d: any) => ({
      id:          d.id,
      type:        "document" as const,
      title:       d.title,
      excerpt:     excerpt(d.body),
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
      excerpt:    excerpt(t.body),
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
    let items = [...docItems, ...threadItems, ...developerSpaceItems];

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

      const visible = [];
      for (const item of featured ?? []) {
        if (await canShowFeaturedItem(item, req)) visible.push(item);
      }

      return res.json({ items: visible, tab });
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
  const sb = getSupabaseAdmin();

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
  if (!q) {
    return res.json({
      documents: [],
      threads: [],
      spaces: [],
      personas: [],
      projects: [],
      developerSpaces: [],
      salons: [],
      privateResults: req.user ? emptyPrivateSearchResults() : undefined,
    });
  }
  const sb = getSupabaseAdmin();

  const [docResults, threadResults, spaces, personas, projectResults, developerSpaceResults, salonResults, privateResults] = await Promise.all([
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
    sb.from("personas").select("name, short_description, visibility, avatar_url, public_slug, owner_user_id, public_chat_enabled").eq("visibility", "public").ilike("name", `%${q}%`).limit(12),
    Promise.all([
      sb
        .from("projects")
        .select("name, slug, description, visibility, created_at, updated_at")
        .eq("visibility", "public")
        .ilike("name", `%${q}%`)
        .order("updated_at", { ascending: false })
        .limit(6),
      sb
        .from("projects")
        .select("name, slug, description, visibility, created_at, updated_at")
        .eq("visibility", "public")
        .ilike("description", `%${q}%`)
        .order("updated_at", { ascending: false })
        .limit(6),
      sb
        .from("projects")
        .select("name, slug, description, visibility, created_at, updated_at")
        .eq("visibility", "public")
        .ilike("slug", `%${q}%`)
        .order("updated_at", { ascending: false })
        .limit(6),
    ]),
    Promise.all(discoverableDeveloperSpaceVisibilities(req).map((visibility) =>
      sb
        .from("developer_spaces")
        .select("id, slug, project_name, description, visibility, visualisation_type, updated_at")
        .eq("visibility", visibility)
        .ilike("project_name", `%${q}%`)
        .limit(6)
    )),
    Promise.all(discoverableSubcommunityVisibilities(req).map((visibility) =>
      (sb as any)
        .from("community_subcommunities")
        .select("slug, title, description, subcommunity_type, visibility, status, category:forum_categories!category_id(slug, title)")
        .eq("subcommunity_type", "salon")
        .eq("status", "active")
        .eq("visibility", visibility)
        .ilike("title", `%${q}%`)
        .limit(6)
    )),
    req.user ? ownerPrivateSearchResults(req.user.id, q) : Promise.resolve(undefined),
  ]);

  res.json({
    documents: docResults.flatMap((result) => result.data ?? []).slice(0, 8),
    threads:   threadResults.flatMap((result) => result.data ?? []).filter((thread: any) => !thread.linked_document_id).slice(0, 8),
    spaces:    (spaces.data ?? []).map((space: any) => ({
      ...space,
      presentation: normalizeSpacePresentation(space.theme),
    })),
    personas:  await publicPersonaSearchResults(sb, personas.data ?? []),
    projects: publicProjectSearchResults(projectResults.flatMap((result) => result.data ?? [])),
    developerSpaces: developerSpaceResults.flatMap((result) => result.data ?? []).slice(0, 8).map((space: any) => ({
      id: space.id,
      slug: space.slug,
      projectName: space.project_name,
      description: space.description ?? null,
      visibility: space.visibility,
      visualisationType: space.visualisation_type,
      updatedAt: space.updated_at,
      href: `/developer-spaces/${space.slug}`,
    })),
    salons: publicSalonSearchResults(salonResults.flatMap((result) => result.data ?? [])).slice(0, 6),
    privateResults,
  });
});
