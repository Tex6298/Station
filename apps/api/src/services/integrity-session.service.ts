import { getSupabaseAdmin } from "../lib/supabase";
import { AnthropicProvider } from "@station/ai/providers/anthropic";
import { env } from "../lib/env";
import { enqueueLlmCall } from "./llm-queue.service";
import { selectStationModel } from "./token-credits.service";
import { addMemoryItem } from "./archive.service";

export type IntegrityCluster = "identity" | "relationship" | "tone" | "continuity" | "boundaries" | "themes";
export type IntegritySessionType = "initial" | "periodic" | "migration" | "pre_publication" | "manual";
export type IntegrityOutputAction = "accept" | "reject" | "edit";

const INITIAL_CLUSTERS: IntegrityCluster[] = ["identity", "relationship", "tone", "continuity"];
const MIGRATION_CLUSTERS: IntegrityCluster[] = ["identity", "relationship", "tone", "continuity", "boundaries", "themes"];
const PRE_PUBLICATION_CLUSTERS: IntegrityCluster[] = ["identity", "relationship", "tone"];
const FALLBACK_PERIODIC_CLUSTERS: IntegrityCluster[] = ["identity", "relationship", "tone", "continuity"];

const MAX_FOLLOWUPS = 2;

export async function loadOwnedPersona(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("personas")
    .select("id, name, owner_user_id")
    .eq("id", personaId)
    .single();

  return data?.owner_user_id === ownerUserId ? data : null;
}

export async function selectClusters(input: {
  ownerUserId: string;
  personaId: string;
  sessionType: IntegritySessionType;
  manualClusters?: IntegrityCluster[];
}) {
  if (input.sessionType === "manual" && input.manualClusters?.length) {
    return input.manualClusters.slice(0, 6);
  }
  if (input.sessionType === "migration") return MIGRATION_CLUSTERS;
  if (input.sessionType === "pre_publication") return PRE_PUBLICATION_CLUSTERS;
  if (input.sessionType === "initial") return INITIAL_CLUSTERS;

  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("integrity_questions")
    .select("cluster")
    .eq("turn_type", "anchor")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const available = Array.from(new Set((data ?? []).map((row: any) => row.cluster))) as IntegrityCluster[];
  const selected = [...FALLBACK_PERIODIC_CLUSTERS.filter((cluster) => available.includes(cluster))];
  if (!selected.includes("identity")) selected.unshift("identity");
  return selected.slice(0, 4);
}

export async function getAnchorQuestion(cluster: IntegrityCluster, sessionType?: IntegritySessionType) {
  if (cluster === "identity" && sessionType === "migration") {
    return "You have been working with an AI companion elsewhere. How did that relationship develop, and what are you hoping to carry forward into this one?";
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("integrity_questions")
    .select("question")
    .eq("cluster", cluster)
    .eq("turn_type", "anchor")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();

  if (error || !data?.question) throw new Error(`No active anchor question found for ${cluster}.`);
  return data.question as string;
}

export async function getFallbackFollowup(cluster: IntegrityCluster, usedQuestions: string[]) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("integrity_questions")
    .select("question")
    .eq("cluster", cluster)
    .eq("turn_type", "optional_followup")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []).find((row: any) => !usedQuestions.includes(row.question))?.question
    ?? "What feels most important for them to carry forward from that?";
}

