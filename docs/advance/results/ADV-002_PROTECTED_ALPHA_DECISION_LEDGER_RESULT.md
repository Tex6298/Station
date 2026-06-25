# ADV-002 - Protected Alpha Decision Ledger Result

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete for MIMIR and Marty review

## Summary

PR311 is the current hosted protected-alpha product evidence. It passed the
owner and public demo journey after the Memory route/readback proof, and it did
not produce a DAEDALUS patch, ARGUS review need, or Marty config request.

This ledger does not recommend the next mainline PR. It names decisions that
may soon need Marty/MIMIR judgment before a future normal lane is worth opening.

Highest-priority decisions are human/product decisions rather than code
decisions:

- whether to use the current PR311 evidence as the prepared protected-alpha
  demo baseline;
- what commercial/product shape, if any, should follow the accepted Stripe
  test-mode activation proof;
- whether a real partner or Developer Space pilot has a named gap that justifies
  reopening that closed protected-alpha surface.

Decisions not ready yet:

- Redis, Cloudflare, provider/model swaps, embedding changes, and worker lanes
  are not ready because current docs still require a concrete replay,
  partner, latency, backfill, or reliability trigger.
- More Developer Space work is not ready without a named partner/Marty gap.
- More billing work is not ready without a concrete product/commercial decision
  beyond the accepted PR181 test-mode activation proof.

## Demo And Alpha Readiness

### Decision 1 - Is PR311 Good Enough As The Current Marty-Facing Demo Baseline?

Decision question:

- Should Marty use the PR311 hosted journey as the current protected-alpha demo
  baseline, or require another evidence pass before showing it?

Why it matters soon:

- PR311 passed across owner Studio, Memory, Continuity/provenance, Archive,
  Export, Billing, Settings, public Discover/content, Forums, and public
  Developer Space. If this is enough, the next work can pause until a real
  defect or product decision appears.

Current repo/product evidence:

- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`
  reports `PASS`.
- Hosted web/API were healthy and deployment-ready at commit prefix
  `d59be4ee8efa`.
- Hosted ancestry included required PR309 runtime commit `e9332fe5`.
- PR310 had already closed the Memory `Open Memory` route/readback caveat.

Likely options:

- Treat PR311 as the current demo baseline.
- Run one human/manual rehearsal with Marty before any public or partner-facing
  use.
- Require a fresh hosted evidence pass only if new commits change demo-facing
  behavior.

Risks or tradeoffs:

- Using PR311 now avoids polish churn but accepts known protected-alpha caveats.
- Running another rehearsal can build confidence but may consume time without a
  named defect.
- Waiting for more code risks reopening closed evidence loops by inertia.

Dependencies or config needed:

- Existing hosted web/API endpoints.
- Existing replay-owner/session setup if another rehearsal is run.
- No new provider, Stripe, Redis, Cloudflare, worker, or migration config.

Promotion criteria for a normal PR lane:

- Open a normal lane only if Marty wants a new scripted demo artifact, a fresh
  hosted pass after demo-facing commits, or a concrete visible defect appears.

Suggested owner if later promoted:

- MIMIR chooses; rehearsal-only work would likely be an ARIADNE-style lane,
  while a demo script/runbook refresh would likely remain docs/rehearsal scope.

### Decision 2 - Which Known Caveats Are Accepted For Protected Alpha?

Decision question:

- Which current caveats should be explicitly accepted for protected alpha, and
  which should block demo/alpha use?

Why it matters soon:

- PR311 says the journey is coherent, but staging docs still name caveats:
  static global Archive/Export shells, dashboard derived/static snippets, no
  downloadable bundles/workers, and no new private search UI beyond accepted
  API/search foundation.

Current repo/product evidence:

- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md` carries those caveats
  forward after PR311 instead of spawning automatic local polish.
- PR311 passed public/private redaction and journey coherence.

Likely options:

- Accept the caveats as protected-alpha limitations.
- Convert one caveat into a specific future decision.
- Block demo/alpha use on one caveat only if Marty names it as unacceptable.

Risks or tradeoffs:

- Accepting caveats keeps scope honest but may need crisp demo narration.
- Promoting a caveat too early can reopen broad UI, workers, export, or search
  work without evidence that it matters now.

Dependencies or config needed:

- Marty/MIMIR product tolerance for the named caveats.
- No code/config dependency unless a caveat is promoted.

Promotion criteria for a normal PR lane:

- A caveat becomes promotable only when it has a named user-facing failure,
  route, acceptance bar, and validation path.

Suggested owner if later promoted:

- MIMIR chooses based on the caveat: visible route rehearsal, implementation,
  or hostile preflight.

