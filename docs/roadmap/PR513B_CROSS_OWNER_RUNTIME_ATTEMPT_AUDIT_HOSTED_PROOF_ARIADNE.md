# PR513B - Cross-Owner Runtime Attempt Audit Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Purpose

Prove the PR513A runtime attempt audit ledger on hosted staging after MIMIR
applied migration `078`.

This is hosted migration/API/data proof only. It is not browser proof,
provider-generation proof, or cross-owner preview execution.

## Source Floor

Review and preserve:

- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_CLOSEOUT.md`;
- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_REVIEW_RESULT.md`;
- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_RESULT.md`;
- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_DAEDALUS.md`.

Hosted migration ledger row expected:

```text
version: 20260711172000
name: 078_persona_encounter_cross_owner_runtime_attempts
created_by: mimir
```

Hosted readback route:

```text
GET /persona-encounters/cross-owner-consents/:consentId/runtime-attempts
```

## Required Proof

Use hosted staging credentials and sanitize all output. Do not print raw tokens,
cookies, env values, owner ids, persona ids, private prompts, private profile
fields, provider payloads, generated text, token values, traces, SQL details, or
secret-shaped values.

Prove:

- hosted web/API freshness includes the PR513A review floor `62011093` or a
  newer commit containing it;
- migration `078` is present in hosted Supabase;
- table `persona_encounter_cross_owner_runtime_attempts` exists;
- RPC `record_persona_encounter_cross_owner_runtime_attempt` exists and is
  security invoker;
- append-only mutation trigger function exists and is security invoker;
- RLS is enabled on the attempts table;
- participant SELECT policy exists;
- no public/nonparticipant read path exists;
- no direct participant insert/update/delete policy exists;
- owner A/B can read bounded attempt metadata for a consent they participate in;
- nonparticipant gets `404` or empty readback without row inference;
- signed-out gets `401`;
- generic consent readback remains `executable: false`;
- RPC rejects mismatched consent status or scope version;
- provider lifecycle attempt rows require ready approved
  `run_cross_owner_encounter` consent;
- readback excludes raw owner ids, raw persona ids, persona names, prompts,
  private profile fields, provider payloads, generated words, token facts,
  source bodies, traces, SQL details, env values, cookies, bearer values, and
  secret-shaped strings.

You may seed bounded hosted proof attempt rows through the hosted RPC/admin path
as fixture setup only. Do not call a provider, assemble prompts, or create
generated output.

Cleanup or leave only inactive proof consent rows with bounded append-only
attempt metadata. Do not leave active proof consent behind.

## Drift Checks

Confirm no hosted drift in:

- provider calls;
- prompt assembly;
- generated words;
- token usage or token transactions;
- private sessions;
- public exhibits;
- reports;
- memory, canon, archive, continuity, export, jobs, storage, public rows, or
  public surfacing;
- package, billing, provider/retrieval, Redis, Cloudflare, worker, webhook,
  deployment, browser/UI state.

## Non-Scope

Do not perform:

- browser/mobile UI proof;
- provider-generation proof;
- same-owner or cross-owner preview execution;
- prompt assembly;
- generated words;
- public exhibit publication;
- private session creation;
- public search/feed/Space/persona/forum/document surfacing beyond no-drift
  sampling if needed;
- schema changes beyond verifying already-applied migration `078`;
- package, Redis, Cloudflare, Stripe, billing, queue/worker, deployment, or
  webhook changes.

## Outcomes

Wake MIMIR with exactly one:

```text
PASS_PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_PROOF
BLOCK_PR513B_DEPLOYMENT_NOT_FRESH
BLOCK_PR513B_HOSTED_AUTH_OR_FIXTURE_UNAVAILABLE
FAIL_PR513B_AUDIT_LEDGER_BOUNDARY
FAIL_PR513B_PRIVACY_OR_DRIFT
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR closed PR513A as accepted locally and applied hosted Supabase migration 078.
- Hosted shape verification found the runtime attempt table, security-invoker RPCs, RLS, participant SELECT policy, append-only triggers, and migration ledger row.
- PR513B is hosted migration/API/data proof only; browser proof and provider-generation proof are out of scope.
Task:
- Prove hosted web/API freshness includes PR513A review floor 62011093 or newer.
- Prove migration 078, table/function/RLS/policy/trigger shape, participant readback, signed-out/nonparticipant fail-closed behavior, RPC metadata validation, executable:false generic consent readback, privacy, cleanup, and no drift.
- Use only bounded hosted RPC/admin fixture setup if needed; do not call providers, assemble prompts, or create generated output.
- Sanitize all proof output and wake MIMIR with pass/block/fail verdict.
```
