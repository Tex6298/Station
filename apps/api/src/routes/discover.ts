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
const PUBLIC_ENCOUNTER_EXHIBIT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{8}$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_ENCOUNTER_EXHIBIT_PROVENANCE_SCHEMA = "station.persona_encounter.public_exhibit.v1";
const PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_LIMIT = 6;
const PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT = 12;
const PUBLIC_ENCOUNTER_EXHIBIT_SELECT =
  "slug, public_title, public_summary, public_tags, initiator_name_snapshot, responder_name_snapshot, status, provenance_schema, published_at, retracted_at, removed_at, private_session_id";
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_PROVENANCE_SCHEMA =
  "station.persona_encounter.cross_owner_public_exhibit.v1";
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_CONTRACT_VERSION = 1;
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_REQUIRED_SCOPE =
  "publish_metadata_only_public_exhibit";
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_LIMIT = 6;
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT =
  CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_LIMIT * 4;
const CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SELECT =
  "id, consent_id, slug, public_title, public_summary, public_tags, requester_persona_name_snapshot, counterparty_persona_name_snapshot, status, contract_version, provenance_schema, requester_metadata_approved_at, counterparty_metadata_approved_at, published_at, retracted_at, removed_at";
const PUBLIC_DOCUMENT_SEARCH_FIELDS = ["title", "summary", "body"] as const;
const PUBLIC_DOCUMENT_SEARCH_SELECT =
  "id, title, body, summary, document_type, visibility, provenance_type, discussion_thread_id, space:spaces!space_id(slug)";
const DISCOVER_ERROR_RESPONSES = {
  feed: { error: "Could not load discovery feed.", code: "discover_feed_load_failed" },
  sidebar: { error: "Could not load discovery sidebar.", code: "discover_sidebar_load_failed" },
} as const;

type PublicEncounterExhibitSearchRow = {
  slug: string;
  public_title: string;
  public_summary: string;
  public_tags: string[] | null;
  initiator_name_snapshot: string;
  responder_name_snapshot: string;
  status: string;
  provenance_schema: string;
  published_at: string;
  retracted_at: string | null;
  removed_at: string | null;
  private_session_id: string;
};

type CrossOwnerPublicEncounterExhibitSearchRow = {
  id: string;
  consent_id: string;
  slug: string;
  public_title: string;
  public_summary: string;
  public_tags: string[] | null;
  requester_persona_name_snapshot: string;
  counterparty_persona_name_snapshot: string;
  status: string;
  contract_version: number;
  provenance_schema: string;
  requester_metadata_approved_at: string | null;
  counterparty_metadata_approved_at: string | null;
  published_at: string | null;
  retracted_at: string | null;
  removed_at: string | null;
};

type CrossOwnerPublicEncounterExhibitConsentRow = {
  id: string;
  status: string;
  requested_scopes: string[] | null;
  requested_scope_version: number;
  requester_persona_name_snapshot: string;
  counterparty_persona_name_snapshot: string;
};

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

function hasQueryError(result: unknown) {
  return Boolean((result as { error?: unknown } | null)?.error);
}

function isMissingSingleError(error: unknown) {
  const value = error as { code?: unknown; message?: unknown } | null;
  const message = String(value?.message ?? "");
  return value?.code === "PGRST116" || message.includes("Expected one");
}

function ensureFeaturedVisibilityQuerySucceeded(error: unknown) {
  if (error && !isMissingSingleError(error)) {
    throw new Error("Could not verify featured discovery item visibility.");
  }
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

function safeDeveloperSpaceHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/developer-spaces/${slug}`
    : null;
}

function safePublicEncounterExhibitHref(slug: unknown) {
  return typeof slug === "string" && PUBLIC_ENCOUNTER_EXHIBIT_SLUG_PATTERN.test(slug)
    ? `/encounters/${slug}`
    : null;
}

function safeCrossOwnerPublicEncounterExhibitHref(slug: unknown) {
  return typeof slug === "string" && PUBLIC_ENCOUNTER_EXHIBIT_SLUG_PATTERN.test(slug)
    ? `/encounters/cross-owner#${slug}`
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

function publicDocumentSearchResults(rows: any[], limit = 8) {
  const uniqueRows = [];
  const seenIds = new Set<string>();
  for (const row of rows) {
    if (seenIds.has(row.id)) continue;
    seenIds.add(row.id);
    uniqueRows.push(row);
    if (uniqueRows.length === limit) break;
  }

  return uniqueRows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    summary: row.summary ?? null,
    document_type: row.document_type,
    visibility: row.visibility,
    provenance_type: row.provenance_type,
    discussion_thread_id: row.discussion_thread_id ?? null,
    space: row.space ? { slug: row.space.slug } : null,
  }));
}

