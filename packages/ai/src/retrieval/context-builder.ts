import type { SupabaseClient } from "@supabase/supabase-js";
import { retrievePrivateArchive } from "./archive-retrieval";
import { generateEmbedding } from "./embeddings";
import { searchMemory, loadCanon } from "./semantic-search";
import { buildPersonaChatPrompt } from "../prompts/persona-chat";

export interface PersonaContextInput {
  supabase: SupabaseClient;
  persona: {
    id: string;
    name: string;
    shortDescription?: string | null;
    longDescription?: string | null;
    visibility: "private" | "public";
    awakeningPrompt?: string | null;
    styleNotes?: string | null;
  };
  userQuery: string;
  embeddingApiKey?: string;
  ownerUserId?: string;
  maxCanon?: number;
  maxMemory?: number;
  maxIntegrity?: number;
  maxArchive?: number;
}

export interface PersonaContext {
  systemPrompt: string;
  canonCount: number;
  memoryCount: number;
  integrityCount: number;
  archiveCount: number;
  sources: PersonaContextSource[];
}

export type PersonaContextSourceType = "canon" | "integrity" | "memory" | "archive";

export interface PersonaContextSource {
  id: string;
  type: PersonaContextSourceType;
  title: string | null;
  content: string;
  priority: number;
  reason: string;
  sourceType?: string | null;
  createdAt?: string | null;
}

export interface PersonaContextCounts {
  canon: number;
  memory: number;
  integrity: number;
  archive: number;
}

export interface PersonaRuntimeContext {
  systemPrompt: string;
  counts: PersonaContextCounts;
  sources: PersonaContextSource[];
  canon: PersonaContextSource[];
  memory: PersonaContextSource[];
  integrity: PersonaContextSource[];
  archive: PersonaContextSource[];
}

/**
 * Builds the full system prompt for a persona chat turn by:
 * 1. Loading top canon items (always-injected rules)
 * 2. Semantically searching memory for relevant context
 * 3. Assembling everything into a structured system prompt
 */
export async function buildPersonaContext(
  input: PersonaContextInput
): Promise<PersonaContext> {
  const context = await assemblePersonaRuntimeContext(input);

  return {
    systemPrompt: context.systemPrompt,
    canonCount: context.counts.canon,
    memoryCount: context.counts.memory,
    integrityCount: context.counts.integrity,
    archiveCount: context.counts.archive,
    sources: context.sources,
  };
}

export async function assemblePersonaRuntimeContext(
  input: PersonaContextInput
): Promise<PersonaRuntimeContext> {
  const queryEmbedding = await sharedQueryEmbedding(input.userQuery, input.embeddingApiKey);

  const [canon, ownerMemory, memory, integrity, preferenceProfile, archive] = await Promise.all([
    loadCanon(input.supabase, input.persona.id, input.maxCanon ?? 6, input.ownerUserId),
    loadOwnerMemoryBlocks(input, 4),
    searchMemory({
      supabase: input.supabase,
      personaId: input.persona.id,
      query: input.userQuery,
      limit: input.maxMemory ?? 6,
      embeddingApiKey: input.embeddingApiKey,
      queryEmbedding,
      ownerUserId: input.ownerUserId,
    }),
    loadIntegrityNotes(input, input.maxIntegrity ?? 4),
    loadPreferenceProfile(input),
    loadArchiveReferences(input, input.maxArchive ?? 8, queryEmbedding),
  ]);

  const canonSources = canon.map<PersonaContextSource>((item) => ({
    id: item.id,
    type: "canon",
    title: item.title,
    content: item.content,
    priority: 100 + item.priority,
    reason: "Always included canon, ordered by owner priority.",
  }));

  const memorySources = memory.map<PersonaContextSource>((item) => ({
    id: item.id,
    type: "memory",
    title: item.title,
    content: item.summary ?? item.content,
    priority: item.relevanceWeight,
    reason: item.similarity > 0
      ? `Selected by query match (${item.similarity.toFixed(2)}) and relevance weight.`
      : "Selected by relevance weight fallback.",
    sourceType: item.sourceType,
  }));

  const sources = [
    ...canonSources,
    ...(preferenceProfile ? [preferenceProfile] : []),
    ...integrity,
    ...ownerMemory,
    ...memorySources,
    ...archive,
  ];

  const systemPrompt = buildPersonaChatPrompt({
    name: input.persona.name,
    shortDescription: input.persona.shortDescription ?? undefined,
    longDescription: input.persona.longDescription ?? undefined,
    visibility: input.persona.visibility,
    awakeningPrompt: input.persona.awakeningPrompt ?? undefined,
    styleNotes: input.persona.styleNotes ?? undefined,
    canon: canonSources.map((source) => source.content),
    integrity: [
      ...(preferenceProfile ? [formatSourceForPrompt(preferenceProfile)] : []),
      ...integrity.map((source) => formatSourceForPrompt(source)),
    ],
    memory: [...ownerMemory, ...memorySources].map((source) => source.content),
    archive: archive.map((source) => formatSourceForPrompt(source)),
  });

  return {
    systemPrompt,
    counts: {
      canon: canonSources.length,
      memory: ownerMemory.length + memorySources.length,
      integrity: integrity.length + (preferenceProfile ? 1 : 0),
      archive: archive.length,
    },
    sources,
    canon: canonSources,
    memory: [...ownerMemory, ...memorySources],
    integrity: preferenceProfile ? [preferenceProfile, ...integrity] : integrity,
    archive,
  };
}

