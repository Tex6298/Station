# PR169 - Phase 2D Agent Execution Receipt Harness

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, execution boundary, and leak risk.
Rehearsal: ARIADNE runs hosted browser proof if ARGUS accepts visible UI.
Status: DAEDALUS implementation complete; open for ARGUS review

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
