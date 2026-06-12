import assert from "node:assert/strict";
import test from "node:test";
import {
  billingPlanAction,
  checkoutTierFor,
  isActiveSubscriptionStatus,
} from "./billing-plan-actions";

test("billing plan actions keep active current tiers on current-plan behavior", () => {
  assert.equal(isActiveSubscriptionStatus("active"), true);
  assert.equal(isActiveSubscriptionStatus("trialing"), true);
  assert.equal(billingPlanAction({ currentTier: "creator", planTier: "creator", subscriptionStatus: "active" }), "current");
  assert.equal(billingPlanAction({ currentTier: "creator", planTier: "creator", subscriptionStatus: "trialing" }), "current");
});

test("billing plan actions allow inactive same-tier activation through checkout", () => {
  assert.equal(isActiveSubscriptionStatus("inactive"), false);
  assert.equal(isActiveSubscriptionStatus(null), false);
  assert.equal(billingPlanAction({ currentTier: "canon", planTier: "canon", subscriptionStatus: "inactive" }), "activate");
  assert.equal(billingPlanAction({ currentTier: "private", planTier: "private", subscriptionStatus: null }), "activate");
});

test("billing plan actions keep different tiers on upgrade behavior", () => {
  assert.equal(billingPlanAction({ currentTier: "private", planTier: "creator", subscriptionStatus: "inactive" }), "upgrade");
  assert.equal(checkoutTierFor("private"), "private");
  assert.equal(checkoutTierFor("visitor"), null);
  assert.equal(checkoutTierFor("institutional"), null);
});
