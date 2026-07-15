import { TIER_LIMITS, type Tier } from "@station/config";
import { hasTier } from "@station/auth/permissions";
import type { AuthUser } from "@station/types";

const RECOGNIZED_TIERS = new Set<Tier>(["visitor", "private", "creator", "canon", "institutional"]);

export type SpaceCreateAccess =
  | { status: "allowed"; tier: Tier; count: number; limit: number }
  | { status: "below-tier"; tier: Tier }
  | { status: "limit-reached"; tier: Tier; count: number; limit: number; countLabel: string; limitLabel: string }
  | { status: "unverifiable" };

export interface SpaceCreatePreflightInput {
  user: Pick<AuthUser, "id" | "tier"> & { isAdmin?: boolean };
  billing: { tier?: unknown; limits?: { spaces?: unknown } };
  spaces: unknown;
}

export function deriveSpaceCreateAccess(input: SpaceCreatePreflightInput): SpaceCreateAccess {
  const userTier = recognizedTier(input.user.tier);
  const billingTier = recognizedTier(input.billing?.tier);
  const limitValue = input.billing?.limits?.spaces;
  const spaces = ownerSpaces(input.spaces);

  if (
    !userTier ||
    !billingTier ||
    userTier !== billingTier ||
    typeof limitValue !== "number" ||
    !Number.isFinite(limitValue) ||
    !spaces
  ) {
    return { status: "unverifiable" };
  }

  const limit = limitValue;
  const count = spaces.length;
  const user = { id: input.user.id, tier: billingTier, isAdmin: Boolean(input.user.isAdmin) };

  if (!hasTier(user, "creator")) {
    return { status: "below-tier", tier: billingTier };
  }

  if (!user.isAdmin && !withinLimit(limit, count)) {
    return {
      status: "limit-reached",
      tier: billingTier,
      count,
      limit,
      countLabel: spaceCountLabel(count),
      limitLabel: spaceLimitLabel(limit),
    };
  }

  return { status: "allowed", tier: billingTier, count, limit };
}

export function spaceLimitLabel(limit: number) {
  if (limit < 0) return "Unlimited Spaces";
  return `${limit} ${limit === 1 ? "Space" : "Spaces"}`;
}

export function spaceCountLabel(count: number) {
  return `${count} ${count === 1 ? "Space" : "Spaces"}`;
}

export function staleSpaceCreateCopy() {
  return "Space creation was not allowed. Your entries are still here while Station checks your currently verified tier and Space count again.";
}

function recognizedTier(value: unknown): Tier | null {
  return typeof value === "string" && RECOGNIZED_TIERS.has(value as Tier) ? (value as Tier) : null;
}

function ownerSpaces(value: unknown): unknown[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const spaces = (value as { spaces?: unknown }).spaces;
  return Array.isArray(spaces) ? spaces : null;
}

function withinLimit(limit: number, count: number): boolean {
  return limit < 0 || count < limit;
}

export function tierSpaceLimit(tier: Tier) {
  return TIER_LIMITS[tier].spaces;
}
