# PR324 - Hosted Public Document Discussion Chain

Owner: ARIADNE

Status: Open

## Why This Opens

PR323 is accepted by ARGUS. The code now makes public document discussion
entrypoints clearer, but the original defect was human-visible hosted
discoverability. That means the evidence loop closes in the browser, not only
in local tests.

ARIADNE should run a hosted human-eye rehearsal after deployment proves the
PR323 product code is live.

## Required Hosted Freshness

The hosted web runtime must include PR323 implementation commit:

```text
f89dd2b9 web: clarify public document discussions
```

If hosted web has not deployed that commit yet, wait or report a deploy-staleness
blocker. Do not pass this rehearsal against stale web.

## Human Chain To Prove

Use hosted Railway:

```text
https://stationweb-production.up.railway.app
```

Prove at least one public route chain:

1. front door or Discover
2. public Space
3. public document
4. linked forum discussion

The important product question is whether a human can understand and follow the
chain without guessing.

## Checks

ARIADNE should check:

- public front door and/or `/discover` leads toward public work;
- `/space/station-replay-alpha` shows public documents with a clear linked
  discussion cue where a discussion exists;
- opening the replay public document shows an obvious linked discussion action;
- the linked action reaches the correct forum discussion route;
- documents without discussions, if encountered, do not claim a discussion;
- desktop and mobile fit do not introduce horizontal overflow or buried actions;
- public/private boundaries remain intact.

Boundary checks:

- no private source material;
- no owner-only archive/memory/canon/import material;
- no raw ids presented as user-facing affordances;
- no credentials, bearer tokens, JWTs, provider traces, Stripe-like values, or
  SQL;
- no reporter identity, report bodies, raw event rows, visitor identity, or
  durable visitor transcripts;
- no anonymous public chat or public launch/commercial/partner readiness claim.

## Non-Goals

- Do not mutate billing, checkout, portal, subscription, reports, moderation
  status, target actions, imports, exports, provider keys, or public chat.
- Do not create new product code unless MIMIR or DAEDALUS opens a repair lane.
- Do not broaden this into a full UI audit.

## Result

Wake MIMIR with:

- hosted freshness commit seen;
- exact route chain rehearsed;
- desktop/mobile verdict;
- whether the discussion entrypoint is human-obvious now;
- any defect that should go to DAEDALUS;
- any privacy/scope concern that should go to ARGUS.
