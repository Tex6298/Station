# PR253 - Owner Project Export Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Blocked - hosted schema missing Project export column
Opened: 2026-06-24
Reviewed: 2026-06-24

## Frame

ARGUS accepted PR252 Owner Project Export UI Panel with one narrow UI honesty
patch. Because the lane shipped visible private owner Project browser behavior,
ARIADNE must rehearse it on hosted Railway before MIMIR closes PR252.

## Goal

Run a human-eye hosted rehearsal of the private owner Project export panel.

## Deployment Gate

- Verify hosted web/API deployment health on `main` at or beyond ARGUS review
  commit `ac1cb40`.
- If hosted Railway has not deployed `ac1cb40` or later, wait/recheck rather
  than rehearsing stale UI.
- Do not print secrets, cookies, auth headers, tokens, or private URL query
  details.

## Rehearsal Path

- Sign in as the replay owner.
- On desktop and 390px mobile, visit a private owner Project detail route.
- Confirm the `Project export` panel appears below the owner-only Project
  evidence surface.
- Confirm the panel is absent from:
  - anonymous/public Project routes;
  - Discover;
  - global navigation;
  - Studio;
  - Settings;
  - Billing;
  - public Developer Space routes.
- Confirm the panel lists existing Project manifest packages through the
  accepted owner export API.
- Create a Project manifest from the panel and confirm the owner package list
  refreshes.
- Open a completed manifest readback.
- Open completed bundle file readback.

## Required Observations

Pass only if:

- The UI uses the private owner Project route and does not surface on public or
  unrelated routes.
- Visible bundle files are exactly `README.md`, `manifest.json`, and
  `manifest.md`.
- Visible bundle content is limited to README, bytes, and truncated hashes.
- There are no downloads, signed URLs, public bundle URLs, ZIP/PDF/binary
  actions, manifest JSON dumps, or file body dumps.
- There are no document bodies, source ids, raw link ids, secrets, SQL, stack
  traces, provider/runtime fields, Redis, Cloudflare, jobs, billing, or
  member/admin copy.
- Switching between manifest and bundle readback does not leave stale
  previous-package details visible.
- Desktop and 390px mobile layouts have no horizontal document overflow,
  offscreen controls, or unreadable action clusters.
- Failed or non-completed package states, if available, show bounded status copy
  and no readback buttons. If not available in hosted data, explicitly say this
  was covered by local helper tests rather than observed live.

## Output

Append an ARIADNE result section to this doc and update `ACTIVE_STATUS` with:

- hosted commit/deployment observed;
- desktop result;
- 390px mobile result;
- action wiring result;
- privacy/boundary result;
- stale-selection result;
- layout result;
- verdict: `PASS`, `FAIL`, or `BLOCKED`;
- if failed, exact DAEDALUS repair lane.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR253 Owner Project Export Hosted Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, MIMIR should close PR252/PR253 and choose the next roadmap move.
- If FAIL or BLOCKED, MIMIR should route the precise repair or deployment blocker.
```

## ARIADNE Result - 2026-06-24

Verdict: `BLOCKED`.

Hosted gate:

- Web and API `/health/deployment` were healthy, ready, on branch `main`, and
  at required commit `ac1cb40` or later.
- Replay owner sign-in succeeded from local `.env` without printing credentials
  or tokens.

Blocker:

- The rehearsal could not reach the browser panel checks because hosted
  `GET /exports/projects/:projectIdOrSlug` returned HTTP `500`.
- Sanitized API error: `column export_packages.project_id does not exist`.
- This points to hosted Supabase missing
  `infra/supabase/migrations/059_project_export_manifest.sql`, while deployed
  API code already expects the `export_packages.project_id` column.

Not exercised:

- Desktop Project export panel placement below owner-only Project evidence.
- `390px` mobile Project export panel fit.
- Existing package listing, create manifest, manifest readback, and bundle file
  readback.
- Stale manifest/bundle selection clearing.
- Absence from public Project, Discover, global navigation, Studio, Settings,
  Billing, and public Developer Space routes.
- Privacy/boundary copy and layout checks.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr253-owner-project-export-rehearsal.spec.js --reporter=line --workers=1`
  blocked on hosted owner Project export API HTTP `500`.

Repair guidance:

- Apply or verify `infra/supabase/migrations/059_project_export_manifest.sql`
  against hosted Supabase so `export_packages.project_id` exists.
- Re-run PR253 after the hosted owner Project export API can list/create
  Project manifest packages.
