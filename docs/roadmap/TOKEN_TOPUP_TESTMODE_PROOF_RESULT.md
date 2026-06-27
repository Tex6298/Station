# Token Top-Up Test-Mode Proof Result

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-06-27

Status: COMPLETE - WAKE MIMIR

## Verdict

```text
PASS - TOKEN TOPUP TESTMODE PROOF
```

ARIADNE completed the narrow hosted Stripe test-mode token top-up proof opened
by MIMIR and preflighted by ARGUS. The proof used the Basic/private
`basic-starter` path, completed exactly one payment-mode Checkout, and recorded
only Station selected-field readback.

## Scope Run

- Confirmed an eligible non-production Basic/private account through Station
  readback only.
- Opened hosted Settings.
- Started exactly one token top-up Checkout for `basic-starter`.
- Completed Stripe test-mode Checkout once.
- Returned to Settings after the top-up success redirect.
- Polled Station readback until purchase history and token totals reflected
  the completed top-up.

No subscription Checkout, Portal action, tier change, account setup, webhook
replay, SQL inspection, Stripe dashboard inspection, code change, config
change, schema change, package change, or hosted-log evidence was used.

## Selected Pack

| Field | Value |
| --- | --- |
| Pack id | `basic-starter` |
| Amount pence | `500` |
| Tokens purchased | `1500000` |

## Station Readback

| Field | Before | After |
| --- | --- | --- |
| Token tier | `private` | `private` |
| Token tier label | `Basic` | `Basic` |
| Tokens used | `0` | `0` |
| Tokens limit | `750000` | `750000` |
| Top-up tokens | `0` | `1500000` |
| Effective limit | `750000` | `2250000` |
| Available top-up ids | `basic-starter`, `basic-standard` | `basic-starter`, `basic-standard` |
| Latest safe purchase | none | `basic-starter`, `500`, `1500000`, `completed` |
| Billing tier | `private` | `private` |
| Subscription status | `inactive` | `inactive` |

## Pass Checks

| Check | Result |
| --- | --- |
| Latest purchase status is `completed` | Pass |
| Latest purchase pack matches `basic-starter` | Pass |
| Latest purchase amount matches `500` pence | Pass |
| Latest purchase tokens match `1500000` | Pass |
| `topupTokens` increased by exactly `1500000` | Pass |
| `effectiveLimit` increased by exactly `1500000` | Pass |
| Billing tier remained unchanged | Pass |
| Subscription status remained unchanged | Pass |

## Evidence Boundary

Recorded evidence is limited to Station selected-field readback and safe route
labels. This result does not record Stripe object ids, Checkout URLs, card
fixture details, receipt URLs, customer ids, subscription ids, event ids,
payment ids, raw endpoint bodies, raw webhook payloads, signatures, headers,
cookies, authorization values, local env values, raw user ids, SQL rows,
provider payloads, hosted logs, private documents, prompts, completions, or
screenshots containing browser/session material.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Stripe best-practices reference | Pass | One-time token top-ups remain on hosted Checkout Sessions in payment mode; no Charges API or architecture rewrite. |
| Account eligibility readback | Pass | Selected account read back as Basic/private with `basic-starter` available and no existing latest top-up purchase. |
| Hosted browser Checkout path | Pass | Settings top-up Buy flow completed one test-mode payment Checkout and returned to Settings. |
| Station top-up readback polling | Pass | Purchase history and token totals updated through `/token-credits/me`; no Stripe object evidence used. |
| Subscription separation readback | Pass | `/billing/me` tier and subscription status did not change. |
| `git diff --check` | Pass | Whitespace check passed with line-ending notices only. |
| `pnpm typecheck` | Not run | Docs-only result/status/baseline update; no imports or scripts changed. |

## Handoff

Wake MIMIR with `PASS - TOKEN TOPUP TESTMODE PROOF`.
