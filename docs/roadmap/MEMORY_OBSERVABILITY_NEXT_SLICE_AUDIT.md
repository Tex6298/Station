# Memory Observability Next Slice Audit

Date: 2026-06-24

Owner: A2 / DAEDALUS

Status: ready for ARGUS review

## Recommendation

Open one narrow DAEDALUS implementation lane next:

```text
PR262 - Owner Runtime Provenance Stitching Readback
```

This should be an owner-only readback slice that connects the existing runtime
context preview with already-authorized Continuity, Memory, Archive, Canon, and
Integrity provenance labels. The goal is not to add deeper retrieval, graph,
trace, provider, or infrastructure behavior. The goal is to help an owner answer
one trust question in one place:

```text
What shaped this persona response, where did each source come from, and which
owner-controlled surface should I review if the source is wrong?
```

## Direct Answers

| Question | Answer |
| --- | --- |
| Which Memory/observability slices are done enough for protected-alpha? | Runtime Memory explanation, Memory lifecycle review, AI trace sanitization/readback, Settings trace readback, Memory graph relationship readback, explicit supersession edge recording, owner supersession control, Continuity as a first-class persona stop, Continuity readability, Studio place/mobile workbench clarity, Archive trust readback, and Developer Space Tier 1 observatory storytelling are done enough for protected-alpha. |
| Which gaps still weaken Station's core promise? | The remaining gap is cross-surface provenance comprehension. Memory, Continuity, Archive, Canon, Integrity, and runtime context are each legible in their own panels, but an owner still has to mentally stitch them together to understand why a response used a source and where to fix that source. |
| Which gap has the best next implementation shape? | Continuity/Archive/Memory provenance stitching. It has existing owner-only data, existing sanitizers, focused helper-test paths, and high user value without touching retrieval ranking or private/public boundaries. |
| Should the next slice be deeper lifecycle/handoff workflow? | No. PR110, PR143, PR150, PR151, PR192, PR193, and PR194 already made lifecycle, supersession, Continuity stop/readability, and action state sufficient for protected-alpha unless new rehearsal evidence says otherwise. |
| Should the next slice be Memory graph exploration? | No. PR146, PR150, and PR151 made graph readback honest and made explicit supersession edges meaningful. A graph explorer would be premature until graph edges become broader than owner supersession decisions. |
| Should the next slice be richer AI trace readback? | Not now. PR144 and PR145 established the safe trace-detail boundary. Richer trace detail has higher privacy risk and should wait for an ARGUS-authored sanitization spec or a concrete operator/user complaint. |
| Should the next slice be hosted measurement/rehearsal only? | No. PR195 through PR200 already produced hosted/demo/human route evidence. A rehearsal would be useful after a visible PR262 implementation, not before it. |
| Should there be no immediate Memory slice? | No. The cross-surface provenance gap is concrete enough to justify one narrow owner-only implementation. |

## Evidence Inspected

