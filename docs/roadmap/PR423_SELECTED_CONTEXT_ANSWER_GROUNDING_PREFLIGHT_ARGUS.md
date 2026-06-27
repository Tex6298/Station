# PR423 - Selected Context Answer Grounding Preflight

Owner: ARGUS
Opened by: MIMIR
Status: OPEN - ARGUS PREFLIGHT REQUESTED
Date: 2026-06-27

## Why This Exists

PR422 proved the hosted private chat route can run once without leaking private
selected context, provider payloads, raw archive metadata, or proof terms into
public surfaces. It also proved the answer-quality gate is not ready: the
assistant reply did not visibly use the accepted import Memory title, accepted
Canon title, or reviewed-import/owner-review label.

ARGUS accepted PR422 as an honest answer-quality failure and recommended a
narrow answer-grounding/selected-label lane before any hosted retry.

This lane exists to make selected import labels first-class in the local route
contract and finalizer. It is not another hosted chat proof.

## Product Question

When owner-reviewed import Memory and Canon are selected for a private direct
factual answer, can the route reliably produce an owner-visible answer that
names the selected Memory/Canon labels and pairs them with supporting facts,
without exposing raw selected-context scaffolding or private source metadata?

The target protected-alpha contract is:

```text
reviewed import context selected -> answer uses reviewed import labels/facts
```

## Current Evidence

- PR420 proved the PR419 hosted import candidates were owner-reviewed into
  Memory and Canon exactly once.
- PR421 proved those accepted import-backed Memory and Canon records can enter
  owner-only runtime context preview under lifecycle/trust guards.
- PR422 proved one hosted private chat route call passed route, persistence,
  privacy, provider-payload, and public non-exposure gates.
- PR422 failed answer quality: sanitized telemetry ended at
  `missed_selected_labels` after the route-internal retry/finalizer path.
- PR422 telemetry also showed a suspicious split: finalizer metadata reported
  it was applied and satisfied, while the post-finalizer answer contract still
  reported `missed_selected_labels`.

## Proposed PR423 Scope

ARGUS should decide whether this is safe to hand to DAEDALUS.

If accepted, DAEDALUS should make only local route/contract/test changes needed
to prove selected labels are reliable before another hosted chat proof.

Allowed work:

- inspect the private chat selected-context answer contract in
  `apps/api/src/routes/conversations.ts`;
- inspect the selected context focus text sent to providers;
- inspect the selected-pair finalizer and telemetry semantics;
- add or adjust focused tests in `apps/api/src/routes/conversation-archive.test.ts`;
- update replay-readiness observability tests only if metadata semantics change;
- update docs with sanitized local validation results.

Required local proof:

- reproduce the PR422 failure class with synthetic accepted import Memory and
  Canon fixtures, not hosted data;
- require the selected Memory title and selected Canon title to be visible in
  the final owner-visible answer when a private direct factual prompt asks for
  reviewed import context;
- require the final answer to include at least one supporting fact paired with
  each required selected label, or an explicit local failure reason;
- require owner-review/reviewed-import provenance language where the selected
  item is import-backed and owner accepted;
- ensure finalizer metadata cannot claim the finalizer is satisfied when the
  post-finalizer answer contract is still `missed_selected_labels`;
- ensure the persisted owner-visible answer does not expose selected-context
  scaffolding, raw archive IDs, source names, storage paths, provider payloads,
  SQL, stack traces, bearer material, or secret-shaped values.

Implementation guidance:

- Treat the selected label as the exact public-safe Memory/Canon title or safe
  fallback label already visible to the owner.
- Treat reviewed import provenance as public-safe classification, not as a raw
  source path, filename, archive source ID, or storage object reference.
- If finalizer output is generated, re-evaluate the actual finalizer answer and
  let the telemetry describe that post-finalizer result truthfully.
- If local contract fulfillment cannot be achieved without prompt/provider
  broadening, stop and wake MIMIR.

## Hard Guards

PR423 does not authorize:

- hosted chat/model calls;
- manual hosted retries;
- provider/model/config changes;
- Memory/Canon candidate actions;
- upload/register/import;
- save/promote/archive;
- cleanup/delete of hosted proof data;
- public/community mutations;
- Redis, Cloudflare, schema, migration, worker, queue, billing, or UI work;
- dumping raw hosted prompts, raw hosted responses, raw IDs, raw source names,
  raw archive metadata, storage paths, cookies, bearer tokens, or provider
  payloads into docs.

DAEDALUS may run local tests and local route simulations only. Hosted validation
comes in a later lane after ARGUS accepts PR423.

## ARGUS Review Questions

- Is this scoped narrowly enough after PR422?
- Should DAEDALUS fix the finalizer telemetry semantics as part of PR423?
- Should the selected answer contract require both Memory and Canon labels for
  the reviewed-import proof prompt, or is one selected label plus one supporting
  fact enough for a local pass?
- Is reviewed-import/owner-review provenance safe to surface as a label in the
  owner-visible answer, provided raw source metadata stays hidden?
- Are `test:conversation-archive` and any replay-readiness observability tests
  enough local validation before another hosted chat proof?

## Expected Handoff If Accepted

Wake DAEDALUS with:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR422 passed route/privacy but failed answer quality.
- PR423 is a local-only selected-label/answer-grounding repair.
Task:
- Make selected import Memory/Canon labels first-class in the private chat
  answer contract/finalizer.
- Add focused local tests proving final answers include required labels,
  supporting facts, and safe reviewed-import provenance.
- Do not run hosted chat.
```

If ARGUS disagrees with the scope, wake MIMIR with the exact narrower lane.
