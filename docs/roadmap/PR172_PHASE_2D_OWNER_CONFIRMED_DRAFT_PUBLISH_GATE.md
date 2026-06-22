# PR172 - Phase 2D Owner-Confirmed Draft Publish Gate

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews authorization, public boundary, target selection,
receipt minimization, and idempotency.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts.
Status: closed by MIMIR after hosted ARIADNE acceptance

## Why This Lane

PR170 let the Developer Agent save one owner-private draft document. PR171 made
that saved draft reviewable through the existing Studio editor.

The next useful Phase 2D step is the smallest public-boundary action:
`publish_to_page` may publish an already-saved, owner-reviewed draft only after
explicit owner confirmation.

This lane is not an autonomous publishing system. It is a narrow gate that
proves the Developer Agent can prepare a public change, present the target to
the owner, require approval, and use existing publishing semantics without
inventing a new content pipeline.

## Scope

Implement the narrowest publish path:

- Keep `publish_to_page` blocked unless it targets an existing draft document
  that is:
  - owned by the signed-in owner;
  - linked to the same Developer Space;
  - `status: draft`;
  - `visibility: private`;
  - linked as owner-only evidence or otherwise clearly created/reviewed through
    the current Developer Agent draft path.
- Let the owner create and approve a `publish_to_page` confirmation only for
  an eligible selected draft.
- On approved execution, publish that draft through the existing document
  publish semantics instead of creating a parallel publishing path.
- Record one durable receipt that proves the public publish gate ran.
- Make repeat execution idempotent: no duplicate receipt, duplicate public
  evidence row, or duplicate publication side effect.
- After publish, refresh owner evidence so the owner can see the public/published
  state.
- Preserve existing Studio manual review/edit/publish behavior.

## Boundaries

Do not:

- generate or rewrite document content;
- call a model/provider;
- select a default/latest document silently;
- publish arbitrary private documents;
- publish documents from another owner or another Developer Space;
- expose private receipt copy, confirmation ids, owner ids, raw target ids,
  document bodies, raw prompts, provider payloads, keys, tokens, cookies, env
  values, preview hashes, or route-only identifiers in visible UI;
- add deployment, repository, worker, webhook, billing, key, signing secret,
  layout, runtime, Cloudflare, Redis, import, export, or background-job
  execution;
- unblock any other future action.

The server may carry the minimum private target reference needed to execute the
approved publish, but that reference must stay owner-only, must not appear as
visible copy, and should not be stored in receipt payloads if the receipt can
instead report safe metadata such as title, status, visibility, and link
visibility.

## Expected Behavior

Owner path:

- Owner can see eligible private draft evidence from PR170/PR171.
- Owner can start a `publish_to_page` confirmation for a selected eligible
  draft.
- The confirmation copy names the safe target label/title and makes clear this
  is a public publish action.
- Approving and executing publishes exactly that draft.
- The owner manage page shows one publish receipt and refreshed evidence with
  public/published metadata.
- Repeating execution is idempotent.

Public path:

- Before execution, anonymous/public Developer Space detail does not show the
  private draft, private review link, or private receipt copy.
- After execution, anonymous/public Developer Space detail may show the newly
  published document through the existing public document surface.
- Public pages must not show confirmation records, execution receipts, owner
  ids, private draft links, or private-only provenance.

Blocked path:

- `publish_to_page` without an eligible selected draft stays blocked.
- `draft_project_update` remains preview-only.
- `save_project_update_draft` remains the only draft-creation receipt action.
- Other future actions remain blocked.

## Validation

DAEDALUS should run focused validation, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if owner UI changes
- `git diff --check`

ARGUS should add hostile review around:

- non-owner and wrong-Space draft publish attempts;
- attempts to publish arbitrary private documents;
- already-published and deleted/missing target behavior;
- confirmation target tampering;
- receipt payload minimization;
- public leakage before and after publish;
- idempotency across repeated execution;
- other future actions staying blocked.

ARIADNE should run a hosted human rehearsal if ARGUS accepts:

- owner creates/saves a draft, reviews it, selects it for publish, approves,
  executes, and sees one publish receipt;
- anonymous/public detail is clean before publish and shows only the legitimate
  published document after publish;
- mobile owner can see and use the publish gate without horizontal overflow;
- visible text scan finds no UUID-shaped values or secret-shaped strings.

## Next Baton

DAEDALUS implemented PR172 on 2026-06-22.

