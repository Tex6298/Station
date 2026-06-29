import { Router } from "express";
import { createHash } from "node:crypto";
import type { PublicSeminarCard, PublicSeminarSourceType } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { canReadSubcommunity, loadSubcommunityForCategory } from "../services/community-subcommunities.service";

export const eventsRouter = Router();

const SEMINAR_DEFAULT_LIMIT = 12;
const SEMINAR_MAX_LIMIT = 24;
const SEMINAR_ERROR = {
  error: "Could not load public seminars.",
  code: "live_events_unavailable",
} as const;
const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

eventsRouter.get("/seminars", async (req, res) => {
  const limit = seminarLimit(req.query.limit);

  try {
    const cards = await loadPublicSeminarCards(limit);
    return res.json({
      source: "discover_feed_featured",
      cards,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json(SEMINAR_ERROR);
  }
});

function seminarLimit(value: unknown) {
  const parsed = Number.parseInt(String(firstQueryValue(value) ?? ""), 10);
  if (!Number.isInteger(parsed)) return SEMINAR_DEFAULT_LIMIT;
  return Math.min(SEMINAR_MAX_LIMIT, Math.max(1, parsed));
}

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadPublicSeminarCards(limit: number) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("discover_feed")
    .select("id, item_type, item_id, event_type, created_at")
    .eq("event_type", "featured")
    .in("item_type", ["document", "thread", "space"])
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (error) throw new Error("Could not load public seminar curation.");

  const cards: PublicSeminarCard[] = [];
  for (const item of data ?? []) {
    const card = await resolvePublicSeminarCard(sb, item);
    if (card) cards.push(card);
    if (cards.length >= limit) break;
  }
  return cards;
}

async function resolvePublicSeminarCard(sb: ReturnType<typeof getSupabaseAdmin>, item: any) {
  if (item.item_type === "document") return publicDocumentSeminarCard(sb, item);
  if (item.item_type === "thread") return publicThreadSeminarCard(sb, item);
  if (item.item_type === "space") return publicSpaceSeminarCard(sb, item);
  return null;
}

async function publicDocumentSeminarCard(sb: ReturnType<typeof getSupabaseAdmin>, item: any) {
  const { data: document, error } = await sb
    .from("documents")
    .select("id, title, body, status, visibility, published_at, created_at, space_id, discussion_thread_id")
    .eq("id", item.item_id)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar document.");
  if (!document || document.status !== "published" || document.visibility !== "public") return null;

  const space = await loadPublicSpace(sb, document.space_id);
  if (!space) return null;

  const discussionHref = document.discussion_thread_id
    ? await publicDiscussionHrefForDocument(sb, document.discussion_thread_id, document.id)
    : null;

  return seminarCard({
    sourceType: "document",
    label: "Published readback",
    title: document.title,
    description: publicExcerpt(document.body),
    href: `/space/${space.slug}/documents/${document.id}`,
    discussionHref,
    featuredAt: item.created_at,
    publishedAt: document.published_at ?? document.created_at ?? null,
    space,
  });
}

async function publicThreadSeminarCard(sb: ReturnType<typeof getSupabaseAdmin>, item: any) {
  const { data: thread, error } = await sb
    .from("threads")
    .select("id, title, body, status, visibility, is_hidden, category_id, linked_document_id, created_at")
    .eq("id", item.item_id)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar thread.");
  if (!isPublicRouteableThread(thread)) return null;
  if (thread.linked_document_id && !await linkedDocumentIsPublicRouteable(sb, thread.linked_document_id)) {
    return null;
  }

  const category = await loadPublicForumCategory(sb, thread.category_id);
  if (!category) return null;

  return seminarCard({
    sourceType: "thread",
    label: thread.linked_document_id ? "Public discussion" : "Forum seminar",
    title: thread.title,
    description: publicExcerpt(thread.body),
    href: `/forums/${category.slug}/${thread.id}`,
    discussionHref: null,
    featuredAt: item.created_at,
    publishedAt: thread.created_at ?? null,
    space: null,
  });
}

async function publicSpaceSeminarCard(sb: ReturnType<typeof getSupabaseAdmin>, item: any) {
  const space = await loadPublicSpace(sb, item.item_id);
  if (!space) return null;

  return seminarCard({
    sourceType: "space",
    label: "Public Space bundle",
    title: space.title,
    description: publicExcerpt(space.short_description),
    href: `/space/${space.slug}`,
    discussionHref: null,
    featuredAt: item.created_at,
    publishedAt: space.updated_at ?? space.created_at ?? null,
    space,
  });
}

async function loadPublicSpace(sb: ReturnType<typeof getSupabaseAdmin>, spaceId: string | null | undefined) {
  if (!spaceId) return null;
  const { data, error } = await sb
    .from("spaces")
    .select("id, slug, title, short_description, is_public, created_at, updated_at")
    .eq("id", spaceId)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar Space.");
  if (!data?.is_public || !safeRouteSlug(data.slug)) return null;
  return data;
}

async function loadPublicForumCategory(
  sb: ReturnType<typeof getSupabaseAdmin>,
  categoryId: string | null | undefined
) {
  if (!categoryId) return null;
  const { data, error } = await sb
    .from("forum_categories")
    .select("id, slug, title")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar category.");
  if (!safeRouteSlug(data?.slug)) return null;
  const subcommunity = await loadSubcommunityForCategory(data.id);
  if (subcommunity && !canReadSubcommunity(subcommunity, null)) return null;
  return data;
}

async function publicDiscussionHrefForDocument(
  sb: ReturnType<typeof getSupabaseAdmin>,
  threadId: string,
  documentId: string
) {
  const { data: thread, error } = await sb
    .from("threads")
    .select("id, status, visibility, is_hidden, category_id, linked_document_id")
    .eq("id", threadId)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar discussion.");
  if (!isPublicRouteableThread(thread) || thread.linked_document_id !== documentId) return null;

  const category = await loadPublicForumCategory(sb, thread.category_id);
  return category ? `/forums/${category.slug}/${thread.id}` : null;
}

async function linkedDocumentIsPublicRouteable(
  sb: ReturnType<typeof getSupabaseAdmin>,
  documentId: string
) {
  const { data: document, error } = await sb
    .from("documents")
    .select("id, status, visibility, space_id")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw new Error("Could not resolve public seminar linked document.");
  if (!document || document.status !== "published" || document.visibility !== "public") return false;
  return Boolean(await loadPublicSpace(sb, document.space_id));
}

function isPublicRouteableThread(thread: any) {
  return Boolean(
    thread &&
    thread.status === "active" &&
    thread.visibility === "public" &&
    !thread.is_hidden
  );
}

function seminarCard(input: {
  sourceType: PublicSeminarSourceType;
  label: string;
  title: string;
  description: string | null;
  href: string;
  discussionHref: string | null;
  featuredAt: string;
  publishedAt: string | null;
  space: any | null;
}): PublicSeminarCard {
  return {
    id: publicSeminarCardId(input.sourceType, input.href, input.featuredAt),
    sourceType: input.sourceType,
    label: input.label,
    title: input.title,
    description: input.description,
    href: input.href,
    discussionHref: input.discussionHref,
    featuredAt: input.featuredAt,
    publishedAt: input.publishedAt,
    space: input.space
      ? {
          title: input.space.title,
          href: `/space/${input.space.slug}`,
        }
      : null,
  };
}

function publicSeminarCardId(sourceType: PublicSeminarSourceType, href: string, featuredAt: string) {
  const digest = createHash("sha256")
    .update(`station.public-seminar:${sourceType}:${href}:${featuredAt}`)
    .digest("hex")
    .slice(0, 16);
  return `seminar_${digest}`;
}

function publicExcerpt(value?: string | null, max = 180) {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > max ? `${normalized.slice(0, max - 3).trimEnd()}...` : normalized;
}

function safeRouteSlug(value: unknown) {
  return typeof value === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(value);
}
