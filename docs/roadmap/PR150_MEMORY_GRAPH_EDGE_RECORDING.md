# PR150 - Memory Graph Edge Recording

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks; ARGUS reviews.
Status: open

## Why This Lane

PR149 hosted replay measurement is sufficient as a baseline, and it produced
one clear Memory UX/observability follow-up: the replay owner has 14 Memory
graph nodes and 0 edges.

PR146 already made Persona Management honestly read back relationships when
edges exist, and honestly say when no edges exist. The remaining problem is not
visual polish. Station has an owner-scoped graph route and an explicit edge
route, but normal protected-alpha Memory flows are not producing relationship
rows that the owner can inspect.

This lane should make real, explicit owner Memory relationships create durable
`memory_item_edges` rows without fabricating semantic links from embeddings,
archive text, or private replay payloads.

## Goal

Make Memory graph edges become meaningful from explicit owner/lifecycle actions
so the existing PR146 readback can show at least deterministic relationships
such as supersession.

## Scope

DAEDALUS should inspect:

- `apps/api/src/routes/memory.ts`;
- `apps/api/src/services/memory-continuity.service.ts`;
- `apps/api/src/routes/persona-context.test.ts`;
- `apps/web/components/studio/persona-management.tsx`;
- `apps/web/lib/persona-lifecycle-ui.ts`;
- graph types in `packages/types/src/persona.ts`.

Implement the smallest safe slice:

- when an owner updates a memory lifecycle row with a valid
  `supersededByMemoryItemId`, upsert a same-owner, same-persona
  `memory_item_edges` row representing that supersession;
- preserve the existing graph edge type vocabulary, especially `supersedes`;
- keep edge direction consistent with the existing route/test fixtures, or
  document and update the focused tests if the current direction is wrong;
- use lifecycle confidence/evidence only as bounded edge metadata, not raw
  private text dumping;
- keep the existing explicit `POST /memory/persona/:personaId/edges` route
  owner-scoped and covered by focused tests if coverage is missing;
- prove that `/memory/persona/:personaId/graph` returns the new edge after the
  lifecycle action;
- keep PR146's owner-facing relationship readback honest: relationship rows
  appear only when real edge rows exist.

If DAEDALUS finds that schema constraints, RLS, or the in-memory Supabase test
double prevent safe edge recording, return a precise block with the smallest
schema/test-double fix needed. Do not fall back to fake/generated edges.

## Privacy Requirements

Edges must remain authenticated and owner-scoped.

Do not expose:

- raw memory item ids in owner-facing UI;
- owner ids;
- persona ids;
- raw edge ids;
- raw source ids;
- raw URLs;
- raw prompts, completions, trace bodies, provider payloads, or private archive
  excerpts;
- tokens, cookies, API keys, passwords, bearer values, webhook secrets, DB URLs,
  or other secret-shaped values.

IDs may be used internally for route payloads, joins, and React keys, but visible
readback must use sanitized labels and bounded summaries.

## Non-Scope

Do not add:

- embedding/provider relationship inference;
- fuzzy or automatic graph generation from archive/import text;
- Redis/Upstash or Cloudflare graph/index work;
- background jobs or workers;
- public Memory graph surfaces;
- graph canvas/force-directed visualization;
- broad Persona Management redesign;
- import retry repair;
- context-preview latency optimization;
- billing/auth/session changes.

## Tests

Run focused validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If no web/UI code changes are required, DAEDALUS may explain why
`test:studio-ui` was not needed, but the API graph/lifecycle coverage must be
green.

## Review Focus

ARGUS should review:

- owner/persona scoping for lifecycle-created edges;
- same-owner validation for both endpoints;
- idempotent edge upsert behavior;
- no raw ids or private text leaking into owner-facing relationship readback;
- no claims that Station now infers semantic Memory relationships broadly.
