# PR453 - Hosted Archive Trust Readback Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR452 added Archive trust/status readback:

`docs/roadmap/PR452_ARCHIVE_TRUST_STATUS_READBACK_CLOSEOUT.md`

Hosted browser verification is the next proof.

## Goal

Verify that the live hosted persona Archive/files page explains archive scope
honestly across import sources, archived chats, storage/imported content, and
Continuity-linked archive material.

This is a hosted human-eye rehearsal, not an archive backend lane.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR452 review/product commit `60d53367` or later for
web/API before judging product behavior. If Railway is still serving an older
commit, return `DEPLOYMENT_WAITING`.

## Route Set

Use the replay-owner account and keep the run read-only:

1. `/studio`
2. replay persona Archive/files route
3. Archive trust/status readback panel
4. Storage and Quota panel if visible
5. Continuity route only if the Archive panel points there for source-level
   review

Check desktop and one narrow mobile viewport around 390px.

Do not run archive imports, retries, uploads, exports, publish actions,
provider setup, billing checkout, key generation, or destructive actions.

## Acceptance Gates

- Archive page distinguishes import sources from archived chats.
- Archived-chat unavailable/zero copy is honest and not misleading.
- Storage/imported content points to server-reported usage instead of invented
  bytes.
- Continuity-linked archive material is not faked on the Archive page and
  points to Continuity if needed.
- Empty/zero states do not imply all archive-backed material is absent.
- Desktop and mobile layouts remain readable without horizontal overflow.
- Owner-only Archive readback does not expose private source bodies, storage
  paths, raw ids, prompts, provider payloads, credentials, or raw import errors.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted Archive trust readback behaves as intended.
- `DEPLOYMENT_WAITING`: hosted runtime is stale and should be checked again.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: hosted current runtime shows a concrete
  Archive trust/readback defect.

Include route, action, expected behavior, actual behavior, and non-secret
evidence. Do not commit screenshots, cookies, session values, raw owner ids,
raw persona ids, raw archive ids, private source bodies, prompts, completions,
provider keys, or raw network payloads.