async function sharedQueryEmbedding(query: string, embeddingApiKey?: string) {
  if (!hasValue(embeddingApiKey) || !query.trim()) return undefined;
  try {
    return await generateEmbedding(query, embeddingApiKey, { useCase: "query" });
  } catch {
    return null;
  }
}

async function loadOwnerMemoryBlocks(
  input: PersonaContextInput,
  limit: number
): Promise<PersonaContextSource[]> {
  if (!input.ownerUserId) return [];

  const { data, error } = await input.supabase
    .from("owner_memory_blocks")
    .select("id, title, content, scope, trust_level, confidence, updated_at, created_at")
    .eq("owner_user_id", input.ownerUserId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((row): PersonaContextSource => ({
    id: row.id,
    type: "memory",
    title: row.title,
    content: row.content,
    priority: 60 + Number(row.confidence ?? 0),
    reason: `Included active owner memory block (${row.scope}, ${row.trust_level}).`,
    sourceType: "owner_memory_block",
    createdAt: row.updated_at ?? row.created_at,
  }));
}

async function loadPreferenceProfile(
  input: PersonaContextInput
): Promise<PersonaContextSource | null> {
  if (!input.ownerUserId) return null;

  const { data, error } = await input.supabase
    .from("persona_preferences")
    .select("id, warmth_level, playfulness, register_preference, depth_preference, challenge_preference, disclaimer_sensitivity, relationship_tone, recurring_topics, tone_notes, updated_at")
    .eq("persona_id", input.persona.id)
    .eq("owner_user_id", input.ownerUserId)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  const prefs = data ?? {
    id: `default-preferences-${input.persona.id}`,
    warmth_level: "high",
    playfulness: "moderate",
    register_preference: "balanced",
    depth_preference: "expansive",
    challenge_preference: "balanced",
    disclaimer_sensitivity: "low",
    relationship_tone: "companion",
    recurring_topics: [],
    tone_notes: [],
    updated_at: null,
  };

  return {
    id: prefs.id,
    type: "integrity",
    title: "User preference profile",
    content: preferencesToNaturalLanguage(prefs),
    priority: 80,
    reason: "Included from the per-persona preference profile.",
    sourceType: "preference_profile",
    createdAt: prefs.updated_at,
  };
}

function preferencesToNaturalLanguage(prefs: any) {
  const lines: string[] = [];
  const warmthMap: Record<string, string> = {
    high: "This user prefers high warmth and emotional presence.",
    moderate: "This user prefers moderate warmth.",
    neutral: "This user prefers a more neutral, less emotionally expressive tone.",
  };
  const challengeMap: Record<string, string> = {
    challenge: "They prefer to be challenged and pushed on their ideas.",
    support: "They prefer validation and support over challenge.",
    balanced: "They appreciate a balance of challenge and support.",
  };

  if (warmthMap[prefs.warmth_level]) lines.push(warmthMap[prefs.warmth_level]);
  if (prefs.depth_preference === "expansive") lines.push("They prefer expansive, richly developed responses.");
  if (prefs.depth_preference === "concise") lines.push("They prefer concise responses.");
  if (prefs.playfulness === "high") lines.push("They enjoy playful and witty exchanges.");
  if (prefs.playfulness === "low") lines.push("They prefer a more serious register.");
  if (prefs.register_preference === "mystical") lines.push("They are comfortable with speculative and mystical framing.");
  if (prefs.register_preference === "grounded") lines.push("They prefer grounded, empirical framing over speculative language.");
  if (prefs.disclaimer_sensitivity === "low") lines.push("They dislike safety disclaimers and hedging language - avoid these.");
  if (challengeMap[prefs.challenge_preference]) lines.push(challengeMap[prefs.challenge_preference]);
  if (prefs.relationship_tone) lines.push(`Relationship tone: ${prefs.relationship_tone}.`);
  if (prefs.recurring_topics?.length) lines.push(`Recurring topics: ${prefs.recurring_topics.join(", ")}.`);
  if (prefs.tone_notes?.length) lines.push(prefs.tone_notes.join(" "));

  return `USER PREFERENCE PROFILE:\n${lines.filter(Boolean).join("\n")}`;
}

async function loadIntegrityNotes(
  input: PersonaContextInput,
  limit: number
): Promise<PersonaContextSource[]> {
  const query = input.supabase
    .from("calibration_sessions")
    .select(
      "id, session_title, extracted_style_notes, extracted_public_rules, extracted_private_rules, extracted_uncertainty_rules, save_target, created_at, updated_at"
    )
    .eq("persona_id", input.persona.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (input.ownerUserId) query.eq("owner_user_id", input.ownerUserId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row): PersonaContextSource | null => {
      const content = [
        normalizeRule("Style", row.extracted_style_notes),
        normalizeRule("Public mode", row.extracted_public_rules),
        normalizeRule("Private mode", row.extracted_private_rules),
        normalizeRule("Uncertainty", row.extracted_uncertainty_rules),
      ].filter(Boolean).join("\n");

      if (!content) return null;

      return {
        id: row.id,
        type: "integrity" as const,
        title: row.session_title,
        content,
        priority: 70,
        reason: "Included from the latest owner-guided Integrity Session outputs.",
        sourceType: row.save_target,
        createdAt: row.updated_at ?? row.created_at,
      };
    })
    .filter((source): source is PersonaContextSource => source !== null);
}

async function loadArchiveReferences(
  input: PersonaContextInput,
  limit: number,
  queryEmbedding?: number[] | null
): Promise<PersonaContextSource[]> {
  if (!input.ownerUserId) return [];

  const retrieval = await retrievePrivateArchive({
    supabase: input.supabase,
    ownerUserId: input.ownerUserId,
    personaId: input.persona.id,
    query: input.userQuery,
    limit,
    maxCharacters: 2400,
    embeddingApiKey: input.embeddingApiKey,
    queryEmbedding,
  });

  if (retrieval.chunks.length > 0) {
    return retrieval.chunks.map((chunk): PersonaContextSource => ({
      id: chunk.id,
      type: "archive",
      title: chunk.citation.title,
      content: chunk.excerpt,
      priority: 30 + chunk.score,
      reason: chunk.citation.reason,
      sourceType: chunk.citation.sourceType,
      createdAt: chunk.citation.createdAt ?? chunk.createdAt,
    }));
  }

  const fileLimit = Math.max(1, Math.ceil(limit / 3));
  const importLimit = Math.max(1, Math.ceil(limit / 3));
  const transcriptLimit = Math.max(1, limit - fileLimit - importLimit);

  const fileQuery = input.supabase
    .from("persona_files")
    .select("id, file_name, file_type, source_type, processed, created_at")
    .eq("persona_id", input.persona.id)
    .order("created_at", { ascending: false })
    .limit(fileLimit);

  if (input.ownerUserId) fileQuery.eq("owner_user_id", input.ownerUserId);

  const importQuery = input.supabase
    .from("import_jobs")
    .select("id, kind, status, source_name, created_at")
    .eq("persona_id", input.persona.id)
    .order("created_at", { ascending: false })
    .limit(importLimit);

  if (input.ownerUserId) importQuery.eq("owner_user_id", input.ownerUserId);

  const transcriptQuery = input.supabase
    .from("archived_chat_transcripts")
    .select("id, title, source_summary, message_count, created_at")
    .eq("persona_id", input.persona.id)
    .order("created_at", { ascending: false })
    .limit(transcriptLimit);

  if (input.ownerUserId) transcriptQuery.eq("owner_user_id", input.ownerUserId);

  const [filesResult, importsResult, transcriptsResult] = await Promise.all([fileQuery, importQuery, transcriptQuery]);
  if (filesResult.error) throw filesResult.error;
  if (importsResult.error) throw importsResult.error;
  if (transcriptsResult.error) throw transcriptsResult.error;

  const files = (filesResult.data ?? []).map<PersonaContextSource>((row) => ({
    id: row.id,
    type: "archive",
    title: row.file_name,
    content: `${row.file_name}${row.file_type ? ` (${row.file_type})` : ""} - ${row.processed ? "processed" : "pending"} archive file.`,
    priority: 20,
    reason: "Available archive file reference; raw file contents are not injected into the preview prompt.",
    sourceType: row.source_type,
    createdAt: row.created_at,
  }));

  const imports = (importsResult.data ?? []).map<PersonaContextSource>((row) => ({
    id: row.id,
    type: "archive",
    title: row.source_name,
    content: `${row.source_name} (${row.kind} import, ${row.status}).`,
    priority: 18,
    reason: "Available import reference; use as source material when a later retrieval step requests it.",
    sourceType: row.kind,
    createdAt: row.created_at,
  }));

  const transcripts = (transcriptsResult.data ?? []).map<PersonaContextSource>((row) => ({
    id: row.id,
    type: "archive",
    title: row.title,
    content: `${row.title} (${row.message_count} archived chat messages). ${row.source_summary ?? "Transcript available as source material."}`,
    priority: 24,
    reason: "Archived conversation transcript reference; use as source material when continuity from a past chat is relevant.",
    sourceType: "chat",
    createdAt: row.created_at,
  }));

  return [...files, ...imports, ...transcripts]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, limit);
}

function normalizeRule(label: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : null;
}

function formatSourceForPrompt(source: PersonaContextSource) {
  return source.title ? `${source.title}: ${source.content}` : source.content;
}

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}
