import { Router, type Response } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedUser } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import {
  PUBLIC_PERSONA_CONTEXT_PREVIEW_QUERY_MAX_LENGTH,
  isSafePublicPersonaSlug,
  normalizePublicPersonaContextQuery,
  publicContextSourceExcerpt,
  publicContextSourceMatchesQuery,
  serializePersonaPublicFields,
  serializePublicPersonaContextPreview,
  serializePublicPersona,
  slugifyPublicPersonaName,
} from "../lib/persona-serialization";
import { ownerCanExposeExistingPublicPersonas } from "../lib/public-persona-eligibility";
import { canCreatePersona, canCreatePublicPersona, tierLimits } from "@station/auth/permissions";
import type { AuthUser, PublicPersonaContextSource, PublicPersonaEligibility } from "@station/types";
import {
  createPersonaHandoff,
  ensurePersonaLayerProfile,
  listPersonaHandoffs,
  listPersonaLifecycleEvents,
  recordPersonaLifecycleEvent,
  updatePersonaLayerProfile,
} from "../services/persona-lifecycle.service";
import { invalidateOperationalCacheForChange } from "../services/operational-cache.service";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  shortDescription: z.string().max(300).optional(),
  longDescription: z.string().max(5000).optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  provider: z.enum(["platform", "openai", "anthropic", "deepseek", "gemini"]).default("platform"),
  awakeningPrompt: z.string().max(4000).optional(),
  styleNotes: z.string().max(4000).optional(),
});

const updateSchema = createSchema.extend({
  skipIntegrityPreflight: z.boolean().optional(),
}).partial();

const jsonObjectSchema = z.record(z.unknown());

const layerPatchSchema = z.object({
  soul: jsonObjectSchema.optional(),
  body: jsonObjectSchema.optional(),
  faculty: jsonObjectSchema.optional(),
  skill: jsonObjectSchema.optional(),
  evolution: jsonObjectSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one persona layer must be provided.",
});

const handoffSchema = z.object({
  fromPersonaId: z.string().uuid().nullable().optional(),
  conversationId: z.string().uuid().nullable().optional(),
  summary: z.string().max(4000).optional(),
  pendingTasks: z.array(z.unknown()).max(20).optional(),
  emotionalContext: jsonObjectSchema.optional(),
  continuityRefs: z.array(z.unknown()).max(20).optional(),
});

export const personasRouter = Router();

const PUBLIC_PERSONA_DOCUMENT_LIMIT = 6;
const PUBLIC_PERSONA_DISCUSSION_LIMIT = 4;
const PUBLIC_PERSONA_CONTEXT_DOCUMENT_SELECT =
  "id, title, slug, body, status, visibility, published_at, created_at, space_id, persona_id, source_persona_id, discussion_thread_id";
const PUBLIC_PERSONA_CONTEXT_THREAD_SELECT =
  "id, title, body, status, visibility, is_hidden, comment_count, category_id, linked_document_id, created_at";

const publicContextPreviewQuerySchema = z.object({
  query: z.preprocess(
    (value) => Array.isArray(value) ? value[0] : value,
    z.string().max(PUBLIC_PERSONA_CONTEXT_PREVIEW_QUERY_MAX_LENGTH).optional()
  ),
});

async function loadEligiblePublicPersonaBySlug(publicSlug: string, select: string): Promise<any | null> {
  if (!isSafePublicPersonaSlug(publicSlug)) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select(select)
    .eq("public_slug", publicSlug)
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as any;
  const eligible = await ownerCanExposeExistingPublicPersonas(sb, row.owner_user_id);
  if (!eligible) return null;

  return row;
}

function uniqById(rows: any[]) {
  const byId = new Map<string, any>();
  for (const row of rows) {
    if (row?.id && !byId.has(row.id)) byId.set(row.id, row);
  }
  return [...byId.values()];
}

function byId(rows: any[]) {
  return new Map(rows.filter((row) => row?.id).map((row) => [row.id, row]));
}

