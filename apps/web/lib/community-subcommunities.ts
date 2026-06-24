import { hasTier } from "@station/auth";
import type { AuthUser, CommunitySubcommunityRecord, SubcommunityType, SubcommunityVisibility } from "@station/types";

export function subcommunityListPath() {
  return "/forums/subcommunities";
}

export function mySubcommunitiesPath() {
  return "/forums/subcommunities/mine";
}

export function createSubcommunityPath() {
  return "/forums/subcommunities";
}

export function canCreateSubcommunity(user: AuthUser | null | undefined) {
  return Boolean(user?.isAdmin || hasTier(user ?? null, "canon"));
}

export function subcommunityTypeLabel(type: SubcommunityType) {
  if (type === "salon") return "Salon";
  if (type === "canon") return "Canon";
  if (type === "developer") return "Developer";
  return "General";
}

export function subcommunityVisibilityLabel(visibility: SubcommunityVisibility) {
  if (visibility === "community") return "Community";
  if (visibility === "public") return "Public";
  if (visibility === "private") return "Private";
  return "Unlisted";
}

export function isDirectorySubcommunity(
  subcommunity: Pick<CommunitySubcommunityRecord, "visibility" | "status">
) {
  return subcommunity.status === "active" && (
    subcommunity.visibility === "public" || subcommunity.visibility === "community"
  );
}

export function subcommunityCategoryHref(subcommunity: Pick<CommunitySubcommunityRecord, "slug">) {
  return `/forums/${subcommunity.slug}`;
}

export function subcommunityBadgeLabel(
  subcommunity: Pick<CommunitySubcommunityRecord, "type" | "visibility" | "status">
) {
  return `${subcommunityTypeLabel(subcommunity.type)} / ${subcommunityVisibilityLabel(subcommunity.visibility)} / ${subcommunity.status}`;
}
