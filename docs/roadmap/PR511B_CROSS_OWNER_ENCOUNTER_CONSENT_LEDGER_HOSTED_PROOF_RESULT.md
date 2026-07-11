# PR511B - Cross-Owner Encounter Consent Ledger Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted API/data proof requested in:

`docs/roadmap/PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids,
persona ids, session tokens, private prompts, provider payloads, generated
text, SQL details, stack traces, screenshots, videos, browser storage, bearer
values, or secret-shaped strings.

## Verdict

PR511B passes. Hosted web and API deployments include the PR511A code and ARGUS
audit-atomicity patch, hosted migration `077` is present, the consent/audit
tables and security-invoker RPC functions are shaped as expected, participant
owners can create, approve, reject, cancel, revoke, list, and read bounded audit
state, signed-out and nonparticipant probes fail closed, approved rows remain
`executable: false`, no forbidden side-effect tables were written, no public
surface picked up the proof consents, and cleanup left no active proof consent.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `e6f560a0bb64` |
| Hosted web includes PR511A review floor `e6f560a0` | Pass |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `e6f560a0bb64` |
| Hosted API includes PR511A review floor `e6f560a0` | Pass |

## Migration And Shape

| Check | Result |
| --- | --- |
| Hosted migration `077` ledger row | Present |
| Consent table present | Pass |
| Audit table present | Pass |
| Consent RPC functions present | `2` |
| RPC functions are security invoker | Pass |
| Consent RLS policy count | `2` |
| Audit RLS policy count | `1` |

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
| Owner A persona fixture | Existing persona present |
| Owner B persona fixture | Private fixture created through `/personas`, `201` |

Hosted replay alternate accounts had no existing counterparty personas, so
ARIADNE created one private owner-B persona through the normal authenticated
`/personas` API. It was used only as a private consent-ledger fixture and did
not become public.

## Create, Approve, And Revoke

| Check | Result |
| --- | --- |
| Owner A create invitation | `201` |
| Initial status | `pending` |
| Owner A participant role | `requester` |
| Initial audit events | `2` |
| Initial scopes executable | `false` |
| Initial ledger executable | `false` |
| Initial readback safe | Pass |
| Owner B list | `200`, included proof row |
| Owner B participant role | `counterparty` |
| Owner B detail | `200`, audit count `2` |
| Requester approve attempt | `403` |
| Owner B approve | `200` |
| Approved status | Pass |
| Approved audit event | `counterparty_approved` |
| Approved scopes executable | `false` |
| Approved ledger executable | `false` |
| Reject approved row | `409`, `executable: false` |
| Nonparticipant revoke | `404` |
| Owner A revoke | `200` |
| Revoked status | Pass |
| Revoke audit event | `participant_revoked` |
| Revoke actor role | `requester` |
| Revoked ledger executable | `false` |

## Reject

| Check | Result |
| --- | --- |
| Separate invitation create | `201` |
| Owner B reject | `200` |
| Rejected status | Pass |
| Reason code | `not_aligned` |
| Reject audit event | `counterparty_rejected` |
| Rejected ledger executable | `false` |
| Approve rejected row | `409`, `executable: false` |
| Rejected readback safe | Pass |

## Cancel

| Check | Result |
| --- | --- |
| Separate invitation create | `201` |
| Owner A cancel | `200` |
| Cancelled status | Pass |
| Reason code | `owner_request` |
| Cancel audit event | `requester_cancelled` |
| Cancelled ledger executable | `false` |
| Approve cancelled row | `409`, `executable: false` |
| Cancelled readback safe | Pass |

## Boundary Readback

| Check | Result |
| --- | --- |
| Signed-out list | `401` |
| Signed-out detail | `401` |
| Signed-out create | `401` |
| Nonparticipant list | `200`, empty |
| Nonparticipant detail | `404` |
| Nonparticipant reject | `404` |
| Owner A detail | `200` |
| Owner B detail | `200` |
| Participant readback safe | Pass |
| Participant audit present | Pass |
| All readback non-executable | Pass |

## No Drift

Public/API/page samples did not surface proof consent rows or consent internals.
The proof checked Discover search/feed/rising/featured, public encounter
exhibits, forum categories, forum subcommunities, public Space, public persona,
public document, Discover page, forums pages, writing, and `/encounters`.

| Check | Result |
| --- | --- |
| Public API no consent surfacing | Pass |
| Public pages no consent surfacing | Pass |
| Public Space sample present | Yes |
| Public persona sample present | Yes |
| Public document sample present | Yes |
| Private encounter sessions created | `0` |
| Public encounter exhibits created | `0` |
| Moderation reports created | `0` |
| Token transactions created | `0` |
| Storage usage touched | `0` |
| Storage objects created | `0` |
| Background jobs table | Not present |
| Forbidden side effects | None |

## Cleanup

The proof created three consent rows and left all of them inactive:

| Status | Count |
| --- | --- |
| Revoked | `1` |
| Cancelled | `1` |
| Rejected | `1` |
| Pending | `0` |
| Approved | `0` |

No active proof consent remained. The inactive rows retain safe append-only audit
state.

## Privacy

Sanitized proof output exposed no raw owner ids, persona ids, session tokens,
cookies, bearer values, private prompts, private setup, generated reply text,
provider payloads, SQL details, stack traces, screenshots, videos, browser
storage, env values, or secret-shaped strings.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/data proof runner | Pass | Proved migration shape, owner A/B create/approve/reject/cancel/revoke, participant readback/audit, signed-out and nonparticipant fail-closed behavior, non-executable readback, no-drift, cleanup, and privacy. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `e6f560a0bb64`, which includes PR511A review floor `e6f560a0`. |
| Hosted migration `077` | Pass | Ledger row present; consent/audit tables present; both RPC functions present and security invoker; policy counts present. |
| Consent API behavior | Pass | Participant owners could create, approve, reject, cancel, revoke, list, and read bounded audit state. |
| Boundary probes | Pass | Signed-out probes returned `401`; nonparticipant list was empty and detail/mutation returned `404`. |
| Non-executable ledger | Pass | Created, approved, rejected, cancelled, and revoked readbacks kept requested scopes and ledger flags `executable: false`. |
| No-drift checks | Pass | No private sessions, public exhibits, moderation reports, token transactions, storage writes, background jobs, or public surfacing appeared from consent routes. |
| Cleanup verification | Pass | Three proof rows were left inactive: one revoked, one rejected, one cancelled; no pending or approved proof rows remained. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, tokens, cookies, private prompts, generated text, provider payloads, SQL details, stack traces, env values, browser artifacts, or secret-shaped strings. |

`pnpm typecheck` was not run because the PR511B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR511B hosted cross-owner consent ledger proof.
- Hosted web and API health/deployment passed at commit prefix `e6f560a0bb64` for `@station/web` and `@station/api`; both include PR511A review floor `e6f560a0`.
- Hosted migration `077` was present; consent/audit tables existed; both consent RPC functions were present and security invoker; RLS policy counts were present.
- Owner A, owner B, and nonparticipant auth passed. Owner B had no existing persona, so ARIADNE created one private counterparty fixture through `/personas` with status `201`.
- Owner A created a pending invitation; Owner B read it as counterparty and approved it; approved scopes and ledger stayed `executable: false`.
- Requester self-approve returned `403`, reject-after-approve returned `409` with `executable: false`, nonparticipant revoke returned `404`, and Owner A revoked the approved row.
- Owner B rejected a separate pending invitation with reason `not_aligned`; rejected readback stayed non-executable and could not be approved.
- Owner A cancelled a separate pending invitation with reason `owner_request`; cancelled readback stayed non-executable and could not be approved.
- Signed-out list/detail/create returned `401`; nonparticipant list returned empty `200`; nonparticipant detail/mutation returned `404`.
- Participant detail readback included bounded audit events and no raw owner/persona ids or private fields.
- No private session, public exhibit, moderation report, token transaction, storage write, background job, or public API/page surfacing drift appeared.
- Cleanup left three inactive proof rows: one revoked, one rejected, one cancelled; no pending or approved proof consent remained.
- Privacy scan passed.
Verdict:
- PASS_PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF.
Task:
- Close PR511B if accepted, or route any narrow follow-up.
```
