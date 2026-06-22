# PR39 Protected-Alpha Demo Runbook - ARIADNE

Date: 2026-06-21
Agent: A4 / ARIADNE
Verdict: refreshed for PR161 protected-alpha replay

## Frame

Use this as a protected-alpha replay, not a public-launch or production-polish
demo.

Two-minute opening script:

> Station is a private continuity studio with deliberate public story surfaces.
> This replay shows the core promise: the owner can see what Station remembers,
> what it holds out, how continuity, Integrity, and archive review feed runtime
> trust, and how private work becomes public story only through deliberate
> publishing. We are showing protected-alpha truth: connected enough to trust,
> honest about caveats, and careful with privacy boundaries.

Follow with:

> Watch the boundary changes. Signed-in Studio is private. Memory,
> Continuity, Integrity, Archive, Billing, Station Assistant, and the Developer
> Space manage console are owner surfaces. Discover, public Spaces, published
> documents, forum discussions, and public Developer Spaces are public-facing
> surfaces. Archive is trust infrastructure; it preserves and explains source
> material without making private source bodies public.

Operator stance:

- Speak in terms of continuity, authorship, preservation, public story, and
  trust.
- Do not flatten Station into a generic dashboard.
- Do not present Station Assistant as a persona.
- Do not present Spaces as profiles.
- Do not present Developer Spaces as generic dashboards.

## Current Accepted Evidence

This runbook is current through PR161.

- PR157 refreshed protected-alpha evidence: Railway web/API health and
  deployment checks were ready, Supabase/Gemini/NVIDIA/Stripe/Redis readiness
  was recorded at accepted proof levels, and PR156 closed the immediate
  Archive-retrieval latency loop for now.
- PR156 measured the context-preview improvement honestly: outer median
  improved from 4571ms to 1864ms, trace `total` median from 3549ms to 892ms,
  and `archive_retrieval` median from 3207ms to 531ms; none of the counted
  requests exceeded 3000ms. Treat this as protected-alpha evidence, not a
  permanent latency guarantee.
- PR158 reconciled roadmap truth: no backend implementation blocker is open
  from the current backend/product plan; Redis, Cloudflare, provider, and
  Stripe wording must stay inside their accepted boundaries.
- PR159 found hosted product defects in the public document chain and
  owner-visible UUID-shaped readback. DAEDALUS patched those defects and ARGUS
  accepted the public-read and redaction boundaries.
- PR160 rechecked the focused PR159 defects on hosted Railway runtime
  `6a8bb3eea401`: the public document chain no longer showed a
  browser-visible owner-aware `/documents/:documentId` HTTP 401, Runtime
  Context/readback, Saved Memory cards, Global Archive readback, and 390px
  mobile Memory showed zero UUID-shaped visible values, and 390px mobile Memory
  had no document-level horizontal overflow.
- Later docs-test commits may skip Railway deployment because they do not
  change watched runtime files. That is not stale runtime by itself. For this
  runbook, the deployed runtime is current enough when it serves the PR159
  runtime patch commit or a later accepted app-code runtime.

## Preflight

Open two browser contexts:

- Signed replay owner context for Studio, persona workspace, Memory,
  Continuity, Integrity, Archive/export, Billing, Station Assistant, and
  Developer Space manage.
- Anonymous/public context for `/`, Discover, public Space, public document,
  forum discussion, and public Developer Space.

Do not print or display credentials, cookies, tokens, private prompts, private
archive excerpts, raw provider payloads, trace IDs, owner IDs, persona IDs,
source IDs, ingestion keys, Checkout URLs, Stripe IDs, or replay corpus text.

Preflight checks:

1. Web health:
   `https://stationweb-production.up.railway.app/health`
2. API health:
   `https://stationapi-production.up.railway.app/health`
3. Web deployment:
   `https://stationweb-production.up.railway.app/health/deployment`
4. API deployment:
   `https://stationapi-production.up.railway.app/health/deployment`
5. Confirm both services report healthy/ready public status and branch `main`.
   A runtime at `6a8bb3eea401` or a later accepted app-code runtime is current
   enough for the PR159/PR160 public-read and redaction proof. A skipped deploy
   for docs-test commits after that does not block the demo.
6. Sign in with the seeded replay owner account from the local/private demo
   environment.
7. Keep the signed account on owner-private routes unless deliberately
   comparing with the anonymous public context.

## Route Order

### 1. Signed-Out Landing And Discover

Routes:

