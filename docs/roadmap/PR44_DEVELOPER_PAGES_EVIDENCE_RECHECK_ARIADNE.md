# PR44 Developer Pages Evidence Recheck - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Pass; PR43 can close as deployed staging complete

## Runtime Checked

- Web route:
  `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
- Web/API deployment identity:
  `734c118c6c2ce3cd6abedf7610aa4b133ed71095`
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`
- Account role: anonymous visitor

No credentials, cookies, tokens, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## API Readback

Anonymous public API read passed:

- access: `public`
- linked public documents: `3`
- roles: `methodology`, `finding`, `field_log`
- document types: `research`, `research`, `field_log`
- titles:
  - `Station Replay Dev Alpha Methodology`
  - `Station Replay Dev Alpha Milestone`
  - `Station Replay Dev Alpha Field Log`

## Browser Recheck

Desktop passed:

- no document-level horizontal overflow (`1350` scroll width / `1350` client
  width);
- route loaded without not-found, loading, or hard-error state;
- `Project evidence` appears before `Live visualisation` by DOM order and text
  order;
- evidence cards read in the intended order:
  `Methodology / architecture`, `Finding / milestone`,
  `Field log / update`;
- each evidence card shows role, document type, published date, title,
  role-purpose copy, excerpt, and the in-page/no-separate-route note;
- the evidence section has no links, buttons, or dead controls;
- the old `Project notes` side-widget heading is absent;
- `Live visualisation`, `Event stream`, `How to read this`, `Current nodes`,
  and `Latest snapshot` remain visible after the evidence path.

Mobile passed at `390x844`:

- no document-level horizontal overflow (`390` scroll width / `390` client
  width);
- no visible controls render offscreen;
- the same evidence order, metadata, excerpts, and boundary copy remain visible;
- the live observatory panels remain legible enough for protected-alpha staging.

## Boundary And Overclaim Check

Public/private boundary copy remains visible with `Visitors do not see` language.

No blocker was found for overclaiming Tier 2 hosting, developer agents,
DexOS-specific widgets, public interaction modes, Cloudflare, route/table
rename, Project abstraction, tipping, or production depth.

The page does mention `DexOS` and hosted runtime only inside negative staging
evidence copy that says the demo does not claim those scopes. ARIADNE treats
that as acceptable boundary language, not an overclaim.

## Human-Eye Verdict

The page now reads as a visitor reading path first and a live observatory second.
That is the right order for this Phase 2A proof: an anonymous visitor can read
what the page is trying to prove before interpreting the live node/signal/
snapshot grid.

The copy is still appropriately cautious. It describes public-safe evidence and
live signals without pretending the Developer Page is already a hosted runtime,
developer-agent console, Cloudflare edge product, or production-depth project
site.

## Caveats

- This is still Phase 2A / Tier 1 showcase-window evidence.
- The evidence documents are synthetic public-safe staging notes.
- PR44 did not validate Cloudflare, Tier 2 hosting, developer agents, public
  interaction modes, route/table renames, live DDL, tipping, or broader
  Developer Space architecture.

## Recommendation

MIMIR can close PR43 as complete for deployed staging.

Recommended next lane:

- keep Developer Pages work narrow and choose either a second public-safe
  Developer Page example or a small readability pass on the evidence cards after
  another real page exists.

Do not move into Cloudflare or Tier 2 hosting from this result; PR44 found no
concrete retrieval, latency, public-edge delivery, or NESTstyle-memory defect.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Anonymous public API read:
  `https://stationapi-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
- Chrome/CDP anonymous desktop route check at `1365x900`
- Chrome/CDP anonymous mobile route check at `390x844`
- Temporary local probe script was removed before commit.
