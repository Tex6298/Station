# PR466 - Hosted Post-UI Import Regression Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

## Source

PR465 closes the Discern-to-Tex UI import priority sequence:

`docs/roadmap/PR465_DISCERN_TO_TEX_UI_IMPORT_CLOSEOUT_NEXT_LANE.md`

This is the final hosted regression rehearsal for that sequence.

## Goal

Run a short hosted human-eye regression pass across the owner and public
protected-alpha path to prove the accepted UI/product slices still work together.

This is read-only. Do not open a broad new UI, backend, Redis, Cloudflare,
provider, worker, Stripe, or Developer Agent expansion lane from habit. Report a
concrete defect only if hosted behavior proves one.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR461 product/review commit `187996cd` or later for web/API
before judging product behavior. If Railway is still serving an older commit,
return `DEPLOYMENT_WAITING`.

## Route Set

Use signed-out and replay-owner signed-in states. Keep the run read-only.

Public route chain:

1. `/`
2. `/discover`
3. public Space route
4. public document route
5. linked discussion route if visible
6. `/writing`
7. `/forums`
8. public Developer Space observatory

Owner route chain:

1. `/studio`
2. Studio dashboard authoritative usage panel
3. replay persona Home
4. replay persona Memory
5. replay persona Continuity
6. replay persona Archive/files
7. replay persona Integrity
8. Billing
9. Settings
10. Station Assistant
11. Onboarding

Check desktop plus one narrow mobile viewport around 390px.

Do not create accounts, submit credentials, create personas, start chats, run
imports, publish, upload, export, run provider setup, open billing checkout,
vote/report/post, mutate Developer Agent actions, or call private model flows.

## Acceptance Gates

- Public Discover to Space/document/discussion remains understandable.
- `/writing` type filters still wrap on mobile and do not overflow.
- Studio dashboard still avoids synthetic `Tier allocation` and local quota
  counters.
- Studio dashboard routes to Billing, Settings, and Archive source surfaces.
- Memory, Continuity, Archive, and Integrity remain distinguishable.
- Billing/quota copy remains clear and does not run checkout.
- Onboarding and Station Assistant remain clear and bounded.
- Public Developer Space remains public observatory, not owner manage.
- Desktop and mobile layouts remain readable without horizontal overflow,
  clipped controls, overlapping labels, or hidden primary actions.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, payment secrets, or
  secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted post-UI import regression is clean.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete regression should be fixed next.

If reporting a defect, include:

- route;
- viewport;
- action or state;
- expected behavior;
- actual behavior;
- smallest recommended DAEDALUS patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, private source bodies, prompts, completions, provider keys,
stack traces, or raw network payloads.

## ARIADNE Result

Completed on 2026-06-29:

`docs/roadmap/PR466_HOSTED_POST_UI_IMPORT_REGRESSION_REHEARSAL_RESULT.md`

Verdict:

```text
PASS
```