- `docs/roadmap/STATION_FUTURE_LANES.md`, Lane 6 and bridge status.
- `docs/roadmap/MEMORY_UX_OBSERVABILITY_AUDIT.md`.
- `docs/roadmap/PR109_MEMORY_UX_OBSERVABILITY_AUDIT.md`.
- `docs/roadmap/PR110_MEMORY_RUNTIME_EXPLANATION_READBACK.md`.
- `docs/roadmap/PR143_MEMORY_LIFECYCLE_REVIEW_SURFACE.md`.
- `docs/roadmap/PR146_MEMORY_GRAPH_RELATIONSHIP_READBACK.md`.
- `docs/roadmap/PR150_MEMORY_GRAPH_EDGE_RECORDING.md`.
- `docs/roadmap/PR151_MEMORY_SUPERSESSION_OWNER_CONTROL.md`.
- `docs/roadmap/PR192_MEMORY_CONTINUITY_OBSERVABILITY_UX_FIRST_SLICE.md`.
- `docs/roadmap/PR193_ARIADNE_CONTINUITY_MEMORY_OBSERVABILITY_REHEARSAL.md`.
- `docs/roadmap/PR194_CONTINUITY_READABILITY_PATCH.md`.
- `docs/roadmap/PR198_STUDIO_ARCHIVE_UX_FEASIBILITY_DAEDALUS.md`.
- `docs/roadmap/PR199_UX01A_STUDIO_PLACE_MOBILE_WORKBENCH_DAEDALUS.md`.
- `docs/roadmap/PR200_UX01A_STUDIO_WORKBENCH_REVIEW_ARIADNE.md`.
- `apps/web/lib/memory-lifecycle-ui.ts`.
- `apps/web/lib/memory-lifecycle-ui.test.ts`.
- `apps/web/lib/continuity-ui.ts`.
- `apps/web/lib/continuity-ui.test.ts`.
- `apps/web/lib/archive-trust.ts`.
- `apps/web/components/studio/runtime-context-preview.tsx`.
- `apps/web/components/studio/continuity-timeline.tsx`.
- `apps/web/components/studio/archive-library.tsx`.
- `apps/web/app/studio/personas/[personaId]/page.tsx`.
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`.
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`.
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`.

## Current Done-Enough Stack

### Memory

- `buildMemoryRuntimeExplanation` already separates selected Memory from
  active-but-not-selected and lifecycle-held-out Memory.
- `buildMemoryLifecycleReview` already maps runtime readiness, lifecycle
  status, action state, confidence, and relevance-weight labels.
- Supersession is owner-controlled and creates real graph edges through the
  existing lifecycle path.
- Helper tests prove redaction for raw ids, prompt-shaped labels, URLs, and
  secret-shaped values.

### Continuity

- The persona workspace exposes Continuity as its own stop.
- The Continuity route shows trust metrics, runtime context counts, source
  chips, record type labels, visibility labels, source version, record version,
  and readable record cards.
- The route deliberately hides compiled prompt and source body content in its
  runtime preview by passing `showCompiledPrompt={false}` and
  `showSourceContent={false}`.

### Archive

- Persona Archive has trust metrics, storage/quota readback, import review,
  import job/file status, next-action copy, and per-persona export readback.
- Global Archive has owner-only search/filter/status readback and source
  material/visibility narrative.
- `archive-trust` correctly frames processed, failed, queued, and private
  owner-only source states.

### AI Observability And Graph

- AI trace summary/detail work has a sanitization boundary and should not be
  broadened without a new ARGUS privacy spec.
- Memory graph readback is useful when real edges exist and honest when they do
  not.
- Explicit supersession edges now provide a meaningful graph path without
  inferred semantic edge generation.

### Studio Orientation

- UX-01A made Studio/persona routes name the current place, privacy state, and
  purpose on desktop and 375px mobile.
- That reduces navigation confusion but does not itself explain cross-surface
  runtime provenance.

## Remaining Gap

The current owner has good facts, but they are distributed:

- Memory explains selected and held-out memory.
- Continuity explains continuity records and their source labels.
- Archive explains source readiness and import trust.
- Runtime context preview counts and lists selected Canon, Integrity,
  Continuity, Memory, and Archive sources.
- Persona home still has a generic runtime preview that can show the compiled
  prompt by default; future provenance work should not expand raw prompt
  visibility.

The next product value is a small owner-only provenance readback that joins
these facts at the point of runtime context, using labels, counts, source
categories, and review links only.

## Proposed PR262 Shape

Scope:

- Add a small owner-only "Runtime provenance" readback beside or under the
  Continuity route's runtime context section.
- Reuse existing owner-only inputs where possible:
  - `/conversations/persona/:personaId/context-preview`;
  - `/continuity/persona/:personaId/records`;
  - current Memory page/runtime helper semantics as reference;
  - current Archive trust helper copy as reference.
- Add a helper, likely in `apps/web/lib/continuity-ui.ts` or a new focused
  owner-observability helper, that summarizes runtime sources into safe rows:
  - source group: Canon, Integrity, Continuity, Memory, Archive;
  - selected count;
  - sanitized title/label;
  - sanitized reason;
  - provenance/source label if already available;
  - owner review target copy such as "review in Memory", "review in Archive",
    or "review Continuity record".
- Keep the implementation readback-only. Do not add mutation controls.
- Keep source body content and compiled prompt hidden for this surface.
- Add focused helper tests for:
  - grouped source counts;
  - Continuity/Memory/Archive review-target labels;
  - empty/thin states;
  - redaction of raw ids, URLs, prompt-shaped text, provider payload markers,
    bearer/token/key/password/secret-shaped values, and private excerpts.
- Add a visible-route check after implementation if the route changes.

Recommended visible location:

- First choice: `/studio/personas/:personaId/continuity`, directly adjacent to
  the existing runtime Continuity preview. This route is already the owner stop
  for "what feeds continuity" and already suppresses raw compiled prompt/source
  body display.
- Do not add it to the public persona route or public Developer Space route.

## Explicit Non-Scope For PR262

Do not:

- expose raw system prompts, user prompts, completions, trace bodies, provider
  payloads, private archive excerpts, raw source ids, raw link ids, owner ids,
  bearer tokens, secrets, SQL, stack traces, hosted logs, or private route
  bodies;
- change retrieval ranking, embeddings, vector dimensions, memory truth,
  lifecycle semantics, archive authorization, source serialization, or
  visibility;
- add graph canvas/exploration, automatic graph edge generation, richer AI
  trace detail, hosted timing instrumentation, provider calls, Redis,
  Cloudflare, queues/workers, migrations, schema, billing, auth/session,
  deployment config, public memory, or public observability;
- redesign Studio broadly or reopen Developer Space work.

## ARGUS Safety Gates For PR262

ARGUS should review before ARIADNE rehearsal if implementation lands:

- owner scoping remains behind existing Studio/session APIs;
- the new helper output does not include raw ids, prompts, private archive
  excerpts, source bodies, provider payloads, URLs, secrets, or compiled prompt
  text;
- source labels are sanitized through the same or stronger rules as
  `continuity-ui` and `memory-lifecycle-ui`;
- the readback does not imply retrieval ranking changed;
- the readback does not imply Memory/Archive/Continuity are public;
- empty/thin states are honest and do not invent provenance links;
- no new API, schema, provider, queue, Redis, Cloudflare, billing, auth/session,
  or deployment behavior was introduced.

## ARIADNE Rehearsal If PR262 Is Implemented

ARIADNE should check:

- `/studio/personas/:personaId/continuity` on desktop and 375px mobile.
- A populated runtime preview with Memory, Continuity, and Archive source
  groups.
- A sparse runtime preview with no selected Archive or no selected Memory.
- That the owner can understand which surface to review next without reading a
  raw prompt or source body.
- No horizontal overflow, cramped chips, clipped controls, or repeated copy that
  turns into noise.

## Validation For This Audit

DAEDALUS ran:

```bash
git diff --check
git diff --cached --check
```

No product code, schema, migration, package script, provider, Redis/Cloudflare,
queue/worker, billing, auth/session, env, deployment, public route, or hosted
data changed in this audit.
