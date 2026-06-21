# PR146 - Memory Graph Relationship Readback

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior after ARGUS technical acceptance.
Status: open

## Why This Lane

MIMIR closes PR145 Settings AI Trace Detail Readback after ARGUS technical
acceptance and ARIADNE Settings rehearsal.

Lane 6 has now improved runtime Memory explanation, lifecycle review, and AI
trace observability. The remaining Memory UX/observability branch with direct
Station value is Memory graph readback. The repo already has owner-scoped graph
routes and a compact Persona Management Memory Graph section, but the current
visible readback is mostly counts and a short node list. It does not yet help an
owner understand actual relationships when edges exist.

This lane should add useful relationship readback without pretending the graph
is richer than it is.

## Goal

Make the owner-facing Memory Graph section explain memory relationships when
edges exist, and give an honest empty/thin-state when they do not.

## Scope

DAEDALUS should inspect:

- `apps/api/src/routes/memory.ts`;
- `apps/web/components/studio/persona-management.tsx`;
- `apps/web/lib/persona-lifecycle-ui.ts`;
- `apps/web/lib/persona-lifecycle-ui.test.ts`;
- graph types in `packages/types/src/persona.ts`.

Implement the smallest safe slice:

- add helper-level relationship readback for graph edges;
- show a compact relationship list in Persona Management when edges exist;
- include source memory label, target memory label, relationship type,
  confidence, and sanitized note where available;
- keep an honest empty/thin-state when edges are absent;
- keep node readback intact;
- avoid graph canvas/force layout/large visualization work;
- avoid fake relationship generation.

If current graph data is too thin or the API shape is unsafe for UI use,
DAEDALUS should either fix the smallest safe blocker or return a precise block
with the next concrete data/API lane. Do not fabricate edges.

## Privacy Requirements

Render only owner-scoped, sanitized Memory graph labels and bounded summaries.

Do not render:

- raw memory item ids;
- owner ids;
- persona ids;
- raw edge ids;
- raw source ids;
- raw URLs;
- raw prompts, completions, trace bodies, provider payloads, or private archive
  excerpts;
- tokens, cookies, API keys, passwords, bearer values, webhook secrets, DB URLs,
  or other secret-shaped values.

IDs may be used internally for React keys or lookup joins, but they should not
be visible in the owner-facing readback.

## Non-Scope

Do not add:

- automatic edge generation;
- embeddings/provider changes;
- Redis/Upstash or Cloudflare graph/index work;
- background jobs;
- public Memory graph;
- graph canvas/force-directed visualization;
- Memory mutation beyond existing explicit owner graph routes;
- broad Persona Management redesign;
- billing/auth/session changes;
- migration-ledger repair.

## Tests

Add focused tests for:

- relationship label/readback mapping;
- missing-node or dangling-edge fallback copy;
- empty/thin-state copy;
- note/summary redaction for ids, URLs, prompt-shaped text, and secrets;
- existing lifecycle/handoff helpers staying intact.

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If DAEDALUS changes the graph API route, add or run focused route coverage and
name it in the handoff.

## ARGUS Review Requirements

ARGUS should verify:

- graph readback remains authenticated and owner-scoped;
- edge relationship display does not leak raw ids, URLs, private excerpts,
  prompts, provider payloads, or secret-shaped values;
- absent/thin graph data is represented honestly and does not imply fake
  relationships;
- no automatic edge generation or non-scope infrastructure was introduced;
- validation passed.

Because PR146 is expected to change visible Persona Management behavior, ARGUS
should wake ARIADNE after technical acceptance for a human-eye rehearsal.
