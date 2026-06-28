# PR451 - Hosted Continuity Review Links Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR450 accepted the existing UX-03A Continuity review target route-link
implementation:

`docs/roadmap/PR450_CONTINUITY_REVIEW_TARGET_LINKS_CLOSEOUT.md`

Hosted browser verification remains the follow-up.

## Goal

Prove that the hosted Continuity route lets an owner move from Continuity
readback to the relevant Studio review surfaces without exposing private source
details or becoming cramped on mobile.

This is a hosted human-eye rehearsal, not a new implementation lane.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime at PR448 product commit `4a1234c5` or later is sufficient before
judging behavior because PR450 made no product-code change and verified an
already-landed implementation.

## Route Set

Use the replay-owner account:

1. `/studio`
2. replay persona Continuity route
3. visible Continuity review target links
4. any linked Studio review surfaces that are visible and safe to open

Check desktop and at least one narrow mobile viewport around 375px/390px.

Do not mutate Memory, Canon, Archive, Integrity, Continuity, publication,
provider settings, billing, export, or import state.

## Acceptance Gates

- Continuity review targets that are safely linkable render as owner-only
  route-level links.
- Links route to existing Studio surfaces such as Memory, Canon, Integrity,
  Archive/files, Continuity, or owner publishing review.
- Unsupported, linked-conversation, unknown, raw-id, or credential-shaped
  labels remain safe plain text.
- The route does not expose raw ids, prompts, private source bodies, provider
  payloads, storage paths, or secret-shaped material.
- Desktop and narrow mobile layouts remain readable without horizontal
  overflow or clipped link chips.
- The page still distinguishes Memory, Canon, Archive, Integrity output,
  runtime context, and Continuity records.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted Continuity review links are visible, safe, and readable.
- `DATA_NOT_PRESENT`: hosted replay data does not expose enough review-target
  rows to fairly judge the behavior.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: hosted current runtime shows a concrete
  Continuity link, safety, or mobile-readability defect.

Include route, action, expected behavior, actual behavior, and non-secret
evidence. Do not commit screenshots, cookies, session values, raw owner ids,
raw persona ids, raw source ids, private source bodies, prompts, completions,
provider keys, or raw network payloads.
