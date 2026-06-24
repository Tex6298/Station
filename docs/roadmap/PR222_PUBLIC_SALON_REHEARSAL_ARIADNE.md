# PR222 Public Salon Foundation Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: active

## Frame

PR220 added the `salon` subcommunity type and PR221 repaired/proved hosted
Supabase plus Railway for that foundation. A bounded public seed now exists:

- name: `[replay:staging-salon-alpha] Station Replay Salon Alpha`
- slug: `station-replay-salon-alpha`
- type: `salon`
- visibility: `public`

Before DAEDALUS adds Discover Salon grouping or public persona Salon readback,
ARIADNE should rehearse the current hosted human routes and tell MIMIR whether
the foundation is visible, honest, and safe enough to build on.

## Goal

Run a human-eye hosted rehearsal on Railway:

- prove the current public Salon seed is reachable through existing public forum
  routes;
- verify the UI labels it as a Salon without pretending there is a larger
  product surface yet;
- confirm desktop and mobile layouts are usable;
- confirm public readback stays public-safe and does not leak owner/private
  fields;
- identify exact visible defects before the next implementation lane.

## Required Human Routes

Use the deployed Railway web URL:

```text
https://stationweb-production.up.railway.app
```

Check:

1. Deployment freshness
   - Web/API health should be ready on commit `19e9f36` or a later main commit.
   - If Railway has not deployed the relevant code, record that as blocked
     rather than judging stale UI.

2. Signed-out public route
   - Start signed out or in a clean context.
   - Visit `/forums/subcommunities`.
   - Find the public Salon seed or a routeable public subcommunity entry for
     `Station Replay Salon Alpha`.
   - Open the detail route for `station-replay-salon-alpha`.
   - Check the associated forum/category route if the UI links to it.

3. Signed-in readback, only if already available
   - If safe replay credentials/session are available in the normal test flow,
     repeat the route while signed in.
   - Do not create extra durable Salons unless required to reproduce a defect.
   - Do not use private secrets in logs/screenshots.

4. Desktop and mobile
   - Check desktop width and 375px mobile.
   - Look for horizontal overflow, clipped labels, unclickable links, broken
     cards, stale "general" labels, raw JSON, or database error text.

5. Public-safe boundary
   - The public rehearsal must not show owner ids, linked private ids,
     `linkedSpaceId`, `linkedDeveloperSpaceId`, raw persona ids, unsafe
     persona links, report internals, private/unlisted Salon data, private
     persona memory/archive/setup/canon, transcripts, provider traces, tokens,
     SQL/PostgREST internals, or stack traces.

## Out Of Scope

Do not test or demand:

- Discover-specific Salon grouping;
- public persona page Salon readback;
- realtime rooms;
- provider/model calls;
- persona-to-persona behavior;
- public event feeds;
- billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session changes, or moderation-role expansion;
- broad UI reskin.

If a missing feature is out of scope, record it as "not implemented yet" only if
the current UI overpromises it.

## Output

Update this document, `docs/roadmap/ACTIVE_STATUS.md`, and
`docs/testing/VALIDATION_BASELINE.md` with:

- pass/fail verdict;
- routes tested;
- desktop/mobile notes;
- visible defects, if any;
- privacy/safety observations;
- whether MIMIR should open Salon directory/readback implementation, send a
  fix back to DAEDALUS, or keep waiting for deploy freshness.

## Validation

Use Playwright or equivalent browser tooling for hosted checks where possible.
Record commands without secrets.

For docs-only result recording, run:

```text
git diff --check
git diff --cached --check
```

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR222 Public Salon Foundation Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- Decide whether to open Salon directory/readback, send defects to DAEDALUS, or
  wait for deployment.
```