Changed files:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts`
- `packages/db/src/types.ts`
- `infra/supabase/migrations/052_developer_space_agent_draft_publish_gate.sql`

Implementation details:

- `publish_to_page` confirmations require a selected `targetDocumentId`.
- The API rejects missing targets, wrong-Space links, arbitrary private
  documents, already-published targets, and documents not produced by the
  current Developer Agent saved-draft path.
- Eligible targets must be owner-owned, linked to the same Developer Space as
  owner-only field-log evidence, `draft`/`private`, `ai_assisted`, `manual`,
  and sourced from the same Developer Space with a `Developer Agent safe
  readback:` source label.
- Approved execution publishes the selected document to `published`/`public`,
  flips the Developer Space evidence link to `public`, and records one
  minimized `publish_to_page` receipt.
- Repeat execution returns the existing receipt and does not duplicate receipts,
  links, or publication side effects.
- Owner UI starts publish confirmations from the selected evidence row, not
  from the generic future-lane preview.

Receipt proof:

- The publish receipt includes safe metadata only: title, status, visibility,
  link visibility, role, published timestamp, next step, and boundary copy.
- The publish receipt does not include target document id, confirmation id,
  owner id, document body, prompts, provider payloads, keys, tokens, cookies,
  environment values, or preview hashes.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 39
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/db build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.

Remaining review risks:

- ARGUS should review hostile confirmation payload tampering and public leakage
  before accepting.
- ARIADNE should run hosted desktop/mobile proof if ARGUS accepts the code path.

ARGUS should review changed files, target-selection rules, receipt payload
minimization, public/private leakage, idempotency, and blocked future-action
boundaries. If accepted, ARGUS should wake ARIADNE for hosted proof. ARIADNE
then wakes MIMIR with the closeout verdict.

## ARIADNE Hosted Browser Blocker - 2026-06-22

ARIADNE ran the PR172 hosted desktop/mobile publish-gate proof after ARGUS
accepted the publish gate.

Deployment identity:

- Web `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/web`, commit `de76c92409b4`.
- API `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/api`, commit `de76c92409b4`.
- The commit descends from the PR172 app-code patch.

Hosted proof that passed before the blocker:

- Replay owner route `/developer-spaces/:slug/manage` loaded on desktop
  `1440x1000`.
- Evidence path and Developer Agent preview panel loaded with no confirmation/
  receipt setup-unavailable copy and no generic load-failure copy.
- Generic `publish_to_page` preview showed the selected-draft instruction and
  exposed zero enabled `Record confirmation` controls.
- `save_project_update_draft` preview, confirmation create, approval, and
  `Save draft` execution succeeded.
- The save created exactly one new private draft receipt, one new owner-only
  `Review draft` link, and one new `Request publish` control.
- The proof clicked `Request publish` from that newly saved draft evidence row,
  without printing the owner document id.
- The selected `publish_to_page` confirmation create returned HTTP `201`.
- The selected `publish_to_page` approval returned HTTP `200`.
- The approved publish row kept selected-draft non-execution copy before
  execution.
- Visible owner text scan found zero UUID-shaped values and zero secret-shaped
  strings.
- Anonymous public Developer Space detail stayed private before and after the
  failed publish attempt: no `Review draft`, no private draft receipt copy, and
  no project-update draft evidence appeared.
- Mobile `390x900` owner manage loaded with no document-level horizontal
  overflow.
- Browser saw no unexpected mutation requests.

Hosted blocker:

- Executing the approved selected `publish_to_page` confirmation returned HTTP
  `500` from
  `POST /developer-spaces/:spaceRef/agent/actions/confirmations/:confirmationId/execute`.
- Repeating the same execute returned HTTP `500` again.
- No `Published page update` receipt rendered.
- No `Published: ... / published / public / public` metadata rendered.
- Public Developer Space detail did not gain the published project-update draft.
- Mobile could not show publish receipt evidence because the publish execution
  failed.

Likely repair target:

- Verify hosted PR172 execution, especially
  `infra/supabase/migrations/052_developer_space_agent_draft_publish_gate.sql`
  and the hosted execute path for approved selected `publish_to_page`
  confirmations.
- Prove hosted execute can publish the selected saved draft, insert the
  minimized receipt, and keep repeat execution idempotent before waking ARIADNE
  to rerun desktop/mobile proof.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr172-hosted-publish-gate-proof.spec.js --reporter=line --workers=1`
  failed as a blocker-check harness after emitting four hosted defects.

## DAEDALUS Hosted Schema Repair - 2026-06-22

DAEDALUS repaired the hosted publish execution blocker after ARIADNE's browser
proof found HTTP `500` from approved selected `publish_to_page` execution.

Pre-repair hosted truth:

- Hosted receipt action check did not include `publish_to_page`.
- Hosted receipt owner policy did not include `publish_to_page`.
- Hosted migration ledger rows for
  `052_developer_space_agent_draft_publish_gate` were `0`.

Repair:

- Applied only
  `infra/supabase/migrations/052_developer_space_agent_draft_publish_gate.sql`
  through the hosted pooler path.
- Recorded migration ledger row
  `20260622103000 / 052_developer_space_agent_draft_publish_gate`.
- Sent `NOTIFY pgrst, 'reload schema'`.

Post-repair proof:

- Receipt action check includes `publish_to_page`: true.
- Receipt owner policy includes `publish_to_page`: true.
- Migration ledger row count for `20260622103000 /
  052_developer_space_agent_draft_publish_gate`: `1`.

Hosted API smoke:

- Synthetic run label: `station-pr172-mqp5gujcpmbw`; raw user ids, Space id,
  document id, confirmation id, auth tokens, credentials, and URLs were not
  printed.
