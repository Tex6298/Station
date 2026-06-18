# PR41 - Developer Pages Staging Seed Proof

Date: 2026-06-18
Status: opened for DAEDALUS
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
