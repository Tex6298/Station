# PR39 Protected-Alpha Demo Runbook - ARIADNE

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Demo runbook ready for MIMIR closeout

## Frame

Use this as a protected-alpha replay, not a full public-launch demo.

Two-minute opening script:

> Station is a private continuity studio with a public publishing layer. The
> point of this replay is to show that the core loop is connected: private
> persona work, continuity, archive, export, selective publishing, public
> discussion, Station Assistant, and Developer Space observability. This is not
> production polish yet. We are showing the protected-alpha path honestly, with
> privacy boundaries visible and caveats spoken aloud.

Follow with:

> Watch for the boundary changes. Signed-in Studio is private. Public Space,
> the published document, forum discussion, Discover, and Developer Space are
> anonymous/public surfaces. The archive is trust infrastructure; it supports
> continuity without exposing private source material.

## Preflight

Open two browser contexts:

- Signed replay owner context for Studio, Archive, export, publishing, and
  Station Assistant.
- Anonymous/public context for Discover, public Space, public document, forum
  discussion, and Developer Space.

Do not print or display credentials, cookies, tokens, private prompts, private
archive excerpts, provider payloads, or owner IDs.

Preflight checks:

1. Web health:
   `https://stationweb-production.up.railway.app/health/deployment`
2. API health:
   `https://stationapi-production.up.railway.app/health/deployment`
3. Confirm both report ready and a deployed app-code runtime. PR38 passed on
   `6b87332`.
4. Sign in with the seeded replay owner account from the local/private demo
   environment.
5. Keep the signed account on private Studio routes unless deliberately showing
   the public/anonymous surface in the second context.

## Route Order

### 1. Public Front Door

Route:

- `https://stationweb-production.up.railway.app/`
- `https://stationweb-production.up.railway.app/discover`

Show:

- Station has a public front door.
- Discover is public browsing and public/community context, not private archive
  search.
- Private Studio, archive, memory, canon, import, and continuity remain behind
  sign-in.

Say:

> Public discovery is deliberately separated from private continuity work.

### 2. Signed Studio Dashboard

Route:

- `https://stationweb-production.up.railway.app/studio`

Show:

- Signed session persists after navigation/reload.
- Studio dashboard is the private workbench.
- At mobile width, PR37 fixed the previous dashboard overflow.
- Global Archive, onboarding paths, personas, export, and Station Assistant are
  reachable.

Say:

> This is the private side of Station: personas, chat, notes, archive,
> continuity, and careful publishing tools.

### 3. Persona Workspace And Chat

Route:

- `https://stationweb-production.up.railway.app/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414`

Show:

- Persona workspace and private chat.
- Runtime context / continuity framing.
- Send one short prompt only if the operator wants a live provider moment.

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
> result. If provider latency spikes, narrate the status states and move on to
> the already-seeded archive/export/public proof.

### 4. Continuity

Route:

- `https://stationweb-production.up.railway.app/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414/continuity`

Show:

- Continuity is its own stop, not only hidden runtime counts.
- Timeline records and private continuity markers are visible to the owner.

Say:

> Continuity is the paid-value direction: the system accumulates durable,
> reviewable context instead of treating every chat as disposable.

### 5. Archive Search And Source Copy

Route:

- `https://stationweb-production.up.railway.app/studio/archive`

Show:

- `Search private archive`.
- `Source material and visibility`.
- Owner-only/private copy.
- Search/source narrative without exposing private source bodies.

Say:

> Archive is trust infrastructure. It preserves source material and makes it
> searchable for the owner, but public publishing is a separate deliberate act.

### 6. Export Readback

Preferred route:

- Persona workspace export panel:
  `https://stationweb-production.up.railway.app/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414`

Optional route:

- `https://stationweb-production.up.railway.app/studio/export`

Show:

- Export package creation/readback if a live click is desired.
- Manifest and portable bundle structure.
- Explain that PR38 verified `manifestMarkdown` and bundle readback with
  `schema`, `generatedAt`, `package`, `privacy`, `integrity`, and `files`.

Say:

