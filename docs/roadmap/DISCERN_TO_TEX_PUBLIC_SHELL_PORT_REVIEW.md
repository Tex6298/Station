# Discern-to-Tex public shell port review

Date: 2026-06-13
Owner: MIMIR

Status: review brief for an uncommitted local UX port. This is not accepted
implementation.

## Why This Exists

Marty asked for the new Station UX work from `Discern-AI/Station` to be brought
over thoughtfully into `Tex6298/Station`.

The backup wakeup agent applied a local code port instead of first documenting
the handoff instructions. MIMIR is preserving that local work for review, but it
must not be treated as accepted until ARIADNE, DAEDALUS, and ARGUS have worked
the normal path.

The target is Station-to-Station public shell and home UX parity only. This is
not an IntelHub lane, not a repo sync, not a backend lane, and not a wholesale
merge from Discern.

## Current Local Diff

The working tree currently contains an uncommitted port touching:

```text
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/components/nav/top-nav.tsx
apps/web/components/discover/feed-shared.ts
apps/web/components/discover/public-home.tsx
apps/web/components/discover/search-dropdown.tsx
apps/web/components/nav/left-rail.tsx
apps/web/lib/use-station-search.ts
```

Summary of the local port:

- `/` is switched from `DiscoverFrontDoor` to a copied/adapted `PublicHome`.
- `layout.tsx` loads Tabler icons from a CDN.
- `top-nav.tsx` moves to the Discern-style public link set and hides the global
  top nav under `/studio`.
- New public-home dependencies were copied: `LeftRail`, search dropdown,
  `useStationSearch`, and feed helpers.
- `globals.css` gets a large additive parity layer for the public shell, nav,
  left rail, cards, search, forum styling, and light Studio overrides.

## Review Risks

ARIADNE should treat these as open questions, not accepted facts:

- Does the new public home make Station clearer, or does it add fake/demo-heavy
  content that should be replaced with live data or quieter fallbacks?
- Does the left rail improve wayfinding on public surfaces, or does it crowd
  mobile/desktop in a way that conflicts with the staging demo path?
- Does hiding the global nav under `/studio` preserve Studio's private-workbench
  wayfinding?
- Is the Tabler CDN acceptable? MIMIR's default answer is no unless ARGUS later
  accepts it; DAEDALUS should prefer local assets or existing icon patterns.
- Does the broad CSS parity layer unintentionally restyle Studio, Billing,
  Archive, Forum, or Developer Space surfaces outside the approved public shell
  slice?
- Do public links, search result links, and fallback cards point only at routes
  Tex actually supports?
- Does the search dropdown respect Tex's public/private search split and avoid
  exposing private results to anonymous visitors?

## Required Agent Path

ARIADNE first:

- Review the local uncommitted diff as a product/interaction audit.
- Decide what should be kept, changed, or rejected.
- Do not accept the port merely because it came from Discern.
- Wake DAEDALUS with exact edits if the slice is worth salvaging.
- Wake MIMIR if the whole slice should be rejected or needs a product decision.

DAEDALUS second, only if ARIADNE keeps the slice:

- Sanitize the port into a Tex-native patch.
- Remove or replace the CDN icon dependency unless explicitly approved.
- Keep the scope to public shell/home/nav/search parity.
- Preserve Tex backend, Railway, auth/session, billing, provider, embedding, and
  migration behavior.
- Add focused UI/helper tests where behavior changes.

ARGUS third:

- Confirm protected areas stayed untouched.
- Review route/auth/search privacy boundaries.
- Check that broad CSS did not regress Studio/mobile/demo surfaces.
- Validate the selected test set.

ARIADNE final:

- Browser-check the deployed public shell/home path before MIMIR treats it as
  demo-ready.

## Hard Bounds

Do not import through this lane:

```text
apps/api/**
packages/ai/**
packages/config/**
packages/db/**
infra/supabase/**
package.json
pnpm-lock.yaml
.env.example
railway.json
infra/railway/**
Stripe/billing backend
storage backend
token-credit backend
model/provider/embedding config
auth/session semantics
```

Do not broaden into:

```text
IntelHub
IntelHub-Staging
developer-space backend work
notes/global archive backend
rich editor dependency work
repo merge/rebase/sync
```

## Acceptance

This port can be accepted only if:

1. ARIADNE says the public shell/home direction improves Station.
2. DAEDALUS converts the local diff into a narrow, Tex-native patch.
3. ARGUS accepts the protected boundary and privacy/search behavior.
4. ARIADNE browser-verifies the deployed surface.
5. MIMIR records the result in `ACTIVE_STATUS.md`.
