# PR471 - Persona-to-Persona Encounters Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - boundary preflight

## Why This Lane

PR470A closed the first Voice / Avatar slice. Per Marty's feature-expansion
rule, the next choice should move to another named Phase 3 customer-facing
feature rather than deepen the closest existing surface.

MIMIR selects Persona-to-Persona Encounters as the next named Phase 3 feature
to preflight. PR215 already marked this family high risk because it can imply
autonomous persona behavior, model-call loops, durable transcripts, moderation
obligations, and unclear provenance. ARGUS should decide whether a smallest
honest slice exists now, or name the concrete blocker and smallest unblock lane.

## Preflight Question

Can Station safely open a first Persona-to-Persona Encounters product slice
without pretending that autonomous agents, background conversations, provider
call loops, durable cross-persona transcripts, or moderation/provenance
contracts exist?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the smallest implementation shape. If blocked
or decision-dependent, wake MIMIR with the concrete blocker and the smallest
numbered unblock lane that directly enables Persona-to-Persona Encounters.

## Starting Interpretation

Do not assume the first slice is autonomous persona chat.

Possible first safe shapes for ARGUS to evaluate:

- owner-only encounter readiness/readback showing why live persona-to-persona
  encounters are not enabled yet;
- owner-only encounter draft/setup surface that records no generated content and
  makes no provider calls;
- consent/provenance/cost policy gate for future encounters;
- encounter eligibility readback using existing public/private persona metadata
  only, with no model output;
- a public-facing absence state that makes no claim of active persona-to-persona
  behavior.

ARGUS may accept, narrow, reject, or replace these shapes.

## Repo Evidence To Inspect

- Persona records, public persona boundaries, and public chat:
  `apps/api/src/routes/personas.ts`,
  `apps/api/src/lib/persona-serialization.ts`,
  `apps/web/app/personas/[publicSlug]/page.tsx`,
  `apps/web/components/studio/persona-workspace.tsx`,
  `packages/types/src/persona.ts`.
- Private chat, provider/BYOK, and usage/rate/cost guardrails:
  `apps/api/src/routes/chat.ts`,
  `apps/api/src/routes/settings.ts`,
  `apps/api/src/routes/token-credits.ts`,
  `packages/ai`,
  `packages/config`,
  `packages/auth/src/permissions.ts`.
- Memory/continuity/provenance surfaces that encounters must not leak:
  `apps/api/src/routes/memory.ts`,
  `apps/api/src/routes/continuity.ts`,
  `apps/api/src/routes/archive.ts`,
  `apps/web/app/studio/personas/[personaId]`.
- Community/reporting/moderation routes if any public or shareable encounter
  surface is proposed:
  `apps/api/src/routes/reports.ts`,
  `apps/api/src/routes/forums.ts`,
  `apps/api/src/routes/threads.ts`,
  `apps/api/src/routes/comments.ts`.
- Prior comparison:
  `docs/roadmap/PR215_PUBLIC_INTERACTION_EXPANSION_GATE_DAEDALUS.md`.

## Questions ARGUS Must Answer

1. What is the smallest honest Persona-to-Persona slice: readiness gate,
   owner-only draft, eligibility readback, consent/provenance gate, dry-run,
   actual model call, or something else?
2. Does the slice require new schema, storage, transcript policy, queueing, or
   provider-call infrastructure?
3. What consent boundary is required for each persona owner, especially if the
   two personas belong to different users?
4. What provenance must be visible so users know whether content is owner
   authored, model generated, simulated, public, private, or archived?
5. What prevents runaway calls, background loops, repeated billing, or accidental
   autonomous behavior?
6. What moderation/reporting path is needed before any encounter becomes public
   or shareable?
7. What owner-only/private Memory, Archive, Canon, Continuity, Integrity, chat,
   provider settings, or source text must be excluded from any readback?
8. What tests and hosted rehearsal would prove the accepted first slice?

## Hard Boundaries

Do not open or claim:

- autonomous persona-to-persona chat, background conversations, scheduled
  encounters, agent loops, or multi-turn model calls;
- provider calls, transcript generation, durable encounter storage, queue/worker
  execution, Redis/Cloudflare orchestration, or billing/token-credit deductions
  unless ARGUS explicitly accepts that as the first slice;
- cross-owner encounters without explicit consent and visibility policy;
- public encounter pages, public encounter feeds, anonymous participation, or
  shareable encounter output without moderation/provenance policy;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, private
  document text, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- Stripe, billing expansion, migrations, schema, Redis, Cloudflare, queues,
  workers, or broad UI redesign unless ARGUS names them as the smallest unblock
  lane.

## Expected Output

ARGUS should produce a result doc that includes:

- verdict;
- accepted first DAEDALUS lane if safe;
- concrete blocker and smallest unblock lane if blocked;
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
- ARGUS accepted PR471 Persona-to-Persona Encounters preflight.
Task:
- Implement the smallest accepted Persona-to-Persona Encounters slice.
```

If blocked or decision-dependent, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR471 Persona-to-Persona Encounters preflight.
Blocker:
- ...
Task:
- Choose the smallest numbered unblock lane or make the named product decision.
```
