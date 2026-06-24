# PR281 - Bounded Answer Grounding Repair Result

Owner: A2 / DAEDALUS
Status: pass with caveats - pending ARGUS review
Completed: 2026-06-24

## Verdict

`PASS WITH CAVEATS`, pending ARGUS review.

PR281 patched the bounded answer-behavior layer after PR280 proved full selected
context was present but the hosted answer still recalled zero accepted concepts
and zero matching invented retrieval phrases.

Hosted proof still requires a post-deploy PR282 rerun.

## Root Cause

The strongest evidenced defect is prompt priority, not retrieval. PR280 proved
the hosted selected context contained both accepted concepts and both matching
invented retrieval phrases, with rejected-control evidence absent. The remaining
answer failure happened after context selection.

The existing prompt described Memory and Archive as context and emphasized
private persona voice, but it did not explicitly instruct private persona chat
to answer direct factual questions from selected context when the answer is
present. That left direct recall questions vulnerable to persona-style or
generic response behavior even when the selected evidence was available.

Local provider-payload proof confirms the system prompt and final user message
are preserved in the OpenAI-compatible payload path.

## Patch Summary

Changed `packages/ai/src/prompts/persona-chat.ts`:

- private persona prompts now include a `Grounded answering rule` when selected
  context is present;
- the rule tells the persona to answer direct factual questions from selected
  context first when the answer is present;
- it preserves safe user-requested answer shapes such as concise lists, names,
  pairs, or short recaps;
- it says not to omit directly relevant selected names, labels, or phrases just
  to maintain mystique or a persona-only response;
- it keeps source-copy safety by instructing the model to use facts without
  copying long source passages verbatim.

Changed `packages/ai/test/retrieval-metadata.test.ts`:

- added prompt coverage for the grounded-answer rule and full selected evidence;
- added an OpenAI-compatible provider payload test proving the system prompt
  contains the grounding rule/evidence and the final user message remains last.

No seeded replay terms, replay persona ids, hosted ids, provider routing,
retrieval ranking, schema, seeds, imports, billing, Redis, Cloudflare, queues,
workers, public UI, or Studio UI were hardcoded or changed.

## Local Evidence

| Question | Result |
| --- | --- |
| Does full selected evidence reach provider prompt locally? | Yes. The prompt fixture includes both concepts and both matching phrases, and the provider payload test sees them in the system message. |
| Does the prompt contain explicit grounded-answer guidance? | Yes. Private persona prompts with selected context include the new `Grounded answering rule`. |
| Does provider payload handling preserve system prompt and final user message? | Yes. The OpenAI-compatible payload test confirms system comes first and the final user message remains last. |
| Does this reopen retrieval? | No. Retrieval/context selection code is unchanged in PR281. |
| Does this preserve rejected-control/source-copy safety? | Yes locally. The repair adds source-copy caution and does not alter rejected-control filtering. |

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass. 12 tests, including prompt grounding and provider payload shape. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass. 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass. 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass. 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings: raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

## Recommendation

Wake ARGUS to review prompt-injection boundaries, no hardcoded replay anchors,
no provider/scope creep, and secret/raw-data hygiene. If accepted, ARGUS should
recommend that MIMIR open an ARIADNE hosted PR282 rerun after deploy.
