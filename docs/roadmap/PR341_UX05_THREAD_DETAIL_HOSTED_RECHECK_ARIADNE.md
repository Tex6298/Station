# PR341 - UX-05 Thread Detail Hosted Recheck

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS accepted PR340. The code/review risk is closed enough, but PR340 changed
visible forum thread detail labels to close the PR339 caveat.

ARIADNE should rerun the hosted thread-detail check after Railway has deployed
PR340 so MIMIR can decide whether the forum UX caveat is fully closed.

## Inputs

Use:

- `docs/roadmap/PR340_UX05_THREAD_DETAIL_STATUS_LABELS_RESULT.md`
- `docs/roadmap/PR339_UX05_FORUM_HOSTED_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted web: `https://stationweb-production.up.railway.app`

Primary hosted route family:

```text
/forums/station-replay-salon-alpha/[threadId]
```

Use the visible hosted thread route from `/forums/station-replay-salon-alpha`
rather than guessing the thread id if it differs.

## Task

Run a hosted human-eye recheck:

- confirm Railway appears to have deployed PR340;
- open `/forums`;
- open the replay Salon/category route;
- open a visible replay thread route;
- confirm desktop thread detail shows category/status/kind/visibility labels
  near the thread heading;
- confirm `375px` mobile thread detail shows the same labels without overlap,
  horizontal overflow, or trapped controls;
- confirm score, reply, witness, signed-out participation, moderation,
  reporting, and reply-heading behavior still read as before;
- confirm no new action semantics are implied by the labels;
- confirm no private Studio memory, archive, canon, continuity, owner data, raw
  private identifiers, source bodies, provider payloads, credentials, or cookies
  are visible.

## Hard Limits

Do not:

- mutate hosted data;
- sign in unless needed for a clearly bounded current-viewer readback check;
- create/edit/delete forum, thread, reply, report, moderation, Space, document,
  memory, archive, continuity, canon, provider, billing, or Developer Space
  data;
- change code, schemas, migrations, config, Railway, Supabase, Stripe,
  provider/model settings, Redis, Cloudflare, queues, workers, deploy settings,
  keys, or database-admin state;
- contact testers;
- claim public launch, commercial/customer readiness, partner readiness,
  moderation policy changes, anonymous chat, durable visitor transcripts, or
  broad site redesign.

## Result Required

Create:

```text
docs/roadmap/PR341_UX05_THREAD_DETAIL_HOSTED_RECHECK_RESULT.md
```

Return one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Wake MIMIR with:

- verdict;
- whether Railway had deployed PR340;
- desktop and `375px` mobile thread-detail result;
- whether the PR339 caveat is closed;
- privacy/moderation-scope result;
- exact defects if any;
- exact next-owner recommendation.
