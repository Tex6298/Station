# PR512B - Cross-Owner Runtime Context Contract Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR512B_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted API/data proof requested in:

`docs/roadmap/PR512B_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_HOSTED_PROOF_ARIADNE.md`

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

PR512B passes. Hosted web and API deployments include the PR512A implementation
floor, owner A and owner B each receive eligible runtime-context-contract
readback only when acting as initiator on an approved
`run_cross_owner_encounter` consent, signed-out and nonparticipant probes fail
closed, representative ineligible states return bounded non-executable
readback, generic consent readback still serializes ledger and requested scopes
as `executable: false`, no provider/runtime/persistence/public-surface drift
appeared, cleanup left no active proof consents, and the privacy scan passed.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `8ffbb71890dd` |
| Hosted web includes PR512A implementation floor `8ffbb718` | Pass |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `8ffbb71890dd` |
| Hosted API includes PR512A implementation floor `8ffbb718` | Pass |

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
| Owner A second persona fixture | Existing persona present |
| Owner B persona fixture | Existing private persona reused |
| Nonparticipant auth fixture | Ready |

## Approved Contract Readback

| Check | Result |
| --- | --- |
| Owner A create consent | `201` |
| Owner B approve consent | `200` |
| Approved status | Pass |
| Generic ledger executable on approve | `false` |
| Generic requested scopes executable on approve | `false` |
| Approved readback safe | Pass |
| Owner A contract readback | `200`, eligible |
| Owner A actor role | `requester` |
| Owner A readback safe | Pass |
| Owner B contract readback | `200`, eligible |
| Owner B actor role | `counterparty` |
| Owner B readback safe | Pass |
| Denied context class labels | `16` |
| Future audit metadata includes `readinessCode` | Pass |
| Execution flags all false | Pass |

The accepted contract remains readback-only. It exposes bounded readiness facts,
participant role/display snapshots, denied context labels, non-execution flags,
and future metadata-only audit field names. It does not assemble prompts, call a
provider, return generated words, record token accounting, create private
sessions, publish public exhibits, write reports, write storage, or create a
public surface.

## Fail-Closed Boundary

| Check | Result |
| --- | --- |
| Signed-out contract readback | `401` |
| Nonparticipant contract readback | `404` |
| Wrong role readback | `200`, `wrong_role` |
| Wrong pair readback | `200`, `wrong_pair` |
| Pending consent readback | `200`, `pending` |
| Rejected consent readback | `200`, `rejected` |
| Wrong-scope consent readback | `200`, `wrong_scope` |
| All ineligible readbacks non-executable | Pass |

The hosted proof used a representative fail-closed subset. `cancelled`,
`revoked`, and `wrong_version` remain covered by accepted PR512A local tests and
were not exhaustively replayed in this hosted pass.

## Generic Consent Readback

| Check | Result |
| --- | --- |
| Generic consent detail | `200` |
| Ledger executable | `false` |
| Requested scopes executable | `false` |
| Audit present | Pass |
| Readback safe | Pass |

Generic consent readback still does not grant runtime permission.

## No Drift

Public/API/page samples did not surface the proof consent ids or runtime
context contract internals. The proof checked Discover search, Discover feed
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

The accepted proof run created four consent rows and left all of them inactive:

| Status | Count |
| --- | --- |
| Revoked | `2` |
| Cancelled | `1` |
| Rejected | `1` |
| Pending | `0` |
| Approved | `0` |

No active proof consent remained. The inactive rows retain safe append-only
audit state.

## Privacy

Sanitized proof output exposed no raw owner ids, raw persona ids, session
tokens, cookies, bearer values, private prompts, private profile values,
generated words, provider payloads, SQL details, stack traces, browser storage,
env values, or secret-shaped strings.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/data proof runner | Pass | Proved freshness, owner A/B/nonparticipant auth, eligible readback for both participant initiators, signed-out/nonparticipant fail-closed behavior, representative ineligible-state fail-closed behavior, non-executable generic readback, no-drift, cleanup, and privacy. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `8ffbb71890dd`, which includes PR512A implementation floor `8ffbb718`. |
| Approved contract readback | Pass | Owner A and owner B each received eligible contract readback only when acting as initiator on the approved `run_cross_owner_encounter` consent. |
| Boundary probes | Pass | Signed-out returned `401`; nonparticipant returned `404`; wrong-role, wrong-pair, pending, rejected, and wrong-scope states returned bounded ineligible readback. |
| Non-executable readback | Pass | Approved, ineligible, and generic consent readbacks kept ledger and requested scopes `executable: false`; all execution flags stayed false. |
| No-drift checks | Pass | No provider/generated/token/private-session/public-exhibit/report/memory/canon/archive/continuity/export/job/storage/public-surface drift appeared. |
| Cleanup verification | Pass | Four proof rows were left inactive: two revoked, one rejected, one cancelled; no pending or approved proof rows remained. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, tokens, cookies, private prompts, private profile values, generated words, provider payloads, SQL details, stack traces, env values, browser artifacts, or secret-shaped strings. |

`pnpm typecheck` was not run because the PR512B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR512B hosted cross-owner runtime context contract proof.
- Hosted web/API are fresh at 8ffbb71890dd and include the PR512A implementation floor.
- Owner A/B eligible initiator readbacks, fail-closed boundaries, executable:false generic readback, no-drift, cleanup, and privacy all passed.
Verdict:
- PASS_PR512B_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_HOSTED_PROOF
Task:
- Close PR512B if accepted, or route any narrow follow-up.
```
