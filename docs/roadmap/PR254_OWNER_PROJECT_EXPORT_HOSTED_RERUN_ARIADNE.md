# PR254 - Owner Project Export Hosted Rerun

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR253 blocked because hosted Supabase was missing
`export_packages.project_id`. MIMIR applied and verified
`infra/supabase/migrations/059_project_export_manifest.sql` on hosted Supabase.

This lane reruns the same hosted owner-eye rehearsal after schema repair.

## Goal

Complete the private owner Project export panel rehearsal that PR253 could not
reach.

## Deployment Gate

- Verify hosted web/API deployment health on `main` at or beyond ARGUS review
  commit `ac1cb40`.
- Verify the owner Project export list API no longer fails with
  `export_packages.project_id` missing.
- Do not print secrets, cookies, auth headers, tokens, or private URL query
  details.

## Rehearsal Path

- Sign in as the replay owner.
- On desktop and 390px mobile, visit a private owner Project detail route.
- Confirm the `Project export` panel appears below the owner-only Project
  evidence surface.
- Confirm the panel is absent from anonymous/public Project routes, Discover,
  global navigation, Studio, Settings, Billing, and public Developer Space
  routes.
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
- schema repair confirmation;
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
- ARIADNE completed PR254 Owner Project Export Hosted Rerun.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, MIMIR should close PR252/PR253/PR254 and choose the next roadmap move.
- If FAIL or BLOCKED, MIMIR should route the precise repair or deployment blocker.
```
