# PR302 - Selected Pair Finalizer

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Close the remaining hosted selected-pair answer failure after PR301.

PR301 proved:

- hosted freshness, auth/session, intended persona, context selection,
  rejected-control exclusion, source-copy safety, observability, and pair-aware
  retry execution all pass,
- selected context contains both accepted labels and both matching phrases,
- the first and final answer-contract reasons are `missed_selected_labels`,
- retry is attempted exactly once and does not fail,
- the final hosted answer still recalls both phrases but neither accepted
  label.

MIMIR keeps the exact selected-pair recall bar. Since the model still misses
labels after the allowed retry, Station needs a narrow private/direct factual
selected-pair finalizer instead of another prompt-only retry.

## Scope

Allowed:

- Add a bounded final answer construction path after the existing one-shot retry
  has already been used and the pair-aware contract still reports
  `missed_selected_labels`.
- Use selected labels/names/titles and supporting facts from the selected
  context to produce a concise owner-visible answer that satisfies the
  selected-pair contract.
- Keep this private persona chat only, selected context required, direct/factual
  owner prompt required.
- Add sanitized observability only if useful, using booleans/counts/enums/timing
  buckets.
- Add focused route coverage proving the finalizer returns selected
  label/name/title plus supporting fact pairs when the provider misses labels
  after retry.

Not allowed:

- No third provider call.
- No hosted probing.
- No provider/model switch.
- No embedding, retrieval ranking, context assembly, schema, seed, import,
  Redis, Cloudflare, queue, worker, billing, Stripe, public UI, Studio UI, or
  demo data changes.
- Do not loosen the hosted recall bar.
- Do not hardcode replay labels, phrases, ids, prompts, completions, or private
  source bodies.

## Required behavior

For private persona chat only, when all of these are true:

- selected context is present,
- the owner message is direct/factual,
- the selected context answer contract applies,
- the provider's first answer misses selected labels or all selected focus,
- the existing one-shot retry has already been attempted,
- the post-retry answer still reports `missed_selected_labels`,

then Station may construct the final owner-visible answer from the selected
pairs instead of returning the still-failing provider answer.

The finalizer should:

- include selected label/name/title text with the matched or most relevant
  supporting fact for that same selected item;
- stay concise enough for the requested answer shape when possible;
- avoid rejected-control material;
- avoid provider-only scaffolding;
- persist only the final owner-visible assistant answer, not hidden selected
  context scaffolding or the failed first answer.

## Guardrails

- Creative/style prompts must remain single-shot unless they include an explicit
  factual command.
- Public or non-persona routes must not gain finalizer behavior.
- Retry count remains maximum `1`; the finalizer is not a second retry.
- Trace detail may expose only allow-listed booleans, counts, enums, and timing
  buckets.
- No raw prompts, completions, provider payloads, private source bodies, ids,
  cookies, tokens, credentials, SQL, or logs in result docs or trace/readiness
  output.

## Validation

Run the narrow local gate:

- Add or update focused coverage where the provider first misses labels, retry
  also misses labels, and the finalizer returns selected label/name/title plus
  supporting fact pairs.
- Add or update coverage proving the finalizer does not run for creative/style,
  public, non-private, or non-persona paths.
- Preserve PR300 pair-aware unrelated-label failure.
- Preserve PR300 matched-pair pass.
- Preserve PR295 label-miss retry.
- Preserve missed-all-selected-focus retry.
- Preserve persisted-message and sanitized trace/readiness boundaries.

Expected commands:

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

If a closer existing focused script owns the touched tests, run it and explain
the substitution.

## Output

Write:

`docs/roadmap/PR302_SELECTED_PAIR_FINALIZER_RESULT.md`

Include:

- what changed,
- what did not change,
- how the finalizer chooses selected pairs,
- tests run,
- caveats,
- exact ARGUS review request.

## Wakeup

Wake ARGUS after implementation and validation.
