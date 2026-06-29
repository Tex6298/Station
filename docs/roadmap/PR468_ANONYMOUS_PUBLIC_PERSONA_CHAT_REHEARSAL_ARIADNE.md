# PR468 - Anonymous Public Persona Chat Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

## Source

ARGUS accepted the DAEDALUS implementation:

`docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REVIEW_RESULT.md`

Use this lane to prove the accepted anonymous public persona chat alpha on the
hosted Railway product before MIMIR closes PR468.

## Goal

Run a narrow hosted human-eye rehearsal for anonymous public persona chat.

This is not a broad public-persona expansion, UI redesign, Stripe, Redis,
Cloudflare, provider, queue, worker, billing, or new Phase 3 feature lane. Do
not interrupt DAEDALUS unless the hosted rehearsal proves a concrete defect.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should include PR468 product commit `00e618eb` or later for web/API
before judging product behavior. If Railway is still serving an older product
commit, return `DEPLOYMENT_WAITING`.

## Rehearsal Shape

Use a fresh signed-out browser context first.

Required public alpha path:

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

Required deny/rollback checks:

1. Check at least one other public persona route if one is visible. Anonymous
   chat must require sign-in or not expose a live anonymous form.
2. If owner-signed state is needed to inspect readback, use the replay-owner
   local ignored credentials without printing values.
3. Confirm signed-in public persona behavior still reads as signed-in alpha, not
   anonymous for every public persona.
4. Do not disable the owner toggle unless an existing visible control clearly
   supports a safe no-op/read-only confirmation. Owner disable remains the
   rollback design; this rehearsal may rely on ARGUS tests for the actual
   mutation if the hosted UI does not expose a safe toggle.

Check desktop plus one narrow mobile viewport around `390px`.

## Acceptance Gates

- Hosted web/API freshness is at PR468 product commit `00e618eb` or later.
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

If reporting a defect, include:

- route;
- viewport;
- signed-out or signed-in state;
- action;
- expected behavior;
- actual behavior;
- smallest recommended patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, visitor prompts, provider completions, private source bodies,
provider keys, stack traces, raw network payloads, or secret-looking values.