function publicDocumentTextSearchQueries(
  sb: ReturnType<typeof getSupabaseAdmin>,
  req: Request,
  q: string,
) {
  const like = `%${q}%`;
  const visibilities = discoverableDocumentVisibilities(req);
  return PUBLIC_DOCUMENT_SEARCH_FIELDS.flatMap((field) =>
    visibilities.map((visibility) =>
      sb
        .from("documents")
        .select(PUBLIC_DOCUMENT_SEARCH_SELECT)
        .eq("status", "published")
        .eq("visibility", visibility)
        .ilike(field, like)
        .limit(8)
    )
  );
}

function developerSpaceSearchResults(rows: any[], limit = 8) {
  const bySlug = new Map<string, any>();
  for (const row of rows) {
    const href = safeDeveloperSpaceHref(row.slug);
    if (!href || bySlug.has(row.slug)) continue;
    bySlug.set(row.slug, row);
  }

  return [...bySlug.values()]
    .sort((a, b) => {
      const byDate = new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
      if (byDate !== 0) return byDate;
      return String(a.project_name ?? "").localeCompare(String(b.project_name ?? ""));
    })
    .slice(0, limit)
    .map((space) => ({
      id: space.id,
      slug: space.slug,
      projectName: space.project_name,
      description: space.description ?? null,
      visibility: space.visibility,
      visualisationType: space.visualisation_type,
      updatedAt: space.updated_at,
      href: `/developer-spaces/${space.slug}`,
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

async function publicEncounterExhibitSearchResults(
  sb: ReturnType<typeof getSupabaseAdmin>,
  q: string,
  limit = PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_LIMIT,
) {
  const term = q.trim();
  if (!term) return [];

  const like = `%${term}%`;
  const fields = [
    "public_title",
    "public_summary",
    "initiator_name_snapshot",
    "responder_name_snapshot",
  ];

  const fieldQueries = fields.map((field) =>
    publicEncounterExhibitBaseQuery(sb)
      .ilike(field, like)
      .limit(PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT)
  );
  const tagQuery = publicEncounterExhibitBaseQuery(sb)
    .contains("public_tags", [term.toLowerCase()])
    .limit(PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT);

  const results = await Promise.all([...fieldQueries, tagQuery]);
  if (results.some(hasQueryError)) return [];

  const rows = await filterSourceBackedPublicEncounterExhibits(
    sb,
    dedupePublicEncounterExhibits(results.flatMap((result) => result.data ?? [])),
  );

  return rows
    .sort((a, b) => {
      const rank = publicEncounterExhibitSearchRank(a, term) - publicEncounterExhibitSearchRank(b, term);
      if (rank !== 0) return rank;
      const byDate = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      if (byDate !== 0) return byDate;
      return String(b.slug).localeCompare(String(a.slug));
    })
    .slice(0, limit)
    .map(serializePublicEncounterExhibitSearchResult);
}

function publicEncounterExhibitBaseQuery(sb: ReturnType<typeof getSupabaseAdmin>) {
  return sb
    .from("persona_encounter_public_exhibits")
    .select(PUBLIC_ENCOUNTER_EXHIBIT_SELECT)
    .eq("status", "published")
    .is("removed_at", null)
    .order("published_at", { ascending: false });
}

function dedupePublicEncounterExhibits(rows: unknown[]) {
  const bySlug = new Map<string, PublicEncounterExhibitSearchRow>();
  for (const row of rows as PublicEncounterExhibitSearchRow[]) {
    if (!isSafePublicEncounterExhibitSearchRow(row) || bySlug.has(row.slug)) continue;
    bySlug.set(row.slug, row);
  }
  return [...bySlug.values()];
}

async function filterSourceBackedPublicEncounterExhibits(
  sb: ReturnType<typeof getSupabaseAdmin>,
  rows: PublicEncounterExhibitSearchRow[],
) {
  if (rows.length === 0) return rows;
  const sessionIds = Array.from(new Set(rows.map((row) => row.private_session_id).filter(Boolean)));
  if (sessionIds.length === 0) return [];

  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .select("id")
    .in("id", sessionIds);
  if (error) return [];

  const existing = new Set((data ?? []).map((row: { id: string }) => row.id));
  return rows.filter((row) => existing.has(row.private_session_id));
}

function isSafePublicEncounterExhibitSearchRow(row: PublicEncounterExhibitSearchRow) {
  return (
    row.status === "published" &&
    !row.removed_at &&
    !row.retracted_at &&
    row.provenance_schema === PUBLIC_ENCOUNTER_EXHIBIT_PROVENANCE_SCHEMA &&
    Boolean(safePublicEncounterExhibitHref(row.slug))
  );
}

function publicEncounterExhibitSearchRank(row: PublicEncounterExhibitSearchRow, term: string) {
  const q = term.toLowerCase();
  if (row.public_title?.toLowerCase().includes(q)) return 0;
  if (publicEncounterExhibitTags(row).some((tag) => tag.toLowerCase() === q || tag.toLowerCase().includes(q))) return 1;
  if (row.initiator_name_snapshot?.toLowerCase().includes(q)) return 2;
  if (row.responder_name_snapshot?.toLowerCase().includes(q)) return 2;
  if (row.public_summary?.toLowerCase().includes(q)) return 3;
  return 4;
}

function serializePublicEncounterExhibitSearchResult(row: PublicEncounterExhibitSearchRow) {
  return {
    slug: row.slug,
    routeHref: `/encounters/${row.slug}`,
    title: row.public_title,
    summary: row.public_summary,
    tags: publicEncounterExhibitTags(row),
    personas: {
      label: "Same-owner persona display snapshots",
      initiatorName: row.initiator_name_snapshot,
      responderName: row.responder_name_snapshot,
    },
    status: "published" as const,
    publishedAt: row.published_at,
    type: "encounter_exhibit" as const,
    label: "Public encounter exhibit",
    provenance: {
      label: "Metadata-only public encounter exhibit",
      ownerCurated: true,
      public: true,
      sameOwner: true,
      source: "Derived from a private same-owner saved artifact",
      note: "Owner-authored public metadata only; no private encounter material is included.",
    },
  };
}

function publicEncounterExhibitTags(row: PublicEncounterExhibitSearchRow) {
  return Array.isArray(row.public_tags)
    ? row.public_tags.filter((tag): tag is string => typeof tag === "string")
    : [];
}

async function crossOwnerPublicEncounterExhibitSearchResults(
  sb: ReturnType<typeof getSupabaseAdmin>,
  q: string,
  limit = CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_LIMIT,
) {
  const term = q.trim();
  if (!term) return [];

  const like = `%${term}%`;
  const fields = [
    "public_title",
    "public_summary",
    "requester_persona_name_snapshot",
    "counterparty_persona_name_snapshot",
  ];

  const fieldQueries = fields.map((field) =>
    crossOwnerPublicEncounterExhibitBaseQuery(sb)
      .ilike(field, like)
      .limit(CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT)
  );
  const tagQuery = crossOwnerPublicEncounterExhibitBaseQuery(sb)
    .contains("public_tags", [term.toLowerCase()])
    .limit(CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SEARCH_QUERY_LIMIT);

  const results = await Promise.all([...fieldQueries, tagQuery]);
  if (results.some(hasQueryError)) return [];

  const rows = await filterConsentBackedCrossOwnerPublicEncounterExhibits(
    sb,
    dedupeCrossOwnerPublicEncounterExhibits(results.flatMap((result) => result.data ?? [])),
  );

  return rows
    .sort((a, b) => {
      const rank = crossOwnerPublicEncounterExhibitSearchRank(a.row, term) -
        crossOwnerPublicEncounterExhibitSearchRank(b.row, term);
      if (rank !== 0) return rank;
      const byDate = new Date(b.row.published_at ?? 0).getTime() - new Date(a.row.published_at ?? 0).getTime();
      if (byDate !== 0) return byDate;
      return String(b.row.slug).localeCompare(String(a.row.slug));
    })
    .slice(0, limit)
    .map(({ row }) => serializeCrossOwnerPublicEncounterExhibitSearchResult(row));
}

function crossOwnerPublicEncounterExhibitBaseQuery(sb: ReturnType<typeof getSupabaseAdmin>) {
  return sb
    .from("persona_encounter_cross_owner_public_exhibits")
    .select(CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_SELECT)
    .eq("status", "published")
    .is("removed_at", null)
    .is("retracted_at", null)
    .order("published_at", { ascending: false });
}

function dedupeCrossOwnerPublicEncounterExhibits(rows: unknown[]) {
  const bySlug = new Map<string, CrossOwnerPublicEncounterExhibitSearchRow>();
  for (const row of rows as CrossOwnerPublicEncounterExhibitSearchRow[]) {
    if (!isSafeCrossOwnerPublicEncounterExhibitSearchRow(row) || bySlug.has(row.slug)) continue;
    bySlug.set(row.slug, row);
  }
  return [...bySlug.values()];
}

async function filterConsentBackedCrossOwnerPublicEncounterExhibits(
  sb: ReturnType<typeof getSupabaseAdmin>,
  rows: CrossOwnerPublicEncounterExhibitSearchRow[],
) {
  if (rows.length === 0) {
    return [] as Array<{
      row: CrossOwnerPublicEncounterExhibitSearchRow;
      consent: CrossOwnerPublicEncounterExhibitConsentRow;
    }>;
  }

  const consentIds = Array.from(new Set(rows.map((row) => row.consent_id).filter(Boolean)));
  if (consentIds.length === 0) return [];

  const { data, error } = await sb
    .from("persona_encounter_cross_owner_consents")
    .select("id, status, requested_scopes, requested_scope_version, requester_persona_name_snapshot, counterparty_persona_name_snapshot")
    .in("id", consentIds);
  if (error) return [];

  const consents = new Map(
    ((data ?? []) as CrossOwnerPublicEncounterExhibitConsentRow[]).map((row) => [row.id, row]),
  );

  const readableRows: Array<{
    row: CrossOwnerPublicEncounterExhibitSearchRow;
    consent: CrossOwnerPublicEncounterExhibitConsentRow;
  }> = [];
  for (const row of rows) {
    const consent = consents.get(row.consent_id);
    if (!consent || !crossOwnerPublicEncounterExhibitIsPubliclyReadable(row, consent)) continue;
    readableRows.push({ row, consent });
  }
  return readableRows;
}

function isSafeCrossOwnerPublicEncounterExhibitSearchRow(row: CrossOwnerPublicEncounterExhibitSearchRow) {
  return (
    row.status === "published" &&
    Boolean(row.published_at) &&
    !row.removed_at &&
    !row.retracted_at &&
    row.contract_version === CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_CONTRACT_VERSION &&
    row.provenance_schema === CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_PROVENANCE_SCHEMA &&
    Boolean(row.requester_metadata_approved_at) &&
    Boolean(row.counterparty_metadata_approved_at) &&
    Boolean(safeCrossOwnerPublicEncounterExhibitHref(row.slug))
  );
}

function crossOwnerPublicEncounterExhibitIsPubliclyReadable(
  row: CrossOwnerPublicEncounterExhibitSearchRow,
  consent: CrossOwnerPublicEncounterExhibitConsentRow,
) {
  return (
    consent.status === "approved" &&
    consent.requested_scope_version === CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_CONTRACT_VERSION &&
    Array.isArray(consent.requested_scopes) &&
    consent.requested_scopes.includes(CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_REQUIRED_SCOPE) &&
    row.requester_persona_name_snapshot === consent.requester_persona_name_snapshot &&
    row.counterparty_persona_name_snapshot === consent.counterparty_persona_name_snapshot
  );
}

function crossOwnerPublicEncounterExhibitSearchRank(
  row: CrossOwnerPublicEncounterExhibitSearchRow,
  term: string,
) {
  const q = term.toLowerCase();
  if (row.public_title?.toLowerCase().includes(q)) return 0;
  if (crossOwnerPublicEncounterExhibitTags(row).some((tag) => tag.toLowerCase() === q || tag.toLowerCase().includes(q))) {
    return 1;
  }
  if (row.requester_persona_name_snapshot?.toLowerCase().includes(q)) return 2;
  if (row.counterparty_persona_name_snapshot?.toLowerCase().includes(q)) return 2;
  if (row.public_summary?.toLowerCase().includes(q)) return 3;
  return 4;
}

function serializeCrossOwnerPublicEncounterExhibitSearchResult(row: CrossOwnerPublicEncounterExhibitSearchRow) {
  return {
    slug: row.slug,
    routeHref: `/encounters/cross-owner#${row.slug}`,
    title: row.public_title,
    summary: row.public_summary,
    tags: crossOwnerPublicEncounterExhibitTags(row),
    participants: {
      label: "Cross-owner consent display snapshots",
      requesterName: row.requester_persona_name_snapshot,
      counterpartyName: row.counterparty_persona_name_snapshot,
    },
    status: "published" as const,
    contractVersion: CROSS_OWNER_PUBLIC_ENCOUNTER_EXHIBIT_CONTRACT_VERSION,
    publishedAt: row.published_at,
    type: "cross_owner_encounter_exhibit" as const,
    label: "Cross-owner encounter exhibit",
    provenance: {
      label: "Cross-owner metadata-only public encounter exhibit",
      ownerCurated: true,
      public: true,
      crossOwner: true,
      metadataOnly: true,
      bilateralApproval: true,
      routeListed: true,
      discoverable: true,
      indexed: false,
      source: "Derived from a bilateral cross-owner consent metadata contract",
      note: "Discover search lists approved public metadata only.",
    },
  };
}

function crossOwnerPublicEncounterExhibitTags(row: CrossOwnerPublicEncounterExhibitSearchRow) {
  return Array.isArray(row.public_tags)
    ? row.public_tags.filter((tag): tag is string => typeof tag === "string")
    : [];
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
      id, title, body, summary, document_type, published_at, created_at, visibility,
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
    const { data, error } = await sb
      .from("documents")
      .select("id, status, visibility")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    if (!data || data.status !== "published") return false;
    if (data.visibility === "public") return true;
    return (data.visibility === "community" || data.visibility === "members") && canSeeCommunityDocuments(req);
  }

  if (item.item_type === "thread") {
    const { data, error } = await sb
      .from("threads")
      .select("id, status, visibility, is_hidden, linked_document_id")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    if (!data || data.status !== "active" || data.is_hidden || data.linked_document_id) return false;
    if (data.visibility === "public") return true;
    return data.visibility === "community" && canSeeCommunityDocuments(req);
  }

  if (item.item_type === "space") {
    const { data, error } = await sb
      .from("spaces")
      .select("id, is_public")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    return Boolean(data?.is_public);
  }

  if (item.item_type === "persona") {
    const { data, error } = await sb
      .from("personas")
      .select("id, visibility")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    return data?.visibility === "public";
  }

  if (item.item_type === "developer_space") {
    const { data, error } = await sb
      .from("developer_spaces")
      .select("id, visibility")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    if (data?.visibility === "public") return true;
    return data?.visibility === "community" && canSeeCommunityDocuments(req);
  }

  return false;
}

async function resolveFeaturedFeedItem(item: any, req: Request) {
  const sb = getSupabaseAdmin();

  if (item.item_type === "document") {
    const { data, error } = await sb
      .from("documents")
      .select("id, status, visibility, space:spaces!space_id(slug, title)")
      .eq("id", item.item_id)
      .single();
    ensureFeaturedVisibilityQuerySucceeded(error);
    if (!data || data.status !== "published") return null;
    if (data.visibility !== "public" && !((data.visibility === "community" || data.visibility === "members") && canSeeCommunityDocuments(req))) {
      return null;
    }

    const href = safeSpaceDocumentHref((data.space as any)?.slug, data.id);
    if (!href) return null;
    return {
      ...item,
      href,
      space: data.space ?? null,
    };
  }

  return await canShowFeaturedItem(item, req) ? item : null;
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
  if (spaceResults.some(hasQueryError)) {
    throw new Error("Could not load Developer Space feed items.");
  }

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
    if (hasQueryError(nodesResult) || hasQueryError(eventsResult)) {
      throw new Error("Could not load Developer Space feed signals.");
    }

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

function safeSpaceHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/space/${slug}`
    : null;
}

function safeSpaceDocumentHref(spaceSlug: unknown, documentId: unknown) {
  const spaceHref = safeSpaceHref(spaceSlug);
  return spaceHref && typeof documentId === "string" ? `${spaceHref}/documents/${documentId}` : null;
}

async function publicSpaceFeedItems(tab: string, offset: number, limit: number) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("spaces")
    .select("id, slug, title, short_description, theme, created_at, updated_at")
    .eq("is_public", true)
    .order(tab === "rising" ? "updated_at" : "created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error("Could not load public Space feed items.");

  return (data ?? []).flatMap((space: any) => {
    const href = safeSpaceHref(space.slug);
    if (!href) return [];

    return [{
      id: space.id,
      type: "space" as const,
      title: space.title,
      excerpt: excerpt(space.short_description),
      href,
      meta: "Public Space",
      visibility: "public",
      space: { slug: space.slug, title: space.title },
      author: null,
      persona: null,
      score: 0,
      replyCount: 0,
      createdAt: space.updated_at ?? space.created_at,
      promoted: false,
    }];
  });
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
    const [docResults, threadResults, developerSpaceItems, spaceItems] = await Promise.all([
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
      publicSpaceFeedItems(tab, offset, limit),
    ]);
    if (docResults.some(hasQueryError) || threadResults.some(hasQueryError)) {
      return res.status(500).json(DISCOVER_ERROR_RESPONSES.feed);
    }

    // Normalise into a unified feed shape
    const docRows = docResults.flatMap((result) => result.data ?? []);
    const docItems = docRows.flatMap((d: any) => {
      const href = safeSpaceDocumentHref(d.space?.slug, d.id);
      if (!href) return [];

      return [{
        id:          d.id,
        type:        "document" as const,
        title:       d.title,
        excerpt:     excerpt(d.summary ?? d.body),
        href,
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
      }];
    });

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
    let items = [...docItems, ...threadItems, ...developerSpaceItems, ...spaceItems];

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
      const { data: featured, error: featuredError } = await sb
        .from("discover_feed")
        .select("*")
        .eq("event_type", "featured")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (featuredError) return res.status(500).json(DISCOVER_ERROR_RESPONSES.feed);

      const visible = [];
      for (const item of featured ?? []) {
        const resolved = await resolveFeaturedFeedItem(item, req);
        if (resolved) visible.push(resolved);
      }

      return res.json({ items: visible, tab });
    } else {
      // New: most recent first
      items = items.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json({ items: items.slice(0, limit), tab });
  } catch {
    res.status(500).json(DISCOVER_ERROR_RESPONSES.feed);
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
    if (
      hasQueryError(recentDocs) ||
      hasQueryError(recentThreads) ||
      hasQueryError(personas) ||
      hasQueryError(membersRes) ||
      hasQueryError(personasRes) ||
      hasQueryError(docsRes) ||
      hasQueryError(threadsRes)
    ) {
      return res.status(500).json(DISCOVER_ERROR_RESPONSES.sidebar);
    }

    res.json({
      recentPosts: [
        ...(recentDocs.data ?? []).flatMap((d: any) => {
          const href = safeSpaceDocumentHref(d.space?.slug, d.id);
          return href
            ? [{
                id: d.id, title: d.title, type: "document",
                href,
                date: d.published_at,
              }]
            : [];
        }),
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
  } catch {
    res.status(500).json(DISCOVER_ERROR_RESPONSES.sidebar);
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
      publicEncounterExhibits: [],
      crossOwnerPublicEncounterExhibits: [],
      salons: [],
      privateResults: req.user ? emptyPrivateSearchResults() : undefined,
    });
  }
  const sb = getSupabaseAdmin();

  const [
    docResults,
    threadResults,
    spaces,
    personas,
    projectResults,
    developerSpaceResults,
    publicEncounterExhibits,
    crossOwnerPublicEncounterExhibits,
    salonResults,
    privateResults,
  ] = await Promise.all([
    Promise.all(publicDocumentTextSearchQueries(sb, req, q)),
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
    sb.from("personas").select("name, short_description, visibility, avatar_url, public_slug, owner_user_id, public_chat_enabled, public_anonymous_chat_enabled").eq("visibility", "public").ilike("name", `%${q}%`).limit(12),
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
    Promise.all(discoverableDeveloperSpaceVisibilities(req).flatMap((visibility) =>
      ["project_name", "description", "slug"].map((field) =>
        sb
          .from("developer_spaces")
          .select("id, slug, project_name, description, visibility, visualisation_type, updated_at")
          .eq("visibility", visibility)
          .ilike(field, `%${q}%`)
          .limit(6)
      )
    )),
    publicEncounterExhibitSearchResults(sb, q),
    crossOwnerPublicEncounterExhibitSearchResults(sb, q),
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
    documents: publicDocumentSearchResults(docResults.flatMap((result) => result.data ?? [])),
    threads:   threadResults.flatMap((result) => result.data ?? []).filter((thread: any) => !thread.linked_document_id).slice(0, 8),
    spaces:    (spaces.data ?? []).map((space: any) => ({
      ...space,
      presentation: normalizeSpacePresentation(space.theme),
    })),
    personas:  await publicPersonaSearchResults(sb, personas.data ?? []),
    projects: publicProjectSearchResults(projectResults.flatMap((result) => result.data ?? [])),
    developerSpaces: developerSpaceSearchResults(developerSpaceResults.flatMap((result) => result.data ?? [])),
    publicEncounterExhibits,
    crossOwnerPublicEncounterExhibits,
    salons: publicSalonSearchResults(salonResults.flatMap((result) => result.data ?? [])).slice(0, 6),
    privateResults,
  });
});
