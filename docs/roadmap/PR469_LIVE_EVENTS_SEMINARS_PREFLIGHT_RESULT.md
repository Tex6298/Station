# PR469 - Live Events / Seminars Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

## Decision

ARGUS accepts a narrow first Live Events / Seminars implementation lane.

The accepted lane is:

```text
PR469A - Public Seminar Readback Bundles
```

This is a schema-free, public-only readback slice. It is not realtime events,
scheduled attendance, media, ticketing, reminders, or live chat.

## Accepted Product Shape

DAEDALUS may build a public `/events/seminars` experience backed by existing
public-safe Station surfaces:

- admin-curated `discover_feed` featured items as the first curation source;
- public published documents that already resolve through public Space document
  routes;
- already-routeable public forum threads or public linked document discussions;
- public Spaces as supporting context when the Space is already public.

The page should present seminar/readback cards for public material that is
already safe to route. Cards may show title, short description, source type,
public href, public discussion/follow-up href when one already exists, and
published/featured timestamps.

Cards must not expose owner ids, private source ids, storage paths, raw source
bodies beyond existing public excerpts, credentials, prompts, provider payloads,
private documents, or private runtime context.

## Answers To Preflight Questions

1. First slice: public seminar readback bundles, derived from curated public
   documents/threads/Spaces and existing public discussion links.
2. Schema-free: no migration is required for PR469A. True schedule metadata
   needs a later migration lane.
3. Host/owner: the underlying public item owner remains the owner. PR469A does
   not add a new event-host role or host management UI.
4. Visibility: public-only readback. Owner draft/private staging is deferred.
5. Attendance, RSVP, registration, reminders, and calendar integrations are
   deferred.
6. Discussion should use existing public forum threads or linked document
   discussions. No live chat.
7. Recording, transcript generation, archive import, continuity promotion, and
   memory writeback are deferred.
8. Payments, tickets, Stripe, billing entitlements, and plan limits are
   deferred.
9. Moderation/reporting should rely on existing public document/thread/comment
   moderation and report paths. Do not add event-specific user-generated
   content in PR469A.
10. Proof should cover public-only filtering, safe empty/error states, safe
   public copy, routeable links, mobile/desktop fit, and no private/internal
   material in responses or UI.

## DAEDALUS Implementation Shape

Expected files:

- `apps/api/src/routes/events.ts` or a tightly scoped equivalent route module.
- `apps/api/src/app.ts` to mount the route if a new router is used.
- `apps/api/src/routes/live-events.test.ts` or an equivalent focused API test.
- `apps/web/app/events/seminars/page.tsx`.
- `apps/web/lib/live-events-route.ts`.
- `apps/web/lib/live-events-route.test.ts`.
- `packages/types/src/live-events.ts` and the package export surface if a
  shared response type is needed.
- Roadmap/status/testing docs for the DAEDALUS handoff.

Implementation requirements:

- Add a public read endpoint such as `GET /events/seminars`.
- Use `optionalAuth` only if needed to preserve existing public/community helper
  signatures, but PR469A output must be public-only.
- Read from `discover_feed` featured items first and resolve each candidate
  through existing visibility checks before returning it.
- Include only routeable public documents, public unhidden active threads, and
  public Spaces.
- Skip unsafe, private, community-only, hidden, removed, unrouteable, or
  unresolved items instead of returning partial internal state.
- Return bounded public errors such as `live_events_unavailable`; do not return
  stack traces or raw database messages.
- Render a real public page at `/events/seminars` with cards, empty state, and
  unavailable state.
- Do not add creation/editing UI, admin curation UI, migrations, realtime
  channels, provider calls, queues, workers, billing, Stripe, RSVP, reminders,
  calendar integrations, or media behavior.

## Required Tests

DAEDALUS should add focused tests proving:

- public seminar readback returns only public, routeable featured document,
  thread, and Space items;
- private, community-only, hidden, removed, unsafe-slug, missing, and
  unrouteable featured items are skipped;
- no owner ids, private source ids, storage paths, private source bodies,
  credentials, prompts, provider payloads, stack traces, visitor identity, or
  private runtime context are returned;
- cards include only public-safe labels, hrefs, timestamps, and discussion
  hrefs when already public;
- the web page copy does not claim live rooms, attendance, RSVP, tickets,
  reminders, recordings, transcripts, or realtime chat;
- empty and unavailable states are bounded and public-safe.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If DAEDALUS reuses an existing broader test file instead of creating
`live-events.test.ts`, the handoff must name the exact command and keep the
coverage focused on PR469A boundaries.

## Hosted Rehearsal Requirement

If DAEDALUS implements PR469A and ARGUS accepts it, MIMIR should route ARIADNE
for hosted proof of:

- `/events/seminars` on desktop and mobile;
- public-only cards and routeable links;
- empty/unavailable states if feasible;
- no visible private/internal material;
- no UI claiming RSVP, tickets, realtime rooms, media, recordings, or live chat.

## Non-Goals

PR469A must not add or claim:

- realtime rooms, WebSockets, SSE room behavior, video, audio, voice,
  livestreaming, recording, or transcript generation;
- attendance, RSVP, registration, reminders, calendar integrations, tickets,
  payments, Stripe, invoices, or plan limits;
- provider calls, persona-to-persona behavior, private chat, private runtime
  context, continuity promotion, memory writeback, or archive import;
- Redis, Cloudflare, workers, queues, new external config, or Developer Agent
  runtime changes;
- broad Discover rebuild, public persona expansion, or generic UI polish.

## ARGUS Validation

This preflight is docs-only. ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

ARGUS accepts PR469 for DAEDALUS as PR469A Public Seminar Readback Bundles.
