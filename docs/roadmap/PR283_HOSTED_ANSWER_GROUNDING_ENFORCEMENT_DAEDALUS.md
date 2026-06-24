# PR283 - Hosted Answer Grounding Enforcement

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the remaining hosted private persona answer-grounding failure after
PR282.

PR282 proved the deployed PR281 prompt-grounding rule was not enough by itself:
hosted context contained both accepted anchor concepts and both matching
invented retrieval phrases, but the single chat answer recalled none of them.

This lane starts after context selection and after the PR281 prompt rule. Do not
reopen retrieval unless new evidence proves selected context is absent from
provider prompt delivery.

## Starting Evidence

PR282 hosted proof:

- Web/API were fresh on `main` with PR281 implementation commit `4c96bbd4`.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Context preview and latest conversation trace showed Canon, Memory, Integrity,
  Archive, and Continuity context present.
- Sanitized context inspection contained both accepted concepts and both
  matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled none of the accepted concepts or phrases.

## Questions To Answer

1. Does the hosted/private runtime prompt path actually include the PR281
   grounded-answer rule when selected context is present? Use safe booleans or
   test fixtures, not raw prompt dumps.
2. Is prior conversation history contaminating the rerun by carrying earlier
   failed answers, or is the final user message/context still dominant?
3. Does provider payload assembly keep the final user message last and selected
   context in the system prompt for the hosted model family in use?
4. If prompt delivery is correct, what is the smallest generic enforcement
   mechanism that gets direct factual answers to use selected context without
   hardcoding replay terms?
5. Does the repair preserve rejected-control exclusion and source-copy safety?

## Patch Rule

Patch the narrowest answer-grounding enforcement defect.

Acceptable patch shapes include:

- strengthening prompt priority so the latest direct factual user request plus
  selected context outranks prior conversation drift;
- adding a compact answer-focus block derived generically from selected context
  near the final grounding instruction, without hardcoding replay strings or
  hosted ids;
- adding a one-shot bounded retry when a direct factual answer ignores selected
  context evidence that the runtime already selected;
- adding safe tests around provider payload order, prior-history contamination,
  and response-grounding retry behavior.

If adding a retry, keep it narrow:

- one retry maximum;
- only when selected context exists and the first answer is clearly ungrounded
  for a direct factual prompt;
- no raw prompt/completion/provider payload logging;
- preserve quota/accounting semantics as clearly as the existing route permits;
- record sanitized trace metadata only.

Do not hardcode seeded anchor strings, replay persona, hosted ids, or staging
prompt text. The repair must generalize to any owner-safe selected context.

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

If response retry/provider handling changes, add or run focused conversation
route tests proving bounded retry and token/accounting behavior.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR283_HOSTED_ANSWER_GROUNDING_ENFORCEMENT_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether prompt delivery/history contamination was implicated;
- enforcement patch summary;
- whether the repair is prompt-only, answer-focus, retry, or another narrow
  strategy;
- rejected-control/source-copy safety status;
- validation commands and results;
- whether MIMIR should open ARIADNE PR284 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR283 Hosted Answer Grounding Enforcement.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review prompt injection boundaries, retry/accounting behavior if touched, no hardcoded replay anchors, no provider/scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR284 rerun.
```