> Export is part of trust. The user can get a portable record rather than being
> trapped inside an opaque continuity system.

### 7. Public Space, Document, And Forum Discussion

Use the PR38 public proof chain:

- Space:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha`
- Document:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- Discussion:
  `https://stationweb-production.up.railway.app/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Show:

- A public Space is a microsite/public surface, not a private profile.
- Published document has public visibility and provenance framing.
- Discussion links from the public document into the forum.

Say:

> This is the public side of Station. Private source material stays private; the
> owner publishes a separate public document and discussion thread.

### 8. Station Assistant

Route:

- `https://stationweb-production.up.railway.app/studio/assistant`

Show:

- Station Assistant surface.
- Workspace signals and next actions.

Say:

> Station Assistant is operational. It helps the owner understand what to do
> next; it is not another persona and it does not secretly publish, mutate
> memory, or bypass owner control.

### 9. Public Developer Space

Route:

- `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`

Show:

- `What is visible`.
- Methodology/field-log/live-signal explanation.
- Visitor/private boundary copy.
- Current public live observatory state.

Say:

> Developer Spaces are live observatories, not generic dashboards. This seeded
> example currently has live node/signal evidence, but not linked public
> methodology documents yet.

## Caveats To Say Aloud

- This is protected-alpha replay readiness, not full production polish.
- Chat/provider latency can vary. Use the visible status states instead of
  waiting silently.
- The seeded Developer Space has no linked public methodology/finding/field-log
  documents yet; the current story is live signals and snapshots.
- Onboarding paths exist but are not the final onboarding experience.
- Archive import/source flows work, but broader import polish remains future
  UX work.
- Cloudflare is not part of this demo. PR38 found no concrete retrieval,
  latency, public-edge delivery, or NESTstyle-memory defect that requires it.

## Do Not Claim

- Do not claim Station is production-launch polished.
- Do not claim Cloudflare, Redis/Valkey memory tiers, model marketplace, BYOK
  secret storage, or provider streaming changes are implemented by this lane.
- Do not claim Developer Space methodology documents are seeded when they are
  not linked yet.
- Do not claim Archive search exposes or publishes private source material.
- Do not call Station Assistant a persona.
- Do not present Spaces as profiles; they are public microsites/public surfaces.
- Do not imply public Discover searches private Studio archive, memory, canon,
  imports, or continuity.
- Do not broaden Station into IntelHub CTI, exposure, recon, finance, or
  unrelated intelligence scope.

## Fallback If Live Chat Is Slow

If chat waits longer than feels good in the room:

1. Read the current status message aloud.
2. Say that provider waits are intentionally visible.
3. Move to the already-proven Continuity, Archive, export, and PR38 public
   proof chain.
4. Return to the chat tab later if it completes.

Do not ask for Cloudflare config unless the failure is specifically public-edge
delivery, retrieval, or memory infrastructure. Provider wait alone is not that.

## Recommended Next Lanes

1. Developer Space evidence seeding:
   Add a small public methodology/finding/field-log document set to the seeded
   Developer Space so the public observatory story has real linked notes.

2. Onboarding and Station Assistant demo polish:
   Tighten the operator path from first sign-in into the right entry path,
   persona workspace, Archive, and Assistant guidance.

3. Archive import/source review UX:
   Make source processing, failure, candidate review, and owner-only visibility
   easier to explain without adding backend scope.

4. Chat latency narration and status copy:
   Keep the current streaming status model, but tune copy and demo guidance so
   provider waits feel intentional rather than uncertain.

5. Post-V3 UI/UX roadmap execution:
   Use `docs/roadmap/STATION_UI_UX_ROADMAP.md` to slice the broader UX work
   after the protected-alpha demo is closed.

Immediate recommendation:

- Close PR39 as the demo operator pack.
- Run the human demo from this runbook.
- Open the next implementation lane around Developer Space evidence seeding
  unless the human demo reveals a sharper UX blocker.

## Validation

- Read `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`.
- Read `docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL_ARIADNE.md`.
- No live blocker was reopened.
- Docs-only runbook; no imports or scripts touched.
