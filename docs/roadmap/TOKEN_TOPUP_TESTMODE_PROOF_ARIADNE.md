# Token Top-Up Test-Mode Proof - ARIADNE

Opened by: MIMIR / A1
Owner: ARIADNE / A4
Date: 2026-06-27
Status: open

## Context

ARGUS accepted the token top-up test-mode proof preflight:
`docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREFLIGHT_ARGUS.md`.

ARGUS verdict:

```text
ACCEPT PREFLIGHT - OPEN ARIADNE TOPUP PROOF
```

This is the first authorized hosted mutation in the token top-up lane. It is
still narrow: one Stripe test-mode payment Checkout for one accepted Station
token top-up pack, proven through Station readback only.

## Required Proof Account

Use a dedicated non-production proof account.

Allowed:

- Basic/private account with `basic-starter`.
- Creator account with `creator-starter` only if no Basic/private proof account
  is available.

Forbidden:

- Visitor accounts.
- Canon, developer, institutional, unknown-tier, or soft-cap accounts.
- Dirty replay-owner accounts.
- Subscription-activation proof accounts.
- Any account that requires changing tier as part of this proof.

If no eligible proof account is available, stop and wake MIMIR with:

```text
BLOCKED - NEEDS PROOF ACCOUNT
```

Do not ask the user for credentials from inside the proof. Do not change a
user tier to make the proof fit.

## Proof Steps

1. Confirm the account is eligible by selected Station readback only.
2. Open hosted Station Settings.
3. Record selected before fields from `/token-credits/me` or equivalent visible
   Settings readback:
   - tier;
   - tokens used;
   - tokens limit;
   - top-up tokens;
   - effective limit;
   - available top-up pack ids;
   - latest purchase status if present.
4. Record selected before fields from `/billing/me` or equivalent visible
   billing readback:
   - tier;
   - subscription status.
5. Click exactly one token top-up Buy button:
   - `basic-starter` for Basic/private;
   - `creator-starter` for Creator fallback.
6. Complete Stripe test-mode Checkout exactly once.
7. Do not record card details, Checkout URL, Stripe object ids, raw response
   bodies, dashboard payloads, screenshots containing session material, or
   secrets.
8. Return to `/settings?topup=success`.
9. Poll Station readback only until the new purchase appears or proof timeout.
10. Record selected after fields:
    - tier;
    - tokens used;
    - tokens limit;
    - top-up tokens;
    - effective limit;
    - latest purchase pack id;
    - latest purchase amount pence;
    - latest purchase tokens purchased;
    - latest purchase status.
11. Record selected after billing fields:
    - tier;
    - subscription status.
12. Pass only if:
    - latest purchase status is `completed`;
    - latest purchase pack/amount/tokens match the selected pack;
    - top-up tokens and effective limit increase by exactly the selected pack
      token amount;
    - billing tier and subscription status do not change.

## Allowed Evidence

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

## Forbidden Evidence

Do not record:

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

## Result File

Produce:

- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RESULT.md`

Use one verdict:

```text
PASS - TOKEN TOPUP TESTMODE PROOF
FAIL - TOKEN TOPUP READBACK
BLOCKED - NEEDS PROOF ACCOUNT
STOPPED - FORBIDDEN EVIDENCE
RERUN REQUESTED - WEBHOOK DELAY
```

Wake MIMIR with the verdict.

## Boundaries

Do not:

- run subscription Checkout, Portal, or plan-card actions;
- prove PR181 again;
- inspect Stripe dashboard objects as evidence;
- inspect SQL rows as evidence;
- replay webhooks manually;
- run more than one top-up Checkout;
- change code, config, schema, package, account tier, tax/invoice/coupon/
  Connect/deep usage billing, dynamic payment methods, or Stripe architecture.
