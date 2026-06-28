# Feature: Memory Continuity Archive Observability

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - DAEDALUS

## Why This Lane

The route-level production error hardening pass has covered the primary
protected-alpha and public-chain surfaces through Project routes. MIMIR is
pausing that hardening sequence here so it does not become self-perpetuating.

The next product boundary is replay-ready Memory, Continuity, Archive, and
observability. This is Station's core promise: an owner should see what the
persona is keeping steady, what evidence supports it, what archive material is
available, and what Station would use for the next response.

Use the existing product clues and prior UX/replay docs, especially:

- `docs/ops/open-repo-upgrade-review.md`
- `docs/ops/STAGING_REPLAY_DATA_PLAN.md`
- `docs/roadmap/UX02_ARCHIVE_TRUST_FEASIBILITY_RESULT.md`
- `docs/roadmap/UX03_CONTINUITY_INTEGRITY_FEASIBILITY_RESULT.md`
- `docs/roadmap/UX03A_CONTINUITY_REVIEW_TARGET_LINKS_RESULT.md`
- `docs/roadmap/ARIADNE_HUMAN_REHEARSAL_REVIEW.md`

## Task

Implement the next narrow product slice that makes Memory, Continuity, Archive,
and runtime observability feel like one inspectable system rather than separate
counts and tabs.

Required outcome:

- On the owner-facing Studio/persona surfaces, show a clear readback of what
  Station can use for the next response: Memory, Canon, Integrity, Continuity,
  and Archive inputs.
- Make each source type routeable to the review surface where the owner can
  inspect or change it.
- Make provenance/trust labels visible without exposing private archive text on
  public routes or in logs.
- Preserve existing successful Memory, Canon, Continuity, Archive, Integrity,
  export, chat, and context-preview behavior.
- Keep the slice useful for staging replay: a human should be able to prove the
  seeded persona can answer from active memory/archive/continuity and see where
  that material came from.

This is a product/UX and observability lane, not another broad raw-error sweep.

## Scope

Start by inspecting the existing implementation and choose the smallest coherent
slice. Likely surfaces:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/web/app/studio/archive/page.tsx`
- `apps/web/components/studio/*`
- `apps/web/lib/*memory*`, `*continuity*`, `*archive*`, `*observability*`
- API context-preview/archive routes only if the UI needs already-safe data
  shape improvements.

Allowed:

- owner-facing UI/readback improvements;
- small typed helpers for runtime source/provenance labels;
- focused tests for Studio UI, persona context, continuity, archive retrieval,
  and replay-readiness if touched;
- docs/status/baseline updates for the result.

Do not change:

- embedding provider selection, vector dimensions, reindex policy, retrieval
  semantics, Memory/Canon/Continuity schema, Archive import semantics, public
  visibility policy, Redis, Cloudflare, Stripe, Railway/Supabase config,
  workers, queues, hosted data, or route-level hardening outside the selected
  slice.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If replay-readiness, retrieval metadata, continuity publication, or API data
shape changes are touched, also run the matching focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS MEMORY CONTINUITY ARCHIVE OBSERVABILITY REVIEW
```

and ask ARGUS to review privacy boundaries, provenance claims, replay
truthfulness, and regression coverage.

After ARGUS accepts, wake ARIADNE for a human rehearsal of the owner-facing
flow:

```text
READY FOR ARIADNE MEMORY CONTINUITY ARCHIVE HUMAN REHEARSAL
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if the smallest coherent slice requires provider/reindex/config decisions or a
schema migration.
