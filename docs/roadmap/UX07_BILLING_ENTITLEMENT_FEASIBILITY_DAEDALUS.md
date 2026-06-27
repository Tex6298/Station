# UX-07 Billing And Entitlement Clarity Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: OPEN - WAKE DAEDALUS
Opened: 2026-06-27

## Why This Opens

UX-06 Developer Space observatory feasibility found no default implementation
blocker and recommended moving to UX-07.

UX-07 is billing and entitlement clarity. The repo already has accepted billing
clarity work from PR74 plus later UX-07 work from PR344, PR345, and PR347, so
this is not an instruction to rebuild billing or change Stripe behavior. It is
a current-state reconciliation pass.

## Stripe Product Boundary

Station's recurring subscription path should remain conservative:

- Stripe Billing APIs for subscriptions.
- Stripe Checkout Sessions for subscription checkout.
- Stripe Customer Portal for self-service management and cancellation.
- Stripe Prices as the server-selected integration unit.
- Verified Stripe webhooks as the entitlement mutation path.

Do not introduce manual renewal loops, raw PaymentIntent subscription handling,
client-only entitlement grants, new Stripe products/prices, live-money claims,
tax/invoice expansion, Connect, marketplace, tips, or usage-billing
architecture in this pass.

## Product Question

Can a signed-in user understand their current plan, subscription state, tier
limits, token credits, storage/quota, upgrade/portal handoff, failure states,
and what Station will or will not change before verified server-side billing
state updates?

Answer this from current main and current docs.

## Inputs

Read and reconcile:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/PR74_BILLING_ENTITLEMENT_CLARITY.md`
- `docs/roadmap/PR74_BILLING_ENTITLEMENT_CLARITY_ARIADNE.md`
- `docs/roadmap/PR344_UX07_BILLING_ENTITLEMENT_SOURCE_MAP_RESULT.md`
- `docs/roadmap/PR345_UX07_BILLING_TIER_DISPLAY_HELPER_RESULT.md`
- `docs/roadmap/PR347_UX07_AUTHENTICATED_BILLING_HOSTED_RECHECK_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- current `docs/testing/VALIDATION_BASELINE.md`
- current billing, token-credit, storage, tier config, and frontend helper code

## Likely Surfaces

- `/billing`
- `/pricing`
- `/settings`
- Studio sidebar usage readback
- persona Archive/files storage readback

Likely files:

- `apps/web/app/billing/page.tsx`
- `apps/web/app/(marketing)/pricing/page.tsx`
- `apps/web/lib/billing-plan-actions.ts`
- `apps/web/lib/billing-plan-actions.test.ts`
- `apps/web/lib/billing-tier-display.ts`
- `apps/web/lib/billing-tier-display.test.ts`
- `apps/web/components/settings/token-usage-panel.tsx`
- `apps/web/components/settings/storage-usage-panel.tsx`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/routes/billing.test.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/routes/token-credits.ts`
- `apps/api/src/routes/token-credits.test.ts`
- `packages/config/src/tiers.ts`

Inspect more files only if current imports require it.

## What To Classify

Classify each area as solved, stale, fragile, deferred, or recommended next
slice:

- active subscription current-plan readback;
- inactive same-tier activation readback;
- lower-tier and higher-tier plan-card action copy;
- Checkout success/cancel/error copy;
- Portal/cancellation handoff copy;
- subscription entitlements versus token credits/top-ups;
- storage, Space, Developer Space, persona, and publishing limits;
- Pricing versus Billing tier display source of truth;
- server-selected Price ID behavior;
- verified webhook entitlement mutation;
- customer/profile/subscription binding;
- signed-out and unauthenticated access;
- Settings and Studio usage panels;
- mobile 375px/390px fit;
- any remaining drift between visible copy and server-authoritative limits.

## Hard Boundaries

Do not change:

- Stripe products, Prices, coupons, trials, tax, invoices, Connect,
  marketplace, tips, or usage billing;
- Checkout, Portal, webhook, customer binding, or entitlement mutation behavior;
- schema or migrations;
- token-credit grants or top-up behavior;
- storage quota math;
- public Space, Developer Space, Studio, auth/session, provider/model, Redis,
  Cloudflare, Railway, Supabase, worker, queue, config, deploy, key, or package
  behavior;
- broad Billing redesign or dark-pattern upgrade copy.

No implementation should happen in this feasibility pass.

## Output Required

Create:

```text
docs/roadmap/UX07_BILLING_ENTITLEMENT_FEASIBILITY_RESULT.md
```

Include:

- current route/API/helper map;
- evidence to keep from PR74, PR344, PR345, PR347, and any later billing
  hardening;
- stale assumptions;
- current visible state matrix;
- exact caveats that remain acceptable;
- recommendation: no implementation, evidence-only rehearsal, or one narrow
  implementation slice;
- ARGUS gates for any recommended slice;
- ARIADNE human rehearsal points.

If no implementation is needed, say so plainly and name the next roadmap lane.
If a slice is recommended, keep it small enough for ARGUS to review auth,
customer/profile binding, entitlement enforcement, server-authoritative limits,
`test:billing`, `test:token-credits`, `test:spaces`, and
`test:developer-spaces`.

## Validation For This Feasibility Pass

Run:

```bash
git diff --check
```

Also run an added-line sensitive-pattern scan for the docs-only patch before
committing.

Do not run Stripe mutations, Checkout, Portal, top-up purchase, or product tests
unless code changes land. Any hosted or browser proof must be read-only unless
MIMIR explicitly authorizes the exact billing/test-mode mutation.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed UX-07 Billing and entitlement clarity feasibility.
- Current billing, entitlement, token-credit, storage/quota, and Stripe handoff
  evidence is classified.
Task:
- Decide whether to close UX-07, open the recommended slice, request evidence,
  or move to the next roadmap lane.
```
