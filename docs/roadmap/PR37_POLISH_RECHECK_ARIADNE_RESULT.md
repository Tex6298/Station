# PR37 Polish Recheck - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Blocked for DAEDALUS patch

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Railway web/API deployment identity:
  `56401e47b62ec6285f2432b73e47931172da9392`
- Browser mode: Chrome/CDP, mobile viewport `390x844`
- Account role: signed replay owner for Studio/Archive checks; anonymous
  visitor for public Developer Space

No credentials, cookies, tokens, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Result

PR37 is not ready to close. The navigation-specific part of the patch works, but
signed mobile `/studio` still has document-level horizontal overflow at 390px.

Blocker:

- Route: `/studio`
- Viewport: `390x844`
- Account role: signed replay owner
- Expected: no document-level horizontal overflow after PR37
- Actual: `documentElement.scrollWidth` measured `407px` with
  `clientWidth` `390px`
- Visual/coded culprit from CDP layout probe:
  - `.studio-dashboard-grid`: width `358px`, scroll width `391px`
  - `.studio-dashboard-main`: width `358px`, scroll width `391px`
  - `.studio-dashboard-panel`: width `358px`, scroll width `390px`
  - persona/action row descendants inside the dashboard still have wider
    intrinsic content, including long persona names/details
- Narrowest recommended fix: tighten the Studio dashboard mobile shrink/wrap
  rules so dashboard grids, panels, persona rows, quick-action rows, and their
  text children use `min-width: 0`, wrap where appropriate, and do not let long
  persona names or action details set page width.

## Passed Checks

Signed account menu:

- Account menu opened at 390px.
- Menu exposed `Studio`, `My Space`, `Developer Spaces`, `Billing`, and
  `Settings`.
- `Studio`, `My Space`, and `Developer Spaces` were clickable.
- `/space` and `/developer-spaces` landed without login, 404, hard error, or
  horizontal overflow.

Archive:

- `/studio/archive` landed at 390px without horizontal overflow.
- `Search private archive` was visible.
- `Source material and visibility`, `owner-only`, and private visibility copy
  were visible.
- No owner ID, auth token, refresh token, provider debug text, route metadata,
  service-role text, or runtime-budget text appeared in visible Archive text.

Developer Space:

- `/developer-spaces/station-replay-dev-alpha` landed anonymously at 390px
  without horizontal overflow.
- Public copy exposed the expected story: `What is visible`, methodology,
  field-log, live signals, visitor/private boundary, and `Live observatory`.
- No owner ID, replay email, access token, refresh token, credential, private
  prompt, or private archive text appeared in visible public text.

Non-blocking probe note:

- The automated Archive text probe looked for the exact phrase
  `complete or fail`, but the deployed copy uses the more natural
  `Completed imports... Failed imports...` wording. ARIADNE treats this as a
  pass because completion/failure narrative is visible and honest.
- The Developer Space copy includes the sentence that visitors do not see raw
  owner-console data. That is boundary copy, not a leak.

## Cloudflare

Cloudflare remains deferred. This recheck found a responsive-layout defect, not
a retrieval, latency, public-edge, or NESTstyle-memory defect.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Chrome/CDP signed mobile `/studio` at `390x844`
- Chrome/CDP signed account-menu route access at `390x844`
- Chrome/CDP signed mobile `/studio/archive` at `390x844`
- Chrome/CDP anonymous public Developer Space at `390x844`
