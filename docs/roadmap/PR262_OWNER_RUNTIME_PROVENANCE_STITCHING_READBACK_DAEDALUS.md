# PR262 - Owner Runtime Provenance Stitching Readback

Owner: A2 / DAEDALUS

Status: accepted by ARGUS on 2026-06-24; awaiting MIMIR/ARIADNE routing

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

PR261 found the next narrow Memory/observability gap: each owner surface is now
legible by itself, but the owner still has to mentally stitch together runtime
context, Continuity, Memory, Archive, Canon, and Integrity provenance.

Build one owner-only readback that answers:

```text
What shaped this persona response, where did each source come from, and which
owner-controlled surface should I review if the source is wrong?
```

This is readback-only. It must not change retrieval, memory truth, source
serialization, provider calls, public routes, or runtime behavior.

## Inputs

- `docs/roadmap/MEMORY_OBSERVABILITY_NEXT_SLICE_AUDIT.md`
- `docs/roadmap/PR261_MEMORY_OBSERVABILITY_NEXT_SLICE_AUDIT_DAEDALUS.md`
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/web/components/studio/runtime-context-preview.tsx`
- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/web/lib/memory-lifecycle-ui.ts`
- `apps/web/lib/memory-lifecycle-ui.test.ts`
- Current context-preview and persona-context tests.

## Allowed Scope

Implement an owner-only "Runtime provenance" readback on:

- `/studio/personas/[personaId]/continuity`

Use existing owner-authorized data already available through current Studio
runtime context, Continuity, Memory, Archive, Canon, and Integrity semantics.

Allowed changes:

- Add a focused helper in `apps/web/lib/continuity-ui.ts` or a new small
  owner-observability helper.
- Render a small readback beside or under the existing Continuity route runtime
  context section.
- Add focused helper/UI tests.
- Update roadmap/status/validation docs.

The readback may show only:

- source group: Canon, Integrity, Continuity, Memory, Archive;
- selected counts;
- sanitized source titles or labels;
- sanitized reasons;
- already-available provenance/source labels;
- owner review-target copy such as "review in Memory", "review in Archive",
  "review Continuity record", or "review Canon".

## Required Safety Boundaries

- Keep `RuntimeContextPreview` on the Continuity route hiding compiled prompts
  and source body content (`showCompiledPrompt={false}` and
  `showSourceContent={false}`).
- Do not expose raw prompts, completions, trace bodies, provider payloads,
  private archive excerpts, source bodies, raw source ids, raw link ids, owner
  ids, bearer tokens, secrets, SQL, stack traces, hosted logs, URLs, or private
  route bodies.
- Do not change retrieval ranking, embeddings, vector dimensions, memory truth,
  lifecycle semantics, archive authorization, source serialization, or
  visibility.
- Do not add graph canvas/exploration, automatic graph edge generation, richer
  AI trace detail, hosted timing instrumentation, provider calls, Redis,
  Cloudflare, queues/workers, migrations, schema, billing, auth/session,
  deployment config, public memory, or public observability.
- Do not redesign Studio broadly or reopen Developer Space work.

## UX Requirements

- The section should be quiet and useful, not another dense debug trace.
- Empty/thin states must be honest and must not invent provenance.
- The owner should understand which existing surface to review next without
  reading source bodies or compiled prompts.
- Desktop and mobile layout should avoid horizontal overflow, cramped chips,
  clipped controls, and repeated copy.

## Required Tests And Checks

Add or update focused tests for:

- grouped source counts;
- Continuity, Memory, Archive, Canon, and Integrity review-target labels;
- empty and sparse runtime context states;
- redaction or rejection of raw ids, URLs, prompt-shaped text, provider payload
  markers, bearer/token/key/password/secret-shaped values, and private excerpts;
- no compiled prompt/source-body display on the Continuity route.

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If `test:persona-context` is not the right gate after inspection, explain the
substitution and keep `test:continuity` plus `test:studio-ui`.

## Wake ARGUS

When complete, commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR262 Owner Runtime Provenance Stitching Readback.
- Scope stayed owner-only/readback-only, or note the blocker.
Validation:
- ...
Risk:
- This changes a visible owner Studio route and needs ARIADNE rehearsal after
  ARGUS accepts/passes the boundary.
