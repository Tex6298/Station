# PR65 Developer Space Observability Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Route: signed owner Developer Space manage page at
  `/developer-spaces/station-replay-dev-alpha/manage`
- Public comparison route:
  `/developer-spaces/station-replay-dev-alpha`
- Target Developer Space: `Station Replay Dev Alpha`
- Web/API deployment identity checked in Railway:
  `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`
- Wake/review commit:
  `e8dba85f26810d4644f42c15d7d606bb1863a058`
- Account mode: signed replay owner via local env for manage; anonymous mobile
  session for public comparison
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

Railway was serving the PR65 implementation commit `b1e9ce3`; the later
`e8dba85` wake commit is docs/review-only. No credentials, tokens, cookies,
ingestion keys, raw payload bodies, raw ids, private document bodies, prompts,
or secret-shaped values are included in this result.

## Result

ARIADNE accepts PR65 from the signed owner UI rehearsal.

Signed owner API/browser readback for `station-replay-dev-alpha` showed:

- access: `owner`
- visibility: `public`
- nodes: `1`
- events: `1`
- latest snapshot: present
- linked evidence: `4`
- visitor evidence: `3`
- owner-only evidence: `1`
- export packages: `1`
- usage warning: `ok`
- metered nodes/events/snapshots/exports: `1 / 1 / 1 / 1`

The owner manage page now reads as two separate concepts:

- `Current observatory state`: live node/event/snapshot/evidence readback from
  the owner detail route;
- `Metered usage and quota`: quota/accounting counters from the usage route.

Because staging counters currently match live state, the visible usage copy
said `Usage counters match the current observatory summary.` The page still
made the boundary explicit with copy that owner readback comes from the current
detail route and is separate from quota counters below. ARGUS separately
validated the unavailable/lagging mismatch helper copy before this rehearsal.

## Desktop

Desktop passed:

- `Researcher interface`, `Current observatory state`, `Metered usage and
  quota`, `Live ingestion`, `Visual mode`, `Observatory widgets`, `Exports`,
  and `Evidence path` all rendered;
- current state showed live signals, tracked nodes, recent events, current
  snapshot availability, linked evidence, visitor evidence, owner-only
  evidence, and visibility;
- usage showed warning `Ok`, metered nodes, metered events, metered snapshots,
  storage, public reads, exports, and match/metering copy;
- boundary copy kept the manage page private, explained that keys are shown once
  and hashed before storage, and separated the public observatory from the owner
  console;
- the current-state/usage readback area did not expose raw payload markers or
  secret-shaped values;
- no actual ingestion key was visible; sample commands used the
  `$STATION_DEVELOPER_KEY` placeholder;
- no document-level horizontal overflow;
- no offscreen controls.

## Mobile

Mobile passed at `390px`:

- the same manage sections remained present and readable;
- current-state and metered-usage blocks stayed distinct;
- node/event/snapshot/evidence readback remained legible;
- usage/quota rows and the match/metering copy fit without horizontal overflow;
- no actual ingestion key was visible;
- no document-level horizontal overflow;
- no offscreen controls.

## Public Comparison

Anonymous `390px` public observatory comparison passed:

- `Station Replay Dev Alpha` rendered as a public Developer Space;
- public signal/evidence copy remained present;
- manage-console copy was not visible;
- ingestion-key headers/placeholders were not visible;
- raw payload markers were not visible;
- no bearer, token-assignment, secret-shaped value, or management quota copy was
  visible;
- no document-level horizontal overflow;
- no offscreen controls.

## Privacy

PR65 preserves the Developer Space boundary:

- owner manage can describe raw operational setup, but the new current-state and
  usage readback areas are count/label based;
- public visitors do not see ingestion keys, credentials, raw owner console
  payloads, private archive text, prompts, unpublished notes, or owner-only
  evidence bodies;
- public/mobile comparison did not expose management copy, raw payload markers,
  bearer values, token assignments, or secret-shaped values.

This keeps Developer Spaces framed as live observatories instead of generic
dashboards or quota panels.

## Scope

No hosted runtime, realtime protocol, ingestion API behavior, usage/schema
change, provider-policy behavior, public raw payload expansion, Project work,
Redis, Cloudflare, worker, billing-plan change, broad redesign, or DexOS work
was added by ARIADNE.

## Validation

- `node --check scripts/tmp-pr65-developer-space-observability-rehearsal.mjs`
- `node scripts/tmp-pr65-developer-space-observability-rehearsal.mjs`
- Signed owner API reads:
  - `GET https://stationapi-production.up.railway.app/developer-spaces`
  - `GET https://stationapi-production.up.railway.app/developer-spaces/:slug`
  - `GET https://stationapi-production.up.railway.app/developer-spaces/:id/usage`
  - `GET https://stationapi-production.up.railway.app/exports/developer-spaces/:id`
- Anonymous public API/detail comparison for the same Developer Space
- Signed Chrome/CDP desktop Developer Space manage checks
- Signed Chrome/CDP `390px` Developer Space manage checks
- Anonymous Chrome/CDP `390px` public observatory privacy comparison
- Privacy checks for actual ingestion keys, raw payload markers, bearer values,
  token assignments, secret-shaped values, and management copy leakage
- `git diff --check`
- Temporary local probe script was removed before commit.
