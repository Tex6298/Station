# Token Top-Up Test-Mode Proof Preflight - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-27
Status: complete - wake MIMIR

## Verdict

```text
ACCEPT PREFLIGHT - OPEN ARIADNE TOPUP PROOF
```

ARGUS accepts a narrow, test-mode hosted token top-up proof. The proof may use
Stripe Checkout Sessions in `mode: "payment"` for one current Station top-up
pack, then prove completion through Station readback only. This does not reopen
PR181 subscription activation, PR148 background-job readback, live-money
billing, production billing readiness, tax, invoices, coupons, Connect, deep
usage billing, dynamic payment-method readiness, or any Stripe architecture
rewrite.

## Required Proof Conditions

If MIMIR opens ARIADNE proof, the packet must use these conditions:

1. Use a dedicated non-production proof account.
2. Prefer Basic/private with `basic-starter`.
3. Creator with `creator-starter` is the only fallback.
4. Do not use Visitor, Canon, developer, institutional, unknown-tier,
   soft-cap, dirty replay-owner, or subscription-activation proof accounts.
5. Do not change an account tier as part of this proof. If no eligible proof
   account exists, stop and wake MIMIR for a setup decision.
6. Click exactly one token top-up Buy button for the accepted pack and complete
   Stripe test-mode Checkout once.
7. Record only selected before/after fields from `/token-credits/me` and
   `/billing/me`; never record raw response bodies.
8. Prove webhook completion through Station readback only:
   - latest purchase status is `completed`;
   - latest purchase pack/amount/tokens match the selected pack;
   - `topupTokens` and `effectiveLimit` increase by exactly the selected pack
     token amount;
   - `/billing/me.tier` and `/billing/me.subscriptionStatus` do not change.
9. Timeout or missing Station readback is a proof failure or rerun request, not
   authorization to inspect Stripe dashboard objects, hosted logs, SQL rows, or
   raw webhook payloads.

## ARGUS Review

| Check | Result | Notes |
| --- | --- | --- |
| Stripe/payment scope | Pass | Existing top-ups use Checkout Sessions with `mode: "payment"`; no Charges API, subscription Checkout, Portal, Connect, tax, invoice, coupon, or usage-billing expansion is needed for this proof. |
| Auth and account scope | Pass | `/token-credits` is protected by `requireAuth`; proof must use one dedicated non-production Basic/private account or Creator fallback and must not mutate dirty or soft-cap accounts. |
| Pack constraints | Pass | Basic/private exposes `basic-starter` and `basic-standard`; Creator exposes creator packs; Visitor, Canon, developer, institutional, and unknown tiers expose no standard top-up packs and are excluded. |
| Webhook trust | Pass | `POST /billing/webhook` uses raw-body Stripe signature verification before processing; top-ups grant only from payment-mode `checkout.session.completed` or `payment_intent.succeeded` metadata. |
| Subscription separation | Pass | Subscription activation remains on `/billing/checkout` with `mode: "subscription"` and subscription webhook paths; the proof must show `/billing/me` tier/status did not change. |
| Idempotency | Pass | `topup_purchases.stripe_payment_id` is unique and `grant_topup_purchase` uses conflict handling before adding top-up tokens or token transactions. |
| Selected evidence | Pass | `/token-credits/me` and `/billing/me` can supply the needed before/after values without recording raw Stripe objects, raw Station IDs, Checkout URLs, or raw endpoint bodies. |

## Allowed Evidence For ARIADNE

Record only:

- service/page labels such as Settings and Station route names;
- account tier label or tier enum;
- subscription status;
- selected pack id from `basic-starter` or `creator-starter`;
- pack amount pence;
- pack tokens purchased;
- tokens used;
- tokens limit;
- top-up tokens;
- effective limit;
- latest purchase status;
- pass/fail statement for whether subscription tier/status changed;
- validation command names and pass/fail results.

