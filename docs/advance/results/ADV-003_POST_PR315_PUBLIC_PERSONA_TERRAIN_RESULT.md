# ADV-003 - Post-PR315 Public Persona Terrain Result

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete

## Summary

PR315 proves the internal hosted public persona interaction pilot gate for the
replay seed. It does not prove external public launch, anonymous public chat,
commercial packaging, partner readiness, durable visitor transcripts,
provider/model quality beyond the bounded hosted interaction, or any Redis,
Cloudflare, worker, billing, or broader infrastructure need.

This packet does not recommend the next mainline PR. It prepares future terrain,
risks, evidence needs, decision criteria, and lightweight prep artifact ideas
for later MIMIR/Marty decisions.

No A1-A4 wakeup or mainline recommendation is being made.

## Proof Ledger

### What PR315 Proves

Internal signed-in non-owner tester path:

- A staging-only signed-in non-owner tester could sign in.
- The tester was not the replay owner.
- The tester opened `/personas/station-replay-alpha-persona`.
- Exactly one hosted public persona chat interaction was sent.
- The chat request returned HTTP `200`.
- A visible reply appeared in the hosted UI.
- No second chat and no report interaction were sent.

Owner aggregate/readback path:

- The replay owner could sign in after the tester interaction.
- The owner matched the target owner persona exactly once.
- Owner readback showed aggregate activity only.
- Last 7-day and 30-day chat aggregate counters were present.
- The owner readback did not expose visitor identity, transcript, or raw event
  storage.

Transcript and visitor boundary:

- Public chat reported `transcriptStored:false`.
- Owner readback reported no transcript stored, no visitor identity stored, and
  no raw events stored.
- Checked public and owner surfaces did not expose credentials, cookies, tokens,
  raw ids, SQL, logs, prompts, provider payloads, billing identifiers, private
  source markers, visitor identity, durable visitor transcript, reporter
  identity, raw report body, or token transaction rows.

Responsive fit:

- Tester desktop public persona path passed.
- Tester mobile public persona path at `375px` passed.
- Owner desktop aggregate readback passed.
- Owner mobile aggregate readback at `375px` passed.
- No dead controls, route errors, or document-level horizontal overflow were
  observed on the checked PR315 path.

Hosted readiness:

- Hosted web/API were healthy and deployment-ready at commit prefix
  `d59be4ee8efa`.
- The public persona route was safe-slugged and public chat was enabled for the
  seed persona.

### What PR315 Does Not Prove

Public launch:

- It does not prove anonymous public chat.
- It does not prove external public launch readiness.
- It does not prove public marketing, public onboarding, App Store-style
  packaging, or public support posture.

Commercial or partner claims:

- It does not prove pricing, plan packaging, billing UX, tipping, invoices,
  tax, partner contracts, or commercial readiness.
- It does not prove Developer Space partner readiness beyond the already closed
  Tier 1 protected-alpha surface.

Data retention:

- It does not prove durable visitor transcript storage.
- It does not prove visitor identity analytics.
- It does not prove owner-visible visitor-level conversation review.

Model/provider quality:

- It does not prove model quality beyond one bounded hosted interaction.
- It does not prove provider/model routing, provider swap, embedding change, or
  new public persona answer-quality policy.

Infrastructure:

- It does not prove any need for Redis, Cloudflare, workers, queues, scheduled
  jobs, cache architecture, export/download infrastructure, billing mutation,
  or broader infra changes.

## Terrain Map

### Product Questions Now Made Possible

Public persona pilot scope:

- Question: Should the next public persona decision stay inside the internal
  signed-in tester boundary, or wait for Marty to name an external audience?
- Why now: PR315 proves the internal signed-in tester loop works once.
- Decision type: Marty/MIMIR product judgment, not code by default.
- Future promotion signal: a named external audience, named success metric, and
  explicit public/private readback boundary.
- Pause signal: no named external audience or product promise.

Anonymous public chat:

- Question: Should anonymous visitors ever be allowed to chat with public
  personas?
- Why now: signed-in non-owner chat worked, but anonymous chat remains
  explicitly unproven.
- Decision type: product, privacy, abuse, moderation, and infrastructure
  judgment before code.
- Future promotion signal: clear abuse/reporting/rate-limit posture, transcript
  policy, and owner readback policy.
- Pause signal: no moderation/reporting/rate-limit decision or no reason to
  move beyond signed-in testers.

Public persona reporting/moderation:

- Question: Should the next pilot exercise the safe report path or moderation
  follow-up?
- Why now: PR315 used exactly one chat and no report interaction.
- Decision type: product safety and review-flow judgment.
- Future promotion signal: a named safety scenario and acceptance bar for
  report creation, owner/admin readback, and no reporter/private leakage.
