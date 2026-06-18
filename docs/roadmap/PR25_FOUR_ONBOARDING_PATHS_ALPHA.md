# PR25 - Four Onboarding Paths Alpha

Date: 2026-06-18
Status: implemented by A2 / DAEDALUS; ready for ARGUS review
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses if visible route
truth changes.

## Purpose

Move Station from "launch-core sufficient for protected-alpha replay" toward
the documented onboarding promise without pretending unfinished paths are live.

The user-facing promise is four entry paths into Station:

1. Fresh Start.
2. Awakening.
3. Document Migrator.
4. API Bridge.

This lane should make those paths visible, honest, and routeable for alpha
testing. A path may be narrow, but it must not be fake. If a path cannot be
made live in this slice, show it as clearly unavailable/deferred and do not
render live-looking controls.

## Scope

### Fresh Start

- Provide a clear path from signed-in entry or Studio empty state into creating
  a blank private persona.
- After creation, land the owner on a real persona workspace route.
- Preserve current auth/session and owner scoping.

### Awakening

- Provide a guided path for starting a persona with reflective/setup context.
- Reuse existing persona, memory, continuity, and integrity surfaces where
  possible.
- If the path starts an integrity session, prove it through existing integrity
  APIs and tests.
- If the first alpha version is a route map rather than a full wizard, make the
  UI copy clear and keep every action real.

### Document Migrator

- Provide a clear path for adding source material into an owned private archive.
- Prefer existing paste/upload/import review flows over new ingestion systems.
- Land the owner where they can see import status, failure messages, and
  candidate review outcomes.
- Do not imply live Reddit/Discord OAuth pulls, recurring sync, or external API
  import if this slice only supports uploaded/pasted material.

### API Bridge

- Determine whether the current Developer Space ingestion setup can honestly
  serve as the alpha API Bridge.
- If yes, route the user to Developer Space setup with ingestion-key guidance
  and a concrete sample event path.
- If no, mark API Bridge as deferred/preview-only with disabled controls and an
  exact reason.
- Do not introduce Cloudflare retrieval, Redis memory truth, provider
  marketplace work, or production worker infrastructure in this lane.

## Product Rules

- No fake live controls.
- No hidden placeholder buttons that appear tappable.
- No broad visual redesign.
- No provider/model configuration changes.
- No Redis/Valkey/Upstash or Cloudflare implementation work.
- No Stripe/billing expansion.
- Keep private archive, memory, canon, continuity, and import results
  owner-scoped.
- Keep public surfaces public-safe.

## Suggested Implementation Shape

DAEDALUS should inspect existing routes before deciding the least invasive
shape. Likely acceptable paths:

- an onboarding chooser reachable from Studio empty state and/or signed-in
  account entry;
- four route cards with exact status labels;
- real links or disabled/deferred controls only;
- reuse of existing create-persona, integrity, archive import, import review,
  and Developer Space setup pages;
- small helper tests that prove the route/status map.

Avoid a large new wizard unless the current codebase already has a natural
pattern for it.

## Required Validation

Run the narrow gates touched by the implementation:

```bash
pnpm typecheck
pnpm test:auth
pnpm test:studio-ui
pnpm test:storage
pnpm test:conversation-archive
pnpm test:integrity
pnpm test:developer-spaces
git diff --check
```

If a listed test script does not exist, record that fact in the handoff instead
of pretending it ran.

## ARGUS Review Ask

ARGUS should hostile-review:

- whether each of the four paths is either genuinely live or clearly deferred;
- route correctness for signed-in and signed-out users;
- owner scoping for private archive/import/memory/continuity surfaces;
- absence of fake buttons and placebo filters;
- mobile 375px layout coherence;
- whether API Bridge claims match actual Developer Space capability.

If visible route flow changed materially, ARGUS should wake ARIADNE for a
human-eye rehearsal before waking MIMIR.

## Wake Discipline

DAEDALUS should not go quiet after implementation.

When done, wake ARGUS with:

- exact routes changed;
- path-by-path status: live, alpha live, or deferred;
- validation commands and results;
- any missing script names or caveats.

If blocked, wake MIMIR with the smallest exact blocker and the recommended next
move.

## DAEDALUS Implementation Package

Run date: 2026-06-18

Result: implemented as a narrow alpha route map and honest entry surface. No
new ingestion system, billing change, provider routing, Redis/Cloudflare work,
or production worker lane was added.

Routes changed:

- `GET /studio/onboarding`: new signed-in Studio route exposing the four entry
  paths with status labels, real route targets, supporting route notes, and
  current alpha boundaries.
- `GET /studio/new?path=fresh-start`: routes to the existing persona creation
  flow with Fresh Start copy; after creation, lands on
  `/studio/personas/<persona-id>`.
- `GET /studio/new?path=awakening`: routes to the existing guided creation
  flow; after creation, lands on `/studio/personas/<persona-id>`.
- `GET /studio/new?path=document-migrator`: creates the prerequisite
  owner-scoped persona, then lands on
  `/studio/personas/<persona-id>/files`.
- `GET /developer-spaces`: remains the API Bridge entry point; owner manage
  routes already expose ingestion-key generation and concrete node/event/snapshot
  sample calls.
- Studio dashboard/sidebar/mobile nav now link to `/studio/onboarding`.

Path status:

| Path | Status | Route target | Notes |
| --- | --- | --- | --- |
| Fresh Start | Live | `/studio/new?path=fresh-start` | Uses the existing private persona creation API path and lands on the real workspace. |
| Awakening | Live | `/studio/new?path=awakening` | Uses the existing guided setup fields; integrity and memory remain real follow-on routes after creation. |
| Document Migrator | Alpha live | Existing persona: `/studio/personas/<persona-id>/files`; no persona: `/studio/new?path=document-migrator` | Supports owner-scoped pasted/uploaded archive material, import status, failures, and candidate review. It does not claim live Reddit/Discord OAuth, recurring sync, or external social API pulls. |
| API Bridge | Alpha live | `/developer-spaces` and `/developer-spaces/<slug>/manage` | Current Developer Space ingestion honestly serves as the alpha bridge with ingestion keys and sample event paths. It does not add Cloudflare retrieval, Redis memory truth, provider marketplace work, or production workers. |

Implementation notes:

- Added `apps/web/lib/onboarding-paths.ts` and tests to keep the four path
  statuses, routes, and caveats stable.
- Replaced the dashboard's fake-looking recent archive activity rows with real
  route prompts to onboarding, archive, and export surfaces.
- Added `apps/web/lib/onboarding-paths.test.ts` to `pnpm test:studio-ui`.

Validation:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass, 13 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 21 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass, 16 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 27 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:integrity` | Pass, 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, 7 tests. |

Remaining pre-handoff check: `git diff --check`.
