# PR468 - Anonymous Public Persona Chat Hosted Rehearsal Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

## Source

PR468A repaired the route reachability defect found in the first hosted
rehearsal:

`docs/roadmap/PR468A_PUBLIC_PERSONA_HOSTED_ROUTE_REACHABILITY_REVIEW_RESULT.md`

ARGUS accepted PR468A after confirming public persona read routes fail bounded,
optional page reads cannot leak raw rejected errors, and PR468 remains one
anonymous alpha persona only.

## Goal

Rerun the hosted PR468 anonymous public persona chat rehearsal now that the
public persona route reachability patch is accepted.

This rerun should prove the original PR468 customer-facing behavior, not open a
new feature or broaden anonymous public persona scope.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should include PR468A accepted commit `cd8cb866` or later for web/API
before judging product behavior. If Railway is still serving an older runtime,
return `DEPLOYMENT_WAITING`.

## Rerun Shape

Use a fresh signed-out browser context first.

Required route reachability checks:

1. `GET /personas/public/station-replay-alpha-persona` must return public
   persona readback successfully. A bounded unavailable error is better than a
   hang, but it is still not enough to accept PR468 because the anonymous chat
   UI depends on primary readback.
2. `GET /personas/public/station-replay-alpha-persona/context-preview`,
   `GET /personas/public/station-replay-alpha-persona/events`, and
   `GET /personas/public/roulette` must return either bounded public data or a
   bounded public unavailable error without raw internal detail.
3. The web page `/personas/station-replay-alpha-persona` must reach a usable
   state without hanging behind optional preview/update reads.

Required anonymous chat path:

1. Open `/personas/station-replay-alpha-persona`.
2. Confirm the page exposes anonymous public chat without requiring sign-in.
3. Send one short harmless staging prompt that asks only for public alpha persona
   behavior, not private memory or owner setup details.
4. Confirm the response is public-source-only and does not expose private
   Memory, Archive, Canon, Continuity, Integrity, owner setup, provider config,
   private documents, raw ids, source bodies, credentials, stack traces, or
   secret-shaped material.
5. Refresh or navigate away/back and confirm no visitor transcript/history is
   presented as a durable anonymous conversation.

Required deny/readback checks:

1. Check at least one other public persona route if one is visible. Anonymous
   chat must require sign-in or not expose a live anonymous form.
2. If owner-signed state is needed to inspect readback, use the replay-owner
   local ignored credentials without printing values.
3. Confirm signed-in public persona behavior still reads as signed-in alpha, not
   anonymous for every public persona.

Check desktop plus one narrow mobile viewport around `390px`.

## Acceptance Gates

- Hosted web/API freshness is at PR468A accepted commit `cd8cb866` or later.
- The alpha public persona primary readback succeeds.
- Optional public context/events/roulette failures, if any, are bounded and do
  not block page usability or leak raw internal detail.
- Signed-out anonymous chat works on
  `/personas/station-replay-alpha-persona`.
- Other public personas remain signed-in-only or do not expose anonymous chat.
- The page does not imply general anonymous public persona availability.
- The response and visible page copy stay public-source-only.
- No private source text, raw prompt history, provider payload, credential,
  stack trace, storage path, raw id, visitor identity, or secret-shaped material
  appears in the UI.
- Refresh/navigation does not show a durable anonymous visitor transcript.
- Signed-in public persona behavior is not regressed if sampled.
- Desktop and mobile layouts remain readable with no horizontal overflow,
  clipped primary controls, overlapping labels, or hidden chat input/send path.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted anonymous public persona chat alpha is ready for closeout.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete hosted defect needs a narrow
  DAEDALUS patch.
- `PRIVACY_BOUNDARY_FAIL`: hosted behavior exposes private/secret-shaped
  material or durable anonymous visitor transcript.

If reporting a defect, include route, viewport, signed-out/signed-in state,
action, expected behavior, actual behavior, and smallest recommended patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, visitor prompts, provider completions, private source bodies,
provider keys, stack traces, raw network payloads, or secret-looking values.

