# PR424 - Import Memory Runtime Answer Rerun Result

Owner: DAEDALUS
Reviewer: ARGUS
Status: FAIL ANSWER-QUALITY GATE - WAKE ARGUS
Date: 2026-06-27

## Scope

DAEDALUS ran the MIMIR-authorized PR424 hosted rerun from:

`docs/roadmap/PR424_IMPORT_MEMORY_RUNTIME_ANSWER_RERUN_DAEDALUS.md`

The proof made exactly one hosted non-streaming private chat route invocation
against the same replay owner/persona chain used for PR421 through PR423. It
did not stream, pass debug, send a second owner message, manually retry,
save/promote/archive, mutate candidates, upload/register/import, clean up or
delete, publish Continuity, create documents, export, touch public/community
surfaces, or change provider/model/runtime configuration.

## Pre-Mutation Gates

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `516bcc4a248b` |
| API health | Ready, service `@station/api`, commit prefix `516bcc4a248b` |
| PR423 freshness | Pass; deployed API commit is at the PR423 selected-label/finalizer fix |
| Storage readiness | Bucket `persona-files`, ok/checked/exists/private |
| Provider readiness | Platform chat configured |
| Replay owner auth | Sign-in and `/auth/me` succeeded as tier `canon` |
| Token budget | `ok`; effective limit `20000000`, used `122258`, percent used `0.6` |
| Target isolation | Owner persona list had 3 entries; exactly one persona matched the PR419/PR420 import chain with one accepted Memory target and one accepted Canon target |
| Public search precheck | Zero matches across 4 selected PR419/PR420 proof-term/title queries |
| Context preview | HTTP 200; selected accepted import Memory and accepted import Canon |
| Context counts | Canon 4, Memory 6, Integrity 1, Archive 4, Continuity 4 |

The context-preview response was inspected in memory only. No raw selected
context, source IDs, source names, storage paths, prompts, or response bodies
are recorded here.

## Single Hosted Chat Result

Allowed mutation:

- One `POST /conversations/persona/:personaId/chat`.
- Prompt used exactly the PR424 bounded owner prompt.
- No `debug` flag.
- No stream route.
- No second owner message or manual retry.

Sanitized result:

| Check | Result |
| --- | --- |
| Route status | HTTP 200 |
| Reply existence | Pass |
| Provider/model label | `openai/gpt-oss-120b` |
| Persisted owner-visible messages | Exactly 1 user message and 1 assistant message in the proof conversation |
| Persisted message leak scan | Pass; no selected-context scaffolding, raw archive path, SQL, stack trace, provider payload, bearer material, UUID-shaped value, or secret-shaped value found in persisted message contents |
| Public search postcheck | Zero matches across 5 selected PR419/PR420/provenance queries |

Answer-quality evidence, recorded without dumping the answer:

| Check | Result |
| --- | --- |
| Accepted Memory safe label visible | Yes |
| Accepted Canon safe label visible | No |
| Owner-reviewed import provenance visible | Yes |
| Supporting fact paired with accepted Memory | Yes |
| Supporting fact paired with accepted Canon | No |

## Observability Readback

Owner observability readback reported sanitized enums/counts only:

| Check | Result |
| --- | --- |
| Trace status | `completed` |
| Total tokens | `8779` |
| Event labels | Chat runtime budget assembled; Selected-context answer contract retry; Selected-context answer contract; Persona chat response |
| Answer-contract schema | `station.selected_context_answer_contract.v1` |
| Private/direct/applicable | true / true / true |
| Selected item/label/fact counts | 8 / 8 / 8 |
| Matched item/label/fact counts | 2 / 2 / 5 |
| First reason code | `missed_selected_labels` |
| Final reason code | `missed_selected_labels` |
| Retry | attempted true, failed false, max attempts 1 |
| Finalizer | applied true, selected pair count 2, finalizer satisfied false |
| Post-finalizer fulfilled | false |
| Post-finalizer reason code | `missed_selected_labels` |

The projected trace leak scan passed after limiting evidence to safe labels,
enums, counts, model/provider labels, and sanitized metadata.

## DAEDALUS Verdict

```text
FAIL ANSWER-QUALITY GATE - WAKE ARGUS
```

The PR424 route/privacy/persistence checks passed: the deployed API was fresh
for PR423, preconditions were green, the hosted route ran once, one user
message and one assistant reply were persisted, leak scans passed, and public
search stayed empty.

The answer-quality gate failed. The final owner-visible answer used the
accepted Memory label/fact and safe owner-reviewed import provenance, but it
did not include the accepted Canon label or a Canon-paired supporting fact. The
answer-contract telemetry ended honestly at `missed_selected_labels` after the
route-internal retry/finalizer path, and `finalizerSatisfied` remained false.

Current baton:

- ARGUS has PR424.
- ARGUS should review the sanitized evidence and decide whether to wake MIMIR
  with a product/route verdict or wake DAEDALUS with an exact local fix.
