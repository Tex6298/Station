export type CheckoutTier = "private" | "creator" | "canon";
export type BillingPlanAction = "current" | "activate" | "upgrade" | "included" | "lower-tier";

const CHECKOUT_TIERS: CheckoutTier[] = ["private", "creator", "canon"];
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const TIER_RANK: Record<string, number> = {
  visitor: 0,
  private: 1,
  creator: 2,
  canon: 3,
  institutional: 4,
};

export function isActiveSubscriptionStatus(status: string | null | undefined) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status ?? "");
}

export function checkoutTierFor(value: string | null | undefined): CheckoutTier | null {
  return CHECKOUT_TIERS.includes(value as CheckoutTier) ? value as CheckoutTier : null;
}

export function billingPlanAction(input: {
  currentTier: string;
  planTier: CheckoutTier;
  subscriptionStatus: string | null | undefined;
}): BillingPlanAction {
  if (input.currentTier === input.planTier) {
    return isActiveSubscriptionStatus(input.subscriptionStatus) ? "current" : "activate";
  }

  const currentRank = TIER_RANK[input.currentTier] ?? 0;
  const planRank = TIER_RANK[input.planTier];
  if (currentRank > planRank) {
    return isActiveSubscriptionStatus(input.subscriptionStatus) ? "included" : "lower-tier";
  }

  return "upgrade";
}

export function billingPlanActionLabel(action: BillingPlanAction, planName: string, price: string) {
  if (action === "current") return "Current plan";
  if (action === "activate") return `Activate ${planName}`;
  if (action === "included") return "Included in current plan";
  if (action === "lower-tier") return "Lower-tier option";
  return `Upgrade - ${price}/mo`;
}

export function billingPlanActionDetail(action: BillingPlanAction) {
  if (action === "current") return "This is your active subscription tier.";
  if (action === "activate") return "Opens Stripe Checkout to reactivate this plan in test mode.";
  if (action === "included") return "Your current tier already includes these limits or better.";
  if (action === "lower-tier") return "This plan is below your recorded tier. Use the Stripe portal for active subscription changes, or reactivate your current plan if billing is inactive.";
  return "Opens Stripe Checkout for this higher tier in test mode.";
}
