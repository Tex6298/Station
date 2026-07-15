# PR527D2C - Forum Reply Count Hosted Human Readback

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - final read-only human-eye readback

## Purpose

Migration `083` and its hosted proof are accepted as:

```text
ACCEPT_PR527D2B_HOSTED_MIGRATION_AND_PROOF_WITH_DISCOVER_SEARCH_COUNT_CAVEAT
```

The original human-visible defect was a thread summary that said one reply
while two replies rendered. Run one small human rehearsal to prove the
corrected database truth reaches the existing public UI. This is a readback,
not another lifecycle, migration, API-contract, theme, or feature lane.

## Deployment Gate

Before the browser run, confirm Railway web and API are `200`, ready, on
`main`, and report the same full SHA. The accepted hosted runtime is:

```text
da105cf077b224abfa2a3e48e0cc00b52bd34455
```

A later docs-only descendant is acceptable only when the accepted runtime and
migration paths have zero drift. Stop and wake MIMIR on runtime drift or an
incoherent rolling deployment.

## Human Rehearsal

Use the real hosted Station UI and the existing public replay content. Follow
the route as a person would; do not substitute database or raw-API output for
the visible checks.

Run at desktop `1440x900` and mobile `390x844` in the current System theme:

1. Start at `/`, enter Discover through the visible navigation, and locate the
   existing public replay document and its linked discussion without using a
   copied internal id.
2. Open the public document. Confirm its discussion affordance visibly reports
   `2` replies and leads to the linked Forum thread.
3. On the Forum thread, confirm the summary visibly reports `2 replies` and
   exactly two active, non-hidden reply cards render.
4. Navigate back through the human Forum category route and confirm that same
   thread card visibly reports `2` replies.
5. Use Discover rising/feed navigation and confirm the same thread reports `2`
   replies where the existing feed contract exposes the count.
6. Use Discover search only to confirm the content remains findable. Record
   explicitly that search does not expose a reply-count field; do not call
   that a count pass or failure.
7. Refresh the document, thread, and category views once. The visible count and
   rendered reply total must remain consistent after refresh.

Signed-out public access is sufficient. If an already authenticated browser is
used, do not sign out or alter that account; the count contract is not
viewer-specific.

## Visual And Diagnostic Checks

At both viewports confirm:

- the count is not clipped, overlapped, or detached from the relevant item;
- singular/plural copy is correct for `2 replies`;
- the two reply cards fit without horizontal page overflow;
- navigation remains usable; and
- there are no page errors or unclassified console errors during this route.

This is not a fresh full theme matrix. PR527D and PR527D1 already accepted the
Forum theme and composer presentation.

## Strict No-Write Boundary

Do not:

- post, edit, hide, report, vote, watch, unwatch, moderate, delete, or create
  anything;
- run a migration, RPC, direct database write, auth create, tier change, seed,
  or cleanup mutation;
- change source, tests, configuration, packages, lockfiles, or product copy;
- add a reply count to Discover search; or
- widen the run into PR527E or another Forum repair.

Hosted product mutation count must be zero.

## Result

Create:

`docs/roadmap/PR527D2C_FORUM_REPLY_COUNT_HOSTED_HUMAN_READBACK_RESULT.md`

Record exact pass/fail for deployment gate, the document-to-thread route,
thread summary versus rendered replies, category count, Discover rising/feed
count, search-presence-only caveat, refresh persistence, both viewports,
diagnostics, and zero-write scope. Do not include private ids, identities,
cookies, tokens, credentials, raw responses, or screenshots containing private
material.

Allowed committed paths:

```text
docs/roadmap/PR527D2C_FORUM_REPLY_COUNT_HOSTED_HUMAN_READBACK_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARIADNE.json
```

Commit and push the result, then wake MIMIR explicitly:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR527D2C's read-only human-eye reply-count readback.
Verdict:
- PASS or BLOCK with the exact visible route and mismatch.
Task:
- Close PR527D2 if the document, thread, category, and Discover feed count truth passes; otherwise open only the smallest evidenced correction. Preserve the Discover-search count-field caveat.
```
