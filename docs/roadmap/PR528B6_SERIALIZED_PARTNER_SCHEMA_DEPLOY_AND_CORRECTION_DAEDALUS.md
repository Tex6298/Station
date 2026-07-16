# PR528B6 - Serialized Partner Schema Deploy And Correction

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Queued - do not start before a fresh MIMIR wakeup

## Purpose

After ARGUS accepts PR528B5, serialize the two accepted additive migrations,
deploy the exact reviewed source, and correct only the three retained private
corpus relevance weights.

## Required Sequence

1. Confirm no other hosted mutation/rehearsal lane is active and take a private
   pre-run snapshot bound to the encrypted PR528 ledger.
2. Apply migration `085` (document summary), then migration `086` (fractional
   Memory relevance weight) to the intended hosted Supabase target.
3. Verify migration ledger/hash and catalog shape: nullable bounded document
   summary, numeric non-null Memory weight/default, and numeric return columns
   on both retrieval RPCs.
4. Deploy one exact source SHA containing the accepted theme, summary, and
   fractional-weight repairs. Require Railway web/API readiness and
   `/health/deployment` success on that same SHA.
5. Decrypt retained identifiers only in-process. Update exactly two recorded
   curated Memory rows from `1` to `1.25` and exactly one recorded Archive row
   from `2` to `1.5`, scoped by expected owner, persona, IDs, source classes,
   and current values. Require exactly three affected rows.
6. Read back the three fractions and prove content, summaries, source links,
   embeddings/metadata, lifecycle state, storage accounting, and all unrelated
   retained rows remain unchanged. Record only expected update-timestamp effects
   privately.
7. Re-run anonymous/cross-owner/search leakage, forbidden-scope, provider-call,
   health, and clean deployment checks.

## Boundary

- No public corpus creation, chat/provider configuration, corpus recreation,
  cleanup, billing, engagement, moderation, queue, or Cloudflare work.
- Never print or commit secrets, owner/row IDs, private text, signed URLs,
  storage paths, or private timestamps.
- Fail closed before correction if either migration, catalog, deployment SHA,
  readiness proof, ledger binding, or expected current value is wrong.

## Result And Handoff

Create:

`docs/roadmap/PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_FOR_ARGUS
```

This file is a durable queue only. Wait for a new `WAKEUP A2:` naming PR528B6
before any hosted mutation.
