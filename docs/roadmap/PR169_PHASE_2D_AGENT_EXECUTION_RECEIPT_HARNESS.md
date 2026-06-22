# PR169 - Phase 2D Agent Execution Receipt Harness

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, execution boundary, and leak risk.
Rehearsal: ARIADNE runs hosted browser proof if ARGUS accepts visible UI.
Status: accepted by ARIADNE after hosted receipt-store repair; waking MIMIR

## Why This Lane

PR162 through PR168 established the Phase 2D Developer Agent command contract:
safe previews, future-action confirmations, visible owner intent records, and
hosted durable confirmation storage.

The next step is not autonomous execution. It is an execution-adjacent receipt
harness that proves Station can take an approved confirmation, dispatch it
through a typed owner-only route, and produce a durable receipt without touching
dangerous targets.

This lane should make the boundary concrete:

- owner intent can move from `approved` confirmation to a receipt;
- the receipt is auditable and owner-scoped;
- exactly one inert action is allowed;
- all real mutation/deploy/key/provider actions remain blocked.

## Scope

Implement the narrowest useful receipt harness:

- Add an owner-only dispatch route, likely:
  `POST /developer-spaces/:id/agent/actions/confirmations/:confirmationId/execute`.
- Allow dispatch only for approved confirmations whose action is
  `request_capability`.
- Treat `request_capability` as an inert operator-planning action: execution
  records that the owner requested a capability lane, but does not mutate the
  Developer Space, publish content, rotate keys, create secrets, call providers,
  run jobs, push repos, deploy, read private logs, or touch Cloudflare/Redis.
- Produce a durable owner-scoped receipt for the dispatch. Prefer a small
  `developer_space_agent_execution_receipts` table if no accepted existing
  audit primitive fits; if DAEDALUS finds a better existing owner-scoped
  primitive, wake MIMIR before changing the data shape.
- Make dispatch idempotent for a confirmation: repeat calls should return the
  existing receipt or a clear already-dispatched response, not duplicate
  receipts.
- Add an owner-only receipt list/readback route or include recent receipts in
  the confirmation response if that is cleaner.
- Update the owner manage panel so an approved `request_capability`
  confirmation can show one clearly labelled control such as `Record request`
  or `Create receipt`; other approved future actions must remain non-actionable.
- Render receipts as non-executing planning evidence, not as completed external
  work.
- Add focused API and UI helper tests for owner scoping, non-owner denial,
  pending/cancelled/expired rejection, idempotency, allowed inert action, and
  blocked real actions.

## Actions

Allowed in PR169:

- `request_capability`: creates an owner-scoped receipt only.

Still blocked in PR169:

- `publish_to_page`
- `update_layout`
- `read_logs`
- `push_to_repo`
- `run_job`
- `update_observatory`
- `rotate_ingestion_key`
- `create_webhook_signing_secret`

Safe read/draft preview actions remain preview-only and should not need
confirmation or execution receipts.

## Non-Scope

- No autonomous agent loop.
- No model chat loop or provider call.
- No parser for arbitrary natural-language commands.
- No shell, repo push, deployment, queue worker, hosted runtime, Cloudflare
  Worker, Redis worker, key rotation, signing-secret creation, public document
  publish, layout mutation, observed-runtime mutation, billing mutation, import,
  export, webhook mutation, or private log read.
- No broad Developer Space redesign.
- No public Developer Space behavior change.
- No secret printing, raw prompt/body rendering, provider payload exposure,
  cookie/token display, raw ID display in visible UI, or environment-variable
  inventory.

## Acceptance

- Owner/admin can dispatch an approved `request_capability` confirmation into a
  durable receipt.
- Non-owner dispatch and receipt list/readback are denied.
- Pending, cancelled, expired, unknown, and unsupported confirmations cannot be
  dispatched.
- Real mutation/deploy/key/provider actions remain blocked even if approved.
- Dispatch is idempotent per confirmation.
- The receipt says what happened and what did not happen.
- The owner UI only exposes a dispatch control for the allowed inert action.
- Receipts do not expose raw confirmation ids, owner ids, preview hashes,
  raw payload JSON, prompts, keys, provider payloads, cookies, tokens,
  environment values, or private logs.
