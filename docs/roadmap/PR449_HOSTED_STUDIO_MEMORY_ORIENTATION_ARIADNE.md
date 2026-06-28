# PR449 - Hosted Studio Memory Orientation Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR448 added Studio dashboard Memory orientation and status readback:

`docs/roadmap/PR448_STUDIO_DASHBOARD_MEMORY_ORIENTATION_CLOSEOUT.md`

Hosted visual confirmation remains the follow-up.

## Goal

Verify that the live hosted Studio dashboard now presents Memory as a
first-class owner-only product stop before the user enters a persona workspace.

This is a narrow hosted rehearsal, not a dashboard redesign pass.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR448 product commit `4a1234c5` or later for web/API
before judging product behavior. If Railway is still serving an older commit,
return `DEPLOYMENT_WAITING`.

## Route Set

Use the replay-owner account and keep the run read-only:

1. `/studio`
2. Studio dashboard Memory panel/link/status
3. Routed persona Memory workspace

Optional, only if cheap and visible:

- confirm Archive, Continuity, Integrity, and Personas remain legible on the
  dashboard after the Memory panel appears.

Do not submit provider setup, billing, archive import, export generation,
publish, key generation, or destructive actions.

## Acceptance Gates

- `/studio` shows Memory as a distinct top-level dashboard stop for the
  signed-in owner.
- Memory status/readback is useful and not generic usage analytics.
- The Memory stop routes into the replay persona Memory workspace.
- The panel does not expose private memory item bodies on the top-level
  dashboard.
- Memory remains visually and semantically distinct from Archive, Continuity,
  Canon, and Integrity.
- Signed-out users do not see the owner Memory dashboard panel.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted Memory orientation behaves as intended.
- `DEPLOYMENT_WAITING`: hosted runtime is stale and should be checked again.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: hosted current runtime shows a concrete
  Memory dashboard defect.

Include route, action, expected behavior, actual behavior, and non-secret
evidence. Do not commit screenshots, cookies, session values, raw owner ids,
raw persona ids, private memory bodies, prompts, completions, provider keys, or
raw network payloads.

## Result

ARIADNE completed this hosted rehearsal:

`docs/roadmap/PR449_HOSTED_STUDIO_MEMORY_ORIENTATION_RESULT.md`

Verdict:

```text
PASS
```
