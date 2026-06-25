# ADV-001 - Next Mainline Lane Synthesis Result

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete for MIMIR review

## Synthesis

PR310 passed and closes the PR308/PR309 Memory route caveat. The current
evidence stack says Station should not open Redis, Cloudflare, provider/model,
embedding, billing, worker, or broad UI work by inertia.

The newest useful truth is:

- PR305/PR306 closed hosted selected-pair recall and finalizer trace semantics.
- PR307/PR309/PR310 closed owner-visible Memory readback and owner-route
  hosted evidence.
- PR260 closed Developer Space Tier 1 protected-alpha for now after docs,
  visible framing, ARGUS gates, and ARIADNE hosted rehearsal.
- PR181 already proved bounded Stripe paid activation in test mode.
- Background jobs, Redis, Cloudflare, provider swaps, and deeper billing remain
  future lanes that need concrete product or replay evidence.

Recommendation: open one evidence-first mainline lane, not another
implementation lane by default.

## Candidate A - Protected-Alpha Demo Refresh After Memory Proof

Proposed owner:

- ARIADNE.

Reason to promote now:

- The last open Memory caveat is closed by hosted browser evidence.
- The selected-pair answer bar and finalizer trace semantics are already
  closed.
- Developer Space Tier 1 is closed for protected alpha.
- The next useful mainline move is to verify the prepared human journey still
  reads coherently with the newly accepted Memory route/readback, then route
  only concrete defects.

Files or surfaces likely touched:

- New roadmap packet, for example
  `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_ARIADNE.md`.
- Result doc under `docs/roadmap/`.
- Hosted routes only during rehearsal:
  - Studio owner persona route;
  - owner Memory route reached through `Open Memory`;
  - Continuity/runtime provenance route;
  - Archive or import/export readback route;
  - public Discover/public content route;
  - public Developer Space route;
  - Billing/account status route only as readback, not new checkout proof.

Acceptance bar:

- Hosted web/API freshness includes the accepted PR309 runtime line used by
  PR310 or later.
- Replay owner can complete the protected-alpha journey without direct Memory
  URL fallback.
- Memory selected, eligible-not-selected, and lifecycle-held-out readback is
  understandable in the actual journey.
- Public surfaces do not expose private Memory, raw ids, prompts, provider
  payloads, credentials, logs, source bodies, or secret-shaped values.
- No new implementation is requested unless the rehearsal finds a concrete
  user-visible defect.

Validation:

- Hosted browser rehearsal, likely Playwright/manual ARIADNE route proof.
- `git diff --check` for result docs.
- No local unit suite unless ARIADNE uncovers a code defect and MIMIR opens a
  repair lane.

Config needed:

- No new product config if the existing PR310 hosted replay owner/session and
  staging endpoints remain available.
- If those are unavailable, this blocks on existing hosted auth/test-account
  access, not on new Stripe/provider/Redis/Cloudflare config.

Privacy/security review needed:

- ARIADNE redaction and public-boundary checks should be included because the
  route crosses private owner Memory and public surfaces.
- ARGUS is not required before the rehearsal because no code is being promoted.

Conflict with active or recently closed lanes:

- No active mainline implementation lane remains after PR310.
- This must not reopen selected-pair answer behavior, retrieval ranking,
  Memory policy, provider/model routing, embeddings, schema, Redis,
  Cloudflare, billing, workers, imports, exports, or broad UI.

## Candidate B - Billing/Product Entitlement Preflight

Proposed owner:

- ARGUS, with MIMIR product decision first if pricing or tier claims change.

Reason to promote now:

- PR181 proves the existing Stripe test-mode activation path, so the next
  commercial lane would need to be a distinct product question: pricing,
  invoices, tax, token top-ups, public tier copy, or checkout/portal UX.
- If Marty wants monetization next, ARGUS should gate claims before DAEDALUS
  changes visible billing behavior.

Files or surfaces likely touched:

