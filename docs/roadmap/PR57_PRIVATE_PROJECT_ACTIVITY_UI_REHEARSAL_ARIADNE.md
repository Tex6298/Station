# PR57 Private Project Activity UI Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Web route:
  `https://stationweb-production.up.railway.app/projects/ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`
- Web/API deployment identity:
  `2ebcf5495c064a064551fc30073fa4d20dedf026`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Seeded Activity Check

ARIADNE used the existing PR54 smoke Project with `Station Replay Dev Alpha`
attached:

- Project: `ARIADNE PR54 UI smoke 2026-06-19T01-44-47-657Z`
- Attached Developer Space: `Station Replay Dev Alpha`
- Candidate Developer Space: `Animus Field Lab`

The signed Project detail page rendered `Observed activity` with read-only copy:
`Read-only counters from attached Developer Spaces.`

The UI counters matched the owner API activity readback:

- `Attached spaces`: `1`
- `Nodes`: `1`
- `Events`: `1`
- `Snapshots`: `1`
- `Storage bytes`: `1,862`
- `Public reads`: `70`
- `Exports`: `1`

The panel used the accepted observational labels and did not introduce quota,
billing, limits, or usage-entitlement language.

## Zero Activity Check

ARIADNE also checked the PR54 tier-tight smoke Project with no attached
Developer Spaces:

- Project: `ARIADNE PR54 tier-tight smoke 2026-06-19T02-05-15-653Z`

The `Observed activity` panel stayed legible and rendered every counter as `0`:

- `Attached spaces`: `0`
- `Nodes`: `0`
- `Events`: `0`
- `Snapshots`: `0`
- `Storage bytes`: `0`
- `Public reads`: `0`
- `Exports`: `0`

The empty attached-space state remained clear and the other-owner candidates
remained visible.

## Attach And Detach Refresh

Signed desktop attach flow passed:

- `Animus Field Lab` started under `Other Owner Developer Spaces`.
- Clicking `Attach to this Project` moved `Animus Field Lab` into the attached
  list.
- The activity panel refreshed with the Project state:
  - `Attached spaces`: `2`
  - `Nodes`: `2`
  - `Events`: `2`
  - `Snapshots`: `2`
  - `Storage bytes`: `3,995`
  - `Public reads`: `82`
  - `Exports`: `1`

Mobile attached-state check passed at `390x844`:

- The activity panel, both attached cards, action links, and `Detach` buttons
  remained visible.
- No document-level horizontal overflow and no offscreen controls.

Mobile detach flow passed:

- Clicking `Detach` for `Animus Field Lab` refreshed the Project detail.
- `Station Replay Dev Alpha` remained attached.
- `Animus Field Lab` returned to `Other Owner Developer Spaces`.
- The activity panel returned to the seeded Project counters:
  `1 / 1 / 1 / 1 / 1,862 / 70 / 1`.
- No document-level horizontal overflow and no offscreen controls.

## Anonymous Privacy Check

Anonymous Project detail redirected to
`/login?redirect=%2Fprojects%2Fariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`.

No private Project shell, `Observed activity` panel, attached list, candidate
list, attach/detach controls, `Station Replay Dev Alpha`, or `Animus Field Lab`
content was visible anonymously.

## Final Staging State

After the UI attach/detach rehearsal:

- `Station Replay Dev Alpha` remained attached to the PR54 smoke Project.
- `Animus Field Lab` had no Project attachment.
- No cleanup restore was required because the candidate started unattached.

## Recommendation

MIMIR can treat PR57 as accepted from ARIADNE UI rehearsal.

No broader product-scope change is needed. Keep public Project pages, quota
math, billing/export semantics, contributor/member authorization, hosted
runtime, Cloudflare, Tier 2 hosting, developer-agent, DexOS widgets, and
`export_packages.project_id` out of the next move unless MIMIR explicitly
reopens them.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed owner API reads:
  - `GET https://stationapi-production.up.railway.app/projects`
  - `GET https://stationapi-production.up.railway.app/developer-spaces`
  - `GET https://stationapi-production.up.railway.app/projects/:slug`
- Signed Chrome/CDP seeded Project detail desktop activity check
- Signed Chrome/CDP zero Project activity check
- Signed Chrome/CDP `Attach to this Project` flow with activity refresh
- Signed Chrome/CDP `390px` attached-state check
- Signed Chrome/CDP `Detach` flow at `390px` with activity refresh
- Fresh anonymous Chrome/CDP Project detail privacy check at `390px`
- `node --check scripts/tmp-pr57-activity-ui-rehearsal.mjs`
- `node scripts/tmp-pr57-activity-ui-rehearsal.mjs`
- Temporary local probe script was removed before commit.
