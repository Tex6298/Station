# PR498 - Public Seminar Detail Readback Preflight Result

Owner: ARGUS / A3

Date: 2026-07-06

Result:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK
```

## Decision

ARGUS accepts PR498A as the next safe Phase 3 seminar slice.

No smaller unblocker is required before DAEDALUS work. Product docs name
persona lecture and seminar hosting as a future Phase 3 capability, and PR495G
already proved the narrow public seminar foundation: routeable public cards,
durable published/public records, digest card ids, aggregate/viewer-local
interest, bounded stale-card failures, and desktop/mobile hosted readback.

The accepted PR498A lane is not live hosting. It is only a routeable public
detail/readback page for seminar cards that are already eligible for the
accepted public `/events/seminars` list.

## Required Scope

DAEDALUS may touch only the narrow public seminar detail/readback surface:

- `packages/types/src/live-events.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/lib/live-events-route.ts`
- `apps/web/lib/live-events-route.test.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/app/events/seminars/[seminarId]/page.tsx`
- `apps/web/app/globals.css`, only for small scoped selectors if the existing
  public seminar/page styles cannot cover the detail view
- roadmap and validation docs for the PR498A handoff/result

No migrations, RLS changes, new tables, background jobs, queues, Redis,
Cloudflare, workers, provider/runtime changes, billing, public export, owner
publishing expansion, or broad `/events` redesign are accepted in this lane.

## API Contract

Add a public read route for one seminar detail:

```text
GET /events/seminars/:seminarId
```

The route must:

- allow signed-out reads and use optional auth only to include the same
  viewer-local `viewerInterested` readback already used by the list route;
- accept only digest/card ids shaped like `seminar_[a-f0-9]{16}`;
- resolve the target through the same eligible-card pipeline as
  `/events/seminars` and interest resolution, preferably by extracting a shared
  helper around `loadResolvedPublicSeminarCards` /
  `resolvePublicSeminarTargetByCardId`;
- return bounded `404` with `code: "seminar_not_found"` for malformed ids,
  stale rolled-back durable records, private sources, private Spaces,
  community-only/hidden threads, unsafe slugs, owner mismatches, or missing
  sources;
- return bounded `503` with `code: "live_events_unavailable"` for storage
  failures;
- serialize only public-safe fields derived from the existing
  `PublicSeminarCard` contract plus bounded detail/readback copy;
- never expose raw durable record ids, owner user ids, source ids as data
  fields, `source_id`, `owner_user_id`, `author_user_id`,
  `discussion_thread_id`, raw source bodies, storage paths, provider payloads,
  SQL/table detail, stack traces, tokens, cookies, API keys, or secret-shaped
  values.

Durable cards must keep using `durablePublicSeminarCardId(record.id)` for public
routeability. Interest rows must remain keyed to the public source type/id
server-side, never to durable record ids.

The response type may be small. It should stay visibly honest, for example:

```ts
export interface PublicSeminarDetailResponse {
  source: "public_seminar_detail";
  card: PublicSeminarCard;
  generatedAt: string;
}
```

Additional detail fields are acceptable only if they are bounded duplicates or
safe transforms of existing public card fields.

## Web Contract

The public list page should route eligible seminar cards to the new detail page:

```text
/events/seminars/:seminarId
```

Add a helper such as `publicSeminarDetailHref(card)` that returns the detail
href only for valid digest/card ids. Keep source and discussion links sanitized
with the existing `/space/` and `/forums/` checks.

The new detail page must:

- fetch only `GET /events/seminars/:seminarId`;
- show public card/detail readback, date, source link, public Space link,
  discussion link when safe, aggregate interest count, and viewer-local interest
  state if signed in;
- reuse the existing accepted seminar interest mutation routes only if it shows
  an interest control;
- keep signed-out behavior public/read-only except for the existing sign-in
  prompt for interest;
- use bounded copy such as public readback/detail language, not launch,
  hosting, ticketing, attendance, scheduling, streaming, or delivery claims;
- fit and remain readable on desktop, `375px`, and `390px`.

## Forbidden Claims And Data

Visible UI, API responses, docs, and tests for PR498A must not claim or expose:

- live rooms, hosting, streaming, voice/avatar, provider/runtime/model/prompt
  behavior, transcripts, media, recordings, moderator controls, audience queues,
  question queues, calendars, reminders, email, registration, RSVP, attendance,
  tickets, payments, Stripe, billing, launch readiness, delivery guarantees, or
  commercial availability;
- private owner draft/readback state, owner controls, private documents,
  community-only or hidden forum content, raw source bodies, raw durable ids,
  raw source ids as response fields, storage paths, credentials, provider
  payloads, tokens, cookies, API keys, secret-shaped values, stack traces,
  SQL/table details, or internal package/runtime identifiers;
- new public mutations beyond the already-accepted seminar interest
  mark/withdraw behavior.

## Required DAEDALUS Validation

Before waking ARGUS, DAEDALUS must run and report:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

The focused API tests must include:

- signed-out and signed-in detail reads;
- durable published/public detail readback;
- source-derived detail readback;
- stale rolled-back durable id returns bounded `seminar_not_found`;
- private source, private Space, unsafe slug, owner mismatch, and hidden/private
  discussion cases fail closed or omit unsafe links;
- malformed ids return bounded `seminar_not_found`;
- storage failures return bounded public errors;
- no raw durable ids, owner ids, source field names, secret-shaped values, stack
  traces, provider payloads, SQL/table details, or raw source bodies in detail
  JSON.

The focused web tests must include:

- list card links route to `/events/seminars/:seminarId` for valid seminar
  digest ids;
- source and discussion links remain limited to safe `/space/` and `/forums/`
  hrefs;
- detail copy remains readback-only and excludes the forbidden product claims;
- interest copy remains aggregate/viewer-local and does not imply booking,
  ticketing, reminders, payment, attendance, or delivery.

## Hosted Proof Required After Review

If ARGUS accepts the implementation, ARIADNE must prove the hosted detail
readback before closeout:

- hosted `GET /events/seminars` returns eligible cards;
- at least one source-derived card detail route and one durable public card
  detail route work when available in hosted fixtures;
- stale/private/malformed detail ids return bounded `seminar_not_found`;
- signed-out reads are public-safe and signed-in reads show only viewer-local
  interest state;
- interest mark/withdraw behavior still matches PR495G;
- desktop, `375px`, and `390px` screenshots show readable detail UI without
  overflow, clipped controls, or incoherent overlap;
- visible/API scans find no raw ids, owner/private fields, source bodies,
  provider/runtime details, secret-shaped values, stack traces, or forbidden
  hosting/payment/scheduling/launch claims.

## ARGUS Validation

ARGUS ran the current preflight baseline before committing this decision:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 36 focused public seminar/auth route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo replayed API and web typecheck from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close the preflight and, if still aligned with the roadmap,
route DAEDALUS for PR498A using the contract above.
