# PR336 - UX-05 Discover Browsing Controls Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS after narrow route-safety patch

## Result

DAEDALUS implemented the smallest safe no-new-config Discover browsing controls
slice.

Changed routes/components:

- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/writing/writing-index.tsx`
- `apps/web/lib/discover-feed-controls.ts`
- `apps/web/lib/writing-feed.test.ts`
- `apps/web/app/globals.css`

## What Changed

- `/discover` now has a functional feed filter row over the already-loaded
  public/community-safe feed data:
  - `All`
  - `Essay`
  - `Codex`
  - `Manifesto`
  - `Research`
  - `Field Log`
  - `Theory`
  - `Forum`
  - `Developer Spaces`
- Filter buttons update visible feed cards, expose per-filter counts, and show
  an honest empty state plus `Show all` recovery when the selected filter has no
  loaded matches.
- The `/discover` feed tab labels now better match the actual browsing model:
  `Latest`, `Rising`, and `Staff picks`.
- Curated `/discover/feed?tab=featured` rows are normalized into routeable feed
  cards before rendering, including routeable public Space/persona/staff-pick
  rows when the backend returns them.
- Curated rows with unsafe non-local `href` values or mismatched local route
  families are dropped client-side.
- The exact `Latest / Featured / Staff picks` writing control cluster lives in
  `/writing` on current main, not `/discover`; the unsupported `Staff picks`
  writing tab is now disabled/preview-only instead of behaving like a live empty
  tab.
- The touched Discover avatar renderer no longer uses raw `<img>`, clearing the
  previous lint warning.

## Boundary

This patch only filters and normalizes data that the existing Discover API has
already returned to the current viewer.

It does not change:

- Discover API visibility rules.
- Public/community/private permissions.
- Search result grouping or route safety.
- Forum, public Space, Developer Space, billing, onboarding, auth, schema,
  migrations, provider/model, Redis, Cloudflare, queue, worker, deploy, or key
  behavior.
- Anonymous chat, durable visitor transcripts, public launch, commercial
  readiness, or partner claims.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Notes:

- `test:writing` now covers Discover filter matching/counts/status copy and
  curated staff-pick normalization.
- `test:community` preserves public-safe Discover/search coverage.
- `test:developer-spaces` preserves public Developer Space feed/readback
  coverage.
- `lint` passed with no warnings after removing the touched Discover raw image.
- `git diff --check` passed with CRLF normalization notices only.

## ARGUS Review

Date reviewed: 2026-06-26

Verdict:

```text
PASS AFTER NARROW ROUTE-SAFETY PATCH
```

ARGUS accepts PR336 after one review patch. The implementation matches the
UX-05 lane:

- `/discover` filters only the already-loaded feed cards returned by the
  existing Discover API.
- Per-filter counts and empty states do not claim additional backend search or
  broader recommendation behavior.
- Curated staff-pick rows are normalized into routeable cards before rendering.
- `/writing` disables the unsupported `Staff picks` tab instead of presenting a
  live empty control.
- No API visibility rule, search grouping, auth, schema, migration, forum,
  Space, Developer Space, billing, onboarding, provider/model, Redis,
  Cloudflare, queue, worker, deploy, key, anonymous chat, public launch,
  commercial, or partner behavior changed.

ARGUS found and fixed one route-safety gap: curated rows were limited to local
hrefs, but not to the expected route family for their item type. The accepted
normalizer now drops staff-pick rows whose local href does not match the
declared type, such as a `space` row pointing at `/settings`. ARGUS also made
the Discover avatar CSS background URL use string escaping after the raw
`<img>` replacement.

ARGUS validation rerun:

- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed with 20 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 31 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with
  47 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with no warnings.
- `git diff --check` passed with CRLF normalization notices only.

ARIADNE should run a hosted desktop/mobile `/discover` rehearsal after ARGUS
accepts and the patch deploys.
