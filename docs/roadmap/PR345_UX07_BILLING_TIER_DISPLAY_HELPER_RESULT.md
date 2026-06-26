# PR345 - UX-07 Billing Tier Display Helper Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the smallest safe shared Billing/Pricing display-helper
slice.

Changed files:

- `apps/web/lib/billing-tier-display.ts`
- `apps/web/lib/billing-tier-display.test.ts`
- `apps/web/app/(marketing)/pricing/page.tsx`
- `apps/web/app/billing/page.tsx`
- `package.json`

## Shared Display Truth

- Added `billing-tier-display.ts`, which derives public Pricing and
  authenticated Billing display copy from `@station/config`.
- The helper now owns:
  - paid-tier labels;
  - monthly price labels;
  - visible yearly price labels;
  - storage limit labels;
  - Space and public Space limit labels;
  - Developer Space limit labels;
  - persona limit labels;
  - public Pricing plan features;
  - authenticated Billing plan-card features.
- Public `/pricing` now maps `PRICING_TIER_ORDER` through
  `pricingTierDisplay`.
- Authenticated `/billing` now maps `BILLING_PLAN_TIERS` through
  `billingPlanDisplay`.
- The Billing current-plan limit readback now uses the shared limit formatter
  for Spaces, Developer Spaces, and storage.
- The same-tier inactive activation path and higher-tier/lower-tier card action
  logic remain in `apps/web/lib/billing-plan-actions.ts`.

## Boundary

This patch is display/helper/test-only. It does not change:

- Stripe products or Price IDs.
- Checkout behavior.
- Billing Portal behavior.
- webhook handling.
- entitlement enforcement.
- customer/profile binding.
- schema or migrations.
- token top-up behavior.
- tax, invoices, Connect, marketplace, tips, usage billing, or live-money
  claims.
- Redis, Cloudflare, providers, onboarding, or broad billing design.

No Stripe URLs, customer IDs, subscription IDs, payment IDs, tokens, cookies, or
secrets were added.

## Tests

- Added `apps/web/lib/billing-tier-display.test.ts`.
- Updated `test:billing` to include the new helper tests.
- Helper tests prove Pricing/Billing display values derive from
  `TIER_LABELS`, `TIER_PRICES_GBP`, `TIER_YEARLY_PRICES_GBP`, and
  `TIER_LIMITS`.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Notes:

- `test:billing` passed 14 tests, including the new display-helper tests.
- `test:token-credits` passed 3 tests.
- `test:storage` passed 16 tests.
- Web typecheck passed.
- `lint` passed with no warnings.
- `git diff --check` passed with CRLF normalization notices only.

## Remaining UX-07 Caveats

- Pricing/Billing now share tier display truth, but the Billing page still uses
  route-local layout and color constants.
- Token-credit and Developer Space usage quota copy remain intentionally
  separate from subscription entitlement copy.
- A later lane can improve Billing IA/loading states, but should not mutate
  Stripe or entitlement behavior without a separate packet.

## Review Requests

ARGUS should review:

- Whether shared display helper coverage is enough to prevent another visible
  tier-limit drift.
- Whether Billing and Pricing now avoid stale storage, Space, Developer Space,
  price, and yearly-price copy.
- Whether any helper copy overreaches into token-credit, Developer Space usage,
  live-money, or entitlement-enforcement territory.
