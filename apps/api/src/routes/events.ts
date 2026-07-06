import { Router } from "express";
import { createHash } from "node:crypto";
import type {
  CreateOwnerPublicSeminarRecordRequest,
  OwnerPublicSeminarRecord,
  OwnerPublicSeminarRecordResponse,
  OwnerPublicSeminarRecordsResponse,
  PublicSeminarCard,
  PublicSeminarSourceType,
  TransitionOwnerPublicSeminarRecordRequest,
} from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { optionalAuth, requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { canReadSubcommunity, loadSubcommunityForCategory } from "../services/community-subcommunities.service";

export const eventsRouter = Router();

const SEMINAR_DEFAULT_LIMIT = 12;
const SEMINAR_MAX_LIMIT = 24;
const SEMINAR_INTEREST_LOOKUP_LIMIT = 100;
const SEMINAR_ERROR = {
  error: "Could not load public seminars.",
  code: "live_events_unavailable",
} as const;
const SEMINAR_NOT_FOUND_ERROR = {
  error: "Seminar not found.",
  code: "seminar_not_found",
} as const;
const SEMINAR_INTEREST_ERROR = {
  error: "Could not update seminar interest.",
  code: "seminar_interest_unavailable",
} as const;
const SEMINAR_RECORDS_ERROR = {
  error: "Could not load seminar records.",
  code: "seminar_records_unavailable",
} as const;
const SEMINAR_RECORD_CREATE_ERROR = {
  error: "Could not create seminar record.",
  code: "seminar_record_create_unavailable",
} as const;
const SEMINAR_RECORD_INVALID_SOURCE_ERROR = {
  error: "Unsupported seminar record source.",
  code: "seminar_record_invalid_source",
} as const;
const SEMINAR_RECORD_SOURCE_ERROR = {
  error: "Seminar source not available.",
  code: "seminar_source_not_available",
} as const;
const SEMINAR_RECORD_NOT_FOUND_ERROR = {
  error: "Seminar draft not found.",
  code: "seminar_record_not_found",
} as const;
const SEMINAR_RECORD_TRANSITION_INVALID_ERROR = {
  error: "Unsupported seminar draft status.",
  code: "seminar_record_invalid_transition",
} as const;
const SEMINAR_RECORD_TRANSITION_ERROR = {
  error: "Could not update seminar draft status.",
  code: "seminar_record_transition_unavailable",
} as const;
const SEMINAR_RECORD_SELECT =
  "id, source_type, source_id, title, summary, status, visibility, discussion_thread_id, created_at, updated_at";
const SEMINAR_RECORD_TRANSITION_SELECT = `${SEMINAR_RECORD_SELECT}, owner_user_id`;
const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_SEMINAR_ID_PATTERN = /^seminar_[a-f0-9]{16}$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ResolvedPublicSeminarCard = {
  sourceType: PublicSeminarSourceType;
  sourceId: string;
  card: PublicSeminarCard;
};

type ResolvedSeminarRecordSource = {
  document: any;
  space: any;
};

eventsRouter.get("/seminars", optionalAuth, async (req, res) => {
  const limit = seminarLimit(req.query.limit);

  try {
    const cards = await loadPublicSeminarCards(limit, req.user?.id ?? null);
    return res.json({
      source: "discover_feed_featured",
      cards,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json(SEMINAR_ERROR);
  }
});

eventsRouter.get("/seminars/records", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();

  try {
    const { data, error } = await (sb as any)
      .from("public_seminar_records")
      .select(SEMINAR_RECORD_SELECT)
      .eq("owner_user_id", req.user!.id)
      .order("updated_at", { ascending: false });

    if (error) throw new Error("Could not load owner seminar records.");

    const records = await Promise.all(
      (data ?? []).map((row: any) => serializeOwnerSeminarRecord(sb, row))
    );
    const response: OwnerPublicSeminarRecordsResponse = { records };
    return res.json(response);
  } catch {
    return res.status(503).json(SEMINAR_RECORDS_ERROR);
  }
});

eventsRouter.post("/seminars/records", requireAuth, requireTier("creator"), async (req, res) => {
  const sb = getSupabaseAdmin();
  const body = req.body as Partial<CreateOwnerPublicSeminarRecordRequest>;

  if (
    body?.sourceType !== "document" ||
    typeof body.sourceId !== "string" ||
    body.sourceId.trim().length === 0
  ) {
    return res.status(400).json(SEMINAR_RECORD_INVALID_SOURCE_ERROR);
  }

  try {
    const source = await resolveOwnerSeminarDocumentSource(sb, body.sourceId.trim(), req.user!.id);
    if (!source) return res.status(404).json(SEMINAR_RECORD_SOURCE_ERROR);

    const { document } = source;
    const { data, error } = await (sb as any)
      .from("public_seminar_records")
      .upsert({
        owner_user_id: req.user!.id,
        source_type: "document",
        source_id: document.id,
        title: ownerSeminarText(document.title, 160) ?? "Untitled public seminar",
        summary: ownerSeminarText(document.body, 240),
        discussion_thread_id: document.discussion_thread_id ?? null,
      }, { onConflict: "owner_user_id,source_type,source_id" })
      .select(SEMINAR_RECORD_SELECT)
      .single();

    if (error || !data) throw new Error("Could not upsert owner seminar record.");

    const response: OwnerPublicSeminarRecordResponse = {
      record: await serializeOwnerSeminarRecord(sb, data, source),
    };
    return res.json(response);
  } catch {
    return res.status(503).json(SEMINAR_RECORD_CREATE_ERROR);
  }
});

eventsRouter.post("/seminars/records/:recordId/transition", requireAuth, requireTier("creator"), async (req, res) => {
  const sb = getSupabaseAdmin();
  const targetStatus = transitionTarget(req.body);
  if (!targetStatus) return res.status(400).json(SEMINAR_RECORD_TRANSITION_INVALID_ERROR);

  try {
    const { data: record, error: loadError } = await (sb as any)
      .from("public_seminar_records")
      .select(SEMINAR_RECORD_TRANSITION_SELECT)
      .eq("id", req.params.recordId)
      .eq("owner_user_id", req.user!.id)
      .maybeSingle();

    if (loadError) throw new Error("Could not load seminar draft.");
    if (!record || record.owner_user_id !== req.user!.id) {
      return res.status(404).json(SEMINAR_RECORD_NOT_FOUND_ERROR);
    }
    if (
      record.source_type !== "document" ||
      record.visibility !== "private" ||
      !["draft", "ready"].includes(record.status)
    ) {
      return res.status(400).json(SEMINAR_RECORD_TRANSITION_INVALID_ERROR);
    }

    const source = await resolveOwnerSeminarDocumentSource(sb, record.source_id, req.user!.id);
    if (!source) return res.status(404).json(SEMINAR_RECORD_SOURCE_ERROR);

    const { data, error } = await (sb as any)
      .from("public_seminar_records")
      .update({ status: targetStatus })
      .eq("id", record.id)
      .eq("owner_user_id", req.user!.id)
      .eq("source_type", "document")
      .eq("visibility", "private")
      .in("status", ["draft", "ready"])
      .select(SEMINAR_RECORD_SELECT)
      .single();

    if (error || !data) throw new Error("Could not transition seminar draft.");

    const response: OwnerPublicSeminarRecordResponse = {
      record: await serializeOwnerSeminarRecord(sb, data, source),
    };
    return res.json(response);
  } catch {
    return res.status(503).json(SEMINAR_RECORD_TRANSITION_ERROR);
  }
});

eventsRouter.post("/seminars/:seminarId/interest", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();

  try {
    const target = await resolvePublicSeminarTargetByCardId(sb, req.params.seminarId);
    if (!target) return res.status(404).json(SEMINAR_NOT_FOUND_ERROR);

    const { error } = await (sb as any)
      .from("public_seminar_interests")
      .upsert({
        user_id: req.user!.id,
        source_type: target.sourceType,
        source_id: target.sourceId,
      }, { onConflict: "user_id,source_type,source_id" })
      .select("id")
      .single();

    if (error) throw new Error("Could not mark seminar interest.");

    const [card] = await applySeminarInterestReadback(sb, [target], req.user!.id);
    return res.json({ card });
  } catch {
    return res.status(503).json(SEMINAR_INTEREST_ERROR);
  }
});

eventsRouter.delete("/seminars/:seminarId/interest", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();

  try {
    const target = await resolvePublicSeminarTargetByCardId(sb, req.params.seminarId);
    if (!target) return res.status(404).json(SEMINAR_NOT_FOUND_ERROR);

    const { error } = await (sb as any)
      .from("public_seminar_interests")
      .delete()
      .eq("user_id", req.user!.id)
      .eq("source_type", target.sourceType)
      .eq("source_id", target.sourceId);

    if (error) throw new Error("Could not withdraw seminar interest.");

    const [card] = await applySeminarInterestReadback(sb, [target], req.user!.id);
    return res.json({ card });
  } catch {
    return res.status(503).json(SEMINAR_INTEREST_ERROR);
  }
});

