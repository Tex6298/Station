import type { SupabaseClient } from "@supabase/supabase-js";
import { retrievePrivateArchive } from "./archive-retrieval";
import type { ArchiveRetrievalTrace } from "@station/types";
import { generateEmbedding } from "./embeddings";
import { searchMemoryWithTrace, loadCanon, type MemoryRetrievalTrace } from "./semantic-search";
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
  maxContinuity?: number;
}

export interface PersonaContext {
  systemPrompt: string;
  canonCount: number;
  memoryCount: number;
  integrityCount: number;
  archiveCount: number;
  continuityCount: number;
  sources: PersonaContextSource[];
}

export type PersonaContextSourceType = "canon" | "integrity" | "memory" | "archive" | "continuity";

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
  continuity: number;
}

export interface PersonaRuntimeContext {
  systemPrompt: string;
  counts: PersonaContextCounts;
  sources: PersonaContextSource[];
  trace: PersonaRuntimeContextTrace;
  topology: PersonaRuntimeContextTopology;
  canon: PersonaContextSource[];
  memory: PersonaContextSource[];
  integrity: PersonaContextSource[];
  archive: PersonaContextSource[];
  continuity: PersonaContextSource[];
}

export interface PersonaRuntimeContextTrace {
  retrievalMode: {
    memory: MemoryRetrievalTrace["mode"];
    archive: "vector" | "keyword";
    memoryFallback: MemoryRetrievalTrace["fallbackMode"];
  };
  embedding: MemoryRetrievalTrace["embedding"];
  selectedSources: Array<{
    id: string;
    type: PersonaContextSourceType;
    title: string | null;
    reason: string;
    sourceType?: string | null;
    priority: number;
  }>;
  skipped: {
    memory: MemoryRetrievalTrace["skipped"];
    archive: ArchiveRetrievalTrace["skipped"];
  };
  searched: {
    memory: number;
    archive: number;
    continuity: number;
  };
  timing: PersonaRuntimeContextTiming;
}

export type RuntimeContextTimingStage =
  | "total"
  | "query_embedding"
  | "canon"
  | "owner_memory"
  | "memory_vector_search"
  | "integrity"
  | "preference_profile"
  | "archive_retrieval"
  | "continuity"
  | "topology_prompt_assembly";

export interface PersonaRuntimeContextTiming {
  schema: "station.runtime_context_timing.v1";
  stages: Array<{
    stage: RuntimeContextTimingStage;
    durationMs: number;
  }>;
  cache: {
    status: "not_used";
  };
}

export type RuntimeContextTopologyBucket =
  | "canon"
  | "integrity"
  | "continuity"
  | "memory"
  | "archive";

export interface PersonaRuntimeContextTopologyBucket {
  requested: number;
  retained: number;
  dropped: number;
  truncated: number;
  maxItems: number;
  maxCharactersPerItem: number;
}

export interface PersonaRuntimeContextTopology {
  schema: "station.runtime_context_topology.v1";
  priority: RuntimeContextTopologyBucket[];
  buckets: Record<RuntimeContextTopologyBucket, PersonaRuntimeContextTopologyBucket>;
}

const TOPOLOGY_PRIORITY: RuntimeContextTopologyBucket[] = [
  "canon",
  "integrity",
  "continuity",
  "memory",
  "archive",
];

const TOPOLOGY_LIMITS: Record<RuntimeContextTopologyBucket, { maxItems: number; maxCharactersPerItem: number }> = {
  canon: { maxItems: 6, maxCharactersPerItem: 1800 },
  integrity: { maxItems: 5, maxCharactersPerItem: 1200 },
  continuity: { maxItems: 4, maxCharactersPerItem: 900 },
  memory: { maxItems: 10, maxCharactersPerItem: 900 },
  archive: { maxItems: 8, maxCharactersPerItem: 900 },
};

const TIMING_STAGE_ORDER: RuntimeContextTimingStage[] = [
  "total",
  "query_embedding",
  "canon",
  "owner_memory",
  "memory_vector_search",
  "integrity",
  "preference_profile",
  "archive_retrieval",
  "continuity",
  "topology_prompt_assembly",
];

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
    continuityCount: context.counts.continuity,
    sources: context.sources,
  };
}

