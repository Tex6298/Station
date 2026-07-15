# PR527D - Forum Thread Semantic Theme Repair Hosted Rehearsal

Owner: MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Accepted review SHA:

```text
f7bc2785b19f0ff3d040210c0b1842a2525ff00f
```

Status:

```text
REHEARSE_PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_ON_HOSTED
```

## Purpose

Perform the final human-eye hosted acceptance run for PR527D. The product
question is narrow: can a real populated Forum thread and reply now be read and
operated coherently in System, Light, and Dark at desktop and both accepted
mobile widths without changing any Forum behavior?

Accepted source:

- `docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_ARGUS_RESULT.md`

Targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

MIMIR independently confirmed both endpoints `200`, `ready:true`, branch
`main`, exact service names, and the full accepted review SHA before opening
this packet. ARIADNE must reconfirm before and after the rehearsal.

## Human Rehearsal Posture

This is a human-eye browser run against the deployed product bundle, not an
API-only or static-source check. Select an existing readable, non-private
thread with at least one real reply through normal Forum navigation. Do not
record its id, private content, raw response body, owner identity, or any
credential/token/cookie.

Use normal signed-out browsing and the configured replay-owner sign-in. Do not
create, edit, delete, vote, report, Watch/Unwatch, witness, moderate, reply, or
otherwise mutate product data. Theme preference and ordinary auth/session
handling are the only permitted browser state changes.

## Exact Hosted Matrix

Run all `18` cases:

| Session | Appearance | Viewports |
| --- | --- | --- |
| Signed out | System | `1440x900`, `390x844`, `375x812` |
| Signed out | Light | `1440x900`, `390x844`, `375x812` |
| Signed out | Dark | `1440x900`, `390x844`, `375x812` |
| Replay owner | System | `1440x900`, `390x844`, `375x812` |
| Replay owner | Light | `1440x900`, `390x844`, `375x812` |
| Replay owner | Dark | `1440x900`, `390x844`, `375x812` |

For System, record the resolved appearance honestly. Set explicit Light and
Dark through the shipped preference control and verify each survives refresh
without leaking between signed-out and signed-in contexts.

## Required Human Checks

For every applicable case, inspect the whole thread rather than only the
first viewport:

1. breadcrumb, thread labels/title, author/date, full post body, participation
   row, reply count, and source-document link where present;
2. every existing reply's author/date, body, participation state, and utility
   controls;
3. signed-out sign-in boundary and signed-in reply composer;
4. Watch, witness, vote/report, moderation, own-contribution, locked, empty,
   and feedback surfaces only where the selected fixture naturally exposes
   them; do not manufacture a state with a write;
5. keyboard focus on representative breadcrumb, utility, Watch, and composer
   controls without activating them;
6. hover, selected/pressed readback, and disabled readability where the live
   state naturally exposes them; and
7. long content wrapping, vertical reading order, control hit areas, and
   mobile navigation back out to the category and Forum index.

Do not fail the lane because a fixture does not naturally expose moderation,
locked, or selected-witness state. ARGUS already accepted those intercepted
local states. Hosted acceptance must prove the real available states and must
not mutate production-like data to create presentation variety.

## Measured Gates

Capture computed foreground/background/border values without storing visible
private text. Require:

- post/reply title, body, metadata, breadcrumb, status, and link normal-text
  contrast at least `4.5:1`;
- meaningful control/state boundaries and focus indicators at least `3:1`;
- selected/strong/disabled states retain readable text on hover;
- document/source link specificity resolves to the accepted success treatment;
- no theme-incoherent fixed-white/fixed-black card, control, or text island;
- no horizontal overflow, clipping, overlap, content occlusion, or text
  escaping its control at any viewport;
- zero page errors and zero unclassified console errors; and
- zero non-auth `POST`, `PUT`, `PATCH`, or `DELETE` requests.

Record only sanitized minima, counts, booleans, route shapes, appearance names,
viewports, and accepted SHA. Temporary screenshots may be inspected locally
but must be deleted before commit and must not be committed or described with
private content.

## Regression Boundaries

Confirm without mutation that:

- PR527C Watch loading/ready/error truth remains present and commands are
  permission-gated;
- thread/reply data and linked document navigation still load normally;
- signed-out users do not receive owner-only controls;
- theme changes do not alter route, auth, API, or community semantics; and
- Forum index/category presentation, Studio, Discover, and unrelated routes
  were not reskinned by the scoped thread-detail CSS.

## Repo Allow-List

ARIADNE may commit only:

```text
docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARIADNE.json
```

No product code, CSS, test, API, migration, package, lockfile, config, seed,
fixture, persistent harness, or screenshot change is authorized. A deployed
product defect must be reported, not patched inside the rehearsal lane.

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL_RESULT.md
```

Return exactly one verdict:

```text
PASS_PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL
FAIL_PR527D_<EXACT_DEPLOYMENT_CONTRAST_LAYOUT_STATE_OR_REGRESSION_DEFECT>
BLOCK_PR527D_<EXACT_SAFE_FIXTURE_OR_HOSTED_DEPENDENCY>
```

Record exact deployment identity before/after, all 18 matrix cases, measured
minima, available-state coverage, overflow/error/mutation counts, scope check,
and any honest fixture caveat. Commit the result and wake MIMIR. Do not go idle
without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the exact-SHA PR527D hosted human rehearsal.
Verdict:
- <exact pass, fail, or blocker>
Task:
- Close PR527D if accepted, or route the smallest exact repair/blocker lane.
```
