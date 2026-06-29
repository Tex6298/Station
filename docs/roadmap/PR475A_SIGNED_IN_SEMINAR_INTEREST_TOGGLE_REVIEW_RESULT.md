# PR475A - Signed-In Seminar Interest Toggle ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted after narrow ARGUS copy patch

## Verdict

ARGUS accepts PR475A after one narrow UI copy patch.

The implementation matches the accepted preflight: signed-in viewers can mark
and withdraw seminar interest, public readback shows aggregate count plus the
current viewer's state, and durable interest is keyed to a server-resolved
public source reference rather than the public `seminar_<digest>` handle.

## Review Findings

Accepted boundaries:

- `GET /events/seminars` remains public.
- Optional auth is used only to compute the current viewer's
  `viewerInterested` state.
- Signed-out responses omit `viewerInterested`.
- Public responses expose aggregate `interestCount` only, not attendee
  identities.
- `POST /events/seminars/:seminarId/interest` and
  `DELETE /events/seminars/:seminarId/interest` require auth.
- The public card digest is validated as a handle, then resolved server-side
  through the current featured public seminar resolver.
- Interest rows persist `user_id`, `source_type`, and `source_id`; they do not
  persist the public digest as the durable target.
- Raw source ids remain server-side and are not serialized in public JSON.
- Withdrawal hard-deletes the viewer's row and removes them from the aggregate.
- Stale, malformed, private, missing, or unrouteable targets fail closed with
  bounded `seminar_not_found` copy.
- Mutation and readback failures return bounded public errors.

Migration/privacy findings:

- `public.public_seminar_interests` is actor-owned, unique on
  `(user_id, source_type, source_id)`, and indexed for aggregate target counts.
- RLS is actor-only for direct table access.
- The table does not add IP, user-agent, cookies, raw auth headers, reminder
  destinations, payment identifiers, attendee-list fields, or anonymous
  visitor identity.

Narrow ARGUS patch:

- Replaced over-private UI copy with aggregate-honest copy:
  - sign-in prompt no longer says "private interest";
  - signed-out helper copy now says names are not shown and saved interest
    contributes only to the aggregate count;
  - safety copy now says interest is an account signal with aggregate count
    only.
- Updated the focused web helper test for the corrected copy.
- No API behavior, migration, persistence contract, auth boundary, or aggregate
  behavior was changed by ARGUS.

Non-scope confirmation:

- No tickets, payments, Stripe, billing entitlements, RSVP/booking guarantee,
  waitlist, calendar integration, reminder delivery, livestream, media room,
  attendee list, event-host management, admin curation UI, provider call,
  persona runtime context, memory writeback, continuity promotion, archive
  import, Redis, Cloudflare, queue, worker, hosted runtime expansion, or broad
  Discover/UI redesign was added.
- Diff-only scope scan hits are expected schema/test/docs/negative-copy
  references.
- Broad token-label scan hits are dummy `owner-token`/`member-token` test
  fixtures and normal `access_token` variable names, not real secrets.

## Validation

ARGUS reran validation after the copy patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 5 tests passed for public routeability, signed-in mark/withdraw, idempotency, viewer-local state, fail-closed targets, and bounded errors. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 3 tests passed after aggregate-honest copy patch. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran successfully. |
| `git diff --check` | Pass | No whitespace errors; line-ending normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive-pattern scan | Pass | No real secrets, payment ids, cookies, raw auth values, visitor identifiers, SQL output, logs, or attendee identity output; dummy token fixtures only. |
| Diff-only scope scan | Pass | Expected schema, test, docs, and negative-copy references only. |

## Residual Risk

Hosted desktop/mobile proof has not run after PR475A. MIMIR should close on the
local review or route ARIADNE for signed-out and signed-in hosted
`/events/seminars` proof, including one mark and one withdrawal on a public
card.

The accepted product shape intentionally exposes an exact aggregate count. That
does not expose attendee identities, but low counts remain visible by design.

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close PR475A or route ARIADNE for hosted visual/interaction proof.
Do not broaden into tickets, payments, Stripe, reminders, calendar integration,
livestream/media rooms, attendee lists, event-host management, provider calls,
queues/workers, Redis, Cloudflare, hosted runtime, or broad UI.
