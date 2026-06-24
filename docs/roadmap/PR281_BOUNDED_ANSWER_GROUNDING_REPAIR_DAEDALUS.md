# PR281 - Bounded Answer Grounding Repair

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the remaining hosted runtime answer failure after PR280.

PR280 proved PR279 closed the hosted context-selection gap: sanitized context
inspection found both accepted anchor concepts and both matching invented
retrieval phrases, with rejected-control evidence absent. The hosted answer
still failed because the single chat response recalled zero accepted concepts
and zero matching phrases.

This lane starts after context selection. Do not reopen retrieval unless new
evidence proves the full selected context did not reach the provider prompt.

## Starting Evidence

PR280 hosted proof:

- Web/API `/health/deployment` were ready on `main` at PR279 implementation
  commit `7ab41536f533`.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Sanitized context counts were Canon 3, Memory 3, Integrity 1, Archive 4, and
  Continuity 4.
- Sanitized context inspection found both accepted concepts and both matching
  invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled zero of the accepted concepts and zero of the matching
  invented retrieval phrases.

Likely layers:

- `packages/ai/src/prompts/persona-chat.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `apps/api/src/routes/conversations.ts`
- focused prompt/context/provider-payload tests

## Questions To Answer

1. Does the full selected evidence reach the provider system prompt in a local
   DB-shaped proof? Use booleans/counts/categories, not raw prompt text.
2. Does `buildPersonaChatPrompt` clearly tell private persona chat to answer
   direct factual questions from selected context when the answer is present?
3. Are the existing prompt sections making Memory/Archive context feel optional
   or secondary to persona voice?
4. Does conversation route provider payload handling preserve the full system
   prompt and final user message without truncating or swapping them?
5. Can the repair prove, with a mocked provider or prompt fixture, that provider
   input contains the full evidence and explicit grounded-answer guidance before
   hosted rerun?

## Patch Rule

Patch the narrowest answer-grounding defect.

Acceptable patch shapes include:

- strengthening `buildPersonaChatPrompt` so private persona chat answers direct
  factual questions from selected context when the answer is present;
- adding an explicit instruction to respect safe user-requested answer shape
  and avoid omitting directly relevant selected context;
- proving provider payload assembly receives the full selected evidence and the
  final user message;
- adding focused tests that verify prompt/payload grounding guidance and full
  selected evidence in sanitized/local form.

Do not hardcode the seeded anchor strings, replay persona, hosted ids, or
special-case the staging prompt. The repair must generalize to any owner-safe
selected context.

If DAEDALUS proves the full selected context is not reaching the provider
prompt, fix that narrower prompt/payload path and record the exact layer.

If DAEDALUS proves prompt/payload is correct and the model still ignores direct
context, propose the smallest generic response-handling strategy to MIMIR
instead of implementing a broad retry/evaluator system in this PR.

## Non-Scope

Do not change:

- retrieval selection, vector/lexical ranking, embeddings, provider routing, or
  model choice;
- database schema, migrations, seeds, imports, Redis, Cloudflare, queues, or
  workers;
- billing, Stripe, public UI, Studio UI, or human-demo flows;
- the full two-anchor recall acceptance bar.

Do not commit raw prompts, completions, provider payloads, hosted logs, SQL,
private source bodies, raw ids, credentials, cookies, or tokens.

## Required Validation

Run the smallest relevant set, and broaden if the patch touches more layers:

```bash
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If conversation provider payload handling changes, add or run the focused
conversation route/provider test that proves system/user payload shape.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR281_BOUNDED_ANSWER_GROUNDING_REPAIR_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether full selected evidence reaches provider prompt locally;
- whether prompt/payload now contains explicit grounded-answer guidance;
- patch summary;
- rejected-control/source-copy safety status;
- validation commands and results;
- whether MIMIR should open ARIADNE PR282 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR281 Bounded Answer Grounding Repair.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review prompt injection boundaries, no hardcoded replay anchors, no provider/scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR282 rerun.
```
