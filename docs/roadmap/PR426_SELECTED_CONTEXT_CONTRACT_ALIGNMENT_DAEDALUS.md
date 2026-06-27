# PR426 - Selected Context Contract Alignment

Owner: DAEDALUS
Reviewer: ARGUS
Opened by: MIMIR
Status: OPEN - DAEDALUS LOCAL FIX REQUESTED
Date: 2026-06-27

## Why This Exists

PR425 passed the hosted route/privacy proof and the accepted-target answer
booleans: the final owner-visible answer included the accepted Memory label and
fact, the accepted Canon label and fact, and safe owner-reviewed import
provenance.

The route's own answer-contract telemetry still ended at
`missed_selected_labels` with `finalizerSatisfied:false` and
`postFinalizerFulfilled:false`. ARGUS classified this as a product/contract
semantics mismatch rather than a privacy failure or scope violation.

MIMIR is not closing the chain with a telemetry caveat yet. PR426 should align
the local contract so the route can truthfully report when the reviewed-import
target proof passes.

## Product Question

For a private direct factual prompt that explicitly asks for reviewed import
labels and supporting facts, should the selected-context answer contract pass
when the owner-visible answer includes the accepted owner-reviewed import
Memory and Canon label/fact pairs, even if it omits unrelated selected context
items?

MIMIR's answer: yes, for this targeted reviewed-import proof. The generic
selected-context contract should still protect broader prompts, but the
reviewed-import lane needs a contract mode whose pass criteria match the
accepted-target proof.

## Scope

DAEDALUS should make a local-only route/contract/test fix. No hosted chat is
authorized.

Allowed work:

- adjust the private chat selected-context answer contract in
  `apps/api/src/routes/conversations.ts`;
- add focused local tests in `apps/api/src/routes/conversation-archive.test.ts`;
- update replay-readiness observability fixtures only if metadata shape changes;
- update docs with sanitized validation evidence.

Required behavior:

- For reviewed/import prompts, required owner-reviewed import Memory/Canon pairs
  should be the pass target.
- If those required pairs are satisfied, the answer-contract telemetry should
  end in `fulfilled` or an equivalent safe pass enum, even if unrelated
  selected context items are omitted.
- For non-reviewed/import prompts, existing selected-context behavior should
  stay intact.
- `finalizerSatisfied` must remain tied to post-finalizer fulfillment.
- The contract must not hide a real miss of the accepted import Memory label,
  accepted import Canon label, owner-reviewed import provenance, or paired
  supporting facts.
- No raw source IDs, source names, storage paths, raw prompts, raw responses,
  provider payloads, bearer material, cookies, SQL, stack traces, or
  secret-shaped values may be added to docs or telemetry.

Required local proof:

- reproduce the PR425 mixed-evidence shape locally:
  - accepted import Memory label/fact present;
  - accepted import Canon label/fact present;
  - owner-reviewed import provenance present;
  - unrelated selected context labels omitted;
  - contract now reports pass for the reviewed-import target mode;
  - leak/persistence checks remain clean.
- preserve coverage that missing accepted import Memory or Canon label/fact
  still fails.

Validation target:

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` if telemetry
  metadata changes
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`
- `git diff --check`
- added-line sensitive-pattern scan

## Non-Goals

PR426 does not authorize:

- hosted chat/model calls;
- live provider calls;
- reading `.env` credentials;
- provider/model/config changes;
- import/candidate mutations;
- hosted cleanup;
- public/community mutation;
- Redis, Cloudflare, schema, migration, worker, queue, billing, UI, or broad
  runtime work.

## Handoff

When complete, wake ARGUS with sanitized local evidence. ARGUS should decide
whether the local contract alignment is enough for MIMIR to close the
import-review runtime answer chain, or whether another exact local fix is
needed.
