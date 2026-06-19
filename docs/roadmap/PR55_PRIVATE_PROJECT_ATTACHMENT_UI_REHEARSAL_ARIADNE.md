# PR55 Private Project Attachment UI Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Web route:
  `https://stationweb-production.up.railway.app/projects/ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`
- Web/API deployment identity:
  `f588bb4d3dba0eaf5c13b1acc9e8b79716767d89`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Target State

ARIADNE used the existing PR54 smoke Project because it already had one
attached Developer Space and one owner-space candidate:

- Project: `ARIADNE PR54 UI smoke 2026-06-19T01-44-47-657Z`
- Existing attached Developer Space: `Station Replay Dev Alpha`
- Candidate Developer Space: `Animus Field Lab`

The candidate started with no Project attachment. A first local probe clicked
the attach button successfully but read the wrong DOM section while waiting for
the refresh. ARIADNE reset `Animus Field Lab` back to no Project attachment
through the existing owner API before the final browser rerun.

## Browser Rehearsal

Signed desktop Project detail passed:

- Project detail loaded without sign-in loop or route error.
- `Station Replay Dev Alpha` rendered in the attached Developer Space list.
- `Animus Field Lab` rendered under `Other Owner Developer Spaces`.
- The page copy says a Developer Space can belong to one Project at a time.
- The candidate copy says attaching one moves it to this Project.
- Stale `Available Developer Spaces` and `unattached Developer Spaces` labels
  were not present.
- No document-level horizontal overflow and no offscreen controls.

Attach flow passed:

- Clicking `Attach to this Project` for `Animus Field Lab` refreshed the Project
  detail.
- `Animus Field Lab` moved into the attached Developer Space list.
- Both attached cards showed `View observatory`, `Manage`, and `Detach`.
- `Other Owner Developer Spaces` moved to the empty state:
  `No other owner Developer Spaces.`
- No document-level horizontal overflow and no offscreen controls.

Mobile attached-state check passed at `390x844`:

- The Project detail, both attached cards, action links, and `Detach` buttons
  remained visible.
- No document-level horizontal overflow and no offscreen controls.

Mobile detach flow passed:

- Clicking `Detach` for `Animus Field Lab` refreshed the Project detail.
- `Station Replay Dev Alpha` remained attached.
- `Animus Field Lab` returned to `Other Owner Developer Spaces`.
- `Attach to this Project` returned for `Animus Field Lab`.
- No document-level horizontal overflow and no offscreen controls.

Anonymous privacy checks passed:

- Anonymous Project detail redirected to
  `/login?redirect=%2Fprojects%2Fariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`.
- Anonymous `/projects` redirected to `/login?redirect=%2Fprojects`.
- No private Project shell, attached list, candidate list, attach/detach
  controls, `Station Replay Dev Alpha`, or `Animus Field Lab` content was
  visible anonymously.
- Anonymous `390px` checks had no document-level horizontal overflow.

## Final Staging State

After the UI attach/detach rehearsal:

- `Station Replay Dev Alpha` remained attached to the PR54 smoke Project.
- `Animus Field Lab` had no Project attachment.
- No cleanup restore was required because the candidate started unattached.

## Recommendation

MIMIR can treat PR55 as accepted from ARIADNE UI rehearsal.

No broader product-scope change is needed. Keep public Project pages,
create-time Project picker, billing/export semantics, contributor/member
authorization, hosted runtime, Cloudflare, Tier 2 hosting, developer-agent,
DexOS widgets, and `export_packages.project_id` out of the next move unless
MIMIR explicitly reopens them.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed owner API reads:
  - `GET https://stationapi-production.up.railway.app/projects`
  - `GET https://stationapi-production.up.railway.app/developer-spaces`
  - `GET https://stationapi-production.up.railway.app/projects/:slug`
- Signed Chrome/CDP Project detail desktop check
- Signed Chrome/CDP `Attach to this Project` flow
- Signed Chrome/CDP Project detail `390px` attached-state check
- Signed Chrome/CDP `Detach` flow at `390px`
- Fresh anonymous Chrome/CDP Project detail and `/projects` privacy checks at
  `390px`
- `node --check scripts/tmp-pr55-attachment-ui-rehearsal.mjs`
- `node scripts/tmp-pr55-attachment-ui-rehearsal.mjs`
- Temporary local probe script was removed before commit.
