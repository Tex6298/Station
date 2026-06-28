# PR450 - Continuity Review Target Route Links

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

This lane implements the recommended UX-03A slice from:

`docs/roadmap/UX03_CONTINUITY_INTEGRITY_FEASIBILITY_RESULT.md`

PR449 has now closed the Studio dashboard Memory orientation proof, so the next
core memory/continuity/archive UX move is cross-surface stitching on the
Continuity route.

## Goal

Turn owner-only Continuity review target text into safe route-level links to
existing Studio review surfaces.

The goal is to reduce mental stitching for the owner without implying that
private Memory, Canon, Integrity, Archive, or Continuity originals become
public or automatically correct.

## Scope

Add a small helper that maps review targets to existing owner routes:

- Memory -> `/studio/personas/:personaId/memory`
- Canon -> `/studio/personas/:personaId/canon`
- Integrity -> `/studio/personas/:personaId/calibration`
- Archive -> `/studio/personas/:personaId/files`
- Continuity -> `/studio/personas/:personaId/continuity`
- Publication/document review -> the safest existing Studio publishing or
  document route already used by current code

Render those links only inside owner-only Studio Continuity readback surfaces
where the route currently shows review-target text.

Keep links route-level unless current code already has a safe exact item route.
Do not invent deep links that expose source IDs.

## Boundaries

Do not change:

- continuity records;
- Integrity outputs;
- Memory or Canon writes;
- Archive candidates/imports;
- runtime selection;
- publication visibility;
- auth/session behavior;
- backend APIs unless absolutely required;
- schema, migrations, workers, queues, Redis, Cloudflare, Railway, Supabase
  config, or provider/model behavior.

Preserve the route distinction where persona home may show more owner-only
runtime context than the Continuity route. Do not expose compiled prompts,
source bodies, provider payloads, storage paths, raw IDs, or private document
bodies.

## Acceptance Gates

- Continuity readback shows route-level review links for supported targets.
- Links stay inside owner-only Studio surfaces.
- Missing or unsupported targets still render safe text without dead links.
- Mobile at 375px/390px stays readable without horizontal overflow.
- The UI still distinguishes Memory, Canon, Archive, Integrity output, runtime
  context, and Continuity records.
- Copy avoids implying magical certainty, autonomous Memory/Canon mutation, or
  public publication of private originals.

## Validation

Run focused validation appropriate to the implementation:

```text
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

Add `test:continuity-publication` if publication/document target mapping or
copy changes.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added owner-only Continuity review target route links for PR450.
- Links route owners from Continuity readback to existing Studio review surfaces.
Risk:
- Continuity links must preserve owner-only scoping, redaction, and publication boundaries.
Task:
- Review route mapping, unsupported-target fallback, mobile readability, and focused tests.
```

## ARGUS Result

Accepted on 2026-06-28:

`docs/roadmap/PR450_CONTINUITY_REVIEW_TARGET_LINKS_REVIEW_RESULT.md`

ARGUS confirmed current main already contains the requested route-link behavior,
the route mappings remain owner-only and route-level, unsupported or unsafe
targets stay plain text, and no duplicate product-code lane is needed.
