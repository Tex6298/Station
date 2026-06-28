# PR455 - Empty, Loading, and Error State Clarity Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR454 passed mobile Studio wayfinding and recommended this lane:

`docs/roadmap/PR454_MOBILE_STUDIO_WAYFINDING_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a human-eye rehearsal. The goal is to experience Station like a user who
is waiting, empty-handed, blocked, or recovering from an error.

## Goal

Audit high-traffic empty, loading, and error states on hosted Station and return
one concrete next lane.

Do not rewrite copy broadly. Do not ask the human to test this manually. Use the
human routes and browser tools to decide whether the current product states are
clear enough or need DAEDALUS.

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

Use the replay-owner account where authenticated state is needed. Also sample
signed-out states where the route naturally supports them.

Primary routes:

1. `/`
2. `/discover`
3. public Space route from Discover
4. public document route from that Space, if visible
5. linked forum discussion route, if visible
6. `/studio`
7. replay persona Home
8. replay persona Memory
9. replay persona Continuity
10. replay persona Archive/files
11. replay persona Integrity
12. Developer Spaces list
13. replay Developer Space public observatory
14. replay Developer Space manage route
15. Settings
16. Billing

Use desktop plus one narrow mobile viewport around 390px.

Read-only rule: do not submit archive imports, uploads, exports, publishing,
provider setup, billing checkout, key generation, destructive actions, or
private model calls. You may click harmless tabs, filters, search fields, and
navigation controls to confirm whether they visibly change state.

## Acceptance Gates

- Empty states explain what is absent and what the user can do next.
- Loading states do not look like broken cards or permanent blanks.
- Error states tell the user what failed without exposing internals.
- Placeholder or preview-only controls are disabled, labelled, hidden, or
  visibly non-final.
- Controls that look live either navigate, change state, or show clear feedback.
- The UI does not imply missing backend capability is live.
- Privacy, owner-only, public, and visibility boundaries remain explicit.
- The route gives a human a clear recovery path back to the main workflow.
- Desktop and mobile layouts avoid horizontal overflow, clipped labels, or
  unreadable controls.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, or secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: the checked states are good enough; recommend the next
  Discern-to-Tex priority by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete empty/loading/error state defect
  should be fixed next.
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

## Result

ARIADNE completed this hosted rehearsal:

`docs/roadmap/PR455_EMPTY_LOADING_ERROR_CLARITY_REHEARSAL_RESULT.md`

Verdict:

```text
PASS_WITH_NEXT_LANE
```

Recommended next lane:

```text
PR456 - Top-nav and mobile overflow sweep
```
