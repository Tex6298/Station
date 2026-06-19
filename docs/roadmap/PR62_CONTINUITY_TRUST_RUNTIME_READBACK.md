# PR62 - Continuity Trust And Runtime Readback

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides the next lane.

## Purpose

Continue the Memory UX / observability lane after PR60 and PR61 by making
Continuity feel like its own owner-facing stop.

The earlier human rehearsal called out that continuity should not only appear
as runtime-context counts. The API already knows about continuity records and
the runtime context assembler already returns continuity counts, selected source
trace entries, and topology data. PR62 should turn that into a useful,
private, non-magical Studio readback.

## Existing Foundations

Start from the current owner-only surfaces and helpers:

- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/continuity-timeline.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/api/src/routes/continuity.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `packages/types/src/continuity.ts`

Relevant existing APIs:

- `GET /personas/:id`
- `GET /continuity/persona/:personaId/records`
- `POST /continuity/persona/:personaId/records`
- `GET /conversations/persona/:personaId/context-preview`

Implementation clue: `persona-context.test.ts` already asserts that context
preview can include a `continuity` bucket in `counts`, `trace.selectedSources`,
`trace.searched`, and `topology.buckets`. The current persona home runtime
preview only presents canon, integrity, memory, and archive as visible source
sections.

## Scope

Implement a bounded owner-only continuity readback slice:

- Improve `/studio/personas/:personaId/continuity` so it reads as a dedicated
  continuity trust page, not just a marker form plus timeline.
- Show a compact continuity overview using already available data:
  - continuity records;
  - continuity candidates;
  - integrity sessions;
  - memory/canon/archive counts from the persona continuity summary.
- Make runtime context continuity visible as its own bucket wherever the owner
  runtime preview is rendered or refactored:
  - counts must include `continuity` when returned by the API;
  - source grouping should include continuity separately from memory/archive;
  - copy should explain that continuity records are source context, not system
    instructions.
- Add a bounded, sanitized source/provenance readback for timeline records:
  - record type;
  - visibility;
  - source label/table in friendly form;
  - source version and record version where useful;
  - occurred/created date.
- Improve empty/loading/error copy for the Continuity page so a user can
  understand what to do next.
- Keep timeline marker creation using the existing owner-only
  `POST /continuity/persona/:personaId/records` route.
- After creating a record, preserve or refresh the visible timeline and summary
  state; if only the timeline can update cheaply, say that clearly in the UI.
- Add focused helper tests for any new continuity labels, source summaries, or
  runtime-preview section helpers.
- Keep desktop and `390px` mobile fit in mind.

## Non-Scope

- No public continuity page.
- No publication workflow changes.
- No Integrity Session engine changes.
- No memory/canon candidate review workflow.
- No new API route behavior unless a tiny response-shape type gap is unavoidable.
- No schema or migration work.
- No raw system prompt expansion on the Continuity page.
- No raw private transcript display.
- No raw runtime trace payload dump.
- No raw lifecycle/event JSON display.
- No Redis, Cloudflare, provider migration, Project work, hosted runtime,
  worker, billing/quota, DexOS, or broad redesign.

## Acceptance

ARGUS can accept PR62 if:

- The Continuity page remains owner-only and uses existing owner-scoped APIs.
- Continuity is visibly separated from memory/archive/integrity in runtime
  readback when the API returns continuity data.
- Timeline records show provenance and visibility in friendly bounded labels
  without raw IDs, raw payload JSON, raw transcript text, URLs, bearer values,
  token/API-key/cookie/password/secret assignments, or secret-shaped values.
- Creating a continuity record still uses the existing route and updates the
  visible timeline or clearly explains the refresh boundary.
- No public route, schema, provider, Redis, Cloudflare, Project,
  hosted-runtime, worker, billing, broad redesign, or DexOS scope is added.
- Desktop and narrow mobile layout risk is addressed.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If the shared persona home runtime preview is touched, explicitly mention the
home-page impact in the ARGUS handoff. If a web build is run, record the known
Windows standalone symlink `EPERM` separately from compile/type/page-generation
success.

## Handoff

Wake ARGUS with:

- exact files changed;
- whether the runtime preview was shared/refactored or only continuity-specific;
- continuity bucket/count/source behavior;
- timeline provenance labels added;
- record-create refresh behavior;
- privacy boundary for IDs, URLs, secrets, raw prompt, raw transcript, and raw
  trace/event payloads;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no public continuity, publication workflow, Integrity
  engine, memory/canon candidate workflow, schema, Redis, Cloudflare, provider
  migration, Project, hosted runtime, worker, billing, or DexOS work was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- signed owner `/studio/personas/:personaId/continuity`;
- continuity overview and runtime continuity bucket readability;
- timeline record provenance/visibility labels;
- continuity record creation and visible update behavior;
- 390px layout with no horizontal overflow or offscreen controls;
- no private raw transcript, raw prompt, raw trace payload, raw IDs, URLs, or
  secret-shaped values visible in the new readback.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
