import { getSupabaseAdmin } from "../lib/supabase";

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
    const { data: memory, error: memoryError } = await (sb as any)
      .from("memory_items")
      .insert({
        owner_user_id: ownerUserId,
        persona_id: output.persona_id,
        title: isBoundary ? "Boundary from integrity session" : "Memory from integrity session",
        content: isBoundary ? `BOUNDARY: ${content}` : content,
        source_type: "integrity_session",
        relevance_weight: isBoundary ? 9 : 7,
      })
      .select("id")
      .single();
    if (memoryError) throw new Error(memoryError.message);
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
