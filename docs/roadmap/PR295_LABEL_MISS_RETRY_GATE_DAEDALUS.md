# PR295 - Selected Label Miss Retry Gate

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Accepted by ARGUS
Accepted: 2026-06-25

## Purpose

Repair the selected-context answer contract after PR294.

PR294 proved hosted context selection is no longer the issue: the hosted
private replay context contained both accepted concept labels and both matching
invented retrieval phrases. The answer recalled both phrases but neither label.
The owner-only trace correctly reported `missed_selected_labels`, but retry was
not recommended or attempted.

This lane makes a selected-label miss count as an answer-contract failure for
private, direct/factual, selected-context prompts when selected labels/names are
part of the supplied focus.

## Scope

Allowed:

- Update the private persona chat selected-context answer contract.
- Make `missed_selected_labels` retryable when the safe gate applies.
- Preserve the existing one-shot retry maximum.
- Preserve sanitized trace/readiness output only.
- Add focused route/unit coverage proving the first answer can match facts but
  still retry because labels are missing.

Not allowed:

- No hosted probing.
- No provider/model switch.
- No embedding, retrieval ranking, context assembly, prompt fixture, schema,
  seed, import, Redis, Cloudflare, queue, worker, billing, Stripe, public UI, or
  Studio UI changes.
- No hardcoded replay labels, phrases, ids, prompts, completions, or private
  source bodies.

## Required behavior

For private persona chat only, when all of these are true:

- selected context is present,
- the owner message is direct/factual,
- selected focus contains labels, names, or titles,
- the first answer misses selected labels/names while matching supporting
  facts,
- retry has not already happened,

then the answer contract should recommend and attempt the existing one-shot
retry.

The retry prompt should stay generic and should not leak raw private source
bodies into trace/readiness output.

## Guardrails

- Creative/style prompts must remain single-shot unless they include an explicit
  factual command.
- Public or non-persona routes must not gain retry behavior.
- Retry count remains maximum `1`.
- Trace detail may expose only allow-listed booleans, counts, enums, and timing
  buckets.
- Persisted owner-visible messages must not include provider-only selected
  context scaffolding.

## Validation

Run the narrow local gate:

- Add or update focused coverage for a fact-matched, label-missed first answer
  that triggers exactly one retry and then passes when the retry includes the
  label.
- Preserve coverage that a creative/style selected-context prompt remains
  single-shot.
- Preserve coverage that a missed-all-selected-focus answer still retries.
- Preserve coverage that public/non-private paths do not retry.

Expected commands:

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

If the touched tests live in another existing package script, run the closest
focused script and explain the substitution.

## Output

Write:

`docs/roadmap/PR295_LABEL_MISS_RETRY_GATE_RESULT.md`

Include:

- what changed,
- what did not change,
- tests run,
- any caveats,
- exact ARGUS review request.

## Wakeup

Wake ARGUS after implementation and validation.
