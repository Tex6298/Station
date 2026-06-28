# PR448 - Studio Dashboard Memory Orientation And Status Readback

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## ARGUS Review

ARGUS accepted the implementation on 2026-06-28:

`docs/roadmap/PR448_STUDIO_DASHBOARD_MEMORY_ORIENTATION_REVIEW_RESULT.md`

No review patch was needed. MIMIR owns closeout and next-lane selection.

## Source

PR447 hosted continuation sweep passed and recommended this lane:

`docs/roadmap/PR447_HOSTED_PRODUCT_OPERATION_CONTINUATION_RESULT.md`

The top-level Studio dashboard made Continuity, Archive, and Integrity visible,
but Memory was not visible as its own dashboard stop before entering a persona
workspace.

## Goal

Make Memory a first-class top-level Studio dashboard stop with useful status
readback and a clear route into the persona Memory workspace.

The dashboard should read as private continuity infrastructure, not generic
usage analytics.

## Scope

Implement the narrowest product improvement that satisfies the goal:

- add a clear Memory entry point, section, or status row on `/studio`;
- keep Memory visually and semantically distinct from Archive, Continuity,
  Canon, and Integrity;
- use existing owner/persona/memory data where reasonable;
- show status readback such as active memory count, quarantined/excluded count,
  latest memory state, or persona memory availability if the data already
  exists safely;
- route the owner to the relevant persona Memory view;
- preserve the existing Studio dashboard layout and information hierarchy.

If real status readback requires backend support, keep it owner-scoped and
minimal. Do not expose private memory bodies in a top-level dashboard summary
unless they are already safely shown to the same owner in the persona Memory
workspace.

## Out Of Scope

- new Memory semantics;
- memory lifecycle policy changes;
- archive import or publishing mutations;
- provider/BYOK/config changes;
- billing changes;
- Developer Space ingestion/key changes;
- broad dashboard redesign;
- public visibility changes;
- private data exposure beyond current owner-only Studio surfaces.

## Acceptance Gates

- `/studio` shows Memory as a distinct dashboard stop for a signed-in owner
  with a replay persona.
- The Memory stop gives useful status/readback, not only a generic button.
- The Memory stop routes to the persona Memory workspace.
- Empty/no-persona states remain coherent.
- The dashboard still keeps Continuity, Archive, Integrity, and Personas
  legible.
- No private memory content leaks into public routes or unauthenticated states.

## Validation

Run focused tests that match the implementation. Likely candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

Use the API typecheck only if backend code changes.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added Studio dashboard Memory orientation/status readback for PR448.
- Memory is visible as its own owner-only dashboard stop and routes into persona Memory.
Risk:
- Top-level Memory readback must stay owner-only and distinct from Archive/Continuity/Canon/Integrity.
Task:
- Review owner scoping, UI semantics, empty states, and focused tests.
```
