# PR460 - Billing and Quota Clarity Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR459 passed Continuity and Integrity comprehension:

`docs/roadmap/PR459_CONTINUITY_INTEGRITY_COMPREHENSION_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a hosted human-eye rehearsal. Use the product like a person trying to
understand plan status, quotas, usage, upgrade paths, and billing boundaries.

## Goal

Audit Billing and quota clarity on hosted Station and return one concrete next
lane.

Do not run checkout. Do not mutate subscriptions. Do not test Stripe cards in
this lane. The job is comprehension and safety of the visible billing/quota
surface.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR457 product commit `e3809f0a` or later for web/API before
judging product behavior. If Railway is still serving an older commit, return
`DEPLOYMENT_WAITING`.

## Route Set

Use the replay-owner account. Keep the run read-only.

Routes and stops:

1. Settings landing page and Billing card
2. Billing page
3. visible plan cards and current-plan state
4. upgrade buttons, only as visual/read-only targets
5. Studio dashboard quota/sidebar readback
6. persona Archive/files storage and quota panel
7. any visible usage/credits/top-up panel
8. signed-out billing or upgrade affordance, only if naturally reachable

Check desktop plus one narrow mobile viewport around 390px.

Do not open Stripe Checkout, customer portal, payment links, provider setup,
exports, imports, uploads, publishing, destructive actions, or private model
flows.

## Acceptance Gates

- Current plan, available plans, and current-plan disabled state are clear.
- Price/currency/month/year labels are readable and not misleading.
- Quotas and usage readbacks are understandable and consistent across Billing,
  Settings, Studio, and Archive where visible.
- Upgrade prompts do not obscure privacy, storage, usage, or capability limits.
- Billing copy does not claim capabilities that are not actually enabled.
- Buttons that look live either have a safe read-only interpretation or are
  clearly checkout/customer-portal actions that should not be clicked here.
- Empty or zero usage states explain what is absent without implying account
  breakage.
- Desktop and mobile layouts remain readable without horizontal overflow,
  clipped controls, overlapping labels, or hidden prices.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, payment secrets, or
  secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: Billing/quota clarity is good enough; recommend the
  next Discern-to-Tex priority by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete Billing/quota clarity defect
  should be fixed next.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.

If reporting a defect, include:

- route;
- viewport;
- action or state;
- expected behavior;
- actual behavior;
- smallest recommended DAEDALUS patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, payment secrets, private source bodies, prompts, completions,
provider keys, stack traces, or raw network payloads.

## ARIADNE Result

Completed:

`docs/roadmap/PR460_BILLING_QUOTA_CLARITY_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```
