export type CheckoutTier = "private" | "creator" | "canon";
export type BillingPlanAction = "current" | "activate" | "upgrade";

const CHECKOUT_TIERS: CheckoutTier[] = ["private", "creator", "canon"];
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

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
  if (input.currentTier !== input.planTier) return "upgrade";
  return isActiveSubscriptionStatus(input.subscriptionStatus) ? "current" : "activate";
}
