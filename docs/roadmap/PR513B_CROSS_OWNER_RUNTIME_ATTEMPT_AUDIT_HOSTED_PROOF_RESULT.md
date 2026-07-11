# PR513B - Cross-Owner Runtime Attempt Audit Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
FAIL_PR513B_AUDIT_LEDGER_BOUNDARY
```

## Scope

ARIADNE ran the hosted migration/API/data proof requested in:

`docs/roadmap/PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids,
persona ids, private prompts, private profile values, provider payloads,
generated words, SQL details, stack traces, browser storage, bearer values, or
secret-shaped strings.

## Verdict

PR513B fails the hosted audit-ledger boundary.

Most hosted checks passed: web/API freshness, migration `078`, table/RPC/RLS
shape, participant readback, signed-out/nonparticipant fail-closed behavior, RPC
metadata validation, generic `executable: false` consent readback, no-drift,
cleanup, and privacy all passed.

The blocker is the append-only update boundary. Hosted has the append-only
delete trigger, and direct delete is rejected, but the append-only update
trigger is absent and a direct update statement against a proof attempt row
succeeded. This means hosted runtime attempt rows are not fully append-only.

## Root Finding

The hosted trigger names appear to collide after PostgreSQL identifier
truncation. The migration creates these long trigger names:

```text
trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
```

Hosted inspection found only one user trigger:

```text
trg_persona_encounter_cross_owner_runtime_attempts_append_only_
```

That trigger is `BEFORE DELETE`. There is no active `BEFORE UPDATE` trigger on
`persona_encounter_cross_owner_runtime_attempts`.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `6201109357bb` |
| Hosted web includes PR513A review floor `62011093` | Pass |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `6201109357bb` |
| Hosted API includes PR513A review floor `62011093` | Pass |

## Migration And Shape

| Check | Result |
| --- | --- |
| Hosted migration `078` ledger row | Present |
| Migration name | `078_persona_encounter_cross_owner_runtime_attempts` |
| Migration created by | `mimir` |
| Attempts table present | Pass |
| Record RPC present | Pass |
| Record RPC security invoker | Pass |
| Append-only trigger function present | Pass |
| Append-only trigger function security invoker | Pass |
| RLS enabled | Pass |
| Participant SELECT policy | Pass |
| Direct mutation policies absent | Pass |
| Public policy absent | Pass |
| Append-only update trigger | Fail |
| Append-only delete trigger | Pass |

The participant SELECT policy exists under PostgreSQL's truncated identifier:
`persona_encounter_cross_owner_runtime_attempts_select_participa`.

## Auth And Fixtures

| Check | Result |
| --- | --- |
| Owner A sign-in | `200` |
| Owner A `/auth/me` | `200` |
| Owner A tier | `canon` |
| Owner B sign-in | `200` |
| Owner B `/auth/me` | `200` |
| Owner B tier | `private` |
| Nonparticipant sign-in | `200` |
| Nonparticipant `/auth/me` | `200` |
| Nonparticipant tier | `canon` |
| Candidate sign-ins | `5` |
| Owner A persona fixture | Existing persona present |
| Owner B persona fixture | Existing private persona reused |
| Nonparticipant auth fixture | Ready |

## Attempt Readback

| Check | Result |
| --- | --- |
| Owner A create consent | `201` |
| Owner B approve consent | `200` |
| Runtime attempt rows recorded | `2` |
| Blocked lifecycle row | `blocked_before_provider` |
| Provider lifecycle row | `provider_failed` |
| Append-only update rejected | Fail |
| Append-only delete rejected | Pass |
| Signed-out readback | `401` |
| Owner A readback | `200`, `2` attempts |
| Owner A participant role | `requester` |
| Owner A latest lifecycle | `provider_failed` |
| Owner A completed timestamp present | Pass |
| Owner A metadata-only provenance | Pass |
| Owner A requested scopes executable | `false` |
| Owner A consent executable | `false` |
| Owner A readback safe | Pass |
| Owner B readback | `200`, `2` attempts |
| Owner B participant role | `counterparty` |
| Owner B readback safe | Pass |
| Nonparticipant readback | `404` |

