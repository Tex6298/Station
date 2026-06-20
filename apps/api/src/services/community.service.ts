import { getSupabaseAdmin } from "../lib/supabase";

export type CommunityVoteTargetType = "thread" | "comment";
export type CommunityWitnessKind = "helpful" | "grounded" | "careful";
export type CommunityModerationTargetType = "thread" | "comment" | "user";
export type CommunityModerationAction =
  | "lock"
  | "unlock"
  | "pin"
  | "unpin"
  | "hide"
  | "unhide"
  | "remove"
  | "restore"
  | "mute"
  | "unmute";

export async function ensureCommunityProfile(userId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("community_user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await (sb as any)
    .from("community_user_profiles")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function bumpCommunityActivity(userId: string, kind: "thread" | "comment") {
  const sb = getSupabaseAdmin();
  const profile = await ensureCommunityProfile(userId);
  const threadCount = profile.thread_count ?? 0;
  const commentCount = profile.comment_count ?? 0;
  const nextThreadCount = kind === "thread" ? threadCount + 1 : threadCount;
  const nextCommentCount = kind === "comment" ? commentCount + 1 : commentCount;
  const reputationScore = (nextThreadCount * 2) + nextCommentCount + (profile.helpful_vote_count ?? 0);

  await (sb as any)
    .from("community_user_profiles")
    .update({
      thread_count: nextThreadCount,
      comment_count: nextCommentCount,
      reputation_score: reputationScore,
      trust_level: trustLevelForScore(reputationScore),
    })
    .eq("user_id", userId);
}

export async function castCommunityVote(input: {
  voterUserId: string;
  targetType: CommunityVoteTargetType;
  targetId: string;
  value: -1 | 1;
}) {
  const sb = getSupabaseAdmin();
  const table = input.targetType === "thread" ? "threads" : "comments";
  const { data: target } = await (sb as any)
    .from(table)
    .select("id, author_user_id")
    .eq("id", input.targetId)
    .maybeSingle();

  if (!target) throw new Error("Vote target not found.");
  if (target.author_user_id === input.voterUserId) {
    throw new Error("You cannot vote on your own post.");
  }

  const { data, error } = await (sb as any)
    .from("community_votes")
    .upsert({
      voter_user_id: input.voterUserId,
      target_type: input.targetType,
      target_id: input.targetId,
      value: input.value,
    }, { onConflict: "voter_user_id,target_type,target_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  try {
    if (input.targetType === "thread") {
      await (sb as any).rpc("recalculate_thread_vote_score", { thread_id: input.targetId });
    } else {
      await (sb as any).rpc("recalculate_comment_vote_score", { comment_id: input.targetId });
    }
  } catch {
    // Vote rows are authoritative; denormalised scores can be repaired later.
  }

  await bumpHelpfulVote(target.author_user_id, input.value).catch(() => undefined);
  return data;
}

export async function listViewerVotes(input: {
  voterUserId?: string | null;
  targetType: CommunityVoteTargetType;
  targetIds: string[];
}) {
  if (!input.voterUserId || input.targetIds.length === 0) return {};
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_votes")
    .select("target_id, value")
    .eq("voter_user_id", input.voterUserId)
    .eq("target_type", input.targetType)
    .in("target_id", input.targetIds);

  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((row: any) => [row.target_id, row.value]));
}

export function emptyWitnessCounts() {
  return { helpful: 0, grounded: 0, careful: 0 };
}

export function isCommunityWitnessKind(value: string): value is CommunityWitnessKind {
  return value === "helpful" || value === "grounded" || value === "careful";
}

export async function setCommunityWitness(input: {
  witnessUserId: string;
  targetType: CommunityVoteTargetType;
  targetId: string;
  witnessKind: CommunityWitnessKind;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_witnesses")
    .upsert({
      witness_user_id: input.witnessUserId,
      target_type: input.targetType,
      target_id: input.targetId,
      witness_kind: input.witnessKind,
      revoked_at: null,
    }, { onConflict: "witness_user_id,target_type,target_id,witness_kind" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeCommunityWitness(input: {
  witnessUserId: string;
  targetType: CommunityVoteTargetType;
  targetId: string;
  witnessKind: CommunityWitnessKind;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_witnesses")
    .update({ revoked_at: new Date().toISOString() })
    .eq("witness_user_id", input.witnessUserId)
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .eq("witness_kind", input.witnessKind)
    .is("revoked_at", null)
    .select("*");

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function listCommunityWitnessSummaries(input: {
  viewerUserId?: string | null;
  targetType: CommunityVoteTargetType;
  targetIds: string[];
}) {
  if (input.targetIds.length === 0) return {};
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_witnesses")
    .select("target_id, witness_kind, witness_user_id")
    .eq("target_type", input.targetType)
    .in("target_id", input.targetIds)
    .is("revoked_at", null);

  if (error) throw new Error(error.message);

  const summaries: Record<string, { witness_counts: ReturnType<typeof emptyWitnessCounts>; viewer_witnesses?: CommunityWitnessKind[] }> = {};
  for (const targetId of input.targetIds) {
    summaries[targetId] = { witness_counts: emptyWitnessCounts() };
    if (input.viewerUserId) summaries[targetId].viewer_witnesses = [];
  }

  for (const row of data ?? []) {
    const kind = isCommunityWitnessKind(row.witness_kind) ? row.witness_kind : null;
    if (!kind) continue;
    const summary = summaries[row.target_id] ?? { witness_counts: emptyWitnessCounts() };
    summary.witness_counts[kind] += 1;
    if (input.viewerUserId && row.witness_user_id === input.viewerUserId && !summary.viewer_witnesses?.includes(kind)) {
      (summary.viewer_witnesses ??= []).push(kind);
    }
    summaries[row.target_id] = summary;
  }

  return summaries;
}

export async function recordModerationAction(input: {
  moderatorUserId: string;
  targetType: CommunityModerationTargetType;
  targetId: string;
  actionType: CommunityModerationAction;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_moderation_actions")
    .insert({
      moderator_user_id: input.moderatorUserId,
      target_type: input.targetType,
      target_id: input.targetId,
      action_type: input.actionType,
      reason: input.reason ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function listModerationActions(targetType: CommunityModerationTargetType, targetId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_moderation_actions")
    .select("id, moderator_user_id, target_type, target_id, action_type, reason, metadata, created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function serializeCommunityProfile(row: any) {
  if (!row) return row;
  return {
    userId: row.user_id,
    trustLevel: row.trust_level,
    reputationScore: row.reputation_score,
    threadCount: row.thread_count,
    commentCount: row.comment_count,
    helpfulVoteCount: row.helpful_vote_count,
    reportCount: row.report_count,
    mutedUntil: row.muted_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeModerationAction(row: any) {
  return {
    id: row.id,
    moderatorUserId: row.moderator_user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    actionType: row.action_type,
    reason: row.reason,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

async function bumpHelpfulVote(authorUserId: string, value: -1 | 1) {
  const sb = getSupabaseAdmin();
  const profile = await ensureCommunityProfile(authorUserId);
  const helpfulVoteCount = Math.max(0, (profile.helpful_vote_count ?? 0) + value);
  const reputationScore = ((profile.thread_count ?? 0) * 2) + (profile.comment_count ?? 0) + helpfulVoteCount;

  await (sb as any)
    .from("community_user_profiles")
    .update({
      helpful_vote_count: helpfulVoteCount,
      reputation_score: reputationScore,
      trust_level: trustLevelForScore(reputationScore),
    })
    .eq("user_id", authorUserId);
}

function trustLevelForScore(score: number) {
  if (score >= 100) return 4;
  if (score >= 50) return 3;
  if (score >= 15) return 2;
  if (score >= 3) return 1;
  return 0;
}
