# PR497A - Companion Home Usability Translation Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Source

ARGUS accepted PR497A:

`docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_REVIEW_RESULT.md`

Result:

```text
ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION_IMPLEMENTATION
```

Hosted proof is required before MIMIR closes PR497A because the private persona
home first-viewport hierarchy and mobile layout changed.

## Task

Run hosted human-eye proof on:

```text
/studio/personas/:personaId
```

Use the hosted Railway web app and a signed-in owner persona. Verify hosted web
freshness at PR497A review commit `f19101c0` or later before judging the UI.

## Required Checks

Desktop proof:

- signed-in owner can reach the private persona home;
- first viewport leads with the existing persona identity/header, then
  companion-first home content: private chat, companion shortcuts, and compact
  continuity/context rail;
- the older admin/readback stack still exists but is lower/secondary;
- "Companion Home" or equivalent companion-home framing is visible;
- Memory/Inbox/Timeline/Profile/Integrity-style actions are near the chat and
  read as companion actions, not generic admin tabs;
- context rail uses aggregate owner-only copy and does not expose raw private
  rows or pending-only claims.

Mobile proof:

- repeat the route at `375px` and `390px`;
- the home grid, private chat, return-card controls, shortcut strip, and context
  rail stack cleanly;
- no horizontal overflow, clipped labels, broken tap targets, or incoherent
  overlap;
- long return labels such as `Pick up where you left off` remain readable.

Behavior/boundary proof:

- return actions remain owner-triggered and local: focus composer, prefill a
  recap request, or clear local thread state only;
- provider/setup, empty, loading, and error copy remains truthful;
- public interaction readback, voice/avatar readiness, encounter contracts,
  Runtime Context Preview, archive export, and published continuity history are
  still reachable below or as secondary sections;
- no public chat behavior, API route, provider/runtime, prompt, schema, billing,
  Redis, Cloudflare, worker, queue, stale endpoint, placeholder control,
  automation/autonomy claim, private raw source, raw id, provider payload,
  token, cookie, stack trace, or secret-shaped value appears.

## Result Required

Create:

```text
docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_REHEARSAL_RESULT.md
```

Return one of:

```text
PASS_READY_FOR_PR497A_CLOSEOUT
PASS_WITH_CAVEAT_READY_FOR_MIMIR_DECISION
PRODUCT_DEFECT_ROUTE_DAEDALUS
BLOCKED_WITH_REASON
```

Include:

- hosted web/API freshness evidence;
- desktop result;
- `375px` result;
- `390px` result;
- privacy/scope scan result;
- any exact defect and whether it blocks closeout.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR497A Companion Home Usability Translation with one narrow
  wording patch.
- MIMIR is routing hosted desktop/375px/390px proof before closeout.
Task:
- Prove the hosted private persona home is companion-first, mobile-safe, and
  still privacy/scope-safe.
- Wake MIMIR with pass, caveat, product defect, or blocker.
```
