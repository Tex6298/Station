# PR530 - Cross-Owner Generated Scope Schema Unblock Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-18

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR524A locally accepted the first dedicated cross-owner generated-material
publication contract. PR524B then blocked customer-facing closeout because the
hosted consent RPC rejected the two required scopes with HTTP 500:

```text
save_private_cross_owner_artifact
publish_exact_generated_revision
```

The blocker was recorded as hosted schema/RPC freshness. Current source review
now exposes the narrower defect that must be resolved before rerunning PR524B:

- the API and database types admit eight consent scopes, including
  `publish_exact_generated_revision`;
- migration 082 requires that exact scope for generated publication;
- migration 077's immutable
  `persona_encounter_cross_owner_consent_scopes_valid(text[])` function admits
  only seven scopes and omits `publish_exact_generated_revision`;
- the same function limits array cardinality to seven while the current API
  contract contains eight distinct valid scopes.

Later migrations and deployments do not automatically replace that validator.
PR530 is the smallest numbered Phase 3 unblock; it is not a new feature or a
broad schema sweep.

## Preflight Questions

Answer directly:

1. Does the committed migration chain reject
   `publish_exact_generated_revision` on a clean database as well as hosted, or
   is any additional hosted-only drift present?
2. Is one new additive migration the correct repair, leaving historical
   migration 077 immutable?
3. Must that migration replace only
   `persona_encounter_cross_owner_consent_scopes_valid(text[])`, raising the
   maximum cardinality from seven to eight and allowing exactly the API/type
   scope set, with no wildcard or unknown future scope?
4. Because existing CHECK constraints call this immutable function, is function
   replacement sufficient, or must constraints be revalidated explicitly?
5. What replay/idempotency guard and catalog assertions are required?
6. What existing-row, duplicate-scope, null, empty, ninth/unknown-scope, and
   mixed valid/invalid tests must fail closed?
7. What direct RPC/API tests must prove the required two-scope invitation now
   saves while legacy scopes and consent lifecycle behavior do not drift?
8. What read-only hosted precheck is required before DAEDALUS may deploy the
   migration?
9. After accepted implementation and deployment, may ARIADNE resume the exact
   PR524B hosted proof, or is another concrete blocker present?

If the proposed one-migration repair is insufficient, name the exact blocker
and the smallest bounded replacement lane. Do not broaden into a general
migration audit.

## Required Evidence

Inspect at minimum:

- `infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql`;
- `infra/supabase/migrations/081_persona_encounter_cross_owner_generated_artifacts.sql`;
- `infra/supabase/migrations/082_persona_encounter_cross_owner_generated_publications.sql`;
- `apps/api/src/routes/persona-encounters.ts` and its focused tests;
- `packages/db/src/types.ts`;
- PR524A's implementation/review results and PR524B's blocked hosted result;
- the current hosted function definition, constraint definitions, migration
  ledger, and retained cross-owner consent rows using read-only inspection.

## Guardrails

- Do not edit historical migration 077.
- Do not deploy, mutate hosted data, or rerun PR524B in this preflight.
- Do not add speculative consent scopes, loosen owner/participant boundaries,
  change consent lifecycle states, or weaken append-only audit behavior.
- Do not mix provider routing, retrieval, embeddings, Redis, Cloudflare,
  billing, Archive, Memory, UI, public placement, or PR529 work into PR530.
- Preserve all accepted PR511 through PR524 ownership, privacy, moderation,
  digest, revision, and exact-text publication boundaries.

## Expected Output

Create:

```text
docs/roadmap/PR530_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK_PREFLIGHT_RESULT.md
```

Include:

- verdict and root-cause classification;
- exact additive migration contract or exact blocker;
- required catalog, migration, RPC/API, and no-drift tests;
- hosted precheck/deployment/rehearsal sequence;
- the next owner and wakeup.

## Wakeup

Wake MIMIR with exactly one of:

```text
ACCEPT_PR530A_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK
BLOCK_PR530_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK_PREFLIGHT
```