## Billing, Product, And Commercial Shape

### Decision 3 - What Is The Next Commercial Product Question?

Decision question:

- After PR181 proved clean Stripe test-mode activation, what commercial
  question should Station answer next, if any?

Why it matters soon:

- Billing status is visible in the protected-alpha journey, and current tier
  readback in PR311 is active/canon. The next billing lane should not simply
  re-prove activation.

Current repo/product evidence:

- `docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md` proves
  inactive-to-active test-mode subscription activation on a clean
  non-production account.
- Checkout creation alone did not grant entitlement; webhook-backed
  subscription state did.
- PR311 checked Billing as readback only and ran no Checkout, Portal, webhook,
  export, import, key-rotation, provider, queue, or worker mutation.

Likely options:

- No billing work now; keep PR181 as the accepted protected-alpha proof.
- Define pricing/tier copy and public plan positioning.
- Define token top-up/product-credit policy.
- Define invoice/tax/portal readiness expectations.
- Define tipping/donation as deferred or as a separate product concept.

Risks or tradeoffs:

- Moving into commercial work without a product decision can create pricing or
  entitlement churn.
- Checkout/portal UX work without a claim boundary can overstate production
  billing readiness.
- Token-topup or tipping work touches product trust, payments, and accounting.

Dependencies or config needed:

- Marty product/commercial decision for pricing, tiers, credits, invoices, tax,
  tipping, or billing UX.
- Stripe test resources only if a specific billing lane is promoted.

Promotion criteria for a normal PR lane:

- Promote only when the commercial question is named in plain language, the
  non-goals are explicit, and Stripe/test validation can prove the claim
  without printing secrets or identifiers.

Suggested owner if later promoted:

- MIMIR chooses; claim/preflight work likely needs ARGUS-style review before
  implementation, and visible Billing page changes need browser rehearsal.

### Decision 4 - Should Current Tier/Limit Readback Become Product Copy?

Decision question:

- Should the current server-authoritative tier/limit readback become polished
  product copy, or stay as protected-alpha account status?

Why it matters soon:

- PR311 confirmed readable plan limit keys across personas, Spaces, Developer
  Spaces, public personas, pages per Space, storage, comments, threads, and
  publishing.

Current repo/product evidence:

- Billing/account readback is present and server-authoritative.
- PR181 closed activation proof; PR311 closed readback in the demo journey.

Likely options:

- Keep current account readback as protected-alpha status.
- Add restrained billing/status copy for demo clarity.
- Open a broader Billing UX lane only after product copy and tier policy are
  decided.

Risks or tradeoffs:

- Polished copy can imply production pricing or entitlement commitments.
- Leaving readback plain is safer but less legible for demos.

Dependencies or config needed:

- Marty wording/tier/product policy if copy becomes more commercial.

Promotion criteria for a normal PR lane:

- Promote when there is approved copy/policy for what each tier means and what
  billing action, if any, the user should take.

Suggested owner if later promoted:

- MIMIR chooses; visible copy likely needs implementation plus ARIADNE-style
  browser review.

## Partner Or Developer Space Pilot Readiness

### Decision 5 - Is There A Real Partner Pilot Gap?

Decision question:

- Does Marty have a concrete partner or Developer Space pilot gap that should
  reopen Developer Space work?

Why it matters soon:

- Developer Space Tier 1 is closed for protected alpha, but a real partner
  could reveal a documentation, onboarding, public framing, owner-console, or
  ingestion gap.

Current repo/product evidence:

- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md` says no blocker
  remains before Tier 1 protected-alpha closeout.
- PR255 through PR259 covered readiness map, ARGUS gates, placeholder-only
  partner docs, visible public/owner framing, and hosted desktop/mobile
  rehearsal.
- `docs/integration/developer-space-tier1-partner-onboarding.md` already
  documents ingestion examples, field classifications, owner-console checks,
  sanitized troubleshooting, and deferred Tier 2/Tier 3 claims.

Likely options:

- No partner lane now.
- Run a docs/status-only partner pilot evidence refresh after real use.
- Open a narrow docs/example clarification.
- Open visible public/owner route improvements only for a named pilot issue.

Risks or tradeoffs:

- Reopening Developer Space without a named gap conflicts with PR260 closeout.
- Partner docs can overclaim Tier 2 hosting, repo push, queues/workers,
  destructive developer-agent actions, billing, or tipping.
- Examples can accidentally encourage raw-key or raw-payload sharing.

Dependencies or config needed:

- Marty or partner names the gap.
- If live pilot data is involved, use placeholders/sanitized summaries only.
- No live keys, signing secrets, payloads, hosted logs, private ids, prompts,
  provider payloads, or private document bodies should enter docs.

Promotion criteria for a normal PR lane:

- Promote only with a named partner need, explicit Tier 1/Tier 2 boundary, and
  validation for affected docs/client/web surfaces.

Suggested owner if later promoted:

- MIMIR chooses; partner-claim preflight likely needs ARGUS-style review, and
  visible route copy needs ARIADNE-style rehearsal.

### Decision 6 - Should Project Updates, Community Entry, Or Tipping Move Into Tier 1?

Decision question:

- Should project updates/changelog, Developer Space community/forum entry, or
  tipping/pricing become near-term product commitments?

Why it matters soon:

- PR260 classifies these as partial/caveat or deferred, not blockers. They are
  likely to come up in partner conversations.

Current repo/product evidence:

- Selected public status notes and project-update draft/publish receipts exist,
  but no full project-specific changelog/feed product.
- Forums/community exist elsewhere, but not as a Developer Space-specific entry.
- Pricing/tipping is explicitly outside the closed Tier 1 surface.

Likely options:

- Keep all three deferred.
- Choose exactly one as a future product decision.
- Ask for partner evidence before committing to any of them.

Risks or tradeoffs:

- Changelog/feed touches public chronology and publishing boundaries.
- Community entry touches moderation, reports, visibility, and forum surface
  area.
- Tipping/pricing touches payments and commercial claims.

Dependencies or config needed:

- Marty product decision and, for tipping/pricing, Stripe/commercial policy.

Promotion criteria for a normal PR lane:

- Promote only one at a time, with an ARGUS-style claim/privacy preflight before
  implementation.

Suggested owner if later promoted:

- MIMIR chooses based on whether the lane is product preflight, implementation,
  or visible rehearsal.

## Hosted Data, Account, Seed, And Config Posture

### Decision 7 - Which Hosted Account/Data Set Is The Demo Baseline?

Decision question:

- Which hosted owner account, persona, Memory/Archive/Continuity data, and
  public chain should be treated as the current demo baseline?

Why it matters soon:

- PR311 passed using the established replay owner and intended replay persona.
  If demos or partner pilots continue, the team needs to know whether that data
  is stable baseline evidence or disposable staging data.

Current repo/product evidence:

- PR311 found exactly one intended private platform replay persona among owned
  personas and checked owner/public routes safely.
- PR181 used a separate clean non-production account for Stripe proof and did
  not mutate the dirty replay owner.

Likely options:

- Keep the existing replay owner/data as the protected-alpha baseline.
- Create a fresh demo account/data set for future public or partner demos.
- Maintain separate accounts for replay evidence, billing proof, and partner
  pilot work.

Risks or tradeoffs:

- Reusing the current baseline preserves continuity but may carry accumulated
  test artifacts.
- Creating fresh data improves narrative clarity but requires setup effort and
  proof.
- Mixing billing proof and replay/demo accounts can dirty entitlement evidence.

Dependencies or config needed:

- Marty/MIMIR decision on account/data policy.
- Hosted auth access and safe seed/setup process if a fresh account is needed.
- No raw credentials, ids, tokens, source bodies, prompts, provider payloads, or
  hosted logs in docs.

Promotion criteria for a normal PR lane:

- Promote when a new account/data baseline is needed for a demo, partner pilot,
  or evidence refresh, and the setup can be done with sanitized proof.

Suggested owner if later promoted:

- MIMIR chooses; account/data setup may need MIMIR/human config and then
  rehearsal evidence.

### Decision 8 - What Config Truth Should Be Refreshed Before The Next Demo Or Pilot?

Decision question:

- Which hosted config/readiness facts should be refreshed before the next
  external use?

Why it matters soon:

- PR311 reports current health/deployment readiness. Future demos or partner
  pilots may need a fresh statement of web/API commit, Supabase, auth redirects,
  Stripe test posture, provider config, and cache posture.

Current repo/product evidence:

- `/health` and `/health/deployment` were ready in PR311.
- Earlier staging readiness docs record Supabase, Stripe test config,
  provider, and Upstash cache proof at accepted levels.
- Redis remains operational support, not canonical Memory truth.

Likely options:

- No refresh until a new external use or defect.
- Refresh only web/API health and deployment identity.
- Refresh full deployment readiness before a Marty demo or partner pilot.

Risks or tradeoffs:

- Over-refreshing can waste time and expose temptation to copy raw operational
  details.
- Under-refreshing can leave stale evidence after important commits or config
  changes.

Dependencies or config needed:

- Hosted endpoint access.
- No secret values; readiness output should remain boolean/sanitized.

Promotion criteria for a normal PR lane:

- Promote only if a new demo/pilot requires fresh evidence, deployment changes
  materially, or readiness fails with a bounded proof id/error.

Suggested owner if later promoted:

- MIMIR chooses; evidence-only checks may be MIMIR/ARIADNE-shaped, while
  readiness failures may route to ARGUS or DAEDALUS after diagnosis.

## Future Infrastructure Gates

### Decision 9 - What Would Justify Workers Or Background Job Execution?

Decision question:

- What concrete failure would make a worker/background job lane worth opening?

Why it matters soon:

- PR311 accepted Export Workspace as preview/planning and did not imply a live
  global export worker or download job. Background jobs remain a tempting but
  unproven expansion.

Current repo/product evidence:

- Background jobs docs keep protected-alpha inline fallback.
- Current candidate triggers include slow archive import backfills, memory
  reindex/backfill, export assembly retries, or Developer Space import batch
  reliability.

Likely options:

- Keep workers deferred.
- Open status/readback planning only.
- Open one worker lane for one proven painful flow.

Risks or tradeoffs:

- Premature workers create queue, retry, timeout, idempotency, visibility, and
  private-payload risks.
- Deferring workers keeps protected-alpha simpler but leaves some operations as
  preview/planning or inline flows.

Dependencies or config needed:

- A concrete failing flow with hosted evidence.
- Queue/worker provider decision only after the failing flow is named.

Promotion criteria for a normal PR lane:

- Promote only when hosted/product evidence shows blocking latency, flaky
  completion, timeout, or missing owner-visible failed/in-progress readback for
  a specific flow.

Suggested owner if later promoted:

- MIMIR chooses; implementation would need DAEDALUS-style build and
  ARGUS-style privacy/idempotency review.

### Decision 10 - What Would Justify Redis, Cloudflare, Provider, Or Embedding Work?

Decision question:

- What evidence would make Redis Memory truth, Cloudflare retrieval, provider
  routing, model swap, or embedding/index changes worth opening?

Why it matters soon:

- These are recurring architecture temptations, but current docs explicitly
  keep them deferred unless evidence forces a bounded lane.

Current repo/product evidence:

- Redis/Upstash is accepted as operational cache, idempotency, rate-limit, and
  cache-only queue-state support, not canonical Memory truth.
- Cloudflare remains adapter/index-mirror boundary only with no live Worker,
  Queue, Vectorize call, or authoritative private-memory behavior.
- Active staging embedding profile remains Gemini `station_free_1536`; provider
  and retrieval metadata foundations exist.

Likely options:

- Keep all deferred.
- Open a privacy/architecture decision packet only after a named replay,
  partner, latency, or imported-repo need.
- Open a disabled-safe prototype only if MIMIR defines a test-only question.

Risks or tradeoffs:

- Redis Memory truth risks durability, deletion, export, audit, and owner-trust
  confusion.
- Cloudflare retrieval risks private index leakage, stale candidates, and
  reauthorization complexity.
- Provider/embedding changes risk dimension/index drift and replay regression.

Dependencies or config needed:

- Concrete evidence of current-path limitation.
- If promoted later: provider/data-policy decision, dimension/index contract,
  delete/export/reindex semantics, and sanitized health/readiness posture.

Promotion criteria for a normal PR lane:

- Promote only when the triggering limitation is documented, the proposed
  infrastructure role is explicit, and owner/privacy/reindex/export gates can
  be reviewed before live behavior changes.

Suggested owner if later promoted:

- MIMIR chooses; gate-heavy work should start with ARGUS/JANUS-style preflight
  before implementation.

## Marty Input To Prepare

No input is required to keep the current pause posture.

Inputs that would unlock future decisions:

- Demo: whether PR311 is good enough for the next Marty-facing protected-alpha
  walkthrough, and whether the known caveats are acceptable narration.
- Commercial: pricing/tier/credit/tipping/invoice/tax direction, if commercial
  product work should move next.
- Partner: a named partner or Developer Space pilot gap, if one exists.
- Hosted data: whether to keep the existing replay owner/data as baseline or
  create a fresh demo/pilot data set.
- Infrastructure: a concrete hosted failure or partner requirement before
  Redis, Cloudflare, provider/model, embedding, or worker work reopens.

## Promotion Guardrails

For any future normal PR lane:

- The decision must be named before implementation.
- The triggering evidence must be current and concrete.
- The non-goals must explicitly preserve closed PR311/PR260/PR181 evidence
  unless the decision deliberately revisits it.
- Config or account needs must be stated without recording values.
- No raw ids, credentials, tokens, prompts, completions, provider payloads,
  private source bodies, SQL, hosted logs, or secret-shaped values should be
  added to docs, code, fixtures, or result packets.
