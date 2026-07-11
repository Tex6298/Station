# PR513D - Cross-Owner Runtime Attempt Audit Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Purpose

Rerun the hosted audit proof that failed in PR513B after PR513C repaired the
append-only trigger-name collision.

Inputs:

- `docs/roadmap/PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR513C_CROSS_OWNER_RUNTIME_ATTEMPT_APPEND_ONLY_TRIGGER_REPAIR_REVIEW_RESULT.md`
- `docs/roadmap/PR513C_CROSS_OWNER_RUNTIME_ATTEMPT_APPEND_ONLY_TRIGGER_REPAIR_CLOSEOUT.md`

## MIMIR Hosted Repair Facts

MIMIR applied hosted migration `079` and verified:

```text
version: 20260711180500
name: 079_persona_encounter_runtime_attempt_trigger_repair
created_by: mimir
```

Hosted trigger repair facts:

- `pe_co_rt_attempts_no_update` exists;
- `pe_co_rt_attempts_no_delete` exists;
- both names are below PostgreSQL's 63-byte identifier limit;
- both triggers call
  `public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation`;
- rollback-only hosted proof rejected direct update;
- rollback-only hosted proof rejected direct delete;
- rollback-only proof left no hosted proof fixture behind;
- PostgREST schema reload was requested.

## Required Hosted Rerun

Rerun the PR513B hosted audit proof with the repaired trigger boundary:

- confirm hosted web/API freshness or deploy-equivalent runtime freshness for
  the PR513C review floor;
- confirm migration `079` is present in the hosted migration ledger;
- confirm `pe_co_rt_attempts_no_update` and `pe_co_rt_attempts_no_delete` both
  exist on `public.persona_encounter_cross_owner_runtime_attempts`;
- confirm both short triggers call
  `public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation`;
- prove direct hosted update and delete attempts against a proof attempt row are
  both rejected, using rollback-only or cleaned-up proof data;
- rerun participant route readback for owner A and owner B;
- prove signed-out callers get `401`;
- prove nonparticipants get `404` or empty readback without row inference;
- prove generic consent readback remains `executable: false`;
- verify no provider calls, prompts, generated words, token rows, private
  sessions, public exhibits, reports, memory/canon/archive/continuity/export/
  jobs/storage writes, public surfacing, package, billing, provider/retrieval,
  Redis, Cloudflare, workers, webhooks, deployment, queues, partner adapters, or
  UI drift appear;
- run privacy/no-secret scans over captured output.

## Non-Scope

Do not prove or implement:

- provider-backed cross-owner preview;
- prompt assembly;
- generated words;
- token usage/transactions;
- private cross-owner sessions;
- public exhibits;
- reports;
- memory/canon/archive/continuity/export/jobs/storage/public rows;
- public surfacing;
- UI, package, billing, provider/retrieval, Redis, Cloudflare, worker, webhook,
  deployment, queues, partner adapters, or browser proof scope.

Browser proof is not required because PR513C changes no visible UI.

Hosted provider-generation proof remains out of scope.

## Expected Result

Return one of:

```text
PASS_PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN
FAIL_PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN
BLOCK_PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN
```

Wake MIMIR with the verdict.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR closed PR513C after ARGUS accepted the append-only trigger repair.
- MIMIR applied hosted migration 079 and verified the hosted short update/delete triggers reject rollback-only direct mutation attempts.
- PR513D is the hosted rerun of the PR513B audit proof, not a new feature lane.
Task:
- Rerun the cross-owner runtime attempt audit hosted proof with the repaired 079 trigger boundary.
- Prove migration 079 ledger presence, both short triggers, update/delete rejection, participant readback, signed-out/nonparticipant fail-closed behavior, executable:false generic consent readback, cleanup/no-drift, and privacy.
- Do not expand into provider-backed preview, generated words, private sessions, public exhibits, reports, memory/canon/archive/continuity/export/jobs/storage/public rows, UI, package, billing, provider/retrieval, Redis, Cloudflare, worker, webhook, deployment, queues, partner adapters, or browser proof.
- Wake MIMIR with PASS/FAIL/BLOCK and exact evidence.
```
