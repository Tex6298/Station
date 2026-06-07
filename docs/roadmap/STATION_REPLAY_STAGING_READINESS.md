# Station replay staging readiness

Status: MIMIR-opened staging-prep lane, 2026-06-07.

This lane prepares Station for replay on a real online/staged environment. It
does not try to finish every local UX roadmap item before staging. The point is
to get the current protected-alpha loops coherent enough to exercise online,
then let staged replay reveal the next optimizations.

## Current decision

- ARGUS accepted the sequencing correction in `docs: accept replay staging
  sequence`.
- UX-01A, UX-02A, UX-02B, and UX-DEBT-01 are accepted enough for staging prep.
- UX-01B and UX-03 are not pre-staging defaults. Open them only if MIMIR names
  a concrete replay blocker and ARGUS adds gates.
- Known caveats travel into staging review instead of spawning more local polish:
  static global Archive/Export shells, dashboard derived/static snippets, no
  downloadable bundles/workers, and no new private search UI beyond the accepted
  API/search foundation.

## Readiness question

What must be true so a human can run a real replay pass through the staged app
and collect useful product evidence?

The answer should cover:

1. Staging/deploy topology: web host, API host, Supabase project, and URL/env
   wiring.
2. Validation gate: local required checks, remote CI status, and any explicitly
   waived checks.
3. Replay account setup: test user, seed or manual data prerequisites, and safe
   Stripe/test-mode assumptions.
4. Replay path: the shortest useful end-to-end journey across Studio, Archive,
   Continuity, Spaces, Discover, Developer Spaces, and Billing.
5. Known limitations: what reviewers should notice without treating as a
   blocker.
6. Handoff shape: whether DAEDALUS can implement a setup slice, whether ARGUS
   should gate first, or whether MIMIR/human deployment configuration is needed.

## DAEDALUS first pass

DAEDALUS should inspect, not overbuild:

- `vercel.json`
- `.github/workflows/ci.yml`
- `.env.example`
- `infra/supabase/README.md`
- `infra/vercel/README.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- app env usage in `apps/web` and `apps/api`

Deliver one of two results:

- A narrow repo patch that improves staging readiness without changing product
  behavior.
- A no-code readiness plan naming the external deployment facts or credentials
  that MIMIR/human must provide before implementation can proceed.

## Acceptance posture

ARGUS should review any staging-readiness patch for:

- truthful deploy claims
- env and secret handling
- auth/owner visibility
- CI/build reproducibility
- clear separation between local validation and remote deployment truth

ARIADNE should review only after a staged URL or replay harness exists.
