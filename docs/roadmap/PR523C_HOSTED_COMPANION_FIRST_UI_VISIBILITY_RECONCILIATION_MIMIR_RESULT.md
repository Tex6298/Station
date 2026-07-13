# PR523C - Hosted Companion-First UI Visibility Reconciliation MIMIR Result

Owner: MIMIR / A1

Date: 2026-07-13

Result:

```text
BLOCK_PR523C_ON_COMPANION_ENTRY_DISCOVERABILITY
```

## Why MIMIR Completed The Diagnostic

ARIADNE consumed the original PR523C wakeup but did not commit a result or
blocker. After more than fifty minutes, MIMIR issued a second wake requesting a
result or exact blocker. That wake remained unconsumed while the lane was
otherwise idle, so MIMIR ran a read-only hosted browser diagnostic rather than
leave the product defect unclassified.

ARIADNE still receives the post-repair human rehearsal. This result does not
remove the independent UX pass.

## Hosted Facts

Deployment freshness is not the blocker:

```text
Companion merge: 4ba3e489334771623522c0cb1726a4532964146e
Hosted web SHA:  b6e1429e0691b53e8543769ebf26d0d6e94552ef
Hosted API SHA:  b6e1429e0691b53e8543769ebf26d0d6e94552ef
```

The hosted replay owner flow passed without printing credentials, tokens,
cookies, raw persona IDs, or private conversation content:

- clean sign-in reached `/studio`;
- a visible persona link existed on `/studio`;
- clicking the visible control reached the owner-private persona route;
- desktop showed `Private companion`, owner-only framing, the private
  conversation surface, `Advanced Studio`, and Memory, Inbox, Timeline,
  Profile, and Integrity shortcuts;
- refresh preserved the signed-in persona route;
- `390px` mobile showed the companion header, private conversation surface,
  shortcut navigation, and no document-level horizontal overflow;
- Memory Inbox was reachable through the visible Inbox shortcut;
- no browser page errors were observed.

MIMIR also inspected the resulting desktop and mobile first viewports. The
companion correction is visibly deployed and uses the intended light
companion-first shell.

## Classification

The product owner's missing UI is not explained by stale deployment, absent
implementation, missing replay persona, broken sign-in persistence, a hidden
persona route, or mobile overflow.

The remaining defect is entry discoverability:

- `/studio` still opens a dashboard;
- its first-viewport action row emphasizes `Choose Path`, `New Persona`, and
  `Open Public Space`;
- the companion-first correction becomes obvious only after the owner finds
  and opens a persona/New Chat control lower in the dashboard/sidebar;
- this allows a product owner to enter Studio and reasonably conclude that the
  requested companion correction is absent.

The companion route itself should remain distinct. An automatic redirect would
hide useful dashboard work and behave poorly for multi-persona owners. The
smallest repair is an explicit first-viewport `Open Companion` action whenever
the owner already has a persona.

## Decision

Open PR523D for DAEDALUS:

```text
PR523D - Studio Companion Entry Affordance Repair
```

The repair must make the existing companion home unmistakably reachable from
the `/studio` first viewport without changing the companion route, auto-
redirecting owners, reskinning the dashboard, or widening product scope.

After implementation, ARGUS reviews the route/state boundary and ARIADNE runs
the hosted human rehearsal from `/studio` on desktop and mobile.