- Existing PR162 preview behavior and PR165/PR166 confirmation behavior remain
  compatible.

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

- owner/admin authorization before receipt visibility or dispatch;
- RLS/route scoping if a new table is added;
- dispatch idempotency;
- proof that only `request_capability` can create a receipt;
- proof that dangerous approved confirmations remain non-actionable;
- receipt serialization and visible UI leak risk;
- copy that could overclaim real execution;
- that no provider, repo, deploy, key, secret, worker, Cloudflare, Redis,
  public page, document, layout, billing, archive, export, webhook, or observed
  runtime target was mutated.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- receipt data shape and route shape;
- allowed dispatch action and blocked actions;
- idempotency behavior;
- validation results;
- whether visible UI changed and ARIADNE should rehearse hosted staging.

If implementation cannot proceed, wake MIMIR with the exact blocker instead of
going silent.

## DAEDALUS Implementation

Implemented on 2026-06-22.

Files touched:

- `infra/supabase/migrations/050_developer_space_agent_execution_receipts.sql`
- `packages/types/src/developer-space.ts`
- `packages/db/src/types.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Receipt data shape:

- Added `developer_space_agent_execution_receipts`.
- Columns: `id`, `developer_space_id`, `owner_user_id`, `confirmation_id`,
  `action`, `status`, `summary`, `receipt_payload`, `dispatched_at`,
  `created_at`, and `updated_at`.
- `action` is constrained to `request_capability`.
- `status` is constrained to `recorded`.
- `confirmation_id` is unique, making the route idempotent per confirmation.
- RLS requires the authenticated owner to own the Developer Space and the linked
  `request_capability` confirmation.

Route shape:

```text
GET  /developer-spaces/:id/agent/actions/receipts
POST /developer-spaces/:id/agent/actions/confirmations/:confirmationId/execute
```

Behavior:

- Approved `request_capability` confirmations create one owner-scoped receipt.
- Repeat execute calls return the existing receipt with `idempotent: true`.
- Pending, cancelled, expired, non-owner, unknown, and unsupported confirmation
  states are rejected without creating receipts.
- Approved real-action confirmations such as `publish_to_page` remain blocked
  with `developer_space_agent_execution_action_blocked`.
- The receipt payload says no autonomous loop, provider call, document/layout/
  key/signing-secret/repo/deploy/worker/billing/export/webhook/observed-runtime
  target was mutated.

Visible owner UI:

- The owner manage panel loads recent receipts.
- It exposes `Create receipt` only for approved `request_capability`
  confirmations.
- Receipts render as planning evidence with non-execution copy.
- Other approved future actions remain non-actionable.

Leak/overclaim boundary:

- Serialized receipts intentionally omit raw owner ids, confirmation ids,
  preview hashes, raw payload JSON, prompts, keys, provider payloads, cookies,
  tokens, environment values, and private logs.
- No provider, repo, deploy, key, secret, worker, Cloudflare, Redis, public
  page, document, layout, billing, archive, export, webhook, or observed-runtime
  target is called or mutated.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 36
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, generated 36 static pages, finalized optimization, and
  collected traces before the known local Windows symlink `EPERM` in
  `.next/standalone`.
- `git diff --check` passed with CRLF normalization warnings only.

Next baton:

- ARGUS should review RLS/route owner scope, idempotency, blocked real actions,
  receipt serialization, and visible copy.
- Visible owner UI changed, so ARIADNE should rehearse hosted staging after
  ARGUS acceptance.

## ARGUS Review - 2026-06-22

ARGUS accepts PR169 with a narrow storage-boundary hardening patch and wakes
ARIADNE for hosted browser proof because the owner manage UI changed.

Review verdict:

- Accepted: `developer_space_agent_execution_receipts` RLS now requires the
  linked confirmation to be approved, owner-scoped, same-Space, and
  `action = request_capability`.
- Accepted: this aligns direct table access with the API rule that pending,
  cancelled, expired, and real-action confirmations do not create receipts.
- Accepted: the receipt harness remains inert. Owner-only execute records one
  route-generated planning receipt only for approved `request_capability`
  confirmations.
- Accepted: repeat execute is idempotent.
- Accepted: approved real actions remain blocked.
- Accepted: serialized receipts omit raw owner ids, confirmation ids, preview
  hashes, raw payloads, prompts, keys, provider payloads, cookies, tokens,
  environment values, and private logs.
- Accepted: UI copy presents receipts as planning evidence rather than
  execution.

ARGUS validation:

- `npx -y pnpm@10.32.1 test:developer-spaces` passed with 36 tests.
- `npx -y pnpm@10.32.1 test:developer-space-client` passed with 15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, generated 36 static pages, finalized optimization, and
  collected traces, then hit the known local Windows `.next/standalone` symlink
  `EPERM`.
- `git diff --check` and `git diff --cached --check` passed with CRLF warnings
  only.
- Staged added-line secret/UUID scan passed.

## ARIADNE Hosted Browser Proof - 2026-06-22

ARIADNE ran the hosted owner browser proof after ARGUS acceptance.

Deployment identity:

- Web `/health/deployment`: 200, ready, branch `main`, service `@station/web`,
  commit `00b9c22281a3`.
- API `/health/deployment`: 200, ready, branch `main`, service `@station/api`,
  commit `00b9c22281a3`.
- Verdict: runtime includes the PR169 app-code patch.

Route and viewport:

- Route: `/developer-spaces/:slug/manage`.
- Account role: replay owner.
- Desktop viewport: `1440x1000`.
- Mobile viewport: `390x900`.

Partial hosted proof:

- Developer Agent preview panel rendered.
- Available actions rendered.
- Future lane vocabulary rendered.
- Confirmation storage was available.
- Generic confirmation-load and receipt-load failure copy was not visible.
- Safe readback preview worked.
- Draft preview worked.
- One `request_capability` confirmation was created and approved.
- One `publish_to_page` confirmation was created and approved.
- Approved `request_capability` showed the receipt-only control before receipt
  storage blocked recording.
- Approved `publish_to_page` did not expose the receipt control.
- Both approved confirmations retained non-execution copy.
- Browser observed no API errors and no unexpected mutation requests.
- Visible panel scan found zero UUID-shaped values and zero secret-shaped
  strings.
- Mobile had no document-level horizontal overflow.

Hosted blocker:

- The owner UI showed `Receipt storage is not available in this environment.`
- The Receipts section did not render planning evidence.
- No receipt execute request was sent because the UI correctly kept receipt
  recording unavailable while the store was unavailable.
- Mobile also lacked receipt planning evidence for the same setup-unavailable
  state.

Expected:

- Hosted staging exposes `developer_space_agent_execution_receipts` to the
  deployed API, `GET /developer-spaces/:id/agent/actions/receipts` returns a
  store-available owner response, and an approved `request_capability`
  confirmation can record one non-executing planning receipt.

Actual:

- Hosted app-code is current, but receipt storage is still unavailable to the
  owner UI, so the browser proof cannot record or display the PR169 receipt.

Narrowest DAEDALUS fix:

- Verify/apply
  `infra/supabase/migrations/050_developer_space_agent_execution_receipts.sql`
  against hosted Supabase.
- Verify the RLS policy includes the ARGUS hardening that requires approved
  `request_capability` confirmations.
- Reload PostgREST schema cache if needed.
- Prove hosted `GET /developer-spaces/:id/agent/actions/receipts` returns a
  store-available owner response, then wake ARIADNE to rerun the browser proof.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr169-hosted-receipt-harness-proof.spec.js --reporter=line --workers=1`
  passed as a blocker-check harness.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.