- Owner/non-owner signup returned HTTP `201` / `201`; owner was promoted to
  `canon` for the synthetic proof.
- Public Developer Space create returned HTTP `201`.
- Non-owner receipt list returned HTTP `403`.
- `save_project_update_draft` create/approve/execute returned HTTP `201` /
  `200` / `201`.
- Public detail before publish had `0` linked documents.
- Missing-target `publish_to_page` create returned HTTP `400` /
  `developer_space_agent_publish_target_required`.
- Selected `publish_to_page` create/approve/execute/repeat returned HTTP
  `201` / `200` / `201` / `200`; repeat execution was idempotent.
- Public detail after publish had `1` linked document in `published` /
  `public` / `public` state.
- Owner receipts included
  `publish_to_page,save_project_update_draft`.
- Publish receipt payload key scan stayed safe for document ids, target ids,
  confirmation ids, owner ids, bodies, raw prompts, tokens, provider payloads,
  and preview hashes; secret-text scan stayed safe.
- Hosted DB readback showed one `publish_to_page` receipt and one
  public/published/public linked document before cleanup.
- Synthetic cleanup removed two auth users, one Developer Space, and one
  document; auth-user deletion returned HTTP `200` / `200`.

Next baton:

- ARIADNE should rerun hosted desktop/mobile proof for the selected-draft
  publish gate.
- Expected result: publish execution succeeds, one `Published page update`
  receipt renders, public detail gains only the legitimate published document,
  mobile remains usable, and visible scans still show no raw ids or
  secret-shaped values.

## ARIADNE Hosted Browser Acceptance - 2026-06-22

ARIADNE reran the PR172 hosted desktop/mobile publish-gate proof after DAEDALUS
repaired the hosted `052` schema gap.

Deployment identity:

- Web `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/web`, commit `de76c92409b4`.
- API `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/api`, commit `de76c92409b4`.
- The commit descends from the PR172 app-code patch.

Hosted owner proof:

- Replay owner route `/developer-spaces/:slug/manage` loaded on desktop
  `1440x1000`.
- Evidence path and Developer Agent preview panel loaded with no confirmation/
  receipt setup-unavailable copy and no generic load-failure copy.
- Generic `publish_to_page` preview showed the selected-draft instruction and
  exposed zero enabled `Record confirmation` controls.
- `save_project_update_draft` preview/create/approve/execute succeeded and
  created exactly one new private draft receipt, one new owner-only
  `Review draft` link, and one new `Request publish` control.
- The proof clicked `Request publish` from that newly saved draft evidence row,
  without printing the owner document id.
- Selected `publish_to_page` confirmation create returned HTTP `201`, approval
  returned HTTP `200`, and execution returned HTTP `201`.
- The approved publish row kept selected-draft non-execution copy before
  execution.
- The owner UI rendered one `Published page update` receipt and
  `Published: ... / published / public / public` metadata.
- Repeat publish execution returned HTTP `200`, stayed idempotent, and did not
  duplicate the visible publish receipt or restore the publish control for the
  published target.
- Visible owner text scan found zero UUID-shaped values and zero secret-shaped
  strings.
- Browser saw no API errors and no unexpected mutation requests.

Hosted boundary proof:

- Anonymous public Developer Space detail stayed free of `Review draft` and
  private draft receipt copy.
- Public detail gained the legitimate published project-update evidence after
  publish.
- Mobile `390x900` owner manage showed the publish receipt and published/public
  metadata with no document-level horizontal overflow.

Mutation result:

- Preview requests: `2`.
- Confirmation creates: `2`.
- Confirmation approvals: `2`.
- Receipt execute requests: `3` (draft save, selected publish, idempotent
  publish repeat).
- External executions: `0`.

Verdict:

- ARIADNE accepts PR172.
- The hosted publish execution blocker is cleared.
- The selected-draft public publish gate works on hosted desktop and mobile
  without broadening provider/deploy/repo/key/layout/billing/webhook/export/
  worker/runtime scope.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr172-hosted-publish-gate-proof.spec.js --reporter=line --workers=1`
  passed: 1 test.

## MIMIR Closeout - 2026-06-22

MIMIR closes PR172 after DAEDALUS repaired the hosted `052` schema gap and
ARIADNE accepted the hosted desktop/mobile proof.

Accepted truth:

- `publish_to_page` now works only for a selected eligible private draft linked
  to the same Developer Space.
- Generic `publish_to_page` remains selected-target only and does not expose a
  generic confirmation control.
- Owner execution publishes exactly the selected reviewed draft through the
  existing public document/evidence semantics.
- Repeat execution stays idempotent.
- Public detail gains only the legitimate published project-update evidence.
- Private review links, private draft receipt copy, raw ids, secret-shaped
  strings, and provider/deploy/repo/key/layout/billing/webhook/export/worker/
  runtime scope remain out of the public path.

Next lane:

- PR173 should make `request_capability` useful as a structured owner triage
  handoff. It should help the Developer Agent state what it needs next without
  collecting secrets, mutating config, or unblocking dangerous future actions.
