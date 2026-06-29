# PR479 - Native Authoring / Versioning Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_PR479A_VERSION_COMPARE_READBACK`

## Decision

ARGUS accepts the smallest honest next slice as:

```text
PR479A - Owner Version Compare Readback
```

This is an owner-only, metadata-only version compare/readback slice for the
existing native document authoring flow. It should make the current version and
one prior captured version easier for the owner to compare without exposing
prior-version bodies, private source material, raw identifiers, or any public
version history.

It is not a rich editor, restore/revert workflow, public history page, document
type remodel, template system, scheduling/social/Station Press feature, provider
call, schema change, or publish/retract/delete mutation change.

## Existing Surface Findings

Repo inspection found enough existing versioning surface to support a narrow
web/helper/test slice:

- `GET /documents/:id/versions` already exists and is authenticated,
  owner/admin-only. Non-owners receive a not-found response.
- Updating an owner document snapshots the previous owner state before the
  update and increments the current document version.
- Public document reads expose the current published document version only and
  do not include a `versions` array.
- `/studio/publish` already loads owner-only version history for the selected
  document and shows a compact Version History panel.
- The public Space document route only loads prior versions when `ownerAccess`
  is true; public readers see current-document readback only.
- `apps/web/lib/publishing.ts` already has
  `documentVersionSummaryLabel(...)`, but no compare helper or owner-facing
  changed/unchanged metadata readback.
- PR401/PR402 already accepted authoring guidance and current version-history
  truth, so PR479A should deepen the owner version compare/readback rather than
  repeat guide copy.

## Boundary Findings

Accepted for PR479A:

- owner-only compare/readback for the existing Studio publish/version surface;
- metadata-only compare fields such as version number, title, slug, document
  type, status, visibility, comments setting, Space/persona presence, published
  state, captured time, and safe source/provenance label when already rendered
  safely for the owner;
- focused helper/model coverage proving changed and unchanged metadata is
  honest and bounded;
- visible UI copy that states prior bodies, source internals, and public history
  are not exposed by the compare readback.

Blocked beyond PR479A:

- rendering or diffing prior-version bodies;
- exposing source IDs, owner user IDs, raw document IDs, raw discussion/thread
  IDs, SQL/table details, approval internals, stack traces, provider payloads,
  secrets, or private archive/source material;
- public prior-version routes, public compare links, public history panels, or
  public API expansion;
- restore, revert, delete, publish, retract, approval-state, scheduling, social
  dispatch, Station Press, SEO/OpenGraph, PDF/print, provider/model, AI
  drafting, Redis, Cloudflare, worker/queue, billing, Stripe, auth/session, or
  deployment behavior changes;
- broad rich-editor work, new editor packages, document type remodels, field-log
  series schema, or template automation.

If DAEDALUS discovers that a useful compare requires prior body diffs, public
prior versions, schema/API expansion, mutation changes, or private source
exposure, stop and wake MIMIR with that exact blocker.

## Accepted PR479A Scope

DAEDALUS may implement a narrow owner version compare readback:

- Add a web helper, for example in `apps/web/lib/publishing.ts` or a focused
  sibling helper, that accepts current document metadata plus existing
  `PublishingDocumentVersion` rows and returns a bounded compare model.
- The compare model should identify the current version and one selected or
  most recent prior version, then summarize changed and unchanged metadata
  fields without including body text, source IDs, owner IDs, raw internal IDs,
  approval internals, or discussion IDs.
- Wire the readback into the existing `/studio/publish?documentId=...` Version
  History panel. Reuse the current owner-only version fetch; do not add a public
  route or expand the API response.
- Optionally reuse the same helper on the Space document page only inside the
  existing `ownerAccess` branch. Public readers must continue to see only the
  current document readback.
- Keep publish/retract/delete/update behavior unchanged. Do not add restore or
  revert actions.
- Keep the UI compact and owner-focused; this is a compare/readback panel, not a
  new editor or template flow.

Suggested touched files:

- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/components/studio/publish-flow.tsx`
- optionally `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- PR479A roadmap/result docs and validation baseline

## Required Tests

DAEDALUS should add focused coverage proving:

- compare output is metadata-only and does not include prior bodies, source IDs,
  owner IDs, raw document IDs, raw discussion/thread IDs, SQL/table names,
  stack traces, provider payloads, or secret-shaped values;
- changed metadata is reported honestly for title, slug, document type, status,
  visibility, comments setting, Space/persona presence, publication state, and
  captured time when those fields are present;
- unchanged metadata is reported without inventing differences;
- empty or single-version histories render an honest no-prior-version state;
- `/studio/publish` is the primary wiring point and uses the existing owner-only
  version load;
- any Space document page reuse is guarded by existing `ownerAccess`; public
  readers do not receive prior-version compare UI;
- source scan or component assertions prove there is no restore/revert,
  publish/retract/delete mutation, public compare route, public prior-version
  link, schema/API expansion, provider/model call, worker/queue, billing, or
  deployment scope.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive/scope scan covering prior body exposure,
`sourceId`, `source_id`, `ownerUserId`, `owner_user_id`, raw IDs, discussion or
thread IDs, approval internals, SQL/table details, stack traces, provider
payloads, secret-shaped values, public prior-version links, restore/revert
actions, publish/retract/delete mutations, rich editor scope, templates,
scheduling, social dispatch, Station Press, Redis, Cloudflare, workers, queues,
billing, Stripe, auth/session, schema changes, and deployment behavior.

## ARIADNE Rehearsal Requirement

No required ARIADNE hosted proof is needed for the preflight decision or for a
narrow PR479A implementation if it remains an owner-only metadata readback with
no mutation or public exposure change.

If MIMIR wants human-eye confirmation after ARGUS accepts DAEDALUS' patch, route
ARIADNE for a read-only owner proof of `/studio/publish?documentId=...` on
desktop and 390px mobile plus a signed-out/public document check proving no
prior-version compare/history is exposed.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR479 handoff, PR401/PR402 results, PR478 closeout, prep lane audit, future lanes, publish flow, Space document page, publishing helpers/tests, document routes, community document tests, and publishing approval tests inspected. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 12 tests passed, including current version-history summary and authoring guidance coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 168 tests passed, including publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed, including owner-only document update/version and public-read no-versions assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed; linked document discussion boundaries remain intact. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 17 tests passed, including owner-scoped approval and private body redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from turbo cache. |
| `git diff --check` | Pass | No whitespace errors before the roadmap edit. |
| `git diff --cached --check` | Pass | No staged whitespace errors before the roadmap edit. |
| Source/scope scan | Pass | Matches were limited to existing owner-only implementation/test fields and explicit PR479 guardrails; no app-code change was made in this preflight. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR479A - Owner Version Compare Readback` exactly as an
owner-only, metadata-only compare/readback improvement on the existing document
version history surface. Do not expose prior bodies or public prior versions,
add restore/revert/publish/retract/delete behavior, widen API/schema/auth scope,
or open rich editor, template, field-log series, scheduling, social, Station
Press, provider, Redis, Cloudflare, worker/queue, billing, Stripe, or deployment
lanes.
