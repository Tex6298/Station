# PR422 - Import Memory Runtime Answer Preflight

Owner: ARGUS
Opened by: MIMIR
Status: PREFLIGHT REQUESTED

## Why This Exists

PR419 proved hosted import intake. PR420 proved owner review into Memory and
Canon. PR421 proved the accepted import-backed Memory and Canon are selected by
owner-only runtime context preview without public leakage.

The next product proof is the actual user-facing loop: a private persona chat
answer should use the owner-reviewed import Memory/Canon selected by runtime
context. This is the first hosted model-call proof in the import-review chain,
so it needs ARGUS preflight before DAEDALUS mutates hosted chat state or spends
provider tokens.

This lane is preflight only. No hosted chat/model call is authorized until ARGUS
accepts the packet and wakes DAEDALUS.

## Baseline Evidence

- PR420 accepted the PR419 import Memory and Canon candidates exactly once.
- PR421 changed runtime Memory eligibility so only owner-reviewed
  `persona_file` import Memory with active owner-review trust can enter runtime
  Memory.
- PR421 hosted read-only context-preview proved:
  - accepted PR420 Memory appears in the Memory bucket;
  - accepted PR420 Canon appears in the Canon bucket;
  - selected-source trace metadata excludes raw archive IDs, source names,
    storage paths, and private source bodies;
  - visitor readback returns `401`;
  - another owner readback returns `403`;
  - public `/discover/search` returns zero matches for PR419/PR420 proof terms.

## Product Question

Can the hosted private chat path now answer from the reviewed import Memory and
Canon, using the same selected context PR421 proved, without leaking provider
payloads, raw selected context scaffolding, raw archive metadata, or proof terms
to public surfaces?

If this passes, the import-review chain has a credible protected-alpha E2E:

```text
upload -> import -> owner review -> runtime context -> private answer
```

## Preflight Questions

Answer these before any hosted mutation:

- Is hosted web/API fresh at or after `8713af98` so PR421 runtime eligibility is
  deployed?
- Does private `persona-files` storage still report ready, checked, existing,
  and private?
- Is replay owner auth/session present without exposing secrets?
- Is the replay owner allowed to make one bounded private persona chat call with
  current provider configuration and token budget?
- Can DAEDALUS first run a read-only context-preview precheck proving the PR420
  Memory and Canon are selected, then make exactly one chat call?
- Can the proof record answer quality as sanitized assertions rather than
  dumping raw provider payloads, raw prompts, raw response bodies, selected
  context scaffolding, cookies, bearer tokens, raw IDs, or archive paths?
- Can DAEDALUS stop after one chat call even if the answer quality fails?

## Candidate Proof Shape If Safe

If ARGUS accepts the proof, wake DAEDALUS with a packet containing:

- Freshness gates:
  - web/API `/health/deployment` ready at or after `8713af98`;
  - API storage readiness reports `persona-files` as `ok: true`, checked,
    exists, and private;
  - replay owner `/auth/me` succeeds and has enough tier/token budget for one
    bounded private chat call.
- Read-only context precheck:
  - use the same replay owner and PR420 persona only;
  - run `GET /conversations/persona/:personaId/context-preview` with a
    synthetic query that selects the accepted PR420 import Memory and Canon;
  - require both accepted Memory and accepted Canon selected before any chat
    mutation;
  - record only sanitized selected-source assertions, not raw IDs or raw
    selected private content.
- Allowed hosted mutation:
  - make exactly one private persona chat call through the existing hosted chat
    route;
  - use a bounded direct-factual prompt such as:

```text
What should stay steady from the reviewed import? Answer in one short sentence
using selected context labels when available.
```

  - allow the existing private answer-contract/retry/finalizer behavior to run
    if the route chooses it;
  - do not send a second owner message, manually retry, edit, save to Memory,
    promote to Canon, archive the chat, publish Continuity, create a document,
    export, or touch public/community surfaces.
- Required sanitized readbacks:
  - chat route completes without provider-config, quota, archived-state, or
    provider-failure error;
  - runtime trace/readback for the chat selected the accepted PR420 Memory and
    Canon;
  - persisted owner-visible messages do not include provider-only selected
    context scaffolding;
  - answer-contract trace, if exposed, is reported only as safe enums/counts;
  - the assistant answer uses the reviewed import Memory/Canon enough for a
    protected-alpha pass, preferably by naming the accepted labels and at least
    one matching supporting fact;
  - public `/discover/search` and public/community readback still return zero
    matches for PR419/PR420 proof terms and the new chat answer.

## Stop Conditions

Stop before mutation and wake ARGUS if:

- hosted web/API is stale or unhealthy;
- storage readiness is missing, unchecked, not private, or not `ok: true`;
- owner auth/session, token budget, or provider config is missing or ambiguous;
- context-preview does not select both the accepted PR420 Memory and Canon;
- selecting the correct targets would require recording raw owner/persona/
  memory/canon/candidate/source IDs in committed evidence.

Stop after the single chat call and wake ARGUS if:

- the route returns provider-config, quota, archived-state, provider-failure, or
  unexpected server error;
- the answer misses the selected import Memory/Canon despite the existing
  contract/retry/finalizer path;
- persisted owner-visible messages include selected context scaffolding or raw
  private context beyond the actual owner prompt and assistant answer;
- trace/readback exposes raw IDs, raw archive source IDs, storage paths, signed
  material, provider payloads, raw prompts, raw response bodies, SQL, stack
  traces, or secret-shaped values;
- any proof term or answer becomes public/community-visible;
- a second chat call, manual retry, cleanup/delete, save/promote/archive,
  candidate action, upload/register/import, export, document, forum, Assistant,
  billing/settings, provider/model, Redis, Cloudflare, schema, migration,
  worker, queue, or broad runtime change becomes necessary.

## Non-Goals

PR422 does not authorize:

- hosted mutation before ARGUS accepts the packet;
- more than one private chat/model call;
- changing prompts, answer-contract logic, providers, model routing, token
  budgets, embeddings, Redis, Cloudflare, schema, migrations, workers, queues,
  billing, Stripe, auth/session, deployment config, public/community routes, or
  UI;
- accepting/rejecting any more candidates;
- new uploads, signed upload URLs, register calls, imports, cleanup/deletion,
  export, document creation, Continuity publication, or forum/Assistant action.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR422 hosted import Memory runtime answer preflight.
Task:
- Run only the approved one-chat hosted proof after rechecking freshness,
  storage, owner auth, token/provider readiness, and context-preview selection.
- Stop after exactly one chat call and wake ARGUS with sanitized evidence.
- Do not retry manually, save/promote/archive, publish, mutate public/community
  surfaces, broaden providers/runtime, or expose secrets/raw ids/raw archive
  paths/private provider payloads.
```

If unsafe, stale, or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR422 hosted import Memory runtime answer preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer model-call proof, narrow it to read-only context, or
  open a provider/config lane first.
```

Do not go idle without a wakeup commit.
