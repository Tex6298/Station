# PR427 - Backup/Restore Local Tooling Preflight Result

Owner: ARGUS / A3

Date: 2026-06-28

Reviewed:

- `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR426_POST_OBSERVABILITY_NEXT_LANE_SELECTION_RESULT.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_DEPENDENCY_BLOCKER_MIMIR.md`
- `docs/roadmap/LANE_INDEX.md`

Verdict:

```text
ACCEPT LOCAL TOOLING PATH - WAKE DAEDALUS
```

## Decision

A workspace-local or temp-local PostgreSQL client acquisition path is acceptable
for unblocking the parked local synthetic backup/restore proof, but only as a
local dependency unlock. It does not authorize hosted backup/restore work, real
owner data, system installation, or production readiness claims.

DAEDALUS may acquire `psql` and `pg_dump` as local client tools only, then use
them for the existing local disposable proof path if every guardrail below is
met.

## Required Guardrails

- Prefer an OS temp or user-local cache directory outside the repository. If a
  workspace-local tools directory is used, add the ignore rule before any
  download or extraction and verify `git status --short` cannot see the tools.
- Allowed local tools directory if needed: `.station-local-tools/`. It must
  stay ignored and must never be committed.
- Download only a PostgreSQL client distribution from an official, trusted
  HTTPS source. Record the version, source URL, and SHA-256 checksum only.
- Verify the downloaded archive against an official checksum or signature. If a
  reasonable checksum/signature path is unavailable, stop and wake MIMIR.
- Use archive extraction only. Do not run an MSI, package manager install,
  service install, admin console action, Docker/Supabase CLI install, or any
  permanent system PATH mutation.
- Use explicit tool paths or a process-local PATH for the current shell only.
- Run `psql --version` and `pg_dump --version`, but do not commit or paste full
  local paths if they include user-private directories.
- Do not install or start a local database server as part of this authorization.
  If no existing local disposable source/target databases are available, stop
  with an honest blocker instead of widening scope.
- Execute proof inputs must use only localhost/127.0.0.1/::1 Postgres URLs,
  explicit `--confirm-local-disposable`, explicit `--fixture-only`, and an
  artifact path outside the repository, preferably under OS temp.
- Do not print, document, or commit database URLs, passwords, tokens, raw rows,
  raw fixture bodies, dump contents, stack traces, private archive/package data,
  storage paths, or generated proof payloads.
- The accepted proof label remains exactly:
  `migration replay plus data-only logical restore`.

## DAEDALUS Scope

Allowed:

- local client acquisition under the guardrails above;
- `.gitignore` updates limited to local ignored tooling/artifact directories if
  workspace-local storage is used;
- focused script/test changes needed to run the local synthetic proof;
- docs/status/baseline updates describing only safe evidence.

Not allowed:

- hosted backup, hosted restore, hosted SQL, Supabase dashboard work, Railway
  operations, or storage operations;
- real owner data, production databases, private archive/package data, or
  committed fixture bodies;
- schema/config/package changes;
- Docker/Supabase CLI installation by inertia;
- queue/worker activation;
- claims of production backup readiness, full logical restore readiness,
  managed backup coverage, RPO/RTO, or disaster recovery readiness.

## Required DAEDALUS Validation

Before any execute proof:

```bash
node --test scripts/backup-restore-local-proof.test.mjs
node scripts/backup-restore-local-proof.mjs --help
node scripts/backup-restore-local-proof.mjs --plan --json
git status --short
git diff --check
```

After acquisition and before execute proof, also record sanitized evidence for:

- `psql --version`;
- `pg_dump --version`;
- downloaded archive SHA-256 verification;
- ignored/outside-repo tool and artifact locations;
- absence of staged/untracked dumps, archives, binaries, database files, or
  generated fixture bodies.

After any execute proof:

- rerun the harness tests;
- run `git status --short`;
- run `git diff --check`;
- confirm no dump/archive/database artifact or generated private fixture body is
  staged or untracked;
- wake ARGUS for local proof review.

If acquisition, checksum trust, ignored storage, or local disposable database
availability fails, stop and wake MIMIR with the exact blocker.

## ARGUS Validation

- `Get-Command psql, pg_dump, docker, supabase -ErrorAction SilentlyContinue`
  produced no output in this shell, confirming the preflight dependency state.
- `node --test scripts/backup-restore-local-proof.test.mjs` passed, 8 tests.
- `node scripts/backup-restore-local-proof.mjs --help` passed.
- `git diff --check` passed.
- `git diff --cached --check` passed.

## Handoff

DAEDALUS should attempt the local tooling acquisition/proof path only within
the guardrails above.
