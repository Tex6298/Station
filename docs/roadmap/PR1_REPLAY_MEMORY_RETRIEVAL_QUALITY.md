# PR 1 - Replay Memory/Retrieval Quality

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Default owner: A2 / DAEDALUS first, then A3 / ARGUS for hostile
owner/privacy/overclaim review. A4 / ARIADNE is not needed unless the lane
changes the user-facing journey or context-preview language.

## Goal

Make the next replay feel meaningfully smarter, not just green.

The user-visible claim we want to earn is:

> Station remembered the right thing, ignored the wrong thing, and explained why.

## Current Boundary

PR 0 is accepted. Staging is alpha-proof, not product-complete. The active
embedding profile for staging is Gemini-backed `station_free_1536`; OpenAI
`openai_1536` remains a compatible paid/rollback profile for the same 1536-dim
schema.

This lane improves retrieval and trace quality inside the existing Station path.
It does not introduce Redis memory truth, Cloudflare as the primary retrieval
path, background workers, or a rewrite of the retrieval architecture.

## Scope

- Inspect the current archive/memory/persona-context retrieval path.
- Improve ranking over existing evidence and memory chunks where a narrow,
  testable change is available.
- Reduce stale, noisy, rejected, quarantined, expired, superseded, or
  context-leaking recall.
- Add or improve trace/debug output for replay-safe evidence:
  - selected memory/source identifiers and titles,
  - rejected/skipped memory counts by reason,
  - stale/superseded/quarantined/expired counts,
  - why each selected item was used,
  - embedding provider/profile metadata,
  - retrieval mode and fallback mode.
- Add a replay fixture proving that the answer or context preview improves
  because the correct continuity/memory/archive source was selected and the
  wrong/rejected source was not.
- Preserve Gemini `station_free_1536` as the intended staging path and preserve
  OpenAI-compatible rollback behavior.

## Do Not

- Do not make Redis canonical memory.
- Do not add Redis-dependent retrieval behavior.
- Do not introduce Cloudflare retrieval as a primary path.
- Do not switch vector dimensions.
- Do not re-embed existing documents unless the lane explicitly documents the
  backfill/reindex contract.
- Do not store private excerpts, prompt bodies, API keys, tokens, or raw private
  archive text in docs or telemetry.
- Do not make broad UI changes.

## Acceptance Gates

- Owner A cannot retrieve Owner B memory/archive/context material.
- Anonymous/public reads cannot receive private archive or memory chunks.
- Rejected, quarantined, expired, or superseded memory is excluded or
  explicitly counted as skipped rather than injected.
- Retrieval evidence explains why selected items were selected without leaking
  private text in shared docs.
- Gemini staging profile and OpenAI rollback profile remain compatible with the
  existing 1536-dim schema.
- Focused tests prove the right source wins and the wrong/rejected source loses.

## Validation

Use the narrowest commands that cover the patch, expected baseline:

```bash
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:continuity
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If the patch touches shared AI package behavior, include the relevant `@station/ai`
build or test path.

## Handoff

DAEDALUS should implement the smallest useful retrieval-quality improvement and
wake ARGUS with:

- files changed,
- behavior changed,
- replay fixture/result,
- validation run,
- any quality caveat that remains.

ARGUS should review for owner leaks, private excerpt leakage, mixed-provider or
mixed-dimension mistakes, overclaiming, and regression risk.
