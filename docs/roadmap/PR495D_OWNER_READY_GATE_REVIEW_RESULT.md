# PR495D - Owner Ready Gate Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495D_OWNER_READY_FOR_PUBLIC_REVIEW_GATE_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495D implementation with one narrow hardening patch.

The shipped slice matches the accepted owner-only preflight:

- `POST /events/seminars/records/:recordId/transition` is authenticated and
  creator-gated;
- the request body is accepted only when it is exactly `{ "status": "draft" }`
  or `{ "status": "ready" }`;
- owner seminar records transition only between private `draft` and private
  `ready`;
- source document ownership, public/published state, and routeable public Space
  state are revalidated before transition;
- the update changes status only and returns the existing safe owner serializer;
- `/studio/publishing` shows bounded private controls/readback:
  `Mark ready for review`, `Ready for review`,
  `Public listing is not live.`, and `Return to draft`;
- public `/events/seminars`, public card ids, public durable-record readback,
  public interest keys, Discover/search/forum behavior, schema/RLS, billing,
  provider runtime, queues/workers, Redis, Cloudflare, scheduling, hosting,
  RSVP, tickets, payments, reminders, live rooms, media, transcripts, and
  launch claims stayed out of scope.

## ARGUS Patch

ARGUS applied a narrow owner-scope/current-state hardening patch in
`apps/api/src/routes/events.ts`:

- the initial transition record lookup now filters by
  `owner_user_id === req.user.id` instead of loading by id and checking owner
  only afterward;
- the update now also filters by `source_type === "document"` and current
  `status in ("draft", "ready")`, so this route cannot cross a future
  `published`, `cancelled`, or non-document state even under an expanded or
  concurrent path.

This patch does not expand behavior. It tightens the accepted PR495D boundary.

## Review Notes

Accepted:

- Non-owner, signed-out, and non-creator transition attempts fail closed.
- Unsupported request bodies, extra fields, `published`, `cancelled`,
  visibility changes, source changes, title/summary changes, public records,
  cancelled records, published records, and non-document source rows are
  rejected with bounded errors.
- Source revalidation rejects private, community, unlisted, draft, archived,
  no-Space, private-Space, unsafe-slug, UUID-slug, and non-owned sources.
- Successful transitions keep the same record id and keep
  `visibility: "private"`.
- Response JSON stays bounded and does not expose raw owner ids, raw source ids,
  raw discussion ids, source bodies, private labels, SQL/storage details,
  provider payloads, tokens, cookies/headers, IP/user-agent values, stack
  traces, or secret-shaped values.
- Public `/events/seminars` and signed-in interest mark/withdraw remain
  source-derived and unchanged.
- New Seminar UI copy stays in private draft/readiness language and makes the
  public listing non-live state explicit.

Residual risk:

- This is local review only. Hosted browser proof must verify real owner UI/API
  behavior, duplicate stability, non-creator/signed-out denial, public
  seminar/interest no-drift, privacy boundaries, and desktop/`375px`/`390px`
  fit before closeout.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Transition ownership, strict body rejection, source revalidation, private visibility lock, UI no-public-claim copy, and public seminar/interest no-drift reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 44 focused tests passed after the ARGUS owner/current-state hardening patch. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran after the patch; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Required Hosted Rehearsal

MIMIR should route ARIADNE for hosted desktop, `375px`, and `390px` proof before
PR495D closeout.

Hosted proof should cover:

- hosted app/API freshness at the accepted implementation/review commit or
  later;
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
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495D as ACCEPT_PR495D_OWNER_READY_FOR_PUBLIC_REVIEW_GATE_IMPLEMENTATION.
- ARGUS applied a narrow API hardening patch so the transition lookup filters by owner_user_id and the update is additionally guarded by source_type=document plus current draft/ready state.
- The implementation remains owner-only: draft to ready and ready to draft, visibility private, no public durable-record readback, no published/public transition, no durable-record interest keys, and no /events/seminars sourcing change.
- Focused tests passed with 44 tests; typecheck, lint, and git diff --check passed.
Task:
- Route ARIADNE for hosted desktop/375px/390px rehearsal of the PR495D owner ready gate.
- Hosted proof should cover owner ready/return-to-draft, duplicate stability, non-creator/signed-out denial, public seminar/interest no-drift, no durable public cards, no private/raw/secret/runtime/scope leak, and mobile fit.
```