async function loadPublicRouteableDocumentsForPersona(sb: ReturnType<typeof getSupabaseAdmin>, personaId: string) {
  const [direct, sourced] = await Promise.all([
    sb
      .from("documents")
      .select(PUBLIC_PERSONA_CONTEXT_DOCUMENT_SELECT)
      .eq("persona_id", personaId)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false })
      .limit(PUBLIC_PERSONA_DOCUMENT_LIMIT),
    sb
      .from("documents")
      .select(PUBLIC_PERSONA_CONTEXT_DOCUMENT_SELECT)
      .eq("source_persona_id", personaId)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false })
      .limit(PUBLIC_PERSONA_DOCUMENT_LIMIT),
  ]);

  const documents = uniqById([...(direct.data ?? []), ...(sourced.data ?? [])])
    .sort((a, b) => new Date(b.published_at ?? b.created_at ?? 0).getTime() - new Date(a.published_at ?? a.created_at ?? 0).getTime())
    .slice(0, PUBLIC_PERSONA_DOCUMENT_LIMIT);
  const spaceIds = [...new Set(documents.map((document) => document.space_id).filter(Boolean))];
  if (spaceIds.length === 0) return [];

  const { data: spaces } = await sb
    .from("spaces")
    .select("id, slug, title, is_public")
    .in("id", spaceIds)
    .eq("is_public", true);
  const spacesById = byId(spaces ?? []);

  return documents
    .map((document) => ({ ...document, space: spacesById.get(document.space_id) ?? null }))
    .filter((document) => document.space?.slug);
}

async function loadPublicDiscussionSourcesForDocuments(
  sb: ReturnType<typeof getSupabaseAdmin>,
  documents: any[],
) {
  const threadIds = [...new Set(documents.map((document) => document.discussion_thread_id).filter(Boolean))];
  if (threadIds.length === 0) return [];

  const { data: threads } = await sb
    .from("threads")
    .select(PUBLIC_PERSONA_CONTEXT_THREAD_SELECT)
    .in("id", threadIds)
    .eq("status", "active")
    .eq("visibility", "public")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(PUBLIC_PERSONA_DISCUSSION_LIMIT);

  const routeableThreads = (threads ?? []).filter((thread) =>
    documents.some((document) => document.id === thread.linked_document_id && document.discussion_thread_id === thread.id)
  );
  const categoryIds = [...new Set(routeableThreads.map((thread) => thread.category_id).filter(Boolean))];
  if (categoryIds.length === 0) return [];

  const { data: categories } = await sb
    .from("forum_categories")
    .select("id, slug, title")
    .in("id", categoryIds);
  const categoriesById = byId(categories ?? []);

  return routeableThreads
    .map((thread) => ({ ...thread, category: categoriesById.get(thread.category_id) ?? null }))
    .filter((thread) => thread.category?.slug)
    .slice(0, PUBLIC_PERSONA_DISCUSSION_LIMIT);
}

async function buildPublicPersonaContextSources(sb: ReturnType<typeof getSupabaseAdmin>, persona: any, query: string) {
  const documents = await loadPublicRouteableDocumentsForPersona(sb, persona.id);
  const discussionThreads = await loadPublicDiscussionSourcesForDocuments(sb, documents);

  const documentSources: PublicPersonaContextSource[] = documents.map((document) => ({
    type: "published_document",
    title: document.title,
    href: `/space/${document.space.slug}/documents/${document.id}`,
    label: "Published document",
    excerpt: publicContextSourceExcerpt(query, document.body, document.title),
    matchesQuery: publicContextSourceMatchesQuery(query, document.title, document.body),
  }));

  const discussionSources: PublicPersonaContextSource[] = discussionThreads.map((thread) => ({
    type: "public_discussion",
    title: thread.title,
    href: `/forums/${thread.category.slug}/${thread.id}`,
    label: "Public discussion",
    excerpt: publicContextSourceExcerpt(query, thread.body, thread.title),
    matchesQuery: publicContextSourceMatchesQuery(query, thread.title, thread.body),
  }));

  const sources = [...documentSources, ...discussionSources].sort((a, b) =>
    Number(b.matchesQuery) - Number(a.matchesQuery) || a.title.localeCompare(b.title)
  );

  return {
    sources,
    counts: {
      publishedDocuments: documentSources.length,
      publicDiscussions: discussionSources.length,
    },
  };
}

