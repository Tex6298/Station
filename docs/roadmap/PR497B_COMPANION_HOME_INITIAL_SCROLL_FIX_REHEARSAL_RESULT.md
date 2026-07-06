# PR497B - Companion Home Initial Scroll Fix Hosted Rerun Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: `PASS_PR497B_HOSTED_RERUN_CLOSEOUT`

Return value:

```text
PASS_PR497B_HOSTED_RERUN_CLOSEOUT
```

## Scope

ARIADNE ran the hosted rerun requested in:

`docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_REHEARSAL_ARIADNE.md`

Target:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId`

The proof used a signed-in replay owner persona with an active non-empty latest
thread and covered desktop, `375px`, and `390px` browser widths.

## Hosted Freshness

Hosted web and API deployment identity both reported the accepted PR497B code
commit:

```text
3d854083
```

ARGUS review commit:

```text
d1a10609
```

The review and routing commits after `3d854083` are docs/state-only, so Railway
correctly stayed on the accepted code deploy. The hosted runtime under proof is
the PR497B scroll containment implementation.

## Desktop Verdict

Desktop passed.

- The signed-in owner reached the private persona home.
- After active-thread chat data settled, document `scrollY` remained `0`.
- The landed viewport starts with the existing private persona identity/header
  and continues into the `Companion Home` hierarchy rather than jumping down to
  the lower chat composer/context rail.
- Companion shortcuts and compact context remain near the private chat.
- The return card is present in the chat area and no longer pulls the whole page
  below the first-viewport hierarchy.
- No document-level horizontal overflow, clipped visible controls, raw-id
  readback, provider payload, stack trace, secret-shaped value, or positive
  automation/booking/payment claim appeared.

## 375px Verdict

`375px` passed.

- The loaded route stayed at document `scrollY` `0`.
- The first viewport kept the top place strip, private persona identity/header,
  current-stop readback, workspace tabs, and the start of `Companion Home`.
- The companion home, private chat, return card, shortcut strip, and context rail
  stack cleanly below without horizontal overflow or broken tap targets.
- Visible text remained free of raw ids, provider payloads, stack traces,
  secret-shaped values, and forbidden positive capability claims.

## 390px Verdict

`390px` passed.

- The loaded route stayed at document `scrollY` `0`.
- The first viewport kept the same intended identity/header and Companion Home
  landing.
- The return card was scrolled into view for focused inspection; `Pick up where
  you left off`, `Ask for recap`, and `Start fresh` all fit as full-width mobile
  controls with no clipping or overlap.

## Return Action Locality

The return-card actions remained local and owner-triggered:

- `Ask for recap` prefilled the composer only;
- `Pick up where you left off` focused the composer only;
- `Start fresh` cleared local thread state only;
- no send, archive, provider call, durable record mutation, public behavior
  change, or unexpected navigation occurred.

## Privacy And Scope Scan

The hosted proof found no privacy/scope leak:

- visible body text did not expose raw ids, provider payloads, stack traces,
  hosted logs, SQL, or secret-shaped values;
- no stale endpoint text appeared;
- positive automation/autonomy, booking, payment, ticket, browsing, file-edit,
  or durable-presence claims were absent;
- public persona chat behavior, API routes, provider/runtime, prompt, schema,
  billing, Redis, Cloudflare, worker, queue, visibility, and route behavior did
  not drift.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Playwright/browser rerun | Pass | Fresh hosted app at accepted code commit `3d854083`; desktop/`375px`/`390px` active-thread load stayed at document `scrollY` `0`, return-card locality passed, and privacy/scope scan passed. |
| Screenshot inspection | Pass | Temporary screenshots confirmed the first viewport no longer lands below the Companion Home hierarchy and return-card mobile controls fit. Screenshots were not committed. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR497B hosted desktop/375px/390px rerun.
- Hosted web/API ran accepted PR497B code commit 3d854083; later review/routing
  commits were docs/state-only.
- Active-thread persona home now stays at document scrollY 0 after chat data
  loads, preserving the identity/header and Companion Home first viewport.
- Return-card locality, mobile fit, and privacy/scope boundaries passed.

Next:
- Close PR497B/PR497A if MIMIR agrees, then choose the next numbered product
  lane.
```
