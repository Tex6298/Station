# PR495A - Public Seminar Owner Readiness Gate Preflight Result

Date: 2026-07-05

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495A_OWNER_SEMINAR_READINESS_GATE
```

## ARGUS Verdict

ARGUS accepts one narrow PR495A implementation slice:

```text
Owner-only seminar readiness gate on the existing Studio Publishing Dashboard.
```

This can be honest without a durable seminar/event record because it is
readback-only over already-owned public source material. It must not create or
imply a scheduled seminar, host slot, RSVP, ticket, attendance, reminder,
payment, live room, recording, transcript, provider runtime, or future delivery
promise.

The durable seminar record contract is not required before this readback-only
gate. It is required before any future UI can claim that an owner has hosted,
proposed, scheduled, booked, sold, reminded, streamed, recorded, or managed a
seminar.

## Exact DAEDALUS Scope

Implement PR495A as a web-only owner readback slice.

Allowed files:

- `apps/web/lib/seminar-host-readiness.ts`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/publishing.ts`, only if an existing type/helper needs a narrow
  optional public-Space field for the panel
- `apps/web/lib/publishing-ui.test.ts`, only for a narrow wiring/static no-drift
  assertion if useful
- roadmap/result docs for the DAEDALUS handoff

Do not touch API routes, database migrations, Supabase schema/types, public
seminar API/types, public `/events/seminars` behavior, billing, queues/workers,
Redis, Cloudflare, provider/runtime code, public search, Discover curation,
forum moderation, or broad Studio shell/layout/CSS.

## Required Product Shape

Add a compact owner-only panel to `/studio/publishing` using only data already
loaded by `PublishingDashboard`:

- owner documents from `GET /documents`;
- owner Spaces from `GET /spaces`;
- no new API request unless ARGUS is explicitly re-woken for a blocker.

The panel should:

- name itself as seminar readiness, source readiness, or candidate readiness;
- explain that seminars currently start from public Station material and public
  discussion/readback routes;
- count or list only owner-owned candidate material that is already safe for
  public seminar readback:
  - `status === "published"`;
  - `visibility === "public"`;
  - a Space destination exists;
  - the matched Space is public;
- show linked-discussion readiness only from existing
  `discussion_thread_id` metadata, without deriving or exposing raw forum
  internals;
- show gaps such as no public Space, no public published document, or no linked
  discussion;
- route to existing owner/public actions only:
  - `/studio/publish`;
  - `/studio/publishing`;
  - `/space`;
  - safe public Space/document hrefs that the existing helpers can derive;
- keep public discussion/forum links as the only current audience interaction
  path.

Copy must say the current route is readiness/readback only. It may say a public
document or public Space can become a seminar candidate. It must not say the
owner can host, propose, schedule, book, reserve, launch, invite attendees,
collect RSVP, take payment, stream, record, transcribe, or notify anyone.

## Owner Boundary

The first PR495A owner is the signed-in account owner on
`/studio/publishing`, over documents and Spaces returned by owner-scoped
endpoints.

Do not add persona-owner, Space-owner, Developer Space-owner, admin curation, or
public visitor controls in PR495A. Those are separate MIMIR choices if needed.

## Rejected Shapes

`ACCEPT_PR495A_PUBLIC_SEMINAR_METHOD_COPY` is not the right first move. The
public `/events/seminars` copy already says the surface is curated public
readbacks and aggregate interest, not scheduled live event infrastructure. A
small owner readiness gate is a distinct customer-facing product delta.

`BLOCKED_NEEDS_DURABLE_SEMINAR_RECORD_CONTRACT` is not required for this slice.
It would be required for any persistence, status workflow, schedule, host claim,
proposal, RSVP, ticket/payment, attendance list, reminder, room, media, or
recording/transcript claim.

Developer Space and persona-specific seminar readiness are deferred. They have
separate owner and source semantics and should not be smuggled into this first
publishing-dashboard slice.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile preflight review | Pass | Existing `/events/seminars` and interest behavior are public-source-only and aggregate/viewer-local; owner readiness can be readback-only over existing owner documents/Spaces. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 30 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache. |
| `git diff --check` / `git diff --cached --check` | Pass | CRLF normalization warnings only for edited roadmap docs before staging; no whitespace errors. |

## Required DAEDALUS Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/api/src/routes/live-events.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The new helper tests must prove:

- private, community, unlisted, archived, draft, no-Space, and private-Space
  documents do not count as seminar-ready public candidates;
- public documents in public Spaces can become candidates without exposing raw
  source ids, owner ids, private source labels, secrets, storage paths, provider
  payloads, tokens, cookies, headers, IP/user-agent values, or stack traces;
- linked-discussion readback is metadata-only and does not invent forum route
  details;
- visible copy excludes tickets, payment, RSVP, waitlists, reminders, attendee
  lists, live rooms, media, recordings, transcripts, provider calls, queues,
  workers, Redis, Cloudflare, and launch claims;
- `/events/seminars` public copy and interest helpers remain readback-only and
  aggregate/viewer-local.

## ARIADNE Rehearsal Needed After ARGUS Review

If ARGUS accepts the implementation, MIMIR should wake ARIADNE for hosted proof
covering:

- signed-in owner `/studio/publishing` on desktop, `375px`, and `390px`;
- panel visibility/readability with at least one ready candidate or honest
  blocker/gap state;
- candidate/public links stay within existing owner/public routes;
- signed-out users cannot reach `/studio/publishing`;
- signed-out and signed-in `/events/seminars` still render the accepted public
  readback/interest surface;
- no private source body, raw id, owner id, secret-shaped value, provider
  payload, token, cookie/header, IP/user-agent, stack trace, schedule, ticket,
  RSVP, reminder, payment, live room, media, recording, transcript, or launch
  claim appears.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495A as ACCEPT_PR495A_OWNER_SEMINAR_READINESS_GATE.
- Implement a web-only owner seminar readiness gate on `/studio/publishing`, using only already-loaded owner documents and Spaces.
- Keep it readback-only: candidate/source readiness and existing public routes only, with no durable seminar record, API, schema, runtime, RSVP, tickets, payment, reminders, live rooms, provider calls, queues/workers, Cloudflare, Redis, or launch claims.
Task:
- Add the helper, tests, and compact Publishing Dashboard panel exactly within the allowed files and product shape above.
- Prove private/non-public/no-Space/private-Space documents do not count, public documents in public Spaces do count, copy has no forbidden claims, and `/events/seminars` remains unchanged.
```
