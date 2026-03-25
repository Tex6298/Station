import { TIER_LIMITS, type Tier } from "@station/config/tiers";
import type { AuthUser } from "@station/types";

export interface SpaceRecord { id: string; ownerUserId: string; isPublic: boolean; }
export interface PersonaRecord { id: string; ownerUserId: string; visibility: "private" | "public"; isPublicEnabled?: boolean; }

const TIER_ORDER: Tier[] = ["visitor", "private", "creator", "canon", "institutional"];

export function isAdmin(user?: AuthUser | null): boolean {
  return !!user?.isAdmin;
}

export function hasTier(user: AuthUser | null | undefined, minimum: Tier): boolean {
  if (!user) return minimum === "visitor";
  return TIER_ORDER.indexOf(user.tier) >= TIER_ORDER.indexOf(minimum);
}

export function tierLimits(user: AuthUser | null | undefined) {
  const tier = user?.tier ?? "visitor";
  // institutional gets canon limits (expand later with its own limits)
  return TIER_LIMITS[tier === "institutional" ? "canon" : tier];
}

export function canCreatePersona(user: AuthUser | null, existingPersonaCount: number): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return existingPersonaCount < tierLimits(user).personas;
}

export function canCreateSpace(user: AuthUser | null, existingSpaceCount: number): boolean {
  if (!user || !hasTier(user, "creator")) return false;
  if (isAdmin(user)) return true;
  return existingSpaceCount < tierLimits(user).spaces;
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