- `docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md`
- `docs/roadmap/PR182_POST_STRIPE_READINESS_RECONCILIATION.md`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/web/app/billing/page.tsx`
- `apps/web/lib/billing-plan-actions.ts`

Acceptance bar:

- The lane must name one concrete billing product outcome beyond the already
  accepted test-mode activation proof.
- No live-money claim, pricing claim, invoice/tax claim, tipping claim, or
  token-top-up claim without explicit product decision and Stripe test proof.
- Entitlement readback remains server-owned and webhook-backed.

Validation:

- `pnpm test:billing`
- `pnpm test:token-credits` if credits/top-ups are touched.
- `pnpm typecheck`
- `pnpm lint` if web files change.
- `git diff --check`

Config needed:

- Yes, if the lane changes prices, tiers, products, portal behavior, or test
  resources. Marty must provide the product/commercial decision before MIMIR
  opens implementation.

Privacy/security review needed:

- Yes. Stripe webhook signing, subscription state, billing portal boundaries,
  and no-secret docs/output need ARGUS review.

Conflict with active or recently closed lanes:

- No direct conflict with PR310.
- It should not be opened merely to re-prove PR181.
- It should not be bundled into Developer Space Tier 1, which PR260 closed for
  protected alpha.

## Candidate C - Developer Space Partner Pilot Gap Preflight

Proposed owner:

- ARGUS first, then DAEDALUS only if ARGUS finds one bounded docs/visible gap.

Reason to promote now:

- This becomes appropriate only if Marty or a real partner pilot names a gap in
  the current Tier 1 docs, public framing, owner console, or ingestion
  checklist.
- PR260 says Developer Space Tier 1 is closed for protected alpha, so a new
  lane needs a concrete partner need rather than general polish.

Files or surfaces likely touched:

- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`
- `docs/integration/developer-space-tier1-partner-onboarding.md`
- `packages/developer-space-client/README.md`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`

Acceptance bar:

- The lane must identify one real partner-pilot gap.
- Placeholder-only examples in docs.
- No raw keys, signatures, provider payloads, prompts, private source bodies,
  hosted logs, raw ids, or secret-shaped values.
- Tier 1 remains external/self-hosted runtime plus Station-hosted showcase,
  observatory, evidence, and owner readback.
- Tier 2 hosted compute, database, deploy, queues, repo push, real `run_job`,
  key rotation, signing-secret creation, and destructive developer-agent tools
  remain out of scope.

Validation:

- `pnpm test:developer-spaces`
- `pnpm test:developer-space-client` if client examples or helper contract
  change.
- `pnpm lint` and `pnpm typecheck` if web files change.
- ARIADNE hosted desktop/mobile rehearsal if visible public or owner route copy
  changes.
- `git diff --check`

Config needed:

- No for docs-only clarification.
- Yes if the gap depends on a real partner project, public slug, ingestion key,
  signing-secret setup, or traffic expectations; those must come from Marty or
  the partner and must not be copied into docs.

Privacy/security review needed:

- Yes. Public/private field controls, key/signing safety, and Tier 1/Tier 2
  claim boundaries need ARGUS review.

Conflict with active or recently closed lanes:

- No direct conflict with PR310.
- It conflicts with PR260's closeout if opened without a named partner gap.

## Recommendation

Recommend Candidate A: `Protected-Alpha Demo Refresh After Memory Proof`,
owned by ARIADNE.

Why this one:

- It follows the current repo truth: the latest work closed product evidence
  loops, not implementation blockers.
- It uses hosted product review to decide the next branch instead of guessing
  at Redis, Cloudflare, providers, workers, billing, or broad UI.
- It should not need new config from Marty if the PR310 hosted test account and
  staging endpoints are still usable.
- It creates the cleanest decision point for MIMIR: accept protected-alpha demo
  readiness, route one concrete defect, or ask Marty for a product/commercial
  priority.

Why not Candidate B yet:

- PR181 already proved the current Stripe test-mode activation path.
- A billing/product lane needs a concrete Marty decision about pricing, tiers,
  invoices, tax, token top-ups, tipping, or UX before implementation.

Why not Candidate C yet:

- PR260 closed Developer Space Tier 1 protected-alpha for now.
- A partner pilot lane should wait for a named partner/Marty gap, otherwise it
  reopens closed work by inertia.

Whether the recommended lane needs config from Marty:

- No new config is expected for Candidate A if existing hosted replay-owner
  access remains valid.
- Marty input is needed only if MIMIR wants the next lane to be billing/product
  strategy, a real partner pilot, or a new hosted account/data setup rather
  than an ARIADNE rehearsal.
