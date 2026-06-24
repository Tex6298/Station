# PR266 - Post-Archive UX Lane Selection Audit

Owner: A2 / DAEDALUS
Status: complete
Date: 2026-06-24

## Verdict

DAEDALUS recommends **no new local UX implementation lane right now**.

Next move: **PR267 - Staging Readiness Truth Check**.

This should be a staging-prep/evidence lane, not a product implementation lane.
The current Studio/Archive UI stack is accepted enough for protected-alpha
staging prep, and further local UI work would be polishing ahead of evidence.

## Current-State Checks

### PR264/PR265 UX-02A closeout

Accepted enough to close UX-02A.

Evidence:

- PR264 added per-persona Archive trust rows on
  `/studio/personas/[personaId]/files`.
- ARGUS accepted PR264 with a narrow honesty patch so uploaded file import jobs
  do not double-count as separate source material.
- PR265 passed hosted desktop/mobile rehearsal.
- Current code still renders `archiveTrustStateRows` on the per-persona Archive
  tab, keeps failed imports visible, and leaves storage/quota server-reported.

### UX-02B Persona Export Status

Current. Do not reopen.

Evidence:

- `apps/web/components/studio/archive-export-status.tsx` still owns persona
  export status, package creation, completed manifest readback, portable bundle
  readback, failed error display, and requested/processing states.
- `apps/web/lib/export-trust.ts` still centralizes status tone, labels, summary
  text, section text, and export state grouping.
- The component remains reused by both persona home and the per-persona Archive
  tab.
- No stale hook, missing route, or current-code regression was found.

### UX-DEBT-01 Mobile Top-Nav

Current. Do not reopen.

Evidence:

- `apps/web/components/nav/top-nav.tsx` still uses scoped top-nav classes and
  the shared `SIGNED_MOBILE_TOP_NAV_MENU_ROUTES` source of truth.
- `apps/web/app/globals.css` still bounds mobile nav inside the 52px top bar,
  collapses the signed-in account control under 920px, and hides signed-in route
  labels under 640px.
- `apps/web/app/layout.tsx` still uses the same `top-nav-loading` class as the
  hydrated nav shell.
- No specific regression was found in the inspected code.

## Recommended Next Move

Title: **PR267 - Staging Readiness Truth Check**

Owner: MIMIR/human for external deployment facts, with DAEDALUS only if a
repo-side drift or docs patch is named.

Scope:

- Reconcile current hosted Railway web/API health and deployed commit truth.
- Reconcile Supabase staging migration/auth/storage facts without recording
  secrets.
- Reconcile Stripe test-mode/replay-account prerequisites.
- Reconcile the shortest protected-alpha replay path through Studio, Archive,
  Continuity, public surfaces, Developer Spaces, and Billing.
- Produce a go/no-go staging prep verdict and one named repo-side patch only if
  current evidence shows one is needed.

Non-scope:

- No product feature implementation.
- No broad UI polish, UX-01B, UX-03, public product expansion, or Developer
  Space expansion.
- No Supabase auth/session change, migrations against an unknown project,
  Stripe live-money work, provider/cache/worker changes, or imported concepts.

Risk:

- The main risk is stale external deployment truth. A docs-only local audit
  cannot prove staging readiness without fresh hosted health, Supabase,
  redirect, storage, Stripe, and replay-account facts.

Validation:

- If PR267 is docs/evidence only: `git diff --check`,
  `git diff --cached --check`, and staged credential/raw-id scan.
- If PR267 touches scripts/config: add `node --check` for touched scripts and
  the smallest relevant `pnpm` validation gate.
- If hosted access is available: web/API `/health` and `/health/deployment`
  checks for the exact deployed commit.

## Why Not The Alternatives

- UX-01B owner console grouping remains useful, but no current code evidence
  makes it a staging blocker.
- UX-03 Continuity and Integrity review UX just received runtime provenance
  readback plus hosted rehearsal; more work should be driven by staged replay.
- A narrow Phase 3 public/product lane would add product surface before the
  current protected-alpha path is re-proved in staging.
- A backend/product implementation lane would be premature unless staging truth
  identifies a concrete missing repo-side capability.

PR267 is better because it keeps the team aligned with the stated staging-prep
posture: prove the current accepted stack online before opening more local
implementation.

## Validation

- Product code was inspected but not changed.
- Package tests were not required for this docs-only audit.
