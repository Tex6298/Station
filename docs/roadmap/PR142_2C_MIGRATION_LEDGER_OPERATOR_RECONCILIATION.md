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
