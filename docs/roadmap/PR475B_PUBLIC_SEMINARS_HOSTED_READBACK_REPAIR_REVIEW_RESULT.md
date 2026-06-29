# PR475B - Public Seminars Hosted Readback Repair ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted

## Verdict

ARGUS accepts PR475B.

The repair matches the requested lane: public seminar cards no longer depend on
the additive interest readback query, while signed-in mark/withdraw still
requires durable interest storage and still fails bounded when that storage is
unavailable. The patch does not fake persistence.

## Review Findings

Accepted boundaries:

- `GET /events/seminars` still loads and resolves public seminar cards through
  the existing public source resolver.
- Public source resolution remains outside the fallback and still fails closed
  for private, unsafe, or unrouteable source rows.
- Only `applySeminarInterestReadback` is treated as additive for the list route.
- If interest readback storage is unavailable, signed-out and signed-in GET
  responses still render the public cards with default aggregate fields.
- The fallback omits `viewerInterested` instead of inventing viewer-local state.
- The response does not leak table names, raw source ids, stack traces, or
  storage error text.
- `POST /events/seminars/:seminarId/interest` and
  `DELETE /events/seminars/:seminarId/interest` still require auth.
- Mark and withdraw still write/delete against `public_seminar_interests`; if
  hosted storage is missing, they return bounded `seminar_interest_unavailable`
  rather than pretending the mutation worked.

Migration/schema finding:

- DAEDALUS did not run a broad hosted migration sweep.
- The exact hosted `061` apply attempt was blocked locally before database
  connection by missing local pg/tooling resolution.
- Hosted `public.public_seminar_interests` state is therefore still something
  ARIADNE must prove, not something ARGUS should assume.

Non-scope confirmation:

- No tickets, bookings, payments, Stripe/Billing, reminders, calendar
  integration, livestream/media rooms, attendee lists, event-host management,
  provider calls, queues/workers, Redis, Cloudflare, hosted runtime expansion,
  or broad UI work was added.
- Diff-only sensitive/scope scan hits are expected test fixture/schema terms,
  including dummy `owner-token` strings in tests, not real secrets.

## Validation

ARGUS reran validation on PR475B:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 6 tests passed, including signed-out and signed-in GET resilience when `public_seminar_interests` readback is unavailable. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 3 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from turbo cache. |
| `git diff --check 557adc54..f77b1d43` | Pass | No whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Expected test/schema terms only; no real secrets, raw config, logs, SQL output, attendee identities, or out-of-scope product behavior. |

## Residual Risk

Hosted mark/withdraw still must prove whether
`public.public_seminar_interests` is present on the hosted database. That is the
right remaining risk: public cards should now render even if interest readback
storage lags, but mutations should fail bounded until durable storage exists.

If ARIADNE sees public cards render but mark/withdraw returns bounded
`seminar_interest_unavailable`, the next handoff should wake MIMIR with the
exact hosted schema requirement: apply or verify
`apps/db/migrations/061_public_seminar_interests.sql` on the hosted database,
then rerun the same hosted proof.

## Handoff

Wake ARIADNE:

```text
WAKEUP A4:
Codename: ARIADNE
```

ARIADNE should rerun the hosted PR475A/PR475B proof on a fresh deployment:
signed-out and signed-in `/events/seminars` on desktop and 390px mobile, public
cards render, one public card can be marked, the same interest can be
withdrawn, no extra interest row remains, and no attendee identities, raw
source ids, schema details, or out-of-scope behavior are exposed.