personasRouter.get("/public/:publicSlug/context-preview", async (req, res) => {
  const parsed = publicContextPreviewQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Public persona context preview query is too long." });
  }

  const data = await loadEligiblePublicPersonaBySlug(
    req.params.publicSlug,
    "id, name, short_description, visibility, avatar_url, public_slug, owner_user_id"
  );
  if (!data) return res.status(404).json({ error: "Public persona not found." });

  const query = normalizePublicPersonaContextQuery(parsed.data.query);
  const catalog = await buildPublicPersonaContextSources(getSupabaseAdmin(), data, query);
  return res.json(serializePublicPersonaContextPreview(data, query, catalog));
});

// Public readback route. This must stay before the authenticated router guard.
personasRouter.get("/public/:publicSlug", async (req, res) => {
  const data = await loadEligiblePublicPersonaBySlug(
    req.params.publicSlug,
    "name, short_description, visibility, avatar_url, public_slug, owner_user_id"
  );
  if (!data) return res.status(404).json({ error: "Public persona not found." });

  return res.json({ persona: serializePublicPersona(data) });
});

personasRouter.use(requireAuth);

function serializePersona(row: any, continuity?: any, publicEligibility?: PublicPersonaEligibility) {
  if (!row) return row;

  const persona: Record<string, unknown> = {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    visibility: row.visibility,
    provider: row.provider,
    avatarUrl: row.avatar_url,
    awakeningPrompt: row.awakening_prompt,
    styleNotes: row.style_notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    continuity,
  };

  if (publicEligibility) {
    persona.publicReadback = {
      eligibility: publicEligibility,
      publicFields: serializePersonaPublicFields(row),
    };
  }

  return persona;
}

function toAuthUser(user: AuthenticatedUser): AuthUser {
  return {
    id: user.id,
    tier: user.tier,
    isAdmin: user.isAdmin,
    email: user.email,
  };
}

function publicPersonaEligibility(
  user: AuthUser,
  existingPublicPersonaCount: number
): PublicPersonaEligibility {
  const limit = user.isAdmin ? -1 : tierLimits(user).publicPersonas;
  const eligible = canCreatePublicPersona(user, existingPublicPersonaCount);
  const blockers: string[] = [];

  if (!eligible && limit === 0) {
    blockers.push("public_personas_not_available_for_tier");
  } else if (!eligible) {
    blockers.push("public_persona_limit_reached");
  }

  return {
    eligible,
    limit,
    used: existingPublicPersonaCount,
    remaining: limit < 0 ? null : Math.max(0, limit - existingPublicPersonaCount),
    blockers,
  };
}

async function loadPublicPersonaEligibility(ownerUserId: string, user: AuthUser) {
  const sb = getSupabaseAdmin();
  const { count } = await sb
    .from("personas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", ownerUserId)
    .eq("visibility", "public");

  return publicPersonaEligibility(user, count ?? 0);
}

async function assertPublicPersonaAllowed(res: Response, ownerUserId: string, user: AuthUser) {
  const eligibility = await loadPublicPersonaEligibility(ownerUserId, user);
  if (!eligibility.eligible) {
    res.status(403).json({
      error: "Your tier does not allow public personas.",
      publicPersonaEligibility: eligibility,
    });
    return null;
  }
  return eligibility;
}

