# PR456 - Top-Nav and Mobile Overflow Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR455 passed empty/loading/error state clarity and recommended this lane:

`docs/roadmap/PR455_EMPTY_LOADING_ERROR_CLARITY_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a hosted human rehearsal for navigation and layout fit. The goal is to
catch mobile overflow or route-label ambiguity before it becomes a DAEDALUS
patch lane.

## Goal

Audit global top navigation, key route headers, account/menu affordances, and
mobile overflow behavior across Station's public and signed-in surfaces.

Return one concrete next lane. If the current hosted product is good enough,
advance the Discern-to-Tex sequence. If a concrete overflow or wayfinding defect
appears, route it to DAEDALUS.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR452 review/product commit `60d53367` or later for web
and API before judging product behavior. If Railway is still serving an older
commit, return `DEPLOYMENT_WAITING`.

## Route Set

Sample signed-out and replay-owner signed-in states where relevant.

Viewport set:

```text
desktop
430px
390px
375px
320px if the page still claims mobile support at that width
```

Routes:

1. `/`
2. `/discover`
3. public Space route from Discover
4. public document route from that Space
5. linked forum discussion route, if visible
6. `/forums`
7. `/writing`
8. `/studio`
9. replay persona Home
10. replay persona Memory
11. replay persona Continuity
12. replay persona Archive/files
13. replay persona Integrity
14. `/developer-spaces`
15. replay Developer Space public observatory
16. replay Developer Space manage route
17. Settings
18. Billing

Read-only rule: do not submit archive imports, uploads, exports, publishing,
provider setup, billing checkout, key generation, destructive actions, or
private model calls. You may open menus, tabs, filters, and route links to check
fit and active state.

## Acceptance Gates

- The global top nav does not clip, overlap, or create horizontal overflow.
- Signed-in and signed-out nav affordances fit at mobile widths.
- Active route labels match the route being shown.
- Account/menu controls remain reachable without covering primary content.
- Route headers, tabs, pill controls, and action rows wrap or collapse cleanly.
- Public route chains stay understandable from Discover to Space, document, and
  discussion.
- Studio/persona route chains keep private owner context clear.
- Developer Space public/manage routes keep public/private boundaries clear.
- Desktop and mobile layouts avoid clipped labels, unreadable buttons, offscreen
  controls, and broken sticky headers.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, or secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: top-nav/mobile overflow is good enough; recommend the
  next Discern-to-Tex priority by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete nav/overflow defect should be
  fixed next.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.

If reporting a defect, include:

- route;
- viewport;
- action or state;
- expected behavior;
- actual behavior;
- smallest recommended DAEDALUS patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, raw persona
ids, private source bodies, prompts, completions, provider keys, stack traces,
or raw network payloads.

## ARIADNE Result

Completed:

`docs/roadmap/PR456_TOP_NAV_MOBILE_OVERFLOW_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```
