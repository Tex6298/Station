import type { Database } from "@station/db";
import type { CommunitySubcommunityModeratorRecord, CommunitySubcommunityRecord } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import type { AuthenticatedUser } from "../middleware/require-auth";

type SubcommunityRow = Database["public"]["Tables"]["community_subcommunities"]["Row"];
type SubcommunityModeratorRow = Database["public"]["Tables"]["community_subcommunity_moderators"]["Row"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "username" | "display_name" | "avatar_url">;

const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

export function canSeeCommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

export function canCreateSubcommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && (user.isAdmin || user.tier === "canon" || user.tier === "institutional"));
}

export function canManageSubcommunityModerators(row: SubcommunityRow, user?: AuthenticatedUser | null) {
  return Boolean(user && (user.isAdmin || row.owner_user_id === user.id));
}

export function canReadSubcommunity(row: SubcommunityRow, user?: AuthenticatedUser | null) {
  if (row.owner_user_id === user?.id || user?.isAdmin) return true;
  if (row.status !== "active") return false;
  if (row.visibility === "public") return true;
  if (row.visibility === "community") return canSeeCommunity(user);
  return false;
}

export function canListSubcommunity(row: SubcommunityRow, user?: AuthenticatedUser | null) {
  if (row.visibility === "unlisted") return row.owner_user_id === user?.id || Boolean(user?.isAdmin);
  return canReadSubcommunity(row, user);
}

export function serializeSubcommunity(
  row: SubcommunityRow,
  user?: AuthenticatedUser | null
): CommunitySubcommunityRecord {
  const record: CommunitySubcommunityRecord = {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.subcommunity_type,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.owner_user_id === user?.id || user?.isAdmin) {
    record.ownerUserId = row.owner_user_id;
    record.linkedSpaceId = row.linked_space_id;
    record.linkedDeveloperSpaceId = row.linked_developer_space_id;
  }

  return record;
}

export function serializeSubcommunityModerator(
  row: SubcommunityModeratorRow,
  profile?: ProfileRow | null
): CommunitySubcommunityModeratorRecord {
  return {
    id: row.id,
    subcommunityId: row.subcommunity_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile: profile
      ? {
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
        }
      : null,
  };
}

export async function loadSubcommunityForCategory(categoryId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunities")
    .select("*")
    .eq("category_id", categoryId)
    .limit(1);
  if (error) throw new Error(error.message ?? "Failed to load subcommunity.");
  return ((data ?? [])[0] ?? null) as SubcommunityRow | null;
}

export async function loadSubcommunityModerators(subcommunityId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunity_moderators")
    .select("*")
    .eq("subcommunity_id", subcommunityId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message ?? "Failed to load subcommunity moderators.");
  const rows = (data ?? []) as SubcommunityModeratorRow[];
  const profiles = await loadSafeProfiles(rows.map((row) => row.user_id));
  return rows.map((row) => serializeSubcommunityModerator(row, profiles.get(row.user_id) ?? null));
}

export async function assignSubcommunityModerator(input: {
  subcommunity: SubcommunityRow;
  targetUserId: string;
  actorUserId: string;
}) {
  if (input.targetUserId === input.subcommunity.owner_user_id) {
    throw new Error("Subcommunity owner does not need a moderator assignment.");
  }

  const profile = await loadSafeProfile(input.targetUserId);
  if (!profile) throw new Error("Moderator user not found.");

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunity_moderators")
    .upsert({
      subcommunity_id: input.subcommunity.id,
      user_id: input.targetUserId,
      role: "moderator",
      status: "active",
      created_by: input.actorUserId,
    }, { onConflict: "subcommunity_id,user_id" })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to assign subcommunity moderator.");
  return serializeSubcommunityModerator(data as SubcommunityModeratorRow, profile);
}

export async function revokeSubcommunityModerator(input: {
  subcommunityId: string;
  targetUserId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunity_moderators")
    .update({ status: "revoked" })
    .eq("subcommunity_id", input.subcommunityId)
    .eq("user_id", input.targetUserId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message ?? "Failed to revoke subcommunity moderator.");
  if (!data) return null;
  const profile = await loadSafeProfile(input.targetUserId);
  return serializeSubcommunityModerator(data as SubcommunityModeratorRow, profile);
}

export async function canModerateSubcommunity(
  row: SubcommunityRow,
  user?: AuthenticatedUser | null
) {
  if (!user) return false;
  if (user.isAdmin || row.owner_user_id === user.id) return true;

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_subcommunity_moderators")
    .select("id")
    .eq("subcommunity_id", row.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (error) throw new Error(error.message ?? "Failed to verify subcommunity moderator.");
  return Boolean((data ?? [])[0]);
}

async function loadSafeProfiles(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map<string, ProfileRow>();

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", uniqueIds);

  if (error) throw new Error(error.message ?? "Failed to load moderator profiles.");
  return new Map<string, ProfileRow>((data ?? []).map((row: ProfileRow) => [row.id, row]));
}

async function loadSafeProfile(userId: string) {
  const profiles = await loadSafeProfiles([userId]);
  return profiles.get(userId) ?? null;
}
