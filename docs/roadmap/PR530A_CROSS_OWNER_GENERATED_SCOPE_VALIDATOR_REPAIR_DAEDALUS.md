# PR530A - Cross-Owner Generated Scope Validator Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-18

Status:

```text
OPEN_IMPLEMENTATION
```

## Accepted Preflight Truth

ARGUS blocks treating one function replacement as the whole hosted unblock,
because hosted also lacks the accepted PR522/PR524A generated artifact,
revision, approval, publication, and publication-audit schema chain.

ARGUS nevertheless accepts one exact source repair as the first serialized
step:

`docs/roadmap/PR530_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK_PREFLIGHT_RESULT.md`

Migration 077's validator omits `publish_exact_generated_revision` and caps
valid scope arrays at seven, while the current API/types contain exactly eight
allowed scopes and migration 082 requires the omitted scope. Historical
migration 077 must remain unchanged.

## Implementation Scope

Add exactly one forward migration:

```text
infra/supabase/migrations/087_persona_encounter_cross_owner_scope_validator.sql
```

It must:

1. run inside an explicit transaction;
2. take a PR530-specific advisory transaction lock;
3. fail before mutation unless the existing validator, consent table,
   consent-audit table, and their two validated CHECK constraints exist;
4. `create or replace` only
   `public.persona_encounter_cross_owner_consent_scopes_valid(text[])`;
5. keep the function SQL, immutable, and fail-closed;
6. require a non-null array with cardinality between one and eight;
7. reject null elements and allow exactly the eight scope labels shared by the
   current API and database types, including
   `publish_exact_generated_revision`;
8. preserve current duplicate handling; do not invent a DB uniqueness rule;
9. assert after replacement that both CHECK constraints remain validated,
   continue to call the validator, and all existing consent/audit rows validate;
10. notify PostgREST schema reload and commit.

Do not drop/recreate either table or CHECK constraint unless a catalog assertion
proves the accepted function-replacement contract impossible. If that occurs,
stop and wake MIMIR with the exact catalog evidence rather than improvising.

## Tests

Extend the focused persona-encounter migration/API contract tests without
weakening existing assertions. Prove at minimum:

- migration 087 is transactional, guarded, forward-only, and leaves migration
  077 untouched;
- the migration's allowed scope set exactly equals both the API constant and
  `PersonaEncounterCrossOwnerConsentRequestedScope` contract;
- null, empty, null-element, unknown, ninth, and mixed invalid arrays fail;
- `publish_exact_generated_revision` alone succeeds;
- the exact PR524B two-scope set succeeds;
- duplicate inputs do not widen execution semantics;
- legacy invitation and lifecycle tests remain green;
- generated artifact/revision/approval/publication, moderation, retract/delete,
  and public-detail tests remain green;
- no generated list, search, feed, persona-chat context, or unrelated placement
  is introduced.

Use an executable disposable PostgreSQL/PGlite proof if the repository's
current test tooling can run the relevant migration chain faithfully. If not,
record the precise limitation and keep static contract assertions honest; do
not claim execution evidence that was not run.

## Required Validation

Run at minimum:

```text
pnpm run test:persona-encounters
pnpm run test:reports
pnpm --filter @station/api typecheck
pnpm --filter @station/db build
```

Run any narrower migration/catalog test added by this lane and report exact
counts. Do not deploy or mutate hosted state in PR530A.

## Guardrails

- Do not edit historical migrations 077, 081, or 082.
- Do not change API route behavior unless a focused test-only seam is strictly
  required; stop for MIMIR if production route code would need expansion.
- Do not add new scopes or alter consent states, participant authorization,
  RLS, audit immutability, digest approval, moderation, or public payloads.
- Do not mix PR529, provider, retrieval, embedding, Redis, Cloudflare, billing,
  Archive, Memory, UI, deployment, or product-data work into this lane.
- Work with concurrent state-file updates and never stage
  `.station-agents/state/*` as product changes.

## Expected Output

Create:

```text
docs/roadmap/PR530A_CROSS_OWNER_GENERATED_SCOPE_VALIDATOR_REPAIR_RESULT.md
```

Include exact changed files, migration contract, validation commands/counts,
limitations, and hosted no-mutation confirmation.

## Handoff

Commit the implementation and result, then wake ARGUS directly for hostile
review. ARGUS must commit a review result and wake MIMIR; nobody may stop
silently.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the bounded PR530A validator repair.
Task:
- Review migration 087, focused tests, and no-drift boundaries.
- Commit the review result and explicitly wake MIMIR with verdict.
```
