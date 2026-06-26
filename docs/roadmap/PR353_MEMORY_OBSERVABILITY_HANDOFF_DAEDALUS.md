# PR353 - Memory Observability Handoff

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE completed PR352 Railway staging browser sweep with PASS WITH CAVEAT.
- The caveat was route-sampler timing only; settled follow-up checks passed and no product repair packet is needed.
- MIMIR is returning to the parked Memory lifecycle / owner-visible observability product thread.
Task:
- Implement the narrow owner-only Memory observability handoff slice described in this document.
- Keep it on current repo truth and existing authorized APIs.
- If code changes land, wake ARGUS for review.
- If the current UI already fully covers this slice, wake MIMIR with the exact evidence and a sharper next implementation packet.
```

## Why This Is Next

The broad Railway sweep passed, so the next move should not be another route
survey. Phase 2D/2E Developer Agent work is bounded enough for now, and the
stored roadmap repeatedly points back to Station's core promise: owners need to
understand what the persona will remember, what was held out, and where to
inspect the evidence.

Current Memory and Continuity pages already expose strong pieces:

- Memory has lifecycle counters, selected versus eligible-not-selected versus
  held-out runtime readback, and lifecycle actions.
- Continuity has owner-only runtime provenance groups across Canon, Integrity,
  Continuity, Memory, and Archive.
- Settings has sanitized AI Activity and trace readback.
- Archive/files has owner-only source trust and quota/readiness state.

The remaining narrow gap is handoff comprehension. A user looking at the Memory
page can see selected and held-out memory, but still has to know where to go
next to inspect the full runtime provenance, archive source state, or recent AI
activity. PR353 should make that next step visible without changing retrieval or
privacy boundaries.

## Implementation Target

Add an owner-only Memory observability handoff on:

```text
apps/web/app/studio/personas/[personaId]/memory/page.tsx
```

It should help the owner answer:

- Which memory shaped the last preview?
- Which memory was eligible but not selected?
- Which memory was held out by lifecycle/source state?
- Where do I inspect the broader runtime provenance?
- Where do I inspect archive source readiness?
- Where do I inspect sanitized AI activity?

Use existing route targets only:

```text
/studio/personas/[personaId]/continuity
/studio/personas/[personaId]/files
/settings
```

Reasonable implementation shape:

- Add a small helper in `apps/web/lib/memory-lifecycle-ui.ts` that turns the
  current runtime explanation/readback state into owner-friendly handoff rows or
  cards.
- Render those rows on the Memory page near the existing Runtime context /
  Lifecycle review sections.
- Include links/actions to Continuity, Archive, and Settings AI Activity.
- Keep labels specific: selected memory, eligible-not-selected memory,
  lifecycle-held-out memory, runtime provenance, archive source state, AI
  activity.
- Add focused helper tests in `apps/web/lib/memory-lifecycle-ui.test.ts`.

The exact UI can differ if a simpler local pattern fits better, but it must stay
small and owner-readable.

## Scope Boundaries

Do not change:

- retrieval ranking;
- embeddings, providers, model selection, Gemini/OpenAI/NVIDIA config;
- Redis, Upstash, Cloudflare, queues, workers, background jobs, or cache truth;
- memory persistence semantics or lifecycle policy;
- source serialization, source bodies, compiled prompts, raw trace payloads, or
  private IDs;
- public memory, public observability, public persona context, or visitor
  surfaces;
- billing, Stripe, auth/session, deployment, schema, migrations, import/export,
  Developer Space behavior, or broad UI styling.

Do not add a new API unless existing authorized data is genuinely insufficient.
If it is insufficient, wake MIMIR with the exact missing data contract before
implementing backend changes.

## Acceptance Criteria

- The Memory page gives the owner a clear next-step readback from selected,
  eligible-not-selected, and held-out memory state to the relevant inspection
  surface.
- Continuity, Archive, and Settings links are route-only and do not mutate.
- Copy does not imply that observability changes memory truth or that AI traces
  expose raw prompts/completions.
- Source bodies, compiled prompts, raw IDs, provider payloads, and secret-shaped
  values remain hidden.
- Existing Memory lifecycle actions still work as before.
- Mobile layout remains readable and avoids document-level horizontal overflow.

## Suggested Validation

Run the narrowest useful checks first:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the implementation touches shared navigation or broader Studio shell, add the
repo's relevant lint/build gate as judgment requires.

## Review Handoff

If code changes land, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR353 Memory observability handoff.
Risk:
- Owner-only Memory/Continuity/Archive/AI Activity links must not leak raw private data or imply observability mutates memory truth.
Task:
- Review the patch, owner/privacy boundaries, route-only behavior, and validation.
- Wake MIMIR with accept/reject verdict.
```

If no product patch is needed, wake MIMIR instead with exact evidence and a
concrete next lane recommendation.
