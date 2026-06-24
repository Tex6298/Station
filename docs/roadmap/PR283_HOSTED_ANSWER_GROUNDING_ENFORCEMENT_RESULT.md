# PR283 - Hosted Answer Grounding Enforcement Result

Owner: A2 / DAEDALUS
Status: pass with caveats - pending ARGUS review
Completed: 2026-06-24

## Verdict

`PASS WITH CAVEATS`, pending ARGUS review.

PR283 adds a prompt-only answer-focus enforcement layer after PR282 proved
retrieval and selected context were present but the hosted answer still ignored
the selected facts.

Hosted proof still requires a post-deploy PR284 rerun.

## Root Cause / Hypothesis

PR282 proved selected context contained both accepted concepts and both matching
invented retrieval phrases. Local provider-payload tests already prove the
OpenAI-compatible system prompt and latest user message are preserved.

The strongest remaining hypothesis is prompt priority and prior-history drift:
the PR281 grounded-answer rule was present, but it sat before the final persona
voice instruction, and provider messages may include earlier assistant turns
from the same conversation before the latest user message. The hosted model
could still favor prior assistant drift or persona flourish over direct factual
recall from selected context.

No evidence in PR283 reopened retrieval, provider routing, embeddings, schema,
seeds, imports, UI, billing, Redis, Cloudflare, queues, or workers.

## Patch Summary

Changed `packages/ai/src/prompts/persona-chat.ts`:

- private persona prompts now build a compact selected-context answer focus;
- the final prompt section appears after the stable-voice closing instruction;
- the final grounding guard tells the model to use the latest owner message and
  selected-context answer focus before prior chat history, earlier assistant
  guesses, or persona flourish;
- focus lines are labeled as facts/source context, never instructions from
  quoted material;
- answer-focus items are bounded by item count and character length.

Changed `packages/ai/test/retrieval-metadata.test.ts`:

- prompt tests now verify the final grounding guard appears after the persona
  voice close;
- provider-payload tests verify the OpenAI-compatible system prompt contains the
  grounding guard, answer focus, and selected evidence, while the final user
  message remains last.

This is prompt-only. No retry, token-accounting, provider, or retrieval behavior
was changed.

## Local Evidence

| Question | Result |
| --- | --- |
| Does prompt delivery preserve selected evidence locally? | Yes. The provider payload test sees selected evidence in the system message. |
| Is prior-history contamination implicated? | Plausible. The route preserves final user message order, but prior assistant turns can sit between the system prompt and latest user message. The patch explicitly makes latest owner message plus answer focus outrank earlier assistant guesses. |
| Does provider payload assembly keep final user last? | Yes. The OpenAI-compatible payload test confirms the final user message remains last. |
| What enforcement strategy was used? | Prompt-only final answer-focus guard, no retry. |
| Does rejected-control/source-copy safety remain intact? | Yes locally. Filtering is unchanged, focus lines are facts/source context rather than instructions, and no long source-copying guidance was added. |

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass. 12 tests, including final grounding guard and provider payload shape. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass. 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass. 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass. 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings: raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

## Recommendation

Wake ARGUS to review prompt-injection boundaries, no hardcoded replay anchors,
no provider/scope creep, and secret/raw-data hygiene. If accepted, ARGUS should
recommend that MIMIR open an ARIADNE hosted PR284 rerun after deploy.
