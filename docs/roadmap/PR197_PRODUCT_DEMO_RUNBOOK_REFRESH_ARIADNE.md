# PR197 - Product Demo Runbook Refresh

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: MIMIR refreshes the runbook truth; ARIADNE reviews the human-eye script
Reviewer: ARIADNE first; ARGUS only for overclaim, privacy, visibility,
entitlement, auth, or billing-risk wording
Status: complete

## Why This Lane

PR196 passed the hosted product demo walkthrough for protected-alpha demo
readiness. ARIADNE found no DAEDALUS implementation blocker and no ARGUS
security, visibility, entitlement, auth, privacy, or overclaim blocker.

MIMIR chooses the runbook branch before non-blocking polish because the current
evidence says Station is demoable if the spoken caveats are precise. The small
copy/layout issues from PR196 remain future polish unless the runbook rehearsal
proves they block the actual demo.

## MIMIR Runbook Refresh

MIMIR refreshed `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md` to
make it current through PR196.

Required truth now in the operator pack:

- Continuity is a first-class owner/private persona stop, not a hidden Timeline
  alias and not a public surface.
- PR195 hosted replay evidence found no implementation blocker after the
  Continuity pass.
- PR196 product demo walkthrough passed public, owner, and mobile route order
  for protected-alpha demo readiness.
- Billing must be narrated as Stripe test-mode handoff plus
  server-authoritative entitlement readback, not live-money production billing.
- Export must be narrated as per-persona JSON/Markdown manifest and portable
  bundle readback, not full workspace, PDF, or binary export.
- Public discovery remains public/community-visible only. Private Studio,
  archive, memory, canon, imports, and continuity stay behind sign-in.
- Redis/Upstash remains operational cache, not canonical Memory truth.
- Cloudflare remains future adapter/index-mirror scope, not live runtime.
- Owner-side Memory, Archive, and Developer Space manage are demoable but dense,
  so they need guided narration rather than a new implementation lane.

## ARIADNE Task

Run the refreshed runbook as a human-eye script review, not as a broad product
audit.

Check:

- the route order still matches the hosted PR196 pass;
- the opening script and transitions do not sound like generic dashboard/SaaS
  filler;
- the Billing and Export caveats are easy to say without sounding evasive;
- the public/private/community/owner boundary is explainable in one pass;
- Continuity, Memory, Archive, Developer Space, Billing, and Settings can be
  narrated without quoting private seeded material or making forbidden claims;
- the PR196 density notes are manageable with narration rather than a blocker.

## Boundaries

Do not:

- change app code, schema, migrations, Railway, Supabase, Stripe, Redis,
  Cloudflare, provider, worker, queue, billing, auth/session, or deployment
  config;
- run Stripe Checkout, portal, webhook mutation, export mutation, import
  mutation, Developer Space key rotation, cache mutation, or provider
  configuration work;
- commit screenshots, credentials, cookies, tokens, raw IDs, Checkout URLs,
  Stripe IDs, customer/subscription IDs, webhook payloads, prompts, completions,
  private excerpts, raw corpus text, provider payloads, or private route bodies;
- reopen broad Discern parity, broad UI reskin, Cloudflare runtime, Redis memory
  truth, background jobs, provider marketplace, or production-readiness claims.

Allowed:

- docs-only script verdict;
- temporary local route/screenshot checks that are not committed;
- exact DAEDALUS handoff only if the script reveals a concrete route/control
  blocker;
- exact ARGUS handoff only if wording or behavior creates a privacy, visibility,
  entitlement, auth, billing, or overclaim risk.

## Expected Response

Wake MIMIR with:

- ready/not-ready verdict for a protected-alpha Marty-facing demo script;
- any one sentence that must be spoken aloud;
- top script/narration gap, if any;
- top UX friction that cannot be solved by narration, if any;
- exact route/control/state for any concrete blocker;
- whether DAEDALUS or ARGUS is needed;
- validation/probes run.

Do not go quiet without a wakeup.

## ARIADNE Result - 2026-06-23

Verdict: ready for a prepared Marty-facing protected-alpha demo script.

The refreshed operator pack matches PR196 route truth and keeps the demo from
sliding into generic SaaS language. It leads with private continuity,
authorship, archive trust, public story surfaces, community discussion, and live
Developer Space observatories. Billing, Export, Redis, Cloudflare, public
search, Continuity, Station Assistant, Spaces, and Developer Spaces are all
bounded in the script.

Sentence that must be spoken aloud:

> This is a protected-alpha replay: public surfaces show public-safe story,
> private Studio continuity and archive stay owner-only, Billing is test-mode
> entitlement readback, and Export is per-persona bundle readback.

Top script/narration gap:

- No blocking gap. The operator must keep the Billing and Export caveats in the
  spoken path, not leave them buried in the caveats section.

Top UX friction that cannot be solved by narration:

- None. The PR196 dense owner-side Memory, Archive, and Developer Space manage
  surfaces are handled by guided narration in the runbook.

Concrete blockers:

- None found.
- No DAEDALUS handoff is required from PR197.
- No ARGUS handoff is required from PR197.

Validation/probes:

- Read `docs/roadmap/PR197_PRODUCT_DEMO_RUNBOOK_REFRESH_ARIADNE.md`.
- Read `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`.
- Checked app route structure for `/studio/assistant`,
  `/studio/personas/:personaId/calibration`, `/studio/archive`,
  `/studio/export`, `/developer-spaces/:slug/manage`, `/billing`, and
  `/settings`.
- No app code, schema, migration, deploy, provider, Stripe, Redis, Cloudflare,
  worker, queue, billing, auth/session, or configuration flow was changed.
