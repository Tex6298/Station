# PR478 - Community Reputation / Moderator Expansion Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR477A is closed. The next feature-expansion choice should move to a different
named Phase 3/customer-facing capability, not deepen Document Migrator.

Community Beta is protected-beta complete, but richer community/reputation and
moderator surfaces remain a documented future expansion. PR108 accepted the
existing community loops: forums, visibility, creation, document discussions,
moderation/reporting, review requests, notifications, subcommunities, delegated
moderation, witness controls, and private recognition readback.

This lane asks ARGUS to choose the smallest honest next slice, or name the exact
blocker and smallest unblock.

## Required ARGUS Output

Return exactly one of:

- `ACCEPT_PR478A_COMMUNITY_TRUST_READBACK`
- `ACCEPT_PR478A_MODERATOR_QUEUE_CONTEXT`
- `BLOCKED_UNBLOCK_FIRST`
- `REJECT_DEFER`
- `NEEDS_MIMIR_DECISION`

## Preferred Slices

### 1. Community Trust Readback

Add safer visible context around existing witness, recognition, report, or
community-trust states.

Allowed shape:

- aggregate/status/readback only
- no public points, badges, rankings, leaderboards, user scores, clout, or
  reputation profile
- no reporter identity exposure
- no raw moderation internals

### 2. Moderator Queue Context

Improve the human moderation queue with safer target context, status grouping,
or route clarity.

Allowed shape:

- preserve existing platform-admin/subcommunity-owner/delegated-moderator gates
- no new moderation powers
- no automated moderation
- no public moderator directory

### 3. Smallest Unblock

If neither feature slice is safe, name the exact smallest unblock:

- trust-label contract
- report-redaction contract
- delegated moderator readback contract
- evidence/route safety contract
- schema contract only if no existing route/table can honestly support the
  chosen slice

## Questions For ARGUS

- Which existing community surfaces and routes should be reused?
- Is trust/readback or moderator queue context the smaller safe customer-facing
  expansion?
- Can trust be visible without scores, rankings, badges, leaderboards, or
  clout?
- Which report/moderation fields must remain admin/delegated-only?
- Can this reuse existing tables/routes without schema?
- If schema is required, is that a blocker or the smallest unblock?
- What files and tests should DAEDALUS touch?
- What exact hosted human rehearsal should ARIADNE run?

## Guardrails

Do not open:

- public leaderboards, badges, rankings, scores, clout, reputation profiles, or
  user dossiers
- public moderator directories or public reporter lists
- new moderation powers or new destructive actions
- automated moderation, provider/model moderation calls, AI judgment, or
  autonomous moderation
- broad forum redesign
- billing, Stripe, auth/session policy, Redis, Cloudflare, workers, queues, or
  notifications rewrite

Do not expose:

- raw report IDs
- reporter identities
- private comments
- deleted or hidden content bodies
- moderation notes
- admin-only internals
- SQL/table details
- stack traces
- provider payloads

Do not weaken:

- platform-admin gates
- subcommunity-owner gates
- delegated-moderator gates
- reporter privacy
- hidden/removed/deleted content boundaries

## Inputs

- `docs/roadmap/PR477A_OWNER_DOCUMENT_MIGRATOR_IMPORT_PREVIEW_CLOSEOUT.md`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `apps/web/app/forums`
- `apps/web/lib/community-moderation.ts`
- `apps/api/src/routes/reports.ts`
- current `test:community`, `test:reports`, `test:document-discussions`, and
  `test:studio-ui`

## Wakeup Path

If accepted, wake DAEDALUS with the chosen PR478A slice, exact touched areas,
tests, and guardrails.

If blocked or ambiguous, wake MIMIR with the concrete blocker or decision point.
