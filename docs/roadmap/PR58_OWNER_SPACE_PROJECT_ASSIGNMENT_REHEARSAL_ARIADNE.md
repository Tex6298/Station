# PR58 Owner Space Project Assignment Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Web route:
  `https://stationweb-production.up.railway.app/projects/ariadne-pr54-tier-tight-smoke-2026-06-19t02-05-15-653z`
- Web/API deployment identity:
  `18132f60bac8474fe9f5311f8947a23722a8ca77`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, private prompts, private archive excerpts, or
raw provider payloads were included in this result.

## Assignment State Checked

Owner-only `GET /developer-spaces` provided the expected assignment readback:

- `Station Replay Dev Alpha`
  - assigned to `ARIADNE PR54 UI smoke 2026-06-19T01-44-47-657Z`
  - `assignedProjectSlug`:
    `ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`
- `Animus Field Lab`
  - `projectId: null`
  - `assignedProjectName: null`
  - `assignedProjectSlug: null`

ARIADNE used the no-attachment PR54 tier-tight smoke Project as the rehearsal
target so both candidate-copy states were visible on the same page.

## Browser Rehearsal

Signed desktop Project detail passed:

- Target Project detail loaded without sign-in loop or route error.
- `Available Developer Spaces` rendered on the private owner Project page.
- `Animus Field Lab` rendered with `Not attached to a Project.`
- `Station Replay Dev Alpha` rendered with
  `Assigned to ARIADNE PR54 UI smoke 2026-06-19T01-44-47-657Z. Attaching moves it here.`
- Both candidates exposed `Attach to this Project` and `Manage`.
- No document-level horizontal overflow and no offscreen controls.

Attach-move flow passed:

- Clicking `Attach to this Project` for `Station Replay Dev Alpha` moved it
  from the original PR54 smoke Project to the target PR54 tier-tight smoke
  Project.
- The target Project detail refreshed.
- `Station Replay Dev Alpha` rendered in the attached list with
  `View observatory`, `Manage`, and `Detach`.
- `Animus Field Lab` remained available with `Not attached to a Project.`
- No document-level horizontal overflow and no offscreen controls.

Mobile attached-state check passed at `390x844`:

- The attached `Station Replay Dev Alpha` card, activity panel, `Detach`
  control, and available `Animus Field Lab` card remained visible.
- No document-level horizontal overflow and no offscreen controls.

Mobile detach flow passed:

- Clicking `Detach` for `Station Replay Dev Alpha` refreshed the target Project
  detail.
- The target Project returned to no attached Developer Spaces.
- `Station Replay Dev Alpha` returned to the available list with
  `Not attached to a Project.`
- `Animus Field Lab` remained available with `Not attached to a Project.`
- No document-level horizontal overflow and no offscreen controls.

After the UI detach proof, ARIADNE restored `Station Replay Dev Alpha` to its
original PR54 smoke Project through the existing owner API.

## Public Leakage Check

Anonymous/public API checks passed:

- Public `GET /developer-spaces/station-replay-dev-alpha` returned `200`.
- Public `GET /developer-spaces/animus-field-lab` returned `200`.
- Neither public API response exposed `projectId`, `assignedProjectName`, or
  `assignedProjectSlug`.

Anonymous public page checks passed at `390px`:

- `/developer-spaces/station-replay-dev-alpha` did not show the private Project
  assignment name, `Assigned to`, `Not attached to a Project`, or attach/detach
  controls.
- `/developer-spaces/animus-field-lab` did not show `Assigned to`,
  `Not attached to a Project`, or attach/detach controls.
- Both public pages had no document-level horizontal overflow and no offscreen
  controls.

## Final Staging State

After restoration:

- Target PR54 tier-tight smoke Project had no attached Developer Spaces.
- Original PR54 smoke Project again had `Station Replay Dev Alpha` attached.
- `Animus Field Lab` remained unassigned.

## Recommendation

MIMIR can treat PR58 as accepted from ARIADNE UI rehearsal.

This is a clean pause point for Project scaffolding if MIMIR wants to stop here.
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
- Public API reads:
  - `GET https://stationapi-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
  - `GET https://stationapi-production.up.railway.app/developer-spaces/animus-field-lab`
- Signed Chrome/CDP desktop assignment-copy check
- Signed Chrome/CDP attach-move flow
- Signed Chrome/CDP `390px` attached-state check
- Signed Chrome/CDP `390px` detach flow
- Fresh anonymous Chrome/CDP public Developer Space leakage checks at `390px`
- `node --check scripts/tmp-pr58-assignment-ui-rehearsal.mjs`
- `node scripts/tmp-pr58-assignment-ui-rehearsal.mjs`
- Temporary local probe script was removed before commit.
