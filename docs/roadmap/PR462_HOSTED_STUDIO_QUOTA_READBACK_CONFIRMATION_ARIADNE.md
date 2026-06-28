# PR462 - Hosted Studio Quota Readback Confirmation

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR461 accepted code patch:

`docs/roadmap/PR461_STUDIO_DASHBOARD_QUOTA_READBACK_DEFAKE_CLOSEOUT.md`

ARGUS review:

`docs/roadmap/PR461_STUDIO_DASHBOARD_QUOTA_READBACK_DEFAKE_REVIEW_RESULT.md`

Original hosted defect:

`docs/roadmap/PR460_BILLING_QUOTA_CLARITY_REHEARSAL_RESULT.md`

## Goal

Verify on hosted Station that the Studio dashboard no longer shows synthetic
quota-like usage math and instead routes owners to authoritative usage surfaces.

This is a narrow hosted browser confirmation, not a new billing or dashboard
redesign lane.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The hosted web runtime should be at commit `187996cd` or later before judging
the fix. If Railway is still serving an older web commit, return
`DEPLOYMENT_WAITING`.

Record API health if cheap, but the visual gate is the web surface.

## Route Set

Use the replay-owner account. Keep the run read-only.

Routes and stops:

1. `/studio` desktop
2. `/studio` around 390px mobile
3. Billing route from the Studio replacement card
4. Settings route from the Studio replacement card
5. Archive route from the Studio replacement card

Do not open Stripe Checkout, customer portal, payment links, provider setup,
exports, imports, uploads, publishing, destructive actions, or private model
flows.

## Acceptance Gates

- `/studio` no longer shows `Tier allocation`.
- `/studio` no longer shows invented monthly quota or usage counters in that
  former panel.
- The replacement panel routes to Billing for plan/subscription limits.
- The replacement panel routes to Settings for token-credit and storage usage
  readbacks.
- The replacement panel routes to Archive as an owner-wide archive source
  surface, not as the storage meter.
- The dashboard does not compute or display new quota percentages, byte usage,
  token balances, or entitlement state locally.
- Desktop and 390px mobile layouts remain readable without horizontal overflow,
  clipped controls, or overlapping labels.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, payment secrets, or
  secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted Studio quota readback de-fake is visually confirmed.
- `DEPLOYMENT_WAITING`: hosted web runtime is stale.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: hosted current runtime still shows synthetic
  quota math or introduces a concrete regression.

If reporting a defect, include:

- route;
- viewport;
- expected behavior;
- actual behavior;
- smallest DAEDALUS retry target.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, payment secrets, private source bodies, prompts, completions,
provider keys, stack traces, or raw network payloads.

## ARIADNE Result

Completed:

`docs/roadmap/PR462_HOSTED_STUDIO_QUOTA_READBACK_CONFIRMATION_RESULT.md`

Verdict:

```text
PASS
```
