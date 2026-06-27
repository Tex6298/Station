# UX-03 Continuity And Integrity Review Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: COMPLETE - WAKE MIMIR
Date: 2026-06-27

## Verdict

UX-03 feasibility is complete. There is no hard blocker and no implementation
was needed in this pass.

Current main already contains the core Continuity/Integrity/Memory readback
work from prior lanes:

- Continuity is a first-class persona stop.
- Continuity has a trust overview, runtime context preview, runtime provenance
  readback, timeline markers, source/provenance labels, and the PR332
  `Review clarity` panel.
- Integrity Sessions have owner-friendly labels, review-state summaries, and
  accept/edit/dismiss destination copy.
- Memory has runtime explanation, lifecycle review, source-readiness holdout
  readback, supersession controls, and observability handoff cards.
- Archive and export trust are current from UX-02C.
- Publication from continuity exists as an explicit copy-to-document flow.

Recommended next lane:

```text
UX-03A - Continuity review target route links
```

This should be a small owner-only UI/helper slice on the Continuity route. The
goal is to turn existing text-only review targets such as `Review in Memory`,
`Review in Canon`, `Review Integrity Session`, and `Review in Archive` into
bounded links to existing owner routes. That directly reduces the remaining
mental stitching without touching write semantics or source serialization.

## Current Inventory

Primary routes:

- `/studio/personas/[personaId]/continuity`
  - `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
  - `apps/web/components/studio/continuity-timeline.tsx`
  - `apps/web/components/studio/runtime-context-preview.tsx`
  - `apps/web/lib/continuity-ui.ts`
- `/studio/personas/[personaId]/calibration`
  - `apps/web/app/studio/personas/[personaId]/calibration/page.tsx`
  - `apps/web/lib/integrity-ui.ts`
- `/studio/personas/[personaId]/memory`
  - `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
  - `apps/web/lib/memory-lifecycle-ui.ts`
- `/studio/personas/[personaId]/canon`
  - `apps/web/app/studio/personas/[personaId]/canon/page.tsx`
- `/studio/personas/[personaId]/files`
  - per-persona Archive source intake, import review, and export status
- `/studio/personas/[personaId]`
  - persona home runtime context preview, public interaction readback, and
    export status

Backend/API surfaces named as gates only:

- `/continuity/persona/:personaId/records`
- `/continuity/records/:recordId`
- `/integrity/start`
- `/integrity/answer`
- `/integrity/confirm-summary`
- `/integrity/end-early`
- `/integrity/outputs/:sessionId`
- `/integrity/outputs/:outputId`
- `/integrity/history/:personaId`
- `/memory/persona/:personaId`
- `/memory/persona/:personaId/briefing`
- `/memory/:id/lifecycle`
- `/canon/persona/:personaId`
- `/conversations/persona/:personaId/context-preview`
- `/documents/publish-from-continuity`
- `/persona-files/*`

## Current Evidence

Still current:

- PR62: Continuity trust/runtime readback. The current Continuity page still
  uses hidden compiled-prompt/source-content runtime preview, Continuity Trust
  counts, timeline provenance labels, and runtime context buckets that include
  Continuity.
- PR63: Integrity review trust readback. The current calibration page still
  shows Integrity Overview, friendly session/status/output/destination labels,
  and accept/edit/dismiss copy before writing.
- PR110: Memory runtime explanation. The Memory page still explains selected
  versus held-out memory, lifecycle states, fallback notes, and sanitized
  runtime readback.
- PR192 through PR194: Continuity is now its own stop and the Continuity route
  readability defects were patched and accepted.
- PR262: Runtime provenance stitching readback is current on the Continuity
  route; `buildRuntimeProvenanceReadback` groups Canon, Integrity, Continuity,
  Memory, and Archive with sanitized reasons and review-target labels.
- PR332/PR333: The Continuity `Review clarity` panel exists in current code and
  has hosted desktop/mobile recheck evidence.

Stale or superseded:

- Any older note that says Continuity is only a runtime-context count is stale.
- PR192's combined Developer Space observability pressure is no longer the
  active UX-03 concern; Developer Spaces have their own later UX lane.
- PR62/PR63/PR110 validation counts and older warning notes are historical, not
  current validation truth.
- PR332's note that ARIADNE hosted review was optional is superseded by PR333,
  which recorded a hosted pass.
- PR195's header still says `Status: open`, but the file contains a completed
  ARGUS evidence refresh result.

## What Owners Can Learn Today

- Continuity route:
  - what feeds continuity: records, candidates, Integrity Sessions, Memory,
    Canon, Archive sources;
  - what runtime context selected across Canon, Integrity, Continuity, Memory,
    and Archive;
  - latest durable continuity changes, why they were recorded, support/source
    labels, record version, and review target;
  - how to create a marker and link a document or conversation source.
- Integrity route:
  - session history and current session status;
  - pending/accepted/edited/rejected output counts;
  - what accept/edit/dismiss writes or preserves;
  - destination after write.
- Memory route:
  - runtime-selected versus eligible/held-out memory;
  - lifecycle states and restore/quarantine/reject controls;
  - supersession;
  - owner-wide memory;
  - handoff cards to Continuity, Archive, and Settings.
