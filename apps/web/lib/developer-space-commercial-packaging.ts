import {
  billingPlanAction,
  billingPlanActionDetail,
  billingPlanActionLabel,
  type BillingPlanAction,
} from "./billing-plan-actions";
import {
  billingDeveloperSpaceLimitLabel,
  billingPlanDisplay,
} from "./billing-tier-display";

const DEVELOPER_SPACE_PLAN_TIER = "canon" as const;

export interface DeveloperSpaceCommercialPackagingInput {
  currentTier?: string | null;
  subscriptionStatus?: string | null;
}

export interface DeveloperSpaceCommercialPackagingReadback {
  badge: string;
  planName: string;
  includedLimit: string;
  billingHref: string;
  billingAction: BillingPlanAction;
  billingActionLabel: string;
  billingActionDetail: string;
  routeActionLabel: string;
  entitlementCopy: string;
  billingBoundaryCopy: string;
  verifiedStateCopy: string;
  runtimeBoundaryCopy: string;
}

export function developerSpaceCommercialPackagingReadback(
  input: DeveloperSpaceCommercialPackagingInput = {}
): DeveloperSpaceCommercialPackagingReadback {
  const plan = billingPlanDisplay(DEVELOPER_SPACE_PLAN_TIER);
  const includedLimit = billingDeveloperSpaceLimitLabel(plan.tier);
  const billingAction = billingPlanAction({
    currentTier: input.currentTier ?? "visitor",
    planTier: plan.tier,
    subscriptionStatus: input.subscriptionStatus,
  });

  return {
    badge: `${plan.name} capability`,
    planName: plan.name,
    includedLimit,
    billingHref: "/billing",
    billingAction,
    billingActionLabel: billingPlanActionLabel(billingAction, plan.name, plan.price),
    billingActionDetail: billingPlanActionDetail(billingAction),
    routeActionLabel: routeActionLabel(billingAction, input.currentTier !== undefined),
    entitlementCopy: `${plan.name} includes ${includedLimit} for a Tier 1 public showcase, observatory, evidence path, and bounded readback.`,
    billingBoundaryCopy: "Plan changes start in Station Billing. Billing owns the Stripe-hosted test-mode Checkout and Customer Portal handoff; this page only links there.",
    verifiedStateCopy: "Station reflects plan changes only after verified server subscription state updates.",
    runtimeBoundaryCopy: "Developer Spaces show public-safe readbacks from self-hosted project runtimes; Station does not host the developer app or runtime infrastructure.",
  };
}

function routeActionLabel(action: BillingPlanAction, hasKnownTier: boolean) {
  if (!hasKnownTier) return "Review plan in Billing";
  if (action === "current" || action === "included") return "Manage in Billing";
  if (action === "activate") return "Review activation in Billing";
  return "Review upgrade in Billing";
}
