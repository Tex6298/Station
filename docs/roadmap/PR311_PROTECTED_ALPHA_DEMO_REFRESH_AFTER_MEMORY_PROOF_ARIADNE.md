# PR311 - Protected-Alpha Demo Refresh After Memory Proof

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Complete

## Trigger

PR310 passed and closes the PR308/PR309 Memory readback route caveat. KVASIR
completed ADV-001 and recommends an evidence-first protected-alpha demo refresh
instead of opening another implementation lane by default.

MIMIR accepts that recommendation.

## Task

Run a hosted/browser protected-alpha demo refresh using the current staging
surface. This is a route/journey rehearsal, not broad UI redesign and not a
mutation-heavy test pass.

Use the existing replay-owner access and staging endpoints if still available.
No new config from Marty is expected for this lane.

## Required Journey

Check the prepared protected-alpha journey still reads coherently after the
accepted Memory proof:

- Hosted freshness: web/API should be healthy and ready, with web including the
  PR309 runtime line `e9332fe5` or later.
- Owner session: replay owner can reach Studio without exposing credentials,
  cookies, tokens, raw ids, SQL, logs, prompts, completions, provider payloads,
  or private source bodies.
- Studio/persona: owner can reach the intended replay persona workspace.
- Memory: owner reaches Memory through `Open Memory`; selected,
  eligible-not-selected, lifecycle-held-out buckets and held-out badges are
  understandable.
- Continuity/provenance: owner can reach the continuity/runtime provenance
  readback and understand source grouping without raw source bodies.
- Archive/export readback: owner can reach at least one archive/import/export
  trust surface and understand current state without implying unavailable
  worker/download behavior.
- Public chain: anonymous or public-safe route through Discover/public content
  remains coherent and does not leak private owner Memory.
- Public Developer Space: public observatory route still frames live/public
  evidence without implying private builder-console access.
- Billing/account readback: current plan/account status is readable as
  readback only; do not run new checkout, portal, or billing mutations.

## Out Of Scope

- Product code changes.
- New data setup unless the existing replay account is unavailable.
- Button-by-button whole-site audit.
- New Stripe, Redis, Cloudflare, provider/model, embedding, queue, worker,
  import, export, schema, retrieval-ranking, or broad UI lanes.
- Reopening selected-pair answer behavior, Memory lifecycle policy, or PR310
  route repair unless a direct regression appears.

## Result Format

Wake MIMIR with one of:

- `PASS`: protected-alpha demo refresh is coherent enough for current staging.
- `PASS WITH CAVEATS`: coherent, with named bounded caveats.
- `FAIL`: concrete user-visible defect needs DAEDALUS.
- `BLOCKED`: stale deploy, auth/test account unavailable, missing seed/persona,
  or tool failure.

Always include:

- exact next-owner recommendation;
- whether Marty config/input is needed;
- the route or surface that drives any proposed follow-up.
