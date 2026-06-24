# Developer Space partner readiness map

Date: 2026-06-24

Owner: A2 / DAEDALUS

Status: PR255 map complete; awaiting ARGUS review.

## Purpose

This map reconciles the CTO Developer Pages brief with the current Station
Developer Space implementation before any new partner-readiness work begins.
It is a planning and boundary document only.

The immediate product target is Tier 1 partner readiness: a self-hosted
developer can publish a Station-hosted showcase, ingest public-safe project
state, explain evidence and methodology, and manage private operator controls.
Station should not claim Tier 2 hosted infrastructure, repository deployment,
background jobs, per-project databases, Redis/queues, destructive developer
agent tools, or billing/tipping readiness from the current code.

## CTO brief reading

The brief describes three connection levels:

- Tier 1 showcase window: the developer runs their own infrastructure. Station
  provides a public Developer Page, document/archive surface, community or
  publication layer, update feed, optional later tipping, and ingestion into a
  public observatory. The developer controls what becomes visible.
- Tier 2 full hosted infrastructure: Station hosts the app/runtime, database,
  queues, deploy pipeline, observatory, and private dashboard. Git push,
  container provisioning, background work, and developer-agent operations live
  here, not in the immediate Tier 1 lane.
- Tier 3 interconnected lab: later multi-project/research-lab composition, not
  a launch lane.

Tier 1 should therefore be judged as a public/private readback and ingestion
product, not as an infra host.

## Current Station truth

