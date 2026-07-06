# PR497A - Companion Home Usability Translation Hosted Rehearsal Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: `PRODUCT_DEFECT_ROUTE_DAEDALUS`

Return value:

```text
PRODUCT_DEFECT_ROUTE_DAEDALUS
```

## Scope

ARIADNE ran the hosted proof requested in:

`docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_REHEARSAL_ARIADNE.md`

Target:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId`

The proof used a signed-in replay owner persona and covered desktop, `375px`,
and `390px` browser widths.

## Hosted Freshness

Hosted web and API deployment identity both reported:

```text
f19101c0
```

That is the accepted PR497A review commit, so the hosted app was fresh enough
to judge this lane.

The replay owner authenticated successfully with a `canon` tier account.

## Desktop Result

Desktop passed the structural and privacy checks:

- the owner reached the private persona home;
- the page contains the existing persona identity/header, `Companion Home`,
  private chat, companion shortcuts, and compact continuity/context rail;
- Memory, Inbox, Timeline, Profile, and Integrity actions are near the chat and
  read as companion actions;
- the context rail uses aggregate owner-only copy, including the neutral Inbox
  wording `Suggested Memory and Canon review stop.`;
- continuity cards, public interaction readback, voice/avatar readiness,
  encounter readbacks, Runtime Context Preview, archive export, and published
  continuity history remain reachable below the companion home;
- no document-level horizontal overflow, clipped visible controls, exposed raw
  ids, provider payload, stack trace, secret-shaped value, or positive
  automation/booking/payment claim appeared.

Desktop product defect:

- with an active non-empty thread, the loaded chat auto-scrolls the document
  down to the lower chat/composer area;
- that means the final landed viewport no longer starts with the existing
  identity/header followed by the Companion Home heading, shortcuts, and return
  card.

## 375px Result

The `375px` mobile layout passed fit and privacy checks:

- the top place strip, companion chat, shortcut strip, context rail, continuity
  cards, and lower admin/readback stack remain one-column and readable;
- no horizontal overflow, clipped visible controls, broken tap targets, or
  incoherent overlap appeared;
- visible text did not expose raw ids, provider payloads, stack traces,
  secret-shaped values, or forbidden positive capability claims.

Mobile product defect:

- after active-thread chat data loads, the route scrolls past the intended top
  identity/Companion Home hierarchy and lands near the chat composer/context
  area.

## 390px Result

The `390px` mobile layout passed fit and privacy checks:

- the same one-column structure held at `390px`;
- the context rail remained aggregate-only and owner-only;
- the return card was manually scrolled into view and its long
  `Pick up where you left off` control stacked cleanly as a full-width button;
- `Ask for recap` and `Start fresh` also fit without clipping or overlap.

The same active-thread auto-scroll defect appeared at `390px`.

## Return Action Proof

The return-card actions stayed local and owner-triggered:

- `Ask for recap` prefilled the composer with a recap request;
- `Pick up where you left off` focused the composer;
- `Start fresh` cleared the local thread state and showed the empty private chat
  state;
- no send, archive, API mutation, provider call, durable write, or public route
  behavior was triggered by those return-card controls.

## Privacy And Scope Scan

The hosted proof found no privacy/scope leak:

- visible body text did not show raw ids, provider payloads, stack traces, or
  secret-shaped values;
- positive automation/autonomy, booking, payment, ticket, browsing, or file-edit
  claims were absent;
- the existing negative boundary copy such as autonomous encounters being
  unavailable remained visible and truthful;
- no public chat behavior, API route, provider/runtime, prompt, schema, billing,
  Redis, Cloudflare, worker, queue, stale endpoint, placeholder control, or
  visibility behavior changed during proof.

## Defect

Defect:

```text
Active-thread persona home auto-scrolls below the promised companion-first first viewport.
```

Why it matters:

- PR497A is specifically a first-viewport hierarchy lane.
- The hosted route initially has the right structure, but once active chat
  messages finish loading, the page scrolls down to the lower chat/composer
  area.
- This hides the persona identity/header, Companion Home heading, shortcut
  strip, and return-card controls above the landed viewport.
- The defect is especially noticeable on `375px` and `390px`, where the user
  lands in the middle of the companion home rather than being oriented by the
  intended hierarchy.

Smallest fix:

- keep chat-thread auto-scroll inside the chat thread container, or suppress
  page-level `scrollIntoView` on initial conversation load;
- preserve the existing return-card local actions and manual in-thread scroll
  behavior after the user interacts;
- no API, schema, provider/runtime, prompt, auth, privacy, visibility, billing,
  Redis, Cloudflare, worker, queue, or shell rewrite is needed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Playwright/browser proof | Product defect | Web/API freshness at `f19101c0`, signed-in owner route access, desktop/`375px`/`390px` fit, return-card action behavior, and privacy/scope scan passed; active-thread auto-scroll broke the promised first-viewport landing. |
| Screenshot inspection | Product defect | Temporary screenshots confirmed clean fit and context rail behavior, plus the active-thread auto-scroll landing defect. Screenshots were not committed. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR497A hosted desktop/375px/390px proof.
- Hosted web/API were fresh at f19101c0 and the companion-home layout passed
  mobile fit, return-action locality, and privacy/scope checks.
- Product defect: active-thread persona home auto-scrolls below the promised
  companion-first first viewport, hiding the identity/header, Companion Home
  heading, shortcuts, and return card above the landed viewport.

Next:
- Route DAEDALUS for a narrow page-scroll fix: keep chat auto-scroll contained
  inside the chat thread or suppress initial page-level scroll on conversation
  load.
```
