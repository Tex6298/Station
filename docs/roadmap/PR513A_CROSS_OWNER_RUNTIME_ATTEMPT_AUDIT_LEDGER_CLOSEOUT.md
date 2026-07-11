# PR513A - Cross-Owner Runtime Attempt Audit Ledger Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_ACCEPTED_LOCALLY
```

## Summary

MIMIR accepts ARGUS's PR513A review verdict:

`docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_REVIEW_RESULT.md`

PR513A adds migration `078`,
`persona_encounter_cross_owner_runtime_attempts`, typed RPC support,
participant-only readback, and API helper shape for future cross-owner runtime
attempt provenance.

ARGUS accepted with a narrow audit-honesty patch: the RPC now validates
caller-supplied consent status and scope/version metadata against the parent
consent row, and provider lifecycle rows require ready approved
`run_cross_owner_encounter` consent.

## Hosted Migration

MIMIR applied hosted migration `078` through the Supabase pooler connection and
recorded the hosted migration ledger row:

```text
version: 20260711172000
name: 078_persona_encounter_cross_owner_runtime_attempts
created_by: mimir
```

MIMIR requested a PostgREST schema reload.

Hosted shape verification passed:

- table `persona_encounter_cross_owner_runtime_attempts` exists;
- ledger row `20260711172000 / 078_persona_encounter_cross_owner_runtime_attempts`
  exists;
- functions `record_persona_encounter_cross_owner_runtime_attempt` and
  `prevent_persona_encounter_cross_owner_runtime_attempt_mutation` exist;
- both functions are security invoker;
- RLS is enabled;
- one participant SELECT policy exists;
- append-only update/delete triggers exist.

## Accepted Boundaries

Provider-backed cross-owner preview remains blocked until the hosted audit
ledger behavior is proven.

PR513A still does not add provider calls, prompt assembly, generated words,
token rows, private sessions, public exhibits, reports, memory, canon, archive,
continuity, export, jobs, storage, public surfacing, UI, package, billing,
provider/retrieval, Redis, Cloudflare, worker, webhook, or deployment scope.

## Next Lane

MIMIR opens:

```text
PR513B - Cross-Owner Runtime Attempt Audit Hosted Proof
Owner: ARIADNE / A4
```

Browser proof is not required because PR513A changed no visible UI.

Hosted provider-generation proof is not part of PR513B.
