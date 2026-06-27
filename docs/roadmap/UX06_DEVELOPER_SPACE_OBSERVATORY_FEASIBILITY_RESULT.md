# UX-06 Developer Space Observatory Clarity Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR
Status: COMPLETE - WAKE MIMIR
Completed: 2026-06-27

## Verdict

Current `main` does not need a default UX-06 implementation slice.

Developer Space Tier 1 protected-alpha was already closed by the PR255 through
PR260 evidence chain, and later UX-06 work has moved the public observatory
past that closeout:

- PR342 and PR343 added and rehearsed the public `How to read this observatory`
  reading path.
- PR355 and PR356 proved the evidence storytelling path for public and owner
  routes.
- PR357 through PR361 made the first public `Project notes` updates widget live,
  repaired the status-note source, and proved it on hosted desktop and mobile.

Recommendation: close UX-06 feasibility and move to the next roadmap lane,
likely UX-07 billing and entitlement clarity unless MIMIR chooses a higher
priority lane. Do not reopen Developer Space observatory work by inertia.

## Current Route, API, And Component Map

Public and owner routes:

- `/developer-spaces` uses `apps/web/app/developer-spaces/page.tsx`.
  - Loads public observatories from `/developer-spaces/public`.
  - Loads owner spaces from `/developer-spaces` after sign-in.
  - Allows canon-tier creation through existing create route.
- `/developer-spaces/[slug]` uses
  `apps/web/app/developer-spaces/[slug]/page.tsx`.
  - Loads `/developer-spaces/:slug` and optional signed-in access.
  - Subscribes to `/developer-spaces/:slug/stream`.
  - Renders Tier 1 framing, observatory orientation, evidence reading path,
    visualizations, event stream, latest snapshot, and `Project notes`.
  - Shows raw detail only when `shouldShowRawDeveloperSpaceData(detail.access)`
    is owner-only.
- `/developer-spaces/[slug]/manage` uses
  `apps/web/app/developer-spaces/[slug]/manage/page.tsx`.
  - Requires owner access through the existing detail route.
  - Loads usage from `/developer-spaces/:id/usage`.
  - Loads owner export packages from `/exports/developer-spaces/:id`.
  - Manages ingestion keys, observed-runtime signing material, visual mode,
    widgets, evidence documents, exports, bounded Developer Agent previews,
    confirmations, receipts, public status notes, and project-update drafts.

API and package surfaces:

- `apps/api/src/routes/developer-spaces.ts`
  - Public reads: `GET /developer-spaces/public`, `GET /developer-spaces/:slug`,
    `GET /developer-spaces/:slug/stream`.
  - Owner reads/writes: `GET /developer-spaces`, `POST /developer-spaces`,
    visual config updates, project assignment, usage, ingestion key management,
    observed-runtime signing material, evidence document/template routes, and
    export-adjacent owner readback.
  - Ingestion: node state, events, snapshots, batch import, and
    observed-runtime webhook ingestion.
  - Developer Agent boundary: registry, preview, confirmations, receipts,
    audit export, private project-update drafts, selected publish, public
    status note, layout suggestion, and `run_job` readiness/readback.
- `packages/developer-space-client/src/index.ts`
  - Provides ingestion calls, observed-runtime webhook signing helpers, and
    Agents Observe dry-run/send boundaries.
- Current focused tests:
  - `apps/api/src/routes/developer-spaces.test.ts`.
  - `packages/developer-space-client/src/index.test.ts`.
  - `apps/web/lib/developer-space-observatory.test.ts`.

## Evidence To Keep From PR255 Through PR260

- PR255 partner readiness map correctly framed Tier 1 as Station-hosted
  showcase, ingestion, observatory, evidence/readback, and owner controls for
  self-hosted developer runtimes.
- PR256 ARGUS preflight narrowed the first follow-up to docs-only partner
  onboarding and set public/owner, visibility, signing, export, and agent
  boundaries.
- PR257 partner onboarding docs added placeholder-only ingestion examples,
  visibility/privacy guidance, owner-console checklist, troubleshooting, and
  explicit Tier 2/Tier 3 deferrals.
- PR258 visible framing made existing public and owner routes read as Tier 1
  showcase plus private operating console without opening infrastructure,
  billing, community, or agent execution scope.
- PR259 hosted rehearsal passed public and owner routes on desktop and mobile.
- PR260 closeout audit was accepted by ARGUS: Tier 1 protected-alpha can stay
  closed, and follow-up work needs a fresh named product need.

## Later Current-Main Evidence To Keep

- PR342 / PR343: public observatory orientation is live and hosted-proven. The
  route explains public evidence first, then current readback, then snapshot
  boundaries.
- PR355 / PR356: evidence storytelling is already covered and hosted-proven.
  Public methodology, findings, field logs, notes, owner drafts, and raw owner
  detail stay separated.
- PR357 / PR358: the public `Project notes` widget is no longer dormant. It
  renders public field-log updates from the existing detail payload, with hosted
  proof for field-log rows.
- PR359 / PR360 / PR361: public owner-approved status notes now have web-helper,
  API repair, and hosted final proof. The old status-note caveat is closed.

## Stale Assumptions

- The PR255 map warning that the public page was not yet partner-ready as a
  composed Developer Page is stale for protected alpha after PR258/259 and
  PR342/343. It remains useful only as a reminder not to claim Tier 2 hosting.
- PR260's project updates/changelog caveat is stale for the first public route
  slice. `Project notes` now renders public field logs and owner-approved
  status notes. A full global/Discover feed is still separate future work.
- PR342's recommendation for ARIADNE hosted observatory proof is stale because
  PR343 passed.
