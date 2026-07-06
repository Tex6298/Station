# PR498A - Public Seminar Detail Readback Result

Owner: DAEDALUS / A2

Date: 2026-07-06

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the narrow public seminar detail/readback slice accepted by
ARGUS.

The patch adds:

- `GET /events/seminars/:seminarId`;
- `PublicSeminarDetailResponse`;
- list card routing to `/events/seminars/:seminarId` for valid digest ids;
- `apps/web/app/events/seminars/[seminarId]/page.tsx`;
- safe source, Space, and discussion links through the existing public helper
  boundary;
- aggregate interest count and viewer-local interest readback on the detail
  page, reusing the accepted seminar interest mutation routes.

## API Boundary

The detail route:

- allows signed-out reads;
- uses optional auth only to include viewer-local `viewerInterested`;
- accepts only `seminar_[a-f0-9]{16}` ids through the existing target resolver;
- resolves through the same eligible-card pipeline used by
  `/events/seminars` and seminar interest mutations;
- returns bounded `404` with `code: "seminar_not_found"` for malformed,
  stale, private, owner-mismatched, or missing eligible cards;
- returns bounded `503` with `code: "live_events_unavailable"` for primary
  resolver storage failures;
- serializes only the existing public-safe `PublicSeminarCard` shape plus a
  generated timestamp.

Durable public cards still use `durablePublicSeminarCardId(record.id)` for
routeability. Interest rows remain keyed server-side to public source
type/source id, not durable record ids.

## Web Boundary

The public seminar list now sends valid digest-id cards to the detail route,
while keeping separate sanitized source and discussion links.

The detail page fetches only `GET /events/seminars/:seminarId`, shows bounded
readback copy, date, public source link, public Space link when safe,
discussion link when safe, aggregate interest count, and viewer-local interest
state for signed-in viewers.

Signed-out behavior remains public/read-only except for the existing sign-in
prompt to save interest.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 40 focused tests passed, including public detail API, web route helpers/source wiring, and auth route guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed after a narrow helper nullability fix. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Non-Scope Confirmation

No live rooms, hosting, streaming, scheduling expansion, RSVP, attendance,
tickets, payments, Stripe, billing, reminders, calendars, email, provider or
runtime changes, voice/avatar, transcripts, media, recordings, moderator queue,
audience queue, Redis, Cloudflare, workers, queues, public export, schema/RLS
migration, new table, private owner readback, raw durable ids, raw owner ids,
raw source fields, source bodies, storage paths, credentials, provider payloads,
tokens, cookies, API keys, stack traces, SQL/table detail, launch copy, or broad
`/events` redesign was added.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR498A public seminar detail/readback.
- GET /events/seminars/:seminarId reuses the accepted public seminar resolver
  and returns bounded 404/503 responses.
- The web list routes valid digest cards to detail; detail shows safe source,
  Space, discussion, aggregate interest, and viewer-local interest readback.
Validation:
- focused public seminar/auth tests pass: 40 tests.
- typecheck passes.
- lint passes.
Task:
- Review PR498A for routeability, visibility/privacy, public copy, forbidden
  claims, and validation truth.
```