async function publicSlugAvailable(sb: ReturnType<typeof getSupabaseAdmin>, candidate: string, personaId?: string) {
  const { data } = await sb
    .from("personas")
    .select("id")
    .eq("public_slug", candidate)
    .maybeSingle();

  return !data || data.id === personaId;
}

async function generateUniquePublicSlug(
  sb: ReturnType<typeof getSupabaseAdmin>,
  name: string,
  personaId?: string
) {
  const base = slugifyPublicPersonaName(name);
  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    if (await publicSlugAvailable(sb, candidate, personaId)) return candidate;
  }

  throw new Error("Could not generate a unique public persona slug.");
}

function serializeLayerProfile(row: any) {
  if (!row) return row;
  return {
    personaId: row.persona_id,
    ownerUserId: row.owner_user_id,
    soul: row.soul ?? {},
    body: row.body ?? {},
    faculty: row.faculty ?? {},
    skill: row.skill ?? {},
    evolution: row.evolution ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeLifecycleEvent(row: any) {
  return {
    id: row.id,
    personaId: row.persona_id,
    ownerUserId: row.owner_user_id,
    eventType: row.event_type,
    eventLabel: row.event_label,
    eventData: row.event_data ?? {},
    createdAt: row.created_at,
  };
}

function serializeHandoff(row: any) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    fromPersonaId: row.from_persona_id,
    toPersonaId: row.to_persona_id,
    conversationId: row.conversation_id,
    summary: row.summary,
    pendingTasks: row.pending_tasks ?? [],
    emotionalContext: row.emotional_context ?? {},
    continuityRefs: row.continuity_refs ?? [],
    status: row.status,
    createdAt: row.created_at,
    consumedAt: row.consumed_at,
  };
}

async function loadContinuitySummary(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();

  const [
    memory,
    canon,
    files,
    integritySessions,
    calibrationSessions,
    archivedChats,
    continuityCandidates,
    continuityRecords,
  ] = await Promise.all([
    sb
      .from("memory_items")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("canon_items")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("persona_files")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    (sb as any)
      .from("integrity_sessions")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("calibration_sessions")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("archived_chat_transcripts")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("continuity_candidates")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("continuity_records")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
  ]);

  return {
    memoryCount: memory.count ?? 0,
    canonCount: canon.count ?? 0,
    archiveFileCount: files.count ?? 0,
    archivedChatCount: archivedChats.count ?? 0,
    continuityCandidateCount: continuityCandidates.count ?? 0,
    continuityRecordCount: continuityRecords.count ?? 0,
    integritySessionCount: (integritySessions.count ?? 0) + (calibrationSessions.count ?? 0),
  };
}

async function loadOwnedPersona(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("personas")
    .select("*")
    .eq("id", personaId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  return data;
}

// -- List user's personas ------------------------------------------------------
personasRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select("id, name, short_description, visibility, provider, avatar_url, sort_order, created_at")
    .eq("owner_user_id", req.user!.id)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ personas: (data ?? []).map((row) => serializePersona(row)) });
});

// -- Get a single persona ------------------------------------------------------
personasRouter.get("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Persona not found." });

  const isOwner = data.owner_user_id === req.user!.id;
  if (!isOwner && data.visibility === "private") {
    return res.status(403).json({ error: "Not authorised." });
  }

  if (!isOwner) {
    return res.json({ persona: serializePublicPersona(data) });
  }

  const authUser = toAuthUser(req.user!);
  const [continuity, publicEligibility] = await Promise.all([
    loadContinuitySummary(data.id, req.user!.id),
    loadPublicPersonaEligibility(req.user!.id, authUser),
  ]);
  return res.json({ persona: serializePersona(data, continuity, publicEligibility) });
});

