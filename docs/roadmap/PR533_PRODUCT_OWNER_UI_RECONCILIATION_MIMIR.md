# PR533 Product-Owner UI Reconciliation

**Owner:** MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4 -> ARGUS / A3 -> MIMIR / A1

**State:** `CLOSE_PR533_PRODUCT_OWNER_UI_RECONCILIATION_ACCEPTED`

**Source:** `f7027aff wake: hand off product-owner UI direction`

## Product Source Of Truth

Adam's commit `962fe8ca` is now present unchanged on both
`Discern-AI/Station` main and `Tex6298/Station` main. Treat it as the current
product-owner UI and interaction source of truth for the affected Station
hierarchy.

This lane does not reopen generic Discern parity. It accepts the coherent
hierarchy in `962fe8ca` and repairs it into the current Station product without
dropping capabilities built since the earlier Discern translation work.

## Accepted Direction

- Station and Discover share one public front door.
- Studio prioritizes companions and recent conversations.
- Memory, Integrity, Archive, publishing, and operational tools remain
  reachable through contextual companion controls or Settings.
- Public/private route boundaries, auth behavior, and backend contracts remain
  unchanged unless a defect is found and explicitly scoped.
- Existing PR525/PR528 evidence remains useful for unaffected contracts, but
  affected UI claims are stale where they expect the superseded composition.

## First Implementation Lane

DAEDALUS should begin with a bounded source audit and repair pass, not a broad
reskin.

Required first-pass work:

- inspect the code touched by `962fe8ca`, especially:
  - `apps/web/app/page.tsx`;
  - `apps/web/app/discover/page.tsx`;
  - `apps/web/app/studio/page.tsx`;
  - `apps/web/app/settings/page.tsx`;
  - `apps/web/components/studio/companion-quick-card.tsx`;
  - `apps/web/components/studio/studio-dashboard.tsx`;
  - `apps/web/components/studio/studio-sidebar.tsx`;
  - `apps/web/lib/use-studio-workspace.ts`;
  - `apps/web/lib/use-recent-conversations.ts`;
  - `apps/web/lib/studio-navigation.ts`;
- reconcile duplicate `useStudioWorkspace` loads and the three
  `useRecentConversations` consumers so a route does not multiply one
  conversation request per persona;
- verify quick-card click versus hover behavior, keyboard/focus behavior, and
  the mobile fallback below `900px`;
- prove relocated Memory, Integrity, Archive, Public Space, publishing, recent
  conversations, companion settings, and route-auth/privacy boundaries remain
  reachable;
- add focused interaction coverage for quick-card behavior, relocated
  capability reachability, loading/error truth, and request fanout where source
  assertions are currently insufficient.

## Guardrails

- Do not import broad Discern global CSS or reopen wholesale skin work.
- Do not restore the superseded Studio/dashboard composition only because older
  PR525/PR528 screenshots expected it.
- Do not remove accepted Station capabilities.
- Do not open backend, billing, Redis, Cloudflare, provider, or migration work
  unless the UI reconciliation exposes a concrete blocker.
- Keep implementation narrow enough for ARGUS source review and ARIADNE hosted
  human-eye rehearsal.

## Review And Rehearsal

ARGUS should review DAEDALUS against this boundary and the product-owner source
commit. If accepted, wake ARIADNE for hosted desktop/mobile and
System/Light/Dark rehearsal on the affected important routes.

ARIADNE should verify the experience as a human route rehearsal, including:

- `/` and `/discover` public front door behavior;
- signed-out and signed-in navigation;
- Studio dashboard and sidebar;
- companion quick-card on mouse, keyboard, and mobile fallback;
- Settings reachability for relocated tools;
- no missing route for Memory, Integrity, Archive, publishing, Public Space,
  recent conversations, and companion settings;
- no misleading loading/error state;
- no public/private auth or privacy regression.

## Closeout

PR533 is accepted and closed in
`docs/roadmap/PR533_PRODUCT_OWNER_UI_RECONCILIATION_CLOSEOUT_MIMIR.md`.
