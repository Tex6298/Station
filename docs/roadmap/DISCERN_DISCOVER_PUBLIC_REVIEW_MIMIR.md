# Discern Discover/Public Direction Review - MIMIR

Date: 2026-06-13
Owner: MIMIR / A1
Next reviewer: ARIADNE / A4

## Status

DISCERN-ENTRY-ONBOARDING-COPY-01 is accepted by ARGUS and ARIADNE. The next
Discern-to-Tex UX candidate is the Discover/public-home/search direction.

This is a review lane, not an implementation lane. DAEDALUS should not port
Discern code until ARIADNE chooses one bounded slice and MIMIR opens it.

## Source Truth

Tex base:

```text
fork/main @ cdc43dd913a33992aa9844f9a88e37e0ffa90937
```

Discern source:

```text
origin/main @ 037d491d58f87170b6eb82dfef085215da9ac355
```

The prior audit remains current: Discern has not moved beyond `037d491` since
`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md`.

## Why This Is Next

The public shell and entry/onboarding copy are now accepted. The remaining
product-worthy Discern UI clue is how Discover/public home/search might feel
less like a generic feed and more like Station's public directory of:

- public Spaces;
- Developer Space observatories;
- published documents;
- forum discussion;
- public-safe search.

The useful part is the information architecture and density. The risky part is
Discern's broad surface drift: fake fallback content, left-rail route promises,
Tabler icon class dependencies, broad global CSS, search semantics, and protected
backend/config deletions elsewhere in the branch.

## Review Surfaces

ARIADNE should compare current Tex against Discern only as product reference:

```text
apps/web/app/discover/page.tsx
apps/web/components/discover/discover-front-door.tsx
apps/web/components/discover/discover-home.tsx
apps/web/components/discover/discover-page.tsx
apps/web/components/discover/public-home.tsx
apps/web/components/discover/search-dropdown.tsx
apps/web/lib/use-station-search.ts
apps/web/components/nav/top-nav.tsx
apps/web/components/nav/left-rail.tsx
apps/web/app/globals.css
```

## Guardrails

Do not import or request:

- fake Discern fallback/demo people, projects, scores, or claims as live data;
- protected backend, package, Railway, Supabase, Stripe, Redis, model, embedding,
  migration, health, readiness, reset-password, or replay changes;
- route promises Tex does not keep;
- private archive, memory, canon, import, continuity, or owner search results in
  public search;
- broad `globals.css` rewrites;
- new dependencies or icon packages;
- generic social-feed language;
- a left rail unless route existence, public/private placement, and mobile fit
  are explicitly accepted first.

## ARIADNE Decision Needed

Choose exactly one of these outcomes:

1. Park the Discover/public-home direction because current Tex is good enough
   after the public shell cleanup.
2. Open a narrow `/discover` directory page slice.
3. Open a narrow public search/dropdown clarity slice.
4. Open a narrow public-home section ordering/density slice.
5. Open a navigation/search IA review only, with no implementation yet.

If implementation should proceed, ARIADNE must wake DAEDALUS with:

- one ticket name;
- exact file allow-list;
- intended UX parity target;
- forbidden changes;
- validation list;
- the next wakeup target after DAEDALUS.

If implementation should not proceed, ARIADNE must wake MIMIR with the product
reason and next recommended lane.

Do not go quiet without a wakeup.
