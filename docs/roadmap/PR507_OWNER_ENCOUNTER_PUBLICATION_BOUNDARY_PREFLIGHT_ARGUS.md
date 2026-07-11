# PR507 - Owner Encounter Publication Boundary Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR506D closed the first real Persona-to-Persona Encounter artifact loop:

`docs/roadmap/PR506D_OWNER_ENCOUNTER_PRIVATE_SESSION_BROWSER_RERUN_CLOSEOUT.md`

Current proven state:

- same-owner private encounter previews can generate nonblank responder output;
- the owner can create a saved private same-owner encounter artifact;
- the artifact is server-created, owner-only, private, non-public,
  non-shareable, and not a transcript;
- owner list/detail/delete readback works;
- desktop and `390px` Studio readback/delete controls passed hosted browser
  proof;
- public Space/persona routes do not expose saved private encounter material.

The next product question is whether Station can safely open a customer-facing
encounter lane without leaking private context or pretending private artifacts
are publication-ready.

## Preflight Question

What is the smallest safe next lane after private same-owner encounter
artifacts?

Assess these candidate directions:

1. Owner-only encounter curation metadata.
   - Owners can title, summarize, tag, and mark a private saved encounter as a
     candidate for later public presentation.
   - No public route and no public output yet.

2. Owner-curated public encounter exhibit.
   - Owners publish only an explicit owner-authored summary and selected safe
     excerpt/readback, linked to a Space/persona/document surface.
   - Private setup, prompt/context bodies, raw responder output, raw ids, and
     provider payloads remain private.

3. Cross-owner private encounter consent preflight.
   - Do not publish anything yet.
   - Define consent/ownership shape before two different owners' personas can
     participate in a saved private encounter.

4. Defer encounter expansion.
   - If the current private artifact loop is enough for now, name the stronger
     Phase 3/customer-facing lane that should come next instead.

ARGUS should recommend exactly one next lane, or patch the candidate boundary
into a safer shape.

## Evidence To Review

Use:

- `docs/roadmap/PR506_PERSONA_ENCOUNTER_PRIVATE_SESSION_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR506A_OWNER_ENCOUNTER_PRIVATE_SESSION_ARTIFACT_REVIEW_RESULT.md`
- `docs/roadmap/PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR506D_OWNER_ENCOUNTER_PRIVATE_SESSION_BROWSER_RERUN_RESULT.md`
- current `apps/api/src/routes/persona-encounters.ts`
- current `apps/api/src/routes/persona-encounters.test.ts`
- current `apps/web/lib/persona-encounter-runtime.ts`
- current `apps/web/lib/persona-encounter-runtime.test.ts`

## Guardrails

Do not approve any implementation that would:

- publish private setup/prompt/context bodies;
- publish raw generated responder output without explicit owner curation;
- expose raw owner/persona/session ids;
- expose provider payloads, model config, token values, env values, cookies,
  auth state, SQL details, or stack traces;
- make private encounter artifacts public by default;
- add public/shareable routes without explicit owner action and visibility
  boundary tests;
- allow cross-owner saved encounters without consent/ownership design;
- add autonomous/background/scheduled encounters;
- add Archive, Memory, Canon, Continuity, Station Press, social, billing,
  queue/worker, Redis, Cloudflare, storage, or provider-swap drift.

## Deliverable

Create:

```text
docs/roadmap/PR507_OWNER_ENCOUNTER_PUBLICATION_BOUNDARY_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- recommended next numbered lane;
- allowed scope;
- forbidden scope;
- files likely touched if implementation is accepted;
- required validation;
- exact wakeup.

If a safe implementation lane is accepted, wake MIMIR with the result and the
next-lane shape. MIMIR will decide whether to wake DAEDALUS or open a narrower
follow-up preflight.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR506D passed hosted browser proof for owner-only private same-owner encounter artifacts.
- Private saved artifacts are now proven in Studio, including desktop/390px readback/delete, public no-drift while an artifact exists, fail-closed signed-out/cross-owner probes, and cleanup.
- PR506 explicitly did not approve public/shareable, cross-owner, autonomous, scheduled, publication, Archive/Memory/Canon/Continuity, Station Press, social, billing, queue/worker, Redis, Cloudflare, storage, or provider drift.
Task:
- Run PR507 hostile boundary preflight.
- Decide the smallest safe next customer-facing encounter lane, or recommend a different Phase 3 lane if encounter expansion should stop here.
- Wake MIMIR with the exact verdict and next-lane shape.
```