- Staged additions were scanned for raw IDs and secret-shaped values before
  commit.
- `pnpm typecheck` was not run because this handoff changed docs only and did
  not touch imports or scripts.

## DAEDALUS Hosted Receipt Store Repair - 2026-06-22

DAEDALUS verified and repaired the hosted Supabase receipt-store blocker found
by ARIADNE.

Pre-repair truth:

- Service-role PostgREST returned HTTP `404` / `PGRST205` for
  `developer_space_agent_execution_receipts`.
- Pooler proof showed the receipt table, receipt indexes, `confirmation_id`
  unique constraint, RLS, owner policy, columns, and migration ledger row were
  absent.

Repair:

- Applied only
  `infra/supabase/migrations/050_developer_space_agent_execution_receipts.sql`
  through the existing hosted `SUPABASE_POOLER_URL` path.
- Recorded migration ledger row
  `20260622082200 / 050_developer_space_agent_execution_receipts`.
- Sent `NOTIFY pgrst, 'reload schema'`.

Post-repair proof:

- Table exists: true.
- Space index exists: true.
- Owner index exists: true.
- `confirmation_id` unique constraint exists: true.
- RLS enabled: true.
- Owner policy count: `1`.
- Policy requires approved `request_capability`: true.
- Column count: `11`.
- Service-role PostgREST returned HTTP `200` for
  `/rest/v1/developer_space_agent_execution_receipts?select=action,status&limit=1`.

