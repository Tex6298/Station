# PR428 - API-Backed Backup/Export Proof Spec Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted - wake DAEDALUS

## Verdict

ARGUS accepts the PR428 proof boundary as:

```text
API-backed owner export and bundle integrity proof
```

This is an honest name only if the implementation proves the existing
authenticated owner export APIs and bundle readback paths. It must not be
described as a database restore proof, managed backup proof, full workspace
backup, hosted backup readiness, production disaster recovery, RPO/RTO, or
storage-object backup.

PR427 local PostgreSQL tooling acquisition is superseded for this lane.
DAEDALUS must not download, install, wire, or validate `psql`, `pg_dump`,
Docker, Supabase CLI, database dumps, database restore, hosted SQL, or
dashboard workflows for PR428.

## Accepted Scope

The first PR428 proof must cover all three currently documented export classes:

- persona archive exports: `persona_archive`;
- Developer Space archive exports: `developer_space_archive`;
- Project manifest exports: `project_manifest`.

Persona-only proof is not enough for this lane. The roadmap already names the
Developer Space and Project API-backed export paths, and accepting persona-only
would make the proof title too easy to over-read as broader export coverage.

## Accepted Evidence Rules

DAEDALUS may create a proof that uses authenticated owner sessions against the
local API and, only if already available, existing replay/staging owner-owned
targets.

The proof may record only sanitized evidence:

- route class: persona, Developer Space, or Project;
- package kind, package format, completed status, and owner-only privacy flag;
- manifest schema names and expected section names;
- summary counts;
- bundle file names and file sizes;
- SHA-256 hash prefixes, not full bundle bodies;
- pass/fail and HTTP status classes.

The proof must not write raw bundles or raw manifests into committed files,
docs, logs, or screenshots. It must not record private source bodies,
transcript bodies, raw document text, prompts, completions, provider payloads,
UUIDs, owner IDs, project IDs, source IDs, database URLs, storage paths,
cookies, tokens, secrets, or environment values.

## Required Proof Checks

At minimum, DAEDALUS should prove for each accepted export class:

- anonymous access is rejected;
- other-owner create/read/bundle access stays blocked;
- owner create or reuse succeeds through the existing API route;
- package readback reports the expected kind, format, completed status, and
  owner-only posture;
- bundle readback contains the expected file set;
- the bundle SHA-256 map matches the in-memory file contents;
- manifest schema, summary counts, and section names match the expected class;
- private/public separation and existing trust flags remain intact;
- stored package readback is used where applicable, without silently switching
  to live mutable source rows.

If hosted or replay targets lack one of the three export classes, DAEDALUS must
not silently narrow the claim. Use local fixtures for complete coverage and
record hosted coverage as partial, or wake MIMIR/ARGUS with the exact blocker.

## Boundary Checks

No Redis, Cloudflare, provider/model, embedding, worker, queue, billing, Stripe,
schema, package, migration, broad UI, hosted runtime, partner adapter, storage
object backup, original binary/PDF/file backup, or product-surface redesign is
authorized by PR428.

Existing source truth reviewed:

- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_MIMIR.md`
- `docs/roadmap/PRODUCTION_EXPORT_ERROR_RESPONSE_REVIEW_RESULT.md`
- `docs/roadmap/UX02C_GLOBAL_ARCHIVE_TRUST_READBACK_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`

## ARGUS Validation

ARGUS ran the accepted review gates:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 tests passed; persona, Developer Space, and Project export bundle readback coverage remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; authenticated owner replay readiness and sanitized trace detail remain green. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 17 tests passed; Project owner/public scoping and export UI helpers remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed; Developer Space owner scope, secret handling, observatory, and non-executing agent-action coverage remain green. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risk

PR428 can prove API-backed export package and bundle integrity. It still does
not prove database backup/restore, managed backup redundancy, storage-object
backup, full workspace backup, hosted production backup readiness, or disaster
recovery.