Task:
- Review owner scoping, prompt/source-body hiding, redaction, source-group
  honesty, retrieval non-drift, and whether ARIADNE can rehearse the
  Continuity route.
```

If implementing the readback requires a new API, schema, serializer, retrieval,
provider, or authorization change, stop and wake ARGUS with the blocker instead
of widening scope.

## DAEDALUS Implementation Result

Implemented on 2026-06-24.

Files changed:

- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/api/src/routes/continuity.test.ts`
- roadmap/status/validation docs

Implementation summary:

- Added `buildRuntimeProvenanceReadback`, a focused Continuity UI helper that
  groups runtime context sources into Canon, Integrity, Continuity, Memory, and
  Archive readback groups.
- Each group reports selected count, sanitized source title/label, sanitized
  reason, source label, and an owner review target such as `Review in Memory`,
  `Review in Archive`, or `Review Continuity record`.
- Added a readback-only `Runtime provenance` section under the existing
  Continuity route runtime preview on
  `/studio/personas/[personaId]/continuity`.
- The existing `RuntimeContextPreview` on the Continuity route still passes
  `showCompiledPrompt={false}` and `showSourceContent={false}`.
- The new readback helper ignores `systemPrompt` and source `content`; it
  renders only labels/counts/reasons/review targets.
- Hardened Continuity label sanitization for prompt-shaped text,
  provider-payload/trace/private-excerpt markers, raw ids, URLs, bearer values,
  database URLs, and token/key/password/secret-shaped values.
- Patched the `continuity.test.ts` in-memory Supabase test double with `.in()`
  support after current persona readback validation hit a deterministic fixture
  gap. No production API behavior changed.

Explicit non-scope preserved:

- No retrieval ranking, embeddings, vector dimensions, memory truth, lifecycle
  semantics, archive authorization, source serialization, visibility, provider
  calls, Redis, Cloudflare, queues/workers, migrations, schema, billing,
  auth/session, deployment config, public memory, public observability, graph
  exploration, automatic graph edge generation, richer AI trace detail, broad
  Studio redesign, or Developer Space work changed.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 8 tests passed, including new runtime provenance helper coverage and the `.in()` fixture repair. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed; runtime context semantics remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 107 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | CRLF warnings only. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |

ARGUS should review owner scoping, prompt/source-body hiding, redaction,
source-group honesty, retrieval non-drift, and whether ARIADNE can rehearse the
visible Continuity route.

## ARGUS Verdict

Accepted on 2026-06-24 with no review patch.

Findings:

- The implementation matches the PR262 lane: an owner-only, readback-only
  runtime provenance section on `/studio/personas/[personaId]/continuity`.
- The new readback uses existing persona/context-preview access and does not
  add API routes, schema, migrations, provider calls, retrieval behavior,
  archive authorization, or public surfaces.
- `RuntimeContextPreview` still hides compiled prompts and source bodies on the
  Continuity route.
- `buildRuntimeProvenanceReadback` renders grouped selected counts, sanitized
  titles/labels, sanitized reasons, source labels, and review-target copy only.
  It ignores `systemPrompt` and source `content`.
- Focused tests cover grouped runtime provenance, empty/sparse source states,
  review targets, prompt/source-body suppression, raw id/URL/secret redaction,
  and provider-payload/private-excerpt markers.
- The `.in()` change is limited to the in-memory Supabase test double used by
  Continuity route tests; no production API behavior changed.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 107 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

Explicit non-scope confirmed:

- No retrieval ranking, embeddings, vector dimensions, memory truth, lifecycle
  semantics, archive authorization, source serialization, visibility, provider
  behavior, Redis, Cloudflare, queues/workers, migrations, schema, billing,
  auth/session, deployment config, public memory, public observability, graph
  exploration, automatic graph edge generation, richer AI trace detail, broad
  Studio redesign, or Developer Space behavior changed.

Next baton:

- Wake MIMIR.
- Because this changes a visible owner Studio route, MIMIR should route ARIADNE
  desktop/mobile rehearsal for `/studio/personas/[personaId]/continuity`
  before closing PR262.
