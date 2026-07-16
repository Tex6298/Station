# PR528 - Important Routes Partner Pass

Owner: MIMIR / A1

Opened: 2026-07-16

Status: Open - partner-readiness pass

```text
OPEN_PR528_IMPORTANT_ROUTES_PARTNER_PASS
```

## Purpose

Prepare the hosted product for Marty and his partner to judge Station's working
shape, visual quality, and principal journeys. This is a customer-facing
partner-readiness pass, not another exhaustive evidence sweep and not a claim
that every route is finished.

The team chooses the exact principal routes from current product evidence. A
route belongs in this pass when a partner is likely to use it to understand the
product or when its failure would materially distort that understanding.

## Sequence

1. `PR528A`: ARIADNE performs a human-eye hosted preflight, selects the
   principal route set, and returns a bounded fix-now packet plus exact PR529
   deferrals.
2. `PR528B`: DAEDALUS implements only the accepted route blockers, sliced when
   ownership or risk requires it.
3. `PR528C`: ARGUS reviews behavior, truth, privacy, and regression boundaries.
4. `PR528D`: ARIADNE rehearses the accepted important routes on one exact
   deployed SHA in Light and Dark at representative desktop and mobile sizes.
5. MIMIR publishes a concise route checklist and the hosted partner-review URL,
   then pauses further UI integration for Marty and his partner's review.

## Route Selection

Use current hosted evidence rather than a page-count quota. Candidate route
families include:

- public front door, Discover, public Space/document, and linked discussion;
- sign-in/session return and the authenticated Studio dashboard;
- existing persona companion home/chat, Memory inbox, Memory, Continuity,
  Archive, Integrity, Timeline, and Profile shortcuts;
- Forums index/thread and the core participation path;
- public persona and Developer Space observatory where discoverable;
- Billing, provider setup, and Settings where they are necessary to explain or
  unblock the principal experience.

The selected set may be smaller. Record why each route is principal and name
its one core action. Do not widen the pass merely because a route exists.

## Fix-Now Boundary

Fix now only when an important route is:

- broken or unable to complete its core action;
- misleading about persistence, entitlement, privacy, availability, or state;
- visibly incoherent with Station's accepted visual language;
- unusable at partner-review desktop/mobile sizes; or
- blocked by a direct dependency that can be repaired in one bounded slice.

Do not expand this pass for secondary counters, exhaustive fixtures,
low-impact polish, unsupported future capability, or route details that do not
impair partner judgment. Any such finding must be recorded in PR529 with route,
impact, evidence/origin, deferment reason, likely owner, and explicit resume
trigger.

## Design Boundary

Preserve Tex Station's current architecture, shared Light/Dark system, and
Discern-informed product behaviors already translated into the repo. Improve
local composition and interaction where a selected route needs it. Do not
wholesale import Discern CSS, broadly reskin unrelated pages, or make every
surface look identical. Navigation, operational tools, companion work, public
reading, and developer observatories may retain appropriate density and
character while still feeling like one product.

## Acceptance

- One exact hosted SHA is healthy and ready.
- Every selected principal route completes its named core action or renders an
  exact truthful unavailable state.
- Light and Dark pass at representative `1440x900` desktop and `390x844`
  mobile sizes; add `375x812` only where the route's composition makes it a
  meaningful risk.
- No incoherent overlap, horizontal escape, unreadable meaningful text,
  deceptive enabled control, private-data leak, or unclassified browser error
  remains on the selected routes.
- Reversible rehearsal writes are restored exactly; irreversible fixtures are
  not invented for visual coverage.
- Marty receives a one-screen checklist and
  `https://stationweb-production.up.railway.app` for partner review.
- Further UI integration and micro-fixing pause for partner feedback; overall
  UI integration is not called complete before that checkpoint.

