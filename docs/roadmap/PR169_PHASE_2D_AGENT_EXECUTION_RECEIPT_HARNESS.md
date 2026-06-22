# PR169 - Phase 2D Agent Execution Receipt Harness

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, execution boundary, and leak risk.
Rehearsal: ARIADNE runs hosted browser proof if ARGUS accepts visible UI.
Status: open for DAEDALUS

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
