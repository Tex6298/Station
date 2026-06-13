import { getSupabaseAdmin } from "../lib/supabase";

export type CommunityVoteTargetType = "thread" | "comment";
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
