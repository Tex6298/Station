import assert from "node:assert/strict";
import test from "node:test";
import {
  billingPlanActionDetail,
  billingPlanActionLabel,
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

test("billing plan actions avoid upgrade copy for lower-tier cards", () => {
  assert.equal(billingPlanAction({ currentTier: "canon", planTier: "private", subscriptionStatus: "active" }), "included");
  assert.equal(billingPlanAction({ currentTier: "canon", planTier: "creator", subscriptionStatus: "active" }), "included");
  assert.equal(billingPlanAction({ currentTier: "canon", planTier: "private", subscriptionStatus: "inactive" }), "lower-tier");
  assert.equal(billingPlanAction({ currentTier: "institutional", planTier: "canon", subscriptionStatus: "active" }), "included");
});

test("billing plan action labels explain checkout, portal, and read-only states", () => {
  assert.equal(billingPlanActionLabel("current", "Creator", "GBP 100"), "Current plan");
  assert.equal(billingPlanActionLabel("activate", "Canon", "GBP 250"), "Activate Canon");
  assert.equal(billingPlanActionLabel("included", "Basic", "GBP 10"), "Included in current plan");
  assert.equal(billingPlanActionLabel("lower-tier", "Basic", "GBP 10"), "Lower-tier option");
  assert.equal(billingPlanActionLabel("upgrade", "Creator", "GBP 100"), "Upgrade - GBP 100/mo");
  assert.match(billingPlanActionDetail("included"), /already includes/);
  assert.match(billingPlanActionDetail("lower-tier"), /Stripe portal/);
  assert.match(billingPlanActionDetail("upgrade"), /Checkout/);
});
