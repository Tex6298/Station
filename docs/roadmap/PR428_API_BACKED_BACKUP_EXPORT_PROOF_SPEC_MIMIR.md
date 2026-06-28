# PR428 - API-Backed Backup/Export Proof Spec

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARGUS / A3

Status: open - review before DAEDALUS implementation

## Why This Lane

Marty corrected the PR427 premise in commit `690c26cb`: local Postgres tooling
is not the intended unblock for this proof. Station has an API-backed path
available, so the next honest lane is a narrow proof spec for existing
owner-only export and bundle readback surfaces.

PR427 local tooling is superseded. DAEDALUS must not acquire or wire local
`psql` or `pg_dump` for this lane.

## Existing API-Backed Path

Persona archive exports:

- `POST /exports/persona/:personaId`
- `GET /exports/persona/:personaId`
- `GET /exports/:id`
- `GET /exports/:id/bundle`

Developer Space exports:

- `POST /exports/developer-spaces/:spaceId`
- `GET /exports/developer-spaces/:spaceId`
- `GET /exports/:id`
- `GET /exports/:id/bundle`

Project manifest exports:

- `POST /exports/projects/:projectIdOrSlug`
- `GET /exports/projects/:projectIdOrSlug`
- `GET /exports/:id`
- `GET /exports/:id/bundle`

Relevant implementation and proof context:

- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/web/components/studio/archive-export-status.tsx`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/components/projects/project-export-panel.tsx`
- `docs/roadmap/PRODUCTION_EXPORT_ERROR_RESPONSE_RESULT.md`
- `docs/roadmap/PRODUCTION_EXPORT_ERROR_RESPONSE_REVIEW_RESULT.md`
- `docs/roadmap/UX02C_GLOBAL_ARCHIVE_TRUST_READBACK_RESULT.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/STAGING_DEMO_READINESS_ARIADNE.md`

## Proposed Proof Name

Use:

```text
API-backed owner export and bundle integrity proof
```

Do not call it:

- database restore proof;
- managed backup proof;
- full workspace backup;
- production disaster recovery;
- hosted backup readiness.

## Proposed Proof Shape

DAEDALUS may implement this only if ARGUS accepts the boundary.

1. Use an authenticated owner session against local or hosted API.
2. Select owner-owned replay/staging proof targets.
3. Create or reuse owner-only export packages through the API.
4. Read the export package and manifest through `GET /exports/:id`.
5. Read the bundle through `GET /exports/:id/bundle`.
6. Parse the bundle in memory.
7. Verify package kind, format, status, owner-only privacy posture, file set,
   SHA-256 map, schema, summary counts, section names, and private/public
   separation.
8. Record only sanitized proof output: route class, package kind, status, file
   names, file sizes, hash prefixes, counts, and pass/fail.

ARGUS should decide whether the first accepted proof must cover persona export
only, or persona plus Developer Space plus Project exports.

## Boundaries

Do not include:

- local `psql`, local `pg_dump`, Docker, Supabase CLI, database dump, database
  restore, hosted SQL, or Supabase dashboard work;
- real owner data beyond the existing replay/staging proof account;
- storage object backup or original binary/PDF/file backup claims;
- raw manifests, raw bundles, private source bodies, transcript bodies, UUIDs,
  database URLs, provider payloads, prompts, completions, cookies, tokens, or
  secrets in docs/logs;
- Redis, Cloudflare, provider/model, embedding, worker, queue, billing, Stripe,
  schema, package, or migration changes;
- broad UI redesign or new product surface claims.

## ARGUS Review Questions

ARGUS should answer:

1. Is the proposed proof name honest?
2. Are the sanitized evidence rules sufficient?
3. Is persona-only enough for PR428, or should Developer Space and Project
   export readback be included in the first implementation?
4. Which tests must DAEDALUS run?
5. Should this proof run against local API only, hosted staging only, or both?

## Expected Validation If Accepted

Minimum expected gates:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

ARGUS may narrow or extend this list based on the accepted proof target set.

## Wakeup

Wake DAEDALUS if accepted, with exact proof scope and guardrails.

Wake MIMIR if the spec overclaims, needs product correction, or cannot be made
safe without widening scope.
