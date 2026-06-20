import type { AuthenticatedUser } from "../middleware/require-auth";
import type { CommunityModerationAction } from "./community.service";
import { canModerateSubcommunity, loadSubcommunityForCategory } from "./community-subcommunities.service";

const DELEGATED_SUBCOMMUNITY_ACTIONS = new Set<CommunityModerationAction>([
  "hide",
  "unhide",
  "remove",
  "restore",
]);

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify subcommunity moderation authority.";
    return { ok: false, status: 500, error: message };
  }

  if (!subcommunity) return { ok: false, status: 403, error: "Admin access required." };

  let canModerate = false;
  try {
    canModerate = await canModerateSubcommunity(subcommunity, input.user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify subcommunity moderation authority.";
    return { ok: false, status: 500, error: message };
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
