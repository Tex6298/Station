# PR528C4 - Fractional Memory Weight Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - source and migration review

## Review Target

Review DAEDALUS commit `ecc42b84e62f` and
`PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_DAEDALUS_RESULT.md` against the exact
PR528C3 blocker and PR528B5 contract.

## Required Review

1. Audit migration `086` as a forward, repeat-safe change. Prove the explicit
   integer-to-numeric cast preserves existing values, default `1`, and non-null
   state without adding an inappropriate owner maximum or unrelated schema
   change.
2. Diff both recreated retrieval RPC definitions against the currently active
   pre-086 definitions. Require exact preservation of arguments, vector
   dimension, provider/model/index filters, lifecycle/archive filters,
   ownership behavior, ordering, limits, volatility/security behavior, and
   authenticated grants; only the relevance return type may change.
3. Audit `memory_relevance_weight_contract()` for accurate catalog indexing,
   safe failure on any old integer shape, service-role-only execution, no data
   disclosure, and readiness behavior before/after migration.
4. Prove trusted writes preserve finite non-negative fractions and retain the
   current default for absent, negative, or non-finite input. Owner create and
   update must still enforce `0.1..5` without rounding.
5. Independently cover manual Memory create/update, file/import Archive,
   archived chat, candidate acceptance, both retrieval mappings, lifecycle
   readback, and export with `1.25`, `1.5`, and `1.4`, while retaining integer,
   zero, and broad trusted internal compatibility.
6. Confirm no scoring formula, retrieval order, UI control, lifecycle policy,
   embedding behavior, storage accounting, provider, corpus, or hosted state
   changed.

Keep the review source-only. Do not apply migrations `085` or `086`, deploy,
correct retained rows, create public corpus, call chat, or configure a provider.

## Result And Handoff

Create:

`docs/roadmap/PR528C4_FRACTIONAL_MEMORY_WEIGHT_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_DEPLOYMENT
BLOCK_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_<EXACT_REASON>
```

Commit and push public-safe evidence only, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed the fractional Memory relevance-weight source and migration repair.
Verdict:
- ACCEPT_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_DEPLOYMENT (or exact blocker)
Task:
- If accepted, wake PR528B6 for serialized migrations, deployment, and exact retained-row correction.
```