- `https://stationweb-production.up.railway.app/`
- `https://stationweb-production.up.railway.app/discover`

Show:

- Station has a public front door.
- Discover searches public and community-visible Station, not private Studio
  archive, memory, canon, imports, or continuity.
- Public browsing can route to Spaces, publications, forum threads, and
  Developer Space observatories.

Say:

> Public discovery is deliberately separated from private continuity work.
> Visitors can inspect public story, not the owner's private source material.

### 2. Public Space, Document, And Forum Discussion

Preferred path:

- Start from Discover or a known public Space.
- Open a public Space.
- Open a published document from that Space.
- Use the document's forum/discussion link where available.

Fallback:

- If the latest Discover feed does not surface the intended public document,
  use the public Space's visible document list or public search path rather
  than relying on old hard-coded document/forum IDs.

Show:

- A public Space is a microsite/public surface, not a private profile.
- Published document has publication state and author/provenance framing.
- The document can lead to a forum discussion when linked.
- Anonymous visitors do not see owner publish, signal-share, start-discussion,
  vote, report, reply, manage, or private Studio controls.

Say:

> This is the public side of Station. Private source material stays private; the
> owner publishes a separate public document and discussion thread.

Current evidence:

- PR160 rechecked the public document chain after the PR159 patch. The page
  shell returned HTTP 200, no browser-visible owner-aware document API 401 was
  observed, and the linked forum route returned HTTP 200.

### 3. Signed-In Studio And Persona Workspace

Routes:

- `https://stationweb-production.up.railway.app/studio`
- `https://stationweb-production.up.railway.app/studio/personas/:personaId`

Show:

- Signed session restores after navigation/reload.
- Studio is the private workbench.
- Persona workspace, Memory, Continuity, Archive/export, Billing, and Station
  Assistant are reachable.
- Runtime Context can be explained without displaying raw IDs or private source
  bodies.

Say:

> This is the private side of Station: personas, chat, notes, archive,
> continuity, Integrity, and careful publishing tools.

Privacy rule:

- Do not quote or capture private runtime context text. Explain structure,
  labels, and owner controls.

### 4. Memory

Route:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId/memory`

Show:

- `Memory Briefing`.
- Lifecycle counters and saved memory.
- Runtime eligibility and held-out memory copy.
- Owner actions such as reinforce, restore, quarantine, or reject.
- The owner can tell active memory from held-out or review-state material.

Say:

> Memory is not magic. Station shows the owner what is eligible for runtime,
> what is held out, and which actions can change that state.

Current evidence:

- PR160 rechecked desktop and 390px mobile Saved Memory cards and found zero
  UUID-shaped visible values. The 390px mobile Memory route had no
  document-level horizontal overflow.

Privacy rule:

- Do not quote or capture seeded/private memory content. Explain the structure,
  counts, labels, and boundary only.

### 5. Continuity

Route:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId/continuity`

Show:

- `Continuity Trust`.
- Runtime continuity preview.
- Timeline records.
- Separate Memory, Integrity, and Archive buckets.
- Provenance, visibility, source, version, and date labels.

Say:

> Continuity is the core paid value. Station accumulates durable, reviewable
> context instead of treating every chat as disposable.

Do not show or claim:

- Compiled system prompts.
- Raw private source bodies.
- Public continuity.

### 6. Archive And Export

Routes:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId/files`
- Persona workspace export panel.
- Optional: `https://stationweb-production.up.railway.app/studio/archive`
- Optional: `https://stationweb-production.up.railway.app/studio/export`

Show:

- `Archive Trust`.
- Storage/quota readback.
- Import review candidates if present.
- Private source type and sanitized source label.
- Export package status/readback if present.
- Export as owner trust and portability, not public publishing.

Say:

> Archive is trust infrastructure. It preserves source material and turns
> selected owner-reviewed material into Memory or Canon without exposing private
> source bodies.

Then:

> Export is part of trust. The owner can get a portable record rather than
> being trapped inside an opaque continuity system.

If live action is needed:

- Use an existing replay-safe pending/reviewed candidate if present.
- Create a pasted import only if it is demo-safe and contains no private or
  credential-like material.
- Do not trigger imports/exports if the demo does not need mutation.

Current evidence:

- PR160 rechecked Global Archive readback and found zero UUID-shaped visible
  values.

### 7. Developer Space Public And Manage

Public route:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`

Owner route:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha/manage`

Show on public route:

- Public observatory story.
- Public signal/evidence copy.
- No owner manage console.
- No ingestion key, credential, raw payload, or quota-management copy.

