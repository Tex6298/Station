import type { SupabaseClient } from "@supabase/supabase-js";
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
  const [canon, memory, integrity, archive] = await Promise.all([
    loadCanon(input.supabase, input.persona.id, input.maxCanon ?? 6, input.ownerUserId),
    searchMemory({
      supabase: input.supabase,
      personaId: input.persona.id,
      query: input.userQuery,
      limit: input.maxMemory ?? 6,
      embeddingApiKey: input.embeddingApiKey,
      ownerUserId: input.ownerUserId,
    }),
    loadIntegrityNotes(input, input.maxIntegrity ?? 4),
    loadArchiveReferences(input, input.maxArchive ?? 8),
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
    ...integrity,
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
    integrity: integrity.map((source) => formatSourceForPrompt(source)),
    memory: memorySources.map((source) => source.content),
    archive: archive.map((source) => formatSourceForPrompt(source)),
  });

  return {
    systemPrompt,
    counts: {
      canon: canonSources.length,
      memory: memorySources.length,
      integrity: integrity.length,
      archive: archive.length,
    },
    sources,
    canon: canonSources,
    memory: memorySources,
    integrity,
    archive,
  };
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
  limit: number
): Promise<PersonaContextSource[]> {
  const fileLimit = Math.max(1, Math.ceil(limit / 2));
  const importLimit = Math.max(1, limit - fileLimit);

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

  const [filesResult, importsResult] = await Promise.all([fileQuery, importQuery]);
  if (filesResult.error) throw filesResult.error;
  if (importsResult.error) throw importsResult.error;

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

  return [...files, ...imports]
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
