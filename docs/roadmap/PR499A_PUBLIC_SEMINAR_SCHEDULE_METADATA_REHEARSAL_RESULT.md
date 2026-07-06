# PR499A - Public Seminar Schedule Metadata Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-06

Result:

```text
SCHEDULE_ROUTE_DEFECT
```

## Scope

MIMIR asked ARIADNE to prove hosted PR499A schedule metadata behavior across
deployment freshness, owner schedule set/update/clear, owner-only and tier
gates, durable public list/detail readback, desktop/mobile fit, and privacy/
product-boundary scans.

The rehearsal stopped before schedule mutation because the hosted owner seminar
records route failed for the replay owner.

## Hosted Freshness

Hosted web and API health both reported ready at:

```text
web commit: a8a384c9452e
api commit: a8a384c9452e
```

This satisfies the PR499A freshness requirement of runtime commit `a8a384c9` or
later.

## Auth And Owner Baseline

The replay owner account signed in successfully and reported `canon` tier.

Ordinary owner reads passed:

| Check | Result |
| --- | --- |
| `GET /auth/me` | `200` |
| `GET /documents` | `200` |

Auxiliary replay accounts were also available for later lower-tier/non-owner
checks, but the rehearsal did not reach mutation because the owner seminar
records route failed first.

## Blocking Route

The owner seminar records route failed:

| Check | Result |
| --- | --- |
| `GET /events/seminars/records` as replay owner | `503` |
| Error code | `seminar_records_unavailable` |

The error body was bounded and did not expose raw ids, source fields, private
data, SQL/table details, stack traces, cookies, tokens, or secret-shaped values.

Because this route is the required owner entry point for selecting a seminar
record and confirming migration `071_public_seminar_schedule_metadata.sql`
through hosted behavior, ARIADNE could not safely perform set/update/clear,
publish/rollback, public readback, or browser proof.

## Not Run

The following checks remain unproven on hosted because the owner records route
failed before record selection:

- owner schedule set/update/clear;
- invalid ISO, time zone, duration, and extra-key rejection;
- unauthenticated, lower-tier, and non-owner mutation gates;
- durable public list/detail schedule readback;
- clear/rollback removal from public readback;
- desktop, `375px`, and `390px` owner/public UI pass.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser rehearsal runner | Defect | Hosted web/API fresh and auth baseline passed; owner seminar records returned `503 seminar_records_unavailable`. |
| Hosted API leak scan | Pass | Bounded owner-records error body did not leak private/source/secret/backend detail. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE ran the PR499A hosted public seminar schedule metadata rehearsal.
- Hosted web/API were fresh at a8a384c9452e.
- Replay owner sign-in, /auth/me, and /documents passed, but GET /events/seminars/records returned 503 seminar_records_unavailable.
- No schedule mutation, public readback, or browser/mobile proof could run because the owner seminar records route failed before record selection.
Next:
- Route SCHEDULE_ROUTE_DEFECT to DAEDALUS or resolve hosted route/migration availability, then wake ARIADNE for a rerun.
```
