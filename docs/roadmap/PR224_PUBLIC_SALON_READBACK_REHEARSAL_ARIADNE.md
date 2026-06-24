# PR224 Public Salon Directory Readback Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: active

## Frame

PR223 fixed the visible Salon directory/category readback issue found in PR222:

- `/forums/subcommunities` now names Canon, Developer, and Salon community
  areas instead of only Canon and Developer.
- The existing subcommunity directory shows compact Canon/Developer/Salon type
  counts.
- Salon-backed category empty states are type-aware while staying on the
  existing `/forums/[categorySlug]` thread route.

ARGUS accepted PR223 and recommends one focused hosted rehearsal before MIMIR
opens Discover Salon grouping or public persona Salon readback.

## Goal

Run a focused hosted human-eye rehearsal on Railway:

- verify the PR223 copy/readback changes are actually deployed;
- confirm `/forums/subcommunities` is now honest about Salons;
- confirm `/forums/station-replay-salon-alpha` remains readable, type-aware,
  and thread-based;
- confirm desktop and 375px mobile layout still fit;
- confirm public-safe boundaries remain intact.

## Required Routes

Use:

```text
https://stationweb-production.up.railway.app
```

Check:

1. Deployment freshness
   - Web/API health should be ready on commit `a982b0b` or a later main commit.
   - If Railway is still on `19e9f36`, record the rehearsal as blocked/stale
     rather than judging old copy.

2. Public directory
   - Visit `/forums/subcommunities` signed out or in a clean context.
   - Confirm the intro copy includes Salons or uses a neutral phrase covering
     Canon, Developer, and Salon areas.
   - Confirm the compact type summary includes Salon count text.
   - Confirm `Station Replay Salon Alpha` is still visible and labeled
     `Salon / Public / active`.
   - Confirm no private/unlisted rows become visible.

3. Public Salon category
   - Open `/forums/station-replay-salon-alpha`.
   - Confirm the page is still labeled `Salon / Public / active`.
   - Confirm the empty state is Salon-aware and thread-based.
   - Confirm search/sort controls still work visually and do not imply a live
     room or provider interaction.

4. Signed-in readback, only if normal test session is available
   - Repeat the directory/category route while signed in if the usual replay
     session is available.
   - Do not create or mutate Salon data unless needed to reproduce a defect.

5. Desktop and mobile
   - Check desktop and 375px mobile.
   - Look for horizontal overflow, clipped type summaries, broken badges,
     unreadable empty states, or stale copy.

6. Public-safe boundary
   - The visible public routes must not show owner ids, linked private ids, raw
     persona ids, unsafe persona links, report internals, private/unlisted
     Salon data, private persona memory/archive/setup/canon, transcripts,
     provider traces, tokens, SQL/PostgREST internals, stack traces, or
     UUID-shaped implementation ids.

## Out Of Scope

Do not test or demand:

- Discover-specific Salon grouping;
- public persona page Salon readback;
- new creation policy;
- live rooms, provider calls, persona-to-persona behavior, public event feeds,
  billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session changes, moderation-role expansion, or broad UI reskin.

## Output

Update this document, `docs/roadmap/ACTIVE_STATUS.md`, and
`docs/testing/VALIDATION_BASELINE.md` with:

- pass/fail/block verdict;
- deployment commit;
- routes tested;
- desktop/mobile notes;
- visible defects, if any;
- public-safe boundary observations;
- recommendation for MIMIR's next lane.

## Validation

Use Playwright or equivalent hosted browser tooling where possible. Record
commands without secrets.

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
- ARIADNE completed PR224 Public Salon Directory Readback Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- Decide the next lane.
```
