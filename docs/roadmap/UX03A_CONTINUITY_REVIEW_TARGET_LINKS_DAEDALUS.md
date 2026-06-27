# UX-03A Continuity Review Target Route Links

Owner: DAEDALUS
Reviewer: ARGUS, then ARIADNE
Status: OPEN - WAKE DAEDALUS
Opened: 2026-06-27

## Why This Slice Exists

UX-03 feasibility found that current main already has the Continuity, Integrity,
Memory, Archive, export, and runtime readback foundations. The remaining cheap
gap is cross-surface stitching: Continuity tells the owner where to review next,
but many of those review targets are still plain text labels.

This slice should make those existing review targets actionable by linking them
to current owner-only Studio routes.

## Product Goal

On `/studio/personas/[personaId]/continuity`, an owner should be able to see a
continuity/runtime provenance item and move to the relevant review surface
without guessing where it lives.

Target route mapping should be route-level unless a safe exact item route
already exists:

- Memory -> `/studio/personas/:personaId/memory`
- Canon -> `/studio/personas/:personaId/canon`
- Integrity -> `/studio/personas/:personaId/calibration`
- Archive -> `/studio/personas/:personaId/files`
- Continuity -> `/studio/personas/:personaId/continuity`
- Publication/document review -> inspect current code and use the safest
  existing Studio publishing/document route if one already exists

Do not invent deep links that expose source IDs or imply item-level routing that
does not exist.

## Likely Files

- `apps/web/components/studio/continuity-timeline.tsx`
- `apps/web/components/studio/runtime-context-preview.tsx`
- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`

Touch only the files needed for this narrow UI/helper slice.

## Implementation Scope

- Add or extend a small helper that maps sanitized continuity/runtime review
  targets to existing owner-only Studio route hrefs.
- Render route-level links where the Continuity route already shows review
  target text such as `Review in Memory`, `Review in Canon`,
  `Review Integrity Session`, and `Review in Archive`.
- Keep visible labels owner-friendly and sanitized.
- Preserve the route-specific `RuntimeContextPreview` redaction distinction:
  persona home may show more owner context; the Continuity route must keep
  compiled prompt/source content hidden.
- Add focused helper/component tests for mapping, unknown targets, no raw-ID
  visible labels, and unchanged redaction behavior.
- Keep desktop, 375px, and 390px layouts readable without horizontal overflow.

## Hard Boundaries

Do not change:

- continuity record write semantics;
- Integrity engine, prompts, question bank, extraction, or idempotency;
- Memory or Canon write/lifecycle behavior;
- Archive candidate/import mutation;
- runtime context selection, ranking, or redaction;
- publication visibility or public document workflow;
- auth/session behavior;
- provider/model behavior;
- Redis, Cloudflare, Railway, Supabase, schema, migration, worker, queue, or
  config behavior;
- backend API routes.

## Privacy And Trust Rules

- Links must stay inside owner-only Studio surfaces.
- Copy must not imply that private Memory, Canon, Integrity, Archive, or
  Continuity originals become public.
- Do not expose raw source bodies, storage paths, raw IDs, prompts, provider
  payloads, compiled prompts, or private archive text in link labels.
- Unknown or unsupported targets should remain clear text or disabled/readback
  copy rather than linking to a guessed route.

## Required Validation

Run at minimum:

```bash
git diff --check
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
```

Also run an added-line sensitive-pattern scan before handing to ARGUS.

Add:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
```

if publication/document target mapping or copy is touched.

If `build` is run, keep the known local Windows standalone symlink `EPERM`
caveat separate from compile/type/page-generation success.

## ARGUS Review Request

ARGUS should verify:

- links are route-level and owner-only;
- no backend/config/auth/provider/write behavior changed;
- redaction behavior on Continuity remains intact;
- unknown review targets do not become guessed links;
- link labels do not reveal raw IDs or private source material;
- publication copy still reads as a separate copy operation;
- validation commands and sensitive scan evidence are credible.

## ARIADNE Review Request

After ARGUS accepts the technical boundary, ARIADNE should perform a human-eye
rehearsal on:

- desktop `/studio/personas/[personaId]/continuity`;
- 375px `/studio/personas/[personaId]/continuity`;
- 390px `/studio/personas/[personaId]/continuity`;
- route handoffs from Continuity to Memory, Canon, Integrity, Archive, and any
  safe publication/document surface.

Questions for ARIADNE:

- Can an owner tell what changed, why it was recorded, and where to review it
  next?
- Do links reduce mental stitching without looking like proof or magical
  certainty?
- Does the page still distinguish Memory, Canon, Archive, Integrity output,
  runtime context, and Continuity records?
- Does mobile avoid crowded chips, clipped links, and horizontal overflow?

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented UX-03A Continuity review target route links.
- Scope stayed owner-only and route-level unless current safe routes existed.
Risk:
- Review target links can accidentally imply public publication, exact source
  proof, or item-level routing that does not exist.
Task:
- Review the technical boundary, validation, redaction behavior, and route
  labels.
- If accepted, wake ARIADNE for human-eye route rehearsal.
```
