# PR527C - Forum Watch Hosted Rehearsal

Owner: MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Accepted review SHA:

```text
f50a15fe15c08f960f7980f692bf68a2a6557780
```

Status:

```text
REHEARSE_PR527C_FORUM_WATCH_ON_HOSTED
```

## Purpose

Perform the final human-eye, exact-SHA hosted rehearsal for the repaired Forum
Watch journey. This run may make only the reversible current-owner watch-row
changes required to prove Watch, refresh, duplicate Watch, Unwatch, repeated
Unwatch, and exact restoration of the initial state.

Accepted source:

- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_REPAIR_ARGUS_RESULT.md`

Targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

MIMIR independently confirmed both deployment endpoints ready on the exact
accepted SHA before opening this packet. ARIADNE must reconfirm before and
after the rehearsal.

## Human Rehearsal Posture

This is a real user journey viewed through the browser, not only an API smoke.
Use one already-readable, non-private thread and the existing configured safe
accounts/fixtures. Do not ask Marty for credentials already present locally.
Do not create an account, thread, comment, notification, or hidden fixture to
make the run convenient.

Committed evidence may name routes, accessible labels, booleans, counts,
status codes, viewports, and the accepted SHA. It must not include account or
thread ids, cookies, tokens, credentials, row bodies, private text, SQL/schema
payloads, connection details, or screenshots containing private material.

## Locked Sequence

### 1. Freshness And Baseline

1. Confirm web and API are `ready:true`, branch `main`, service names exact,
   and full SHA equals `f50a15fe15c08f960f7980f692bf68a2a6557780`.
2. Reconfirm migration `040` has exactly one honest ledger row and the watch
   and notification tables retain the accepted schema/RLS/policy shape.
3. Select one already-readable, non-private thread without recording its id.
4. Capture the replay owner's initial watch boolean, current owner/thread row
   count (`0` or `1`), total sanitized watch count, and notification count.
5. If any baseline is ambiguous, stop before mutation and return the exact
   blocker. Never guess the restoration target.

### 2. Auth And Readability Boundaries

Prove without product mutation:

- signed-out watch GET is `401`, and the human UI offers sign-in rather than a
  Watch/Unwatch mutation command;
- an existing below-tier safe account receives `403` for PUT and DELETE;
- an existing unreadable-thread fixture returns `404` for GET, PUT, and DELETE
  without disclosing its content or existence in evidence;
- the replay owner receives a bounded boolean GET for the selected readable
  thread.

If an existing below-tier or unreadable fixture is unavailable, record only
that exact fixture blocker after completing every non-mutating and replay-owner
check that remains safe. Do not invent data or turn a missing fixture into a
pass.

### 3. Reversible Watch Lifecycle

Against the selected readable thread:

1. PUT Watch once; require `200`, `isWatching:true`, and one logical current-
   owner/thread row.
2. GET and browser refresh must both read back `Watching replies` with
   `Unwatch thread` available.
3. PUT Watch again; require `200/true` and still exactly one logical current-
   owner/thread row.
4. DELETE once; require `200`, `isWatching:false`, and current-owner readback
   false.
5. Browser refresh must show `Not watching` with `Watch thread` available.
6. DELETE again; require idempotent `200/false`, no current-owner row, and no
   cross-owner row change.
7. Restore the exact initial state: PUT and re-read if the baseline was true;
   otherwise leave false and re-read.
8. Prove the final owner/thread row count, total watch count, and notification
   count equal their exact initial values.

At every step, reject a malformed or outcome-inconsistent response. Do not
retry or reverse a write until a fresh GET has established the true server
state.

### 4. Human-Eye State Review

Review the hosted thread detail at `1440x900`, `390x844`, and `375x812`.

Required visible truth:

- delayed initial GET shows `Loading watch state...`, with no watch claim or
  mutation command;
- ready false shows only `Not watching` plus `Watch thread`;
- ready true shows only `Watching replies` plus `Unwatch thread`;
- an in-flight write shows `Saving watch state...`, with no mutation command
  or current-state claim;
- a synthetically intercepted failed or malformed GET shows the exact bounded
  unavailable copy and `Retry watch state`, which sends GET only;
- a synthetically intercepted ambiguous PUT/DELETE shows `Watch change
  unconfirmed`, no Watch/Unwatch command, and GET-only reconciliation;
- keyboard focus, accessible names, pending-state stability, clipping,
  overlap, horizontal overflow, page errors, and unclassified console errors
  all pass.

Synthetic interception is permitted only for visual failure/reconciliation
states. Actual lifecycle and restoration claims must use the hosted API and
authoritative readback.

The near-black Forum body/thread presentation remains a known PR527D defect.
Record that it remains open, but do not patch, reclassify, or claim it fixed in
this rehearsal.

## Mutation Boundary

Only the selected replay owner's reversible `community_thread_watches` row may
change. No notification, thread, comment, vote, witness, report, moderation,
profile, billing, publication, Space, document, provider, queue, storage, or
other product row may change.

Do not change code, schema, migration history, Railway/Supabase configuration,
packages, lockfiles, credentials, or fixture data. Temporary local browser
evidence must be removed before commit.

## Result

Create:

```text
docs/roadmap/PR527C_FORUM_WATCH_HOSTED_REHEARSAL_ARIADNE_RESULT.md
```

Return exactly one verdict:

```text
PASS_PR527C_FORUM_WATCH_HOSTED_REHEARSAL
BLOCK_PR527C_<EXACT_DEPLOYMENT_AUTH_FIXTURE_PRODUCT_RESTORATION_OR_EVIDENCE_BLOCKER>
```

The result must state the initial and final watch booleans/counts in sanitized
form, every mutation status/readback, all three human-eye viewports, exact SHA
before/after, unrelated-domain zero-change evidence, and whether cleanup is
complete.

Commit the result and wake MIMIR. Do not wake DAEDALUS, broaden into PR527D,
or go idle without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the exact-SHA PR527C hosted Forum Watch rehearsal.
Verdict:
- <pass or exact blocker>
Restoration:
- <initial and final sanitized state agree, or exact blocker>
Task:
- Close or route PR527C from the hosted verdict.
- Keep the wider PR527 correction programme moving to PR527D.
```
