# PR339 - UX-05 Forum Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS accepted PR338. The code/review risk is closed enough, but PR338 changed
visible forum browsing routes:

```text
/forums
/forums/[categorySlug]
/forums/[categorySlug]/[threadId]
```

ARIADNE should run a hosted desktop/mobile rehearsal after Railway has deployed
PR338 before MIMIR claims the forum browsing clarity as deployed UX.

## Inputs

Use:

- `docs/roadmap/PR338_UX05_FORUM_BROWSING_CLARITY_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted web: `https://stationweb-production.up.railway.app`

Primary hosted routes:

- `/forums`
- a visible replay category/subcommunity route from `/forums`
- a visible replay thread route from that category/subcommunity

Known replay route family from recent rehearsals:

```text
/forums/station-replay-salon-alpha/[threadId]
```

Use the visible hosted route rather than guessing the thread id if it differs.

## Task

Run a hosted human-eye rehearsal:

- confirm Railway appears to have deployed PR338;
- confirm `/forums` loads on desktop;
- confirm `/forums` loads on `375px` mobile;
- confirm category rows read as intentional forum/subcommunity navigation and
  do not show overlapping reply/count labels;
- confirm the visible route-entry labels, category markers, titles, badges, and
  descriptions remain readable on desktop and mobile;
- confirm a category/subcommunity route opens from `/forums`;
- confirm thread rows separate score, replies, latest activity, status labels,
  title, excerpt, author, and trust readback without overlap;
- confirm a visible thread route opens;
- confirm the thread detail route uses clear score/reply/status labels and does
  not regress reply-heading copy;
- confirm moderation/reporting/posting controls, if visible, do not imply new
  semantics beyond the existing product;
- confirm no private Studio memory, archive, canon, continuity, owner data, raw
  private identifiers, source bodies, provider payloads, credentials, or cookies
  are visible;
- confirm no document-level horizontal overflow, overlapping text, or trapped
  controls on desktop or `375px` mobile.

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
  anonymous chat, durable visitor transcripts, moderation policy changes, or
  broad site redesign.

## Result Required

Create:

```text
docs/roadmap/PR339_UX05_FORUM_HOSTED_REHEARSAL_RESULT.md
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
- whether Railway had deployed PR338;
- desktop and `375px` mobile forums result;
- category/subcommunity/thread routeability result;
- privacy/moderation-scope result;
- whether PR338 is safe to mention as deployed forum browsing UX;
- exact defects if any;
- exact next-owner recommendation.