- Canon route:
  - current canon items and manual canon creation;
  - priority;
  - publish-copy control.
- Publication touchpoint:
  - `PublishContinuityButton` creates a separate Station document copy from
    canon, Integrity, archive file, or archive import sources with explicit
    visibility selection.

## Fragile Boundaries

- The remaining UX gap is cross-surface stitching, not missing Continuity data.
  Continuity rows say where to review next, but those targets are still mostly
  text labels.
- `RuntimeContextPreview` intentionally differs by route. Persona home can show
  compiled prompt/source content to the owner; Continuity route hides both.
  Any future slice must preserve that distinction.
- Publication remains a separate copy operation. Continuity review UI must not
  imply that private Memory, Canon, Integrity, or Archive originals become
  public.
- Canon is comparatively thin: it has manual creation, priority, list display,
  and publish copy, but less provenance/readback scaffolding than Memory,
  Continuity, or Integrity.
- Integrity output rows explain write destinations, but the Continuity route
  does not link an owner directly toward the Integrity review surface.
- Memory/Archive/Continuity helpers have strong redaction tests; any new
  review-target routing helper should reuse sanitized labels and avoid raw
  source bodies, prompts, provider payloads, storage paths, and raw IDs.
- The current evidence base includes hosted/local visual reviews, but this
  feasibility pass did not run a fresh browser rehearsal.

## Cheap First Slice

Recommended slice:

```text
UX-03A - Continuity review target route links
```

Suggested scope:

- Add a small helper that maps a continuity/runtime provenance review target to
  an existing owner route:
  - Memory -> `/studio/personas/:personaId/memory`
  - Canon -> `/studio/personas/:personaId/canon`
  - Integrity -> `/studio/personas/:personaId/calibration`
  - Archive -> `/studio/personas/:personaId/files`
  - Continuity -> `/studio/personas/:personaId/continuity`
  - Publication/document review -> the safest existing Studio publishing or
    document route already used by current code.
- Render those links only inside owner-only Studio Continuity readback surfaces
  where the route currently shows review-target text.
- Keep links route-level unless current code already has a safe exact item
  route. Do not invent deep links that expose source IDs.
- Add helper tests for target mapping, no raw ID visible labels, and unchanged
  redaction behavior.
- Keep desktop, 375px, and 390px layout readable without horizontal overflow.

This slice should not change continuity records, Integrity outputs,
Memory/Canon writes, Archive candidates, runtime selection, publication
visibility, auth/session behavior, or backend APIs.

## Deferred Work

Defer:

- exact source/item deep links;
- source preview drawers;
- graph/canvas provenance exploration;
- Canon route redesign;
- Integrity engine, prompt, question bank, extraction, and idempotency changes;
- Memory/Canon write or lifecycle behavior changes;
- archive import candidate mutation;
- runtime retrieval/ranking/redaction changes;
- publication/public document workflow changes;
- schema, migrations, workers, queues, Redis, Cloudflare, Railway, Supabase
  config, or provider/model work.

## ARGUS Gates For UX-03A

Minimum gates if the slice is UI/helper only:

- `git diff --check`
- added-line sensitive-pattern scan
- `npm exec --yes pnpm@10.32.1 -- run test:continuity`
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`
- `npm exec --yes pnpm@10.32.1 -- run test:integrity`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`

Add `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` if the
slice changes publication/document target mapping or copy.

If a web build is run, classify the known local Windows standalone symlink
`EPERM` caveat separately from compile/type/page-generation success.

## ARIADNE Review Points

Review after ARGUS accepts any UX-03A implementation:

- desktop `/studio/personas/[personaId]/continuity`;
- 375px `/studio/personas/[personaId]/continuity`;
- 390px `/studio/personas/[personaId]/continuity`;
- route-level handoff from Continuity to Memory, Canon, Integrity, Archive, and
  publication/document surfaces if links are added;
- whether review-target links reduce mental stitching without looking like
  proof, correctness, or public publication.

Visible questions:

- Can the owner tell what changed, why it was recorded, and where to review it
  next?
- Do the links stay inside owner-only Studio surfaces?
- Does the page still distinguish Memory, Canon, Archive, Integrity output,
  runtime context, and Continuity records?
- Does mobile avoid crowded chips, clipped links, and horizontal overflow?
- Does copy avoid magical certainty and avoid implying autonomous Memory/Canon
  mutation?

## Next Owner

MIMIR should decide whether to open:

```text
UX-03A - Continuity review target route links
```

Recommended owner flow:

1. MIMIR opens UX-03A to DAEDALUS if the route-link slice is accepted.
2. DAEDALUS implements only route-level review-target links and focused tests.
3. ARGUS reviews owner-only routing, redaction, publication boundaries, and
   validation.
4. ARIADNE rehearses desktop and 375px/390px Continuity review readability.

No hard blocker or config dependency was found.

## Validation

Docs-only validation:

```bash
git diff --check
```

Result: pass with CRLF normalization notices only.

Added-line sensitive-pattern scan: pass, no matches in the docs-only patch.

No UI, API, schema, auth, runtime, Integrity engine, Memory/Canon write,
archive candidate, publication visibility, worker, queue, Redis, Cloudflare,
Railway, provider/model, or Supabase config behavior changed in this
feasibility pass.
