import type { Database } from "@station/db";
import type { CommunitySubcommunityRecord } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import type { AuthenticatedUser } from "../middleware/require-auth";

type SubcommunityRow = Database["public"]["Tables"]["community_subcommunities"]["Row"];

const COMMUNITY_TIERS = new Set(["private", "creator", "canon", "institutional"]);

export function canSeeCommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && COMMUNITY_TIERS.has(user.tier));
}

export function canCreateSubcommunity(user?: AuthenticatedUser | null) {
  return Boolean(user && (user.isAdmin || user.tier === "canon" || user.tier === "institutional"));
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

export async function loadSubcommunityForCategory(categoryId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("community_subcommunities")
    .select("*")
    .eq("category_id", categoryId)
    .limit(1);
  return ((data ?? [])[0] ?? null) as SubcommunityRow | null;
}
