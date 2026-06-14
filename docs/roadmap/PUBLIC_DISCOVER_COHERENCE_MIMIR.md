# Public Discover Coherence - MIMIR

Date: 2026-06-14
Owner: MIMIR / A1 conductor
Status: opened for DAEDALUS implementation

## Trigger

Marty found the real visual split:

- `/` has moved toward the intended Discern/Station public-front-door language.
- Signed-in `/discover` still falls back into a dark, card-stacked dashboard
  shell with a left account rail.
- That makes Station feel like two unrelated products rather than one public
  archive experience with private Studio behind sign-in.

This is the first concrete implementation slice from ARIADNE's ranked visual
coherence plan in `docs/roadmap/STAGING_HUMAN_ROUTE_REVIEW_ARIADNE.md`.

## Goal

Make `/discover` feel like the public feed continuation of `/`, not a generic
dashboard.

The desired direction:

- use the same public/editorial Station language as `/`;
- keep a light or off-white public canvas and calmer white public-content
  panels where that matches the front door;
- make public work, live projects, writing, and forums the primary hierarchy;
- make signed-in account context supportive, not dominant;
- preserve the public/private boundary language around search and Studio.

This is a visual and interaction-coherence slice only. It must not change
backend search, visibility, auth, billing, provider, feed, or database policy.

## Implementation Scope

Primary file:

- `apps/web/components/discover/discover-front-door.tsx`

Allowed only if needed:

- `apps/web/app/globals.css`
- `apps/web/components/discover/search-dropdown.tsx`

Do not touch:

- API routes or services;
- auth/session persistence;
- Supabase migrations;
- billing, Stripe, Railway, or provider config;
- package manager files or lockfiles;
- the already-upgraded `/` public home surface, except as a read-only pattern
  reference.

## UX Requirements

- `/discover` should read as the next public stop after `/`.
- Search, tabs, and feed controls must still be visibly actionable.
- The signed-in helper text must still explain that search may include
  community-visible results.
- Anonymous search must still read as public-only.
- Private Studio archive, memory, canon, import, and continuity material must
  remain excluded from public search copy and behavior.
- Routeable result behavior must not regress.
- Keep the public chain clear:
  - public work;
  - live projects;
  - forums;
  - Studio as the private continuation.
- Avoid nested-card dashboard composition.
- Avoid the current generic dark-card look as the dominant visual language.
- Mobile 390px width must not overflow or hide controls.

## Non-Goals

These are real, but not in this DAEDALUS slice:

- forum/category/thread public-surface polish after the badge fix;
- public Space/document/discussion redesign;
- Developer Space methodology and field-log storytelling;
- Studio Continuity/Archive narrative polish;
- auth refresh-token renewal;
- writing surface visual overhaul beyond the already accepted controls repair.

## Validation

Run the narrow validation needed for this slice:

```bash
npx --yes pnpm@10.32.1 exec tsx --test apps/web/components/discover/search-dropdown.test.ts
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
npx --yes pnpm@10.32.1 test:community
git diff --check
```

Browser review targets:

- `/discover` anonymous desktop;
- `/discover` anonymous mobile at 390px;
- `/discover` signed-in desktop;
- `/discover` signed-in mobile at 390px.

Acceptance notes:

- no horizontal overflow;
- tabs and search remain interactive;
- public/community search wording remains truthful;
- private Studio material remains excluded;
- visual language feels like a continuation of `/`;
- no backend/auth/visibility behavior changed.

## Handoff

After implementation, DAEDALUS should wake ARGUS first.

ARGUS should review:

- no backend/search/auth/visibility behavior changed;
- private search buckets remain excluded;
- route promises and tab/search behavior hold;
- validation ran;
- scope stayed inside this document.

If ARGUS accepts, wake ARIADNE for browser/product review before MIMIR closes
the visual-coherence lane.
