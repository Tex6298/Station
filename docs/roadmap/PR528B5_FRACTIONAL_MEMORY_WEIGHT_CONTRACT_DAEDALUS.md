# PR528B5 - Fractional Memory Weight Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - bounded source and migration repair

## Purpose

Make Station persist the fractional Memory relevance weights its UI and API
already advertise. This removes the sole PR528C3 blocker without changing the
retained private corpus or widening retrieval behavior.

## Scope

Implement the smallest repair specified in
`PR528C3_PRIVATE_PARTNER_CORPUS_REVIEW_ARGUS_RESULT.md`:

1. Add forward migration `086`; do not edit historical migrations. Change
   `public.memory_items.relevance_weight` from `integer` to `numeric` using an
   explicit preserving cast. Keep the column non-null and its existing default.
   Do not add the owner route's maximum as a global database constraint because
   existing internal weights legitimately exceed `5`.
2. In the same migration, replace the current `match_memory_items` and
   `match_private_archive_chunks` functions so their `relevance_weight` return
   columns are `numeric`. Preserve argument signatures, filters, ordering,
   security characteristics, ownership boundaries, and grants exactly.
3. Remove integer rounding from `memoryRelevanceWeight()`. Preserve a finite
   non-negative fractional value and retain the existing default for absent or
   invalid internal input.
4. Keep owner create/update validation at the current `0.1..5` contract. Do not
   silently round, clamp a valid fraction, or change the Studio slider/copy.
5. Add a migration/catalog readiness proof that distinguishes numeric from
   integer storage, plus focused round-trip tests for manual Memory create and
   update, Archive/file import (`1.5`), archived chat (`1.4`), candidate
   acceptance, retrieval RPCs, owner/lifecycle readback, and export.
6. Regenerate database types and update only the exact tests/contracts required
   by the numeric persistence change.

## Boundary

- No hosted migration, deployment, retained-row correction, corpus cleanup,
  account write, public corpus, chat, provider, billing, queue, or Cloudflare
  change.
- Do not alter relevance scoring formulas, ordering precedence, embedding
  behavior, Memory lifecycle policy, storage accounting, or API ranges.
- Do not rewrite existing integer test fixtures merely to make assertions
  weaker; add fractional cases while preserving integer compatibility.
- PR528B6 remains queued until ARGUS accepts this source/migration lane.

## Expected Files

- `infra/supabase/migrations/086_fractional_memory_relevance_weight.sql`
- `apps/api/src/services/archive.service.ts`
- `apps/api/src/services/readiness.service.ts` and focused readiness tests
- `packages/db/src/types.ts` if regeneration changes the representation
- the smallest Memory, Archive/import, conversation, retrieval, lifecycle, and
  export tests needed for exact fractional round trips
- this result and DAEDALUS state

Name every additional file and its necessity in the result.

## Acceptance

- `1.25`, `1.5`, and `1.4` survive create/update/import/retrieval/readback
  without rounding; existing integer values remain exact.
- The two retrieval RPCs return numeric relevance weights with all current
  owner, lifecycle, archive-source, similarity, and ordering behavior intact.
- Hosted readiness would fail against an integer column or old RPC return type
  and pass only after migration `086` is present.
- Owner API bounds remain `0.1..5`; broad internal values remain supported.
- Relevant DB/types, API, AI retrieval, Memory, Archive/import, conversation,
  lifecycle UI, export, typecheck/lint, and `git diff --check` gates pass.
- No hosted state is read or mutated.

## Result And Handoff

Create:

`docs/roadmap/PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_ARGUS
```

Commit and push the bounded lane, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the fractional Memory relevance-weight source and migration repair.
Verdict:
- READY_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS source/migration review before any hosted correction.
```
