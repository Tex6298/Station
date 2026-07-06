# PR495D - Seminar Draft Publication Boundary Preflight Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495D_OWNER_READY_FOR_PUBLIC_REVIEW_GATE
```

## ARGUS Verdict

ARGUS accepts a narrow owner-only ready-state gate, not public durable seminar
readback.

The next public boundary is still blocked by unresolved product and data
contracts: durable-record public card ids, dedupe with `discover_feed`, interest
keys, public rollback semantics, and the safe public serializer all need a
separate reviewed lane before durable records can appear on `/events/seminars`.

DAEDALUS should therefore add the smallest owner-only transition that removes
one blocker without claiming public seminars are live:

- existing private durable seminar records may move from `draft` to `ready`;
- `ready` records may return to `draft`;
- `visibility` must remain `private`;
- `published` status and `public` visibility remain out of scope;
- public `/events/seminars` stays sourced only from current
  `discover_feed` featured document/thread/Space cards;
- seminar interest behavior stays keyed to the current source-derived public
  cards and must not add durable-record support in this slice.

Visible copy must make the state honest: this is a private ready-for-review
state, and the public listing is not live.

## Preflight Answers

- Smallest safe slice: owner-only `draft` to `ready` status gate with
  `ready` to `draft` rollback. Do not add public durable-record readback or a
  private-to-public publish transition yet.
- Future public seminar rule: when a later public readback lane exists, public
  durable seminars should require at least `status === "published"` and
  `visibility === "public"`, plus source routeability and a safe public
  serializer. PR495D must not create that state.
- `ready` state: use it now as private owner intent/readback only. It is not a
  scheduling, hosting, publication, launch, or public-card state.
- Public `/events/seminars`: no merge with durable records in PR495D. Keep the
  accepted `discover_feed` source-derived cards.
- Card ids and interest keys: unchanged in PR495D. Do not add durable-record
  card ids or durable-record interest keys.
- Public interest: unchanged. Mark/withdraw still resolves current public
  source-derived cards only.
- Rollback: owner-only `ready` back to `draft`. Do not add unpublish, cancel,
  delete, or public rollback.
- Hosted proof: required after ARGUS review accepts implementation, because the
  owner UI and API transition affect the hosted `/studio/publishing` flow.

## Exact DAEDALUS Scope

Allowed files:

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `packages/types/src/live-events.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/seminar-host-readiness.ts`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/lib/publishing-ui.test.ts` if existing publishing helper assertions
  need scoped no-drift coverage
- `apps/web/lib/live-events-route.test.ts` only for public route no-drift
  assertions
- focused roadmap/result docs

No migration is accepted in this slice. `public.public_seminar_records` already
has the required `ready` status and `private` visibility. Do not touch
Supabase RLS, public table policies, public Discover/search/forum routing,
billing, provider runtime, queues/workers, Redis, Cloudflare, archive/import,
persona runtime, or broad Studio/public UI shell structure.

## API Contract

Add one owner API transition route:

```text
POST /events/seminars/records/:recordId/transition
```

It must require:

- signed-in auth;
- creator-tier authority, matching the existing create route;
- record ownership by `owner_user_id === req.user.id`;
- `source_type === "document"`;
- current record `visibility === "private"`;
- current record status is `draft` or `ready`;
- source document is still owned by the signed-in user;
- source document is still `status === "published"`;
- source document is still `visibility === "public"`;
- source document still belongs to a routeable public Space.

Accepted request body:

```json
{
  "status": "ready"
}
```

or:

```json
{
  "status": "draft"
}
```

The route must reject `published`, `cancelled`, visibility changes, source
changes, title/summary changes, discussion changes, owner changes, and any
unsupported target with a bounded error. It must never return raw owner ids, raw
source ids, raw discussion ids, source bodies, SQL/storage details, stack
traces, tokens, cookies/headers, IP/user-agent values, provider payloads, or
secret-shaped values.

On success, update only the accepted private status transition and return the
existing safe `OwnerPublicSeminarRecordResponse` serializer. The response must
show `visibility: "private"` for both states.

## Type Contract

Add a minimal shared request type in `packages/types/src/live-events.ts`, for
example:

```ts
export type OwnerPublicSeminarRecordTransitionTarget = "draft" | "ready";

export interface TransitionOwnerPublicSeminarRecordRequest {
  status: OwnerPublicSeminarRecordTransitionTarget;
}
```

Do not add public durable-record card types, public source type variants,
interest key variants, or public response shapes in PR495D.

## UI Contract

Update the `/studio/publishing` Seminar readiness panel only.

For an accepted creator owner:

- no record: keep the existing `Create seminar draft` action;
- private `draft` record: show a bounded action such as
  `Mark ready for review`;
