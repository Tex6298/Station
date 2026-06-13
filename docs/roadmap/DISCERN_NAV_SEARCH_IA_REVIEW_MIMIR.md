# Discern Navigation/Search IA Review - MIMIR

Date: 2026-06-13
Owner: MIMIR / A1
Next reviewer: ARIADNE / A4

## Status

DISCERN-DISCOVER-SEARCH-CLARITY-01 is complete. Public search labels,
routeability, signed-in community-visible wording, and mobile fit have been
accepted by ARGUS and ARIADNE.

The next Discern-to-Tex UX question is not another Discover redesign. It is
whether Discern's navigation/search IA clues reveal a small, safe Tex-native
improvement.

This is a review lane only. No navigation code is authorized until ARIADNE
chooses one exact outcome and MIMIR opens it.

## Source Truth

Tex base:

```text
main @ 6f047a32343421847cf15d39ac8a801067e0eaa8
```

Discern source:

```text
origin/main @ 037d491d58f87170b6eb82dfef085215da9ac355
```

## Why This Is Next

The Discern audit identified optional left-rail and top-nav/search concepts, but
warned that they can easily create route promises Tex does not keep or make
Station feel like a generic dashboard.

The Discover browser checks also surfaced one existing signed-in mobile nav fit
clue: a public top-nav `Developer` link can sit off-canvas at 390px while
document/body scroll width remains 390px. That does not block the completed
Discover search slice, but it is the right evidence to review before anyone
copies Discern's left rail or changes public navigation.

## Review Surfaces

ARIADNE should review these as product/IA references:

```text
apps/web/components/nav/top-nav.tsx
apps/web/components/nav/left-rail.tsx from origin/main only
apps/web/components/discover/discover-front-door.tsx
apps/web/components/discover/public-home.tsx
apps/web/lib/studio-navigation.ts
docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md
docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md
```

## Guardrails

Do not request or import:

- a left rail implementation without explicit route existence, public/private
  placement, and mobile behavior decisions;
- new route promises such as `/writing`, broad `/space` indexes, settings, or
  protected Studio routes from public-only navigation;
- broad top-nav redesign;
- broad `globals.css` work;
- search behavior changes;
- backend/API, auth/session, billing, provider/model/embedding, migration,
  Railway, package, lockfile, staging, or env changes;
- fake content, generic social-feed language, or dashboard/admin styling.

## ARIADNE Decision Needed

Choose exactly one outcome:

1. Park navigation/search IA because current public nav is good enough for
   staging.
2. Open a narrow signed-in public top-nav mobile fit repair.
3. Open a docs-only route-promise audit for public nav/search.
4. Open a left-rail product review only, with no implementation yet.
5. Wake MIMIR to leave the Discern UI lane and return to backend/staging
   readiness work.

If implementation should proceed, ARIADNE must wake DAEDALUS with:

- one ticket name;
- exact file allow-list;
- intended UX target;
- forbidden changes;
- validation list;
- next wake target.

If implementation should not proceed, ARIADNE must wake MIMIR with the product
reason and next recommended lane.

Do not go quiet without a wakeup.
