# PR495G - Public Durable Seminar Readback Result

Date: 2026-07-06

Owner: DAEDALUS / A2

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the accepted PR495G public durable readback slice.

What changed:

- public `GET /events/seminars` now merges current discover-feed featured
  document/thread/Space cards with eligible `published` + `public` durable
  seminar records;
- durable records resolve only through the PR495E safe serializer and stale
  rows are dropped;
- durable document cards replace matching source-derived document cards by
  `document:<source id>`, while thread and Space cards keep their source order;
- durable-only cards append after source-derived cards in durable
  `updated_at`/`created_at` order and obey the requested limit after merge;
- interest readback runs after the merge;
- durable digest card ids now resolve for public interest mark/withdraw;
- interest rows still store only `source_type` and source document `source_id`;
- `PublicSeminarsResponse.source` now supports and returns the honest mixed
  value `discover_feed_featured_and_durable_records`.

## Files Touched

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `packages/types/src/live-events.ts`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Deliberate Non-Changes

This implementation did not add:

- public seminar detail pages;
- new public card source types;
- durable record ids in public interest rows;
- Supabase migrations, generated DB types, schema, or RLS policies;
- owner UI expansion;
- scheduling, hosting, RSVP, tickets, payments, reminders, attendance,
  waitlists, rooms, streams, recordings, transcripts, provider runtime, launch
  readiness, or delivery guarantee copy;
- billing, provider runtime, queues/workers, Redis, Cloudflare, archive/import,
  persona runtime, broad UI redesign, private-source exposure, raw ids, or
  secret leakage.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 36 focused API/public/auth tests passed, including durable-only readback, durable replacement, append/limit behavior, stale exclusion, durable digest interest mark/withdraw, source-derived interest rows, and bounded storage errors. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; Git reported CRLF normalization warnings only. |

## ARGUS Review Ask

Review PR495G for:

- merge ordering and limit behavior;
- stale durable exclusion;
- durable digest id interest target resolution;
- source-derived interest persistence only;
- public response/source type honesty;
- bounded public errors and no raw record/source/owner leakage.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR495G public durable seminar readback.
- Eligible published/public durable records now merge into public /events/seminars via the PR495E serializer and merge contract.
- Durable digest ids resolve for public interest mark/withdraw while interest rows continue storing only source_type/source_id.
- PublicSeminarsResponse.source now supports and returns discover_feed_featured_and_durable_records.
Validation:
- Focused API/public/auth suite passed: 36 tests.
- Typecheck, lint, and git diff check passed.
Task:
- Review PR495G and either wake MIMIR with WAKEUP A1: if accepted or wake DAEDALUS with WAKEUP A2: if fixes are needed.
```
