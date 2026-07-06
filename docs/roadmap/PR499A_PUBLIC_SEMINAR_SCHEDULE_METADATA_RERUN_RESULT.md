# PR499A - Public Seminar Schedule Metadata Hosted Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-06

Result:

```text
PASS_PR499A_HOSTED_SEMINAR_SCHEDULE_CLOSEOUT
```

## Scope

MIMIR asked ARIADNE to rerun hosted PR499A schedule metadata proof after PR499B
applied hosted migration 071 and restored the owner seminar records route.

The rerun checked:

- hosted deployment freshness;
- owner seminar records route readiness;
- schedule set/update/clear;
- unauthenticated, lower-tier, and non-owner mutation boundaries;
- invalid schedule body rejection;
- ready, publish, duplicate publish, rollback, and duplicate rollback behavior;
- durable public list/detail readback;
- clear/rollback removal from public readback;
- desktop, `375px`, and `390px` owner/list/detail fit;
- API and visible UI privacy/product-boundary scans.

## Hosted Freshness

Hosted web and API health both reported ready at:

```text
web commit: a8a384c9452e
api commit: a8a384c9452e
```

This satisfies the PR499A freshness requirement of runtime commit `a8a384c9` or
later.

## Owner Route Readiness

Replay owner auth and ordinary owner reads passed:

| Check | Result |
| --- | --- |
| Replay owner sign-in | `200`, tier `canon` |
| `GET /auth/me` | `200` |
| `GET /documents` | `200` |
| `GET /events/seminars/records` | `200`, record count `2` |

ARIADNE selected a draft/private routeable owner seminar record and restored it
to draft/private with no schedule metadata after the proof.

## Schedule Mutation

Owner schedule metadata passed:

| Check | Result |
| --- | --- |
| Set schedule | `200`, stayed draft/private, stored `Europe/London`, `75` minutes |
| Update schedule | `200`, stayed draft/private, stored `America/New_York`, `45` minutes |
| Clear schedule | `200`, stayed draft/private, schedule `null` |
| Set before publish | `200`, stayed draft/private |

Invalid body checks passed with bounded `400 seminar_record_invalid_schedule`
for invalid ISO instant, invalid time zone, invalid duration, and extra keys.

Mutation boundaries passed:

| Probe | Result |
| --- | --- |
| Signed-out owner records list | `401` |
| Signed-out schedule patch | `401` |
| Lower-tier schedule patch | `403` |
| Non-owner lower-tier schedule patch | `403` |

The available non-owner replay accounts were lower-tier, so the non-owner probe
proved fail-closed tier gating before owner lookup rather than a creator-tier
non-owner `404`.

## Publish And Public Readback

Owner readiness/publish semantics passed:

| Check | Result |
| --- | --- |
| Ready | `200` |
| Duplicate ready | `200` |
| Publish | `200` |
| Duplicate publish | `200` |
| Rollback to ready/private | `200` |
| Duplicate rollback | `200` |

Public readback passed:

| Check | Result |
| --- | --- |
| Source-derived public cards | `3`, all `schedule: null` |
| Durable public list readback | `200`, digest-shaped seminar id, stored schedule shown |
| Durable public detail readback | `200`, same serialized schedule shown |
| Clear while published | Detail stayed `200`, schedule became `null` |
| Rollback/private stale detail | `404 seminar_not_found` |

The scheduled durable readback used:

```text
startsAt: 2026-08-21T18:30:00.000Z
timeZone: Europe/London
durationMinutes: 60
```

## Desktop And Mobile

ARIADNE captured owner publishing, public seminar list, and public seminar
detail screenshots on desktop, `375px`, and `390px`.

Result:

- owner schedule controls rendered only inside the existing Seminar readiness
  panel;
- owner/list/detail pages had no measured horizontal overflow;
- controls and labels were readable on desktop, `375px`, and `390px`;
- public list/detail schedule copy read as stored metadata, not event delivery;
- no clipped controls, incoherent overlap, or broken visible tap targets were
  found.

## Privacy And Product Boundary

API and visible UI scans passed:

- no raw durable seminar ids, owner ids, source id fields, private/source
  bodies, storage paths, provider/runtime payloads, stack traces, SQL/table
  detail, cookies, tokens, API keys, or secret-shaped values were exposed;
- visible UI made no positive claims for RSVP, booking, tickets, payments,
  reminders, calendar invites, email/push, attendance lists, live rooms,
  streams, recordings, transcripts, queues, workers, Redis, Cloudflare,
  provider runtime, public launch, partner launch, or delivery guarantees;
- negative interest disclaimers remained non-claiming and bounded.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser rerun runner | Pass | 20 checks passed; no failed checks or caveats. |
| Screenshot inspection | Pass | Desktop, `375px`, and `390px` owner/list/detail views fit without visible privacy/scope drift. |
| Hosted API leak/scope scan | Pass | Public JSON and visible UI stayed bounded. |
| Cleanup verification | Pass | Selected hosted record was restored to draft/private with no schedule metadata. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed the PR499A hosted schedule metadata rerun after PR499B.
- Hosted web/API were fresh at a8a384c9452e.
- Owner route readiness passed: GET /events/seminars/records returned 200 with record count 2.
- Schedule set/update/clear, invalid-body rejection, unauthenticated/lower-tier/non-owner gates, ready/publish/duplicate/rollback semantics, durable public list/detail schedule readback, clear/rollback removal, desktop/375px/390px fit, and privacy/product-boundary scans all passed.
- The selected hosted record was restored to draft/private with no schedule metadata.
Next:
- Close PR499A/PR499B or proceed according to roadmap ownership.
```
