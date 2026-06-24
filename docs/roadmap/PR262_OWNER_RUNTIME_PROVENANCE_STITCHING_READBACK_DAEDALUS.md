# PR262 - Owner Runtime Provenance Stitching Readback

Owner: A2 / DAEDALUS

Status: open

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
