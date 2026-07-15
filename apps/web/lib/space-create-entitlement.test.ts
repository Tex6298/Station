import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  deriveSpaceCreateAccess,
  spaceCountLabel,
  spaceLimitLabel,
  staleSpaceCreateCopy,
  staleSpaceCreateResolvedCopy,
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
    deriveSpaceCreateAccess({ user: baseUser, billing: { tier: "creator", limits: { spaces: 0.5 } }, spaces: { spaces: [] } }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({
      user: { id: "institutional-owner", tier: "institutional", isAdmin: false },
      billing: { tier: "institutional", limits: { spaces: -1 } },
      spaces: { spaces: [] },
    }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: baseUser, billing: baseBilling, spaces: { rows: [] } }),
    { status: "unverifiable" }
  );
  assert.deepEqual(
    deriveSpaceCreateAccess({ user: { ...baseUser, id: "" }, billing: baseBilling, spaces: { spaces: [] } }),
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

test("space create entitlement handles finite count and strict admin boundaries", () => {
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
      user: { id: "malformed-admin", tier: "creator", isAdmin: "true" as unknown as boolean },
      billing: baseBilling,
      spaces: { spaces: [{}] },
    }),
    {
      status: "limit-reached",
      tier: "creator",
      count: 1,
      limit: 1,
      countLabel: "1 Space",
      limitLabel: "1 Space",
    }
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
  assert.equal(
    staleSpaceCreateResolvedCopy(),
    "Station checked your currently verified tier and Space count again. Your entries are still here; review them before submitting again."
  );
  assert.doesNotMatch(staleSpaceCreateCopy(), /server|response|debug|stack|provider|checkout|stripe/i);
});

test("space create page keeps stale-race and theme controls truthful", () => {
  const page = readFileSync("apps/web/app/space/new/page.tsx", "utf8");
  const css = readFileSync("apps/web/app/globals.css", "utf8");

  assert.match(page, /runPreflight\("stale"\)/);
  assert.match(page, /gate\.reason === "stale"/);
  assert.match(page, /staleSpaceCreateResolvedCopy\(\)/);
  assert.doesNotMatch(page, /A fresh access check is running/);
  assert.doesNotMatch(page, /<label className="space-form-field">/);
  assert.match(page, /role="group" aria-label="Theme"/);
  assert.match(page, /aria-label="Title"/);
  assert.match(page, /aria-pressed=\{form\.theme === option\.id\}/);
  assert.match(page, /SPACE_CREATE_THEME_DESCRIPTIONS\[option\.id\]/);
  assert.doesNotMatch(page, /Your authored public home/);
  assert.match(page, /label: "Review plan details", href: "\/billing"/);
  assert.match(page, /label: "View My Spaces", href: "\/space"/);
  assert.match(css, /\.space-create-page \.space-builder-panel\s*\{[^}]*var\(--station-frame-panel\)/s);
  assert.match(css, /\.space-create-page \.space-choice\s*\{[^}]*var\(--station-frame-text\)/s);
  assert.match(css, /\.space-create-page \.space-segmented-control button\[data-active="true"\]\s*\{[^}]*var\(--station-frame-active\)/s);
  assert.match(css, /\.space-create-page \.space-form-error\s*\{[^}]*var\(--station-page-danger-bg\)/s);
});
