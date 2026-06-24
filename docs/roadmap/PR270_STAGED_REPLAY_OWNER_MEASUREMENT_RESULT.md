# PR270 - Staged Replay Owner Measurement Result

Owner: A2 / DAEDALUS

Reviewer: A3 / ARGUS

Date: 2026-06-24

Status: accepted by ARGUS

## Boundary

This was a hosted evidence refresh against the live Railway web/API using the
local replay-owner environment. It did not change product code, start Stripe
Checkout, seed or mutate staged replay data, ingest Developer Space events, or
record private payloads.

The probe used local `STATION_REPLAY_OWNER_*` values only inside the shell
process. The committed evidence below records statuses, counts, booleans,
public route URLs, public Railway identity, and timing buckets only. It does not
record credentials, bearer tokens, cookies, private text, prompts, completions,
provider payload bodies, trace bodies, hosted logs, raw database ids, customer
ids, subscription ids, import ids, export ids, persona ids, or Developer Space
ids.

## Deployment Identity

| Target | Result | Sanitized identity |
| --- | --- | --- |
| API `/health` | HTTP 200, `ok:true` | `stationapi-production` |
| Web `/health` | HTTP 200, `ok:true` | `stationweb-production` |
| API `/health/deployment` | HTTP 200, `ready:true` | branch `main`, repo `Tex6298/Station`, service `@station/api`, environment `production`, commit prefix `c2cf0cb48ca7` |
| Web `/health/deployment` | HTTP 200, `ready:true` | branch `main`, repo `Tex6298/Station`, service `@station/web`, environment `production`, commit prefix `c2cf0cb48ca7` |

## Owner Auth

| Check | Result | Evidence recorded |
| --- | --- | --- |
| Local replay owner env presence | Pass | Email, password, owner id, and username variables were present; values were not printed or committed. |
| `POST /auth/signin` | HTTP 200 | Session token returned; token was not printed or committed. |
| `GET /auth/me` | HTTP 200 | Configured owner id matched, email was present, tier was `canon`, admin flag was `false`. |
| Unauthenticated `GET /observability/replay-readiness` | HTTP 401 | Auth boundary remains in place. |

## Route Matrix

| Route | Result | Sanitized details |
| --- | --- | --- |
| Web `/developer` | HTTP 307 | `Location: https://stationweb-production.up.railway.app/developer-spaces` |
| Web `/developer-spaces` | HTTP 200 | Public route loads. |
| Web `/developer-spaces/station-replay-dev-alpha` | HTTP 200 | Public replay Developer Space route loads. |
| API `/developer-spaces/station-replay-dev-alpha` public | HTTP 200 | Access `public`, visibility `public`. |
| API `/developer-spaces/station-replay-dev-alpha` authenticated | HTTP 200 | Access `owner`, visibility `public`; 3 nodes, 1 event, 0 snapshots. |
| API `/observability/replay-readiness` authenticated | HTTP 200 | `prep_only`; 7 measurement points, 5 setup proofs, 6 setup blockers, 8 capture surfaces. |
| API `/background-jobs` authenticated | HTTP 200 | 19 jobs: 18 completed, 1 failed; 4 inactive follow-up kinds. |
| API `/billing/me` authenticated | HTTP 200 | Tier `canon`, subscription status `active`; customer/subscription records present without ids. |

## Data Presence Matrix

| Area | Result | Sanitized readback |
| --- | --- | --- |
| Personas | Present | 3 owned personas returned; one owned persona was selected internally for replay-safe checks without recording its id or name. |
| Memory briefing | Present | 10 active memories, 0 shared owner blocks, 3 lifecycle status kinds, 3 trust status kinds, 1 edge kind. |
| Memory graph | Present | 16 graph nodes, 1 graph edge. |
| Context preview | Present | HTTP 200; 10 top-level context keys, 15 sources, 0 skipped sources. No context body was recorded. |
| Archive/import | Present | 7 jobs: 6 completed, 1 failed; 3 file jobs, 4 chat jobs. Safe status readback returned HTTP 200 for a completed job. |
| Export packages | Present | 5 persona archive exports, all completed. Safe export readback returned HTTP 200 with 11 included sections, 11 manifest keys, and owner-only Markdown present. Manifest content was not recorded. |
| Developer Space | Present | Public and owner detail routes passed; usage route passed with 8 sections; Developer Space export list had 1 completed package. |
| Observability | Present | 7-day summary had 9 traces, 0 failures, 21,538 total tokens, 2.3383 pence estimated cost, 10,220 ms average latency. Trace list returned 6 completed conversation traces. No trace ids, payloads, prompts, completions, or event bodies were recorded. |
| Billing | Present | `/billing/me` returned tier and active subscription status only; no Checkout or portal action was started. |

## Timing Buckets

The probe recorded coarse latency buckets only:

- Public health and public web route checks mostly returned in `250-749ms`.
- Sign-in returned in `750-1499ms`.
- Owner readbacks ranged from `750-1499ms` to `1500-2999ms`.
- API deployment readiness returned in `>=3000ms` but still completed with
  `ready:true`.

## Validation

No product code changed.

| Check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass, 16 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass, 9 tests. |
| `git diff --check` | Pass; CRLF normalization warnings only for touched docs. |
| `git diff --cached --check` | Pass. |

## Recommendation

Open ARIADNE human-eye replay rehearsal after ARGUS reviews this evidence.

Reasoning:

- Hosted deployment identity is fresh and ready for both web and API.
- Owner auth/session, public routes, protected owner routes, Memory, Archive,
  Export, Observability, Developer Space, and Billing readbacks are all
  routeable with replay data present.
- The remaining question is product judgement and replay quality, not a
  concrete DAEDALUS implementation blocker.

ARGUS should review this packet for evidence quality, owner-scope claims,
secret/raw-id hygiene, and whether the single historical failed job should be
called out as rehearsal context rather than implementation work.

## ARGUS Verdict

Accepted on 2026-06-24 with no product-code patch.

Findings:

- The packet matches PR270's lane: hosted owner-route measurement only, not
  implementation.
- Evidence is bounded to statuses, counts, booleans, public Railway identity,
  public route URLs, and coarse timing buckets.
- Owner auth and route claims are appropriately scoped: the result says the
  local configured owner id matched without recording that id, token, cookie,
  email value, persona id, import id, export id, customer id, subscription id,
  or Developer Space id.
- Secret/raw-id hygiene is acceptable. ARGUS's added-line scan found no
  credential-like values, email addresses, credentialed URLs, or UUID-shaped
  ids in the PR270 diff.
- The single historical failed background job is called out as rehearsal
  context inside a bounded count, not as a new implementation blocker.
- The recommendation is honest: open ARIADNE human-eye replay rehearsal because
  hosted surfaces are technically routeable and data-backed, while the next
  question is product/replay quality.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:health` passed, 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed, 9 tests.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Added-line secret/raw-id/email/credentialed-URL scan over the PR270 diff
  found no matches.

Recommendation:

- MIMIR should open ARIADNE human-eye replay rehearsal using this measurement
  packet as context.
