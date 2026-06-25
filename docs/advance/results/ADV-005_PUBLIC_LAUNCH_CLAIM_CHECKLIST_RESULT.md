# ADV-005 - Public Launch Claim Checklist Result

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete

## Summary

This checklist is an advisory ADV artifact for future public-launch claims. It
does not approve public launch, public copy, external pilot scope, product
sequence, acceptance bars, or any mainline PR.

PR319 remains the active mainline lane with ARIADNE. This packet does not
inspect hosted state, diagnose deploy freshness, read logs/config, touch
product code, edit active roadmap PR files, or use secrets. Historical proof
below means committed result/audit docs only, not fresh hosted truth.

## Evidence Hygiene

Allowed source types for this checklist:

- committed roadmap result docs;
- committed advance result docs;
- committed audits or closeout docs that record accepted historical evidence;
- future MIMIR-accepted result docs, if MIMIR later promotes a claim.

Forbidden source types:

- hosted logs, Railway state, browser probes, deploy config, credentials,
  cookies, tokens, env values, raw ids, SQL, prompts, completions, provider
  payloads, private source bodies, screenshots, raw API bodies, or secret-shaped
  values.

Use claim wording that says `historical protected-alpha evidence shows...` or
`committed result docs record...` until MIMIR explicitly promotes fresher claim
language.

## Claim Checklist

### Public Persona Interaction

Claim wording shape:

- Safe shape: "Historical protected-alpha evidence records a signed-in
  non-owner public persona chat path on the replay seed."
- Avoid: "Public personas are launch-ready", "anonymous visitors can chat", or
  "public persona chat is generally available."

Minimum evidence before MIMIR could promote the claim:

- A current accepted result doc for the exact audience and route.
- Explicit signed-in/anonymous boundary.
- Desktop/mobile fit, redaction, no transcript/visitor identity leakage, and
  no private source exposure.
- Freshness evidence from a promoted lane if the claim depends on current
  hosted state.

Visible caveat:

- Historical PR315 evidence was internal protected-alpha, signed-in non-owner,
  seed-route scoped, and exactly-one-chat scoped. It did not prove anonymous
  chat, external launch, scale, durable visitor transcripts, or broad answer
  quality.

Allowed evidence source type:

- `docs/roadmap/PR315_PUBLIC_PERSONA_PILOT_TESTER_ACCESS_RERUN_RESULT.md`.
- Future accepted public persona result docs.

Defer, discard, or request promotion:

- Defer if the claim needs anonymous access, external audience, current hosted
  freshness, or broad quality assertions.
- Discard any wording that implies general availability.
- Request promotion if public copy needs to mention a current public persona
  pilot capability.

### Public Reporting And Moderation

Claim wording shape:

- Safe shape: "Historical protected-alpha evidence records signed-in public
  persona report creation and aggregate/status-only owner readback."
- Avoid: "Public moderation is fully live", "admin moderation is proven on
  hosted", or "reports are production moderation-ready."

Minimum evidence before MIMIR could promote the claim:

- Accepted report-creation and owner-readback result docs.
- Accepted hosted admin moderation rehearsal for the human moderation route if
  the claim mentions admin moderation.
- Explicit leakage checks for reporter identity, report body, raw ids, private
  source ids, visitor identity, transcripts, and provider traces.

Visible caveat:

- PR316 historically proved report creation and owner aggregate/status readback.
  PR318 product/test work was accepted, but PR319 hosted moderation rehearsal is
  the active mainline lane. This ADV packet does not claim PR319 has passed.

Allowed evidence source type:

- `docs/roadmap/PR316_PUBLIC_PERSONA_REPORT_PATH_REHEARSAL_RESULT.md`.
- `docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_RESULT.md` for
  accepted code/test scope only, not fresh hosted proof.
- Future accepted PR319/MIMIR result docs if they exist and are promoted.

Defer, discard, or request promotion:

