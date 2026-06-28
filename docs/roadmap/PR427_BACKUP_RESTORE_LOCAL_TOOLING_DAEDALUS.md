# PR427 - Backup/Restore Local Tooling Acquisition

Date opened: 2026-06-28

Opened by: ARGUS / A3

Owner: DAEDALUS / A2

Status: superseded before implementation - stop local tooling work

Superseded by:

`docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_MIMIR.md`

Correction:

Marty corrected the premise in commit `690c26cb`: local Postgres tooling is not
the intended unblock. Station has an API-backed owner export and bundle readback
path available, so DAEDALUS must not download, install, wire, or validate local
`psql` or `pg_dump` for this lane.

ARGUS accepted the local tooling path in:

`docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_PREFLIGHT_RESULT.md`

## Task

Superseded. Do not execute this task.

Historical task:

Acquire local `psql` and `pg_dump` client tools, if possible, and unblock the
parked local synthetic backup/restore proof without touching hosted data or
real owner data.

This is a dependency/tooling unlock plus a local synthetic proof lane. It is
not production backup readiness.

## Required Order

1. Read the ARGUS result and obey every guardrail.
2. Decide the local tools location:
   - prefer OS temp or a user-local cache outside the repo;
   - if using `.station-local-tools/`, add the ignore rule first and verify the
     directory stays invisible to `git status --short`.
3. Acquire a PostgreSQL client archive from an official trusted HTTPS source.
4. Verify the archive checksum or signature before using the tools.
5. Use explicit tool paths or process-local PATH only.
6. Run the required pre-execute validation.
7. Attempt execute proof only if local disposable source/target databases
   already exist and satisfy the script's localhost and fixture-only guards.
8. Stop and wake MIMIR if source trust, checksums, local ignored storage, or
   local disposable databases cannot be satisfied without widening scope.

## Hard Boundaries

- No hosted backup, hosted restore, hosted SQL, Supabase dashboard work,
  Railway operations, storage operations, or real owner data.
- No MSI/package-manager/system install, service install, permanent PATH
  mutation, Docker/Supabase CLI install, queue activation, or worker activation.
- No schema/config/package changes.
- Do not commit binaries, archives, dumps, database files, raw fixture bodies,
  database URLs, passwords, tokens, stack traces, or generated proof payloads.
- Keep the proof label exactly:
  `migration replay plus data-only logical restore`.

## Minimum Validation

```bash
node --test scripts/backup-restore-local-proof.test.mjs
node scripts/backup-restore-local-proof.mjs --help
node scripts/backup-restore-local-proof.mjs --plan --json
git status --short
git diff --check
```

After local tool acquisition, also record sanitized evidence for:

- `psql --version`;
- `pg_dump --version`;
- source URL, version, and SHA-256 verification;
- ignored/outside-repo tool/artifact locations;
- no staged/untracked dump/archive/binary/database/fixture-body artifacts.

## Wakeup

Superseded. Do not wake ARGUS with a local tooling proof from this lane.

Wait for PR428 to pass ARGUS before taking backup/export proof work.
