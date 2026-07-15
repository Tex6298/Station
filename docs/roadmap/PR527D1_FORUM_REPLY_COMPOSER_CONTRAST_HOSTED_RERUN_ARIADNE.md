# PR527D1 - Forum Reply Composer Contrast Hosted Rerun

Owner: MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Accepted implementation SHA:

```text
ae349fc9f71c533333751a68515572a45bcff72b
```

Status:

```text
REHEARSE_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_ON_HOSTED
```

## Purpose

Close the one hosted presentation defect retained from PR527D's completed
`18`-case rehearsal. The product question is now exact: does the deployed,
enabled, empty reply textarea meet the resting-boundary and placeholder
contrast gates in System, Light, and Dark at desktop and both accepted mobile
widths?

Accepted sources:

- `docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL_RESULT.md`

Targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

MIMIR independently confirmed both endpoints return `200`, `ok:true`,
`ready:true`, branch `main`, exact service names, and full accepted
implementation SHA `ae349fc9f71c533333751a68515572a45bcff72b` before opening
this packet. ARIADNE must reconfirm before and after the rerun.

## Human Rehearsal Posture

This is a bounded human-eye browser rerun against the deployed product bundle,
not an API-only or static-source check. Use the same safe pattern as the full
PR527D rehearsal: navigate normally through Forum to an existing readable,
non-private populated thread and sign in with the configured replay owner.

Do not submit a reply or activate Watch, vote, report, witness, moderation,
delete, or any other product command. Theme preference, ordinary auth/session
handling, focus, and temporary unsent textarea input are the only permitted
browser state changes. Do not retain an id, private content, owner identity,
credential, token, cookie, raw response body, or screenshot.

## Exact Hosted Matrix

Run all `9` signed-in cases:

| Appearance | Viewports |
| --- | --- |
| System | `1440x900`, `390x844`, `375x812` |
| Light | `1440x900`, `390x844`, `375x812` |
| Dark | `1440x900`, `390x844`, `375x812` |

Record System's resolved appearance honestly. Set explicit Light and Dark
through Station's shipped preference control and confirm each survives
refresh.

## Required Human And Measured Checks

For every case:

1. confirm the signed-in reply textarea is visible, enabled, empty, and the
   submit button remains disabled before input;
2. measure its resting edge against the surrounding card and require at least
   `3:1`;
3. measure placeholder text against the textarea surface and require at least
   `4.5:1` with opacity resolved honestly;
4. focus the textarea and confirm the indicator remains at least `3:1`, input
   text/caret remain readable, and focus does not shift geometry;
5. inspect the composer and immediate thread context with a human eye for
   coherent hierarchy, wrapping, hit area, disabled-state readability, and
   theme fit; and
6. require zero horizontal overflow, clipping, overlap, page errors,
   unclassified console errors, and non-auth product writes.

The previous full hosted rehearsal already accepted the rest of the thread
surface. Do not repeat or widen that matrix. The `1 reply` summary versus two
rendered replies caveat remains separate and is not part of this rerun.

Record only sanitized minima, counts, booleans, route shapes, appearance
names, viewports, and accepted SHA. Delete any temporary harness and captures
before commit.

## Repo Allow-List

ARIADNE may commit only:

```text
docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_HOSTED_RERUN_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARIADNE.json
```

No product code, CSS, test, API, migration, package, lockfile, config, seed,
fixture, persistent harness, or screenshot change is authorized. Report a
deployed defect; do not patch it inside this rehearsal lane.

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_HOSTED_RERUN_RESULT.md
```

Return exactly one verdict:

```text
PASS_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_HOSTED_RERUN
FAIL_PR527D1_<EXACT_DEPLOYMENT_CONTRAST_LAYOUT_OR_STATE_DEFECT>
BLOCK_PR527D1_<EXACT_SAFE_FIXTURE_OR_HOSTED_DEPENDENCY>
```

Record exact deployment identity before/after, all nine cases, contrast
minima, focus/geometry/disabled-state observations, overflow/error/mutation
counts, and scope checks. Commit the result and wake MIMIR. Do not go idle
without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the exact-SHA PR527D1 hosted composer contrast rerun.
Verdict:
- <exact pass, fail, or blocker>
Task:
- Close PR527D if accepted, or route the smallest exact repair/blocker lane; retain reply-count truth as separate triage.
```
