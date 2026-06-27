# Token Top-Up Test-Mode Proof Preflight - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-27
Status: open

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
