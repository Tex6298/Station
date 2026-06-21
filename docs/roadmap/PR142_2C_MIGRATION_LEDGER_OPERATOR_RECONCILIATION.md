# PR142 2C Migration Ledger Operator Reconciliation

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR141 accepted the 2C observed-runtime staging proof: staging now accepts the
Agents Observe observed-runtime delivery, receipt replay works, and public/owner
readback is proved for `station-replay-dev-alpha`.

The remaining caveat is migration history, not observed-runtime behavior:
direct-applied migrations `045`, `046`, `047`, and `048` are present/proved in
schema state, but their `supabase_migrations.schema_migrations` ledger rows
remain absent. Previous official repair attempts found the files but failed on
the Supabase pooler prepared-statement collision.

This lane should keep that ledger drift from contaminating every next roadmap
item.

## Scope

- Inspect the current migration ledger state for `045`, `046`, `047`, and `048`.
- Confirm the staged schema facts already proved by PR138-PR141:
  - `045` observed-runtime classification columns/checks/comments;
  - `046` observed-runtime supporting-context table/index/RLS/policy/comment;
  - `047` webhook receipt table/unique constraint/index/RLS/policy/comment;
  - `048` webhook signing-secret table/indexes/trigger/RLS/policy/comment.
- Try an official or clearly operator-safe ledger reconciliation path that does
  not use the broken pooler prepared-statement path if available.
- Prefer Supabase-supported commands or direct-connection tooling over manual
  SQL edits.
- If no safe official path works, produce an operator packet that records:
  - exact command/path attempted;
  - why it failed;
  - what would be needed to complete repair later;
  - why observed-runtime staging acceptance remains valid despite ledger drift.
- Do not apply new schema migrations in this lane.
- Do not hand-edit `supabase_migrations.schema_migrations` with ad hoc SQL
  unless MIMIR explicitly opens a follow-up approval lane after DAEDALUS and
  ARGUS propose the exact audited statement.

## Acceptance

One of these outcomes is acceptable:

- Ledger repaired through an official/supported path, with `045`/`046`/`047`/
  `048` rows visible and no schema widening; or
- Ledger repair remains blocked, but the blocker is precisely classified and an
  operator packet exists so future agents stop rediscovering the same pooler
  failure.

In both cases:

- The observed-runtime staging proof remains closed as accepted.
- No new schema drift is introduced.
- No secrets, credential-bearing URLs, `.env` values, Railway variables, DB
  URLs, service keys, or auth tokens are printed, written, or committed.

## Validation

Run only validation proportional to the chosen outcome:

```bash
git diff --check
```

If any code/tooling changes are made, add the focused package tests or builds
that cover them. If this remains docs/operator proof only, do not burn tokens on
unrelated full-suite validation.

For staging proof, record only safe facts:

- ledger query status classes for `045`/`046`/`047`/`048`;
- official repair command/path status;
- whether the command used a direct/non-pooler connection path;
- schema proof references, not raw connection details;
- no-secret proof.

## DAEDALUS Result

DAEDALUS completed the PR142 operator reconciliation pass on 2026-06-21. Ledger
repair remains blocked through the available official/operator-safe paths, so
the accepted outcome for this lane is the operator packet:

- `docs/ops/PR142_MIGRATION_LEDGER_OPERATOR_PACKET.md`

Current ledger state:

| Migration prefix | Ledger rows |
| --- | ---: |
| `045` | 0 |
| `046` | 0 |
| `047` | 0 |
| `048` | 0 |

Available connection classification:

- `SUPABASE_POOLER_URL` is present and is the only local Postgres path.
- `SUPABASE_DB_URL` and `SUPABASE_DIRECT_URL` are missing.
- `DATABASE_URL` and `SUPABASE_URL` are project API URLs, not Postgres URLs.
- `SUPABASE_ACCESS_TOKEN` is present, but the checkout is not linked.

Official repair attempt:

```bash
npm exec --yes supabase@latest -- migration repair --linked --status applied --workdir infra --yes 045 046 047 048 --output json
```

Result:

- The CLI used workdir `infra`.
- The command failed before database mutation because no project ref is linked
  in this checkout.
- PR142 did not rerun the known-broken pooler `--db-url` repair path; PR139
  already proved that path fails on the Supabase pooler prepared-statement
  collision before updating rows, and no direct non-pooler DB URL is available
  locally.

Schema non-widening proof:

- PR142 made no schema changes.
- Safe metadata readback confirmed the PR138-PR141 schema facts remain present:
  `045` columns/checks/comments; `046` context table/index/RLS/policy/comment;
  `047` receipt table/unique/index/RLS/policy/comment; and `048`
  signing-secret table/indexes/trigger/RLS/policy/comment.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | CRLF warnings only for touched docs and local DAEDALUS state. |

No secret values, credential-bearing URLs, `.env` values, Railway variables, DB
URLs, service keys, auth tokens, project refs, or passwords were printed,
written, or committed.

## Non-Scope

- No broad migration sweep.
- No new schema migrations.
- No manual/ad hoc ledger row insertion.
- No observed-runtime adapter or API behavior changes.
- No temporary Developer Space key smoke unless required to prove a claimed
  schema side effect.
- No signing-secret lifecycle work.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No hosted runtime, scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- ledger state before/after;
- official repair path attempted;
- schema non-widening proof;
- operator packet location if repair remains blocked;
- validation results;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if ledger repair requires an explicit manual SQL decision,
if official tooling needs external credentials not available in the repo/env, or
if the repair path would mutate anything beyond migration history.
