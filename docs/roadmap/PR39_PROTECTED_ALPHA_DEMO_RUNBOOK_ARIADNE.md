# PR39 Protected-Alpha Demo Runbook - ARIADNE

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: refreshed for PR69 protected-alpha replay

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
> Continuity, Integrity, Archive import review, Settings AI Activity, and the
> Developer Space manage console are owner surfaces. Discover, public Spaces,
> published documents, forum discussions, and public Developer Spaces are
> anonymous/public surfaces. Archive is trust infrastructure; it preserves and
> explains source material without making private source bodies public.

Operator stance:

- Speak in terms of continuity, authorship, preservation, public story, and
  trust.
- Do not flatten Station into a generic dashboard.
- Do not present Station Assistant as a persona.
- Do not present Spaces as profiles.
- Do not present Developer Spaces as generic dashboards.

## Preflight

Open two browser contexts:

- Signed replay owner context for Studio, Memory, lifecycle/handoff,
  Continuity, Integrity, Archive import review, Settings AI Activity, Station
  Assistant, export/readback, and Developer Space manage.
- Anonymous/public context for `/`, Discover, public Space, public document,
  forum discussion, and public Developer Space.

Do not print or display credentials, cookies, tokens, private prompts, private
archive excerpts, raw provider payloads, trace IDs, owner IDs, persona IDs,
source IDs, ingestion keys, or replay corpus text.

Preflight checks:

1. Web health:
   `https://stationweb-production.up.railway.app/health`
2. API health:
   `https://stationapi-production.up.railway.app/health`
3. Web deployment:
   `https://stationweb-production.up.railway.app/health/deployment`
4. API deployment:
   `https://stationapi-production.up.railway.app/health/deployment`
5. Confirm both services report `ok:true`, deployment readiness `ready:true`,
   and current accepted product runtime
   `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f` or a later accepted product
   runtime.
6. Sign in with the seeded replay owner account from the local/private demo
   environment.
7. Keep the signed account on owner-private routes unless deliberately
   comparing with the anonymous public context.

Current accepted evidence:

- PR67 passed signed owner memory/observability replay on Railway runtime
  `b1e9ce3`.
- PR68 passed anonymous public front-door to Discover to Space/document/forum
  story continuity on the same runtime.
- PR66 through PR68 are docs/review commits and do not need Railway deployment
  before this runbook can be used.

## Route Order

### 1. Public Front Door And Discover

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

### 2. Signed Studio Dashboard

Route:

- `https://stationweb-production.up.railway.app/studio`

Show:

- Signed session restores after navigation/reload.
- Studio is the private workbench.
- Global Archive, onboarding paths, personas, export/readback, and Station
  Assistant are reachable.
- Mobile width should remain usable without document-level overflow.

Say:

> This is the private side of Station: personas, chat, notes, archive,
> continuity, Integrity, and careful publishing tools.

### 3. Persona Memory

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

Privacy rule:

- Do not quote or capture seeded/private memory content. Explain the structure,
  counts, labels, and boundary only.

### 4. Persona Lifecycle And Handoff

Route:

- Replay persona management/edit route for the seeded persona.

Show:

- Persona lifecycle events.
- Memory graph and handoff readback.
- Handoff labels/previews.
- Continuity, Archive, and Integrity counts.

Say:

> Station tracks the life of the persona as managed work. Handoffs and lifecycle
> records make continuity inspectable instead of invisible.

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

### 6. Integrity Review

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

### 7. Archive Import Review

Route:

- `https://stationweb-production.up.railway.app/studio/personas/:personaId/files`

Show:

- `Archive Trust`.
- Storage/quota readback.
- Import Review candidate cards.
- Memory/Canon candidate type.
- Private source type and sanitized source label.
- Destination, review state, accepted target, and preservation copy.

Say:

> Archive is trust infrastructure. It preserves source material and turns
> selected owner-reviewed material into Memory or Canon without exposing private
> source bodies.

If live action is needed:

- Use an existing replay-safe pending/reviewed candidate if present.
- Create a pasted import only if it is demo-safe and contains no private or
  credential-like material.

### 8. Settings AI Activity

Route:

- Settings AI Activity surface.

Show:

- Seven-day summary.
- Recent traces.
- Source/status/duration/token/cost style readback.
- Sanitized owner observability.

Say:

> AI Activity is owner observability. It helps the owner understand operational
> usage without exposing prompts, completions, provider payloads, or raw trace
> data.

Do not capture:

- Raw prompts.
- Raw completions.
- Provider payloads.
- Trace IDs.
- Credentials, tokens, or auth headers.

### 9. Developer Space Manage And Public Observatory

Owner route:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha/manage`

Public route:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`

Show on owner manage:

- `Current observatory state`.
- `Metered usage and quota`.
- Live nodes, recent events, snapshot availability, linked evidence, visitor
  evidence, owner-only evidence, visibility, and export readback.
- Usage counters are accounting, not the source of truth for live state.

Show on public route:

- Public observatory story.
- Public signal/evidence copy.
- No owner manage console.
- No ingestion key, credential, raw payload, or quota-management copy.

Say:

> Developer Spaces are live observatories, not generic dashboards. The owner
> sees live operational state and metering; visitors see the public
> observatory, public signals, and public evidence.

Current evidence:

- PR65 and PR67 showed one public replay Developer Space with live node/event
  evidence, a current snapshot, linked evidence rows, visitor-visible evidence,
  owner-only evidence, export readback, and matching usage counters.

### 10. Public Space, Document, And Forum Discussion

Use the PR68 public proof chain:

- Space:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha`
- Document:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- Discussion:
  `https://stationweb-production.up.railway.app/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Show:

