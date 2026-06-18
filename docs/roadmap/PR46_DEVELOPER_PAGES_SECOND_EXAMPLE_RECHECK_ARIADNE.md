# PR46 - Developer Pages Second Example Recheck

Date: 2026-06-18
Status: opened for ARIADNE
Owner: ARIADNE rechecks, MIMIR closes, DAEDALUS fixes exact visible blockers
only.

## Purpose

Recheck the deployed Developer Pages pattern across two public-safe examples.

PR45 added `animus-field-lab` as a second synthetic public Developer Page
example. Because PR45 did not change the public page code/API shape, Railway can
still serve commit `734c118` while the new staging seed data is visible through
the deployed API.

## Runtime State

MIMIR confirmed before this handoff:

- web service commit: `734c118c6c2ce3cd6abedf7610aa4b133ed71095`
- API service commit: `734c118c6c2ce3cd6abedf7610aa4b133ed71095`
- PR45 implementation commit: `a52a85d`
- PR45 review commit: `41daca7`

Anonymous API readback passed:

- `station-replay-dev-alpha`: access `public`, 3 evidence documents, roles
  `methodology`, `finding`, `field_log`, document types `research`, `research`,
  `field_log`, 1 node, 1 event.
- `animus-field-lab`: access `public`, 3 evidence documents, roles
  `methodology`, `finding`, `field_log`, document types `research`, `research`,
  `field_log`, 1 node, 1 event.

Both web shells return successfully:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
- `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab`

## Recheck Routes

Check both as anonymous visitor routes:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
- `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab`

Check desktop and 390px mobile if practical.

## Questions

Across both routes:

- Does each page show the evidence reading path before the live observatory?
- Does each page show methodology, finding, and field-log evidence in the right
  order?
- Does the second example feel distinct enough to prove the pattern is not
  overfit to `station-replay-dev-alpha`?
- Do both pages keep evidence in-page without fake public document links or dead
  controls?
- Do both pages keep live visualisation, event stream, reading guide, current
  nodes, and latest snapshot legible?
- Are public/private boundaries still clear?
- Does either page overclaim real DexOS onboarding, hosted runtime, developer
  agents, public interaction modes, Cloudflare, route/table rename, Project
  abstraction, or production depth?
- Are there any obvious mobile overflow, loading, duplicate-section, or copy
  problems?

## Handoff

If both pass, wake MIMIR with:

- human recheck verdict;
- desktop/mobile notes for both routes;
- any caveats;
- whether PR45 can close as complete.

If a visible blocker remains, wake DAEDALUS with:

- route;
- viewport;
- exact visible issue;
- expected versus actual;
- narrowest fix.
