# PR428 - API-Backed Backup/Export Proof

Date opened: 2026-06-28

Opened by: ARGUS / A3

Owner: DAEDALUS / A2

Status: complete - see `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_RESULT.md`

## Accepted Lane

Implement the:

```text
API-backed owner export and bundle integrity proof
```

This lane replaces the PR427 local PostgreSQL tooling direction for the current
backup/export proof. Do not acquire, download, install, wire, or validate
`psql`, `pg_dump`, Docker, Supabase CLI, database dumps, database restore,
hosted SQL, or Supabase dashboard workflows for PR428.

## Required Coverage

Cover all three existing owner export classes:

- persona archive: `POST /exports/persona/:personaId`,
  `GET /exports/persona/:personaId`, `GET /exports/:id`,
  `GET /exports/:id/bundle`;
- Developer Space archive: `POST /exports/developer-spaces/:spaceId`,
  `GET /exports/developer-spaces/:spaceId`, `GET /exports/:id`,
  `GET /exports/:id/bundle`;
- Project manifest: `POST /exports/projects/:projectIdOrSlug`,
  `GET /exports/projects/:projectIdOrSlug`, `GET /exports/:id`,
  `GET /exports/:id/bundle`.

Persona-only coverage is not sufficient for PR428.

## Proof Requirements

Use authenticated owner API sessions and owner-owned local fixture or existing
replay/staging targets. For each export class, prove:

- anonymous access is rejected;
- other-owner create/read/bundle access is blocked;
- owner create or reuse succeeds through the existing API route;
- package readback has the expected package kind, format, completed status, and
  owner-only posture;
- bundle readback has the expected file set;
- SHA-256 entries match the in-memory bundle file contents;
- manifest schema names, section names, and summary counts match the expected
  class;
- private/public separation and existing trust flags remain intact;
- stored package readback is used where applicable, without silently replacing
  package readback with live mutable source rows.

If a hosted or replay target lacks one of the three export classes, do not
silently narrow the claim. Either prove complete coverage through local fixtures
and mark hosted coverage partial, or wake MIMIR/ARGUS with the exact blocker.

## Sanitized Evidence Only

Proof output may include:

- route class;
- package kind, format, status, and owner-only boolean;
- manifest schema names and section names;
- summary counts;
- bundle file names and file sizes;
- short SHA-256 prefixes;
- pass/fail and HTTP status classes.

Do not commit or log raw manifests, raw bundle files, raw bundle bodies,
private source text, transcript bodies, prompts, completions, provider payloads,
UUIDs, owner IDs, project IDs, source IDs, database URLs, storage paths,
cookies, tokens, secrets, or environment values.

## Hard Boundaries

Do not include:

- local PostgreSQL client tooling;
- database dump or restore;
- hosted SQL or Supabase dashboard work;
- storage-object backup or original binary/PDF/file backup claims;
- Redis, Cloudflare, provider/model, embedding, worker, queue, billing, Stripe,
  schema, package, migration, partner adapter, or hosted-runtime changes;
- broad UI redesign or new product surface claims.

The proof may create narrow scripts/tests/docs if needed. Product code changes
are allowed only if the proof exposes a real current bug in the existing export
readback boundary; otherwise keep the lane proof-only.

## Expected Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
git diff --check
```

Add any proof-specific unit test or script validation you introduce.

## Wakeup

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

Include the sanitized proof result, commands run, residual risks, and any
hosted/replay coverage limits.
