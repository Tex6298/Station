# PR405 - Search/Retrieval Explainability and Depth

Owner: DAEDALUS  
Opened by: MIMIR  
Status: OPEN

## Why This Lane

PR404 accepted the onboarding Migrator/API Bridge behavior after hosted
human-eye rehearsal. The next useful launch-core gap is not another onboarding
loop and not another Discover-controls pass.

The remaining search/retrieval product gap is clarity and depth:

- users need to understand what search surface they are on;
- results need visible provenance and scope boundaries;
- private owner retrieval must stay separate from public/community search;
- Developer Space/search depth should be inspected against the current code;
- any next implementation should be small enough to review safely.

Basic Discover filters/search routeability and owner Memory/Archive/Continuity
search have already been accepted. Do not rebuild them.

## Current Accepted Baseline

- Public Discover browsing/filter controls have passed hosted rehearsal.
- Owner Memory, Archive, Continuity, Global Archive search, runtime readback,
  and Settings AI Activity route have already passed their current closeout.
- PR403/PR404 accepted state-aware onboarding guidance for Document Migrator
  and API Bridge.
- Search/retrieval remains reopened at product depth level: explainability,
  result provenance, Developer Space search/readback, and visibility-safe
  result contracts.

## Task

Inspect current public/community/private search and retrieval surfaces, then
implement the smallest safe search-depth or explainability slice if one is
obvious.

Start with:

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/archive-retrieval.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/public-home.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/lib/use-station-search.ts`
- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/lib/memory-lifecycle-ui.ts`

Preferred work, if supported by the current code shape:

- add clearer result provenance/scope readback where search already works;
- strengthen tests proving public/community results do not leak owner-private
  buckets;
- clarify private owner search surfaces without changing their data contract;
- add a small Developer Space search/readback improvement if the existing model
  already supports it.

If no safe implementation slice is obvious, produce an exact implementation
packet for MIMIR instead of forcing a broad search rewrite.

## Non-Goals

- No provider/model/embedding changes.
- No Gemini/OpenAI/NVIDIA configuration or adapter work.
- No Redis, Upstash, Valkey, Cloudflare, vector backend, or schema migration.
- No ranking rewrite unless it is a tiny helper with tests.
- No auth/session, billing, Stripe, deployment, or connector work.
- No broad Discover redesign.
- No public exposure of owner-private search buckets.

## Validation Guidance

Run the narrowest relevant set, preferring:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/discover/search-dropdown.test.ts
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

Also run any touched-route tests. If private archive/search changes, include
`test:storage`. If runtime retrieval changes, include the relevant persona
context/conversation archive tests. If Developer Space APIs change, include
`test:developer-spaces`.

## Handoff

If code changes land, wake ARGUS with a hostile visibility/scoping review.

If this is map-only or blocked by a backend/vector/provider/cache decision, wake
MIMIR with an exact next packet.

Do not go idle without a wakeup commit.