export async function assemblePersonaRuntimeContext(
  input: PersonaContextInput
): Promise<PersonaRuntimeContext> {
  const timing = createRuntimeContextTimingRecorder();
  const queryEmbeddingPromise = timing.measure("query_embedding", () =>
    sharedQueryEmbedding(input.userQuery, input.embeddingApiKey)
  );

  const [canon, ownerMemory, memoryRetrieval, integrity, preferenceProfile, archiveRetrieval, continuity] = await Promise.all([
    timing.measure("canon", () => loadCanon(input.supabase, input.persona.id, input.maxCanon ?? 6, input.ownerUserId)),
    timing.measure("owner_memory", () => loadOwnerMemoryBlocks(input, 4)),
    queryEmbeddingPromise.then((queryEmbedding) =>
      timing.measure("memory_vector_search", () =>
        searchMemoryWithTrace({
          supabase: input.supabase,
          personaId: input.persona.id,
          query: input.userQuery,
          limit: input.maxMemory ?? 6,
          embeddingApiKey: input.embeddingApiKey,
          queryEmbedding,
          ownerUserId: input.ownerUserId,
        })
      )
    ),
    timing.measure("integrity", () => loadIntegrityNotes(input, input.maxIntegrity ?? 4)),
    timing.measure("preference_profile", () => loadPreferenceProfile(input)),
    queryEmbeddingPromise.then((queryEmbedding) =>
      timing.measure("archive_retrieval", () => loadArchiveReferences(input, input.maxArchive ?? 8, queryEmbedding))
    ),
    timing.measure("continuity", () => loadContinuityRecords(input, input.maxContinuity ?? 4)),
  ]);

  const { topology, sources, safeMemorySkipped, systemPrompt } = timing.measureSync("topology_prompt_assembly", () => {
    const canonSources = canon.map<PersonaContextSource>((item) => ({
      id: item.id,
      type: "canon",
      title: item.title,
      content: item.content,
      priority: 100 + item.priority,
      reason: "Always included canon, ordered by owner priority.",
      sourceType: item.sourceType,
    }));

    const memorySources = memoryRetrieval.results.map<PersonaContextSource>((item) => ({
      id: item.id,
      type: "memory",
      title: item.title,
      content: formatMemoryForPrompt(item),
      priority: item.relevanceWeight,
      reason: item.similarity > 0
        ? `Selected by query match (${item.similarity.toFixed(2)}) and relevance weight.`
        : "Selected by relevance weight fallback.",
      sourceType: item.sourceType,
    }));

    const topology = applyRuntimeContextTopology({
      canon: canonSources,
      integrity: preferenceProfile ? [preferenceProfile, ...integrity] : integrity,
      continuity: continuity.sources,
      memory: [...ownerMemory, ...memorySources],
      archive: archiveRetrieval.sources,
    });
    const sources = [
      ...topology.buckets.canon.sources,
      ...topology.buckets.integrity.sources,
      ...topology.buckets.continuity.sources,
      ...topology.buckets.memory.sources,
      ...topology.buckets.archive.sources,
    ];
    const safeMemorySkipped = redactHiddenMemorySkippedCounts(memoryRetrieval.trace.skipped);

    const systemPrompt = buildPersonaChatPrompt({
      name: input.persona.name,
      shortDescription: input.persona.shortDescription ?? undefined,
      longDescription: input.persona.longDescription ?? undefined,
      visibility: input.persona.visibility,
      awakeningPrompt: input.persona.awakeningPrompt ?? undefined,
      styleNotes: input.persona.styleNotes ?? undefined,
      canon: topology.buckets.canon.sources.map((source) => source.content),
      integrity: topology.buckets.integrity.sources.map((source) => formatSourceForPrompt(source)),
      memory: topology.buckets.memory.sources.map((source) => formatSourceForPrompt(source)),
      continuity: topology.buckets.continuity.sources.map((source) => source.content),
      archive: topology.buckets.archive.sources.map((source) => formatSourceForPrompt(source)),
    });

    return { topology, sources, safeMemorySkipped, systemPrompt };
  });

  return {
    systemPrompt,
    counts: {
      canon: topology.buckets.canon.sources.length,
      memory: topology.buckets.memory.sources.length,
      integrity: topology.buckets.integrity.sources.length,
      archive: topology.buckets.archive.sources.length,
      continuity: topology.buckets.continuity.sources.length,
    },
    sources,
    trace: {
      retrievalMode: {
        memory: memoryRetrieval.trace.mode,
        archive: archiveRetrieval.mode,
        memoryFallback: memoryRetrieval.trace.fallbackMode,
      },
      embedding: memoryRetrieval.trace.embedding,
      selectedSources: sources.map((source) => ({
        id: source.id,
        type: source.type,
        title: source.title,
        reason: source.reason,
        sourceType: source.sourceType,
        priority: source.priority,
      })),
      skipped: {
        memory: safeMemorySkipped,
        archive: archiveRetrieval.skipped,
      },
      searched: {
        memory: visibleMemorySearchedCount(memoryRetrieval.trace),
        archive: archiveRetrieval.searched,
        continuity: continuity.searched,
      },
      timing: timing.snapshot(),
    },
    topology: {
      schema: "station.runtime_context_topology.v1",
      priority: [...TOPOLOGY_PRIORITY],
      buckets: {
        canon: topology.buckets.canon.stats,
        integrity: topology.buckets.integrity.stats,
        continuity: topology.buckets.continuity.stats,
        memory: topology.buckets.memory.stats,
        archive: topology.buckets.archive.stats,
      },
    },
    canon: topology.buckets.canon.sources,
    memory: topology.buckets.memory.sources,
    integrity: topology.buckets.integrity.sources,
    archive: topology.buckets.archive.sources,
    continuity: topology.buckets.continuity.sources,
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

function createRuntimeContextTimingRecorder() {
  const startedAt = Date.now();
  const durations = new Map<RuntimeContextTimingStage, number>();

  return {
    async measure<T>(stage: RuntimeContextTimingStage, operation: () => Promise<T>): Promise<T> {
      const stageStartedAt = Date.now();
      try {
        return await operation();
      } finally {
        durations.set(stage, elapsedMs(stageStartedAt));
      }
    },
    measureSync<T>(stage: RuntimeContextTimingStage, operation: () => T): T {
      const stageStartedAt = Date.now();
      try {
        return operation();
      } finally {
        durations.set(stage, elapsedMs(stageStartedAt));
      }
    },
    snapshot(): PersonaRuntimeContextTiming {
      durations.set("total", elapsedMs(startedAt));
      return {
        schema: "station.runtime_context_timing.v1",
        stages: TIMING_STAGE_ORDER
          .filter((stage) => durations.has(stage))
          .map((stage) => ({
            stage,
            durationMs: durations.get(stage) ?? 0,
          })),
        cache: {
          status: "not_used",
        },
      };
    },
  };
}

function elapsedMs(startedAt: number) {
  return Math.max(0, Date.now() - startedAt);
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

async function loadContinuityRecords(
  input: PersonaContextInput,
  limit: number
): Promise<{ sources: PersonaContextSource[]; searched: number }> {
  if (!input.ownerUserId) return { sources: [], searched: 0 };

  const { data, error } = await input.supabase
    .from("continuity_records")
    .select("id, record_type, title, body, summary, source_table, source_id, source_label, source_version, visibility, version, occurred_at, created_at, updated_at")
    .eq("persona_id", input.persona.id)
    .eq("owner_user_id", input.ownerUserId)
    .eq("visibility", "private")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return { sources: [], searched: 0 };

  const rows = data ?? [];
  return {
    searched: rows.length,
    sources: rows.map((row, index): PersonaContextSource => ({
      id: row.id,
      type: "continuity",
      title: row.title,
      content: formatContinuityRecordForPrompt(row),
      priority: 55 - index,
      reason: `Included private owner continuity record (${row.record_type ?? "timeline"}).`,
      sourceType: row.record_type ?? "timeline",
      createdAt: row.occurred_at ?? row.updated_at ?? row.created_at,
    })),
  };
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
): Promise<{
  sources: PersonaContextSource[];
  mode: "vector" | "keyword";
  searched: number;
  skippedUnauthoritative: number;
  skipped: ArchiveRetrievalTrace["skipped"];
}> {
  if (!input.ownerUserId) {
    return {
      sources: [],
      mode: "keyword",
      searched: 0,
      skippedUnauthoritative: 0,
      skipped: emptyArchiveSkippedCounts(),
    };
  }

  const retrieval = await retrievePrivateArchive({
    supabase: input.supabase,
    ownerUserId: input.ownerUserId,
    personaId: input.persona.id,
    query: input.userQuery,
    limit,
    maxCharacters: 2400,
    embeddingApiKey: input.embeddingApiKey,
    queryEmbedding,
    includeQuarantined: false,
  });

  if (retrieval.chunks.length > 0) {
    return {
      sources: retrieval.chunks.map((chunk): PersonaContextSource => ({
        id: chunk.id,
        type: "archive",
        title: chunk.citation.title,
        content: chunk.excerpt,
        priority: 30 + chunk.score,
        reason: chunk.citation.reason,
        sourceType: chunk.citation.sourceType,
        createdAt: chunk.citation.createdAt ?? chunk.createdAt,
      })),
      mode: retrieval.mode,
      searched: retrieval.counts.searched,
      skippedUnauthoritative: retrieval.counts.skippedUnauthoritative,
      skipped: retrieval.trace?.skipped ?? emptyArchiveSkippedCounts(),
    };
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

  return {
    sources: [...files, ...imports, ...transcripts]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, limit),
    mode: retrieval.mode,
    searched: retrieval.counts.searched + files.length + imports.length + transcripts.length,
    skippedUnauthoritative: retrieval.counts.skippedUnauthoritative,
    skipped: retrieval.trace?.skipped ?? emptyArchiveSkippedCounts(),
  };
}

function normalizeRule(label: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : null;
}

function formatSourceForPrompt(source: PersonaContextSource) {
  return source.title ? `${source.title}: ${source.content}` : source.content;
}

function formatMemoryForPrompt(item: { summary?: string | null; content: string }) {
  const content = item.content.trim();
  const summary = item.summary?.trim();
  if (!summary) return content;
  if (!content || compactPromptText(summary) === compactPromptText(content)) return summary;
  return `${content}\nSummary: ${summary}`;
}

function compactPromptText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function applyRuntimeContextTopology(
  buckets: Record<RuntimeContextTopologyBucket, PersonaContextSource[]>
): {
  buckets: Record<RuntimeContextTopologyBucket, {
    sources: PersonaContextSource[];
    stats: PersonaRuntimeContextTopologyBucket;
  }>;
} {
  return {
    buckets: Object.fromEntries(
      TOPOLOGY_PRIORITY.map((bucket) => {
        const limits = TOPOLOGY_LIMITS[bucket];
        const requestedSources = buckets[bucket] ?? [];
        let truncated = 0;
        const retained = requestedSources.slice(0, limits.maxItems).map((source) => {
          const trimmed = trimTopologyContent(source.content, limits.maxCharactersPerItem);
          if (trimmed.truncated) truncated += 1;
          return trimmed.content === source.content ? source : { ...source, content: trimmed.content };
        });
        return [
          bucket,
          {
            sources: retained,
            stats: {
              requested: requestedSources.length,
              retained: retained.length,
              dropped: Math.max(0, requestedSources.length - retained.length),
              truncated,
              maxItems: limits.maxItems,
              maxCharactersPerItem: limits.maxCharactersPerItem,
            },
          },
        ];
      })
    ) as Record<RuntimeContextTopologyBucket, {
      sources: PersonaContextSource[];
      stats: PersonaRuntimeContextTopologyBucket;
    }>,
  };
}

function trimTopologyContent(value: string, maxCharacters: number) {
  const compact = value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (compact.length <= maxCharacters) return { content: compact, truncated: false };
  return {
    content: `${compact.slice(0, Math.max(0, maxCharacters - 3)).trim()}...`,
    truncated: true,
  };
}

function formatContinuityRecordForPrompt(row: any) {
  const excerpt = trimContinuityText(row.summary ?? row.body ?? "");
  const recordType = compactContinuityLabel(row.record_type, "timeline", 64);
  const visibility = compactContinuityLabel(row.visibility, "private", 64);
  const sourceTable = compactContinuityLabel(row.source_table, "", 64);
  const sourceId = compactContinuityLabel(row.source_id, "", 96);
  const sourceLabel = compactContinuityLabel(row.source_label, "", 160);
  const titleText = compactContinuityLabel(row.title, "", 160);
  const labels = [
    `type=${recordType}`,
    `visibility=${visibility}`,
    `recordVersion=${Number(row.version ?? 1)}`,
    `sourceVersion=${Number(row.source_version ?? 1)}`,
    sourceTable ? `source=${sourceTable}${sourceId ? `/${sourceId}` : ""}` : null,
    sourceLabel ? `label=${sourceLabel}` : null,
    row.occurred_at ? `occurred=${row.occurred_at}` : null,
    row.updated_at ? `updated=${row.updated_at}` : null,
  ].filter(Boolean);
  const title = titleText ? `${titleText}: ` : "";
  return `${title}${excerpt || "Continuity marker without body text."} [${labels.join("; ")}]`;
}

function trimContinuityText(value: string, maxLength = 700) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function compactContinuityLabel(value: unknown, fallback = "", maxLength = 160) {
  const compact = typeof value === "string" || typeof value === "number"
    ? String(value).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").replace(/[\[\]]/g, "").trim()
    : "";
  const selected = compact || fallback;
  if (selected.length <= maxLength) return selected;
  return `${selected.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function redactHiddenMemorySkippedCounts(skipped: MemoryRetrievalTrace["skipped"]) {
  return {
    ...skipped,
    other_owner_or_missing: 0,
  };
}

function visibleMemorySearchedCount(trace: MemoryRetrievalTrace) {
  return Math.max(0, trace.searched - trace.skipped.other_owner_or_missing);
}

function emptyArchiveSkippedCounts(): ArchiveRetrievalTrace["skipped"] {
  return {
    unauthoritative: 0,
    source_not_ready: 0,
    missing_lifecycle: 0,
    rejected: 0,
    quarantined: 0,
    expired: 0,
    superseded: 0,
  };
}

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}
