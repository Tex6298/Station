# PR511A - Cross-Owner Encounter Consent Ledger Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Status: Closed locally and hosted migration applied

## Verdict

MIMIR closes PR511A as:

```text
CLOSE_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_ACCEPTED_LOCALLY
```

ARGUS accepted PR511A after the narrow audit-atomicity patch documented in:

`docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_REVIEW_RESULT.md`

## Scope Closed

PR511A is accepted as a ledger-only foundation:

- dedicated cross-owner consent and audit tables;
- authenticated participant-scoped create, list, detail, approve, reject,
  cancel, and revoke routes;
- bounded consent states and requested scopes;
- participant owner readback without raw owner/persona id exposure;
- every requested scope remains `executable: false`;
- consent mutations and audit insertion happen inside database functions;
- the database functions are `security invoker`.

Still blocked:

- cross-owner runtime;
- private cross-owner saved artifacts;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, and public surfacing;
- Discover/search/feed surfacing;
- provider/retrieval, billing/storage/social, Redis/Cloudflare, queues/workers,
  package/lockfile, and broad UI drift.

## Hosted Migration Closeout

MIMIR applied hosted migration `077` to the configured Supabase target:

`infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql`

Because the Supabase CLI `db query --file` path cannot execute multi-command
SQL files as one prepared statement, MIMIR applied the migration
statement-by-statement from the checked-in file, then recorded the hosted
migration ledger row explicitly:

```text
version: 20260711153000
name: 077_persona_encounter_cross_owner_consents
created_by: mimir
```

MIMIR also requested a PostgREST schema cache reload with:

```text
notify pgrst, 'reload schema';
```

## Hosted Shape Verified

Sanitized hosted checks confirmed:

- the migration ledger contains
  `077_persona_encounter_cross_owner_consents`;
- hosted tables exist:
  - `persona_encounter_cross_owner_consents`;
  - `persona_encounter_cross_owner_consent_audit_events`;
- hosted functions exist and are not security-definer:
  - `create_persona_encounter_cross_owner_consent`;
  - `transition_persona_encounter_cross_owner_consent`;
- RLS policy counts are present:
  - consent table: `2`;
  - audit table: `1`.

No secrets, raw ids, hosted row bodies, tokens, cookies, or private setup values
were printed in the closeout.

## Validation Inherited

ARGUS validation remains the accepted local validation floor:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` passed with
  `43` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with `7` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with `201`
  tests;
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed;
- changed-path, forbidden-path, forbidden side-effect, secret-shaped value,
  `git diff --check`, and `git diff --cached --check` scans passed.

## Next

ARIADNE gets the hosted proof lane:

`docs/roadmap/PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF_ARIADNE.md`

