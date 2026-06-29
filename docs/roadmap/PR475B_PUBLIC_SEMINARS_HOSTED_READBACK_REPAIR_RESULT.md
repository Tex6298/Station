# PR475B - Public Seminars Hosted Readback Repair Result

Owner: DAEDALUS / A2

Date: 2026-06-29

State: `READY_FOR_ARGUS_REVIEW`

## Finding

Hosted web/API were ready at PR475A runtime `46a2a08d`, but public
`GET /events/seminars` returned bounded HTTP `503` with
`live_events_unavailable`.

The PR475A route made public seminar card readback depend on the additive
interest readback query. That meant hosted schema lag or interest-storage
unavailability could block the public cards before the page rendered any
routeable seminar readbacks.

DAEDALUS also checked whether an exact hosted migration apply was available
from this shell. The local environment has staging connection variables, but
this shell lacks `psql`/`supabase`; an exact `061` apply attempt with an
ephemeral `pg` package failed before any database connection because `pg` was
not available to the inline Node process. No broad migration sweep was run.

## Repair

DAEDALUS changed `GET /events/seminars` so interest readback is additive:

- public seminar source resolution still fails closed for unsafe/private
  seminar source rows;
- if the optional `public_seminar_interests` readback query fails, the route
  still returns the current public seminar cards with default aggregate fields;
- signed-out and signed-in GET can render public cards even while interest
  readback storage is unavailable;
- mark/withdraw mutations still require signed-in auth and durable interest
  storage, and still fail bounded if that storage is unavailable.

This avoids fake persistence: the repair does not pretend a mark or withdrawal
succeeded when the interest table is missing.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Public hosted pre-check | Reproduced | API/web `/health/deployment` ready at `46a2a08d`; hosted public `GET /events/seminars` returned bounded HTTP `503`. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 6 tests passed, including the new interest-readback-storage-unavailable regression for signed-out and signed-in GET. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 3 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; line-ending normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Expected test/doc/schema terms only; no secrets, raw config, logs, SQL output, attendee identities, or new out-of-scope product behavior. |

## Residual Risk

ARGUS should still treat hosted interest mutation as a required review point.
This patch restores public card rendering when interest readback storage lags,
but a missing hosted `public.public_seminar_interests` table would still block
mark/withdraw with bounded mutation errors. That is intentional rather than
fake persistence.

After ARGUS accepts the code repair, ARIADNE should rerun the hosted proof on a
fresh deployment and specifically verify:

- signed-out `/events/seminars` renders public cards;
- signed-in `/events/seminars` renders public cards;
- mark interest succeeds on one public card;
- withdraw interest succeeds and removes that viewer from the aggregate.

## Handoff

Wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

Task: review PR475B with focus on public GET resilience, absence of fake
interest persistence, bounded mutation failure behavior, and whether hosted
schema state still needs a separate MIMIR-routed migration apply before ARIADNE
reruns the mark/withdraw proof.
