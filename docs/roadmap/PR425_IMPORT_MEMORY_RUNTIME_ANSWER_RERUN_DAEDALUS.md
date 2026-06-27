# PR425 - Import Runtime Answer Rerun After Canon Priority Fix

Owner: DAEDALUS
Reviewer: ARGUS
Opened by: MIMIR
Status: OPEN - DAEDALUS HOSTED PROOF REQUESTED
Date: 2026-06-27

## Why This Exists

PR424's hosted rerun proved the route, persistence, privacy, observability, and
public non-exposure gates, but the answer still missed the accepted import Canon
label/fact. ARGUS routed that narrow failure back to DAEDALUS. The local
Canon-priority fix is now accepted: reviewed/import prompts prioritize
owner-reviewed import Memory/Canon before bucket slicing, so the accepted import
Canon should no longer be displaced by ordinary higher-priority Canon.

MIMIR authorizes one guarded hosted rerun after that fix deploys.

## Hard Preconditions

Do not make a hosted chat mutation until all of these are true:

- API deployment health is ready at or after product commit `1cef81ac`, which
  contains the Canon-priority fix.
- API readiness reports `persona-files` storage ok, checked, existing, and
  private.
- Provider readiness reports platform chat configured.
- Replay owner auth succeeds without recording tokens, cookies, raw user IDs,
  raw persona IDs, or raw response bodies in docs.
- Replay owner token budget allows one bounded private chat route call.
- Owner context-preview selects the accepted PR420 import Memory and accepted
  PR420 import Canon targets.
- Public `/discover/search` precheck remains zero for PR419/PR420 proof terms
  and accepted target titles.

Stop and wake ARGUS with a sanitized blocker if any precondition fails.

## Allowed Hosted Mutation

DAEDALUS may run exactly one hosted non-streaming private chat route call:

```text
POST /conversations/persona/:personaId/chat
```

Use the same replay owner and persona as PR421 through PR424. Use a new proof
conversation if needed.

Use the same bounded reviewed-import prompt:

```text
Answer with the reviewed import labels and supporting facts. Keep it concise.
```

The route's internal selected-context retry and selected-pair finalizer may run.
No second owner message, manual retry, stream, debug flag, hosted cleanup,
save/promote/archive, candidate action, upload/register/import, Continuity
publication, document creation, export, public/community mutation,
provider/model/config change, Redis, Cloudflare, schema, migration, worker,
queue, billing, UI, or broad runtime work is authorized.

## Required Sanitized Evidence

Record assertions only. Do not dump raw prompts, raw responses, provider
payloads, raw IDs, cookies, bearer material, selected-context scaffolding,
archive source IDs, source names, storage paths, SQL, stack traces, or
secret-shaped values.

Required fields:

- deployment freshness at or after `1cef81ac`;
- readiness/storage/provider/auth/token-budget gates;
- context-preview selected accepted PR420 Memory and Canon;
- route status and safe error classification if any;
- provider/model label if exposed safely;
- exactly one user message and one assistant reply persisted;
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
- persisted owner-visible message leak scan;
- public `/discover/search` postcheck remains zero.

## Pass Criteria

PR425 passes only if the deployed API includes the Canon-priority fix, the route
runs exactly once, the persisted final answer includes both accepted
reviewed-import Memory and Canon label/fact pairs, and privacy/public
non-exposure checks remain clean.

## Handoff

When complete, wake ARGUS with sanitized pass/fail/blocker evidence.
