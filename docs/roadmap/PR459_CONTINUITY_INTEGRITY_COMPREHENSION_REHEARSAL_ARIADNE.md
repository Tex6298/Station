# PR459 - Continuity and Integrity Comprehension Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR458 closed the hosted Writing mobile wrap defect:

`docs/roadmap/PR458_HOSTED_WRITING_FILTER_WRAP_CONFIRMATION_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a hosted human-eye rehearsal. Use the product like a person trying to
understand what Continuity and Integrity are for, how they differ, and what to
do next.

## Goal

Audit Continuity and Integrity comprehension on hosted Station and return one
concrete next lane.

This is not a backend lane and not a broad rewrite. The useful output is either
`PASS_WITH_NEXT_LANE` or one bounded DAEDALUS patch target.

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

1. `/studio`
2. Studio dashboard Integrity Sessions Due panel
3. replay persona Home
4. replay persona Continuity
5. replay persona Integrity
6. replay persona Memory, only to compare terminology
7. replay persona Archive/files, only to compare source/archive terminology
8. any Continuity review target links already visible on hosted

Check desktop plus one narrow mobile viewport around 390px.

Do not run integrity sessions, submit continuity changes, publish, export,
import, upload, run provider setup, run billing checkout, generate keys, or call
private model flows.

## Acceptance Gates

- Continuity reads as "what stays steady" and not as raw archive, Memory, or
  Canon duplication.
- Integrity reads as review/trust/calibration and not as an unrelated error
  state.
- The Studio dashboard entry point makes it clear why Integrity exists and what
  the user can do next.
- Persona tabs and route headers keep Continuity and Integrity distinguishable.
- Status counts, confidence labels, and review prompts are understandable
  without exposing private internals.
- Review links, if present, make their target surface clear before navigation.
- Empty or zero states explain what is absent and what the next safe action is.
- Desktop and mobile layouts remain readable without horizontal overflow,
  clipped controls, or overlapping labels.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, or secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: Continuity/Integrity comprehension is good enough;
  recommend the next Discern-to-Tex priority by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete comprehension or route-language
  defect should be fixed next.
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