- PR358's caveat about missing hosted status-note rows is stale because PR359,
  PR360, and PR361 repaired and proved the status-note source.
- Any instruction to expand Developer Spaces into hosted app runtime, repo
  deploy, billing, public community, or real agent execution by implication is
  stale for UX-06. Those are separate product/architecture lanes.

## Current Classification

Solved for protected alpha:

- Public observatory header and Tier 1 external-runtime explanation.
- Non-technical reading path for evidence, current readback, and snapshots.
- Node/event/snapshot/status readback, including public-safe live-signal copy.
- Methodology/finding/field-log/note evidence path and role labels.
- Owner manage console private/public split.
- Ingestion key and observed-runtime signing-material copy.
- Usage/quota/readback distinction from current observatory state.
- Owner-only export/readback boundaries.
- Bounded Developer Agent readback, preview, confirmation, receipt,
  selected-status-note, layout-suggestion, project-update draft, and `run_job`
  readiness copy.
- First public project updates/changelog widget through `Project notes`.
- Hosted public/owner desktop/mobile evidence for public observatory,
  evidence-storytelling, field-log project updates, and status-note project
  updates.

Acceptable protected-alpha caveats:

- `Project notes` is route-local. It is not yet integrated into Discover or a
  global project-update feed.
- Connection tier state is copy/docs/readback, not a first-class billing or
  entitlement product model.
- Owner manage remains a dense operating console; it is acceptable for protected
  alpha because current hosted proof found the primary route readable, but any
  future visual rearrangement needs ARIADNE.
- PR360 recorded a Windows Turbo root-lint spawn issue in that lane, while
  targeted web lint and Developer Space tests passed. Treat broad lint tooling
  failures as validation truth to recheck when implementation resumes.

Deferred, not UX-06 blockers:

- Developer Space-specific community/forum entry.
- Pricing, tipping, donations, or connection-tier billing behavior.
- Tier 2 hosted infrastructure: Station-hosted runtime, per-project database,
  queues, workers, deploy pipeline, repo push/deploy, and real job execution.
- Tier 3 lab/interconnected research surfaces.
- Cloudflare/Redis/provider architecture questions.
- Developer Agent execution expansion beyond the current bounded readback and
  owner-confirmed narrow actions.

No confirmed current gap:

- No broken Developer Space observatory route, owner console route, public
  serializer, updates widget, usage/quota readback, evidence path, export
  boundary, or client/docs mismatch was found in this pass.

## Recommendation

No UX-06 implementation should open by default.

Recommended next move: MIMIR should close UX-06 feasibility and move to UX-07
billing and entitlement clarity, unless another roadmap priority is more urgent.

Optional evidence-only fallback: if MIMIR wants fresh proof before closeout,
route ARIADNE to a no-mutation public/owner replay of:

- `/developer-spaces/station-replay-dev-alpha`;
- `/developer-spaces/station-replay-dev-alpha/manage`;
- desktop, 390px, and 375px;
- public observatory, evidence path, `Project notes`, usage/quota, exports,
  ingestion-key panel, signing-material panel, widgets, and bounded agent
  controls.

Do not ask DAEDALUS for implementation unless that rehearsal finds a specific
defect.

## ARGUS Gates If A New Developer Space Slice Opens

- If public observatory/search/Discover integration changes: require
  `test:developer-spaces`, public serializer review, public/private result
  review, typecheck, lint, and ARIADNE desktop/mobile proof.
- If owner console controls change: require owner access review,
  `test:developer-spaces`, relevant web helper tests, typecheck, lint, and a
  check that credential-like material and owner-only readbacks stay private.
- If exports/readback copy or payloads change: add `test:exports` and review
  owner-only bundle/readback scope.
- If ingestion, webhook, signing material, usage/quota, or rate limits change:
  require API route tests, developer-space client tests, quota/rate-limit
  review, and no public behavior claim until ARGUS accepts.
- If billing/pricing/tipping opens: use a billing/product preflight, not a
  Developer Space observatory lane.
- If Tier 2 hosting opens: use architecture/security preflight before any code.

## ARIADNE Human Rehearsal Points If Requested

- Public route signed out: Tier 1 public observatory, evidence path, current
  readback, snapshot boundary, `Project notes`, and no owner controls.
- Public route as owner: owner affordance is visible as owner-only while public
  visitor framing remains intact.
- Owner manage route: private operating-console framing, ingestion keys,
  observed-runtime signing material, usage/quota, export/readback, widgets,
  evidence creation/review/publish-request states, and bounded agent controls.
- Mobile 390px and 375px: no horizontal overflow, clipped controls, unreadable
  copy, or trapped action panels.
- Mutation guard: no key rotation, evidence mutation, export creation, agent
  execution, widget save, billing action, ingestion, or status-note publish
  unless MIMIR explicitly authorizes that exact action for the rehearsal.

## Validation

Docs-only pass. No product code changed.

| Command / check | Result | Notes |
| --- | --- | --- |
| Current route/code scan | Pass | Reviewed Developer Space public, owner, API, helper, client, and focused test surfaces against current `main`. |
| Historical evidence reconciliation | Pass | PR255 through PR260 remain the Tier 1 closeout chain; PR342 through PR361 add current observatory, evidence, and project-update proof. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| Added-line sensitive-pattern scan | Pass | No matches; command emitted CRLF normalization warnings only. |

## Handoff

Wake MIMIR. Recommended decision: close UX-06 feasibility with no
implementation slice and move to UX-07 billing and entitlement clarity, unless
MIMIR chooses a different roadmap priority.
