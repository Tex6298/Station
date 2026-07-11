# PR506 - Persona Encounter Private Session Preflight

Owner: ARGUS / A3

Date: 2026-07-11

Status:

```text
OPEN_HOSTILE_PREFLIGHT
```

## Context

PR505D is closed as accepted:

`docs/roadmap/PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN_CLOSEOUT.md`

Station now has hosted proof that the owner-only, same-owner, disposable
persona encounter preview can return nonblank responder content while keeping
the current boundaries:

- owner-only;
- same-owner persona pair only;
- explicitly route-gated provider access;
- one disposable responder reply;
- no durable transcript;
- no shareable output;
- no source retrieval;
- no public route;
- signed-out and cross-owner probes fail closed.

The Phase 3 Future Vision describes Persona-to-Persona Encounters as structured
encounters whose transcripts and publication rights need careful ownership,
consent, and provenance rules. The current implementation is only the private
runtime proof. It is not yet an owner-usable encounter artifact.

## Preflight Question

Can Station safely open a smallest owner-only private encounter session
artifact lane now, or is there a concrete blocker that must be removed first?

## Candidate PR506A Slice

`PR506A - Owner Encounter Private Session Artifact`

Possible narrow product shape:

- Keep the existing preview route disposable by default.
- Add an explicit owner action to save a successful preview as a private
  encounter artifact.
- Save only same-owner encounters.
- Save only after the owner clicks an explicit keep/save control.
- Preserve provenance labels for:
  - owner-authored setup;
  - selected same-owner personas;
  - model-generated responder reply;
  - no source retrieval;
  - private owner-only artifact;
  - not public;
  - not shareable.
- Provide owner-only Studio readback of saved private encounter artifacts.
- Provide delete/discard behavior.
- Keep public routes and public persona pages unchanged.

ARGUS should decide whether this needs a new schema/table, can safely reuse an
existing private artifact pattern, or must be blocked until a more explicit
transcript/ownership contract exists.

## Guardrails

PR506A must not:

- enable cross-owner encounters;
- enable autonomous/background encounters;
- enable scheduled encounters;
- run multi-turn loops;
- auto-save previews;
- publish or share encounter output;
- create public encounter pages;
- expose anonymous/visitor encounter controls;
- retrieve Memory, Archive, Canon, Continuity, Integrity, vectors, embeddings,
  archived chats, source buckets, or source bodies;
- store provider payloads, prompt internals, private context bodies, raw owner
  ids, raw persona ids, provider keys, base URLs, model config, token values,
  env values, stack traces, SQL detail, cookies, or auth tokens;
- add social posting, Station Press packaging, billing, Stripe, Redis,
  Cloudflare, queues, workers, webhooks, storage buckets, broad provider
  policy, broad UI redesign, voice, avatar, or Salon/live-event behavior.

## ARGUS Decision Options

Return one of:

```text
ACCEPT_PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT
ACCEPT_PR506A_OWNER_ENCOUNTER_SAVE_CONTRACT_ONLY
BLOCKED_NEEDS_TRANSCRIPT_OWNERSHIP_CONTRACT
BLOCKED_NEEDS_PROVENANCE_SCHEMA_CONTRACT
BLOCKED_NEEDS_OWNER_DELETE_RETENTION_POLICY
BLOCKED_NEEDS_RATE_OR_TOKEN_ACCOUNTING_PROOF
BLOCKED_NEEDS_PUBLIC_PRIVATE_BOUNDARY_REPAIR
REJECT_SCOPE_TOO_BROAD
```

If accepting implementation, define:

- exact data model or no-schema approach;
- exact API and UI surfaces;
- whether generated responder text may be persisted in the owner-private
  artifact;
- delete/discard behavior;
- provenance fields;
- owner and cross-owner access rules;
- no-leak fields;
- focused tests;
- hosted ARIADNE proof requirements;
- DAEDALUS wakeup scope.

If blocked, wake MIMIR with the smallest numbered unblock lane.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR505D is closed: hosted owner encounter preview now returns nonblank disposable responder content with privacy/provenance boundaries intact.
- MIMIR selects Persona-to-Persona Encounters as the continuing Phase 3 product lane.
- The next question is whether a smallest owner-only private encounter session artifact can be opened safely.
Task:
- Hostile-preflight PR506.
- Decide the smallest safe next slice, or name the concrete blocker.
- If accepted, wake DAEDALUS with exact implementation scope.
- If blocked, wake MIMIR with the smallest unblock lane.
```
