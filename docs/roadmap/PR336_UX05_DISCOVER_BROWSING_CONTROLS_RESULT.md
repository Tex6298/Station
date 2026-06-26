# PR336 - UX-05 Discover Browsing Controls Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

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
- Curated rows with unsafe non-local `href` values are dropped client-side.
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

## Review Requests

ARGUS should review:

- Whether the client-side filters preserve the existing public/community-safe
  boundary by filtering only already-returned feed items.
- Whether curated staff-pick normalization is route-safe enough for public
  Space, persona, document, forum, and Developer Space rows.
- Whether `/writing` Staff picks being disabled is the right small fix for the
  exact hosted complaint cluster.

ARIADNE should run a hosted desktop/mobile `/discover` rehearsal after ARGUS
accepts and the patch deploys.
