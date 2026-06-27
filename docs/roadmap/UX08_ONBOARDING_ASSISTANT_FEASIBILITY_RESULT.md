# UX-08 Onboarding And Station Assistant Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR
Status: COMPLETE - WAKE MIMIR
Completed: 2026-06-27

## Verdict

Current `main` should not rebuild onboarding or Station Assistant before
staging. PR25, PR73, PR348, PR349, PR350, PR399, PR403, and PR404 remain valid
current-main evidence for the four alpha onboarding paths, prompt-prefill
Assistant handoffs, first Space/public publishing entrypoint, hosted Public
step proof, Assistant action-map refresh, and state-aware Document Migrator/API
Bridge routing.

Recommended next action: open one tiny `UX-08A Persona Creation Provider Copy`
slice, unless MIMIR decides provider setup copy belongs to a later
provider/settings lane. The only confirmed visible drift I found is in
`apps/web/components/studio/awakening-flow.tsx`: the channel step says BYOK
provider choices require provider setup in Settings, but Settings does not
currently expose that setup. Fixing that should be copy/helper-level only.

Do not change provider routing, model calls, auth/session behavior, import
pipelines, Developer Space ingestion, Space creation, publishing semantics,
Assistant execution, schema, storage quota, billing, package scripts, or deploy
behavior for that slice.

## Current Route, Component, And API Map

- `/studio/onboarding` restores the Station session, keeps signed-out users at
  the sign-in boundary, loads personas, Developer Spaces, first persona archive
  state, and pending import review state, then renders the four accepted alpha
  path cards plus the Public step panel.
- `apps/web/lib/onboarding-paths.ts` owns the four-path map, path-specific
  Assistant prompt-prefill labels, Document Migrator state, API Bridge
  state, route-safe Developer Space manage links, bounded ingestion-key-tail
  readback, and first Space/public publishing guide.
- `/studio/new?path=fresh-start`, `/studio/new?path=awakening`, and
  `/studio/new?path=document-migrator` all render `AwakeningFlow`.
  Document Migrator redirects to the persona files route after persona
  creation; Fresh Start and Awakening redirect to the persona workspace.
- `/studio/personas/[personaId]/files` remains the owner archive/import review
  destination for Document Migrator.
- `/developer-spaces` and `/developer-spaces/[slug]/manage` remain the alpha
  API Bridge route set for Developer Space ingestion readback.
- `/space`, `/space/new`, and `/studio/publish` remain the owner-controlled
  first Space/public publishing route set.
- `/studio/assistant` renders `StationAssistantPanel`, restores a signed-in
  session, pre-fills bounded `prompt` query text, and sends only after an owner
  click.
- `/assistant/summary`, `/assistant/context`, and `/assistant/message` require
  auth and read owner-scoped Station state through
  `apps/api/src/services/station-assistant.service.ts`.

## Accepted Evidence To Keep

- PR25 made Fresh Start, Awakening, Document Migrator, and API Bridge
  alpha-routeable without fake live controls or new import/API infrastructure.
- PR73 added first-step/private-boundary depth and Assistant prompt-prefill
  handoffs. The Assistant handoff prefilled the message box only and did not
  auto-send.
- PR348 mapped current onboarding/Assistant state and made Assistant handoff
  labels path-specific.
- PR349 added the signed-in first Space/public publishing panel that points only
  to `/space`, `/space/new`, `/studio/publish`, and an Assistant prefill route.
- PR350 hosted-rehearsed the Public step at desktop and 375px, including
  signed-out boundary and no mutation during route checks.
- PR399 refreshed Station Assistant next-action copy for the accepted
  publish/readback/discussion/retract path while keeping Assistant operational
  and owner-controlled.
- PR403 made Document Migrator and API Bridge state-aware, including empty
  archive/import-review states and safe Developer Space manage routing.
- PR404 hosted-rehearsed Document Migrator/API Bridge state-aware onboarding on
  desktop and 390px with no create, import, upload, key-generation, Assistant
  send, publish, or retract action.

## Stale Assumptions

- The old assumption that the four onboarding paths are only conceptual is
  stale after PR25 and PR73.
- The PR348 first Space/public publishing gap is stale after PR349 and PR350.
- The PR348 Document Migrator/API Bridge state-depth gap is stale after PR403
  and PR404.
- Generic publishing guidance in Assistant is stale after PR399.
- Any note that the Assistant handoff sends automatically is stale; current
  behavior is prompt prefill plus explicit owner click.
- Any note that API Bridge requires new production worker, Cloudflare, Redis, or
  provider-routing work for alpha onboarding is stale; current alpha Bridge is
  Developer Spaces ingestion readback.

## Current Visible State Matrix

