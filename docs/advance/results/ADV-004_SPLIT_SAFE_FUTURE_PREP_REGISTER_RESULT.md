# ADV-004 - Split-Safe Future Prep Register Result

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete

## Summary

PR318 is active with DAEDALUS on public persona report moderation pointer and
admin readback hardening. This ADV-004 packet stays outside that lane. It does
not recommend a mainline PR, change product code, open product-boundary
decisions, modify acceptance gates, or start any listed prep item as a separate
packet.

The output request asked to wake MIMIR, but the ADV-004 boundary also says
`No A1-A4 wakeups`. This result therefore records the MIMIR question inside the
artifact and does not issue an A1 wakeup from this packet.

## Active Boundary To Avoid

Avoid all current PR318 work and evidence surfaces:

- `docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_DAEDALUS.md`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/moderation-console.ts`
- public persona report moderation pointer behavior;
- admin report moderation readback and safe target context;
- `/forums/moderation` product UI behavior;
- `/reports` authenticated admin data-route behavior;
- PR318 validation gates and acceptance-bar wording.

Also avoid any active dirty product or test files in the working tree. ADV work
may inspect high-level status docs but should not edit, stage, or steer active
mainline files.

## Future Prep Register

### 1. External Pilot Decision Form

Prep item:

- A decision form for whether Station should invite a named external public
  persona pilot audience.

Why it is safe to do apart:

- The form can capture product questions without changing public routes,
  authentication, reporting, billing, provider behavior, or moderation.

Active files, surfaces, and gates to avoid:

- PR318 moderation/admin files and gates.
- Public persona route implementation.
- Hosted pilot toggles, credentials, env values, raw ids, and deployment config.

Artifact to produce:

- `docs/advance/ADV-00X_EXTERNAL_PILOT_DECISION_FORM.md`
  with fields for audience, success metric, access boundary, support owner,
  abuse posture, privacy posture, rollback trigger, and explicit non-goals.

Suggested advance owner:

- KVASIR with CASSANDRA support for failure scenarios.

When it becomes useful:

- When Marty or MIMIR names a real external audience or asks whether the
  internal signed-in tester proof should become an external pilot.

When to discard it:

- If MIMIR decides no external pilot is in scope, or a later product brief
  replaces the pilot assumptions.

### 2. Public Launch Claim Checklist

Prep item:

- A checklist for claims Station may or may not safely make before any public
  launch or public-facing announcement.

Why it is safe to do apart:

- It is a claims and evidence inventory only. It can map proof, gaps, and
  forbidden overclaims without editing UI copy, marketing surfaces, or product
  behavior.

Active files, surfaces, and gates to avoid:

- PR318 moderation/admin work.
- Public website or app copy changes.
- Acceptance-bar edits and roadmap sequencing.
- Hosted logs, private prompts, completions, or provider payloads.

Artifact to produce:

- `docs/advance/ADV-00X_PUBLIC_LAUNCH_CLAIM_CHECKLIST.md`
  with claim, evidence source, known caveat, blocker, owner, and discard fields.

Suggested advance owner:

- JANUS with CASSANDRA support.

When it becomes useful:

- Before any public copy, launch note, partner pitch, or demo narration that
  could imply public availability, scale, anonymous access, billing readiness,
  or moderation guarantees.

When to discard it:

- If Station remains internal/protected-alpha only, or if MIMIR opens a
  concrete launch-readiness packet with a different claims frame.

### 3. Anonymous Chat Risk Checklist

Prep item:

- A checklist of product, abuse, privacy, moderation, and infrastructure risks
  for allowing anonymous visitors to chat with public personas.

Why it is safe to do apart:

- Anonymous chat is explicitly outside PR318 and current protected-alpha proof.
  A risk checklist can stay advisory and does not enable anonymous access.

Active files, surfaces, and gates to avoid:

- Public persona chat implementation.
- Report moderation/admin readback work.
- Rate limit, identity, analytics, transcript, queue, provider, and env config.
- Any acceptance bar that would imply anonymous chat is approved.

Artifact to produce:

- `docs/advance/ADV-00X_ANONYMOUS_CHAT_RISK_CHECKLIST.md`
  covering abuse, spam, reporting, rate limiting, transcript policy, owner
  readback, support burden, rollback, and proof requirements.

Suggested advance owner:

- CASSANDRA with JANUS support.

When it becomes useful:

- If Marty asks about anonymous public access, or if MIMIR considers moving
  beyond signed-in non-owner public persona testers.

When to discard it:

- If signed-in-only remains the durable policy, or if a later abuse/moderation
  model supersedes the checklist.

### 4. Partner And Commercial Readiness Questions

Prep item:

- A question bank for partner, pilot, pricing, entitlement, and commercial
  packaging readiness.

Why it is safe to do apart:

- It asks questions without changing billing, Stripe, checkout, portal,
  entitlement, partner surfaces, or pricing copy.

Active files, surfaces, and gates to avoid:

- Billing, Stripe, checkout, portal, webhook, entitlement, Developer Space, and
  partner product code.
- PR318 moderation/admin files and gates.
- Credentials, account ids, hosted config, provider payloads, or raw payment
  artifacts.

Artifact to produce:

- `docs/advance/ADV-00X_PARTNER_COMMERCIAL_READINESS_QUESTIONS.md`
  grouping questions by audience, offer, entitlement, support, evidence,
  pricing, operational owner, and explicit no-claim zones.

Suggested advance owner:

- KVASIR with SESHAT support.

When it becomes useful:

- When Marty asks what must be decided before a partner pilot, commercial
  pitch, plan copy, token top-up concept, or protected-alpha packaging choice.

When to discard it:

- If a concrete commercial brief, partner agreement, or pricing decision
  supersedes the general question bank.

### 5. Public Persona Answer-Quality Fixture Template

Prep item:

- A template for future public persona answer-quality fixtures using only safe,
  public, non-secret, non-provider payload fields.

Why it is safe to do apart:

- A template can define fixture shape and redaction rules without collecting
  prompts, completions, private source bodies, provider payloads, or raw hosted
  traces.

Active files, surfaces, and gates to avoid:

- Public persona route code.
- Provider/model routing, prompts, embeddings, completions, and private source
  storage.
- PR318 moderation/admin files and gates.
- Existing acceptance bars for model quality.

Artifact to produce:

- `docs/advance/ADV-00X_PUBLIC_PERSONA_ANSWER_QUALITY_FIXTURE_TEMPLATE.md`
  with allowed fields, forbidden fields, redaction rules, pass/fail note shape,
  fixture provenance, and discard rules.

Suggested advance owner:

- SESHAT with JANUS support.

When it becomes useful:

- If repeated hosted public persona replies show a specific quality concern
  that can be evaluated without provider churn or private data exposure.

When to discard it:

- If MIMIR chooses a different quality bar, provider path, or evaluation system,
  or if no repeatable answer-quality issue appears.

### 6. Demo Caveat And Freshness Checklist

Prep item:

- A checklist for whether an internal demo still matches current hosted proof,
  known caveats, and deployment freshness.

Why it is safe to do apart:

- It can summarize demo readiness inputs without running hosted probes,
  touching demo routes, changing product UI, or revising acceptance gates.

Active files, surfaces, and gates to avoid:

- PR318 moderation/admin implementation and validation.
- Hosted logs, credentials, cookies, tokens, raw ids, prompts, completions, and
  provider payloads.
- Product route changes, package scripts, and deploy config.

Artifact to produce:

- `docs/advance/ADV-00X_DEMO_CAVEAT_FRESHNESS_CHECKLIST.md`
  with current evidence source, commit/deploy freshness fields, caveats,
  blocked surfaces, route order, and recheck triggers.

Suggested advance owner:

- SESHAT.

When it becomes useful:

- Before a Marty demo, after a material demo-facing commit, or before an
  external pilot decision uses internal protected-alpha evidence.

When to discard it:

- If a new mainline demo rehearsal result replaces the current evidence, or if
  MIMIR opens a dedicated demo-readiness lane.

### 7. Config And Request Inventory For Future Pilots

Prep item:

- A no-values inventory of config categories, human decisions, access requests,
  and evidence permissions likely needed for future pilot work.

Why it is safe to do apart:

- It records categories only. It does not ask for or expose credentials, env
  values, raw ids, hosted logs, account identifiers, SQL dumps, provider
  payloads, or private source bodies.

Active files, surfaces, and gates to avoid:

- `.env` files and deployed config.
- Stripe, provider, database, analytics, identity, and hosting secrets.
- PR318 moderation/admin files and gates.
- Package scripts, migrations, and acceptance-bar changes.

Artifact to produce:

- `docs/advance/ADV-00X_FUTURE_PILOT_CONFIG_REQUEST_INVENTORY.md`
  listing category, why it may be needed, who can decide, forbidden evidence,
  safe placeholder shape, and promotion trigger.

Suggested advance owner:

- JANUS with SESHAT support.

When it becomes useful:

- When MIMIR needs a clean "what would we need from Marty" list before opening
  an external pilot, commercial pilot, partner pilot, or hosted proof lane.

When to discard it:

- If MIMIR opens a specific config packet, or if current environment policy
  makes one or more categories irrelevant.

## Coordination Notes

SESHAT, JANUS, and CASSANDRA were not woken during ADV-004. Their names above
are suggested owners only if MIMIR later opens a separate ADV packet.

The safest near-term ADV candidates are the public launch claim checklist, demo
caveat/freshness checklist, external pilot decision form, and config/request
inventory. That is not a recommendation for mainline sequence; it is only a
split-safe prep ordering if MIMIR wants another advance packet.

## Question For MIMIR

Which listed item, if any, should become the next separate ADV packet?

If MIMIR wants no next packet, ADV should return to watch and keep the active
mainline boundary clear for PR318.
