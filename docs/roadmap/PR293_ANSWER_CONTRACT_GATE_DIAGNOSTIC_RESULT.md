# PR293 - Answer Contract Gate Diagnostic Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-25

## Result

`PASS WITH CAVEATS`, accepted by ARGUS with a narrow review patch.

DAEDALUS repaired the two narrow PR292 diagnostic gaps:

- sanitized trace detail now exposes answer-contract reason codes and retry
  decisions as allow-listed booleans, counts, and enums;
- the direct/factual gate now includes answer, naming, state, report, and
  readback-style factual commands while preserving the creative/style no-retry
  boundary.

The strongest root-cause hypothesis is gate/readback, not retrieval or provider
routing: the hosted contract event ran, but owner-visible trace detail stripped
the contract payload, and the hosted acceptance prompt may have missed the
direct/factual classifier.

ARGUS tightened the creative/style guard so prompts that mention selected
context, labels, pairs, or facts still remain single-shot unless they also
include a clear factual command such as answer, list, name, state, report, or
read back.

## Patch Summary

- Added sanitized answer-contract and retry metadata allow-lists in
  `apps/api/src/services/ai-observability.service.ts`.
- Exposed only safe fields: schema, applicable/private/direct booleans,
  selected and matched counts, reason code, retry recommendation, retry
  attempted/failed, max attempts, and retry reason code.
- Expanded `isDirectFactualOwnerMessage` for answer/naming/state/report/readback
  style factual commands.
- ARGUS review patch preserved the creative/style boundary for reflective
  metaphor prompts even when they mention selected context labels.
- No retrieval, provider routing/model choice, embeddings, schema, seeds,
  imports, Redis, Cloudflare, queues, workers, billing, Stripe, public UI,
  Studio UI, or human-demo behavior changed.

## Test Coverage

Focused tests prove:

- a PR292-shaped `answer`/`names` factual prompt triggers the answer-contract
  retry when the first answer misses all selected focus;
- creative metaphor prompts with selected context labels remain single-shot;
- owner-only trace detail exposes sanitized answer-contract reason codes and
  retry decisions;
- raw selected labels/facts, prompts, completions, provider payloads, private
  source bodies, ids, cookies, tokens, and credentials remain absent from
  sanitized trace output.

## Validation

All required PR293 checks passed:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 37 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS verdict. |
| Added-line hygiene scan | Pass | No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values found in the PR293 ARGUS diff. |

`test:retrieval-metadata` and `test:persona-context` were not rerun because
PR293 did not touch retrieval, context assembly, prompt assembly, or
retrieval-adjacent helpers.

## Safety

- Retry remains private persona chat only, direct/factual only, selected
  context required, missed-all-selected-focus only, and one retry maximum.
- Trace/readiness output exposes only sanitized enums, booleans, and counts.
- Rejected-control filtering, source-copy boundaries, provider routing, and
  model choice are unchanged.
- Product code contains no replay persona name, hosted id, test account detail,
  seeded anchor string, or staging prompt wording.

## Recommendation

ARGUS accepts the repair. MIMIR should open an ARIADNE PR294 hosted rerun after
deploy. If PR294 still fails with `directFactual: true`, retry attempted, and
sanitized reason codes visible, the next decision can classify provider/model
behavior with better evidence.
