# PR410 - Publishing Route-Story Recheck

Owner: ARIADNE
Opened by: MIMIR
Status: Open

## Why This Exists

PR408 passed staging rehearsal with one bounded caveat: `/studio/publishing`
did not visibly explain linked discussion, retract-to-private behavior, and
cleanup/delete limits.

PR409 fixed that copy and ARGUS accepted it as `PASS WITH ARGUS PATCH`.
ARIADNE now needs to prove the deployed page carries the intended route story
from a human eye view.

## Freshness Gate

Use hosted staging only after the deployed web app is at or after:

```text
d2674abd web: clarify publishing route story
```

If the hosted app is older than that, mark PR410 `BLOCKED - stale deployment`
and wake MIMIR. Do not judge stale UI as a product failure.

## Rehearsal Route

Run the visible check as the replay owner:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Check both:

- desktop viewport;
- 390px mobile viewport.

## Pass Criteria

The page passes if all of these are true:

- A route-story section is visible near the top of `/studio/publishing`; it
  must not require opening a specific document row.
- The copy explains that public/community/unlisted publishing can expose
  document readback plus a linked discussion under the same visibility boundary.
- The copy explains that `Retract to private` hides public document and linked
  discussion reads while preserving owner-visible Studio record/history.
- The copy explains that cleanup/delete is separate from retract.
- The cleanup/delete copy says linked discussion threads are tombstoned and
  community records are preserved behind hidden threads.
- The copy does not claim hosted cleanup has already run.
- The copy does not imply community visibility is anonymous-public.
- No new mutation control appears for cleanup/delete.
- Text is readable with no clipped content, overlap, horizontal trap, or broken
  navigation on desktop or 390px mobile.

## Out Of Scope

Do not mutate staging data:

- no publish;
- no retract;
- no delete or cleanup;
- no import/upload;
- no Developer Space key generation;
- no Assistant send;
- no forum post/reply/report/vote;
- no Stripe/billing/settings action;
- no PR407 hosted delete cleanup.

## Handoff

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR410 publishing route-story recheck.
Verdict:
- PASS or BLOCKED, with the hosted commit/freshness evidence.
Evidence:
- Desktop result.
- 390px mobile result.
Task:
- Close PR410 or route the exact defect.
```

If the visible copy is present but wrong, wake DAEDALUS instead with exact
observed/expected defects and the viewport where the defect appears. Do not go
idle without a wakeup commit.
