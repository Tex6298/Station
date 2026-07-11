# PR512B - Cross-Owner Runtime Context Contract Hosted API Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Purpose

Prove the PR512A cross-owner runtime context contract against the hosted staging
API and data boundary before any provider-backed cross-owner runtime lane can be
considered.

This is hosted API/data proof only. It is not browser proof, provider proof, or
runtime execution.

## Source Floor

Review and preserve the accepted PR512A floor:

- `docs/roadmap/PR512A_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_CLOSEOUT.md`;
- `docs/roadmap/PR512A_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_REVIEW_RESULT.md`;
- `docs/roadmap/PR512A_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_RESULT.md`.

Hosted proof route:

```text
GET /persona-encounters/cross-owner-consents/:consentId/runtime-context-contract?initiatorPersonaId=...&responderPersonaId=...
```

## Required Proof

Use hosted staging credentials and sanitize all output. Do not print raw tokens,
cookies, env values, owner ids, persona ids, private prompts, private profile
fields, SQL details, provider payloads, generated text, traces, or
secret-shaped values.

Prove:

- hosted web/API freshness includes the PR512A implementation commit;
- owner A, owner B, and nonparticipant auth are available;
- private owner personas exist or are created only as disposable consent
  fixtures;
- owner A can create a pending consent for owner B with
  `run_cross_owner_encounter`;
- owner B can approve that consent;
- owner A receives eligible contract readback when owner A is initiator and
  owner B is responder;
- owner B receives eligible contract readback when owner B is initiator and
  owner A is responder;
- signed-out readback returns `401`;
- nonparticipant readback returns `404` without row inference;
- pending, rejected, cancelled, revoked, wrong-pair, wrong-role, wrong-scope, or
  wrong-version cases fail closed. A focused representative subset is acceptable
  if it proves the hosted route is enforcing the same PR512A contract and the
  result names what was not exhaustively replayed;
- generic consent readback still serializes ledger and requested scopes as
  `executable: false`;
- readback exposes only bounded contract/readiness facts, denied context labels,
  non-execution flags, safe participant role/display snapshots, and future
  metadata-only audit field names.

## Drift Checks

Confirm the hosted proof creates no drift in:

- provider calls;
- generated cross-owner words;
- token usage or token transactions;
- private sessions;
- public encounter exhibits;
- moderation reports;
- memory, canon, archive, continuity, export, jobs, storage, public rows, or
  public surfacing;
- package, migration, billing, queue, worker, Redis, Cloudflare, or UI state.

Cleanup proof fixtures or leave only inactive proof consent rows. Do not leave
pending or approved proof consents behind.

## Non-Scope

Do not perform:

- browser/mobile UI proof;
- provider-generation proof;
- prompt assembly;
- generated words;
- public exhibit publication;
- private session creation;
- public search/feed/Space/persona/forum/document checks beyond no-drift API
  sampling if needed;
- schema, migration, deployment, package, Redis, Cloudflare, Stripe, billing, or
  queue/worker changes.

## Outcomes

Wake MIMIR with exactly one:

```text
PASS_PR512B_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_HOSTED_PROOF
BLOCK_PR512B_DEPLOYMENT_NOT_FRESH
BLOCK_PR512B_HOSTED_AUTH_OR_FIXTURE_UNAVAILABLE
FAIL_PR512B_CONTEXT_CONTRACT_BOUNDARY
FAIL_PR512B_PRIVACY_OR_DRIFT
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR closed PR512A as accepted locally after ARGUS accepted the readback-only cross-owner runtime context contract.
- PR512B is hosted API/data proof only for the new authenticated participant route.
- Browser proof is not required because no UI changed, and provider-generation proof remains out of scope.
Task:
- Prove hosted web/API freshness includes PR512A.
- Use owner A/B/nonparticipant auth and disposable private persona/consent fixtures as needed.
- Create and approve one run_cross_owner_encounter consent, then prove owner A and owner B each get eligible runtime-context-contract readback only when they are the initiator.
- Prove signed-out 401, nonparticipant 404, and a focused fail-closed subset for ineligible consent/persona/scope states.
- Confirm generic consent readback remains executable:false and no provider/generated/token/private-session/public-exhibit/report/memory/canon/archive/continuity/export/job/storage/public/infra/billing/Redis/Cloudflare/UI drift occurs.
- Sanitize all proof output and wake MIMIR with pass/block/fail verdict.
```