Hosted API smoke:

- Target host: `stationapi-production.up.railway.app`.
- Run label: `cfe5ace655`.
- Owner receipt list: HTTP `200`, setup available, count `0`.
- Non-owner receipt list: HTTP `403`.
- Approved `request_capability` execute: HTTP `201`,
  `executionAvailable: false`, receipt status `recorded`.
- Repeat execute: HTTP `200`, `idempotent: true`.
- Approved `publish_to_page` execute: HTTP `409`,
  `developer_space_agent_execution_action_blocked`.
- Final owner receipt list: HTTP `200`, setup available, count `1`, status
  `recorded`.
- Synthetic auth-user cleanup was attempted for both users; service-role
  readback for the synthetic Space slug returned `0` rows.

Next baton:

- ARIADNE should rerun the hosted desktop/mobile proof and verify the owner UI
  no longer shows receipt storage unavailable, can create one non-executing
  planning receipt, and renders receipt planning evidence without raw IDs or
  secret-shaped strings.

## ARIADNE Hosted Browser Rerun - 2026-06-22

ARIADNE reran the hosted owner browser proof after the receipt-store repair.

Deployment identity:

- Web `/health/deployment`: 200, ready, branch `main`, service `@station/web`,
  commit `00b9c22281a3`.
- API `/health/deployment`: 200, ready, branch `main`, service `@station/api`,
  commit `00b9c22281a3`.
- Verdict: runtime includes the PR169 app-code patch.

Route and viewport:

- Route: `/developer-spaces/:slug/manage`.
- Account role: replay owner.
- Desktop viewport: `1440x1000`.
- Mobile viewport: `390x900`.

Hosted proof:

- Developer Agent preview panel rendered.
- Available actions rendered.
- Future lane vocabulary rendered.
- Receipts section rendered.
- Confirmation and receipt setup-unavailable copy was gone.
- Generic confirmation-load and receipt-load failure copy was gone.
- Safe readback preview worked.
- Draft preview worked.
- One `request_capability` confirmation was created and approved.
- Approved `request_capability` retained non-execution copy and exposed the
  receipt-only control.
- Recording the receipt succeeded and planning evidence was visible.
- The visible receipt list did not duplicate after recording.
- One `publish_to_page` confirmation was created and approved.
- Approved `publish_to_page` retained non-execution copy and did not expose the
  receipt control.
- Browser observed no API errors and no unexpected mutation requests.
- Visible panel scan found zero UUID-shaped values and zero secret-shaped
  strings.
- Mobile showed receipt planning evidence and had no document-level horizontal
  overflow.

Mutation result:

- Preview requests: 4.
- Confirmation creates: 2.
- Confirmation approvals: 2.
- Receipt execute requests: 1.
- External executions: 0.

Verdict:

- ARIADNE accepts PR169 hosted browser proof.
- The owner UI now shows the receipt harness as planning evidence, not
  execution.
- The hosted receipt-store blocker is cleared.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr169-hosted-receipt-harness-rerun.spec.js --reporter=line --workers=1`
  passed: 1 test.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.
- Staged additions were scanned for raw IDs and secret-shaped values before
  commit.
- `pnpm typecheck` was not run because this handoff changed docs only and did
  not touch imports or scripts.
