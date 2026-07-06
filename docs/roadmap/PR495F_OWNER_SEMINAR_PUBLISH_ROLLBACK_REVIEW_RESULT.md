# PR495F - Owner Seminar Publish/Rollback Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495F_OWNER_PUBLISH_ROLLBACK_GATE_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495F implementation with one narrow stability patch.

The implementation matches the accepted owner-only publish/rollback lane:

- `POST /events/seminars/records/:recordId/transition` remains authenticated,
  creator-gated, owner-scoped, and strict-body-only;
- `ready` + `private` publishes to `published` + `public`;
- `published` + `public` rolls back to `ready` + `private`;
- publish revalidates owner/source authority, public/published source state,
  public Space routeability, and PR495E serializer compatibility;
- rollback does not require source routeability because it reduces public
  eligibility;
- `/studio/publishing` shows owner publish/rollback controls with public-listing
  pending/not-live copy;
- public `/events/seminars` and public interest routes remain source-derived
  and unwired from durable records;
- migrations/RLS/schema, `public.public_seminar_interests`, Discover/search/
  forum behavior, scheduling, hosting, RSVP, tickets, payments, reminders,
  rooms, media, transcripts, provider runtime, queues/workers, Redis,
  Cloudflare, billing, and launch claims stayed out of scope.

## ARGUS Patch

ARGUS patched the transition state machine to preserve duplicate/self-transition
stability:

- `draft` + `private` to `draft` + `private` is accepted as a no-op state
  transition;
- `ready` + `private` to `ready` + `private` is accepted as a no-op state
  transition;
- `published` + `public` to `published` + `public` is accepted when the source
  and PR495E durable serializer still validate;
- tests now prove duplicate publish and duplicate rollback remain stable.

Why:

- PR495D hosted proof accepted duplicate ready stability;
- PR495F hosted proof explicitly requires duplicate publish/rollback stability;
- rejecting self transitions would make harmless retries look like product
  errors and would weaken the owner flow.

This patch does not expand public readback. It only makes accepted owner
transitions retry-safe.

## Review Notes

Accepted:

- Signed-out, non-creator, and non-owner publish/rollback fail closed.
- Publish validates source ownership, public/published state, routeable public
  Space, and durable serializer compatibility before setting public eligibility.
- Rollback succeeds even if the source has become private or unroutable.
- Unsupported states, malformed bodies, client-supplied visibility/source/title/
  summary/discussion/owner fields, cancelled records, non-document records, and
  direct draft-to-published or published-to-draft transitions are rejected.
- Response JSON stays bounded and does not expose raw owner/source/record/
  discussion ids, source bodies, private labels, SQL/storage details, provider
  payloads, tokens, cookies/headers, IP/user-agent values, stack traces, or
  secret-shaped values.
- Public `/events/seminars` still ignores durable records after publish.
- Public interest mark/withdraw still resolves only source-derived public cards.
- Owner UI copy says the public listing is pending or not live yet.

Residual risk:

- This is local review only. Hosted browser proof must verify owner publish,
  duplicate publish, rollback, duplicate rollback, creator/signed-out gates,
  public route no-drift, interest no-drift, no durable public card yet, privacy
  boundaries, and desktop/`375px`/`390px` fit before closeout.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Transition semantics, source revalidation, serializer compatibility, rollback without source routeability, owner UI copy, and public route/interest no-drift reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 33 focused API/public-route/auth tests passed after the ARGUS duplicate-stability patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts` | Pass | 20 focused publishing/seminar readiness tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran after the patch; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Required Hosted Rehearsal

MIMIR should route ARIADNE for hosted desktop, `375px`, and `390px` proof before
PR495F closeout.

Hosted proof should cover:

- hosted app/API freshness at the accepted implementation/review commit or
  later;
- owner `/studio` to `/studio/publishing` flow;
- creator owner creates or uses a private ready seminar record;
- owner publishes the record and sees pending public-listing readback;
- duplicate publish is stable;
- owner rolls the record back to ready/private;
- duplicate rollback is stable;
- non-creator and signed-out users cannot publish or rollback;
- public `/events/seminars` and signed-in interest mark/withdraw do not drift;
- no durable seminar record appears as a public card yet;
- no raw/private/secret/runtime/scope leak;
- no desktop, `375px`, or `390px` fit defect.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495F as ACCEPT_PR495F_OWNER_PUBLISH_ROLLBACK_GATE_IMPLEMENTATION.
- ARGUS applied a narrow duplicate-stability patch so accepted self transitions remain retry-safe, including duplicate publish when the source/serializer still validate and duplicate rollback after returning to ready/private.
- The implementation remains owner-only: ready/private to published/public and published/public back to ready/private, with public /events/seminars and interest routes still unwired from durable records.
- API/public/auth tests passed with 33 tests; publishing/seminar tests passed with 20 tests; typecheck, lint, and git diff --check passed.
Task:
- Route ARIADNE for hosted desktop/375px/390px rehearsal of PR495F.
- Hosted proof should cover owner publish, duplicate publish, rollback, duplicate rollback, non-creator/signed-out denial, public seminar/interest no-drift, no durable public card yet, no private/raw/secret/runtime/scope leak, and mobile fit.
```
