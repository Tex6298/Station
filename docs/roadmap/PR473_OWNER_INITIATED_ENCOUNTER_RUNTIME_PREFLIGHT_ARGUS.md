# PR473 - Owner-Initiated Encounter Runtime Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - runtime preflight

## Why This Lane

PR472A closed the Encounter Consent / Provenance contract. The contract says
the next possible runtime slice must be same-owner, owner-initiated, explicitly
started, manually stoppable, turn-capped, non-background by default,
cost-estimated, owner-attributed, rate-limited, and plan-gated before any
provider call can happen.

MIMIR is not opening runtime implementation directly. ARGUS should decide
whether the repo now has enough guardrails for a smallest owner-only runtime
slice, or name the next concrete blocker and smallest unblock lane.

## Preflight Question

Can Station safely implement a first same-owner, owner-initiated
persona-to-persona encounter runtime preview without creating background loops,
durable transcripts, cross-owner behavior, public/shareable output, or
unbounded provider cost?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the smallest implementation shape. If blocked
or decision-dependent, wake MIMIR with the concrete blocker and smallest next
unblock lane.

## Candidate Smallest Runtime Shape

ARGUS should accept, narrow, reject, or replace this candidate:

- private Studio-only surface;
- same owner only: both personas must belong to the authenticated owner;
- explicit owner click to start;
- no background continuation;
- no automatic retry loop;
- hard cap of one generated exchange or another tiny bounded output shape;
- no durable transcript, draft, archive, generated document, post, thread, or
  comment persistence in the first slice;
- no public or shareable route;
- provenance copy visible before and after generation;
- cost/rate-limit/plan guard must fail closed before provider call;
- owner can discard the output by leaving the page.

If the repo cannot enforce those constraints with existing provider/usage
contracts, ARGUS should block and name the smallest unblock.

## Repo Evidence To Inspect

- PR471/PR472 encounter docs:
  `docs/roadmap/PR471_PERSONA_TO_PERSONA_ENCOUNTERS_PREFLIGHT_RESULT.md`,
  `docs/roadmap/PR472_PERSONA_ENCOUNTER_CONSENT_PROVENANCE_PREFLIGHT_RESULT.md`,
  `docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_CLOSEOUT.md`.
- Existing chat/provider/cost/rate-limit paths:
  `apps/api/src/routes/chat.ts`,
  `apps/api/src/routes/token-credits.ts`,
  `apps/api/src/routes/settings.ts`,
  `packages/ai`,
  `packages/config`,
  `packages/auth/src/permissions.ts`.
- Persona ownership and serializers:
  `apps/api/src/routes/personas.ts`,
  `apps/api/src/lib/persona-serialization.ts`,
  `packages/types/src/persona.ts`,
  `apps/web/app/studio/personas/[personaId]/page.tsx`,
  `apps/web/components/studio/persona-workspace.tsx`.
- Private source surfaces that must stay out unless explicitly selected by an
  accepted future contract:
  `apps/api/src/routes/memory.ts`,
  `apps/api/src/routes/archive.ts`,
  `apps/api/src/routes/continuity.ts`,
  `apps/web/app/studio/personas/[personaId]`.

## Questions ARGUS Must Answer

1. Can existing auth/ownership checks prove both personas are same-owner before
   any runtime action?
2. Is there an existing provider/cost/rate-limit/plan guard suitable for this
   runtime, or is a new guard required first?
3. Can the first runtime be non-durable without creating misleading UX or hidden
   state?
4. What is the maximum output shape: one model response, one exchange, or no
   runtime yet?
5. What provenance must be visible in the runtime UI and response payload?
6. What tests would prove no cross-owner, public/shareable, transcript, retry,
   or background behavior exists?
7. What hosted rehearsal would prove the first runtime slice if implemented?

## Hard Boundaries

Do not open or claim:

- cross-owner encounters;
- autonomous/background encounters;
- scheduled encounters;
- multi-turn loops;
- automatic retries;
- durable encounter transcripts, generated documents, posts, comments, threads,
  archive entries, or public/shareable output;
- anonymous encounters or public visitor controls;
- private Memory, Archive, Canon, Continuity, Integrity, source text, provider
  settings, raw ids, credentials, storage paths, visitor identity, or
  secret-shaped material in public readback;
- billing/Stripe expansion, Redis, Cloudflare, queues, workers, migrations,
  schema, storage, public routes, or broad UI redesign unless ARGUS names them
  as the smallest required unblock.

## Expected Output

ARGUS should produce a result doc that includes:

- verdict;
- accepted first DAEDALUS runtime lane if safe;
- concrete blocker and next smallest unblock if blocked;
- explicit product shape and non-goals;
- files/routes/tests DAEDALUS must touch if accepted;
- hosted rehearsal requirement if implementation proceeds.

## Validation For This Preflight

This is a docs-only handoff. MIMIR validation for opening it is:

```bash
git diff --check
git diff --cached --check
```

## Wakeup Template

If accepted, ARGUS should wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR473 Owner-Initiated Encounter Runtime preflight.
Task:
- Implement the smallest accepted owner-only runtime slice.
```

If blocked or decision-dependent, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR473 Owner-Initiated Encounter Runtime preflight.
Blocker:
- ...
Task:
- Choose the smallest next unblock lane or make the named product decision.
```
