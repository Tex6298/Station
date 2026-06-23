# PR196 - Product Demo Human Walkthrough

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE
Reviewer: MIMIR; DAEDALUS only for concrete UX/code blockers; ARGUS only for
security, visibility, entitlement, auth, privacy, or overclaim risk
Status: open

## Why This Lane

ARGUS completed PR195 and found no implementation blocker. Hosted web/API
health and deployment readiness pass as protected-alpha evidence, and the next
branch is product demo/human walkthrough rather than another speculative
Cloudflare, Redis, provider, worker, billing, or broad UI lane.

ARIADNE should run this as a human-eye product rehearsal using the current
hosted staging route and the existing staging demo narrative. This is not a
request for Marty to do manual QA.

## References

- `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md`
- `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_ARIADNE.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/PR195_POST_PR194_HOSTED_REPLAY_EVIDENCE_REFRESH.md`

## Route Order

Use the accepted narrative order unless a route is unavailable:

1. Public front door: `/`
2. Discover: `/discover`
3. Public Space: `/space/station-replay-alpha`
4. Public document inside the replay Space
5. Linked forum discussion
6. Public Developer Space: `/developer-spaces/station-replay-dev-alpha`
7. Sign in as replay owner using ignored local credentials
8. Studio home: `/studio`
9. Persona workspace
10. Persona Memory
11. Persona Continuity
12. Persona Archive
13. Export Workspace or persona export readback
14. Developer Space manage
15. Billing
16. Settings / observability if present
17. Mobile confidence pass: Studio, Memory, Continuity, Archive

## What To Judge

Classify findings as:

- pass for product demo;
- narrative gap;
- UX friction;
- concrete DAEDALUS blocker;
- security/visibility/entitlement/auth/privacy concern for ARGUS;
- future polish.

Focus on:

- whether the route order tells a coherent Station story;
- whether private/public/community/owner boundaries are explainable;
- whether Memory, Continuity, Archive, Export, Billing, Developer Space, and
  Observability can be shown without forbidden claims;
- whether the recent Continuity readability fix holds in the full demo path;
- whether any button/control or route visibly feels broken in the demo path;
- whether mobile confidence routes still fit without document-level horizontal
  overflow.

## Boundaries

Do not:

- change code, schema, migrations, Railway, Supabase, Stripe, Redis, Cloudflare,
  provider, worker, queue, billing, auth/session, or deployment config;
- print or commit secrets, tokens, cookies, owner IDs, Stripe IDs, Checkout
  URLs, webhook payloads, raw response bodies, prompts, completions, private
  excerpts, raw corpus text, provider payloads, or screenshots;
- claim production readiness, live-money billing, Redis runtime dependency,
  Cloudflare runtime dependency, full workspace export, PDF/binary export,
  durable background jobs, or broad production search quality;
- reopen generic Discern parity or broad site-wide polish.

Allowed:

- human-eye hosted route rehearsal;
- temporary local screenshots or notes that are not committed;
- docs-only verdict;
- precise DAEDALUS or ARGUS handoff recommendation if evidence demands it.

## Expected Response

Wake MIMIR with:

- pass/fail for product demo readiness;
- top narrative gap, if any;
- top UX friction, if any;
- concrete blocker, if any, with exact route/control/state;
- recommended next branch and owner;
- validation/probes run.

Do not go quiet without a wakeup.
