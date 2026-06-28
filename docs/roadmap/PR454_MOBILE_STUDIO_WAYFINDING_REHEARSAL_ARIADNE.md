# PR454 - Mobile Studio Wayfinding Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR453 closed the hosted Archive trust readback:

`docs/roadmap/PR453_HOSTED_ARCHIVE_TRUST_READBACK_CLOSEOUT.md`

The next Discern-to-Tex UI priority is Mobile Studio wayfinding:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a human-eye rehearsal. Use the product like a person trying to understand
where they are, what is private, and how to move between the core Studio work
surfaces.

## Goal

Verify whether the hosted signed-in mobile Studio frame is coherent after the
recent Memory, Continuity, and Archive readback lanes.

The result should give MIMIR exactly one next product lane:

- `PASS_WITH_NEXT_LANE`: mobile Studio wayfinding is good enough, and another
  named Discern-to-Tex priority should move next.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: a concrete wayfinding defect should be fixed.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR452 review/product commit `60d53367` or later for web
and API before judging product behavior. If Railway is still serving an older
commit, return `DEPLOYMENT_WAITING`.

## Route Set

Use the replay-owner account. Keep the run read-only unless a harmless tab,
filter, or navigation action is required to prove wayfinding.

Check one desktop viewport only for orientation, then focus on narrow mobile
viewports around 390px and 375px.

Routes and stops:

1. signed-out `/studio`
2. signed-in `/studio`
3. Studio dashboard
4. replay persona Home
5. replay persona Memory
6. replay persona Continuity
7. replay persona Archive/files
8. replay persona Integrity
9. Global Archive, only if the mobile Studio frame points there
10. Settings or AI Provider, only if the mobile Studio frame points there

Do not run archive imports, retries, uploads, exports, publishing, provider
setup, billing checkout, key generation, destructive actions, or private model
calls.

## Acceptance Gates

- The top navigation, sidebar, persona tabs, and return routes make the current
  location obvious on mobile.
- A signed-in user can move from Studio dashboard to persona Memory, Continuity,
  Archive, and Integrity without losing the owner/private context.
- Active states do not contradict the route being shown.
- Collapsed or narrow mobile UI does not hide the only obvious path back to
  Studio or the persona.
- Controls that look tappable either navigate, change state, or are visibly
  disabled/preview-only.
- No horizontal overflow, clipped buttons, clipped labels, or unreadable
  sidebars around 390px and 375px.
- Empty/loading/error states encountered during the route set explain the state
  without implying missing backend capability is live.
- Owner-only Studio surfaces do not expose raw ids, prompts, private source
  bodies, provider payloads, credentials, storage paths, or secret-shaped
  material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`
- `DEPLOYMENT_WAITING`

If reporting a defect, include:

- route;
- viewport;
- action;
- expected behavior;
- actual behavior;
- the smallest recommended fix lane.

Do not commit screenshots, cookies, session values, raw owner ids, raw persona
ids, private source bodies, prompts, completions, provider keys, or raw network
payloads.
