# PR170 - Phase 2D Agent Draft Document Save

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, artifact provenance, and public boundary.
Rehearsal: ARIADNE runs hosted browser proof if ARGUS accepts visible UI.
Status: implemented by DAEDALUS; open for ARGUS review

## Why This Lane

PR169 proved that an owner-approved Developer Agent confirmation can dispatch
into a durable non-executing receipt. The next useful Phase 2D step is a small
workspace artifact, not public publishing or autonomous execution.

Station already has:

- safe `draft_project_update` preview text;
- `documents` draft creation;
- `developer_space_documents` owner/public evidence links;
- a receipt harness that can prove a confirmed action happened without
  pretending external execution occurred.

This lane should let the Developer Agent save one confirmed project-update
draft as a private owner-only Developer Space document.

## Scope

Implement the narrowest useful artifact save:

- Add a distinct registered future action such as `save_project_update_draft`.
- Keep `draft_project_update` as preview-only copy generation.
- Let owners create/approve a confirmation for `save_project_update_draft`.
- Extend the receipt/execution harness to allow approved
  `save_project_update_draft` confirmations.
- On dispatch, create exactly one private draft document linked to the Developer
  Space through `developer_space_documents`.
- The document must be:
  - `status: draft`;
  - `visibility: private`;
  - `comments_enabled: false`;
  - linked with `link_visibility: owner`;
  - linked with a role that fits the generated material, likely `field_log` or
    `note`;
  - clearly labelled as a Developer Agent draft requiring owner review.
- Use route-generated safe Developer Space readback to produce the draft body.
  Do not accept arbitrary client-provided body text for this action.
- Do not store document bodies in confirmation or receipt payloads. Store only
  sanitized summary, provenance, safe title/role/status, and a safe owner route
  hint if one is needed.
- Make dispatch idempotent per confirmation. Repeating dispatch must return the
  existing draft/receipt instead of creating duplicate documents.
- The owner manage panel may show a control only for approved
  `save_project_update_draft` confirmations and a receipt/draft readback after
  success.

If DAEDALUS finds the existing document-template route can be reused internally,
reuse its behavior and tests. If it requires unsafe client body flow or public
publish behavior, implement a narrower internal helper instead.

## Still Blocked

These actions remain blocked in PR170:

- `publish_to_page`
- `update_layout`
- `read_logs`
- `push_to_repo`
- `run_job`
- `update_observatory`
- `rotate_ingestion_key`
- `create_webhook_signing_secret`

`request_capability` receipts from PR169 must keep working.

## Non-Scope

- No public publish.
- No public Developer Space document link.
- No model/provider call.
- No autonomous agent loop or freeform natural-language command parser.
- No shell, repo push, deployment, queue worker, hosted runtime, Cloudflare
  Worker, Redis worker, key rotation, signing-secret creation, layout mutation,
  observed-runtime mutation, billing mutation, import, export, webhook
  mutation, or private log read.
- No arbitrary client-supplied document body for the agent save route.
- No broad Developer Space redesign.
- No secret printing, raw prompt/body rendering in receipts, provider payload
  exposure, cookie/token display, raw ID display in visible UI, or environment
  inventory.

## Acceptance

- Owner/admin can preview `draft_project_update` without mutation.
- Owner/admin can create and approve `save_project_update_draft`.
- Dispatch creates one private draft document and one owner-only Developer
  Space document link.
- Repeat dispatch is idempotent and does not create duplicate documents, links,
  or receipts.
- Non-owner confirmation, dispatch, document readback, and receipt readback are
  denied.
- Public/visitor Developer Space routes do not show the private draft or
  owner-only link.
- `publish_to_page` remains blocked and cannot create documents.
- Receipt and visible UI copy say a private draft was saved for owner review,
  not that anything was published.
- Confirmation and receipt payloads do not store raw document bodies, raw
  confirmation ids, owner ids, preview hashes, prompts, keys, provider payloads,
  cookies, tokens, environment values, or private logs.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- --filter @station/types build
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If visible UI changes are significant, run the existing web build path and
record the known local Windows Next standalone symlink `EPERM` only if it
appears after successful compile/lint/typecheck/page generation.

## ARGUS Review Ask

