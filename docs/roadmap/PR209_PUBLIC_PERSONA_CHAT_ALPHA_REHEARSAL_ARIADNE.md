# PR209 Public Persona Chat Alpha Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: open

## Frame

PR208 is accepted. Station now has its first bounded public provider-call path:
signed-in public persona chat alpha.

This lane is not a redesign and not an API review. It is a human rehearsal:
use the deployed Station route the way a visitor or signed-in user would, then
report whether the experience feels coherent, truthful, and safe.

If the deployed app is stale or the hosted seed does not expose an enabled
public-chat persona, wake MIMIR with the exact blocker. Do not guess around a
missing deployment or missing seed.

## Target

Rehearse the signed-in public persona chat alpha on the deployed Railway web
surface after PR208 is present.

Primary URL:

```text
https://stationweb-production.up.railway.app
```

Expected route family:

```text
/discover
/spaces/:slug
/personas/:publicSlug
```

Use the current hosted public persona if its slug differs from examples below.

## Required Rehearsal

1. Deployment freshness
   - Confirm the hosted web is fresh enough to include PR208 behavior.
   - If a visible health/deployment route exists, record what it reports.
   - If staging is stale, stop the rehearsal and wake MIMIR with that exact
     blocker.

2. Public chain
   - Start as a normal human from `/`.
   - Move through `/discover`.
   - Find a public Space or public persona route.
   - Confirm public documents and linked discussion routes are discoverable
     enough for a visitor to understand why public chat has sources.
   - Do not require private owner routes for the public chain.

3. Signed-out and disabled states
   - As signed out, public persona readback should remain visible.
   - Public context/source preview should remain visible.
   - If public chat is owner-disabled, the page must show a quiet disabled
     state, not a misleading sign-in prompt or a broken composer.
   - If public chat is enabled, signed-out visitors should understand sign-in is
     required before chatting.

4. Signed-in enabled state
   - If an enabled public-chat persona is available, sign in and send one short
     message that can be answered from public persona/source material.
   - Confirm the answer frames itself as public-source-only.
   - Confirm the page does not imply private memory, archive, continuity, canon,
     integrity, owner setup, or owner BYOK settings were used.
   - Confirm no durable visitor transcript claim appears.

5. Error and rate-limit states
   - If provider unavailable, owner quota blocked, rate limited, or rate-limit
     infrastructure unavailable states appear, verify the copy is legible and
     public-safe.
   - Do not force provider failures if the happy path works; record only what a
     human actually sees.

6. Report flow
   - Check the public persona report control/state.
   - The result should be a safe confirmation or safe error.
   - The UI must not reveal raw persona ids, owner ids, reporter ids, provider
     traces, database errors, or private context.

7. Desktop and mobile
   - Rehearse at a desktop viewport.
   - Rehearse at a narrow mobile viewport around 375px wide.
   - Check that visible controls are reachable, text does not overlap, and the
     chat/source/report states do not feel like placeholder UI.

## Defects To Name Exactly

Wake DAEDALUS only if you find a concrete code/product defect such as:

- stale or missing route after a fresh deploy;
- public chat enabled state cannot be reached despite seed/config saying it
  should be enabled;
- signed-out disabled state is misleading;
- enabled chat sends or displays private-source claims;
- dead controls, broken buttons, or unhandled errors;
- raw ids, database errors, owner/provider details, or private context visible;
- mobile layout overlap or inaccessible controls.

Wake ARGUS only if the defect is primarily privacy/security/overclaim risk.

Wake MIMIR if the result is pass, if the environment is stale/missing seed, or
if the next slice is a sequencing decision rather than a direct patch.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: missing enabled public-chat seed
FAIL: product/code defect
```

Include:

- route(s) tested;
- signed-out result;
- signed-in result, if available;
- desktop/mobile notes;
- public-source/privacy verdict;
- exact next wakeup target and reason.

## Wakeup

When complete, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR209 public persona chat alpha on the deployed route.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR209 or route the smallest concrete follow-up to DAEDALUS or ARGUS.
```