Show on owner manage:

- `Current observatory state`.
- `Metered usage and quota`.
- Live nodes, recent events, snapshot availability, linked evidence, visitor
  evidence, owner-only evidence, visibility, and export readback.
- Usage counters are accounting, not the source of truth for live state.

Say:

> Developer Spaces are live observatories, not generic dashboards. The owner
> sees live operational state and metering; visitors see the public
> observatory, public signals, and public evidence.

Spoken caveat:

- If methodology/finding/field-log documents are thin in the seed, say that the
  observatory infrastructure is present and the document storytelling layer is
  still protected-alpha content depth, not a missing dashboard feature.

### 8. Billing Status And Actions

Route:

- `https://stationweb-production.up.railway.app/billing`

Show:

- Current plan/status readback.
- Available plan or management actions as visible UI.
- Quota or entitlement language only as displayed.

Say:

> Billing is shown as status and entitlement clarity in this run. We are not
> claiming fresh paid activation unless this demo explicitly includes a hosted
> test-mode Checkout or signed webhook mutation proof.

Do not:

- Click Stripe Checkout or portal actions unless MIMIR has explicitly made
  paid activation part of the demo.
- Display, capture, or commit Checkout URLs, Stripe IDs,
  customer/subscription IDs, or webhook data.

### 9. Station Assistant

Route:

- `https://stationweb-production.up.railway.app/studio/assistant`

Show:

- Station Assistant surface.
- Workspace signals and next actions.

Say:

> Station Assistant is operational. It helps the owner understand what to do
> next; it is not another persona and it does not secretly publish, mutate
> memory, or bypass owner control.

### 10. Integrity Session

