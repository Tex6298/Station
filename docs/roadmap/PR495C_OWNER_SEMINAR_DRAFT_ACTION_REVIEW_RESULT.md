# PR495C - Owner Seminar Draft Action Review Result

Date: 2026-07-05

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495C_OWNER_SEMINAR_DRAFT_ACTION_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495C implementation with one narrow review patch.

The shipped slice matches the accepted web-only preflight:

- `/studio/publishing` loads owner seminar records through
  `GET /events/seminars/records`;
- existing private drafts match ready candidates by `publicDocumentHref`;
- create/restore derives the source document id from already-loaded owner
  documents and routeable public document hrefs;
- create/restore posts exactly `{ sourceType: "document", sourceId }` to
  `POST /events/seminars/records`;
- success upserts returned owner records into local readback state and swaps the
  visible action to bounded `Private draft saved` copy;
- panel-local failures use bounded unavailable copy;
- no API route, migration, DB type, public seminar card sourcing, public
  interest behavior, Discover/search/forum surface, billing, provider runtime,
  queue/worker, Redis, Cloudflare, schedule, host, publish, RSVP, ticket,
  payment, reminder, live room, media, transcript, or launch scope changed.

## ARGUS Patch

ARGUS patched the UI entitlement guard so the seminar draft action matches the
accepted API gate.

Patch details:

- `apps/web/components/studio/publishing-dashboard.tsx`
  - import `hasTier` from `@station/auth`;
  - add separate `seminarDraftAllowed` state;
  - set it with `hasTier(session.user, "creator")`;
  - use it for the seminar draft action and create guard instead of
    `canPublishDocuments`.
- `apps/web/lib/seminar-host-readiness.test.ts`
  - assert that the Seminar draft action is wired to `hasTier(..., "creator")`.

Why:

- `canPublishDocuments` grants admins, but PR495B's accepted API create gate is
  `requireTier("creator")`;
- a lower-tier admin should not see a Seminar draft action that the API will
  reject;
- non-creator users now get the bounded `Creator required` state instead of a
  broken action.

This is a review-hardening patch, not a scope expansion.

## Review Notes

Accepted:

- Source ids are used only for the POST body and are derived from already-loaded
  owner documents; they are not rendered as separate copy.
- Existing record matching uses the safe `publicDocumentHref` response field,
  not raw source ids.
- The POST body stays source-only and does not send title, summary, status,
  visibility, owner id, discussion id, public route, source body, or private
  labels.
- Visible Seminar copy stays in the private draft/readback vocabulary and does
  not claim scheduling, hosting, public publishing, RSVP, ticketing, reminders,
  runtime, queues, Redis, Cloudflare, or launch readiness.
- The changed UI uses existing wrapping button/row patterns, so hosted mobile
  rehearsal should verify fit rather than requiring another local layout patch.
- Public `/events/seminars`, signed-in interest behavior, Discover, public
  search, forums, API, schema, and runtime surfaces did not change.

Residual risk:

- This is local review only. Hosted browser proof must verify that a real owner
  can see the draft action, create a private draft, see stable duplicate
  readback, and preserve mobile fit on desktop, `375px`, and `390px`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Source-id derivation, public-href matching, source-only POST body, creator-tier UI gate, panel-local bounded errors, visible copy, forbidden scope, and public seminar/interest no-drift reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/api/src/routes/live-events.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 39 focused tests passed after the ARGUS tier-gate patch. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck passed after the patch. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Required Hosted Rehearsal

MIMIR should route ARIADNE for hosted desktop, `375px`, and `390px` proof before
closeout.

Hosted proof should cover:

- hosted app/API freshness at the implementation/review commit or later;
- owner `/studio` to `/studio/publishing` flow;
- creator owner sees a ready candidate with a real draft action;
- create draft succeeds and updates readback to private draft state;
- duplicate action/click is stable and idempotent;
- non-creator or signed-out users cannot create owner drafts;
- public `/events/seminars` and interest mark/withdraw do not drift;
- no raw owner/source/discussion id, source body, private label, SQL, storage
  path, provider payload, token, cookie/header, IP/user-agent value, stack
  trace, secret-shaped value, ticket, payment, RSVP, attendee, reminder, room,
  media, transcript, provider, queue, Redis, Cloudflare, billing, host,
  schedule, public publish, or launch claim leaks;
- no desktop, `375px`, or `390px` fit defect.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495C as ACCEPT_PR495C_OWNER_SEMINAR_DRAFT_ACTION_IMPLEMENTATION.
- ARGUS applied one narrow tier-gate patch so Seminar draft create UI uses hasTier(session.user, "creator"), matching the accepted API requireTier("creator") gate.
- The implementation stayed web-only and preserved public /events/seminars plus interest no-drift.
- Focused tests, typecheck, lint, and git diff --check passed.
Task:
- Route ARIADNE for hosted desktop/375px/390px rehearsal of /studio/publishing Seminar draft action/readback.
- Hosted proof should cover owner create/readback, duplicate stability, non-creator/signed-out denial, public seminar/interest no-drift, no private/raw/secret/runtime/scope leak, and mobile fit.
```