- Signed out: `/studio/onboarding` shows a sign-in/join boundary instead of
  owner path cards; `/studio/assistant` shows a sign-in panel.
- Signed in, no persona: Fresh Start and Awakening route to persona creation;
  Document Migrator says a private persona must be created first; API Bridge
  points to Developer Spaces; the Public step points to existing Space and
  publish routes.
- Signed in, with persona but no archive sources: Document Migrator tells the
  owner to add the first private archive source on the persona files route.
- Signed in, with import candidates: Document Migrator points to Import Review
  and tells the owner to accept, edit, or reject candidates.
- Signed in, with archive sources and no pending candidates: Document Migrator
  points to archive source status and adding the next source.
- Signed in, no Developer Space: API Bridge points to `/developer-spaces` and
  says to create a private Developer Space before bridge readback.
- Signed in, with Developer Space: API Bridge deep-links only to route-safe
  manage URLs and shows a bounded key-tail readback when available.
- First Space/public publishing: onboarding points to `/space`, `/space/new`,
  and `/studio/publish` with owner-controlled copy and an Assistant prefill
  route.
- Assistant prefill: `prompt` query text fills the message box but does not send
  until the owner presses `Ask Assistant`.
- Assistant next actions: archive/import, integrity, publishing, export, and
  quota/settings actions point to owner surfaces and keep changes
  owner-controlled.

## Caveats And Deferred Work

- The persona creation channel step still contains provider setup copy that can
  imply Settings has BYOK provider setup. That is the only default follow-up I
  recommend from this pass.
- There is still no durable cross-route onboarding progress state. This remains
  deferred; accepted alpha onboarding is route/state-aware, not a mature wizard.
- Fresh Start still uses the shared persona creation flow. This is acceptable
  alpha behavior because the copy says fields can stay light.
- Document Migrator remains pasted/uploaded owner archive intake plus import
  review. Live connector pulls, recurring sync, and external provider imports
  are deferred.
- API Bridge remains Developer Spaces alpha ingestion readback. Production
  worker flow, Cloudflare retrieval, Redis memory truth, provider routing, and
  external setup automation remain deferred.
- Station Assistant remains operational guidance only. It does not execute
  setup actions, create Spaces, change visibility, import material, publish,
  retract, call tools, or persist onboarding progress.
- PR350/PR404 hosted evidence is current enough for this feasibility pass, but
  UX-09 should still perform a staging-wide browser review once staging is the
  active lane.

## Recommended UX-08A Slice

Name: `UX-08A Persona Creation Provider Copy`

Goal: make the `/studio/new` channel step honest about provider setup without
adding provider settings or changing provider routing.

Allowed scope:

- `apps/web/components/studio/awakening-flow.tsx`
- a tiny helper/test only if extracting provider/channel copy makes review
  cleaner
- status/validation docs

Non-goals:

- no provider routing or model-call behavior changes
- no credential storage or provider-settings implementation
- no auth/session changes
- no onboarding wizard/progress-state implementation
- no import, Developer Space, Space, publishing, Assistant execution, schema,
  billing, storage, deploy, or package-script changes

ARGUS gates:

- Provider/channel copy must not imply unavailable Settings setup.
- Existing Fresh Start, Awakening, and Document Migrator redirects must remain
  unchanged.
- The patch must not touch provider runtime, auth/session, imports,
  Developer Spaces, publishing, Assistant backend behavior, schema, billing, or
  package scripts.
- Focused validation should include `test:studio-ui`, web typecheck, lint,
  `git diff --check`, and added-line sensitive-pattern scan.

ARIADNE rehearsal points:

- `/studio/new?path=fresh-start`, `/studio/new?path=awakening`, and
  `/studio/new?path=document-migrator` at desktop and 390px/375px.
- Confirm the channel step does not send users to unavailable Settings provider
  setup.
- Confirm Document Migrator still lands on persona files after creation.
- Do not create real hosted personas unless MIMIR explicitly authorizes a
  mutation packet.

## Validation

Docs-only feasibility patch. No live import, Developer Space key generation,
Space creation, publishing/retract action, Assistant send, provider call,
hosted mutation, schema change, package change, or product test was run.

| Command / check | Result | Notes |
| --- | --- | --- |
| Current source inspection | Pass | Onboarding, Assistant, persona creation, Space, publishing, helper, and API route code inspected. |
| Prior evidence reconciliation | Pass | PR25, PR73, PR348, PR349, PR350, PR399, PR403, and PR404 remain current-main evidence. |
| Recommended next action | Pass | Open one tiny persona creation provider-copy slice, or defer it to a provider/settings lane if MIMIR chooses. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| Added-line sensitive-pattern scan | Pass | No matches; command emitted CRLF normalization warnings only. |
