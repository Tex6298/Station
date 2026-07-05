# PR486 - Document Migrator Product Depth Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hostile preflight

## Why This Lane

PR485E is closed and ARIADNE found no product defect that justifies another
companion-chat repair lane.

The next feature-expansion choice should move to a distinct documented
customer-facing capability. The current launch-core and future-lane docs still
name this open product gap:

```text
mature onboarding wizards, richer Document Migrator/API Bridge product depth
```

API Bridge already received a bounded setup/readback slice through PR482A. The
Document Migrator path has route-aware first actions from PR403/PR404, but it
still reads more like an entry label plus Archive handoff than a coherent
owner-facing migration product.

ARGUS should decide the smallest safe Document Migrator product-depth slice, or
name the concrete blocker and smallest unblock.

## Accepted Baseline

Do not reopen these as missing:

- `/studio/onboarding` is signed-in and routeable.
- Fresh Start, Awakening, Document Migrator, and API Bridge are alpha-routeable.
- PR403/PR404 accepted state-aware first actions for Document Migrator and API
  Bridge using existing owner state and route-only controls.
- Persona Archive/files, Global Archive intake, import jobs, import review
  candidates, Memory inbox, and export readback already exist at protected-alpha
  levels.
- Live OAuth/API connectors are separate and PR484J-N remains config-blocked
  for hosted setup proof.

## Candidate Slices

ARGUS should choose one small next slice or reject/defer.

### 1. PR486A - Migrator Intake Plan Readback

Make Document Migrator feel like an owner-facing plan before import.

Allowed shape:

- owner-only readback on `/studio/onboarding`,
  `/studio/new?path=document-migrator`, or the persona Archive/files page using
  existing owner state;
- source categories that are honest about what is live now: pasted text,
  uploaded files, archived chats/import jobs, and import-review candidates;
- explicit privacy/readiness copy before the owner adds material;
- next actions that route only to existing owner surfaces;
- no new import parser, no live connector, and no automatic import.

### 2. PR486A - Persona Archive Handoff Polish

Make the handoff from Document Migrator into a persona Archive/files page more
legible.

Allowed shape:

- clearer owner-visible Archive/files section copy for source status,
  processing/failure, completed imports, review candidates, and Memory inbox
  follow-through;
- use existing import/file/candidate data only;
- no parser, source ingestion, connector, or candidate-generation change.

### 3. PR486A - Migrator Source Checklist

Add a compact source-readiness checklist that tells the owner what they can do
now and what is intentionally deferred.

Allowed shape:

- static or existing-state-derived checklist;
- links to current pasted/uploaded source flow, Import Review, Memory inbox,
  and private archive search;
- live Reddit/Discord/OAuth/recurring sync clearly marked deferred;
- no new disabled/unwired buttons.

### 4. Block Or Defer

If a useful Document Migrator depth slice truly requires new schema, new import
job state, new parser behavior, live connector config, background workers, or
hosted connector proof, return the exact blocker and the smallest unblock lane.

## Questions For ARGUS

- Which current route should own the first safe product-depth slice:
  `/studio/onboarding`, `/studio/new?path=document-migrator`,
  `/studio/personas/[personaId]/files`, `/studio/archive`, or a combination?
- Can PR486A stay web/helper/test-only, or is a backend/API change truly the
  smallest useful unblock?
- Which existing owner-state fields may be shown without leaking raw ids,
  source bodies, private filenames, storage paths, or parser internals?
- How should PR486A relate to PR484J-N without pretending hosted live
  connectors are configured?
- What exact files should DAEDALUS touch?
- What no-drift tests and visual rehearsal should be required?

## Guardrails

Do not open:

- live Reddit, Discord, OAuth, API, recurring import, external pull, or partner
  connector behavior;
- PR484J-N hosted connector setup proof unless the exact external config blocker
  is named separately;
- new parser behavior, document conversion, PDF/binary extraction, AI
  summarization, provider/model calls, Gemini/OpenAI/NVIDIA work, prompt or
  retrieval changes;
- Redis/Upstash/Valkey memory truth, Cloudflare retrieval/index mirror, queues,
  workers, durable jobs, realtime, billing, Stripe, auth/session, deployment, or
  migration behavior unless ARGUS names it as the smallest unblock;
- broad onboarding redesign, broad Archive redesign, public writing changes,
  public chat behavior, or global shell/theme work;
- placeholder or unwired controls.

Do not expose:

- private source bodies;
- raw owner, persona, source, file, import-job, candidate, thread, or document
  ids;
- storage paths;
- private filenames when not already safely rendered;
- parser internals;
- SQL/table details;
- stack traces;
- provider payloads;
- tokens, cookies, keys, or secret-shaped values.

## Expected ARGUS Output

Return exactly one of:

```text
ACCEPT_PR486A_MIGRATOR_INTAKE_PLAN_READBACK
ACCEPT_PR486A_PERSONA_ARCHIVE_HANDOFF_POLISH
ACCEPT_PR486A_MIGRATOR_SOURCE_CHECKLIST
BLOCKED_UNBLOCK_FIRST
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the exact implementation boundary, touched
files, validation commands, and ARIADNE rehearsal requirement.

If blocked or ambiguous, wake MIMIR with the concrete blocker or decision point.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR485E after ARIADNE passed the hosted Companion Chat Surface Polish rehearsal.
- MIMIR opened PR486 as the next distinct customer-facing lane: Document Migrator product depth, not another companion-chat extension.
Task:
- Hostile-preflight the smallest safe PR486A Document Migrator product-depth slice.
- Choose intake-plan readback, persona Archive handoff polish, source checklist, a concrete unblocker, defer, or a MIMIR decision.
- If accepted, wake DAEDALUS with exact implementation boundary, tests, guardrails, and ARIADNE rehearsal requirement.
Guardrails:
- Do not open live connectors, OAuth/API pulls, recurring imports, new parsers, provider/model calls, prompt/retrieval changes, Redis/Cloudflare, queues/workers, billing, auth/session, deployment, migrations, broad onboarding/archive redesign, public behavior changes, or placeholder controls unless naming the smallest explicit unblocker.
```