- private `ready` record: show honest readback such as
  `Ready for review` and copy saying `Public listing is not live.`;
- private `ready` record: provide `Return to draft`;
- non-creator: keep bounded unavailable copy and no working transition action;
- signed-out users remain unable to reach owner publishing.

The UI may send the owner record id in the authenticated owner API route, but
must not render raw record/source/owner/discussion ids. Transition failures must
use bounded panel-local copy such as `Seminar draft status is unavailable.`

Avoid seminar copy that says publish, host, propose, schedule, launch, book,
RSVP, ticket, payment, reminder, attendance, waitlist, live room, stream,
recording, transcript, provider, queue, worker, Redis, Cloudflare, Stripe,
billing, or public seminar is live.

## Required DAEDALUS Tests

API tests must prove:

- signed-out transition fails closed;
- non-creator transition fails closed;
- non-owner record transition fails closed;
- owner `draft` to `ready` succeeds and keeps `visibility: "private"`;
- owner `ready` to `draft` succeeds and keeps the same record id;
- transition revalidates the source document as owned, public, published, and
  routeable through a public Space;
- private, community, unlisted, draft, archived, no-Space, private-Space,
  unsafe-slug, UUID-slug, and non-owned source records fail closed;
- `published`, `cancelled`, visibility changes, source changes, title/summary
  changes, and unknown targets are rejected;
- response JSON omits raw owner/source/discussion ids, source bodies, private
  labels, SQL/storage details, provider payloads, tokens, cookies/headers,
  IP/user-agent values, stack traces, and secret-shaped values;
- public `GET /events/seminars`, signed-in interest mark/withdraw, and interest
  aggregate/viewer-local behavior do not drift.

Web/helper/static tests must prove:

- `Create seminar draft` remains available only for ready source candidates and
  creator-tier owners;
- private `draft` records show the ready action;
- private `ready` records show bounded private ready readback and
  `Return to draft`;
- non-creators have no working ready/draft transition action;
- transition request bodies contain only the accepted status target;
- raw record/source/owner/discussion ids and source bodies do not render;
- new seminar UI copy does not claim public publishing, scheduling, hosting,
  RSVP, tickets, payments, reminders, runtime, queues, Redis, Cloudflare,
  billing, media, transcripts, or launch readiness;
- public `/events/seminars` route copy and helpers remain unchanged.

## Required Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The result doc must state exact files touched and explicitly confirm that
public `/events/seminars`, public card ids, interest keys, Discover/search/forum
behavior, schema/RLS, runtime, billing, provider, queue/worker, Redis, and
Cloudflare scope did not change.

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile review of PR495D surface | Pass | Reviewed migration, events route, live-events tests/types, owner publishing UI, seminar helper tests, and public route helpers. Public durable-record readback remains too under-specified for this slice. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 39 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

## Required Hosted Rehearsal

If ARGUS accepts the PR495D implementation, MIMIR should route ARIADNE for
hosted desktop, `375px`, and `390px` proof covering:

- hosted app/API freshness at the implementation/review commit or later;
- owner `/studio` to `/studio/publishing` flow;
- creator owner creates or uses a private seminar draft;
- owner marks the draft ready and sees private ready readback;
- owner returns the record to draft and sees stable private draft readback;
- duplicate clicks or refreshes do not create duplicate rows or actions;
- non-creator and signed-out users cannot transition owner seminar records;
- public `/events/seminars` and signed-in interest mark/withdraw do not drift;
- no durable seminar records appear as public cards;
- no raw owner/source/discussion id, source body, private label, SQL/storage
  path, provider payload, token, cookie/header, IP/user-agent value, stack
  trace, secret-shaped value, ticket, payment, RSVP, attendee, reminder, room,
  media, transcript, provider, queue, Redis, Cloudflare, billing, host,
  schedule, public publish, or launch claim leaks;
- no desktop, `375px`, or `390px` fit defect.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495D as ACCEPT_PR495D_OWNER_READY_FOR_PUBLIC_REVIEW_GATE.
- Public durable-record readback, published/public transitions, durable-record interest keys, and /events/seminars durable-record sourcing remain blocked pending a separate card-id, dedupe, serializer, interest, and rollback contract.
- Implement only an owner authenticated creator-gated private draft status transition: draft to ready and ready to draft. Visibility must remain private and public /events/seminars must not change.
Task:
- Add the accepted transition API, shared request type, /studio/publishing UI controls/readback, focused tests, and result docs within the exact scope above.
- Keep public record readback, status=published, visibility=public, interest migration, scheduling, hosting, RSVP/tickets/payments/reminders/live rooms/media/transcripts/provider/runtime/queues/Redis/Cloudflare/billing/launch claims out of scope.
```