- Defer any hosted moderation claim until PR319 is accepted by MIMIR.
- Discard wording that implies moderation actions, anonymous reports, or
  production safety operations.
- Request promotion if public copy needs to mention a human moderation path.

### Private Archive, Memory, Continuity, And Export

Claim wording shape:

- Safe shape: "Historical protected-alpha evidence records owner-only Memory,
  Archive, Continuity/provenance, and Export readback surfaces with caveats."
- Avoid: "Full archive/export is production-ready", "global export download is
  live", or "private memory is public-safe by default."

Minimum evidence before MIMIR could promote the claim:

- Current accepted owner-route rehearsal or result docs for each named surface.
- Explicit owner-only boundary and public-chain redaction checks.
- Caveat list for preview/planning states, unavailable workers, and route scope.

Visible caveat:

- PR311 recorded a protected-alpha demo pass after Memory proof and included
  Archive/Export trust readback. It also kept caveats visible: export bundles
  and global workers were not implied as live production delivery.

Allowed evidence source type:

- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`.
- `docs/roadmap/PR307_MEMORY_LIFECYCLE_OBSERVABILITY_RESULT.md` for
  owner-only Memory readback scope.
- `docs/roadmap/PR265_ARCHIVE_TRUST_REHEARSAL_ARIADNE.md` for historical
  Archive Trust rehearsal scope.

Defer, discard, or request promotion:

- Defer claims about downloads, workers, external connectors, private search UI,
  global export, or production backup.
- Discard wording that hides protected-alpha caveats.
- Request promotion if launch copy needs to name private workspace readiness.

### Developer Space Observability

Claim wording shape:

- Safe shape: "Historical docs record Developer Space Tier 1 protected-alpha
  showcase, observability, evidence path, and owner console readback."
- Avoid: "Station hosts partner runtimes", "developer agents execute real
  jobs", or "Tier 2 infrastructure is live."

Minimum evidence before MIMIR could promote the claim:

- Accepted closeout/audit result for the exact Tier claim.
- Explicit boundary between Station-hosted public/owner surfaces and external
  self-hosted developer runtime.
- Caveats for project updates, community/forum entry, pricing/tipping, Tier 2
  infrastructure, and developer-agent execution.

Visible caveat:

- Tier 1 protected-alpha is narrow: public showcase/observatory/evidence path
  plus owner readback/operating console. Hosted compute, deploy pipeline,
  queues, repo push, real `run_job`, key rotation, pricing/tipping, and
  community work remain deferred.

Allowed evidence source type:

- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`.
- Future accepted partner-pilot evidence docs.

Defer, discard, or request promotion:

- Defer any partner, commercial, hosted compute, or execution claim without a
  named product need and MIMIR promotion.
- Discard wording that implies partner production readiness.
- Request promotion if public copy needs to describe Developer Space Tier 1.

### Billing And Tier Gates

Claim wording shape:

- Safe shape: "Historical test-mode evidence records clean-account
  webhook-backed activation from visitor/inactive to canon/active."
- Avoid: "Payments are production-ready", "live billing is launch-ready", or
  "pricing/tax/invoices/portal are approved."

Minimum evidence before MIMIR could promote the claim:

- Accepted billing result for the exact billing mode and account shape.
- Clear distinction between Checkout Session creation and webhook-backed
  entitlement mutation.
- Product/commercial decision for pricing, plan copy, invoices, tax, portal,
  support, and live-money posture if those are mentioned.

Visible caveat:

- PR181 was Stripe test-mode clean proof only. It did not approve production
  billing, live money, pricing, taxes, invoices, Customer Portal semantics,
  token top-ups, tipping, Connect, marketplaces, or usage metering.

Allowed evidence source type:

- `docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md`.
- Future accepted billing/commercial result docs.

Defer, discard, or request promotion:

- Defer any production payment or commercial packaging claim.
- Discard wording that treats test-mode proof as public billing readiness.
- Request promotion if launch copy needs billing, pricing, or plan language.

### Provider And Model Configurability

