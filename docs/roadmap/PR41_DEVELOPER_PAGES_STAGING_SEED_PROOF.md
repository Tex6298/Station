# PR41 - Developer Pages Staging Seed Proof

Date: 2026-06-18
Status: implemented by DAEDALUS, ready for ARGUS review
Owner: DAEDALUS fixes/proves, ARGUS reviews, ARIADNE rechecks deployed public
page after seed is true.

## Purpose

Make PR40 true on the live staging target before ARIADNE does the human recheck.

ARGUS accepted the PR40 code path, but MIMIR's attempt to seed the staging
Developer Page evidence found an operational blocker in the current Supabase
target.

## MIMIR Seed Attempt

MIMIR ran:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
```

Result 1:

- failed because the ignored local corpus did not yet include
  `developerSpace.documents`;
- MIMIR updated the ignored local synthetic corpus to include methodology,
  finding, and field-log public evidence entries matching the PR40 example
  corpus.

Result 2:

- failed with:

```text
Supabase request failed: new row for relation "documents" violates check constraint "documents_document_type_check"
```

The seed was inserting Developer Page evidence documents whose document types
are `research` and `field_log`.

## Suspected Cause

The current code and migrations expect the launch document taxonomy:

```text
essay, codex, manifesto, field_log, research, archive_note, transcript
```

Migration `032_station_document_type_alignment.sql` should have dropped and
recreated `documents_document_type_check` with that taxonomy.

The live seed failure suggests one of these is true:

- the active `.env` Supabase target is not the same target that previously had
  migration `032` applied;
- migration `032` is recorded but the constraint on the active target is still
  stale;
- the seed path is hitting a database target with older `post`/`update` style
  document types;
- or the staging replay seed needs a compatibility guard before inserting
  PR40 evidence.

## Scope

DAEDALUS should:

- Identify the active Supabase target used by `.env` without printing secrets.
- Prove the current `documents_document_type_check` definition or otherwise
  prove the accepted document types.
- Prove whether `032_station_document_type_alignment` is applied on that same
  target.
- Prefer applying or repairing the existing idempotent migration shape so the
  database matches the launch taxonomy.
- Only fall back to seed compatibility mapping if database migration repair is
  impossible or unsafe; if using a fallback, keep Developer Space link roles
  (`methodology`, `finding`, `field_log`) as the public semantic source of
  truth and explain the tradeoff to ARGUS.
- Rerun the staging replay seed successfully.
- Confirm anonymous/public read of `/developer-spaces/station-replay-dev-alpha`
  or the API detail includes the public methodology/finding/field-log evidence
  and excludes private drafts.

## Non-Scope

- Do not widen PR40 product scope.
- Do not add Project abstraction, Tier 2 hosting, developer agent, chat-native
  tools, DexOS-specific widgets, tipping, public interaction modes, Tier 3, or
  Cloudflare.
- Do not print database URLs, keys, JWTs, tokens, cookies, passwords, or raw
  private corpus text.
- Do not commit the ignored local replay corpus.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
git diff --check
```

If a migration or seed-script change is required, also run the narrow tests
that cover touched behavior:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
```

## Handoff

If fixed/proven, wake ARGUS with:

- the constraint/migration proof;
- what was changed or applied;
- successful seed proof;
- public evidence readback proof;
- validation results;
- whether ARIADNE can recheck the deployed public page.

If blocked, wake MIMIR with the exact missing tool/config or unsafe migration
condition.

## DAEDALUS Proof

DAEDALUS confirmed the active `.env` Supabase project ref without printing
secrets. The direct `DATABASE_URL` host did not resolve from this Windows
workspace, but the configured `SUPABASE_POOLER_URL` reached the same project
ref and database.

Live database proof on that target:

- `documents_document_type_check` already accepts the launch taxonomy:
  `essay`, `codex`, `manifesto`, `field_log`, `research`, `archive_note`, and
  `transcript`.
- `supabase_migrations.schema_migrations` records version `20260617053200`
  with name `032_station_document_type_alignment`.
- No DDL was applied during PR41 because the live constraint and migration
  ledger were already correct.

The remaining seed failure came from the ignored local replay corpus, not from
the PR40 Developer Space evidence documents. The local public Space document
still carried the legacy alpha document type `post`, while the new Developer
Space evidence documents were already `research`, `research`, and `field_log`.

DAEDALUS updated `scripts/staging-replay-seed.mjs` to normalize only the legacy
alpha document types covered by migration 032 before writing replay documents:

- `post` -> `essay`
- `constitution` -> `codex`
- `update` -> `field_log`
- `other` -> `archive_note`

Unsupported replay document types now fail fast. Developer Space link roles
remain the public semantic source of truth: `methodology`, `finding`, and
`field_log`.

Staging seed proof:

- `npm exec --yes pnpm@10.32.1 -- run replay:seed:staging` passed.
- Seed summary reported 3 Developer Space evidence documents for
  `station-replay-dev-alpha` with roles `methodology`, `finding`, and
  `field_log`.

Public readback proof:

- The local API URL in `.env` points to `localhost`, so no deployed anonymous
  API endpoint was configured in this shell.
- DAEDALUS read the same public predicate used by the route directly from
  Supabase: public Developer Space, public document links, and linked documents
  that are both `published` and `public`.
- Readback returned 3 rows with roles `methodology`, `finding`, and
  `field_log`; document types `research`, `research`, and `field_log`; and no
  private or draft rows exposed by that public predicate.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

All passed. `git diff --check` reported only the known CRLF normalization
warnings.
