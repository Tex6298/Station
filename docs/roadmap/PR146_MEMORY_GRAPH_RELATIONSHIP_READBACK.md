# PR146 - Memory Graph Relationship Readback

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior after ARGUS technical acceptance.
Status: accepted by ARIADNE on 2026-06-21; ready for MIMIR closeout

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

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

- Reused the existing authenticated owner-scoped Memory graph route; no API
  shape change was needed.
- Added helper-level relationship readback that maps graph edges to node labels
  without rendering raw memory ids, edge ids, persona ids, or source ids.
- Added a compact Relationships section under the existing Persona Management
  Memory Graph counts and node list.
- Relationship rows show source memory label, target memory label, relationship
  type, confidence, and sanitized note when available.
- Empty/thin states remain explicit when nodes or edges are absent, and dangling
  edges use missing-source/missing-target copy instead of leaking ids.
- Display helpers redact prompt-shaped text, UUIDs, raw URLs, bearer/token/key/
  password/webhook/DB URL-shaped values, private id markers, and common
  secret-shaped strings.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 96 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 7
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, collected page data, generated 36 static pages, finalized
  optimization, and collected build traces before the known local Windows
  standalone symlink `EPERM` while copying traced files.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Technical Review

Technically accepted on 2026-06-21 after a narrow review patch.

ARGUS findings:

- The graph readback remains on the existing authenticated owner-scoped
  `/memory/persona/:personaId/graph` route. No graph API shape, automatic edge
  generation, public graph surface, provider/embedding, Redis/Cloudflare,
  background job, Memory mutation, billing/auth/session, navigation, or ledger
  work changed.
- Relationship rows are honest bounded readback over existing owner graph
  edges. Dangling edges show missing-source/missing-target copy instead of raw
  ids or invented nodes.
- ARGUS tightened web display privacy so the existing node list now uses the
  same sanitized readback path as relationships. Spaced prompt labels such as
  `system prompt`, spaced secret labels such as `api key`/`database url`,
  PostgreSQL-style DB URLs, relationship type labels, and long row text are
  handled defensively.
- The compact Persona Management layout now wraps long sanitized node,
  relationship, pill, and note text.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-lifecycle-ui.test.ts`
  passed with 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 97 tests,
  including ARGUS node-list and spaced prompt/secret/DB URL regressions.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 7
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, collected page data, generated 36 static pages, finalized
  optimization, and collected build traces before the known local Windows
  standalone symlink `EPERM` while copying traced files. Existing raw `<img>`
  warnings appeared.
- `git diff --check` passed with CRLF normalization warnings only.

Because PR146 changes visible Persona Management behavior, ARGUS wakes ARIADNE
for `/studio/personas/:personaId/manage` route rehearsal before MIMIR closeout.

## ARIADNE Visible-Route Rehearsal

Accepted on 2026-06-21.

Route note: ARGUS named `/studio/personas/:personaId/manage`, but the current
repo route for Persona Management is `/studio/personas/:personaId/edit`; no
`manage/page.tsx` route exists under `apps/web/app/studio/personas/[personaId]`.
ARIADNE rehearsed the actual owner-visible Persona Management route.

ARIADNE result:

- Rehearsed `/studio/personas/:personaId/edit` with deterministic owner API
  responses for the persona, architecture, integrity history, and
  `/memory/persona/:personaId/graph`.
- Desktop coverage confirmed Memory Graph counts, node list, relationship
  readback, dangling-edge/missing-node copy, and no-edge/no-node/thin states.
- 390px mobile coverage confirmed the compact Memory Graph section remained
  readable without document-level horizontal overflow.
- The readback rendered only sanitized node labels, relationship labels,
  confidence, and bounded notes; raw-looking memory ids, edge ids, persona ids,
  source ids, prompts, URLs, bearer/token/key/password/webhook/DB URL values,
  secret-shaped values, provider payload markers, and unsafe graph text did not
  appear.
- No graph canvas, automatic relationship generation, public graph surface, or
  broad Persona Management redesign appeared.

ARIADNE validation:

- `npx --yes @playwright/test@1.41.2 test tmp-pr146-ariadne-memory-graph-rehearsal.spec.js --reporter=line --workers=1`
  passed with 3 tests after setting the auth cookie at the Playwright context
  level; the local Next server logged direct `GET
  /studio/personas/persona-pr146-private-id/edit 200` route hits.
