# PR291 - Selected-Context Answer Contract Diagnostic

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-25

## Purpose

Diagnose and repair the hosted private persona answer-use failure after PR290.

PR290 proved the hosted deployment includes PR289, replay-owner auth/session
passes, the intended private replay persona is selected, selected context
contains both accepted concept labels and both matching invented retrieval
phrases, rejected-control evidence stays absent, and the answer avoids raw
source-body copying. The single hosted answer still recalled none of the labels
or phrases.

This lane starts after retrieval, context assembly, provider routing, and
selected-context prompt placement. Treat selected context as present unless new
safe diagnostic evidence proves otherwise.

## Starting Evidence

PR290 hosted proof:

- Web/API were fresh on `main` with PR289 implementation commit `21173c32`.
- Replay-owner auth/session and protected Studio browser session passed.
- Intended private platform replay persona selection was unambiguous.
- Context preview and latest conversation trace showed Canon, Memory,
  Integrity, Archive, and Continuity context present.
- Sanitized context inspection contained both accepted concept labels and both
  matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled neither accepted concept label nor invented phrase.

## Questions To Answer

1. Can the conversation route prove, without logging raw prompts or private
   source bodies, that selected label/fact focus reaches the final
   provider-facing answer contract for the current request?
2. Can the route compute a private-only answer-use verdict after completion:
   selected context exists, the owner prompt is direct/factual enough, and the
   answer missed the selected labels/phrases that should have been preserved?
3. If a repair is needed, is the narrowest reliable mechanism a deterministic
   private-only one-shot retry, a stronger provider-facing answer contract, or
   an extractive fallback for direct factual selected-context questions?
4. How can trace/readiness metadata record only sanitized booleans, counts,
   buckets, and reason codes while keeping raw selected strings, prompts,
   completions, provider payloads, ids, cookies, and tokens out of storage?
5. What exact local test proves the hosted PR290 failure class is now caught
   before ARIADNE reruns it?

## Patch Rule

Patch the narrowest answer-contract defect. Do not keep iterating prompt
wording unless the diagnostic evidence proves the contract itself was absent or
misplaced.

Acceptable patch shapes include:

- adding a private-only answer-use verifier that compares the final answer
  against selected context labels/titles and compact supporting facts in memory,
  then records only sanitized pass/fail reason codes and count buckets;
- adding a one-shot retry for direct factual private persona prompts when
  selected context exists and the first answer clearly ignores selected focus;
- tightening provider-facing selected-context placement only if the diagnostic
  proves the expected answer contract does not reach the final provider
  request;
- adding deterministic route tests with a provider stub that first ignores
  selected context and then proves the verifier/retry/contract path behaves
  safely;
- adding sanitized trace/readiness metadata for answer-contract verdicts, if
  needed for ARIADNE to classify hosted behavior without raw content.

If adding retry behavior, keep it narrow:

- one retry maximum;
- private persona chat only;
- only when selected context exists and the owner prompt is direct/factual
  enough to evaluate against selected focus;
- no retry for general conversation, style exploration, creative writing,
  public visitor routes, imports, exports, billing, or moderation;
- token/quota accounting must include any retry conservatively;
- traces may store only sanitized reason codes, counts, and timing buckets.

Do not hardcode seeded anchor strings, replay persona names, hosted ids, test
account details, or staging prompt wording. The repair must generalize to any
owner-safe selected context.

If the safest answer is "diagnostic only, no repair yet", record the reason and
wake ARGUS. If the diagnostic proves the failure belongs to model/provider
choice rather than route contract, classify that precisely and wake MIMIR via
ARGUS with options.

## Non-Scope

Do not change:

- retrieval selection, vector/lexical ranking, embeddings, provider model
  choice, or provider routing;
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

Add or run focused conversation route tests proving:

- selected focus reaches the answer-contract point for the final provider
  request;
- an answer that ignores selected context is detected without storing raw
  selected strings;
- any retry is private-only, one-shot, and conservatively accounted;
- successful retry or repair preserves labels/titles with supporting facts;
- no hardcoded replay anchors or hosted ids are required;
- trace/session/readiness metadata stays sanitized.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR291_SELECTED_CONTEXT_ANSWER_CONTRACT_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether provider-facing contract placement, answer-use verification, retry,
  extractive fallback, or provider/model behavior was implicated;
- patch summary and whether retry behavior changed;
- validation commands and results;
- token/quota accounting and trace/readiness behavior if touched;
- rejected-control/source-copy/prompt-injection safety status;
- whether MIMIR should open an ARIADNE PR292 hosted rerun or route through a
  different next owner.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR291 Selected-Context Answer Contract Diagnostic.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review answer-use verifier/retry/accounting/trace behavior, provider contract placement, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the diagnostic/repair and define the safe acceptance gate.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR292 rerun.
```
