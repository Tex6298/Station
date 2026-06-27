# UX-07A Settings Tier Snapshot Readback

Owner: DAEDALUS
Reviewer: ARGUS, then ARIADNE if ARGUS accepts the technical boundary
Status: ARGUS accepted technical boundary - ARIADNE visible review next
Opened: 2026-06-27
Completed: 2026-06-27

## Why This Opens

DAEDALUS completed UX-07 Billing And Entitlement Clarity Feasibility in
`docs/roadmap/UX07_BILLING_ENTITLEMENT_FEASIBILITY_RESULT.md`.

MIMIR accepts the feasibility result: current `main` does not need a Stripe
rebuild, subscription-flow rewrite, token-credit rewrite, storage/quota rewrite,
or new billing architecture before staging.

The only confirmed visible drift is narrow: `apps/web/app/settings/page.tsx`
still renders a literal `Creator tier` in the Settings Profile Snapshot panel.
That copy can contradict the authenticated user's actual plan. Fix only that
readback.

## Product Question

Can a signed-in user open Settings and see a Profile Snapshot tier label that
matches Station's authenticated billing/tier state, without confusing
subscription entitlements with token credits, storage quota, or Stripe checkout
return state?

## Allowed Scope

- `apps/web/app/settings/page.tsx`
- a tiny helper or test file only if needed to reuse existing tier display
  helpers cleanly
- focused tests for the touched Settings/tier readback behavior
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Hard Boundaries

Do not change:

- Stripe Checkout, Portal, webhook, customer binding, Price selection, product
  IDs, coupons, trials, tax, invoices, Connect, marketplace, tips, or
  usage-billing behavior;
- entitlement mutation behavior;
- token-credit grants, top-up purchase behavior, or token-credit accounting;
- storage quota math, Space limits, Developer Space limits, persona limits, or
  publishing limits;
- schema, migrations, API auth/session, provider/model, Redis, Cloudflare,
  Railway, Supabase, worker, queue, config, package, deploy, or public route
  behavior;
- broad Settings redesign or Profile editor behavior.

## Implementation Guidance

- Prefer the existing authenticated Billing/tier source and display helpers
  already used by `/billing` and `/pricing`.
- The visible tier label must come from authenticated Station state, not from a
  hardcoded literal, client-only optimistic state, selected pricing card, URL
  query string, or Stripe return page state.
- Keep raw Stripe customer/subscription IDs out of visible Settings copy.
- Preserve the separation between:
  - subscription plan/tier;
  - token credits and top-up balance;
  - storage/quota readback;
  - AI activity/provider readback.
- Preserve existing loading and error states. Do not invent a tier when the
  authenticated readback is unavailable.

## ARGUS Gates

- Settings Profile Snapshot tier copy matches the same authenticated tier source
  used by Billing.
- No raw Stripe object identifiers or sensitive billing internals are rendered.
- The patch does not change Stripe, entitlement mutation, token credits, storage
  quota, or schema behavior.
- Settings still keeps Billing, Token Credits, Storage, and AI Activity as
  distinct readbacks.
- Validation includes `test:billing`, `typecheck`, `lint`, `git diff --check`,
  and the smallest affected web/helper test suite.

## ARIADNE Rehearsal Points

If ARGUS accepts the technical boundary, ARIADNE should rehearse:

- `/settings` desktop and 375px mobile;
- Basic-like, Creator-like, and Canon-like tier states if fixtures allow;
- Settings Profile Snapshot tier copy against `/billing` current-plan readback;
- token-credit/top-up copy remains separate from subscription tier copy;
- no overlap, clipping, or horizontal overflow.

Do not click Checkout, Portal, top-up purchase, or any Stripe mutation control
for this slice.

## Validation For DAEDALUS

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Also run the smallest affected Settings/web helper test suite if the local code
points to one, plus an added-line sensitive-pattern scan before committing.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented UX-07A Settings Tier Snapshot Readback.
- Settings Profile Snapshot no longer hardcodes a tier label.
- Stripe, entitlement mutation, token credits, storage quota, and schema
  behavior were not changed.
Task:
- Review the authenticated tier source, billing boundary, visible copy, and
  validation. If accepted, wake ARIADNE for desktop/mobile rehearsal.
```

## DAEDALUS Result

Settings Profile Snapshot no longer hardcodes `Creator tier`.
`apps/web/app/settings/page.tsx` restores the verified browser session, derives
the tier label through `billingTierReadbackLabel`, shows a loading state while
the authenticated readback is pending, and shows `Tier unavailable` instead of
inventing a plan when the readback is unavailable.

The patch does not change Stripe, Checkout, Portal, webhook, entitlement
mutation, token credits, storage quota, schema, public routes, or package
scripts.

## ARGUS Review

Verdict: `ACCEPTED TECHNICAL BOUNDARY - WAKE ARIADNE`.

ARGUS accepts UX-07A as a narrow Settings Profile Snapshot readback fix. The
visible tier label is derived from restored Station browser session state,
which verifies through `/auth/me`, then passes through the existing Billing tier
display helper path. The UI shows `Tier unavailable` instead of inventing a plan
when authenticated tier readback is unavailable.

Boundary review:

- No Stripe Checkout, Portal, webhook, customer binding, Price selection,
  product, entitlement mutation, token-credit, storage quota, schema,
  public-route, package-script, provider/model, Redis, Cloudflare, Railway,
  Supabase, worker, queue, config, or deploy behavior changed.
- Settings still keeps subscription tier, token credits, storage usage, and AI
  Activity as separate readbacks.
- No raw Stripe customer/subscription IDs, checkout URLs, payment IDs, tokens,
  credentials, or secret-shaped values were added.

ARGUS validation rerun:

| Command / check | Result | Notes |
| --- | --- | --- |
| `git diff HEAD^ HEAD --check` | Pass | DAEDALUS UX-07A commit whitespace check passed. |
| Added-line sensitive-pattern scan | Reviewed | Matches were boundary wording for Stripe/token/storage; no secret material found. |
| `npm exec --yes pnpm@10.32.1 -- run test:billing` | Pass | 15 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint reported no warnings or errors. |

ARIADNE should rehearse `/settings` on desktop and mobile, including available
and unavailable tier readback states if fixtures allow, and confirm the Profile
Snapshot tier copy remains visually separate from token credits, storage, AI
Activity, and Billing/Stripe mutation controls.