// -- Persona layer architecture, lifecycle, and handoffs ----------------------
personasRouter.get("/:id/architecture", async (req, res) => {
  const persona = await loadOwnedPersona(req.params.id, req.user!.id);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  try {
    const [profile, lifecycleEvents, handoffs] = await Promise.all([
      ensurePersonaLayerProfile(persona),
      listPersonaLifecycleEvents(persona.id, req.user!.id),
      listPersonaHandoffs(persona.id, req.user!.id),
    ]);

    return res.json({
      profile: serializeLayerProfile(profile),
      lifecycleEvents: lifecycleEvents.map(serializeLifecycleEvent),
      handoffs: handoffs.map(serializeHandoff),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load persona architecture.";
    return res.status(500).json({ error: message });
  }
});

personasRouter.patch("/:id/architecture", async (req, res) => {
  const parsed = layerPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const persona = await loadOwnedPersona(req.params.id, req.user!.id);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  try {
    const profile = await updatePersonaLayerProfile(persona, parsed.data);
    await invalidateOperationalCacheForChange({
      type: "persona",
      ownerUserId: req.user!.id,
      personaId: persona.id,
      resourceId: persona.id,
      operation: "architecture",
    }).catch(() => undefined);
    return res.json({ profile: serializeLayerProfile(profile) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update persona architecture.";
    return res.status(500).json({ error: message });
  }
});

personasRouter.post("/:id/handoffs", async (req, res) => {
  const parsed = handoffSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const targetPersona = await loadOwnedPersona(req.params.id, req.user!.id);
  if (!targetPersona) return res.status(404).json({ error: "Persona not found." });

  if (parsed.data.fromPersonaId) {
    const sourcePersona = await loadOwnedPersona(parsed.data.fromPersonaId, req.user!.id);
    if (!sourcePersona) return res.status(404).json({ error: "Source persona not found." });
  }

  if (parsed.data.conversationId) {
    const sb = getSupabaseAdmin();
    const { data: conversation } = await sb
      .from("conversations")
      .select("id")
      .eq("id", parsed.data.conversationId)
      .eq("owner_user_id", req.user!.id)
      .maybeSingle();

    if (!conversation) return res.status(404).json({ error: "Conversation not found." });
  }

  try {
    const handoff = await createPersonaHandoff({
      ownerUserId: req.user!.id,
      fromPersonaId: parsed.data.fromPersonaId,
      toPersonaId: targetPersona.id,
      conversationId: parsed.data.conversationId,
      summary: parsed.data.summary,
      pendingTasks: parsed.data.pendingTasks,
      emotionalContext: parsed.data.emotionalContext,
      continuityRefs: parsed.data.continuityRefs,
    });
    return res.status(201).json({ handoff: serializeHandoff(handoff) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create persona handoff.";
    return res.status(500).json({ error: message });
  }
});

// -- Create a persona (requires private tier minimum) --------------------------
personasRouter.post("/", requireTier("private"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  // Check persona count limit for this tier
  const { count } = await sb
    .from("personas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId);

  const authUser: AuthUser = { id: userId, tier: req.user!.tier, isAdmin: req.user!.isAdmin };
  if (!canCreatePersona(authUser, count ?? 0)) {
    return res.status(403).json({
      error: `You have reached the persona limit for your tier (${req.user!.tier}). Upgrade to create more.`,
    });
  }

  if (parsed.data.visibility === "public") {
    const publicEligibility = await assertPublicPersonaAllowed(res, userId, authUser);
    if (!publicEligibility) return;
  }
  const publicSlug = parsed.data.visibility === "public"
    ? await generateUniquePublicSlug(sb, parsed.data.name)
    : null;

  const { data, error } = await sb
    .from("personas")
    .insert({
      owner_user_id: userId,
      name: parsed.data.name,
      short_description: parsed.data.shortDescription ?? null,
      long_description: parsed.data.longDescription ?? null,
      visibility: parsed.data.visibility,
      public_slug: publicSlug,
      provider: parsed.data.provider,
      awakening_prompt: parsed.data.awakeningPrompt ?? null,
      style_notes: parsed.data.styleNotes ?? null,
      sort_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  await ensurePersonaLayerProfile(data).catch(() => undefined);
  await recordPersonaLifecycleEvent({
    personaId: data.id,
    ownerUserId: userId,
    eventType: "created",
    eventLabel: "Persona created",
  }).catch(() => undefined);
  await invalidateOperationalCacheForChange({
    type: "persona",
    ownerUserId: userId,
    personaId: data.id,
    resourceId: data.id,
  }).catch(() => undefined);
  const publicEligibility = await loadPublicPersonaEligibility(userId, authUser);
  return res.status(201).json({ persona: serializePersona(data, undefined, publicEligibility) });
});

// -- Update a persona ----------------------------------------------------------
personasRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();

  const { data: existing } = await sb
    .from("personas")
    .select("id, name, owner_user_id, visibility, public_slug")
    .eq("id", req.params.id)
    .single();

  if (!existing || existing.owner_user_id !== req.user!.id) {
    return res.status(404).json({ error: "Persona not found." });
  }

  const authUser = toAuthUser(req.user!);
  if (
    parsed.data.visibility === "public" &&
    existing.visibility !== "public"
  ) {
    const publicEligibility = await assertPublicPersonaAllowed(res, req.user!.id, authUser);
    if (!publicEligibility) return;
  }

  if (
    parsed.data.visibility === "public" &&
    existing.visibility !== "public" &&
    !parsed.data.skipIntegrityPreflight
  ) {
    const { count } = await (sb as any)
      .from("integrity_sessions")
      .select("id", { count: "exact", head: true })
      .eq("persona_id", existing.id)
      .eq("owner_user_id", req.user!.id)
      .eq("status", "completed")
      .in("session_type", ["pre_publication", "initial", "periodic"]);

    if ((count ?? 0) === 0) {
      return res.status(409).json({
        error: `Before making ${existing.name} public, run a short Integrity Session or retry with skipIntegrityPreflight.`,
        integrityRequired: true,
        sessionType: "pre_publication",
      });
    }
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.name !== undefined)             updatePayload.name = parsed.data.name;
  if (parsed.data.shortDescription !== undefined) updatePayload.short_description = parsed.data.shortDescription;
  if (parsed.data.longDescription !== undefined)  updatePayload.long_description = parsed.data.longDescription;
  if (parsed.data.visibility !== undefined)       updatePayload.visibility = parsed.data.visibility;
  if (parsed.data.provider !== undefined)         updatePayload.provider = parsed.data.provider;
  if (parsed.data.awakeningPrompt !== undefined)  updatePayload.awakening_prompt = parsed.data.awakeningPrompt;
  if (parsed.data.styleNotes !== undefined)       updatePayload.style_notes = parsed.data.styleNotes;
  const willBePublic = parsed.data.visibility === "public" ||
    (parsed.data.visibility === undefined && existing.visibility === "public");
  if (willBePublic && !existing.public_slug) {
    updatePayload.public_slug = await generateUniquePublicSlug(
      sb,
      parsed.data.name ?? existing.name,
      existing.id
    );
  }

  const { data, error } = await sb
    .from("personas")
    .update(updatePayload)
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Persona not found." });
  await invalidateOperationalCacheForChange({
    type: parsed.data.visibility !== undefined ? "visibility" : "persona",
    ownerUserId: req.user!.id,
    personaId: data.id,
    resourceId: data.id,
  }).catch(() => undefined);
  const publicEligibility = await loadPublicPersonaEligibility(req.user!.id, authUser);
  return res.json({ persona: serializePersona(data, undefined, publicEligibility) });
});

// -- Delete a persona ----------------------------------------------------------
personasRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();

  const { error } = await sb
    .from("personas")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id);

  if (error) return res.status(500).json({ error: error.message });
  await invalidateOperationalCacheForChange({
    type: "persona",
    ownerUserId: req.user!.id,
    personaId: req.params.id,
    resourceId: req.params.id,
  }).catch(() => undefined);
  return res.status(204).send();
});
