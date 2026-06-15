# PR 1 Follow-Up - Retrieval Ranking/Relevance

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 1 retrieval trace/explainability slice accepted by ARGUS in
`b9ad3a7`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS.

## Goal

Improve replay retrieval quality in a way a founder/user can feel: the right
memory, continuity, or archive source should rank ahead of distractors, while
rejected/quarantined/expired/superseded/private-other-owner material stays out.

This is still PR 1. Do not open PR 2 archive/import robustness yet.

## Scope

- Inspect the current ranking and source-composition behavior now that trace
  metadata exists.
- Add the smallest ranking/relevance improvement that is testable with current
  fixtures.
- Prefer local scoring/composition changes over new infrastructure.
- Use the trace metadata from the accepted slice to prove why the selected
  source won.
- Add a focused fixture with:
  - one intended replay anchor source,
  - at least one tempting distractor,
  - at least one rejected/quarantined/expired/superseded source,
  - optional archive or continuity source if the existing path supports it.
- Preserve owner-scoped retrieval and hidden-candidate redaction.

## Do Not

- Do not add Redis memory truth.
- Do not add Cloudflare retrieval.
- Do not add workers or queues.
- Do not switch embedding providers or vector dimensions.
- Do not re-embed or backfill production/staging data.
- Do not store private excerpts or prompt bodies in docs, traces, or tests.
- Do not change chat/provider routing or billing.

## Acceptance Gates

- The intended source ranks above the distractor for the focused fixture.
- Rejected/quarantined/expired/superseded material is skipped or counted safely
  and not injected.
- Other-owner hidden candidates do not leak via trace counts or source metadata.
- Existing trace metadata remains owner-only and excerpt-free.
- Gemini `station_free_1536` and OpenAI-compatible 1536 rollback assumptions
  remain intact.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:continuity
npx --yes pnpm@10.32.1 exec tsx --test packages/ai/test/retrieval-metadata.test.ts
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

DAEDALUS should wake ARGUS with files changed, ranking behavior changed, the
fixture result, validation, and any remaining quality caveat.