export async function generateFollowupQuestion(input: {
  ownerUserId: string;
  cluster: IntegrityCluster;
  anchorQuestion: string;
  userAnswer: string;
  usedQuestions: string[];
}) {
  const fallback = await getFallbackFollowup(input.cluster, input.usedQuestions);
  const provider = await integrityProvider(input.ownerUserId);
  if (!provider) return fallback;

  try {
    const response = await enqueueLlmCall(provider.provider, {
      model: provider.model,
      system: [
        "You are conducting an Integrity Session for a Station user.",
        "You are warm, curious, and unhurried. Ask one question at a time.",
        "Your follow-up comes directly from what the user just said.",
        "Do not ask yes/no questions. Do not ask compound questions.",
        "Do not refer to yourself. Just ask the question. Maximum 25 words.",
      ].join(" "),
      messages: [{
        role: "user",
        content: `Cluster: ${input.cluster}\nAnchor question: ${input.anchorQuestion}\nUser answer: ${input.userAnswer}\n\nGenerate a single follow-up question.`,
      }],
    });
    return firstQuestion(response.content) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function generateClusterSummary(input: {
  ownerUserId: string;
  cluster: string;
  turns: any[];
}) {
  const fallback = buildClusterSummary(input.cluster, input.turns);
  const provider = await integrityProvider(input.ownerUserId);
  if (!provider) return fallback;

  try {
    const response = await enqueueLlmCall(provider.provider, {
      model: provider.model,
      system: [
        "You are summarising one cluster of an Integrity Session.",
        "Write 2 to 4 warm, accurate sentences using 'you'.",
        "Do not add interpretation or advice. End with: Does that feel right?",
      ].join(" "),
      messages: [{
        role: "user",
        content: `Cluster: ${input.cluster}\n\n${formatTurns(input.turns)}\n\nWrite a brief summary for the user to confirm.`,
      }],
    });
    return response.content.trim() || fallback;
  } catch {
    return fallback;
  }
}

export function getNextAction(session: any, currentClusterTurns: any[]) {
  const answeredFollowups = currentClusterTurns.filter((turn) => turn.turn_type === "follow_up" && turn.answer).length;
  const hasSummary = currentClusterTurns.some((turn) => turn.turn_type === "summary");
  const lastAnswer = [...currentClusterTurns].reverse().find((turn) => turn.answer)?.answer ?? "";
  const wordCount = lastAnswer.trim().split(/\s+/).filter(Boolean).length;

  if (!hasSummary && answeredFollowups < MAX_FOLLOWUPS && wordCount > 15) {
    return { action: "followup" as const };
  }

  if (!hasSummary) {
    return { action: "summary" as const };
  }

  const planned = (session.clusters_planned ?? session.clusters_covered ?? []) as IntegrityCluster[];
  const covered = (session.clusters_covered ?? []) as IntegrityCluster[];
  const nextCluster = planned.find((cluster) => !covered.includes(cluster));
  return nextCluster ? { action: "next_anchor" as const, cluster: nextCluster } : { action: "end" as const };
}

export function buildClusterSummary(cluster: string, turns: any[]) {
  const answers = turns
    .filter((turn) => turn.answer)
    .map((turn) => turn.answer.trim())
    .filter(Boolean);

  if (answers.length === 0) {
    return `You have not added much to the ${cluster} part yet. Does that feel right?`;
  }

  const joined = answers.join(" ");
  const summary = joined.length > 420 ? `${joined.slice(0, 417).trim()}...` : joined;
  return `You described ${cluster} through this thread: ${summary} Does that feel right?`;
}

export function generateOutputsFromTurns(turns: any[]) {
  const outputs = new Map<string, { output_type: string; content: string; cluster_source: string }>();

  for (const turn of turns) {
    const answer = turn.answer?.trim();
    if (!answer || turn.turn_type === "summary") continue;

    const type = outputTypeForCluster(turn.cluster);
    const content = normalizeOutput(answer, turn.cluster);
    if (content.length < 10) continue;
    outputs.set(`${type}:${content.toLowerCase()}`, {
      output_type: type,
      content,
      cluster_source: turn.cluster,
    });
  }

  return Array.from(outputs.values()).slice(0, 15);
}

export async function generateIntegrityOutputs(input: {
  ownerUserId: string;
  turns: any[];
}) {
  const fallback = generateOutputsFromTurns(input.turns);
  const provider = await integrityProvider(input.ownerUserId);
  if (!provider) return fallback;

  try {
    const response = await enqueueLlmCall(provider.provider, {
      model: provider.model,
      system: [
        "You are extracting structured data from an Integrity Session transcript.",
        "Extract only what the user actually said, not inferences.",
        "Each item must be one clear statement, 10 to 40 words.",
        "Return ONLY valid JSON with this shape:",
        "{\"outputs\":[{\"type\":\"MEMORY|CANON|TONE|BOUNDARY|THEME\",\"content\":\"string\"}]}",
      ].join(" "),
      messages: [{
        role: "user",
        content: `Here is the full session transcript:\n${formatTurns(input.turns)}`,
      }],
    });
    const parsed = parseOutputJson(response.content);
    return parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function writeAcceptedOutput(outputId: string, ownerUserId: string, editedContent?: string) {
  const sb = getSupabaseAdmin();
  const { data: output, error } = await (sb as any)
    .from("integrity_session_outputs")
    .select("*")
    .eq("id", outputId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error || !output) throw new Error("Integrity output not found.");

  const content = (editedContent ?? output.edited_content ?? output.content).trim();
  if (!content) throw new Error("Accepted output content cannot be empty.");

  if (output.output_type === "memory_candidate" || output.output_type === "boundary") {
    const isBoundary = output.output_type === "boundary";
    const memory = await addMemoryItem({
      ownerUserId,
      personaId: output.persona_id,
      title: isBoundary ? "Boundary from integrity session" : "Memory from integrity session",
      content: isBoundary ? `BOUNDARY: ${content}` : content,
      sourceType: "integrity_session",
      relevanceWeight: isBoundary ? 9 : 7,
    });
    return { writtenTo: "memory", writtenTargetId: memory.id };
  }

  if (output.output_type === "canon_candidate") {
    const { data: canon, error: canonError } = await (sb as any)
      .from("canon_items")
      .insert({
        owner_user_id: ownerUserId,
        persona_id: output.persona_id,
        title: "Canon from integrity session",
        content,
        source_type: "integrity_session",
        priority: 8,
      })
      .select("id")
      .single();
    if (canonError) throw new Error(canonError.message);
    return { writtenTo: "canon", writtenTargetId: canon.id };
  }

  await upsertPreferenceNote(output.persona_id, ownerUserId, output.output_type, content);
  return { writtenTo: "preference_profile", writtenTargetId: null };
}

async function upsertPreferenceNote(personaId: string, ownerUserId: string, outputType: string, content: string) {
  const sb = getSupabaseAdmin();
  const { data: existing } = await (sb as any)
    .from("persona_preferences")
    .select("*")
    .eq("persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .single();

  const base = existing ?? {
    owner_user_id: ownerUserId,
    persona_id: personaId,
    warmth_level: "high",
    playfulness: "moderate",
    register_preference: "balanced",
    depth_preference: "expansive",
    challenge_preference: "balanced",
    disclaimer_sensitivity: "low",
    relationship_tone: "companion",
    recurring_topics: [],
    tone_notes: [],
  };

  const update: Record<string, unknown> = {
    owner_user_id: ownerUserId,
    persona_id: personaId,
    tone_notes: base.tone_notes ?? [],
    recurring_topics: base.recurring_topics ?? [],
  };

  const lower = content.toLowerCase();
  if (outputType === "theme") {
    update.recurring_topics = uniqueAppend(base.recurring_topics ?? [], shortPhrase(content));
  } else {
    update.tone_notes = uniqueAppend(base.tone_notes ?? [], content);
    if (lower.includes("playful") || lower.includes("witty")) update.playfulness = "high";
    if (lower.includes("serious")) update.playfulness = "low";
    if (lower.includes("warm")) update.warmth_level = "high";
    if (lower.includes("direct") || lower.includes("grounded")) update.register_preference = "grounded";
    if (lower.includes("mystical") || lower.includes("speculative")) update.register_preference = "mystical";
    if (lower.includes("challenge") || lower.includes("push back")) update.challenge_preference = "challenge";
    if (lower.includes("support") || lower.includes("validation")) update.challenge_preference = "support";
  }

  const { error } = await (sb as any)
    .from("persona_preferences")
    .upsert({ ...base, ...update }, { onConflict: "owner_user_id,persona_id" });
  if (error) throw new Error(error.message);
}

function outputTypeForCluster(cluster: string) {
  switch (cluster) {
    case "identity":
      return "canon_candidate";
    case "tone":
      return "preference";
    case "boundaries":
      return "boundary";
    case "themes":
      return "theme";
    default:
      return "memory_candidate";
  }
}

function normalizeOutput(answer: string, cluster: string) {
  const compact = answer.replace(/\s+/g, " ").trim();
  const clipped = compact.length > 280 ? `${compact.slice(0, 277).trim()}...` : compact;
  if (cluster === "boundaries" && !/^boundary:/i.test(clipped)) return clipped;
  return clipped;
}

function uniqueAppend(values: string[], next: string) {
  return Array.from(new Set([...values, next].map((value) => value.trim()).filter(Boolean))).slice(0, 20);
}

function shortPhrase(value: string) {
  return value.replace(/^(the user|user|they|i)\s+/i, "").replace(/[.?!]+$/g, "").slice(0, 90);
}

async function integrityProvider(ownerUserId: string) {
  if (!env.ANTHROPIC_API_KEY) return null;
  const sb = getSupabaseAdmin();
  const { data: profile } = await sb.from("profiles").select("tier").eq("id", ownerUserId).single();
  const selected = selectStationModel(profile?.tier);
  return {
    model: selected.model,
    provider: new AnthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, model: selected.model }),
  };
}

function firstQuestion(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  const match = trimmed.match(/[^?]+\?/);
  return match?.[0]?.trim() || trimmed.slice(0, 180).trim() || null;
}

function formatTurns(turns: any[]) {
  return turns
    .filter((turn) => turn.turn_type !== "summary")
    .map((turn) => `Q: ${turn.question}\nA: ${turn.answer ?? ""}`)
    .join("\n\n");
}

function parseOutputJson(value: string) {
  const jsonText = value.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(jsonText) as { outputs?: Array<{ type?: string; content?: string }> };
  const outputType: Record<string, string> = {
    MEMORY: "memory_candidate",
    CANON: "canon_candidate",
    TONE: "preference",
    BOUNDARY: "boundary",
    THEME: "theme",
  };
  return (parsed.outputs ?? [])
    .map((item) => ({
      output_type: outputType[String(item.type ?? "").toUpperCase()] ?? "memory_candidate",
      content: item.content?.trim() ?? "",
      cluster_source: "llm",
    }))
    .filter((item) => item.content.length >= 10)
    .slice(0, 15);
}
