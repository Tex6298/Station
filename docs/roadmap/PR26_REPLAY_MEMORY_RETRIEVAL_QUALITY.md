# PR26 - Replay Memory/Retrieval Quality Pass

Date: 2026-06-18
Status: implemented by A2 / DAEDALUS; ready for ARGUS review
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE only rehearses if visible
Studio/context-preview behavior changes.

## Purpose

Make the next protected-alpha replay feel meaningfully smarter, not just green.

This lane follows `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` PR 1 after
the PR24 launch-core closeout and PR25 onboarding route-map acceptance.

## Scope

- Improve retrieval ranking over existing evidence, memory, archive, and
  continuity chunks.
- Reduce stale, noisy, superseded, rejected, quarantined, expired, or
  context-leaking recalls.
- Add or improve retrieval trace output for:
  - selected memories or archive chunks;
  - rejected candidates;
  - stale, superseded, quarantined, expired, or rejected counts;
  - the reason each selected item was used.
- Add a focused replay fixture proving the answer improves because the right
  continuity, memory, or archive evidence was recalled.
- Keep the current Gemini free `1536` staging profile as the intended staging
  path.
- Preserve OpenAI-compatible rollback/paid profiles.

## Explicit Non-Scope

- Do not introduce Redis memory truth.
- Do not introduce Cloudflare retrieval as a primary path.
- Do not request Cloudflare config for this lane.
- Do not rewrite the retrieval architecture.
- Do not change vector dimensions.
- Do not add provider marketplace or billing work.
- Do not add production worker infrastructure.

## Cloudflare Timing Answer

Cloudflare config is not needed for PR26.

The current repo already has a disabled-safe Cloudflare adapter contract, but
runtime retrieval is still Station/Supabase plus the active Gemini `1536`
profile. Cloudflare should stay deferred until one of these happens:

- a borrowed repo pattern proves a Cloudflare-only runtime need;
- current Supabase/Gemini retrieval hits a specific replay limitation that an
  ID-only Cloudflare index mirror would solve;
- MIMIR opens a Cloudflare-specific lane with ARGUS privacy gates.

On the current backend/product sequence, Cloudflare is not before the memory
quality pass, archive/import robustness, Stripe proof, Redis boundary, and
provider-policy lanes unless live replay evidence forces a reorder.

## Suggested Implementation Shape

DAEDALUS should inspect the existing retrieval/context-builder code before
patching. Prefer small changes such as:

- normalizing rank inputs;
- filtering lifecycle states earlier;
- adding deterministic tie-breaks;
- improving source-type caps or recency weighting;
- adding structured trace metadata that is safe for operator/replay use;
- adding one synthetic replay fixture with a positive and negative control.

Do not make private snippets public. Trace output must stay owner/operator safe
and must not leak another owner, persona, or private source.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If a focused retrieval/context test family exists, add the replay fixture there
and name it in the handoff.

## ARGUS Review Ask

ARGUS should hostile-review:

- owner/persona scoping;
- lifecycle filters for rejected, expired, quarantined, and superseded memory;
- trace output for private-data leaks;
- mixed-provider/vector-dimension assumptions;
- whether the replay fixture actually proves better recall rather than only
  snapshotting a new behavior.

## Wake Discipline

DAEDALUS should wake ARGUS when done with:

- files changed;
- ranking/filtering behavior changed;
- replay fixture name and what it proves;
- validation commands/results;
- any remaining retrieval caveat.

If DAEDALUS finds Cloudflare is genuinely required earlier than expected, wake
MIMIR with the exact evidence instead of adding config or live calls.

## DAEDALUS Implementation Package

Run date: 2026-06-18

Result: implemented as a focused retrieval quality patch. No Cloudflare config,
Redis memory truth, provider routing, vector dimension change, billing work, or
production worker lane was added.

Behavior changed:

- Keyword archive retrieval now scores a wider candidate pool before truncating,
  so low-weight exact replay evidence is not excluded by the initial
  `relevance_weight` order.
- Keyword memory fallback now uses the same wider pre-score pool to avoid
  dropping exact low-weight memory before lexical ranking.
- Archive keyword ranking now normalizes tokens, drops common stopwords, makes
  lexical/phrase match dominant, keeps relevance weight as a bounded tie-breaker,
  and adds deterministic tie-breaks.
- Archive retrieval now returns safe trace metadata:
  selected chunk IDs/titles/source types/reasons/scores, plus skip counts for
  `unauthoritative`, `source_not_ready`, `missing_lifecycle`, `rejected`,
  `quarantined`, `expired`, and `superseded`.
- Context-preview trace now carries the same archive skip-reason counts without
  copying private archive excerpts into trace metadata.
- The continuity test fake Supabase builder now supports `.limit()` and clears
  local external AI/cache env before import so validation cannot hang on local
  Gemini/Upstash configuration.

Replay fixture:

- `archive keyword ranking prefers exact replay evidence over noisy high
  weight` in `apps/api/src/routes/archive-retrieval.test.ts`.
- It proves a low-relevance exact private archive chunk for `lavender
  switchback` ranks ahead of a high-relevance noisy partial-match chunk.
- It also proves archive trace metadata identifies the selected chunk without
  copying the private excerpt/content into the trace body.

Validation:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 6 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 28 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass, 4 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass. |

Remaining pre-handoff check: `git diff --check`.

## ARGUS Review - 2026-06-18

Verdict: accepted for MIMIR closeout after one narrow test-harness patch.

ARGUS reviewed owner/persona scoping, lifecycle filtering, trace privacy,
mixed-provider/vector assumptions, and the replay fixture claim.

Accepted behavior:

- The public API route remains owner-only: both `/context-preview` and
  `/archive-retrieval` verify persona ownership before returning context,
  excerpts, or trace metadata.
- Runtime context calls archive retrieval with `includeQuarantined: false`, so
  rejected, quarantined, expired, superseded, and missing-lifecycle archive
  chunks are excluded from injected persona context.
- Archive trace metadata stays excerpt-free. It exposes selected IDs, titles,
  source types, reasons, scores, and skipped counts, but not chunk content.
- The active Gemini `1536` embedding/RPC contract remains explicit and
  OpenAI-compatible rollback profile behavior was not changed.
- The replay fixture proves better lexical ordering inside the widened keyword
  candidate pool: the low-weight exact `lavender switchback` chunk beats the
  noisy high-weight partial match.

ARGUS patch:

- `packages/ai/test/retrieval-metadata.test.ts` already exercised the direct
  retrieval metadata path, but its fake Supabase query builder did not implement
  `.maybeSingle()`. PR26's lifecycle validator now legitimately calls
  `.maybeSingle()`, so ARGUS added that fake method instead of weakening runtime
  filtering.

Caveat:

- Recall is still bounded by the pre-score SQL candidate pool. PR26 improves
  replay recall for low-weight exact evidence inside that widened pool; it does
  not yet prove corpus-wide lexical recall when an exact chunk is buried behind
  more than the fetched candidate count.

Validation rerun by ARGUS:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 6 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 28 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass, 4 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass. |
| `npx tsx --test packages/ai/test/retrieval-metadata.test.ts` | Pass, 7 tests after the fake `.maybeSingle()` patch. |
| `git diff --check` | Pass, CRLF warnings only. |

No DAEDALUS blocker remains. ARIADNE rehearsal is not required because this PR
changes backend retrieval behavior and owner/operator trace metadata, not a new
visible UI surface.
