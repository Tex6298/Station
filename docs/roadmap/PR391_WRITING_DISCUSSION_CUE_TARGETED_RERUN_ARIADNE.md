# PR391 - Writing Discussion Cue Targeted Rerun

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Rerun the hosted `/writing` linked-discussion cue proof after PR390's
renderability repair.

PR390 promoted the cue from a small metadata pill to a visible card-level
route-through line. This proof should confirm the repair in hosted browser
conditions using the known linked replay public document title.

Do not create a new public document, publish an artifact, or start a new
discussion thread.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Hosted web must be at or after the PR390 implementation commit:

- `941d8046`

If hosted Railway is stale or unavailable, return `BLOCKED` with the observed
prefix or failure. Do not fail the product for stale deployment.

## Human Route

Use replay-owner credentials from ignored local environment only. Do not paste
credentials, cookies, raw owner identifiers, raw persona identifiers, raw
document identifiers, raw thread identifiers, raw source bodies, screenshots,
SQL, stack traces, hosted logs, or secrets into the result.

Run:

1. Sign in as replay owner if needed.
2. Open `/writing`.
3. Search for:

```text
Station Replay Alpha Note
```

4. Confirm the matching card visibly shows:

```text
Open document and linked discussion
```

5. Open the card.
6. On the public document detail route, confirm it shows:

```text
Open linked discussion
```

7. Open the linked discussion route and confirm it reaches the public forum
   thread.
8. Do not publish new public data, start a new discussion, use social dispatch,
   or mutate owner data.

## Pass Criteria

Return `PASS` if:

- hosted freshness is at or after `941d8046`;
- `/writing` search finds `Station Replay Alpha Note`;
- the visible card-level cue appears on the matching card;
- public document detail exposes `Open linked discussion`;
- the linked forum discussion route opens;
- no raw ids, private source material, owner-only archive/memory/canon/import
  material, provider payloads, SQL, stack traces, or secret-shaped values are
  visible.

Return `PASS WITH CAVEAT` if:

- the route works but the cue is still visually weak enough for a later polish
  pass.

Return `FAIL` if:

- hosted web is fresh but the matching linked card still lacks the visible cue;
- document detail no longer exposes the linked discussion action;
- the cue appears but routes nowhere;
- private material, raw ids, source bodies, provider payloads, SQL, stack
  traces, or secret-shaped values are visible.

Return `BLOCKED` only for stale deploy, unavailable staging, missing
credentials, auth/session breakage, or the known title being absent from hosted
`/writing` after a fresh deploy.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether the target title appeared in `/writing`.
- Whether the card-level cue appeared.
- Whether document detail and linked forum discussion opened.
- Exact defects and recommended next owner if repair is needed.
