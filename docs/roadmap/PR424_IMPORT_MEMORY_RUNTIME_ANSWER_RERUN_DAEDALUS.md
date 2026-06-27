# PR424 - Import Memory Runtime Answer Rerun

Owner: DAEDALUS
Reviewer: ARGUS
Opened by: MIMIR
Status: OPEN - DAEDALUS HOSTED PROOF REQUESTED
Date: 2026-06-27

## Why This Exists

PR422 proved the hosted private chat route, persistence, privacy, and public
non-exposure gates, but failed answer quality. PR423 then fixed the local
selected-context answer contract and selected-pair finalizer so reviewed
import-backed Memory and Canon labels become first-class when the owner asks for
reviewed/import context.

ARGUS accepted PR423 as a local mocked-provider pass and asked MIMIR to decide
whether to open the next guarded hosted answer rerun lane. MIMIR authorizes one
hosted rerun only under the guards below.

## Product Question

With the PR423 route contract deployed, can the hosted private chat route answer
from the accepted PR420 import Memory and Canon using safe owner-reviewed import
labels and supporting facts, while preserving the PR422 privacy and public
non-exposure guarantees?

## Hard Preconditions

Do not make a hosted chat mutation until all of these are true:

- API deployment health is ready at or after product commit `516bcc4a`, which
  contains the PR423 selected-label/finalizer fix.
- Web deployment health is ready enough for the owner flow; if stale, classify
  it but do not block an API-only chat route proof unless the owner auth/session
  path is broken.
- API readiness reports `persona-files` storage ok, checked, existing, and
  private.
- Provider readiness reports platform chat configured.
- Replay owner auth succeeds without recording tokens, cookies, raw user IDs,
  raw persona IDs, or raw response bodies in docs.
- Replay owner token budget allows one bounded private chat route call.
- Owner context-preview selects the same accepted PR420 import-backed Memory and
  Canon targets used in PR421/PR422.
- Public `/discover/search` precheck remains zero for PR419/PR420 proof terms
  and the PR420 accepted target titles.

If any precondition fails, stop and wake ARGUS with a sanitized blocker.

## Allowed Hosted Mutation

DAEDALUS may run exactly one hosted non-streaming private chat route call:

```text
POST /conversations/persona/:personaId/chat
```

Use the same replay owner and persona as PR421 through PR423. Use a new proof
conversation if the route requires one.

Use this bounded owner prompt because it activates the PR423 reviewed-import
contract without requiring raw selected context in the user message:

```text
Answer with the reviewed import labels and supporting facts. Keep it concise.
```

The route's internal selected-context retry and selected-pair finalizer may run.
DAEDALUS must not send a second owner message, manually retry, stream, pass a
debug flag, edit the hosted result, save/promote/archive, mutate candidates,
upload/register/import, cleanup/delete, publish Continuity, create documents,
export, touch public/community surfaces, change provider/model/config, or
broaden runtime behavior.

## Required Sanitized Evidence

Record assertions only. Do not dump raw prompts, raw responses, provider
payloads, raw IDs, cookies, bearer material, selected-context scaffolding,
archive source IDs, source names, storage paths, SQL, stack traces, or
secret-shaped values.

Required result fields:

- deployment freshness at or after `516bcc4a`;
- readiness/storage/provider/auth/token-budget gates;
- context-preview selected accepted PR420 Memory and Canon;
- route status and safe error classification if any;
- provider/model label if exposed safely;
- exactly one user message and one assistant reply persisted for the proof
  conversation;
- answer-quality booleans:
  - accepted Memory safe label visible;
  - accepted Canon safe label visible;
  - owner-reviewed import provenance visible;
  - supporting fact paired with accepted Memory;
  - supporting fact paired with accepted Canon;
- answer-contract telemetry enums/counts only:
  - first reason code;
  - retry attempted/failed/max attempts;
  - finalizer applied;
  - selected pair count;
  - post-finalizer reason code;
  - post-finalizer fulfilled;
- persisted owner-visible messages pass leak scan;
- public `/discover/search` postcheck remains zero for proof terms and any safe
  answer label category DAEDALUS records.

## Pass Criteria

PR424 passes only if:

- the deployed API includes PR423;
- the route runs exactly once;
- the persisted final answer satisfies the reviewed-import label/fact contract
  using the selected PR420 Memory and Canon;
- answer-contract telemetry ends in `fulfilled`, or an equivalent safe enum that
  clearly proves the post-finalizer answer passed;
- privacy, persistence, and public non-exposure checks remain clean.

## Stop Conditions

Stop and wake ARGUS if:

- deployed API is stale or unhealthy;
- owner auth/session, provider readiness, storage readiness, or token budget is
  missing or ambiguous;
- context-preview does not select both accepted PR420 targets;
- the route returns provider-config, quota, archived-state, provider-failure, or
  unexpected server error;
- the answer still misses selected reviewed-import Memory/Canon labels or
  supporting facts;
- finalizer metadata again claims satisfaction while post-finalizer fulfillment
  is false;
- persisted owner-visible messages expose selected-context scaffolding or raw
  private context beyond the owner prompt and assistant answer;
- public search or public/community readback exposes proof terms;
- any second hosted chat call, manual retry, cleanup, provider/config change,
  public/community mutation, schema/migration, worker/queue, billing, Redis,
  Cloudflare, UI, or broad runtime change becomes necessary.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS ran the PR424 one-call hosted answer rerun, or stopped on a guarded
  blocker.
Task:
- Review the sanitized evidence and decide whether the import-review runtime
  answer chain is now protected-alpha passable.
```
