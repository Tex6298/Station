# Token Top-Up Test-Mode Proof Rerun - ARIADNE

Opened by: MIMIR / A1
Owner: ARIADNE / A4
Date: 2026-06-27
Status: open

## Context

ARIADNE's first hosted token top-up proof passed functionally, but ARGUS could
not accept it because the result did not evidence the dedicated proof-account
requirement. ARIADNE's addendum could not confirm dedication from existing
notes:

- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RESULT.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_FINAL_REVIEW_ARGUS.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_ACCOUNT_ADDENDUM_RESULT.md`

MIMIR decision:

- Do not waive the dedicated-account requirement.
- Rerun with an explicitly dedicated eligible proof account.

## Account Setup Decision

ARIADNE may use a fresh dedicated non-production proof account if it can be
created or selected through ordinary Station hosted UI/auth flow without admin
mutation, SQL, service-role calls, tier edits, or credential disclosure.

The account must be:

- dedicated to this token top-up rerun;
- non-production;
- Basic/private by normal account defaults/readback;
- not the prior top-up proof account;
- not the dirty replay owner;
- not a soft-cap, Canon, developer, institutional, unknown-tier, Visitor, or
  subscription-activation proof account.

If ARIADNE cannot obtain such an account cleanly, stop and wake MIMIR with:

```text
BLOCKED - NEEDS DEDICATED PROOF ACCOUNT
```

Do not ask the user for credentials from inside the proof. Do not change an
account tier to make the proof fit.

## Rerun Steps

1. Confirm the account is dedicated and eligible by selected Station readback
   and proof notes only.
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
5. Click exactly one token top-up Buy button for `basic-starter`.
6. Complete Stripe test-mode Checkout exactly once.
7. Return to `/settings?topup=success`.
8. Poll Station readback only until the new purchase appears or proof timeout.
9. Record selected after fields:
   - tier;
   - tokens used;
   - tokens limit;
   - top-up tokens;
   - effective limit;
   - latest purchase pack id;
   - latest purchase amount pence;
   - latest purchase tokens purchased;
   - latest purchase status;
   - billing tier;
   - subscription status.

Pass only if:

- the account is explicitly dedicated to this rerun;
- latest purchase status is `completed`;
- latest purchase pack/amount/tokens match `basic-starter`;
- top-up tokens and effective limit increase by exactly `1500000`;
- billing tier and subscription status do not change.

## Forbidden Evidence

Do not record:

- account email, raw user id, database id, Stripe id, checkout URL, receipt URL,
  redirect URL with tokens, card detail, cookie, auth value, screenshot, raw
  endpoint body, SQL row, hosted log, provider payload, webhook payload,
  signature, header, secret, or local env value.

## Result File

Produce:

- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_RESULT.md`

Use one verdict:

```text
PASS - TOKEN TOPUP DEDICATED ACCOUNT RERUN
FAIL - TOKEN TOPUP DEDICATED ACCOUNT RERUN
BLOCKED - NEEDS DEDICATED PROOF ACCOUNT
STOPPED - FORBIDDEN EVIDENCE
RERUN REQUESTED - WEBHOOK DELAY
```

Wake MIMIR with the verdict.

## Boundaries

Do not use admin consoles, service-role operations, SQL, Stripe dashboard
objects, hosted logs, raw endpoint bodies, subscription Checkout, Portal,
account tier edits, code changes, config changes, schema changes, package
changes, tax/invoice/coupon/Connect work, deep usage billing, dynamic payment
methods, or Stripe architecture work.
