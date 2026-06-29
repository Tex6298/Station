import assert from "node:assert/strict";
import test from "node:test";
import { developerSpaceCommercialPackagingReadback } from "./developer-space-commercial-packaging";

test("developer space commercial packaging derives Canon / Developer readback from billing helpers", () => {
  const readback = developerSpaceCommercialPackagingReadback();

  assert.equal(readback.planName, "Canon / Developer");
  assert.equal(readback.includedLimit, "1 Developer Space");
  assert.equal(readback.billingHref, "/billing");
  assert.equal(readback.billingAction, "upgrade");
  assert.match(readback.billingActionLabel, /Upgrade - GBP 250\/mo/);
  assert.equal(readback.routeActionLabel, "Review plan in Billing");
  assert.match(readback.entitlementCopy, /Canon \/ Developer includes 1 Developer Space/);
  assert.match(readback.billingBoundaryCopy, /Station Billing/);
  assert.match(readback.billingBoundaryCopy, /test-mode Checkout and Customer Portal/);
  assert.match(readback.verifiedStateCopy, /verified server subscription state/);
  assert.match(readback.runtimeBoundaryCopy, /self-hosted project runtimes/);
});

test("developer space commercial packaging reuses billing action states without opening checkout locally", () => {
  assert.deepEqual(
    {
      activeCanon: developerSpaceCommercialPackagingReadback({
        currentTier: "canon",
        subscriptionStatus: "active",
      }).routeActionLabel,
      inactiveCanon: developerSpaceCommercialPackagingReadback({
        currentTier: "canon",
        subscriptionStatus: "inactive",
      }).routeActionLabel,
      institutional: developerSpaceCommercialPackagingReadback({
        currentTier: "institutional",
        subscriptionStatus: "active",
      }).routeActionLabel,
    },
    {
      activeCanon: "Manage in Billing",
      inactiveCanon: "Review activation in Billing",
      institutional: "Manage in Billing",
    }
  );
});

test("developer space commercial packaging copy avoids direct Stripe objects and hosted-runtime claims", () => {
  const rendered = JSON.stringify(developerSpaceCommercialPackagingReadback({
    currentTier: "creator",
    subscriptionStatus: "trialing",
  }));

  assert.doesNotMatch(rendered, /cs_(test|live)_/i);
  assert.doesNotMatch(rendered, /price_[a-z0-9]+/i);
  assert.doesNotMatch(rendered, /cus_[a-z0-9]+/i);
  assert.doesNotMatch(rendered, /sub_[a-z0-9]+/i);
  assert.doesNotMatch(rendered, /checkout\.stripe\.com|billing\.stripe\.com/i);
  assert.doesNotMatch(rendered, /card number|webhook payload|hosted logs|SQL output/i);
  assert.doesNotMatch(rendered, /Station hosts the developer app|Station-hosted runtime/i);
});
