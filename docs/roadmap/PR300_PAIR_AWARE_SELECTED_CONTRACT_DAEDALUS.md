# PR300 - Pair-Aware Selected Context Contract

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Accepted by ARGUS
Accepted: 2026-06-25

## Purpose

Repair the remaining hosted exact-recall failure after PR299.

PR299 proved:

- hosted freshness, auth/session, intended persona, context selection,
  rejected-control exclusion, source-copy safety, and observability all pass,
- selected context contains both accepted labels and both matching phrases,
- the answer recalls both phrases,
- the answer recalls neither accepted label,
- answer-contract readback reports `fulfilled` without retry because it matched
  one selected label and two selected facts somewhere in the selected context.

MIMIR keeps the visible selected-pair recall bar. The contract should not pass
by matching an unrelated selected label plus requested supporting facts. It
must treat selected label/name/title and supporting fact as a pair.

## Scope

Allowed:

- Make the private persona selected-context answer contract pair-aware.
- Require the label/name/title for the same selected item whose supporting fact
  is matched.
- Make facts-only or unrelated-label answers fail as `missed_selected_labels`
  when the safe gate applies.
- Preserve existing one-shot retry behavior.
- Add focused route coverage proving unrelated selected labels cannot satisfy
  requested selected-pair output.

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

- selected label/name/title fulfillment must be tied to the selected item whose
  supporting fact is used;
- an answer that mentions supporting facts from selected items but omits those
  same items' labels/names/titles should be `missed_selected_labels`;
- an answer that includes an unrelated selected label/name/title but omits the
  labels/names/titles for the matched facts should still be
  `missed_selected_labels`;
- an answer that includes each matched selected label/name/title with its
  supporting fact coverage can be `fulfilled`;
- persisted owner-visible messages must not include provider-only selected
  context scaffolding.

The implementation should remain generic over selected items, labels, and
facts.

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

- Add or update focused coverage where the answer mentions supporting facts for
  two selected items and an unrelated selected label; this must fail as
  `missed_selected_labels`.
- Add or update focused coverage where the answer includes the matched selected
  labels/names/titles with their supporting facts; this should pass.
- Preserve PR295 label-miss retry coverage.
- Preserve PR297 facts-only failure coverage.
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

`docs/roadmap/PR300_PAIR_AWARE_SELECTED_CONTRACT_RESULT.md`

Include:

- what changed,
- what did not change,
- how fulfillment now ties matched facts to their selected labels/names/titles,
- tests run,
- caveats,
- exact ARGUS review request.

## Wakeup

Wake ARGUS after implementation and validation.
