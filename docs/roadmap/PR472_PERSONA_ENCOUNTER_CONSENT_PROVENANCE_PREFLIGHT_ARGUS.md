# PR472 - Persona Encounter Consent / Provenance Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - unblock preflight

## Why This Lane

PR471A closed the owner-only Persona Encounter readiness gate. That is a valid
first slice, but it does not make actual persona-to-persona encounters safe.

Concrete blocker:

- Station does not yet have an accepted consent, provenance, stop/revocation,
  cost/rate-limit, and moderation/reporting contract for encounters.

This lane is the smallest unblock preflight for the same named Phase 3 feature.
It should not become an open-ended hardening sweep or a runtime implementation.

## Preflight Question

What is the smallest product/technical contract that would allow a future
Persona-to-Persona Encounter runtime slice to be honest, bounded, and reviewable?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the smallest implementation shape. If blocked
or decision-dependent, wake MIMIR with the concrete blocker and smallest next
unblock lane.

## Starting Interpretation

Do not implement encounter runtime here unless ARGUS explicitly proves the
contract can be created safely in one narrow code slice.

Likely acceptable first unblock shapes:

- owner-only encounter consent/provenance policy readback;
- same-owner encounter eligibility contract with no provider call and no
  generated output;
- stop/revocation and cost/rate-limit copy contract for future runtime;
- public/shareable encounter absence policy that makes no availability claim;
- a typed helper/test contract that future runtime must satisfy before any
  provider call.

ARGUS may accept, narrow, reject, or replace these shapes.

## Repo Evidence To Inspect

- PR471 and PR471A docs:
  `docs/roadmap/PR471_PERSONA_TO_PERSONA_ENCOUNTERS_PREFLIGHT_RESULT.md`,
  `docs/roadmap/PR471A_OWNER_ENCOUNTER_READINESS_GATE_RESULT.md`,
  `docs/roadmap/PR471A_OWNER_ENCOUNTER_READINESS_GATE_REVIEW_RESULT.md`,
  `docs/roadmap/PR471A_OWNER_ENCOUNTER_READINESS_GATE_CLOSEOUT.md`.
- Persona and public persona boundaries:
  `apps/api/src/routes/personas.ts`,
  `apps/api/src/lib/persona-serialization.ts`,
  `packages/types/src/persona.ts`,
  `apps/web/app/personas/[publicSlug]/page.tsx`,
  `apps/web/components/studio/persona-workspace.tsx`.
- Provider, chat, cost, and permission guardrails:
  `apps/api/src/routes/chat.ts`,
  `apps/api/src/routes/settings.ts`,
  `apps/api/src/routes/token-credits.ts`,
  `packages/ai`,
  `packages/auth/src/permissions.ts`,
  `packages/config`.
- Provenance and private-source surfaces:
  `apps/api/src/routes/memory.ts`,
  `apps/api/src/routes/archive.ts`,
  `apps/api/src/routes/continuity.ts`,
  `apps/web/app/studio/personas/[personaId]`.
- Moderation/reporting if any output can become public/shareable:
  `apps/api/src/routes/reports.ts`,
  `apps/api/src/routes/forums.ts`,
  `apps/api/src/routes/threads.ts`,
  `apps/api/src/routes/comments.ts`.

## Questions ARGUS Must Answer

1. Can the unblock be web-only readback/helper tests, or does it require schema?
2. Is same-owner encounter consent enough for the next runtime slice, or does
   the product need bilateral consent machinery before any implementation?
3. What provenance labels are mandatory before future generated encounter text
   exists?
4. What stop/revoke controls are mandatory before a provider call can happen?
5. What cost/rate-limit/plan controls are mandatory before a provider call can
   happen?
6. What moderation/reporting contract is mandatory before any encounter output
   is public or shareable?
7. What private Memory, Archive, Canon, Continuity, Integrity, source text,
   transcripts, provider settings, raw ids, storage paths, or credentials must
   be excluded from any contract/readback?
8. What tests and hosted rehearsal would prove the accepted unblock?

## Hard Boundaries

Do not open or claim:

- autonomous persona-to-persona chat, background conversations, scheduled
  encounters, agent loops, provider-call loops, generated encounter text,
  durable transcripts, generated posts/documents/comments/threads, or public
  encounter pages;
- provider calls, queue/worker execution, Redis/Cloudflare orchestration,
  billing/token-credit deductions, migrations, schema, or storage unless ARGUS
  explicitly accepts them as the smallest unblock;
- cross-owner encounters without explicit consent and visibility policy;
- public/shareable encounter output without moderation/reporting and provenance
  policy;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, private
  document text, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- broad Studio/public UI redesign.

## Expected Output

ARGUS should produce a result doc that includes:

- verdict;
- accepted first DAEDALUS unblock lane if safe;
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
- ARGUS accepted PR472 Persona Encounter consent/provenance unblock preflight.
Task:
- Implement the smallest accepted unblock slice.
```

If blocked or decision-dependent, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR472 Persona Encounter consent/provenance preflight.
Blocker:
- ...
Task:
- Choose the smallest next unblock lane or make the named product decision.
```