function transitionTarget(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "status") return null;
  const status = (body as TransitionOwnerPublicSeminarRecordRequest).status;
  return status === "draft" || status === "ready" ? status : null;
}

async function resolveOwnerSeminarDocumentSource(
  sb: ReturnType<typeof getSupabaseAdmin>,
  sourceId: string,
  ownerUserId: string
): Promise<ResolvedSeminarRecordSource | null> {
  const { data: document, error } = await sb
    .from("documents")
    .select("id, title, body, status, visibility, space_id, discussion_thread_id, author_user_id")
    .eq("id", sourceId)
    .maybeSingle();

  if (error) throw new Error("Could not load seminar record source.");
  if (
    !document ||
    document.author_user_id !== ownerUserId ||
    document.status !== "published" ||
    document.visibility !== "public"
  ) {
    return null;
  }

  const space = await loadPublicSpace(sb, document.space_id);
  if (!space) return null;

  return { document, space };
}

async function serializeOwnerSeminarRecord(
  sb: ReturnType<typeof getSupabaseAdmin>,
  row: any,
  knownSource?: ResolvedSeminarRecordSource
): Promise<OwnerPublicSeminarRecord> {
  const source = knownSource ?? await resolveSeminarRecordPublicRoute(sb, row);
  const title = ownerSeminarText(row.title, 160) ?? "Untitled public seminar";

  return {
    id: String(row.id),
    sourceType: "document",
    title,
    summary: ownerSeminarText(row.summary, 240),
    status: row.status,
    visibility: row.visibility,
    publicDocumentHref: source ? `/space/${source.space.slug}/documents/${source.document.id}` : null,
    publicSpace: source
      ? {
          title: ownerSeminarText(source.space.title, 120) ?? "Public Space",
          href: `/space/${source.space.slug}`,
        }
      : null,
    discussionLinked: Boolean(row.discussion_thread_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function resolveSeminarRecordPublicRoute(
  sb: ReturnType<typeof getSupabaseAdmin>,
  row: any
): Promise<ResolvedSeminarRecordSource | null> {
  if (row.source_type !== "document" || !row.source_id) return null;

  const { data: document, error } = await sb
    .from("documents")
    .select("id, title, status, visibility, space_id")
    .eq("id", row.source_id)
    .maybeSingle();

  if (error) throw new Error("Could not resolve seminar record route.");
  if (!document || document.status !== "published" || document.visibility !== "public") return null;

  const space = await loadPublicSpace(sb, document.space_id);
  return space ? { document, space } : null;
}

function seminarLimit(value: unknown) {
  const parsed = Number.parseInt(String(firstQueryValue(value) ?? ""), 10);
  if (!Number.isInteger(parsed)) return SEMINAR_DEFAULT_LIMIT;
  return Math.min(SEMINAR_MAX_LIMIT, Math.max(1, parsed));
}

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadPublicSeminarCards(limit: number, viewerUserId?: string | null) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("discover_feed")
    .select("id, item_type, item_id, event_type, created_at")
    .eq("event_type", "featured")
    .in("item_type", ["document", "thread", "space"])
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (error) throw new Error("Could not load public seminar curation.");

  const cards: ResolvedPublicSeminarCard[] = [];
  for (const item of data ?? []) {
    const card = await resolvePublicSeminarCard(sb, item);
    if (card) cards.push(card);
    if (cards.length >= limit) break;
  }

  try {
    return await applySeminarInterestReadback(sb, cards, viewerUserId);
  } catch {
    return cards.map((resolved) => resolved.card);
  }
}

async function resolvePublicSeminarTargetByCardId(
  sb: ReturnType<typeof getSupabaseAdmin>,
  seminarId: string
) {
  if (!PUBLIC_SEMINAR_ID_PATTERN.test(seminarId)) return null;

  const { data, error } = await sb
    .from("discover_feed")
    .select("id, item_type, item_id, event_type, created_at")
    .eq("event_type", "featured")
    .in("item_type", ["document", "thread", "space"])
    .order("created_at", { ascending: false })
    .limit(SEMINAR_INTEREST_LOOKUP_LIMIT);

  if (error) throw new Error("Could not load public seminar curation.");

  for (const item of data ?? []) {
    const resolved = await resolvePublicSeminarCard(sb, item);
    if (resolved?.card.id === seminarId) return resolved;
  }

  return null;
}

async function resolvePublicSeminarCard(
  sb: ReturnType<typeof getSupabaseAdmin>,
  item: any
): Promise<ResolvedPublicSeminarCard | null> {
  if (item.item_type === "document") return publicDocumentSeminarCard(sb, item);
  if (item.item_type === "thread") return publicThreadSeminarCard(sb, item);
  if (item.item_type === "space") return publicSpaceSeminarCard(sb, item);
  return null;
}

export async function resolveDurablePublicSeminarRecordCard(
  sb: ReturnType<typeof getSupabaseAdmin>,
  record: any
): Promise<ResolvedPublicSeminarCard | null> {
  if (
    !record ||
    typeof record.id !== "string" ||
    record.id.trim().length === 0 ||
    record.source_type !== "document" ||
    record.status !== "published" ||
    record.visibility !== "public"
  ) {
    return null;
  }

  const { data: document, error } = await sb
    .from("documents")
    .select("id, status, visibility, space_id, author_user_id")
    .eq("id", record.source_id)
    .maybeSingle();

  if (error) throw new Error("Could not resolve durable seminar source.");
  if (
    !document ||
    document.author_user_id !== record.owner_user_id ||
    document.status !== "published" ||
    document.visibility !== "public"
  ) {
    return null;
  }

  const space = await loadPublicSpace(sb, document.space_id);
  if (!space) return null;

  const discussionHref = record.discussion_thread_id
    ? await publicDiscussionHrefForDocument(sb, record.discussion_thread_id, document.id)
    : null;
  const featuredAt = record.updated_at ?? record.created_at ?? new Date(0).toISOString();
  const safeSpace = {
    ...space,
    title: ownerSeminarText(space.title, 120) ?? "Public Space",
  };
  const card = seminarCard({
    sourceType: "document",
    label: "Public seminar",
    title: ownerSeminarText(record.title, 160) ?? "Untitled public seminar",
    description: ownerSeminarText(record.summary, 240),
    href: `/space/${space.slug}/documents/${document.id}`,
    discussionHref,
    featuredAt,
    publishedAt: featuredAt,
    space: safeSpace,
  });

  return {
    sourceType: "document",
    sourceId: document.id,
    card: {
      ...card,
      id: durablePublicSeminarCardId(record.id),
    },
  };
}

async function publicDocumentSeminarCard(
  sb: ReturnType<typeof getSupabaseAdmin>,
  item: any
): Promise<ResolvedPublicSeminarCard | null> {
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

  return {
    sourceType: "document",
    sourceId: document.id,
    card: seminarCard({
      sourceType: "document",
      label: "Published readback",
      title: document.title,
      description: publicExcerpt(document.body),
      href: `/space/${space.slug}/documents/${document.id}`,
      discussionHref,
      featuredAt: item.created_at,
      publishedAt: document.published_at ?? document.created_at ?? null,
      space,
    }),
  };
}

export function mergePublicSeminarCardsWithDurableCards(
  sourceCards: ResolvedPublicSeminarCard[],
  durableCards: ResolvedPublicSeminarCard[],
  limit: number
) {
  const orderedDurable = durableCards
    .filter((durable) => durable.sourceType === "document")
    .sort((left, right) => String(right.card.featuredAt).localeCompare(String(left.card.featuredAt)));
  const durableByKey = new Map<string, ResolvedPublicSeminarCard>();
  for (const durable of orderedDurable) {
    const key = seminarInterestKey(durable);
    if (!durableByKey.has(key)) durableByKey.set(key, durable);
  }

  const usedKeys = new Set<string>();
  const merged = sourceCards.map((source) => {
    const key = seminarInterestKey(source);
    const durable = durableByKey.get(key);
    usedKeys.add(key);
    return durable ?? source;
  });

  for (const durable of orderedDurable) {
    const key = seminarInterestKey(durable);
    if (usedKeys.has(key)) continue;
    merged.push(durable);
    usedKeys.add(key);
  }

  return merged.slice(0, Math.max(0, limit));
}

async function publicThreadSeminarCard(
  sb: ReturnType<typeof getSupabaseAdmin>,
  item: any
): Promise<ResolvedPublicSeminarCard | null> {
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

  return {
    sourceType: "thread",
    sourceId: thread.id,
    card: seminarCard({
      sourceType: "thread",
      label: thread.linked_document_id ? "Public discussion" : "Forum seminar",
      title: thread.title,
      description: publicExcerpt(thread.body),
      href: `/forums/${category.slug}/${thread.id}`,
      discussionHref: null,
      featuredAt: item.created_at,
      publishedAt: thread.created_at ?? null,
      space: null,
    }),
  };
}

async function publicSpaceSeminarCard(
  sb: ReturnType<typeof getSupabaseAdmin>,
  item: any
): Promise<ResolvedPublicSeminarCard | null> {
  const space = await loadPublicSpace(sb, item.item_id);
  if (!space) return null;

  return {
    sourceType: "space",
    sourceId: space.id,
    card: seminarCard({
      sourceType: "space",
      label: "Public Space bundle",
      title: space.title,
      description: publicExcerpt(space.short_description),
      href: `/space/${space.slug}`,
      discussionHref: null,
      featuredAt: item.created_at,
      publishedAt: space.updated_at ?? space.created_at ?? null,
      space,
    }),
  };
}

async function applySeminarInterestReadback(
  sb: ReturnType<typeof getSupabaseAdmin>,
  resolvedCards: ResolvedPublicSeminarCard[],
  viewerUserId?: string | null
) {
  if (resolvedCards.length === 0) return [];

  const sourceIds = [...new Set(resolvedCards.map((resolved) => resolved.sourceId))];
  const { data, error } = await (sb as any)
    .from("public_seminar_interests")
    .select("source_type, source_id, user_id")
    .in("source_id", sourceIds);

  if (error) throw new Error("Could not load seminar interest readback.");

  const currentKeys = new Set(resolvedCards.map(seminarInterestKey));
  const interestCounts = new Map<string, number>();
  const viewerInterest = new Set<string>();

  for (const row of data ?? []) {
    const key = `${row.source_type}:${row.source_id}`;
    if (!currentKeys.has(key)) continue;
    interestCounts.set(key, (interestCounts.get(key) ?? 0) + 1);
    if (viewerUserId && row.user_id === viewerUserId) viewerInterest.add(key);
  }

  return resolvedCards.map((resolved) => {
    const key = seminarInterestKey(resolved);
    return {
      ...resolved.card,
      interestCount: interestCounts.get(key) ?? 0,
      ...(viewerUserId ? { viewerInterested: viewerInterest.has(key) } : {}),
    };
  });
}

export function seminarInterestKey(resolved: Pick<ResolvedPublicSeminarCard, "sourceType" | "sourceId">) {
  return `${resolved.sourceType}:${resolved.sourceId}`;
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
    interestCount: 0,
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

export function durablePublicSeminarCardId(recordId: string) {
  const digest = createHash("sha256")
    .update(`station.public-seminar-record:v1:${recordId}`)
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

function ownerSeminarText(value?: string | null, max = 180) {
  if (!value) return null;
  const normalized = value
    .replace(/\s+/g, " ")
    .replace(/bearer\s+[a-z0-9._~+/=-]+/gi, "[redacted]")
    .replace(/\b(?:authorization|cookie|set-cookie|x-api-key|api[_-]?key|token|secret|password)\b(?:\s*[:=]\s*|\s+)[^,\s]+/gi, "[redacted]")
    .replace(/\b(?:source_id|owner_user_id|author_user_id|user_id|discussion_thread_id)\b(?:\s*[:=]\s*|\s+)[^,\s]+/gi, "[redacted]")
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[redacted-ip]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/stack trace/gi, "[redacted]")
    .trim();
  if (!normalized) return null;
  return normalized.length > max ? `${normalized.slice(0, max - 3).trimEnd()}...` : normalized;
}

function safeRouteSlug(value: unknown) {
  return typeof value === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(value);
}
