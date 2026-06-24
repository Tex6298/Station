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

export function subcommunityDirectoryIntroCopy() {
  return "Canon, Developer, and Salon community areas.";
}

export function subcommunityDirectorySummary(
  subcommunities: Pick<CommunitySubcommunityRecord, "type">[]
) {
  const counts = new Map<SubcommunityType, number>();
  for (const subcommunity of subcommunities) {
    counts.set(subcommunity.type, (counts.get(subcommunity.type) ?? 0) + 1);
  }

  const parts = (["canon", "developer", "salon"] as const)
    .map((type) => {
      const count = counts.get(type) ?? 0;
      if (count === 0) return null;
      const label = subcommunityTypeLabel(type);
      const pluralLabel = type === "salon" ? "Salons" : label;
      return `${count} ${count === 1 ? label : pluralLabel}`;
    })
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" / ") : "No public or community areas";
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

export function subcommunityThreadEmptyCopy(
  subcommunity: Pick<CommunitySubcommunityRecord, "type"> | null | undefined,
  canPost: boolean
) {
  if (subcommunity?.type === "salon") {
    return canPost ? "No Salon threads yet. Start the first discussion." : "No Salon threads yet.";
  }
  return canPost ? "No threads yet. Be the first to post!" : "No threads yet.";
}
