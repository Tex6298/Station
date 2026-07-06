# PR495F - Owner Seminar Publish/Rollback Preflight Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495F_OWNER_PUBLISH_ROLLBACK_GATE_ONLY
```

## ARGUS Verdict

ARGUS accepts an owner-only publish/rollback gate.

Do not wire durable records into public `/events/seminars` in PR495F. The next
safe implementation is the owner action that turns a private reviewed seminar
record into a public-eligible durable record, plus the owner rollback that takes
it out of public eligibility.

This is intentionally not a hosting, scheduling, RSVP, ticketing, payment,
delivery, public route, or launch lane.

## Preflight Answers

- Next implementation: owner publish/rollback only.
- Public durable readback remains deferred. `GET /events/seminars`,
  public card resolution by durable card id, and public interest mark/withdraw
  must stay source-derived and unchanged.
- It is acceptable to set `status === "published"` and
  `visibility === "public"` before public `/events/seminars` is wired only if
  owner-visible copy says the public listing is pending and not live yet.
- Owner publish must require current `status === "ready"` and
  `visibility === "private"`.
- Rollback must be `published` + `public` back to `ready` + `private`.
- No dedicated `published_at` migration is accepted in this slice. Use the
  existing `updated_at` behavior for the dormant PR495E serializer until a later
  migration is explicitly reviewed.
- Publish must revalidate source ownership, source public/published state,
  public Space routeability, and safe discussion route behavior through the
  accepted PR495E serializer contract.
- Rollback should be allowed for the owner even if the source has become
  unroutable, because rollback reduces public eligibility.
- Hosted ARIADNE proof is required after ARGUS accepts implementation because
  this adds owner UI/API behavior and public-eligibility state.

## Exact DAEDALUS Scope

Allowed files:

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `packages/types/src/live-events.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/lib/live-events-route.test.ts`
- `apps/web/lib/publishing-ui.test.ts` only if existing dashboard static
  assertions need scoped no-drift updates
- focused roadmap/result docs

Do not touch:

- Supabase migrations, schema, RLS policies, or generated DB types;
- public `/events/seminars` route sourcing;
- public seminar interest mark/withdraw behavior;
- `public.public_seminar_interests`;
- Discover/search/forum behavior;
- billing, provider runtime, queues/workers, Redis, Cloudflare, archive/import,
  persona runtime, broad UI shell structure, or public route copy.

## API Contract

Use the existing owner transition route:

```text
POST /events/seminars/records/:recordId/transition
```

It remains authenticated and creator-gated.

Accepted strict request bodies:

```json
{ "status": "ready" }
```

```json
{ "status": "draft" }
```

```json
{ "status": "published" }
```

No extra fields are accepted.

Allowed transitions:

- `draft` + `private` to `ready` + `private`;
- `ready` + `private` to `draft` + `private`;
- `ready` + `private` to `published` + `public`;
- `published` + `public` to `ready` + `private`.

Reject:

- `draft` to `published`;
- `published` to `draft`;
- `cancelled` to anything;
- `ready` or `published` to `cancelled`;
- private/public visibility supplied by the client;
- source/title/summary/discussion/owner fields supplied by the client;
- non-document records;
- non-owner records;
- missing, malformed, or unsupported target statuses.

Publish preconditions:

- record belongs to the signed-in user;
- current record is `source_type === "document"`;
- current record is `status === "ready"`;
- current record is `visibility === "private"`;
- source document still exists;
- source document `author_user_id === owner_user_id`;
- source document `status === "published"`;
- source document `visibility === "public"`;
- source document belongs to a routeable public Space with a safe slug;
- PR495E durable public-card serializer can resolve the post-publish row into a
  safe card contract.

Publish update:

- set `status = "published"`;
- set `visibility = "public"`;
- do not update title, summary, source id, owner id, discussion id, or any
  public route table.

Rollback preconditions:

- record belongs to the signed-in user;
- current record is `source_type === "document"`;
- current record is `status === "published"`;
- current record is `visibility === "public"`.

Rollback update:

- set `status = "ready"`;
- set `visibility = "private"`;
- do not require source routeability to rollback;
- do not delete interest rows, durable records, source documents, discussions,
  or public feed entries.

All errors must be bounded and must not leak raw owner ids, raw source ids, raw
record ids, raw discussion ids, source bodies, private labels, SQL/storage
internals, provider payloads, tokens, cookies/headers, IP/user-agent values,
stack traces, or secret-shaped values.

## UI Contract

Update only the `/studio/publishing` Seminar readiness controls.

For creator owners:

- no record: existing `Create seminar draft`;
- private draft: existing `Mark ready for review`;
- private ready: show `Publish record` or similarly bounded copy, plus visible
  copy that the public listing is pending and not live yet;
- private ready: keep `Return to draft`;
- published/public: show bounded readback such as `Public record` and
  `Public listing pending readback wiring.`;
- published/public: show `Return to ready`;
- non-creator: no working publish/rollback action.

Do not render raw record/source/owner/discussion ids.

Do not add public seminar detail links, public card links, schedule/host/RSVP/
ticket/payment/reminder/attendance/waitlist/live-room/media/transcript/provider/
queue/Redis/Cloudflare/billing/launch copy, or broad UI reskin.

## Required DAEDALUS Tests

API tests must prove:

- signed-out, non-creator, and non-owner publish/rollback fail closed;
- `ready` + `private` publishes to `published` + `public`;
- publish revalidates owner/source/public/published/public Space routeability;
- publish fails for draft, private, cancelled, public, non-document,
  source-private, source-unlisted/community, source-draft/archived, no-Space,
  private-Space, unsafe-slug, UUID-slug, and owner/source mismatch cases;
- post-publish record can be resolved by the PR495E durable public-card
  serializer helper;
- `published` + `public` rolls back to `ready` + `private`;
- rollback succeeds even if the source has become unroutable or non-public;
- draft to published, published to draft, cancelled transitions, visibility
  changes, source/title/summary/discussion/owner fields, and unknown statuses
  are rejected;
- response JSON omits raw owner/source/record/discussion ids, source bodies,
  private labels, SQL/storage details, provider payloads, tokens,
  cookies/headers, IP/user-agent values, stack traces, and secret-shaped values;
- current public `GET /events/seminars` still ignores durable records after
  publish;
- signed-in interest mark/withdraw still resolves only current source-derived
  public cards.

Web/static tests must prove:

- publish action appears only for private ready records and creator owners;
- published/public records show pending public-listing copy and rollback action;
- non-creators have no working publish/rollback action;
- transition request bodies contain only `{ status }`;
- new Seminar copy says public listing is pending or not live yet;
- no schedule, host, RSVP, ticket, payment, reminder, attendance, waitlist,
  room, stream, recording, transcript, provider, queue, Redis, Cloudflare,
  Stripe, billing, launch, or delivery guarantee copy enters the Seminar path;
- public route helpers/copy remain readback-only.

## Required Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The result doc must list exact files touched and explicitly confirm that public
`/events/seminars`, public interest mark/withdraw, migrations/RLS/schema,
public durable readback wiring, billing, provider, queue/worker, Redis,
Cloudflare, hosting, scheduling, RSVP, tickets, payments, reminders, media,
transcripts, and launch claims did not change.

## Hosted Proof Required After ARGUS Review

If ARGUS accepts the implementation, MIMIR should route ARIADNE for hosted
desktop, `375px`, and `390px` proof covering:

- hosted app/API freshness at the accepted implementation/review commit or
  later;
- owner `/studio` to `/studio/publishing` flow;
- creator owner creates or uses a private ready seminar record;
- owner publishes the record and sees pending public-listing readback;
- owner rolls the record back to ready/private;
- duplicate publish and duplicate rollback are stable;
- non-creator and signed-out users cannot publish or rollback;
- public `/events/seminars` and signed-in interest mark/withdraw do not drift;
- no durable seminar record appears as a public card yet;
- no private/raw/secret/runtime/scope leak;
- no desktop, `375px`, or `390px` fit defect.

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile review of PR495F surface | Pass | Reviewed PR495E closeout, durable serializer contract, owner transition route, owner UI controls, public route/interest helpers, shared types, migrations, and current tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 31 focused API/public-route/auth tests passed before PR495F implementation. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts` | Pass | 20 focused publishing/seminar readiness tests passed before PR495F implementation. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495F as ACCEPT_PR495F_OWNER_PUBLISH_ROLLBACK_GATE_ONLY.
- Implement only owner publish/rollback over durable seminar records: ready/private to published/public, and published/public back to ready/private.
- Keep public /events/seminars and public interest routes unwired from durable records; visible owner copy must say public listing is pending/not live yet.
Task:
- Add the accepted API/type/UI/tests/docs within the exact scope above.
- Keep public durable readback wiring, public interest migration, schema/RLS migrations, scheduling, hosting, RSVP/tickets/payments/reminders/live rooms/media/transcripts/provider/runtime/queues/Redis/Cloudflare/billing/launch claims out of scope.
```
