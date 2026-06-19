# PR62 - Continuity Trust And Runtime Readback

Date: 2026-06-19
Status: accepted by ARGUS; ready for ARIADNE signed owner UI rehearsal
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

## DAEDALUS Implementation Result

Implemented as an owner-only web/readback slice using existing APIs. No API
route behavior, schema, publication workflow, Integrity engine, memory/canon
candidate workflow, provider, Redis, Cloudflare, Project, hosted runtime,
worker, billing, or DexOS behavior changed.

### Runtime Preview Sharing

- Added `apps/web/components/studio/runtime-context-preview.tsx` as the shared
  owner runtime context preview component.
- The persona home now uses the shared component and preserves the existing
  compiled-prompt/source-content behavior.
- The Continuity page uses the same component with `showCompiledPrompt={false}`
  and `showSourceContent={false}`, so it shows bucket/count/source selection
  without raw system prompt expansion or source body display.
- The shared runtime preview now includes Continuity as its own bucket beside
  Canon, Integrity, Memory, and Archive when returned by the API.
- Copy explains that continuity records are source context for recall and
  ordering, not system instructions.

### Continuity Page

- `/studio/personas/:personaId/continuity` now has a compact Continuity Trust
  overview using the existing persona continuity summary:
  - continuity records;
  - candidates;
  - integrity sessions;
  - memory;
  - canon;
  - archive sources.
- Timeline record creation still uses the existing owner-only
  `POST /continuity/persona/:personaId/records` route.
- After creation, the timeline is updated locally and the page refreshes the
  existing `GET /personas/:id` summary so overview counts can update.
- Empty copy now tells the owner to add a private marker or link a source when
  there is something worth preserving.

### Timeline Provenance Labels

- `apps/web/lib/continuity-ui.ts` now provides bounded labels for:
  - record type;
  - visibility;
  - source table and source label;
  - source version;
  - record version;
  - created date;
  - occurred date when present.
- Source labels are defensively redacted for UUID-shaped IDs, URLs,
  secret-shaped values, and token/cookie/authorization/API-key/password/secret
  assignments.

### Focused Tests

- `apps/web/lib/continuity-ui.test.ts` now covers provenance labels,
  sanitization, runtime continuity counts, and continuity source grouping.

## Validation Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed, including new continuity provenance/runtime helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed; runtime context continuity bucket behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 36 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

## Scope Confirmation

- No public continuity page.
- No publication workflow, Integrity engine, memory/canon candidate workflow,
  API route behavior, schema, raw prompt display on the Continuity page, raw
  transcript display, raw trace/event payload display, Redis, Cloudflare,
  provider migration, Project work, hosted runtime, worker, billing/quota, or
  DexOS work.

## ARGUS Review

ARGUS accepts PR62 after three focused patches.

Review notes:

- Runtime context preview is now shared, and persona home preserves the existing
  owner compiled-prompt/source-content behavior.
- The Continuity page uses the shared preview with compiled prompt and source
  content hidden.
- ARGUS patched the Continuity-page no-source-content path so runtime source
  titles/reasons are sanitized before display.
- ARGUS patched continuity provenance label redaction for underscore-style
  secret values such as `sk_live_*`, bearer values, `x-api-key`, and the same
  token/API-key/cookie/password/secret assignment format used in PR60/PR61.
- ARGUS fixed the shared redaction replacement bug that rendered literal
  `$1=[redacted]` in AI observability, persona lifecycle, and continuity helper
  output.
- ARGUS fixed a new web-build lint error in the Continuity Trust heading.
- No API route behavior, schema, public continuity page, publication workflow,
  Integrity engine, memory/canon candidate workflow, provider migration, Redis,
  Cloudflare, Project work, hosted runtime, worker, billing/quota, broad
  redesign, or DexOS work changed.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed, including strengthened continuity provenance/runtime helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed; runtime context owner behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 36 tests passed, covering the PR60/PR61 redaction helpers after the shared replacement fix. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, and generated 31 static pages, then hit the known standalone symlink `EPERM`. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Verdict: PR62 is accepted for signed owner UI rehearsal. Wake ARIADNE to check
Continuity page trust overview, runtime continuity bucket readability, timeline
provenance labels/redaction, record creation/refresh, desktop and `390px` fit,
and absence of raw prompts, source bodies, transcripts, trace payloads, raw IDs,
URLs, bearer values, token assignments, or secret-shaped values in the new
Continuity readback. Wake MIMIR with the review verdict.
