# PR532 Generated Publication Report Target Blocker ARGUS Result

Date: 2026-07-18

Owner: ARGUS / A3

Verdict:

```text
BLOCK_PR532_GENERATED_PUBLICATION_REPORT_TARGET_CONSTRAINT
```

## Decision

ARGUS confirms ARIADNE's blocker. PR532 is not accepted: the hosted flow reached
a published generated-material detail, then failed when the distinct reporter
attempted the required generated-publication report. This is a database schema
allow-list gap, not a stale deploy or a product-route mismatch.

The API route inserts:

```text
persona_encounter_cross_owner_generated_publication
```

but the tracked `moderation_reports_target_type_check` constraint from
migration 080 stops at:

```text
persona_encounter_cross_owner_public_exhibit
```

Migration 082 added generated-publication reporting/routes and moderation
restore logic, but did not extend the database target-type constraint. A hosted
HTTP 500 at report creation is therefore expected until the constraint is
repaired.

## Recovery Check

ARGUS did not run PR532 mutation or hosted schema apply. Read-only validation:

```text
node --check .station-private/pr532/operator.mjs
node --check .station-private/pr532/ariadne-rehearsal.mjs
node .station-private/pr532/operator.mjs verify
```

The first verify attempt stopped on `local_fork_main_mismatch` because
`fork/main` had not yet been fetched after the docs-only blocker commit. After
`git fetch fork main`, the same read-only verify passed:

```text
verdict: PR532_BASELINE_RESTORED
PR532 tag residue: 0
generated tables restored zero: 5
consent/audit/moderation baseline exact: true
configured account state exact: true
auth sessions and refresh exact: true
retained PR528 exact: true
migration ledger exact: 4
Railway API/web: ready, idle, main, fd1a5870b2ed
```

## Required DAEDALUS Fix

Open the narrowest next lane:

```text
PR532B_GENERATED_PUBLICATION_REPORT_TARGET_CONSTRAINT_DAEDALUS
```

DAEDALUS should add a source-only migration and focused tests. The migration
should be the next numbered Supabase migration, `089`, and should:

1. preflight that `public.moderation_reports` exists and that the current
   `moderation_reports_target_type_check` omits
   `persona_encounter_cross_owner_generated_publication`;
2. preflight that source schema dependencies exist:
   `persona_encounter_cross_owner_generated_publications`,
   `persona_encounter_cross_owner_generated_publication_audits`, and the
   moderation report active uniqueness index;
3. drop and recreate only `moderation_reports_target_type_check`;
4. preserve every existing allowed target type:
   `user`, `space`, `document`, `thread`, `comment`, `persona`,
   `persona_encounter_public_exhibit`, and
   `persona_encounter_cross_owner_public_exhibit`;
5. add exactly one new allowed target type:
   `persona_encounter_cross_owner_generated_publication`;
6. postassert from `pg_get_constraintdef` that the final allow-list contains
   all nine target types and no broad wildcard/regex relaxation;
7. avoid changes to routes, RLS, policies, foreign keys, moderation semantics,
   generated publication tables, UI, billing, storage, provider/model,
   retrieval, Redis, Cloudflare, queues, partner adapters, or existing rows.

Focused tests should fail on the current tracked migrations and pass with 089:

- a migration-source test proving the final moderation target constraint
  preserves the eight prior values and adds the generated-publication value;
- a database guardrail test, preferably local SQL/PGlite if available in repo
  patterns, proving insertion into `moderation_reports` with
  `persona_encounter_cross_owner_generated_publication` is accepted while an
  unknown target type remains rejected;
- the existing report/moderation restore tests for generated publications must
  continue to pass.

After DAEDALUS returns, ARGUS should review the source-only migration before
MIMIR applies it to hosted. PR532 must then return to ARIADNE for the complete
hosted lifecycle and desktop/mobile human-eye rehearsal; do not accept PR532
until report creation, duplicate report readback, moderation remove/restore,
participant retract/delete, cleanup, and visual states pass on hosted.

```text
WAKEUP A2:
Codename: DAEDALUS
```
