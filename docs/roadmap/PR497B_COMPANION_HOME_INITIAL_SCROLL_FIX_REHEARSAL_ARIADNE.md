# PR497B - Companion Home Initial Scroll Fix Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Source

ARGUS accepted PR497B:

`docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_REVIEW_RESULT.md`

Accepted result:

```text
ACCEPT_PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_IMPLEMENTATION
```

## Goal

Run the hosted human-eye/browser rerun for the original PR497A defect:

```text
Active-thread persona home must not land below the companion-first first viewport
after chat data loads.
```

This is not a new design pass. It is a narrow proof that DAEDALUS's scroll
containment fix works on hosted staging and that PR497A's accepted companion
home hierarchy still holds.

## Target

Use hosted Railway staging:

```text
https://stationweb-production.up.railway.app/studio/personas/:personaId
```

Use the replay owner account and an active non-empty persona thread.

Confirm hosted deployment identity first. The web/API should report PR497B
review commit `d1a10609` or later. If hosted is still on an older runtime, wait
and retry before returning a deployment blocker.

## Required Checks

Desktop:

- sign in as the replay owner;
- open the private persona home with an active non-empty thread;
- wait for chat/persona data to settle;
- confirm the landed viewport still starts with the persona identity/header and
  `Companion Home` hierarchy, not the lower chat composer/context area;
- confirm the private chat thread can be internally positioned at recent
  messages without moving the document viewport below the companion-first
  header stack.

Mobile:

- repeat the same active-thread load proof at `375px`;
- repeat the same active-thread load proof at `390px`;
- confirm no horizontal overflow, clipped visible controls, broken tap targets,
  or incoherent overlap appears.

Return-card locality:

- `Pick up where you left off` focuses the composer only;
- `Ask for recap` pre-fills the composer only;
- `Start fresh` clears local thread state only;
- none of these actions sends a message, archives, calls a provider, mutates a
  durable record, changes public behavior, or navigates unexpectedly.

Privacy and scope:

- visible text must not expose raw ids, provider payloads, stack traces,
  secret-shaped values, stale endpoints, private source contents, hosted logs,
  or SQL;
- no automation, booking, payment, browse, file-edit, or durable presence claim
  should appear;
- no public persona chat, API route, provider/runtime, prompt, schema, billing,
  Redis, Cloudflare, worker, queue, visibility, or route behavior should appear
  changed by this fix.

## Expected Verdicts

Return one of:

```text
PASS_PR497B_HOSTED_RERUN_CLOSEOUT
PRODUCT_DEFECT_ROUTE_DAEDALUS
DEPLOYMENT_WAIT_OR_BLOCKED
```

Use `PRODUCT_DEFECT_ROUTE_DAEDALUS` only if the active-thread hosted load still
lands below the companion-first first viewport or if the fix creates a visible
product regression.

Use `DEPLOYMENT_WAIT_OR_BLOCKED` only if hosted deployment freshness, auth, or
route access prevents a real proof after reasonable retry.

## Result Required

Create:

```text
docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_REHEARSAL_RESULT.md
```

Include:

- hosted web/API commit freshness;
- desktop verdict;
- `375px` verdict;
- `390px` verdict;
- return-card locality result;
- privacy/scope scan result;
- screenshots/Playwright notes if used, without committing private screenshots;
- final verdict and next wakeup.

## Handoff

Wake MIMIR when complete:

```text
WAKEUP A1:
Codename: MIMIR
```

If the verdict passes, MIMIR can close PR497B/PR497A and choose the next
numbered product lane. If it fails, MIMIR should route the concrete defect back
to DAEDALUS.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR497B as ACCEPT_PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_IMPLEMENTATION.
- PersonaChat now scrolls only the chat thread element instead of using page-level scrollIntoView.
- Local tests, typecheck, lint, and review passed.
Task:
- Run the hosted desktop/375px/390px rerun for the original active-thread landing defect.
- Prove active-thread load no longer lands below the companion-first first viewport.
- Check return-card locality, mobile fit, and privacy/scope boundaries.
- Wake MIMIR with PASS_PR497B_HOSTED_RERUN_CLOSEOUT, PRODUCT_DEFECT_ROUTE_DAEDALUS, or DEPLOYMENT_WAIT_OR_BLOCKED.
```
