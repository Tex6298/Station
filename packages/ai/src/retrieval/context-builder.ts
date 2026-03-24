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
  maxCanon?: number;
  maxMemory?: number;
}

export interface PersonaContext {
  systemPrompt: string;
  canonCount: number;
  memoryCount: number;
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
  const [canon, memory] = await Promise.all([
    loadCanon(input.supabase, input.persona.id, input.maxCanon ?? 5),
    searchMemory({
      supabase: input.supabase,
      personaId: input.persona.id,
      query: input.userQuery,
      limit: input.maxMemory ?? 6,
      embeddingApiKey: input.embeddingApiKey,
    }),
  ]);

  const systemPrompt = buildPersonaChatPrompt({
    name: input.persona.name,
    shortDescription: input.persona.shortDescription ?? undefined,
    longDescription: input.persona.longDescription ?? undefined,
    visibility: input.persona.visibility,
    awakeningPrompt: input.persona.awakeningPrompt ?? undefined,
    styleNotes: input.persona.styleNotes ?? undefined,
    canon: canon.map((c) => c.content),
    memory: memory.map((m) => m.summary ?? m.content),
  });

  return {
    systemPrompt,
    canonCount: canon.length,
    memoryCount: memory.length,
  };
}
