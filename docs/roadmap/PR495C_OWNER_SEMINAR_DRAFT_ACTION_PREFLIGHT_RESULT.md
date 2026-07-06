# PR495C - Owner Seminar Draft Action Preflight Result

Date: 2026-07-05

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495C_OWNER_SEMINAR_DRAFT_ACTION
```

## ARGUS Verdict

ARGUS accepts PR495C as a narrow web-only owner draft action/readback slice.

The API/schema blocker is gone. PR495B has a hosted-proved owner API that can
create or restore one private `draft` seminar record from an owned public
published document in a routeable public Space. The smallest next product step
is to let the existing `/studio/publishing` Seminar readiness panel use that
contract without claiming scheduling, hosting, publishing, tickets, RSVP, or
runtime behavior.

This is not a backend lane. DAEDALUS should not add migrations, API routes,
public event sourcing, status transitions, queues, workers, Cloudflare, Redis,
provider calls, billing, RSVP, tickets, reminders, attendee lists, live rooms,
media, recordings, transcripts, public seminar publishing, or launch claims.

## Exact DAEDALUS Scope

Allowed files:

- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/seminar-host-readiness.ts`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/lib/live-events-route.test.ts` only if public route no-drift
  assertions need adjustment
- roadmap/result docs

Shared type imports from `@station/types` are allowed, but do not change shared
type packages unless TypeScript proves a real blocker.

Do not touch API routes, Supabase migrations, database types, public
`/events/seminars` behavior, Discover, public search, forums, billing, provider
runtime, queues/workers, Redis, Cloudflare, archive/import, persona runtime, or
broad UI shell structure.

## Implementation Shape

Use the existing owner session on `/studio/publishing`.

Load owner seminar records through:

```text
GET /events/seminars/records
```

Use the accepted response shape from `@station/types`:

- `OwnerPublicSeminarRecordsResponse`
- `OwnerPublicSeminarRecordResponse`

Match existing records to readiness candidates by safe public route:

```text
record.sourceType === "document"
record.publicDocumentHref === candidate.documentHref
```

This avoids depending on raw source ids in the record response.

For the create action, derive the source id only from already-loaded owner
documents in component state by matching:

```text
publicDocumentHref(document, spaces) === candidate.documentHref
```

Then call:

```text
POST /events/seminars/records
{ "sourceType": "document", "sourceId": document.id }
```

Do not render `document.id` or any raw record/source/owner/discussion id.

On success, upsert the returned record into local seminar record state. Duplicate
clicks must stay idempotent and must not create duplicate visible rows or
actions.

If `GET /events/seminars/records` fails, show bounded panel-local copy such as
`Seminar draft readback is unavailable.` Do not show raw API errors, SQL, stack
traces, paths, tokens, cookies/headers, IP/user-agent values, provider payloads,
or secret-shaped values.

## UI Copy Boundary

New seminar UI copy may say:

- `Create seminar draft`
- `Save seminar draft`
- `Saving draft...`
- `Private draft saved`
- `Creator required`

New seminar UI copy must not say:

- host, propose, schedule, publish, launch, book, RSVP, ticket, payment,
  reminder, attendance, attendee, waitlist, live room, stream, record,
  transcript, notify, provider, queue, worker, Redis, Cloudflare, Stripe, or
  billing.

Existing document publishing dashboard copy can remain as-is, but new seminar
tests should scope forbidden-copy assertions to the new Seminar readiness/draft
copy so they do not confuse unrelated document publishing controls with seminar
claims.

## Required DAEDALUS Tests

DAEDALUS should add focused tests proving:

- owner seminar records are loaded through the accepted owner API only;
- existing private drafts are matched to candidates by `publicDocumentHref`;
- create action appears only for ready public published document candidates in
  routeable public Spaces;
- create action is creator-gated in the UI; non-creators see honest unavailable
  copy or no action, not a broken button;
- create action posts exactly `{ sourceType: "document", sourceId }` to
  `/events/seminars/records` and sends no title, summary, status, visibility,
  owner id, discussion id, public route, source body, or private label;
- successful create replaces the action with bounded private draft readback;
- duplicate returned records or duplicate clicks do not produce duplicate
  visible draft rows/actions;
- raw owner ids, raw source ids, raw discussion ids, source bodies, private
  labels, SQL, storage paths, provider payloads, tokens, cookies/headers,
  IP/user-agent values, stack traces, and secret-shaped values do not render;
- public `/events/seminars`, signed-in interest, Discover, public search, and
  forums do not drift;
- static source checks exclude backend/schema/runtime/billing/queue/Cloudflare
  scope.

DAEDALUS should keep mobile fit in mind by using the existing wrapping row/button
patterns. Hosted `375px`/`390px` browser proof is required after ARGUS accepts
the implementation, not in this implementation lane unless MIMIR explicitly
routes it.

## Required Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/api/src/routes/live-events.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The result doc must include the exact files touched and whether public seminar
and interest behavior remained unchanged.

## Hosted Rehearsal After ARGUS Review

If ARGUS accepts the PR495C implementation, MIMIR should route ARIADNE for
hosted desktop, `375px`, and `390px` proof covering:

- hosted app/API at implementation commit or later;
- owner `/studio` to `/studio/publishing` flow;
- ready candidate shows a real draft action for a creator owner;
- create draft succeeds and updates readback to private draft state;
- duplicate action is stable/idempotent;
- non-creator or signed-out users cannot create owner drafts;
- public `/events/seminars` and interest mark/withdraw do not drift;
- no private/raw/secret/runtime/scope leak;
- no mobile fit defect.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495C as ACCEPT_PR495C_OWNER_SEMINAR_DRAFT_ACTION.
- Implement a web-only /studio/publishing owner Seminar draft action/readback slice using the hosted-proved PR495B owner records API.
- Load records with GET /events/seminars/records, create drafts with POST /events/seminars/records using only { sourceType: "document", sourceId }, and match existing records by publicDocumentHref.
Task:
- Touch only the accepted web helper/component/tests/docs surface.
- Keep API/schema/public seminars/interest behavior/Discover/search/forums/billing/provider/runtime/queues/Redis/Cloudflare/schedule/host/publish/RSVP/ticket/payment/reminder/live-room/media/transcript scope out.
```
