# PR345 - UX-07 Billing Tier Display Helper

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR344 Billing/entitlement source mapping.
- Public Pricing storage and entitlement-timing copy were corrected.
- PR344 recommends a shared Billing/Pricing tier display helper, including authenticated Billing plan-card copy.
Task:
- Implement the smallest safe shared Billing/Pricing display-helper slice.
- Keep Stripe mutation, Checkout, Portal, webhook, entitlement enforcement, schema, and migration behavior unchanged.
- Add focused tests proving display copy matches shared tier config.
- Wake ARGUS for hostile review, or wake MIMIR with the exact blocker if implementation is not safe.
```

## Goal

Make visible billing and pricing tier copy derive from one tested display helper
so public Pricing, authenticated Billing, and shared server limits cannot drift
again.

## Scope

Implement a narrow display-source-of-truth slice:

- Add or extend a small web billing display helper that reads or normalizes
  shared tier labels, prices, yearly prices, and tier limits from
  `@station/config`.
- Use it in public `/pricing`.
- Use it in authenticated `/billing` plan-card display copy.
- Cover storage, Spaces, Developer Spaces, paid-tier labels, monthly prices,
  and yearly prices where those are already visible.
- Keep token-credit copy separate from subscription entitlement copy.
- Keep Developer Space usage quota copy separate from subscription pricing copy
  unless it is already represented through shared tier limits.
- Preserve the same-tier inactive activation posture and higher-tier/lower-tier
  plan-card action logic from `apps/web/lib/billing-plan-actions.ts`.

Primary files:

- `apps/web/app/(marketing)/pricing/page.tsx`
- `apps/web/app/billing/page.tsx`
- `apps/web/lib/billing-plan-actions.ts`
- `packages/config/src/tiers.ts`
- existing billing/pricing tests or nearby web helper tests

## Non-Scope

Do not change:

- Stripe products or Price IDs;
- Checkout behavior;
- Billing Portal behavior;
- webhook handling;
- entitlement enforcement;
- customer/profile binding;
- schema or migrations;
- token top-up behavior;
- tax, invoices, Connect, marketplace, tips, usage billing, or live-money
  claims;
- Redis, Cloudflare, providers, onboarding, or broad billing redesign.

Do not print or commit Stripe URLs, customer IDs, subscription IDs, payment IDs,
tokens, cookies, or secrets.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If a command is unavailable, explain the exact substitution in the result doc.

## Required Result

Create:

```text
docs/roadmap/PR345_UX07_BILLING_TIER_DISPLAY_HELPER_RESULT.md
```

Include:

- changed files;
- how public Pricing and authenticated Billing now share display truth;
- preserved Stripe/entitlement boundaries;
- validation results;
- any remaining UX-07 caveats;
- wakeup for ARGUS if code changed, or wakeup for MIMIR if blocked.
