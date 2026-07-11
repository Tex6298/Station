# PR513D - Cross-Owner Runtime Attempt Audit Hosted Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN
```

## Scope

ARIADNE reran the hosted audit proof requested in:

`docs/roadmap/PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN_ARIADNE.md`

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

PR513D passes. Hosted migration `079` is present, the short update/delete
append-only triggers both exist and call the mutation blocker, direct hosted
update and delete attempts against proof attempt rows are rejected, participant
readback remains bounded for owner A and owner B, signed-out/nonparticipant
probes fail closed, generic consent readback remains `executable: false`,
cleanup left no active proof consent, no drift appeared, and privacy passed.

Hosted web/API are at commit prefix `b3dd4ff35998`, which includes the PR513C
implementation commit and the PR513A runtime floor. The docs-only PR513C review
floor is not in the deployment identity, but deploy-equivalent runtime freshness
is proven by the hosted `079` migration ledger and repaired trigger behavior.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `b3dd4ff35998` |
| Hosted web includes runtime floor `62011093` | Pass |
| Hosted web includes docs-only PR513C review floor `44473fe2` | No |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `b3dd4ff35998` |
| Hosted API includes runtime floor `62011093` | Pass |
| Hosted API includes docs-only PR513C review floor `44473fe2` | No |
| Deploy-equivalent runtime freshness | Pass |

## Migration And Shape

| Check | Result |
| --- | --- |
| Hosted migration `079` ledger row | Present |
| Migration name | `079_persona_encounter_runtime_attempt_trigger_repair` |
| Migration created by | `mimir` |
| Attempts table present | Pass |
| Record RPC present | Pass |
| Record RPC security invoker | Pass |
| Append-only trigger function present | Pass |
| Append-only trigger function security invoker | Pass |
| RLS enabled | Pass |
| Participant SELECT policy | Pass |
| Direct mutation policies absent | Pass |
| Short update trigger `pe_co_rt_attempts_no_update` | Pass |
| Short delete trigger `pe_co_rt_attempts_no_delete` | Pass |
| Update trigger calls mutation blocker | Pass |
| Delete trigger calls mutation blocker | Pass |
| Old truncated trigger absent | Pass |

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
| Append-only update rejected | Pass |
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

The rerun proves the PR513B blocker is repaired on hosted.

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

The RPC audit-honesty patch still behaves correctly on hosted.

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

The proof run created three consent rows and left all of them inactive:

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
| Temporary hosted API/data proof runner | Pass | Reran the PR513B proof after migration `079`; update/delete append-only triggers both rejected direct mutation attempts. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `b3dd4ff35998`, and deploy-equivalent freshness was proven by hosted migration `079` and trigger behavior. |
| Hosted migration `079` | Pass | Ledger row present; short update/delete triggers present; both call the mutation blocker; old truncated trigger absent. |
| Append-only boundary | Pass | Direct update and direct delete statements against proof attempt rows were both rejected. |
| Participant route readback | Pass | Owner A and owner B received bounded metadata-only attempt readback; signed-out returned `401`; nonparticipant returned `404`. |
| RPC validation | Pass | Mismatched consent status/scope version and invalid provider lifecycle rows were rejected without adding attempts. |
| Generic consent readback | Pass | Ledger and requested scopes stayed `executable: false`. |
| No-drift checks | Pass | No provider/generated/token/private-session/public-exhibit/report/memory/canon/archive/continuity/export/job/storage/public-surface drift appeared. |
| Cleanup verification | Pass | Three proof consents were left inactive; no pending or approved proof consent remained. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, tokens, cookies, persona names in attempt readback, private prompts, private profile values, generated words, provider payloads, SQL details, stack traces, env values, browser artifacts, or secret-shaped strings. |

`pnpm typecheck` was not run because the PR513D result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR513D hosted audit rerun.
- Hosted migration 079 is present, both short append-only triggers exist, and direct update/delete attempts are rejected.
- Participant readback, signed-out/nonparticipant boundaries, RPC validation, generic executable:false readback, no-drift, cleanup, and privacy passed.
Verdict:
- PASS_PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN
Task:
- Close PR513D if accepted, or route the next narrow lane.
```