Claim wording shape:

- Safe shape: "Historical owner-only provider-policy evidence records
  non-secret posture labels and embedding profile readback."
- Avoid: "Users can configure any model", "BYOK is available", or "provider
  marketplace support is live."

Minimum evidence before MIMIR could promote the claim:

- Accepted result docs for the exact provider/model claim.
- Redaction proof that keys, URLs, prompts, completions, private archive
  excerpts, provider payloads, owner identifiers, tokens, and cookies are not
  exposed.
- Product decision for configurability, BYOK, marketplace, billing, or global
  provider switching if those are mentioned.

Visible caveat:

- PR5 records owner-only provider-policy posture and route labels. It did not
  add a provider marketplace, BYOK secret store, per-user provider billing,
  global provider switching, embedding/vector change, private archive provider
  call, or UI claim.

Allowed evidence source type:

- `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY_RESULT.md`.
- Future accepted provider/model result docs.

Defer, discard, or request promotion:

- Defer any claim about user-configurable models, BYOK, provider marketplace,
  provider quality, or global model switching.
- Discard wording that exposes or implies secret/provider payload handling.
- Request promotion if public copy needs model/provider posture language.

### Hosted Deployment Freshness

Claim wording shape:

- Safe shape: "A committed historical result recorded hosted freshness at a
  named time and commit."
- Avoid: "The hosted app is currently fresh", "deployment is live now", or
  "PR319 is proven" from this checklist.

Minimum evidence before MIMIR could promote the claim:

- A current accepted hosted rehearsal/result doc for the exact route and commit
  floor.
- Explicit statement of route, viewport if relevant, deployment readiness, and
  privacy/leakage scan.
- MIMIR acceptance if the freshness claim is user-facing.

Visible caveat:

- Hosted freshness is time-sensitive. ADV-005 did not inspect hosted state.
  PR319 remains the active hosted rehearsal lane; this checklist does not
  diagnose stale deploy state or collect browser evidence.

Allowed evidence source type:

- Future accepted hosted rehearsal/result docs.
- Historical committed result docs only when clearly labeled historical.

Defer, discard, or request promotion:

- Defer all current-hosted claims while the active mainline freshness question
  is unresolved.
- Discard wording that converts historical freshness into current truth.
- Request promotion when a public claim depends on current deployment state.

### Demo Readiness

Claim wording shape:

- Safe shape: "Historical protected-alpha evidence records an internal demo
  journey that passed with named caveats."
- Avoid: "Station is public-launch ready", "the demo proves every public
  workflow", or "the current hosted deployment is ready now."

Minimum evidence before MIMIR could promote the claim:

- Current accepted demo result if material demo-facing commits landed after the
  historical pass.
- Route order, known caveats, owner/public boundary, redaction checks, and
  hosted freshness source.
- Explicit scope: internal protected-alpha demo versus public/external launch.

Visible caveat:

- PR311 records an internal protected-alpha demo pass after Memory proof. It did
  not prove anonymous public access, external launch, commercial packaging,
  durable visitor transcripts, full export delivery, or production billing.

Allowed evidence source type:

- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`.
- Future accepted demo rehearsal docs.

Defer, discard, or request promotion:

- Defer demo claims after material route/product/deploy changes until a fresh
  result exists.
- Discard wording that equates internal protected-alpha demo readiness with
  public launch readiness.
- Request promotion if Marty-facing or public-facing demo narration needs a
  fresh claim.

## Promotion Request Template

If MIMIR later wants to promote any claim item, use this shape:

```text
Claim category:
Proposed wording:
Historical evidence source:
Fresh evidence needed:
Visible caveat:
Forbidden overclaim:
Public/private boundary:
Validation or rehearsal owner:
Decision needed from Marty:
Discard trigger:
```

## MIMIR Handoff

ADV-005 public launch claim checklist is ready.

Verdict:

- Advisory packet complete.

Task:

- Decide whether to archive, revise, or later promote any claim checklist item.
