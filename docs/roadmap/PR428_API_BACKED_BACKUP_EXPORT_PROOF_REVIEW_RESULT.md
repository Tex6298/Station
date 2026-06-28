# PR428 - API-Backed Backup/Export Proof Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted after narrow ARGUS test patch - wake MIMIR

## Verdict

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

PR428 is accepted as an API-backed owner export and bundle integrity proof for
the three accepted export classes:

- persona archive;
- Developer Space archive;
- Project manifest.

The implementation stays inside the accepted lane. It strengthens local
API/test-fixture proof for existing authenticated export routes and does not
change product route behavior.

## ARGUS Patch

DAEDALUS covered the right proof shape, but ARGUS found one validation gap:
anonymous readback/create boundaries were partly implicit through shared auth
middleware instead of directly asserted for every accepted export class.

ARGUS added narrow assertions in `apps/api/src/routes/exports.test.ts`:

- anonymous package readback returns `401` for persona, Developer Space, and
  Project export packages;
- anonymous Project export create returns `401`;
- other-owner persona and Developer Space package-list requests return `404`.

No product code changed.

## Review Findings

Implementation match:

- `apps/api/src/routes/exports.test.ts` now recomputes SHA-256 from in-memory
  bundle file contents and compares each value with both the file entry and
  bundle integrity map.
- Persona, Developer Space, and Project bundles all prove the expected file set:
  `README.md`, `manifest.json`, and `manifest.md`.
- Project bundle readback still proves stored package readback by mutating live
  source rows after package creation and verifying the bundle returns the
  stored manifest and Markdown.

Privacy and owner scope:

- Anonymous access is directly rejected across create/list/read/bundle coverage
  for the accepted export classes.
- Other-owner access remains blocked for list/create/read/bundle surfaces that
  could otherwise leak owner export package state.
- Existing bundle tests continue to reject private bodies, IDs, owner fields,
  storage/provider strings, and private linked-source data from Project bundle
  output.

Secrets and evidence:

- No raw manifests, raw bundles, private source text, transcript bodies,
  prompts, completions, provider payloads, database URLs, storage paths,
  cookies, tokens, secrets, or environment values were added to docs, logs, UI,
  or committed proof artifacts.
- The committed proof evidence is sanitized route/package/bundle-integrity
  evidence only.

Scope and claims:

- PR427 local PostgreSQL tooling remains superseded.
- No `psql`, `pg_dump`, Docker, Supabase CLI, database dump/restore, hosted SQL,
  dashboard workflow, storage operation, schema/config/package change, hosted
  runtime, worker, queue, Redis, Cloudflare, provider/model, billing, Stripe,
  partner adapter, or UI product surface was introduced.
- The result remains local-fixture API proof only. It does not claim hosted
  backup readiness, database backup/restore, managed backup redundancy,
  full-workspace backup, storage-object backup, original binary/PDF/file
  backup, disaster recovery, RPO/RTO, or hosted data coverage.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 tests passed after the ARGUS anonymous/readback boundary patch. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risk

PR428 proves local API-backed owner export package and bundle integrity for the
three accepted export classes. It still does not prove hosted production backup
readiness, database backup/restore, managed backup redundancy, storage-object
backup, original binary/PDF/file backup, full workspace backup, disaster
recovery, RPO/RTO, or hosted data coverage.
