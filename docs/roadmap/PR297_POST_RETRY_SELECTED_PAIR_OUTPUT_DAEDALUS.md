# PR297 - Post-Retry Selected Pair Output

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Repair the remaining hosted replay answer-quality failure after PR296.

PR296 proved:

- hosted freshness, auth/session, intended persona, context selection,
  rejected-control exclusion, source-copy safety, observability, and retry gate
  execution all pass,
- selected context contains both accepted labels and both matching phrases,
- `missed_selected_labels` triggers the one-shot retry,
- the final answer-contract readback can report `fulfilled`,
- but the final hosted answer still misses the exact visible labels and phrases
  required by the replay acceptance bar.

MIMIR keeps the acceptance bar. For this replay probe, the user-visible answer
must carry the selected labels/names and their supporting facts, not merely
satisfy a weaker internal term-count contract.

## Scope

Allowed:

- Strengthen private persona chat answer construction after selected-context
  retry so the final answer visibly preserves selected label/name plus
  supporting fact pairs when a direct/factual owner prompt asks for selected
  context.
- Align the answer-contract verifier with the visible selected-pair acceptance
  bar if it is currently weaker than the hosted check.
- Add focused tests proving a retry answer must include exact selected
  labels/names and supporting facts, not only partial or fuzzy matches.
- Keep retry maximum at one.

Not allowed:

- No hosted probing.
- No provider/model switch.
- No embedding, retrieval ranking, context assembly, schema, seed, import,
  Redis, Cloudflare, queue, worker, billing, Stripe, public UI, Studio UI, or
  demo data changes.
- Do not loosen the hosted recall bar.
- Do not hardcode replay labels, phrases, ids, prompts, completions, or private
  source bodies.

## Required behavior

For private persona chat only, when the selected-context answer contract applies
to a direct/factual owner prompt:

- selected labels/names/titles and supporting facts should be preserved as
  visible answer obligations,
- retry construction should explicitly ask the model to include those exact
  selected labels/names/titles with relevant supporting facts,
- contract fulfillment should not pass merely because partial terms or related
  facts were mentioned while selected labels/names are absent,
- persisted owner-visible messages must not include provider-only selected
  context scaffolding.

The implementation should remain generic over selected labels and facts.

## Guardrails

- Creative/style prompts must remain single-shot unless they include an explicit
  factual command.
- Public or non-persona routes must not gain retry behavior.
- Retry count remains maximum `1`.
- Trace detail may expose only allow-listed booleans, counts, enums, and timing
  buckets.
- No raw prompts, completions, provider payloads, private source bodies, ids,
  cookies, tokens, credentials, SQL, or logs in result docs or trace/readiness
  output.

## Validation

Run the narrow local gate:

- Add or update focused coverage where the retry answer mentions supporting
  facts but omits selected labels/names; that must remain a failed contract.
- Add or update focused coverage where the retry answer includes selected
  label/name plus supporting fact pairs; that should pass.
- Preserve label-miss retry coverage from PR295.
- Preserve missed-all-selected-focus retry coverage.
- Preserve creative/style no-retry coverage.
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

`docs/roadmap/PR297_POST_RETRY_SELECTED_PAIR_OUTPUT_RESULT.md`

Include:

- what changed,
- what did not change,
- how the contract now maps to visible selected-pair recall,
- tests run,
- caveats,
- exact ARGUS review request.

## Wakeup

Wake ARGUS after implementation and validation.