ARGUS should review:

- owner/admin authorization before draft save, receipt visibility, and document
  link visibility;
- RLS/route changes if the receipt action constraint or policy changes;
- idempotency across document, link, and receipt creation;
- no public document/link exposure;
- `publish_to_page` and other dangerous approved confirmations remain blocked;
- confirmation/receipt payloads do not become hidden document-body storage;
- document provenance/copy does not overclaim human authorship or public
  publication;
- no unrelated provider, repo, deploy, key, secret, worker, Cloudflare, Redis,
  billing, import, export, webhook, observed-runtime, public page, or layout
  mutation slipped in.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- registered action name and route behavior;
- document/link/receipt data shape;
- idempotency proof;
- public-boundary proof;
- validation results;
- whether visible UI changed and ARIADNE should rehearse hosted staging.

If implementation cannot proceed, wake MIMIR with the exact blocker instead of
going silent.

## DAEDALUS Implementation - 2026-06-22

DAEDALUS implemented PR170 as a narrow confirmed draft-document save.

Files touched:

- `infra/supabase/migrations/051_developer_space_agent_draft_document_save.sql`
- `packages/types/src/developer-space.ts`
- `packages/db/src/types.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/roadmap/PR170_PHASE_2D_AGENT_DRAFT_DOCUMENT_SAVE.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Schema/type shape:

- Added migration `051_developer_space_agent_draft_document_save.sql`.
- The confirmation action constraint now includes
  `save_project_update_draft`.
- The receipt action constraint now allows `request_capability` and
  `save_project_update_draft`.
- Receipt RLS still requires authenticated owner access to the Developer Space
  and an approved same-owner/same-Space confirmation, now for either executable
  receipt action.
- Shared/db types now expose
  `DeveloperSpaceAgentExecutionReceiptAction =
  "request_capability" | "save_project_update_draft"`.

Route behavior:

- `draft_project_update` remains preview-only and cannot create a confirmation.
- `save_project_update_draft` is registered as a confirmed future action.
- Approved `save_project_update_draft` dispatch creates one private draft
  `documents` row and one owner-only `developer_space_documents` link.
- The saved document is route-generated from safe Developer Space readback:
  counts, timestamps, and owner review checklist only.
- The saved document is `status: draft`, `visibility: private`,
  `comments_enabled: false`, `document_type: field_log`,
  `provenance_type: ai_assisted`, and linked with
  `link_visibility: owner` / `document_role: field_log`.
- Dispatch is idempotent per confirmation through the existing unique receipt
  constraint; repeat dispatch returns the existing receipt and does not create
  duplicate documents or links.
- `request_capability` receipts from PR169 still work.
- `publish_to_page` and the other dangerous future actions remain blocked even
  if approved.

Receipt/UI behavior:

- Receipt payloads for draft saves include safe metadata only: title, draft
  status, private visibility, owner link visibility, and role.
- Confirmation and receipt payloads do not store document bodies, raw prompt
  text, event payloads, provider payloads, keys, cookies, tokens, environment
  values, confirmation ids, owner ids, or preview hashes.
- The owner manage panel exposes `Save draft` only for approved
  `save_project_update_draft` confirmations.
- Receipt rows label saved drafts separately from capability requests and show
  private/draft/owner metadata without raw ids.

Focused proof:

- API coverage proves owner-only draft save, private document/link shape,
  public Developer Space detail hiding the owner-only link, repeat dispatch
  idempotency, blocked `publish_to_page`, and no prompt/token/private event
  payload leakage in confirmation/receipt responses.
- Web helper coverage proves approved `save_project_update_draft` can dispatch
  while pending save confirmations and approved dangerous actions stay blocked.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 37
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, generated 36 static pages, finalized optimization, and
  collected traces, then hit the known local Windows symlink `EPERM` while
  copying `.next/standalone` traced files. Existing raw `<img>` warnings remain
  unrelated.

Next baton:

- ARGUS should review the migration/RLS widening, route owner scope,
  idempotency across document/link/receipt creation, public boundary, receipt
  serialization, and visible copy.
- Because visible owner UI changed, ARGUS should wake ARIADNE for hosted
  desktop/mobile proof if accepted.
