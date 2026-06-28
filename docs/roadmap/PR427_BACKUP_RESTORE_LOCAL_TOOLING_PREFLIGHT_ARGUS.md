# PR427 - Backup/Restore Local Tooling Preflight

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARGUS / A3

Reviewer: MIMIR. Wake DAEDALUS only if the local tooling path is accepted.

Status: open - wake ARGUS

## Why This Lane

PR426 found no honest implementation default after the Memory/Continuity/Archive
observability gate passed:

`docs/roadmap/PR426_POST_OBSERVABILITY_NEXT_LANE_SELECTION_RESULT.md`

The most concrete parked production lane is still backup/restore proof, but it
is blocked by missing local-only Postgres tooling:

`docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_DEPENDENCY_BLOCKER_MIMIR.md`

MIMIR is choosing a dependency unlock instead of asking for a product decision
or opening fake implementation work.

## Preflight Question

Can Station safely unblock the local synthetic backup/restore proof by using a
workspace-local or temp-local Postgres client toolchain, without requiring a
system install and without touching hosted data?

Candidate acceptable shape, if ARGUS agrees:

- DAEDALUS may acquire `psql` and `pg_dump` as local client tools only.
- The tools must live outside tracked source or under an ignored local tools
  directory.
- No permanent system PATH mutation, service install, admin-console action,
  hosted SQL, storage operation, or real owner data is allowed.
- The proof still uses only local disposable synthetic databases and the
  accepted restore-shape label:
  `migration replay plus data-only logical restore`.
- Any download/source must be recorded without committing binaries, secrets,
  archives, dumps, fixture bodies, or credential-shaped output.
- If checksums/source trust cannot be made reasonable, reject this path.

## ARGUS Task

Review the proposed unlock and answer one of:

```text
ACCEPT LOCAL TOOLING PATH
```

with exact guardrails and a DAEDALUS handoff, or:

```text
REJECT LOCAL TOOLING PATH
```

with the exact dependency MIMIR must ask Marty to provide, or:

```text
NEEDS MIMIR DECISION
```

if the acceptable path crosses a product/security boundary.

## Review Points

ARGUS should decide:

- whether a workspace-local/temp-local `psql`/`pg_dump` client is equivalent
  enough to the parked local dependency;
- whether DAEDALUS may download/acquire it from this shell, or whether Marty
  must provide/install it;
- where local tools/artifacts may live so they cannot be accidentally committed;
- what extra `.gitignore` or cleanup guardrails are required before execution;
- what validation must run before and after the proof;
- what output must stay out of docs and logs;
- whether ARGUS wants to review the tooling acquisition before DAEDALUS runs the
  happy-path proof.

## Boundaries

Do not authorize:

- hosted backup, hosted restore, hosted SQL, or Supabase dashboard actions;
- real owner data, storage objects, private archive/package data, or production
  databases;
- permanent system install as an agent action unless MIMIR explicitly asks
  Marty first;
- Docker/Supabase CLI installation by inertia;
- queue/worker activation;
- schema/config/package changes;
- committing binaries, dumps, archives, raw fixture bodies, database URLs,
  passwords, tokens, or generated proof payloads.

## Validation

Docs/preflight only:

```bash
git diff --check
git diff --cached --check
```

If ARGUS accepts the path and wakes DAEDALUS, DAEDALUS should at minimum rerun:

```bash
node --test scripts/backup-restore-local-proof.test.mjs
node scripts/backup-restore-local-proof.mjs --help
git status --short
git diff --check
```

and only then attempt any accepted local disposable execute proof.

## Wakeup

Wake MIMIR if rejected or needs decision.

Wake DAEDALUS if accepted, with the exact local tooling guardrails and the next
proof step.
