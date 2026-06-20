import type { AuthenticatedUser } from "../middleware/require-auth";
import type { CommunityModerationAction } from "./community.service";
import { canModerateSubcommunity, loadSubcommunityForCategory } from "./community-subcommunities.service";

export type CommunityModerationSafetyAction = "hide" | "unhide" | "remove" | "restore";

const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

export const COMMUNITY_MODERATION_SAFETY_ACTIONS: CommunityModerationSafetyAction[] = [
  "hide",
  "unhide",
  "remove",
  "restore",
];

const DELEGATED_SUBCOMMUNITY_ACTIONS = new Set<CommunityModerationAction>(COMMUNITY_MODERATION_SAFETY_ACTIONS);

type ModerationAuthorization =
  | { ok: true; delegated: boolean }
  | { ok: false; status: number; error: string };

export async function authorizeSubcommunityModeration(input: {
  user: AuthenticatedUser;
  action: CommunityModerationAction;
  categoryId: string;
  targetAuthorUserId?: string | null;
}): Promise<ModerationAuthorization> {
  if (input.user.isAdmin) return { ok: true, delegated: false };

  if (!DELEGATED_SUBCOMMUNITY_ACTIONS.has(input.action)) {
    return { ok: false, status: 403, error: "Admin access required." };
  }

  let subcommunity: Awaited<ReturnType<typeof loadSubcommunityForCategory>>;
  try {
    subcommunity = await loadSubcommunityForCategory(input.categoryId);
  } catch {
    return { ok: false, status: 500, error: "Could not verify subcommunity moderation authority." };
  }

  if (!subcommunity) return { ok: false, status: 403, error: "Admin access required." };

  let canModerate = false;
  try {
    canModerate = await canModerateSubcommunity(subcommunity, input.user);
  } catch {
    return { ok: false, status: 500, error: "Could not verify subcommunity moderation authority." };
  }

  if (!canModerate) return { ok: false, status: 403, error: "Admin access required." };

  if (input.targetAuthorUserId === input.user.id && subcommunity.owner_user_id !== input.user.id) {
    return {
      ok: false,
      status: 403,
      error: "Delegated moderators cannot moderate their own contribution.",
    };
  }

  return { ok: true, delegated: true };
}

export function moderationSafetyActionsForTarget(target: {
  status?: string | null;
  is_hidden?: boolean | null;
  isHidden?: boolean | null;
  moderation_state?: string | null;
  moderationState?: string | null;
}): CommunityModerationSafetyAction[] {
  const status = target.status ?? null;
  const hidden = Boolean(target.is_hidden ?? target.isHidden);
  const moderationState = target.moderation_state ?? target.moderationState ?? null;

  if (status === "removed" || moderationState === "removed") return ["restore"];
  if (hidden || moderationState === "hidden") return ["unhide", "remove"];
  return ["hide", "remove"];
}

export async function viewerModerationSafetyActions(input: {
  user?: AuthenticatedUser | null;
  subcommunity: { id: string; owner_user_id: string } | null;
  targetAuthorUserId?: string | null;
  target: Parameters<typeof moderationSafetyActionsForTarget>[0];
}): Promise<CommunityModerationSafetyAction[]> {
  const user = input.user;
  if (!user || (!user.isAdmin && !COMMUNITY_TIERS.has(user.tier))) return [];
  if (user.isAdmin) return moderationSafetyActionsForTarget(input.target);
  if (!input.subcommunity) return [];

  let canModerate = false;
  try {
    canModerate = await canModerateSubcommunity(input.subcommunity as any, user);
  } catch {
    return [];
  }

  if (!canModerate) return [];
  if (input.targetAuthorUserId === user.id && input.subcommunity.owner_user_id !== user.id) return [];

  return moderationSafetyActionsForTarget(input.target);
}
