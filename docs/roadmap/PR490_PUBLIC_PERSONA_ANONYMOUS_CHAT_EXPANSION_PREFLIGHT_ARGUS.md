# PR490 - Public Persona Anonymous Chat Expansion Preflight

Date: 2026-07-05

Opened by: MIMIR / A1

Owner: ARGUS / A3

Status: open hostile preflight

## Why This Lane

PR489A closed the Station Assistant contextual-operations lane. The next move
should be a distinct Phase 3/customer-facing expansion, not another Assistant or
owner-readback polish pass.

The most relevant proven Phase 3 surface is public persona chat:

- PR468 closed anonymous public persona chat for the single replay alpha persona;
- PR468 kept owner enable/disable as the rollback switch;
- anonymous chat stayed public-source-only;
- `transcriptStored:false` remained true for anonymous visitors;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, provider
  settings, raw ids, credentials, storage paths, and source bodies stayed out of
  public responses and provider payloads.

The remaining product question is whether Station can safely move from one
seeded replay persona to a small owner-controlled eligibility model, or whether
that expansion needs a concrete unblocker first.

## Preflight Goal

ARGUS should decide the smallest safe PR490A slice for expanding anonymous
public persona chat beyond the single replay persona.

This is a hostile preflight only. Do not route implementation unless ARGUS can
name an exact safe boundary.

## Candidate PR490A Slices

### Option 1 - Owner Eligibility Readback

`PR490A - Public Persona Anonymous Chat Eligibility Readback`

Add or refine owner/admin readback so eligible public personas clearly show:

- anonymous chat enabled/disabled state;
- rollback/control owner;
- public-source-only constraint;
- rate-limit/fail-closed constraint;
- no visitor transcript persistence;
- provider readiness or blocker copy;
- why a persona is not eligible.

This slice should avoid enabling any new runtime behavior if ARGUS thinks the
runtime expansion itself is too risky.

### Option 2 - Second Replay Persona Proof

`PR490A - Second Replay Persona Anonymous Chat Proof`

If the existing runtime is already safely generalizable but hosted evidence is
thin, add or identify a second non-production eligible public persona fixture
and prove:

- anonymous chat works only for explicitly eligible personas;
- default public personas stay denied;
- anonymous responses remain public-source-only;
- visitor transcript persistence remains disabled;
- owner rollback still works.

Do not use private owner material or live customer/persona data for the proof.

### Option 3 - Owner-Controlled Enable Gate

`PR490A - Owner-Controlled Anonymous Public Chat Gate`

If ARGUS finds the current model already has adequate public-source, rate-limit,
provider, and rollback guardrails, implement the smallest owner-controlled gate
that lets an eligible owner enable or disable anonymous public chat for an
eligible public persona.

This option requires focused API/service/UI tests and ARIADNE hosted rehearsal.

## Expected ARGUS Output

Return one of:

```text
ACCEPT_PR490A_ELIGIBILITY_READBACK
ACCEPT_PR490A_SECOND_REPLAY_PERSONA_PROOF
ACCEPT_PR490A_OWNER_CONTROLLED_ENABLE_GATE
BLOCKED_NEEDS_PROVIDER_POLICY
BLOCKED_NEEDS_PRODUCT_DECISION
BLOCKED_NEEDS_SEED_OR_HOSTED_FIXTURE
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with:

- exact files/surfaces in scope;
- exact forbidden surfaces;
- focused tests;
- hosted ARIADNE rehearsal requirement for any visible or runtime behavior.

## Guardrails

Do not add:

- anonymous chat for all public personas by default;
- durable anonymous visitor transcripts;
- visitor identity analytics;
- cookies or user tracking for anonymous chat beyond the accepted minimized
  rate-limit posture;
- private Memory, Archive, Canon, Continuity, Integrity, private documents,
  owner setup, provider settings, or private source text in public prompts,
  responses, sources, logs, or readback;
- anonymous public reporting;
- cross-owner controls;
- social dispatch;
- billing/Stripe mutation;
- model/provider routing changes;
- prompt/retrieval architecture changes beyond preserving public-source-only
  constraints;
- workers, queues, Redis Memory truth, Cloudflare, connectors, OAuth, public
  launch/commercial claims, or broad UI redesign.

Do not expose:

- raw visitor identity;
- full prompts/completions/provider payloads;
- raw owner/persona/document/thread/source ids in visible text;
- storage paths, signed URLs, database URLs, tokens, cookies, API keys, webhook
  secrets, bearer/JWT-shaped values, or secret-shaped values.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR489A Station Assistant Next-Step Launcher after ARGUS acceptance and ARIADNE hosted proof.
- MIMIR opened PR490 as the next distinct Phase 3/customer-facing preflight: Public Persona Anonymous Chat Expansion.
Task:
- Hostile-preflight whether Station can safely move anonymous public persona chat beyond the single replay alpha persona.
- Choose eligibility readback, second replay persona proof, owner-controlled enable gate, a concrete blocker, defer, or MIMIR decision.
- If accepted, wake DAEDALUS with exact implementation boundary, tests, guardrails, and ARIADNE rehearsal requirement for visible/runtime behavior.
Guardrails:
- Preserve public-source-only prompting, transcriptStored:false for anonymous visitors, owner rollback, fail-closed rate limits, private-context exclusion, and no broad public launch claims. Do not enable anonymous chat for all public personas by default.
```
