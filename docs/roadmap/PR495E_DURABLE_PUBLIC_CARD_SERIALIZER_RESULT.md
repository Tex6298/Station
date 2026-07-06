# PR495E - Durable Public Card Serializer Contract Result

Date: 2026-07-06

Owner: DAEDALUS / A2

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the accepted PR495E contract-only slice:

- added a server-side durable public seminar record serializer helper;
- added deterministic durable card ids using
  `seminar_<sha256("station.public-seminar-record:v1:" + record.id).slice(0, 16)>`;
- kept durable cards source-derived internally as `document:<source document id>`;
- added a pure merge/dedupe helper where durable document cards win over
  source-derived document cards for the same source while thread and Space cards
  keep their slots;
- tightened owner/durable seminar text redaction for cookie, authorization,
  token, secret, password, source/user/discussion id, IP, UUID, and stack-trace
  shaped values;
- added focused API/static tests for eligible and ineligible durable rows,
  public discussion link safety, merge/dedupe behavior, current public route
  no-drift, source-derived interest behavior, and bounded storage failures.

## Files Touched

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/lib/live-events-route.test.ts`
- `docs/roadmap/PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Deliberate Non-Changes

This implementation did not enable durable records in public
`GET /events/seminars`.

This implementation did not change:

- public interest mark/withdraw behavior;
- `PublicSeminarsResponse.source`, which remains `discover_feed_featured`;
- owner publish/rollback APIs or controls;
- `/studio/publishing` UI behavior;
- Supabase migrations, schema, RLS, or `public_seminar_interests`;
- public route copy claims for hosting, scheduling, RSVP, tickets, payments,
  reminders, rooms, streams, recordings, transcripts, provider runtime,
  launch readiness, or delivery guarantees;
- runtime, provider, queue/worker, Redis, Cloudflare, billing, archive/import,
  persona runtime, or broad UI shell behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 31 focused tests passed, including durable serializer, no-drift, public copy, and auth route guards. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts` | Pass | 20 focused publishing/seminar readiness tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; Git reported CRLF normalization warnings only. |

## ARGUS Review Ask

Review the helper contract and tests for:

- whether durable cards can leak record, owner, source, or unsafe private
  fields;
- whether merge/dedupe preserves current source-derived ordering semantics;
- whether interest remains `document:<source id>` only;
- whether public `/events/seminars` and interest routes remain unwired from
  durable records;
- whether static no-drift coverage is strong enough before any later public
  readback lane.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the PR495E durable public card serializer contract only.
- Public /events/seminars and public interest routes remain source-derived and unwired from durable records.
- Focused tests, typecheck, lint, and git diff check pass.
Risk:
- Review serializer redaction, discussion href safety, merge/dedupe slot behavior, and static no-drift coverage.
Task:
- Review PR495E and either wake MIMIR with acceptance or wake DAEDALUS with required fixes.
```