- A public Space is a microsite/public surface, not a private profile.
- Published document has publication state and user-authored provenance.
- The document shows `Open discussion`.
- The forum thread shows `document discussion` and `Read source document`.
- Anonymous visitors do not see owner publish, signal-share, start-discussion,
  vote, report, or reply controls.

Say:

> This is the public side of Station. Private source material stays private; the
> owner publishes a separate public document and discussion thread.

### 11. Station Assistant

Route:

- `https://stationweb-production.up.railway.app/studio/assistant`

Show:

- Station Assistant surface.
- Workspace signals and next actions.

Say:

> Station Assistant is operational. It helps the owner understand what to do
> next; it is not another persona and it does not secretly publish, mutate
> memory, or bypass owner control.

### 12. Export Readback

Preferred route:

- Persona workspace export panel.

Optional route:

- `https://stationweb-production.up.railway.app/studio/export`

Show:

- Export package creation/readback if a live click is desired.
- Manifest and portable bundle structure.
- Export as owner trust and portability, not public publishing.

Say:

> Export is part of trust. The owner can get a portable record rather than
> being trapped inside an opaque continuity system.

### 13. Optional Live Chat Moment

Route:

- Replay persona workspace/chat route.

Use only if the room needs a live provider moment. Suggested prompt:

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

## Caveats To Say Aloud

- This is protected-alpha replay readiness, not full production polish.
- Owner-private Memory may contain seeded/replay text. Do not quote it or treat
  it as public product copy.
- Chat/provider latency can vary. Use visible status states instead of waiting
  silently.
- Public Space story currently works through Featured Works and Public Library;
  authored pages and public personas are thin in the replay seed.
- The linked forum discussion may be easier to find through Discover search or
  the public document's `Open discussion` link than through the latest Discover
  feed.
- Developer Space evidence is present in the current replay seed, including
  public/visitor evidence and owner-only evidence. Do not use the stale claim
  that the seeded Developer Space has no linked evidence.
- Onboarding paths exist but are not the final onboarding experience.
- Archive import/source review works for protected-alpha explanation, but
  parser/OAuth/recurring import polish remains future work.
- Worker queue readiness is not proven; current staging uses inline/fallback
  behavior for queue-dependent paths. This is not a demo blocker unless a
  specific queue-dependent route fails.
- Cloudflare, Redis working memory, hosted runtime, Project, billing expansion,
  DexOS, provider migration, parser/OAuth, and broad UI redesign are not part
  of this demo.

## Do Not Claim

- Do not claim Station is production-launch polished.
- Do not claim Cloudflare, Redis/Valkey working memory, BullMQ/worker queues,
  model marketplace, BYOK secret storage, provider streaming, provider
  migration, parser/OAuth, hosted runtime, Project, billing expansion, DexOS,
  or broad UI work are implemented by this lane.
- Do not claim public Discover searches private Studio archive, memory, canon,
  imports, or continuity.
- Do not claim Archive search exposes or publishes private source material.
- Do not claim Continuity is public.
- Do not claim AI Activity exposes prompts, completions, raw traces, or raw
  provider payloads.
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
2. Say that provider waits are intentionally visible.
3. Move to the already-proven Memory, Continuity, Integrity, Archive import
   review, Settings AI Activity, Developer Space, export, and PR68 public story
   proof chain.
4. Return to the chat tab later if it completes.

Do not ask for Cloudflare, Redis, provider migration, worker, or hosted runtime
work unless the failure is specifically tied to that route-level evidence.
Provider wait alone is not that.

## Mobile Pass

Spot check at `390px`:

- Studio dashboard.
- Persona Memory.
- Continuity.
- Archive import review.
- Developer Space manage.
- Public Space/document/forum chain if the public story will be shown on a
  phone.

Pass if there is no document-level horizontal overflow, offscreen control, or
visible application/auth error state.

## Recommended Next Lanes

Immediate recommendation:

- Use this runbook as the protected-alpha operator pack.
- Close PR69 if MIMIR accepts the refresh.
- Do not open an implementation lane unless the human demo reveals a concrete
  route-level blocker.

Possible evidence-gated follow-ups:

1. Public Space seed polish:
   Add replay-safe authored pages/personas only if the demo needs richer public
   Space navigation beyond Featured Works and Public Library.

2. Discover/thread surfacing:
   Tighten how linked document discussions appear in Discover only if the demo
   requires latest-feed visibility instead of document/search routeability.

3. Onboarding and Station Assistant polish:
   Improve the operator path from first sign-in into the right entry path,
   persona workspace, Archive, and Assistant guidance.

4. Archive import/source review UX:
   Make source processing, failure, candidate review, and owner-only visibility
   easier to explain without adding parser/OAuth/backend scope.

5. Post-V3 UI/UX roadmap execution:
   Use `docs/roadmap/STATION_UI_UX_ROADMAP.md` for broader UX work after
   protected-alpha demo truth is closed.

## Validation

- Read `docs/roadmap/PR66_MEMORY_OBSERVABILITY_LANE_CLOSEOUT.md`.
- Read `docs/roadmap/PR67_STAGING_REPLAY_SEQUENCE_AFTER_MEMORY.md`.
- Read `docs/roadmap/PR67_MEMORY_OBSERVABILITY_STAGING_REPLAY_ARIADNE.md`.
- Read `docs/roadmap/PR68_PUBLIC_STORY_CONTINUITY_REHEARSAL.md`.
- Read `docs/roadmap/PR68_PUBLIC_STORY_CONTINUITY_REHEARSAL_ARIADNE.md`.
- Read `docs/roadmap/PR69_PROTECTED_ALPHA_RUNBOOK_REFRESH.md`.
- No live blocker was reopened.
- Docs-only runbook; no imports, scripts, product code, schema, or API behavior
  touched.
- `git diff --check`
