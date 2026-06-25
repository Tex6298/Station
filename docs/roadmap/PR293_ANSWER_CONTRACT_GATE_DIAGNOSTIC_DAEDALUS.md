# PR293 - Answer Contract Gate Diagnostic

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-25
Accepted: 2026-06-25

## Purpose

Repair the narrow PR292 failure: selected context was present, the
answer-contract event ran, but no retry event was observed and the sanitized
trace detail did not expose the reason code needed to classify the gate.

Do not classify the remaining failure as provider/model behavior until the
answer-contract gate exposes safe reason-code and retry-decision summaries, and
the direct/factual classifier is aligned with the hosted acceptance fixture.

## Starting Evidence

PR292 hosted proof:

- Web/API were fresh on `main` with accepted PR291 runtime/review commit
  `9531d22b`.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Context preview and latest conversation trace showed Canon, Memory,
  Integrity, Archive, and Continuity context present.
- Sanitized context inspection contained both accepted concept labels and both
  matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The single hosted chat request returned HTTP 200, stayed short, avoided raw
  source-body copying, and excluded the rejected control.
- The answer recalled neither accepted concept label nor invented phrase.
- Sanitized trace detail contained a completed `Selected-context answer
  contract` event but no `Selected-context answer contract retry` event.
- Contract reason codes were not exposed through the sanitized trace detail.

## Questions To Answer

1. Did the PR292 hosted prompt fail the direct/factual classifier even though it
   is an answer/naming request over selected context?
2. Are answer-contract reason codes and retry decisions stored in trace payloads
   but stripped by the AI trace detail sanitizer?
3. What is the narrowest safe allow-list for owner-visible trace detail:
   contract schema, applicable, directFactual, selected counts, matched counts,
   reasonCode, retryRecommended, retry attempted/failed, and max attempts?
4. Can the direct/factual classifier include answer/naming/state-style factual
   commands without retrying creative/style prompts?
5. Can local tests reproduce the PR292 acceptance fixture: selected context
   present, PR292-shaped factual prompt, first answer misses all selected focus,
   retry fires once, and sanitized trace detail exposes reason codes without raw
   selected strings?

## Patch Rule

Patch only the selected-context answer-contract gate and sanitized readback.

Acceptable patch shapes include:

- exposing safe answer-contract fields through the owner-only trace detail
  sanitizer while preserving raw prompt/source/completion redaction;
- adding a sanitized answer-contract summary to replay-readiness or trace
  metadata if that is the existing safer readback surface;
- tightening the direct/factual classifier so factual answer/naming/state-style
  prompts are eligible for the one-shot retry, while creative/style prompts
  remain single-shot;
- adding route tests that prove the PR292-shaped prompt triggers retry when the
  first answer misses all selected focus;
- adding observability tests that prove reason codes and retry decisions are
  visible as sanitized enums/booleans/counts only.

Do not broaden retry beyond the PR291 safe acceptance gate:

- private persona chat only;
- selected context required;
- direct/factual owner prompt required;
- retry only when all selected label/fact focus is missed;
- one retry maximum;
- no raw selected terms, prompts, completions, provider payloads, private source
  bodies, raw ids, cookies, tokens, or credentials in trace/readiness output.

If the diagnostic shows the gate is already correct and observable, wake ARGUS
with the proof and recommend provider/model classification. Do not broaden into
provider routing/model choice in this lane.

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
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Run `test:retrieval-metadata` and `test:persona-context` only if the patch
touches selected-context assembly or retrieval-adjacent helpers.

Add or run focused tests proving:

- PR292-shaped factual prompt is direct/factual;
- creative/style prompt with selected context remains no-retry;
- first answer missing all selected focus triggers exactly one retry;
- sanitized trace/readiness detail exposes reason codes and retry decisions;
- raw selected strings, prompts, completions, payloads, source bodies, ids,
  cookies, tokens, and credentials stay absent.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR293_ANSWER_CONTRACT_GATE_DIAGNOSTIC_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether the issue was classifier gating, sanitizer/readback, retry decision,
  or provider/model behavior;
- patch summary and whether retry scope changed;
- validation commands and results;
- trace/readiness sanitizer behavior;
- rejected-control/source-copy/prompt-injection safety status;
- whether MIMIR should open an ARIADNE PR294 hosted rerun or classify provider
  model behavior.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR293 Answer Contract Gate Diagnostic.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review direct/factual gate breadth, retry boundary, sanitized reason-code/readiness exposure, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the gate/readback repair.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR294 rerun or classify provider/model behavior.
```
