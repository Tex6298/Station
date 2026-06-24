# PR287 - Reliable Selected-Context Answer Use

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the remaining hosted private persona answer failure after PR286.

PR286 proved the hosted deployment includes PR285, replay-owner auth/session
passes, the intended private replay persona is selected, and selected context
contains both accepted concept labels and both matching invented retrieval
phrases. The single hosted answer still recalled none of them.

This lane starts after retrieval and context assembly. Treat selected context as
present for this fixture unless new provider-prompt evidence proves otherwise.

## Starting Evidence

PR286 hosted proof:

- Web/API were fresh on `main` with PR285 implementation commit `2d37b1e9`.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Context preview and latest conversation trace showed Canon, Memory,
  Integrity, Archive, and Continuity context present.
- Sanitized context inspection contained both accepted concept labels and both
  matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled none of the accepted labels or phrases.

## Questions To Answer

1. Does the actual conversation route place selected-context answer focus only
   in the system prompt before prior chat history, or does any selected context
   reach the final user-adjacent payload?
2. Is prior conversation history or persona style still outranking selected
   facts despite the PR283/PR285 prompt work?
3. What is the smallest reliable mechanism for direct factual private persona
   prompts when selected context contains the answer?
4. If a bounded retry is needed, can the retry trigger be generic, private-only,
   one-shot, and based on selected context presence plus a clearly ungrounded
   first answer?
5. How will token usage, trace events, runtime budget reporting, and error
   metadata remain honest without logging raw prompts, completions, provider
   payloads, private source bodies, raw ids, cookies, or tokens?

## Patch Rule

Patch the narrowest answer-use defect after selected context exists.

Acceptable patch shapes include:

- moving or duplicating compact selected-context answer focus into a
  user-adjacent provider message for private persona chat, while preserving the
  final user message order expected by providers;
- adding a one-shot retry when a direct factual private chat answer ignores
  selected context that is present in the runtime focus;
- adding a lightweight private-only answer-use verifier that checks the first
  answer against selected focus terms without hardcoding replay anchors;
- tightening conversation-route/provider-payload tests around history order,
  selected focus placement, retry behavior, trace metadata, and token
  accounting.

If adding a retry, keep it narrow:

- one retry maximum;
- private persona chat only;
- only when selected context exists and the first answer is clearly ungrounded
  for a direct factual prompt;
- no raw prompt, completion, provider payload, hosted log, SQL, private source
  body, raw id, cookie, or token logging;
- record sanitized retry metadata only;
- keep quota/token accounting explicit and conservative.

Do not hardcode seeded anchor strings, replay persona names, hosted ids, test
account details, or staging prompt wording. The repair must generalize to any
owner-safe selected context.

If evidence shows selected context is absent from provider prompt delivery,
classify that precisely and wake MIMIR. Do not broaden into retrieval, schema,
seed, import, provider routing, embeddings, Redis, Cloudflare, queue, worker,
billing, Stripe, public UI, or Studio UI work without a new lane.

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

If route/provider retry or payload ordering changes, add or run focused
conversation route tests proving:

- selected focus reaches the intended provider-facing payload position;
- the first ungrounded answer can trigger at most one retry;
- token usage and trace metadata account for the retry safely;
- provider failure after retry remains sanitized.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR287_RELIABLE_SELECTED_CONTEXT_ANSWER_USE_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether provider payload placement, prior-history drift, retry need, or
  another answer-use boundary was implicated;
- patch summary and whether retry behavior changed;
- validation commands and results;
- retry/accounting/trace behavior if touched;
- rejected-control/source-copy/prompt-injection safety status;
- whether MIMIR should open an ARIADNE PR288 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR287 Reliable Selected-Context Answer Use.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review retry/accounting/trace behavior if touched, provider payload ordering, prompt-boundary safety, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR288 rerun.
```
