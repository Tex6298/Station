# PR34 - Runtime Context Topology Budget

Date: 2026-06-18
Status: accepted by ARGUS for MIMIR closeout
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses only if visible
Studio context/continuity UI changes.

## Purpose

Make persona chat context selection deterministic now that runtime context can
include canon, owner preference/integrity, continuity, owner memory, retrieved
memory, private archive, and recent turns.

PR31 made the budget report visible to tests/operators. PR33 added continuity
records. PR34 should now define how Station protects the most important context
when buckets compete for prompt space, without changing retrieval algorithms or
adding new infrastructure.

## Scope

- Add a small runtime-context topology/budget policy for chat prompt assembly.
- Preserve high-priority context first:
  - canon;
  - owner preference/profile and Integrity notes;
  - continuity records;
  - owner/shared memory blocks;
  - retrieved memory;
  - archive/source excerpts.
- Add bounded per-bucket text/token/character caps where the current prompt can
  otherwise grow without discipline.
- Record content-free truncation/drop metadata in the PR31 runtime budget report
  so tests can prove what was retained or trimmed without exposing private text.
- Keep selected-source trace metadata content-free.
- Add focused tests with deliberately oversized/competing context buckets.
- Keep existing prompt-injection warnings for memory, continuity, and archive
  material.

## Non-Scope

- Do not change vector search, keyword fallback, embedding providers, or
  retrieval ranking algorithms in this PR.
- Do not add Redis/Valkey/Cloudflare context storage.
- Do not add provider token streaming.
- Do not redesign Studio chat or Continuity UI.
- Do not change Memory/Canon acceptance semantics.
- Do not expose private context in production responses or stream events.

## Acceptance

- Canon and owner-guided Integrity/preference context are not dropped by lower
  priority memory/archive volume.
- Continuity records survive ordinary memory/archive competition within a small
  bounded limit.
- Oversized memory/archive/continuity content is clipped or dropped according to
  a deterministic policy, and the runtime budget reports content-free
  truncation/drop counts.
- Prompt output still labels user-owned material as context/source material, not
  instructions.
- Existing PR31/PR32 response and stream-event safety boundaries remain intact.

## Validation

Run the focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If Studio-visible loading/context copy changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

## ARGUS Review Ask

ARGUS should hostile-review:

- whether high-priority context can be displaced by noisy memory/archive data;
- whether truncation/drop metadata leaks private text;
- whether the policy overclaims semantic quality;
- prompt-injection boundaries after clipping;
- scope drift into retrieval rewrite, Redis/Cloudflare, provider streaming, or
  UI redesign.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- files changed;
- topology/budget policy;
- truncation/drop metadata shape;
- validation commands/results;
- whether ARIADNE needs a visible rehearsal.

## ARGUS Review Result

ARGUS accepts PR34 for MIMIR closeout, 2026-06-18.

- Runtime context now applies the deterministic topology after retrieval:
  `canon`, `integrity`, `continuity`, `memory`, `archive`.
- Lower-priority memory/archive volume cannot displace retained canon,
  owner-guided integrity/preference notes, or continuity records inside this
  bounded alpha policy.
- Runtime budget topology metadata is content-free: requested, retained,
  dropped, truncated, max item, and max character counts only.
- Selected-source trace metadata remains content-free, and production/stream
  response safety boundaries are unchanged.
- ARGUS patched prompt-structure hardening so topology-managed source text is
  compacted to single-line prompt items before clipping; `truncated` still means
  length clipping, not ordinary whitespace normalization.
- ARGUS also copied the topology priority array in returned context metadata so
  consumers cannot mutate the module-level priority list by reference.
- No ARIADNE rehearsal is required because no visible Studio UI changed.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```
