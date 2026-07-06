# PR498A - Public Seminar Detail Readback

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Decision

ARGUS accepted the PR498 preflight:

`docs/roadmap/PR498_PUBLIC_SEMINAR_DETAIL_READBACK_PREFLIGHT_RESULT.md`

Result:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK
```

## Implementation Task

Implement the narrow public seminar detail/readback slice accepted by ARGUS.

This is a public routeable detail page for seminar cards that are already
eligible for the accepted public `/events/seminars` list. It is not live
hosting.

## Required API Contract

Add:

```text
GET /events/seminars/:seminarId
```

The route must:

- allow signed-out reads;
- use optional auth only for the same viewer-local `viewerInterested` state
  already used by the list route;
- accept only digest/card ids shaped like `seminar_[a-f0-9]{16}`;
- resolve through the same eligible-card pipeline as `/events/seminars` and
  the PR495G interest resolver;
- return bounded `404` with `code: "seminar_not_found"` for malformed ids,
  stale rolled-back durable records, private sources, private Spaces,
  community-only/hidden threads, unsafe slugs, owner mismatches, or missing
  sources;
- return bounded `503` with `code: "live_events_unavailable"` for storage
  failures;
- serialize only public-safe fields derived from `PublicSeminarCard` plus
  bounded detail/readback copy;
- never expose raw durable record ids, owner user ids, source ids as data
  fields, raw source bodies, storage paths, provider payloads, SQL/table
  detail, stack traces, tokens, cookies, API keys, or secret-shaped values.

Durable cards must keep using `durablePublicSeminarCardId(record.id)` for
public routeability. Interest rows must remain keyed server-side to the public
source type/id, never to durable record ids.

## Required Web Contract

Add or finish:

- list card links to `/events/seminars/:seminarId` for valid public seminar
  digest/card ids;
- a helper such as `publicSeminarDetailHref(card)`;
- `apps/web/app/events/seminars/[seminarId]/page.tsx`;
- public card/detail readback, date, source link, public Space link,
  discussion link when safe, aggregate interest count, and viewer-local
  interest state when signed in;
- bounded readback/detail copy only.

If the detail page shows an interest control, reuse the accepted seminar
interest mutation routes. Signed-out behavior must stay public/read-only except
for the existing sign-in prompt for interest.

## Allowed Files

ARGUS allowed only the narrow public seminar detail/readback surface:

- `packages/types/src/live-events.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/lib/live-events-route.ts`
- `apps/web/lib/live-events-route.test.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/app/events/seminars/[seminarId]/page.tsx`
- `apps/web/app/globals.css`, only for small scoped selectors if existing
  public seminar/page styles cannot cover the detail view
- roadmap and validation docs for the PR498A handoff/result

If another file appears necessary, stop and wake MIMIR/ARGUS rather than
widening the lane silently.

## Forbidden Scope

Do not add or claim:

- migrations, RLS changes, new tables, queues, workers, Redis, Cloudflare,
  provider/runtime changes, model/prompt changes, public export, billing, or
  broad `/events` redesign;
- live session rooms, hosting, streaming, voice/avatar, transcripts, media,
  recordings, moderator controls, audience question queues, calendars,
  reminders, email, registration, RSVP, attendance, tickets, payments, Stripe,
  launch readiness, delivery guarantees, or commercial availability;
- owner/private draft/readback state, private documents, community-only or
  hidden forum content, raw source bodies, raw durable ids, raw source ids as
  response fields, storage paths, credentials, provider payloads, tokens,
  cookies, API keys, stack traces, SQL/table detail, or secret-shaped values;
- public mutations beyond accepted seminar interest mark/withdraw behavior.

## Required Validation

Before waking ARGUS, run and report:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Focused tests must cover the API and web cases named in ARGUS's preflight
result, including signed-out/signed-in detail reads, durable and source-derived
cards, stale/malformed/private failures, safe links, no raw/private leakage,
and no forbidden hosting/payment/scheduling/launch claims.

## Handoff

Wake ARGUS with a result doc and one of:

```text
READY_FOR_ARGUS_REVIEW
BLOCKED_PR498A_WITH_REASON
```
