import assert from "node:assert/strict";
import test from "node:test";
import {
  TIER_LABELS,
  TIER_LIMITS,
  TIER_PRICES_GBP,
  TIER_YEARLY_PRICES_GBP,
} from "@station/config";
import {
  BILLING_PLAN_TIERS,
  PRICING_TIER_ORDER,
  billingDeveloperSpaceLimitLabel,
  billingPlanDisplay,
  billingPriceLabel,
  billingPublicSpaceLimitLabel,
  billingSpaceLimitLabel,
  billingStorageLimitLabel,
  billingTierLabel,
  billingTierReadbackLabel,
  billingYearlyPriceLabel,
  pricingTierDisplay,
} from "./billing-tier-display";

function gbp(value: number) {
  return `GBP ${value.toLocaleString("en-GB")}`;
}

test("pricing tier display derives labels, prices, and storage from shared config", () => {
  assert.deepEqual(PRICING_TIER_ORDER, ["visitor", "private", "creator", "canon"]);

  for (const tier of PRICING_TIER_ORDER) {
    const display = pricingTierDisplay(tier);
    assert.equal(display.name, TIER_LABELS[tier]);
    assert.equal(display.price, gbp(TIER_PRICES_GBP[tier]));
  }

  assert.equal(pricingTierDisplay("visitor").interval, null);
  assert.equal(pricingTierDisplay("private").features.includes(`${TIER_LIMITS.private.storageGb} GB storage`), true);
  assert.equal(pricingTierDisplay("creator").features.includes(`${TIER_LIMITS.creator.storageGb} GB storage`), true);
  assert.equal(pricingTierDisplay("creator").features.includes("1 public Space (website)"), true);
  assert.equal(pricingTierDisplay("canon").features.includes(`${TIER_LIMITS.canon.storageGb} GB storage`), true);
  assert.equal(pricingTierDisplay("creator").yearlyPrice, gbp(TIER_YEARLY_PRICES_GBP.creator));
});

test("billing plan display derives paid plan cards from shared config", () => {
  assert.deepEqual(BILLING_PLAN_TIERS, ["private", "creator", "canon"]);

  const privatePlan = billingPlanDisplay("private");
  const creatorPlan = billingPlanDisplay("creator");
  const canonPlan = billingPlanDisplay("canon");

  assert.equal(privatePlan.name, TIER_LABELS.private);
  assert.equal(privatePlan.price, gbp(TIER_PRICES_GBP.private));
  assert.equal(privatePlan.features.includes(`${TIER_LIMITS.private.storageGb} GB storage`), true);

  assert.equal(creatorPlan.name, TIER_LABELS.creator);
  assert.equal(creatorPlan.features.includes(`${TIER_LIMITS.creator.storageGb} GB storage`), true);
  assert.equal(creatorPlan.features.includes("1 public Space"), true);
  assert.equal(creatorPlan.yearlyPriceWithInterval, `${gbp(TIER_YEARLY_PRICES_GBP.creator)}/year`);

  assert.equal(canonPlan.name, TIER_LABELS.canon);
  assert.equal(canonPlan.features.includes(`${TIER_LIMITS.canon.spaces} Spaces`), true);
  assert.equal(canonPlan.features.includes(`${TIER_LIMITS.canon.developerSpaces} Developer Space`), true);
  assert.equal(canonPlan.features.includes(`${TIER_LIMITS.canon.storageGb} GB storage`), true);
});

test("billing helper labels preserve unlimited and unknown tier behavior", () => {
  assert.equal(billingTierLabel("canon"), TIER_LABELS.canon);
  assert.equal(billingTierLabel("unknown-tier"), "unknown-tier");
  assert.equal(billingPriceLabel("creator"), gbp(TIER_PRICES_GBP.creator));
  assert.equal(billingYearlyPriceLabel("creator"), gbp(TIER_YEARLY_PRICES_GBP.creator));
  assert.equal(billingStorageLimitLabel("creator"), `${TIER_LIMITS.creator.storageGb} GB`);
  assert.equal(billingSpaceLimitLabel("creator"), `${TIER_LIMITS.creator.spaces} Space`);
  assert.equal(billingPublicSpaceLimitLabel("creator"), "1 public Space");
  assert.equal(billingDeveloperSpaceLimitLabel("canon"), `${TIER_LIMITS.canon.developerSpaces} Developer Space`);
  assert.equal(pricingTierDisplay("creator").features.includes("Unlimited personas"), true);
});

test("tier readback labels do not invent unavailable authenticated state", () => {
  assert.equal(billingTierReadbackLabel("private"), TIER_LABELS.private);
  assert.equal(billingTierReadbackLabel("canon"), TIER_LABELS.canon);
  assert.equal(billingTierReadbackLabel("unknown-tier"), "unknown-tier");
  assert.equal(billingTierReadbackLabel(null), null);
  assert.equal(billingTierReadbackLabel(undefined), null);
});
