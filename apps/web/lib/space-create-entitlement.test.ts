import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveSpaceCreateAccess,
  spaceCountLabel,
  spaceLimitLabel,
  staleSpaceCreateCopy,
  tierSpaceLimit,
} from "./space-create-entitlement";

const baseUser = { id: "owner-user", tier: "creator" as const, isAdmin: false };
const baseBilling = { tier: "creator", limits: { spaces: 1 } } as const;

test("space create entitlement validates response shape and tier agreement", () => {
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: baseBilling, spaces: { spaces: [] } }),
    { status: "allowed", tier: "creator", count: 0, limit: 1 }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: { ...baseUser, tier: "private" }, billing: baseBilling, spaces: { spaces: [] } }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: { tier: "unknown", limits: { spaces: 1 } }, spaces: { spaces: [] } }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: { tier: "creator", limits: { spaces: Number.NaN } }, spaces: { spaces: [] } }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: baseBilling, spaces: { rows: [] } }),
    { status: "unverifiable" }
  );
});

test("space create entitlement applies Creator threshold before count policy", () => {
  assert.deepEqual(
    deriveSpaceCreateAccess({
      user: { id: "admin-basic", tier: "private", isAdmin: true },
      billing: { tier: "private", limits: { spaces: 0 } },
      spaces: { spaces: [] },
    }),
    { status: "below-tier", tier: "private" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({
      user: { id: "admin-creator", tier: "creator", isAdmin: true },
      billing: { tier: "creator", limits: { spaces: 1 } },
      spaces: { spaces: [{ id: "one" }, { id: "two" }] },
    }),
    { status: "allowed", tier: "creator", count: 2, limit: 1 }
  );
});

test("space create entitlement handles finite and unlimited count boundaries", () => {
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: baseBilling, spaces: { spaces: [{ id: "existing" }] } }),
    {
      status: "limit-reached",
      tier: "creator",
      count: 1,
      limit: 1,
      countLabel: "1 Space",
      limitLabel: "1 Space",
    }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({
      user: { id: "canon-owner", tier: "canon", isAdmin: false },
      billing: { tier: "canon", limits: { spaces: 3 } },
      spaces: { spaces: [{}, {}, {}] },
    }),
    {
      status: "limit-reached",
      tier: "canon",
      count: 3,
      limit: 3,
      countLabel: "3 Spaces",
      limitLabel: "3 Spaces",
    }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({
      user: { id: "institutional-owner", tier: "institutional", isAdmin: false },
      billing: { tier: "institutional", limits: { spaces: -1 } },
      spaces: { spaces: [{}, {}, {}, {}, {}, {}] },
    }),
    { status: "allowed", tier: "institutional", count: 6, limit: -1 }
  );
});

test("space create entitlement copy and labels stay bounded", () => {
  assert.equal(spaceLimitLabel(-1), "Unlimited Spaces");
  assert.equal(spaceLimitLabel(1), "1 Space");
  assert.equal(spaceLimitLabel(2), "2 Spaces");
  assert.equal(spaceCountLabel(1), "1 Space");
  assert.equal(spaceCountLabel(4), "4 Spaces");
  assert.equal(tierSpaceLimit("creator"), 1);
  assert.equal(
    staleSpaceCreateCopy(),
    "Space creation was not allowed. Your entries are still here while Station checks your currently verified tier and Space count again."
  );
  assert.doesNotMatch(staleSpaceCreateCopy(), /server|response|debug|stack|provider|checkout|stripe/i);
});
