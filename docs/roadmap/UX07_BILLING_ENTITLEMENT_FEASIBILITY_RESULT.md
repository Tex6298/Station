# UX-07 Billing And Entitlement Clarity Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR
Status: COMPLETE - WAKE MIMIR
Completed: 2026-06-27

## Verdict

Current `main` does not need a Stripe rebuild, subscription-flow rewrite, or
new billing architecture before staging. The accepted PR74, PR344, PR345, PR347,
and PR181/PR182 evidence is still valid: Billing, Pricing, token credits,
storage quota, and entitlement mutation now have a clear source map and a
mostly coherent user-facing story.

Recommended next action: open one tiny non-Stripe slice, `UX-07A Settings Tier
Snapshot Readback`, unless MIMIR decides Settings profile copy is outside this
billing lane. The only confirmed visible drift I found is that
`apps/web/app/settings/page.tsx` still renders a literal `Creator tier` in the
Profile Snapshot panel instead of reading the signed-in user's real tier.

Do not change Checkout, Portal, webhook, customer binding, token-credit grants,
storage quota math, tier limits, Stripe products, Stripe Prices, or schema for
that slice.

## Current Route, API, And Helper Map

- Public Pricing: `apps/web/app/(marketing)/pricing/page.tsx` maps
  `PRICING_TIER_ORDER` through `pricingTierDisplay`.
- Authenticated Billing: `apps/web/app/billing/page.tsx` fetches `/billing/me`,
  displays the current plan/status/limits, separates token credits from
  subscription entitlements, and sends Checkout or Portal requests through the
  API client.
- Billing actions: `apps/web/lib/billing-plan-actions.ts` distinguishes
  current, activate, included lower-tier, lower-tier option, and upgrade states.
- Tier display: `apps/web/lib/billing-tier-display.ts` derives labels, prices,
  storage, Space, Developer Space, and persona limit copy from
  `@station/config`.
- Server billing API: `apps/api/src/routes/billing.ts` exposes signed
  `/billing/webhook` before auth, then protects `/billing/me`,
  `/billing/checkout`, and `/billing/portal`.
- Billing service: `apps/api/src/services/billing.service.ts` selects server
  Stripe Prices, creates subscription-mode Checkout sessions, creates Customer
  Portal sessions, and mutates profile entitlement only from verified webhook
  events.
- Token credits: `apps/api/src/routes/token-credits.ts`,
  `apps/api/src/services/token-credits.service.ts`, and
  `apps/web/components/settings/token-usage-panel.tsx` keep monthly usage,
  top-ups, and model-experience messaging separate from subscription tier.
- Storage quota: `apps/api/src/routes/storage.ts`,
  `apps/api/src/services/storage.service.ts`, and
  `apps/web/components/settings/storage-usage-panel.tsx` read durable usage and
  `TIER_LIMITS` storage caps.
- Route protection: `apps/web/lib/auth-routes.ts` protects `/billing`, and
  `apps/web/lib/auth-routes.test.ts` covers that guard.

## Evidence To Keep

- PR74 fixed the plan-card action matrix: active current plans say
  `Current plan`, inactive same-tier users get an activation CTA, lower-tier
  cards for active higher-tier users say `Included in current plan`, inactive
  higher-tier users see `Lower-tier option`, and higher tiers still upgrade.
- PR74 also separated subscription entitlements from token credits and made the
  Checkout cancel return state say the plan was not changed.
- PR344 mapped billing, entitlement, token-credit, storage, and Developer Space
  quota sources, then aligned public Pricing storage copy with `TIER_LIMITS`.
- PR345 moved public Pricing and authenticated Billing display copy through the
  shared display helper and patched the Checkout success notice to wait for
  verified server subscription state updates.
- PR347 proved authenticated hosted `/billing` and `/billing?success=1` at
  desktop and 375px after login, including plan readback, limits, token-credit
  separation, and calm success copy.
- PR181/PR182 closed the protected-alpha test-mode proof that Checkout creation
  alone does not grant entitlement, while verified Stripe subscription state
  does update Station tier.

## Stale Assumptions

- Older same-tier inactive billing friction is stale after PR74.
- The lower-tier upgrade-copy defect is stale after PR74.
- The public-only PR346 caveat that authenticated Billing had not been proven
  is stale after PR347.