The runtime-attempt route correctly exposes bounded participant-only metadata,
but the DB append-only update trigger is missing on hosted.

## RPC Validation

| Check | Result |
| --- | --- |
| Mismatched consent status rejected | Pass |
| Mismatched scope version rejected | Pass |
| Provider lifecycle without ready state rejected | Pass |
| Pending consent fixture create | `201` |
| Provider lifecycle on pending consent rejected | Pass |
| Provider lifecycle on wrong scope rejected | Pass |
| Main attempt count unchanged by rejected RPC calls | Pass |

The RPC audit-honesty patch behaves correctly on hosted.

## Generic Consent Readback

| Check | Result |
| --- | --- |
| Generic consent detail | `200` |
| Ledger executable | `false` |
| Requested scopes executable | `false` |
| Raw id boundary safe | Pass |

Generic consent readback still does not grant runtime permission.

## No Drift

Public/API/page samples did not surface proof consent ids, proof attempt ids, or
runtime-attempt internals. The proof checked Discover search, Discover feed
tabs, public encounter exhibits, forum categories, and public web pages for
Discover, forums, writing, and encounters.

| Check | Result |
| --- | --- |
| Private encounter sessions created | `0` |
| Public encounter exhibits created | `0` |
| Moderation reports created | `0` |
| Token transactions created | `0` |
| Token usage touched | `0` |
| Memory items created | `0` |
| Canon items created | `0` |
| Archive transcripts created | `0` |
| Continuity records created | `0` |
| Export packages created | `0` |
| Storage usage touched | `0` |
| Storage objects created | `0` |
| Background jobs table | Not present |
| Forbidden side effects | None |
| Public sample count | `10` |
| Public no-drift | Pass |

## Cleanup

The final proof run created three consent rows and left all of them inactive:

| Status | Count |
| --- | --- |
| Revoked | `2` |
| Cancelled | `1` |
| Rejected | `0` |
| Pending | `0` |
| Approved | `0` |

Two bounded attempt rows remain attached to the inactive proof consent. No active
proof consent remained.

## Privacy

Sanitized proof output exposed no raw owner ids, raw persona ids, persona names
in attempt readback, session tokens, cookies, bearer values, private prompts,
private profile values, generated words, provider payloads, SQL details, stack
traces, browser storage, env values, or secret-shaped strings.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/data proof runner | Fail | Hosted update append-only trigger is absent and a direct update statement against a proof attempt row succeeded. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `6201109357bb`, which includes PR513A review floor `62011093`. |
| Hosted migration `078` | Pass | Ledger row present; attempts table present; record RPC and trigger function present and security invoker; RLS enabled; participant SELECT policy present. |
| Append-only boundary | Fail | Delete trigger exists and direct delete is rejected; update trigger is absent and direct update is not rejected. |
| Participant route readback | Pass | Owner A and owner B received bounded metadata-only attempt readback; signed-out returned `401`; nonparticipant returned `404`. |
| RPC validation | Pass | Mismatched consent status/scope version and invalid provider lifecycle rows were rejected without adding attempts. |
| Generic consent readback | Pass | Ledger and requested scopes stayed `executable: false`. |
| No-drift checks | Pass | No provider/generated/token/private-session/public-exhibit/report/memory/canon/archive/continuity/export/job/storage/public-surface drift appeared. |
| Cleanup verification | Pass | Three proof consents were left inactive; no pending or approved proof consent remained. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, tokens, cookies, persona names in attempt readback, private prompts, private profile values, generated words, provider payloads, SQL details, stack traces, env values, browser artifacts, or secret-shaped strings. |

`pnpm typecheck` was not run because the PR513B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR513B hosted audit-ledger proof.
- Hosted freshness, migration/table/RPC/RLS/policy shape, participant readback, RPC validation, generic executable:false readback, no-drift, cleanup, and privacy passed.
- The hosted append-only update trigger is missing; direct update against a proof attempt row succeeded.
Verdict:
- FAIL_PR513B_AUDIT_LEDGER_BOUNDARY
Task:
- Route a narrow repair for migration 078 trigger-name collision so update and delete append-only triggers both exist and fire on hosted.
```