Route:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId/calibration`

Show:

- `Integrity Overview`.
- Integrity Session and timeline.
- Review cards that explain accept, edit-then-accept, and dismiss behavior.
- Destination labels for Memory, Canon, Preference profile, and preserved
  review state.

Say:

> Integrity Sessions are grounding and reflection infrastructure. They help the
> owner review what should become durable memory, canon, preference, or nothing
> yet.

Do not call Integrity:

- A personality test.
- A public assessment.
- A hidden automatic rewrite of the persona.

### 11. Optional Chat / Context-Preview Moment

Route:

- Replay persona workspace/chat route.

Use this only if the room needs a live provider/context moment.

Suggested prompt:

```text
For this demo, answer in one short sentence: what private continuity work is ready to show?
```

Narrate provider wait states:

- `Chat request accepted.`
- `Assembling chat context.`
- `Checking token budget.`
- `Waiting for model response.`
- `Saving assistant reply.`

Say during wait:

> The wait is visible on purpose. The user should know whether Station is
> assembling context, checking quota, waiting on the provider, or saving the
> result.

Latency caveat:

- PR156 improved the hosted context-preview sample enough to close the
  immediate Archive-retrieval latency loop for protected-alpha replay, but live
  provider/context latency can still vary. Use visible status states instead of
  waiting silently.

## Caveats To Say Aloud

- This is protected-alpha replay readiness, not full production polish.
- Current evidence supports a prepared hosted demo path, not broad production
  readiness or product completeness.
- Owner-private Memory, Continuity, Runtime Context, and Archive may contain
  seeded/replay text. Do not quote it or treat it as public product copy.
- Public discovery does not search private Studio archive, Memory, Canon,
  imports, or continuity.
- Chat/provider latency can vary. Use visible status states instead of waiting
  silently.
- PR156 latency evidence closes the immediate Archive-retrieval spike for now;
  it is not a promise that every future context-preview request is sub-3s.
- Stripe current closeout is config/test-resource readiness unless the demo
  includes a fresh hosted Checkout or signed webhook proof.
- Redis/Upstash is operational cache, idempotency, rate-limit, and cache-only
  queue-state support. It is not canonical Memory truth.
- Cloudflare is future adapter/index-mirror boundary. It is not live runtime,
  authoritative retrieval, Worker/Queue/Vectorize, or private-memory truth.
- Background jobs remain protected-alpha inline/fallback unless a current lane
  proves worker execution.
- Archive import/source review works for protected-alpha explanation, but
  parser/OAuth/recurring import polish remains future work.
- Onboarding paths exist but are not the final onboarding experience.
- Developer Space evidence is present enough to show a live observatory; richer
  methodology/finding/field-log storytelling can remain content/product depth.

## Claims To Avoid

- Do not claim Station is production-launch polished.
- Do not claim broad backend completion, full MVP completion, or public launch
  readiness.
- Do not claim Cloudflare, Redis/Valkey canonical memory, BullMQ/worker queues,
  model marketplace, BYOK secret storage, provider streaming, provider
  migration, parser/OAuth, social dispatch, scheduled publishing, DexOS, or
  broad UI redesign are implemented by this runbook.
- Do not claim public Discover searches private Studio archive, Memory, Canon,
  imports, or continuity.
- Do not claim Archive search exposes or publishes private source material.
- Do not claim Continuity is public.
- Do not claim AI Activity exposes prompts, completions, raw traces, or raw
  provider payloads.
- Do not claim Stripe paid activation is current unless the demo includes a
  fresh hosted test-mode Checkout or signed webhook mutation proof.
- Do not call Station Assistant a persona.
- Do not present Spaces as profiles; they are public microsites/public
  surfaces.
- Do not present Developer Spaces as generic dashboards or quota panels; they
  are live observatories.
- Do not broaden Station into IntelHub CTI, exposure, recon, finance, or
  unrelated intelligence scope.

## Fallback If Live Chat Is Slow

If chat waits longer than feels good in the room:

1. Read the current status message aloud.
2. Say that provider/context waits are intentionally visible.
3. Move to already-proven Memory, Continuity, Integrity, Archive/export,
   Developer Space, Billing status, Station Assistant, and public story route.
4. Return to the chat tab later if it completes.

Do not ask for Cloudflare, Redis, provider migration, worker, or hosted runtime
work unless the failure is specifically tied to route-level evidence. Provider
wait alone is not that.

## Mobile Pass

Spot check at `390px` only if the demo will show mobile:

- Landing/Discover.
- Public Space/document/forum chain.
- Studio dashboard.
- Persona Memory.
- Continuity.
- Archive/export.
- Developer Space public/manage.
- Billing.

Pass if there is no document-level horizontal overflow, offscreen control, or
visible application/auth error state.

Current evidence:

- PR160 already rechecked 390px mobile Memory for the PR159 redaction/overflow
  issue and found zero UUID-shaped visible values and no document-level
  horizontal overflow.

## If A Route Is Broken

Do not broaden the lane.

Record only:

- route;
- viewport;
- signed/public account role;
- expected behavior;
- actual behavior;
- whether the symptom touches auth, visibility, privacy, billing, or owner
  scoping.

Wake DAEDALUS for exact implementation defects. Ask for ARGUS review when the
defect touches auth, visibility, privacy, billing, or owner scoping.

## Recommended Next Move

Immediate recommendation:

- Use this runbook as the protected-alpha operator pack.
- MIMIR can treat the runbook as ready for a prepared human demo, with the
  spoken caveats preserved.
- Do not open an implementation lane unless the human demo reveals a concrete
  route-level blocker.

Possible evidence-gated follow-ups:

1. Fresh paid-activation proof:
   Open only if the next demo needs current hosted Checkout/signed webhook
   evidence.

2. Public Space seed polish:
   Add replay-safe authored pages/personas only if the demo needs richer public
   Space navigation.

3. Discover/thread surfacing:
   Tighten linked document discussion surfacing only if the demo requires
   latest-feed visibility instead of document/search routeability.

4. Onboarding and Station Assistant polish:
   Improve the operator path from first sign-in into the right entry path,
   persona workspace, Archive, and Assistant guidance.

5. Archive import/source review UX:
   Make source processing, failure, candidate review, and owner-only visibility
   easier to explain without adding parser/OAuth/backend scope.

6. Post-V3 UI/UX roadmap execution:
   Use `docs/roadmap/STATION_UI_UX_ROADMAP.md` for broader UX work after
   protected-alpha demo truth is closed.

## Validation

- Read `docs/roadmap/PR157_STAGING_ALPHA_EVIDENCE_REFRESH.md`.
- Read `docs/roadmap/PR158_ROADMAP_SOURCE_OF_TRUTH_RECONCILIATION.md`.
- Read `docs/roadmap/PR159_HOSTED_PRODUCT_WALKTHROUGH_EVIDENCE.md`.
- Read `docs/roadmap/PR160_HOSTED_PR159_RECHECK.md`.
- Read `docs/roadmap/PR161_PROTECTED_ALPHA_DEMO_RUNBOOK_REFRESH.md`.
- No live blocker was reopened.
- Docs-only runbook; no imports, scripts, product code, schema, or API behavior
  touched.
- `git diff --check`