- Pause signal: no safety scenario or no need to test report flow now.

Owner-facing public interaction readback:

- Question: Should owner readback remain aggregate-only, or should any richer
  public interaction insight exist later?
- Why now: aggregate-only readback passed and protected visitor identity.
- Decision type: privacy/product decision before implementation.
- Future promotion signal: a concrete owner need that can be satisfied without
  transcript or visitor identity exposure.
- Pause signal: requests for transcripts, visitor identities, raw event logs, or
  analytics without a privacy gate.

Public persona answer expectation:

- Question: What answer-quality bar is appropriate for public-source-only
  public persona chat?
- Why now: PR315 proved one visible reply, not broad model quality.
- Decision type: product quality and safety decision before provider work.
- Future promotion signal: repeated hosted interactions showing a specific
  bounded failure class that can be tested without provider churn.
- Pause signal: vague desire for "better model quality" with no fixture,
  hosted evidence, or user-facing defect.

Demo posture:

- Question: Should PR311 plus PR315 become the current internal protected-alpha
  demo posture?
- Why now: PR311 passed the owner/public demo journey; PR315 adds signed-in
  non-owner public persona interaction proof.
- Decision type: Marty/MIMIR demo-readiness judgment.
- Future promotion signal: a request for a refreshed demo script, route order,
  or caveat ledger that includes public persona interaction.
- Pause signal: no planned demo and no new visible route changes.

### Evidence Gaps That Should Remain Paused

Anonymous public launch:

- Paused because PR315 did not involve anonymous chat, public scale, abuse
  controls, or launch copy.

Commercial packaging:

- Paused because PR315 made no pricing, billing, entitlement, or commercial
  claim.

Partner readiness:

- Paused because PR315 used a replay seed and invited tester, not a partner
  pilot or Developer Space deployment.

Durable visitor transcripts:

- Paused because PR315 intentionally proved `transcriptStored:false` and
  aggregate-only owner readback.

Provider/model changes:

- Paused because one bounded interaction is not evidence for provider/model
  migration.

Infrastructure expansion:

- Paused because PR315 did not reveal queue, worker, Redis, Cloudflare, export,
  or cache pressure.

## Risk Ledger

### Privacy And Readback Risks

Risk:

- Future work could turn aggregate-only owner readback into visitor identity,
  transcript, raw event, reporter, or analytics leakage.

Current guard:

- PR315 passed with `transcriptStored:false`, no visitor identity stored, no
  raw events stored, and owner aggregate-only readback.

Decision criterion:

- Any richer owner readback needs a privacy gate that names exactly which
  fields are visible and why they are safe.

### Public-Copy Overclaim Risks

Risk:

- Public copy may imply external launch, public availability, persistent chat,
  broader source access, or production support.

Current guard:

- PR313/PR314/PR315 frame the pilot as internal hosted rehearsal with one
  invited signed-in non-owner tester.

Decision criterion:

- Public copy expansion needs a named audience and must not claim anonymous
  chat, commercial readiness, partner readiness, or durable transcripts unless
  those are separately proven.

### Commercial And Partner-Readiness Risks

Risk:

- The passed public persona pilot could be mistaken for commercial packaging,
  partner readiness, tipping readiness, or public launch readiness.

Current guard:

- PR313 explicitly requires Marty input before external public launch,
  commercial packaging, partner claims, or named real-world pilot.
- ADV-002 keeps billing/product and partner decisions separate.

Decision criterion:

- Commercial or partner claims need a concrete Marty/product decision and
  separate acceptance gates.

### Model And Provider Expectation Risks

Risk:

- A single visible reply could be overread as general answer-quality proof or
  a reason to change provider/model/embedding infrastructure.

Current guard:

- PR315 proves only one bounded hosted interaction on the current path.

Decision criterion:

- Provider/model work requires repeated failure evidence, a testable quality
  target, and privacy/provider-policy review before any implementation.

### Community, Moderation, And Reporting Risks

Risk:

- Public persona interaction can create abuse, reporting, moderation, and
  community trust expectations even when transcript storage is disabled.

Current guard:

- PR315 did not run the report path and did not expand moderation.

Decision criterion:

- Reporting/moderation work should start from a named safety scenario and prove
  reporter privacy, target context, owner/admin readback, and no raw report
  leakage.

### Demo Drift Risks

Risk:

- PR311/PR315 evidence can go stale after hosted commits, seed changes, account
  changes, or config changes.

Current guard:

- Both PR311 and PR315 record hosted health/deployment readiness and commit
  prefix.

Decision criterion:

- A fresh demo/pilot should refresh hosted readiness if code/config/data changed
  materially after `d59be4ee8efa` or if the seed persona/tester account changed.

