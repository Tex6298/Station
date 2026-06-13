# Discern public shell browser review - ARIADNE

Date: 2026-06-13

Owner: ARIADNE, A4 UX Navigator

## Verdict

ARIADNE accepts `DISCERN-PUBLIC-SHELL-CLEANUP-01` as product/visual-ready for
the current public shell parity lane.

The cleaned `/` surface is intentionally quieter than the raw Discern port, but
it keeps the important Station public-home character:

- a clear public front door instead of dropping visitors directly into raw
  Discover;
- grouped public surfaces for Developer Spaces, publications, public Spaces, and
  community discussion;
- calmer Station identity and language tied to AI companions, personas, public
  work, and live experiments;
- public-only search with an explicit privacy boundary;
- a more polished first impression than the previous `/` route.

No DAEDALUS parity-restoration patch is needed from this pass.

## Browser Review

Local route:

- `http://localhost:3104/`

Runtime setup:

- Local Next dev server with `NEXT_PUBLIC_API_URL` pointed at the Railway staging
  API, so the public feed reflected current staging public data.
- Chrome headless through DevTools Protocol.
- Viewports checked: desktop `1366x900` and mobile `390x844`.

Desktop result:

- The first viewport reads as a public Station home, not a generic SaaS landing
  page.
- The hero, public-search boundary card, search control, surface cards, and feed
  sections form a coherent public shell.
- The page is calmer and less raw than `/discover`, while `/discover` remains
  available as the feed route.

Mobile result:

- At 390px, `innerWidth` and `documentElement.scrollWidth` both measured `390`.
- No elements extended past the viewport in the settled CDP layout check.
- Nav, hero, buttons, public-search boundary copy, and search control fit.
- The page remains usable without horizontal scrolling.

Search/privacy result:

- The public home search hook calls `/discover/search` without an auth token.
- The dropdown renders only routeable public buckets: Developer Spaces, Spaces,
  Publications, and Forum.
- Private owner buckets are not included in the public-home UI.
- Documents without a routeable Space slug are dropped from the dropdown.
- Live staging API search returned public-safe results; no owner-private archive,
  memory, canon, import, or continuity buckets are surfaced by the public home.

## Product Notes

Accepted tradeoff:

- Removing the copied fake cards, CDN icon layer, anonymous protected rail, and
  broad global restyling made the page quieter than the Discern source, but that
  is the right tradeoff for Tex. The page still carries the public Station shape
  without pretending seed/fallback content is real.

Future polish, not a blocker:

- A later lane can add first-party icons, richer public Space cards, and more
  editorial treatment once live public content exists.
- Do not reopen this cleanup just to reintroduce copied Discern artifacts or
  fake live activity.

## Validation

- `npx --yes pnpm@10.32.1 exec tsx --test apps/web/components/discover/search-dropdown.test.ts`
- `npx --yes pnpm@10.32.1 --filter @station/web typecheck`
- Local web `/health` on port 3104.
- Local Chrome/CDP desktop render at `1366x900`.
- Local Chrome/CDP mobile render at `390x844`.
- Live staging API `/discover/feed?tab=new&limit=30`.
- Live staging API `/discover/search?q=Station`.

No screenshots, raw response bodies, raw IDs, credentials, cookies, tokens, or
private replay corpus text were committed.
