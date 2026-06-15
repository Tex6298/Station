# PR 3 - Stripe Paid-Path Proof

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 2 archive/import robustness accepted by A3 / ARGUS in
`9ae6209`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS. A4 / ARIADNE only if the proof
requires a visible hosted Checkout or billing-page human rehearsal.

Status: ARGUS accepted the reconciliation on 2026-06-15 and recommends closing
PR 3 for bounded Stripe test-mode paid-path proof. See
`docs/roadmap/PR3_STRIPE_PAID_PATH_RECONCILIATION.md`.

## Goal

Prove commercial activation once in Stripe test mode without turning billing
into a polish or pricing lane.

The replay claim to earn is:

> Station can honestly say the paid subscription activation path has been tested
> end-to-end in Stripe test mode.

## Current Truth To Reconcile

- The repo already has a Stripe Billing foundation: Checkout Sessions for
  subscriptions, verified webhook handling, profile tier/subscription sync,
  Billing Portal session creation, and token top-up support.
- Earlier staging notes contain useful Stripe demo evidence, but the current
  backend roadmap still names paid subscription activation as external or
  replay-adjacent. PR 3 should reconcile that status with the current code and
  staging evidence rather than duplicating work blindly.
- Stripe subscriptions should stay on Stripe Billing APIs plus Checkout
  Sessions. Do not replace subscription activation with manual PaymentIntent
  renewal logic.

## Scope

- Inspect current billing routes, billing service, token-credit service,
  billing tests, readiness checks, and prior Stripe evidence docs.
- Confirm the exact current state:
  - checkout session can be created in test mode,
  - webhook signature verification is enforced,
  - a subscription event updates profile tier/subscription state,
  - `/billing/me` reflects the persisted state,
  - Billing Portal still opens for the bound customer,
  - token top-up behavior remains separate and idempotent.
- If current accepted evidence already proves PR 3 for the present staging
  target and code, close the lane with a source-backed reconciliation note.
- If safe env/test credentials allow it, run one bounded Stripe test-mode
  activation proof through the existing Checkout/webhook path and capture only
  sanitized status labels.
- If proof requires an external hosted Checkout payment, Dashboard action,
  Stripe CLI forwarding, or a real signed Stripe test event that DAEDALUS
  cannot safely perform, wake MIMIR with the exact missing action and stop.
- Add or adjust focused tests only where the inspection finds a real behavior
  gap.

## Do Not

- Do not run live-money billing.
- Do not fabricate subscription state.
- Do not mutate entitlements from unsigned webhook bodies.
- Do not redesign billing UX.
- Do not add pricing strategy or new tier semantics.
- Do not print, commit, or summarize secret values, card numbers, Checkout URLs,
  Portal URLs, customer IDs, subscription IDs, owner IDs, tokens, cookies, raw
  webhook payload bodies, or replay credentials.
- Do not drift into Redis, Cloudflare, provider policy, archive/import, or UI
  polish.

## Acceptance Gates

- Checkout session creation is proven or the exact external blocker is named.
- Signed webhook handling is proven; invalid signatures still fail closed.
- Subscription/profile entitlement sync is proven through a real test-mode
  Stripe subscription event or explicitly remains blocked on a named external
  action.
- `/billing/me` reflects the expected sanitized tier/subscription/customer
  presence state after the proof.
- Billing Portal creation still works for the bound customer.
- Token top-up grants remain separate from subscription activation and still
  resist duplicate grants.
- The final evidence note does not contain Stripe secrets, URLs, object IDs,
  replay owner IDs, private response bodies, or credentials.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 test:billing
npx --yes pnpm@10.32.1 test:token-credits
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If readiness wording changes, also run:

```bash
npx --yes pnpm@10.32.1 test:health
npx --yes pnpm@10.32.1 test:replay-readiness
```

## Handoff

DAEDALUS should produce either:

- an accepted PR 3 proof package for ARGUS review, or
- a precise blocker wakeup for MIMIR naming the single external Stripe action
  needed.

The handoff to ARGUS must include:

- files changed,
- whether the proof was reconciliation-only or a fresh test-mode activation,
- sanitized route/status/tier/subscription labels,
- webhook signature behavior,
- token-credit separation evidence,
- validation run,
- remaining caveat if PR 3 should continue.

## DAEDALUS Reconciliation Result

DAEDALUS inspected the current billing route/service/test surfaces and the
accepted staging evidence. The later `STAGING-DEMO-STRIPE-01` evidence already
proves the bounded PR 3 goal for current main: a hosted Stripe test-mode
Checkout activation moved the replay owner from inactive/no subscription to
active/subscription present, while ARGUS confirmed entitlement mutation remains
verified-webhook gated rather than inferred from a browser redirect.

This pass did not run a second hosted Checkout payment. The result is
reconciliation-only and keeps the existing caveat: the claim is bounded to
Stripe test-mode activation, not live-money billing, production billing
readiness, invoices/tax/Connect, marketplace payments, usage metering, or broad
billing UX polish.

## ARGUS Review Result

ARGUS accepts PR 3 as a reconciliation-only close candidate. Current code still
matches the accepted staging proof: subscription Checkout uses Stripe Billing,
entitlement mutation is verified-webhook gated, active unknown Price IDs and
customer/profile mismatches fail closed, and token-credit top-ups remain
separate payment-mode grants.

No new hosted Checkout payment was run in this pass. This recommendation closes
only the bounded Stripe test-mode paid activation proof; it does not claim
live-money billing, production billing readiness, invoices/tax/Connect,
marketplace payments, usage metering, token-credit top-up activation proof, or
broad billing UX polish.
