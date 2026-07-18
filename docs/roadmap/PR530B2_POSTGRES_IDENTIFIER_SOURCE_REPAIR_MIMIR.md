# PR530B2 PostgreSQL Identifier Source Repair

Date: 2026-07-18

Owner: MIMIR / A1 takeover

Review target: ARGUS / A3

Status:

```text
READY_PR530B2_POSTGRES_IDENTIFIER_SOURCE_REPAIR_FOR_ARGUS
```

## Why This Lane Exists

PR530B1 began the schema-only hosted reconciliation and migration 081 committed
inside its transaction. Its pre-ledger catalog proof then stopped on
`target_function_set_mismatch`, before any migration ledger or canary write.

Read-only reconciliation found a PostgreSQL identifier-length defect in the
accepted source contract:

- PostgreSQL stores identifiers at no more than 63 bytes;
- migration 081's internal append-only trigger helper is 65 bytes and is
  deterministically stored under its 63-byte form;
- migration 082's proposed publication-audit table is 64 bytes, while the API
  and generated database types address the untruncated spelling.

The 081 helper is trigger-internal and its installed trigger binding is sound.
The 082 table is application-facing, so applying it unchanged would create a
physical relation that normal Supabase callers cannot address by the checked-in
API name. Hosted apply therefore remains paused before migration 082.

## Hosted Checkpoint

The bounded read-only checkpoint proves:

- all migration 081 target objects are present with the accepted shape;
- all three migration 081 tables contain zero rows;
- no 081, 082, or 087 target migration ledger row exists;
- migration 082 and 087 effects are absent;
- the consent validator remains at the prior seven-scope contract;
- no canary or generated-product row was created.

This is an unledgered 081 schema checkpoint, not a completed migration claim.

## Source Repair

Migration 082 now deliberately uses:

```text
persona_encounter_cross_owner_generated_publication_audits
prevent_cross_owner_generated_publication_audit_mutation
```

Both names fit PostgreSQL's identifier limit. The table rename is propagated
through migration SQL, API writes, moderation writes, database types, and both
focused test harnesses. The migration contract test now rejects any 64-byte-or-
longer identifier-shaped token in migration 082.

New migration 082 SHA-256:

```text
4BB3264B9F1D867DCA6BB30E4D29287DEBAF0795262C601EF67301765947EB50
```

Migration 081 and 087 bytes are unchanged. No hosted write is authorized by
this source-repair result itself.

## Validation

| Gate | Result |
| --- | --- |
| `test:persona-encounters` | Pass, 88/88 |
| `test:reports` | Pass, 9/9 |
| `@station/api typecheck` | Pass |
| migration 082 overlength-token scan | Pass, zero matches |
| `git diff --check` | Pass |

## ARGUS Review

ARGUS should independently verify:

1. the 58-byte audit relation is used consistently by migration, API, reports,
   generated DB types, and tests;
2. migration 082 contains no identifier-shaped token over PostgreSQL's limit;
3. the new hash binds exactly the reviewed migration bytes;
4. the hosted checkpoint remains 081 objects / zero rows / zero target ledger,
   with 082 and 087 absent;
5. the recovery operator can be rebound honestly to this repair and resume at
   the unledgered 081 checkpoint without replaying a canary.

If accepted, wake MIMIR. MIMIR will bind the private recovery ledger to the old
and new source hashes, ledger the proven 081 checkpoint, apply and prove 082
and 087, and stop again before canary.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR stopped PR530B1 after PostgreSQL exposed an accepted-source identifier
  defect; migration 081 is present with zero rows but remains unledgered.
- PR530B2 gives migration 082 an intentional 58-byte application-facing audit
  table name and propagates it through API, moderation, DB types, and tests.
- No migration 082/087 or canary write has occurred.
Validation:
- test:persona-encounters 88/88, test:reports 9/9, API typecheck, overlength
  scan, and diff check pass.
Task:
- Hostile-review PR530B2 source and the read-only hosted checkpoint.
- Wake MIMIR with accept/block verdict; do not mutate hosted schema or run the
  PR524B canary.
```
