# PR46 Developer Pages Second Example Recheck - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Pass; PR45 can close as deployed staging complete

## Runtime Checked

- Web/API deployment identity:
  `734c118c6c2ce3cd6abedf7610aa4b133ed71095`
- Public routes:
  - `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
  - `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab`
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`
- Account role: anonymous visitor

No credentials, cookies, tokens, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## API Readback

Anonymous public API read passed for both routes:

| Slug | Access | Evidence | Roles | Document types | Nodes | Events |
| --- | --- | ---: | --- | --- | ---: | ---: |
| `station-replay-dev-alpha` | `public` | 3 | `methodology`, `finding`, `field_log` | `research`, `research`, `field_log` | 1 | 1 |
| `animus-field-lab` | `public` | 3 | `methodology`, `finding`, `field_log` | `research`, `research`, `field_log` | 1 | 1 |

## Browser Recheck

`station-replay-dev-alpha` passed:

- desktop has no document-level horizontal overflow (`1350` scroll width /
  `1350` client width);
- mobile has no document-level horizontal overflow (`390` scroll width / `390`
  client width);
- no visible controls render offscreen;
- route loaded without not-found, loading, or hard-error state;
- `Project evidence` appears before `Live visualisation` by DOM order and text
  order;
- evidence cards read in the intended order:
  `Methodology / architecture`, `Finding / milestone`,
  `Field log / update`;
- cards show role, document type, published date, title, role-purpose copy,
  excerpt, and the in-page/no-separate-route note;
- the evidence section has no links, buttons, or dead controls;
- no duplicate `Project notes` side-widget heading is visible;
- `Live visualisation`, `Event stream`, `How to read this`, `Current nodes`,
  and `Latest snapshot` remain visible after the evidence path.

`animus-field-lab` passed:

- desktop has no document-level horizontal overflow (`1350` scroll width /
  `1350` client width);
- mobile has no document-level horizontal overflow (`390` scroll width / `390`
  client width);
- no visible controls render offscreen;
- route loaded without not-found, loading, or hard-error state;
- `Project evidence` appears before `Live visualisation` by DOM order and text
  order;
- evidence cards read in the intended order:
  `Methodology / architecture`, `Finding / milestone`,
  `Field log / update`;
- cards show role, document type, published date, title, role-purpose copy,
  excerpt, and the in-page/no-separate-route note;
- the evidence section has no links, buttons, or dead controls;
- no duplicate `Project notes` side-widget heading is visible;
- `Live visualisation`, `Event stream`, `How to read this`, `Current nodes`,
  and `Latest snapshot` remain visible after the evidence path.

## Second Example Distinctness

`animus-field-lab` is distinct enough to prove the pattern is not overfit to
`station-replay-dev-alpha`.

The second page has its own page title, evidence titles, and excerpts:

- `Animus Field Lab Methodology`
- `Animus Field Lab Finding`
- `Animus Field Lab Field Log`

Its evidence copy frames a second Developer Page example and a
timeline-oriented observatory instead of repeating the replay-page labels. The
page still uses the same public-safe reading path and live observatory pattern,
which is the right proof for PR45.

## Boundary And Overclaim Check

Public/private boundary copy remains visible on both pages with `Visitors do
not see` language.

No blocker was found for overclaiming real DexOS onboarding, hosted runtime,
developer agents, public interaction modes, Cloudflare, route/table rename,
Project abstraction, tipping, or production depth.

Both pages mention out-of-scope concepts only as negative boundary language:

- `station-replay-dev-alpha` says the demo does not claim hosted runtime or
  DexOS onboarding.
- `animus-field-lab` says the page is demo evidence only, not a hosted runtime
  or production project; its field-log excerpt also negates DexOS onboarding.

ARIADNE treats those as acceptable boundary statements, not overclaims.

## Human-Eye Verdict

The two pages now prove the Developer Page pattern better together than the
single replay page did alone. A visitor can read methodology, finding, and
field-log evidence first, then compare that evidence against the live
visualisation, event stream, current node, and latest snapshot.

This is still a protected-alpha proof, but it feels like a deliberate public
observatory pattern rather than a one-off dashboard.

## Caveats

- This is still Phase 2A / Tier 1 showcase-window evidence.
- Both examples use synthetic public-safe staging notes.
- PR46 did not validate Cloudflare, Tier 2 hosting, developer agents, public
  interaction modes, route/table renames, live DDL, tipping, or broader
  Developer Space architecture.

## Recommendation

MIMIR can close PR45 as complete for deployed staging.

Recommended next lane:

- keep Developer Pages work narrow and choose either a small evidence-card
  readability pass or a bounded owner-facing management-console slice. Do not
  start Cloudflare or Tier 2 hosting from this result.

PR46 found no concrete retrieval, latency, public-edge delivery, or
NESTstyle-memory defect.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Anonymous public API reads:
  - `https://stationapi-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
  - `https://stationapi-production.up.railway.app/developer-spaces/animus-field-lab`
- Chrome/CDP anonymous desktop route checks at `1365x900`
- Chrome/CDP anonymous mobile route checks at `390x844`
- Temporary local probe script was removed before commit.