## Evidence Needs And Promotion Criteria

### External Public Persona Pilot

Promotable signal:

- Marty names an external audience, pilot purpose, expected behavior, and
  success metric.

Keep paused if:

- The audience is still "general public" without a narrower safety boundary.

Possible later shape:

- Preflight before any hosted rehearsal or implementation.

Config/account inputs later:

- Named test audience or controlled external tester access; no values should be
  recorded in docs.

### Anonymous Public Chat

Promotable signal:

- A product decision accepts anonymous access and names abuse/rate-limit,
  reporting, transcript, visitor identity, and owner readback policy.

Keep paused if:

- Any of those policies are undefined.

Possible later shape:

- Privacy/safety preflight before implementation.

Config/account inputs later:

- Rate-limit and abuse-control posture; no new config should be requested until
  the decision exists.

### Public Persona Report Path

Promotable signal:

- A named safety/review scenario requires proving the report path with signed-in
  non-owner or another bounded tester class.

Keep paused if:

- No safety scenario exists or report readback ownership is unclear.

Possible later shape:

- Hosted rehearsal if route already exists; implementation only if rehearsal
  exposes a concrete defect.

Config/account inputs later:

- Tester account/session and replay owner; no raw credentials in docs.

### Owner Public Interaction Readback Expansion

Promotable signal:

- Owner needs a specific non-identifying insight that aggregate counters cannot
  answer.

Keep paused if:

- The requested insight needs visitor identity, transcript bodies, raw event
  payloads, or provider payloads.

Possible later shape:

- Privacy/readback preflight, then narrow implementation if accepted.

Config/account inputs later:

- None by default.

### Public Persona Answer-Quality Evidence

Promotable signal:

- Multiple hosted interactions show the same bounded public-source-only answer
  failure.

Keep paused if:

- Evidence is anecdotal, provider-branded, or not tied to a public persona seed.

Possible later shape:

- Evidence packet or fixture plan before any provider/model lane.

Config/account inputs later:

- Public-safe test prompts and public-source fixtures; no raw private prompts or
  completions.

### Commercial Or Partner Packaging

Promotable signal:

- Marty names a commercial, pricing, partner, or pilot promise and the audience
  it serves.

Keep paused if:

- The ask is only "make it launch-ready" without commercial or partner detail.

Possible later shape:

- Product/claim preflight before implementation or public copy changes.

Config/account inputs later:

- Product/commercial policy; Stripe or partner config only after a lane exists.

### Infrastructure Work

Promotable signal:

- A hosted public persona or demo path fails because of a concrete latency,
  scale, reliability, queue, retrieval, or provider limitation.

Keep paused if:

- The infrastructure proposal is speculative or based only on architecture
  preference.

Possible later shape:

- Gate packet first; disabled-safe prototype only if a test-only question is
  explicitly accepted.

Config/account inputs later:

- Provider, Redis, Cloudflare, worker, or queue config only after the limitation
  is named and accepted.

## Paused And Deferred List

Keep paused until separate decision criteria are met:

- anonymous public persona chat;
- external public launch;
- public launch copy;
- commercial packaging, pricing, tipping, invoices, tax, or billing UX;
- partner claims or real partner pilot work;
- durable visitor transcript storage;
- visitor identity or visitor-level analytics;
- public persona report/moderation expansion without a named safety scenario;
- provider/model/embedding changes;
- Redis Memory truth;
- Cloudflare retrieval/index mirrors;
- workers, queues, scheduled jobs, export/download infrastructure;
- broad UI reskin;
- Developer Space reopening without a named partner gap.

## Suggested Prep Artifacts

These are suggestions only, not assignments:

- Public persona pilot caveat card: one page separating internal signed-in
  tester proof from anonymous/public launch non-proof.
- Public persona privacy/readback checklist: aggregate-only owner readback,
  `transcriptStored:false`, no visitor identity, no raw events, no provider
  payloads.
- External pilot decision form: audience, success metric, allowed surfaces,
  prohibited surfaces, account/config needs, proof route, and stop conditions.
- Public persona report-path rehearsal sketch: safe scenario, reporter privacy,
  owner/admin readback, no raw report body leakage.
- Answer-quality evidence template: public-source-only prompt, public source
  used, visible answer behavior, failure classification, no private prompts or
  completions.
- Demo freshness checklist: hosted web/API readiness, commit prefix, seed
  persona eligibility, tester account availability, owner aggregate readback,
  desktop/mobile fit.

## Closing Boundary

ADV-003 records terrain only. It does not choose a next lane, assign A1-A4
work, wake A1-A4, change PR314/PR315 acceptance bars, request Marty config, or
push the product boundary beyond the internal hosted signed-in tester pilot
that PR315 proved.