Code and docs inspected for PR255:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`, especially UX-06.
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`, Lane 8.
- `docs/roadmap/STATION_FUTURE_LANES.md`, Phase 2D/2E developer-agent notes.
- `apps/api/src/routes/developer-spaces.ts`.
- `apps/api/src/routes/exports.ts`.
- `apps/web/app/developer-spaces/[slug]/page.tsx`.
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`.
- `packages/developer-space-client/src/index.ts`.
- `apps/api/src/routes/developer-spaces.test.ts`.
- `packages/developer-space-client/src/index.test.ts`.
- `apps/web/lib/developer-space-observatory.test.ts`.

Current implementation summary:

- Public Developer Space readback exists through
  `GET /developer-spaces/:slug`, `GET /developer-spaces/:slug/stream`, and
  `apps/web/app/developer-spaces/[slug]/page.tsx`.
- Owner management exists through
  `apps/web/app/developer-spaces/[slug]/manage/page.tsx` and owner-only API
  routes for keys, usage, documents, project attachment, visual config,
  provider policy checks, exports, and bounded developer-agent actions.
- Ingestion exists for node state, events, snapshots, batch import, and
  observed-runtime webhooks:
  `/developer-spaces/ingest/nodes/:nodeId/state`,
  `/developer-spaces/ingest/events`,
  `/developer-spaces/ingest/snapshots`,
  `/developer-spaces/ingest/import`, and
  `/developer-spaces/ingest/observed-runtime`.
- `@station/developer-space-client` provides node/event/snapshot/import calls,
  observed-runtime signing helpers, structured error categories, and an Agents
  Observe dry-run/send boundary.
- Usage, quota, ingestion-key, signing-secret, rate-limit, and field visibility
  controls are present and tested.
- Developer Space evidence documents are linked with roles such as methodology,
  finding, field log, and note; owner templates can create those documents.
- Developer Space archive/export readback exists through authenticated export
  routes, and recent Project export work added adjacent owner-only manifest and
  bundle readback patterns.
- Developer-agent Phase 2D/2E work is intentionally bounded to safe readbacks,
  owner confirmations, receipts, private draft save, selected draft publish,
  selected public status note, `update_layout` suggestion/readback, and
  `run_job` dry-run/readiness readback.

## Requirement fit

| Brief requirement | Current Station fit | Readiness |
| --- | --- | --- |
| Public Developer Page / showcase | Public Developer Space route exists with observatory, evidence path, public story helpers, and owner manage link when authorized. | Close, but not partner-ready as a composed Developer Page. |
| Project header, handle, live status, uptime, key stats | The public route has project name, description, live state, nodes/events/snapshots, and visualization modes. | Partial. Partner-facing header/stat composition is not first-class. |
| Architecture overview | Observed runtime context, nodes, events, snapshots, and visual modes exist. | Partial. Needs partner-readable architecture overview copy/presets. |
| Live observatory | Public page, SSE stream, widget helpers, and visual config exist. | Present, but needs ARGUS/ARIADNE gates before partner claim. |
| Papers/documents/evidence archive | Developer Space document links and role-aware evidence helpers exist. | Present, with partner-onboarding docs still missing. |
| Updates/changelog | Developer-agent selected status notes and project-update draft/publish flow exist. | Partial. Not yet a clear project-specific update/changelog product surface. |
| Project-specific community/forum | Forums and community exist elsewhere. | Missing as a Developer Space-specific entry. |
| Ingestion API | Node, event, snapshot, batch import, and observed-runtime webhook endpoints exist. | Present. Needs standalone partner docs. |
| Developer client | `@station/developer-space-client` covers ingestion and observed-runtime helpers. | Present. Needs partner examples in docs. |
| Private developer dashboard | Manage route exists with key, usage, export, evidence, widget, and agent controls. | Present for protected alpha. Needs partner readiness checklist/readback. |
| Public/private field controls | Event/document/observed-runtime visibility controls and scrubbers exist. | Present, must stay an ARGUS gate. |
| Usage/quota/rate-limit errors | Usage and ingestion rate-limit logic expose machine-readable errors. | Present, should be documented for partners. |
| Export/readback | Developer Space export and owner Project export patterns exist. | Present, owner-only. Do not turn into public downloads in Tier 1. |
| Tier 1 / Tier 2 / Tier 3 relationship | Future-lane docs name the boundaries. | Partial. Product UI/API does not yet make connection tier state explicit. |
| Tipping/donation | Not implemented. | Deferred. |
| Hosted compute, per-project DB, Redis/queues, deploy pipeline | Not implemented as Developer Space product behavior. | Deferred to Tier 2. |
| Repository push/deploy and real developer-agent execution | Explicitly blocked in current Phase 2D/2E boundaries. | Deferred. |

## Misleading claims to avoid

- Do not call the current system full Developer Pages yet. It is a strong
  Developer Space observatory and owner console, but the public page is not
  yet a complete partner-ready page template with handle/status/stat framing,
  changelog, community entry, and partner onboarding docs.
- Do not claim Station hosts developer apps or databases. Current Tier 1 keeps
  developer infrastructure outside Station.
- Do not claim `run_job`, `push_to_repo`, key rotation, signing-secret creation,
  layout mutation, Docker/Coolify provisioning, or chat-native destructive
  developer-agent tools are ready. Current agent paths are safe readback,
  suggestion, confirmation, receipt, and dry-run/readiness boundaries.
- Do not expose raw ingestion keys, signing secrets, hosted credentials,
  private field values, raw payloads, prompt data, provider data, or document
  bodies in partner docs or public surfaces.
- Do not treat tipping, public interaction simulation, constitutional
  simulator, adversarial archive, D&D multi-instance operation, or Tier 3 lab
  composition as part of the next implementation slice.

## Recommended next lane

Recommended next move: **PR256 - Developer Space Tier 1 Partner Readiness
Preflight**, owned by ARGUS.

Reason: the next implementation will probably touch partner-facing docs and
visible Developer Space readback. Before DAEDALUS changes UI/docs, ARGUS should
preflight the exact claims and gates so Tier 1 readiness is not confused with
Tier 2 hosting or developer-agent execution.

ARGUS should decide whether the first implementation slice is limited to:

- standalone partner ingestion documentation with curl and TypeScript examples
  for node state, events, snapshots, batch import, and observed-runtime
  webhooks;
- owner-console readiness copy/checklist that points to existing key, usage,
  quota, export, evidence, and public/private field controls;
- small public-page framing improvements for Tier 1 showcase language, live
  status, key stats, and evidence reading path;
- no schema, API behavior, hosted infra, billing, deploy, repository, worker,
  or real developer-agent execution changes.

If ARGUS accepts that shape, DAEDALUS can implement a narrow Tier 1 partner
onboarding/readback slice after PR256.

## ARGUS gates for PR256

- Public/owner split: public page and docs must not reveal owner-console raw
  operational detail, private fields, raw payloads, secret material, document
  bodies, provider data, source ids, or hosted credentials.
- Key and signing safety: examples must use placeholders, never real local or
  hosted keys. No screenshot or docs text should expose active keys.
- Field visibility: public examples must respect current visibility classes
  and default scrubber behavior.
- Agent boundaries: docs must state that repo push, job execution, key
  rotation, signing-secret creation, layout mutation, and infra provisioning
  remain blocked or future.
- Product claims: Tier 1 is showcase/ingestion/observatory/readback for
  self-hosted developers; Tier 2 and Tier 3 remain deferred.
- Validation target for any implementation follow-up: `pnpm typecheck`,
  `pnpm test:developer-spaces`, `pnpm test:developer-space-client`,
  `pnpm test:exports` if export/readback copy changes, and `pnpm lint` if web
  files change.

## ARIADNE rehearsal routes

If PR256 opens a visible implementation slice, ARIADNE should rehearse:

- anonymous public route: `/developer-spaces/:slug`;
- owner route: `/developer-spaces/:slug/manage`;
- mobile width around `390px` for public observatory and owner onboarding
  controls;
- no-secret visual check for key, usage, quota, evidence, and agent panels.

The rehearsal should verify that a visitor understands what the observatory is
showing, while an owner understands how to ingest data and which controls are
private.
