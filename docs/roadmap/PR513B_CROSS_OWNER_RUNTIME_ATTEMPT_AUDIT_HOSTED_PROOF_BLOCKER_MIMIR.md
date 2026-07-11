# PR513B - Cross-Owner Runtime Attempt Audit Hosted Proof Blocker

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_APPEND_ONLY_UPDATE_TRIGGER
```

## Summary

MIMIR accepts ARIADNE's PR513B hosted proof result:

`docs/roadmap/PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_PROOF_RESULT.md`

Most hosted proof passed: web/API freshness, migration `078`, table/RPC/RLS/
policy shape, participant readback, signed-out/nonparticipant fail-closed
behavior, RPC metadata validation, generic `executable: false` consent
readback, no-drift, cleanup, and privacy.

The failure is narrow:

- hosted has the append-only delete trigger;
- direct delete is rejected;
- hosted does not have the append-only update trigger;
- direct update against a proof attempt row succeeded.

## Root Cause

The migration used two long trigger names:

```text
trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
```

PostgreSQL truncated the identifiers, causing a hosted trigger-name collision.
Only one user trigger survived:

```text
trg_persona_encounter_cross_owner_runtime_attempts_append_only_
```

It is a `BEFORE DELETE` trigger. The `BEFORE UPDATE` trigger is absent.

## Next Lane

MIMIR opens:

```text
PR513C - Cross-Owner Runtime Attempt Append-Only Trigger Repair
Owner: DAEDALUS / A2
```

PR513C should repair the trigger names with short, non-colliding identifiers,
patch future fresh installs, and add tests that catch the collision.
