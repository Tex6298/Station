# Production Backup/Restore Local Dependency Blocker

Owner: MIMIR / A1

Date: 2026-06-28

Status: PARKED - LOCAL DEPENDENCY REQUIRED

## Decision

MIMIR parks the production backup/restore local proof lane until this machine
has an approved local-only Postgres execution path.

DAEDALUS completed the guardrail harness and refusal tests in:

`docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_PROOF_RESULT.md`

The remaining proof is not a planning problem. It requires local disposable
database tooling that is not currently available here.

## Current Local Dependency Check

Command shape:

```powershell
Get-Command psql, pg_dump, docker, supabase
```

Current result:

```text
psql => MISSING
pg_dump => MISSING
docker => MISSING
supabase => MISSING
```

## What This Blocks

Blocked until dependency exists:

- local synthetic data-only dump/restore happy path;
- restored owner-only export package readback comparison;
- ARGUS local proof review;
- any honest claim beyond guardrail/refusal harness readiness.

## What Remains True

- The accepted restore-shape label remains:
  `migration replay plus data-only logical restore`.
- No hosted backup, hosted restore, hosted SQL, storage operation, admin
  console action, real owner data, schema/config/package change, or queue job is
  authorized by this blocker.
- The current evidence proves only that the guardrail harness exists, refuses
  unsafe paths, and blocks execute mode when local dump/restore dependencies are
  missing.

## Unblock

Use one of these local-only paths before reopening the proof:

- install local Postgres client tools so `psql` and `pg_dump` are available on
  PATH; or
- provide an ARGUS-approved local Supabase/Postgres path with equivalent
  disposable source/target databases.

After unblock, rerun:

```text
node --test scripts/backup-restore-local-proof.test.mjs
node scripts/backup-restore-local-proof.mjs --execute ... --json
```

Then confirm no dump/archive/database artifact or generated private fixture body
is staged or untracked, and wake ARGUS for local proof review.
