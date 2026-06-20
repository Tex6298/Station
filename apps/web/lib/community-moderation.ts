import { hasTier } from "@station/auth";
import type { AuthUser, CommunityModerationSafetyAction } from "@station/types";
import { apiPatch } from "./api-client";

export const COMMUNITY_MODERATION_SAFETY_ACTIONS: CommunityModerationSafetyAction[] = [
  "hide",
  "unhide",
  "remove",
  "restore",
];

export type CommunityModerationTargetType = "thread" | "comment";

export interface ModeratableContribution {
  viewer_moderation_actions?: string[] | null;
  viewerModerationActions?: string[] | null;
}

export function moderationActionPath(targetType: CommunityModerationTargetType, targetId: string) {
  return targetType === "thread" ? `/threads/${targetId}/moderation` : `/comments/${targetId}/moderation`;
}

export function getViewerModerationActions(
  user: AuthUser | null | undefined,
  target: ModeratableContribution
): CommunityModerationSafetyAction[] {
  if (!user || (!user.isAdmin && !hasTier(user, "private"))) return [];

  const rawActions = target.viewer_moderation_actions ?? target.viewerModerationActions ?? [];
  return rawActions.filter((action): action is CommunityModerationSafetyAction =>
    COMMUNITY_MODERATION_SAFETY_ACTIONS.includes(action as CommunityModerationSafetyAction)
  );
}

export function moderationActionLabel(action: CommunityModerationSafetyAction) {
  if (action === "hide") return "Hide";
  if (action === "unhide") return "Unhide";
  if (action === "remove") return "Remove";
  return "Restore";
}

export async function moderateThread(
  token: string,
  threadId: string,
  action: CommunityModerationSafetyAction
) {
  return apiPatch<{ thread: any; moderationAction: unknown | null }>(
    moderationActionPath("thread", threadId),
    { action },
    token
  );
}

export async function moderateComment(
  token: string,
  commentId: string,
  action: CommunityModerationSafetyAction
) {
  return apiPatch<{ comment: any; moderationAction: unknown | null }>(
    moderationActionPath("comment", commentId),
    { action },
    token
  );
}
