import { TIER_LIMITS, type Tier } from "@station/config/tiers";
import type { AuthUser } from "@station/types";

export interface SpaceRecord { id: string; ownerUserId: string; isPublic: boolean; }
export interface PersonaRecord { id: string; ownerUserId: string; visibility: "private" | "public"; isPublicEnabled?: boolean; }

const TIER_ORDER: Tier[] = ["visitor", "private", "creator", "canon", "institutional"];

function withinLimit(limit: number, count: number): boolean {
  return limit < 0 || count < limit;
}

export function isAdmin(user?: AuthUser | null): boolean {
  return !!user?.isAdmin;
}

export function hasTier(user: AuthUser | null | undefined, minimum: Tier): boolean {
  if (!user) return minimum === "visitor";
  return TIER_ORDER.indexOf(user.tier) >= TIER_ORDER.indexOf(minimum);
}

export function tierLimits(user: AuthUser | null | undefined) {
  const tier = user?.tier ?? "visitor";
  return TIER_LIMITS[tier];
}

export function canCreatePersona(user: AuthUser | null, existingPersonaCount: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return withinLimit(tierLimits(user).personas, existingPersonaCount);
}

export function canCreatePublicPersona(user: AuthUser | null, existingPublicPersonaCount: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return withinLimit(tierLimits(user).publicPersonas, existingPublicPersonaCount);
}

export function canCreateSpace(user: AuthUser | null, existingSpaceCount: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!hasTier(user, "creator")) return false;
  return withinLimit(tierLimits(user).spaces, existingSpaceCount);
}

export function canCreateDeveloperSpace(
  user: AuthUser | null,
  existingDeveloperSpaceCount: number
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!hasTier(user, "canon")) return false;
  return withinLimit(tierLimits(user).developerSpaces, existingDeveloperSpaceCount);
}

export function canCreateThread(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return tierLimits(user).canCreateThreads;
}

export function canPublishDocuments(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return tierLimits(user).canPublishDocuments;
}
