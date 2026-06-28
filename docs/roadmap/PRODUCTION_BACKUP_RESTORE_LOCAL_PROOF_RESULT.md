# Production Backup/Restore Local Proof Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-28

Status: COMPLETE - WAKE MIMIR

## Verdict

```text
BLOCKED - LOCAL DEPENDENCY MISSING
```

DAEDALUS implemented the local-only planning/refusal harness and tests, but the
execute proof cannot run on this machine because required local Postgres command
dependencies are missing from PATH.

Missing required local dependencies:

- `psql`
- `pg_dump`

No hosted resource was substituted.

## Files Changed

- `scripts/backup-restore-local-proof.mjs`
- `scripts/backup-restore-local-proof.test.mjs`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_PROOF_RESULT.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_PROOF_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Implementation Summary

Added a standalone local proof planner/refusal harness:

```text
node scripts/backup-restore-local-proof.mjs --plan
```

The tool uses the required truth label:

```text
migration replay plus data-only logical restore
```

The default mode is plan/dry-run. It does not inspect env values, does not read
hosted data, does not create dumps, does not restore data, and does not print
supplied connection strings.

Execute mode exists only as a guarded preflight. It requires explicit local and
fixture confirmations, then checks for required local commands before any
future dump/restore action could run. In this workspace, execute mode stops as
blocked because `psql` and `pg_dump` are unavailable.

No schema, migration, package manifest, lockfile, env example, production
config, hosted data, storage object, queue job, or admin-console behavior was
changed.

## Guardrails

The harness refuses:

- non-local source database URLs;
- non-local target database URLs;
- backup artifact paths inside the repository tree;
- non-fixture rows;
- storage-operation requests;
- verbose/raw output requests;
- execute mode without explicit local/disposable and fixture-only flags;
- execute mode when required local commands are unavailable.

Safe output is limited to:

- command names;
- safe counts;
- fixture aliases;
- owner-scope booleans;
- pass/fail results;
- missing local command names.

Forbidden output remains:

- connection strings;
- raw ids;
- raw rows;
- private text;
- manifest bodies;
- bundle bodies;
- storage paths;
- logs;
- stack traces;
- env values;
- secrets.

## Refusal Tests

Focused tests cover:

- default plan mode omits raw connection details;
- execute mode blocks when a required local command is missing;
- non-local source refusal;
- non-local target refusal;
- unsafe artifact path refusal;
- non-fixture row refusal;
- storage operation refusal;
- verbose/raw output refusal.

## Execute Mode

Execute mode was attempted only far enough to exercise guardrails with
placeholder local database URLs and an operating-system temp artifact path.

Result:

```text
blocked
```

Missing dependencies:

```text
psql, pg_dump
```

No backup, restore, dump, hosted SQL, storage operation, export package
creation, queue job, schema change, package change, config change, hosted data
mutation, real owner data read, or local artifact creation occurred.

## Local-Only Evidence Summary

Evidence recorded:

- default planner returns plan mode and the required restore-shape label;
- planner safe output omits supplied local connection details;
- execute preflight reports missing local command names only;
- all refusal tests passed.

Evidence not recorded:

- raw command connection strings;
- raw ids;
- SQL rows;
- private text;
- export manifests;
- bundle bodies;
- storage paths;
- logs;
- stack traces;
- env values;
- secrets.

## Validation

Commands run:

- `node --test scripts/backup-restore-local-proof.test.mjs` - pass, 8 tests.
- `node scripts/backup-restore-local-proof.mjs --plan --json` - pass, safe plan
  output only.
- `node scripts/backup-restore-local-proof.mjs --execute ... --json` - blocked
  as expected before any dump/restore because `psql` and `pg_dump` are missing.

Still to run before ARGUS can accept a completed local proof:

- install local Postgres command tools or equivalent ARGUS-approved local
  Supabase/Postgres tooling;
- rerun execute mode against local disposable source and target databases;
- confirm no dump/archive/database artifact or generated private fixture body is
  staged or untracked for commit;
- rerun guardrail tests and export tests.

## Production-Readiness Caveats

This result does not prove:

- local data-only restore happy path;
- full database restore;
- full schema restore;
- full cluster restore;
- hosted restore readiness;
- managed backup readiness;
- retention;
- RPO/RTO;
- storage-object recovery;
- disaster recovery for production accounts.

It proves only that the local-only guardrail harness exists, refuses unsafe
paths, and blocks execute mode when local dump/restore dependencies are missing.
