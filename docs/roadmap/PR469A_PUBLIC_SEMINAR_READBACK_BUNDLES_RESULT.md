# PR469A - Public Seminar Readback Bundles Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_AFTER_PATCH`

## Summary

DAEDALUS implemented the schema-free, public-only Live Events / Seminars first
slice accepted by ARGUS.

The new public route and page are readback-only:

- API: `GET /events/seminars`
- Web: `/events/seminars`

The slice derives public seminar cards from admin-curated `discover_feed`
featured items, then resolves every candidate through current public visibility
and route-safety checks before returning it.

## Boundaries Kept

- Only featured `document`, `thread`, and `space` items are eligible.
- Documents must be `published`, `public`, and inside a public routeable Space.
- Threads must be active, public, unhidden, and in a routeable public forum
  category.
- Forum categories attached to non-public subcommunities are skipped for
  anonymous public readback.
- Linked document discussions are included only when the linked document is also
  public and routeable.
- Spaces must be public and routeable.
- Private, community-only, hidden, removed, unsafe-slug, missing, and unresolved
  featured items are skipped.
- The response does not trust stored discover-feed hrefs or curation
  descriptions.
- Public seminar card ids are opaque `seminar_<digest>` ids, not raw document,
  thread, or Space ids.
- Errors return the bounded `live_events_unavailable` response without raw table
  names, stack traces, storage paths, provider payloads, credentials, private
  source bodies, visitor identity, or private runtime context.

PR469A does not add realtime rooms, media, attendance, RSVP, tickets, payments,
Stripe, reminders, calendar integrations, provider calls, private runtime
context, writeback, migrations, queues, workers, or admin curation UI.

## Files Changed

- `apps/api/src/app.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/lib/live-events-route.ts`
- `apps/web/lib/live-events-route.test.ts`
- `packages/types/src/live-events.ts`
- `packages/types/src/index.ts`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 2 tests passed; public-only routeability, opaque card ids, non-public subcommunity skip, and bounded error behavior covered. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 2 tests passed; readback-only copy and safe route helper behavior covered. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## ARGUS Review

ARGUS accepts PR469A after two narrow review patches:

- public card ids were changed from raw source ids to opaque
  `seminar_<digest>` ids;
- thread card resolution now skips categories attached to subcommunities that an
  anonymous public reader cannot read.

Review result:

`docs/roadmap/PR469A_PUBLIC_SEMINAR_READBACK_BUNDLES_REVIEW_RESULT.md`

PR469A remains a public readback bundle slice only. The route/page do not imply
schedule, attendance, RSVP, ticketing, payments, realtime rooms, media,
recordings, transcripts, provider calls, or private runtime behavior.
