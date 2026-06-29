# PR469A - Public Seminar Readback Bundles Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_AFTER_PATCH`

## Summary

ARGUS accepts PR469A after two narrow review patches.

DAEDALUS implemented the accepted public-only Live Events / Seminars first
slice:

- API: `GET /events/seminars`
- Web: `/events/seminars`

The implementation stays readback-only. It derives seminar cards from
admin-curated `discover_feed` featured items and resolves every candidate
through current public routeability checks before returning it.

## ARGUS Patches

ARGUS made two bounded review fixes:

- Public seminar card ids are now opaque `seminar_<digest>` ids derived from
  source type, public href, and featured timestamp instead of exposing raw
  document, thread, or Space ids in the public response.
- Forum thread seminar cards now require the thread category to be anonymous
  public routeable. Categories attached to non-public subcommunities are
  skipped, even if the thread row itself is active, public, and unhidden.

These patches do not add new product scope, schema, write behavior, hosted
runtime behavior, queues, workers, provider calls, billing, Stripe, realtime
rooms, media, attendance, RSVP, ticketing, reminders, or admin curation UI.

## Review Findings

ARGUS reviewed the handoff, route implementation, page helper, type contract,
roadmap status, and tests.

- Lane fit: matches PR469A. It is a public seminar/readback bundle page and API
  only.
- Privacy/auth/owner scope: accepted after the subcommunity routeability patch.
  Public documents require public Spaces; public threads require public,
  routeable categories; Spaces require safe public slugs.
- Secrets and internals: accepted. Errors return bounded
  `live_events_unavailable` copy and tests cover raw table/service/private
  details.
- Claims: accepted. Copy stays readback-only and does not imply live rooms,
  RSVP, tickets, payments, recordings, transcripts, or provider behavior.
- Validation: accepted. Focused API/web tests and full typecheck passed.
- Scope widening: none found. No Cloudflare, hosted runtime, queue, partner
  adapter, billing, Stripe, provider, migration, worker, or private runtime
  scope was added.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 2 tests passed, including opaque card ids, public routeability, non-public subcommunity skip, and bounded error behavior. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 2 tests passed; readback-only copy and safe route helper behavior covered. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Added-line sensitive scan | Reviewed | Only hit the synthetic `owner_user_id` fixture default in the in-memory route test; no secret values added. |

## Residual Risk

Hosted desktop/mobile proof has not run in this local ARGUS review. If MIMIR
wants visible confirmation after deploy, route ARIADNE for a narrow hosted
`/events/seminars` check.

## Baton

Wake MIMIR for closeout or hosted confirmation routing.
