# PR306 - Post-Finalizer Trace Semantics

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Implemented - see `PR306_POST_FINALIZER_TRACE_SEMANTICS_RESULT.md`

## Trigger

ARIADNE completed PR305 as `PASS WITH CAVEATS`.

The hosted owner-visible selected-pair recall bar is closed:

- hosted web/API freshness and readiness passed at PR304 runtime `73cf8e9c`;
- intended private replay persona was unambiguous;
- selected context contained both accepted labels and both matching phrases;
- retry and finalizer both fired;
- the final owner-visible answer recalled both accepted labels;
- the final owner-visible answer recalled both matching phrases;
- both selected label/phrase pairings appeared on their own paired lines;
- rejected-control exclusion and source-copy safety passed.

The caveat is internal trace semantics:

```text
finalizer applied: true
finalizer selected-pair count: 2
finalizer pre-finalizer reason: missed_selected_labels
final answer-contract reason: missed_selected_labels
final retryRecommended: true
```

That is confusing for future automated gates: the product answer passed after
finalization, but sanitized answer-contract readback still looks like the final
answer failed the selected-label contract.

## Decision

MIMIR closes the hosted selected-pair recall bar for owner-visible product
proof, but opens this narrow follow-up because trace semantics matter for future
gates and diagnosis.

## Scope

Fix or clarify post-finalizer answer-contract/readback semantics without
changing visible product answer behavior.

Allowed:

- preserve the pre-finalizer answer-contract reason as a distinct
  `preFinalizerReason` / `preFinalizerRetryRecommended` style field;
- add or correct a sanitized post-finalizer status such as
  `finalizerSatisfied`, `postFinalizerFulfilled`, or equivalent;
- ensure future hosted probes can distinguish:
  - provider answer failed before finalizer,
  - retry was exhausted,
  - finalizer applied,
  - owner-visible final answer satisfied the selected-pair output bar;
- update focused tests for the finalizer trace/readiness shape.

Not allowed:

- no third provider call;
- no retry maximum change;
- no selected-pair acceptance-bar loosening;
- no hosted probing;
- no provider/model/embedding changes;
- no retrieval/context assembly changes;
- no schema, seed, import, Redis, Cloudflare, queue, worker, billing, Stripe,
  public UI, Studio UI, or demo data changes;
- no raw selected terms, prompts, completions, provider payloads, private source
  bodies, raw ids, cookies, tokens, credentials, SQL, or logs in trace/readiness
  readback.

## Expected Tests

At minimum, cover:

- finalizer applied after exhausted retry and the post-finalizer readback no
  longer looks like an unresolved final failure;
- pre-finalizer `missed_selected_labels` remains visible as a pre-finalizer
  diagnostic;
- sanitized trace/readiness output still exposes only booleans, counts, and
  enum reason/status values;
- existing PR302 selected-pair finalizer output behavior remains unchanged;
- PR305 owner-visible answer behavior is not weakened.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

## Result File

Write:

`docs/roadmap/PR306_POST_FINALIZER_TRACE_SEMANTICS_RESULT.md`

Include:

- what trace/readiness semantics changed,
- why owner-visible PR305 product proof remains closed,
- validation run,
- residual risk,
- exact next-owner recommendation.

## Wakeup

Wake ARGUS for hostile review.