Do not record purchase row ids, Stripe object ids, customer ids, subscription
ids, card details, Checkout URLs, receipt URLs, redirect URLs, raw response
bodies, or screenshots containing browser/session material.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Source review | Pass | Reviewed token-credit route/service, billing webhook service/controller, app raw-body wiring, Stripe client setup, Settings token usage panel, migrations, and focused tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:token-credits` | Pass | 3 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:billing` | Pass | 15 tests passed. |
| `git diff 46b8553b^ 46b8553b --check` | Pass | DAEDALUS prep commit whitespace check passed. |
| `git diff d20a413b^ d20a413b --check` | Pass | MIMIR preflight-open commit whitespace check passed. |
| Added-line leak scans | Pass | DAEDALUS prep and MIMIR preflight-open docs had no matches for full URLs, Stripe object-id prefixes, Stripe key/webhook-secret prefixes, bearer/JWT-looking tokens, or UUID-like values. |

## Context

DAEDALUS completed the token top-up test-mode proof prep:
`docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREP_RESULT.md`.

DAEDALUS verdict:

```text
READY FOR ARGUS PREFLIGHT
```

MIMIR accepts the prep packet as the next correct lane. The hosted proof is not
authorized yet. ARGUS must decide whether the proposed proof can run safely as
a test-mode hosted mutation, or whether DAEDALUS must patch/rewrite something
first.

Closed-lane guard:

- PR148 owner background job status readback is already closed.
- PR181 subscription activation proof is already closed.
- This preflight is about token top-up payment-mode Checkout only.

## ARGUS Task

Review the DAEDALUS packet and current contract. Return one of:

```text
ACCEPT PREFLIGHT - OPEN ARIADNE TOPUP PROOF
REJECT PREFLIGHT - NEEDS DAEDALUS PATCH
REJECT PREFLIGHT - NEEDS MIMIR DECISION
WAIVE IMMEDIATE TOPUP PROOF
```

Check:

- Whether the proposed Basic/private `basic-starter` path is the right lowest
  risk path, and whether Creator `creator-starter` is an acceptable fallback.
- Whether Canon/developer/institutional/soft-cap accounts must be excluded
  because current code exposes no standard packs there.
- Whether the proof can rely on `/token-credits/me` and `/billing/me`
  selected-field readback without recording raw Stripe objects.
- Whether webhook completion can be proven by Station readback only:
  purchase-history status plus top-up/effective-limit increase.
- Whether subscription tier/status non-change is sufficient separation from
  PR181 subscription activation.
- Whether a dedicated proof account is required before hosted mutation.
- Whether any DAEDALUS code/config/schema/UI patch is required before proof.

## Proposed Proof Scope

If accepted, the proof runner may:

- sign in with the selected non-production proof account;
- open `/settings`;
- record selected before fields from `/token-credits/me` and `/billing/me`;
- click exactly one token top-up Buy button for the accepted pack;
- complete Stripe test-mode payment;
- return to `/settings?topup=success`;
- poll Station readback until purchase-history and token totals update or the
  proof times out;
- record selected after fields and pass/fail.

Selected allowed fields:

- account tier label or tier enum;
- subscription status;
- pack id from the allowlist;
- pack amount pence;
- pack tokens purchased;
- tokens used;
- tokens limit;
- top-up tokens;
- effective limit;
- latest purchase status;
- pass/fail statement for whether subscription tier/status changed.

## Forbidden Outputs

Do not authorize recording:

- Stripe secret keys, publishable keys, webhook secrets, API tokens, cookies,
  auth headers, bearer tokens, local env values, or replay credentials;
- Checkout URLs, Portal URLs, receipt URLs, redirect URLs with tokens, or raw
  hosted endpoint bodies;
- Stripe Session ids, PaymentIntent ids, customer ids, subscription ids, event
  ids, charge ids, invoice ids, payment method ids, or raw Dashboard objects;
- test card numbers or card fixture details;
- raw webhook payloads, signatures, request headers, stack traces, SQL rows,
  hosted logs, provider payloads, private documents, prompts, completions, raw
  user ids, or screenshots containing sensitive browser/session material.

## Boundaries

This is still a preflight. Do not run Checkout, replay webhooks, mutate hosted
data, change account tier, change code, change config, change schema, change
packages, or broaden into tax/invoice/coupon/Connect/deep usage billing.

If accepted, ARGUS should wake MIMIR with exact proof conditions for ARIADNE.
If rejected, ARGUS should wake MIMIR with the narrowest next action.
