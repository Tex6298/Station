# PR196 - Product Demo Human Walkthrough

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE
Reviewer: MIMIR; DAEDALUS only for concrete UX/code blockers; ARGUS only for
security, visibility, entitlement, auth, privacy, or overclaim risk
Status: complete

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

## ARIADNE Result - 2026-06-23

Verdict: pass for protected-alpha product demo readiness.

The hosted route order now tells a coherent Station story:

1. Public front door and Discover explain that public search is limited to
   Spaces, Developer Spaces, publications, and forum threads.
2. The replay Space reads as a public microsite with published work, public
   document presentation, and a linked community discussion.
3. The public Developer Space reads as a live observatory with public nodes,
   public signals, current snapshot, project evidence, and explicit copy that
   visitors do not see ingestion keys, credentials, private archive text,
   prompts, raw owner console data, or unpublished notes.
4. Signed-in Studio, persona workspace, Memory, Continuity, Archive, Export,
   Developer Space manage, Billing, and Settings remain owner/workbench
   surfaces and are explainable without crossing privacy or visibility
   boundaries.
5. Mobile Studio, Memory, Continuity, and Archive fit without document-level
   horizontal overflow in the checked viewport.

Top narrative gap:

- The demo script should explicitly say that Billing is a Stripe test-mode
  handoff plus server-authoritative entitlement readback, not live-money
  production billing. It should also say that Export is currently per-persona
  JSON/Markdown manifest and portable bundle readback, not full workspace
  export.

Top UX friction:

- The route stack is demoable, but the owner-side Memory, Archive, and
  Developer Space manage surfaces are long and dense. They need guided narration
  during the demo. Continuity's main trust cards and record cards are readable,
  while the runtime source-context preview cards remain softer than the primary
  evidence cards.
- Public Space and Developer Space stat/evidence chips occasionally wrap or
  compress on narrow cards. This does not block the demo, but it is a polish
  target for a later ARIADNE slice.

Concrete blockers:

- None found.
- No DAEDALUS handoff is required from PR196.
- No ARGUS handoff is required from PR196.

Recommended next branch and owner:

- MIMIR should close PR196 and choose the next planning branch. If the next move
  is a Marty-facing demo, keep ownership with MIMIR for the demo runbook/script
  and wake ARIADNE only if a small copy/layout slice is needed before the demo.

Validation/probes:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr196-product-demo-walkthrough.spec.js --reporter=line --workers=1`
  passed against the hosted web/API route stack.
- Covered public routes: `/`, `/discover`, `/space/station-replay-alpha`,
  public replay document, linked forum discussion, and
  `/developer-spaces/station-replay-dev-alpha`.
- Covered owner routes: `/studio`, persona workspace, Memory, Continuity,
  Archive, `/studio/export`, Developer Space manage, `/billing`, and
  `/settings`.
- Covered mobile confidence routes: Studio, Memory, Continuity, and Archive.
- Temporary screenshots were inspected locally and not committed.
- No code, schema, migration, deploy, provider, Stripe, Redis, Cloudflare,
  worker, queue, billing, auth/session, or configuration flow was changed.