- The PR344 display-duplication risk for Pricing versus Billing is stale after
  PR345.
- Pre-PR181 docs that frame paid activation as unproven are stale after the
  PR181 proof and PR182 reconciliation.
- Any copy implying that browser return from Checkout activates the plan is
  stale; current copy waits for verified server state.

## Current Visible State Matrix

- Signed out: `/pricing` remains public; `/billing` is protected by the auth
  route guard and redirects through the sign-in flow.
- Loading/error: Billing and the Settings usage panels have loading and error
  states instead of pretending state is known.
- Active current plan: Billing shows the current plan, subscription status,
  server-returned limits, and the Customer Portal management action.
- Inactive same tier: Billing shows `Activate <tier>` and explains that Checkout
  can reactivate the recorded plan in test mode.
- Lower-tier card for active higher-tier users: Billing disables it as included
  in the current plan.
- Lower-tier card for inactive higher-tier users: Billing disables it as a
  lower-tier option and points the user back to current-plan reactivation or
  Portal use for active subscriptions.
- Higher-tier card: Billing uses Checkout for an upgrade attempt.
- Checkout success return: Billing says Station reflects the plan only after
  verified server subscription state updates.
- Checkout cancel return: Billing says the Station plan was not changed.
- Token credits: Settings and Studio show usage/top-up state separately from
  subscription entitlements.
- Storage quota: Settings, Studio, and persona files surfaces show quota and
  category estimates from durable usage plus tier limits.

## Caveats

- `apps/web/app/settings/page.tsx` hardcodes `Creator tier` in Profile Snapshot.
  This is the only visible source drift I would open by default.
- `BillingStatus` still includes raw Stripe customer/subscription identifiers in
  the web client type. Current UI does not render them; future UI work should
  keep them out of visible copy.
- Only Creator yearly pricing is surfaced by `visibleYearlyPrice`, even though
  config contains yearly prices for the paid tiers. Treat this as a product
  decision, not a stealth code fix.
- Token-credit purchase buttons exist, but this pass did not click payment-mode
  Checkout. Any future top-up proof should be a named, explicit test-mode
  packet.
- Production money handling, tax, invoices, coupons, Connect, marketplace,
  tips, and deep usage billing remain deferred and out of this lane.

## Recommended UX-07A Slice

Name: `UX-07A Settings Tier Snapshot Readback`

Goal: remove the literal `Creator tier` copy from the Settings Profile Snapshot
and derive the label from a real authenticated source or the existing Billing
status/readback helper.

Allowed scope:

- `apps/web/app/settings/page.tsx`
- a tiny helper/test only if needed to reuse `billingTierLabel`
- documentation/status updates for the result

Non-goals:

- no Checkout, Portal, webhook, or Stripe service behavior changes
- no token-credit grant changes
- no storage quota math changes
- no schema changes
- no Settings redesign
- no Profile editor implementation

ARGUS gates:

- The displayed tier must come from authenticated Station state, not from
  client-only optimistic copy.
- The slice must not expose raw Stripe object identifiers.
- The Settings page must still preserve the separate Billing, Token Credits,
  Storage, and AI Activity panels.
- Validation should include typecheck, lint, `test:billing`, and the smallest
  affected helper or route tests.

ARIADNE rehearsal points:

- Settings at desktop and 375px with at least Basic, Creator, and Canon-like
  states if fixtures allow.
- Confirm Profile Snapshot tier copy matches Billing readback.
- Confirm Billing and token-credit copy still remain separate.
- Do not click Checkout, Portal, or top-up purchase controls for this slice.

## Validation

Docs-only feasibility patch. No Stripe mutation, Checkout, Portal, top-up
purchase, browser proof, schema change, or product test was run.

| Command / check | Result | Notes |
| --- | --- | --- |
| Current source inspection | Pass | Billing, Pricing, billing helper, token-credit, storage, Settings, and route guard code inspected. |
| Prior evidence reconciliation | Pass | PR74, PR344, PR345, PR347, PR181, and PR182 are still valid current-main evidence. |
| Recommended next action | Pass | Open one tiny Settings tier readback slice, or close UX-07 if MIMIR scopes Settings profile copy elsewhere. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| Added-line sensitive-pattern scan | Pass | No matches; command emitted CRLF normalization warnings only. |
