# PR190 - Developer Agent Layout Suggestion Readback

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE only if visible owner flows change.
Status: closed by MIMIR after ARGUS acceptance

## Why This Lane

PR188 classified `update_layout` as blocked pending Phase 2E hardening. PR189
then hardened audit/export for existing owner-confirmed Station-state actions.

The next useful Phase 2E step is not job execution. `run_job` needs worker
targeting, timeout, retry, idempotency, status readback, and operational safety
before any execution path is credible. `update_layout` can be made useful
sooner as a suggestion/readback lane without direct mutation.

## Goal

Let the Developer Agent produce owner-scoped layout suggestions for Developer
Spaces without directly changing live observatory or management configuration.

The owner should be able to answer:

- what layout change was suggested;
- why the suggestion was made;
- what current layout/config it was based on;
- what would change if accepted later;
- what was intentionally not mutated;
- how the suggestion appears in audit/export readback.

## Scope

DAEDALUS should inspect the existing Developer Space visual config, observatory
widgets, action registry, confirmation, receipt, and audit-export code, then
implement the narrowest useful readback slice.

Expected work:

- Keep direct `update_layout` execution blocked.
- Add or harden a suggestion artifact/readback path for `update_layout`.
- Return a minimized before/after summary, affected panel/widget labels, visual
  mode labels, and explicit no-mutation boundary.
- Include the suggestion in owner-only audit/export readback if a confirmation
  or receipt-shaped record is produced.
- Preserve owner-only scoping and public cleanliness.
- Add focused tests proving no live visual config mutation occurs.

## Boundaries

Do not:

- mutate Developer Space visual config automatically;
- change public observatory output as part of this lane;
- add worker/job execution, provider calls, repo push, shell, deploys,
  credential mutation, signing-secret creation, Cloudflare, Redis,
  Railway/Supabase config, billing, or broad UI redesign;
- make `run_job`, `push_to_repo`, `rotate_ingestion_key`, or
  `create_webhook_signing_secret` executable;
- expose private prompt/config/raw ids to public routes.

Allowed:

- API/service/test work for owner-only layout suggestion readback;
- shared type updates for minimized suggestion DTOs;
- small owner UI affordance only if an existing Developer Space management
  surface has a natural place for readback and ARIADNE can rehearse it.

## Validation

Required:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `git diff --check`

If shared API types change:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

If web/client helpers change:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client`

ARGUS should review owner scoping, no-mutation proof, public cleanliness,
audit/export compatibility, minimized payloads, and that `run_job` remains
blocked.

## DAEDALUS Implementation Result

Completed on 2026-06-23.

Implemented:

- `update_layout` now returns an owner-only layout suggestion preview using
  current Developer Space visual mode and widget labels.
- Owner confirmations for `update_layout` persist a minimized suggestion with
  current/suggested visual mode labels, before/after summaries, affected
  panel/widget labels, rationale, and no-mutation boundaries.
- Direct execution remains blocked; `update_layout` was not added to the
  executable-action set.
- Audit export includes `update_layout` confirmation records as
  `layout_suggestion` items with `receiptStatus: not_executable`, no receipt,
  no execution, and no mutation.
- The remaining risky actions stay blocked:
  `run_job`, `push_to_repo`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret`.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 44 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.

Scope notes:

- No Developer Space `visualisation_type` or `visualisation_config` mutation was
  added.
- No public observatory output changed as part of this lane.
- No worker/job execution, provider call, repo push, shell, deploy, credential
  mutation, signing-secret creation, Cloudflare, Redis, Railway/Supabase
  config, billing, or UI redesign was added.

ARGUS should review before MIMIR accepts any production-readiness boundary
change for `update_layout`.

## ARGUS Verdict

Accepted on 2026-06-23 with a narrow source-truth wording fix.

ARGUS found:

- `update_layout` remains owner-only suggestion/readback.
- Preview and confirmation persist minimized labels, summaries, and boundaries
  only.
- Direct execution stays blocked and no receipt is created.
- Public detail stays clean.
- `visualisation_type` and `visualisation_config` remain unchanged in the
  focused regression.
- `run_job`, repo push, key rotation, signing-secret creation, provider calls,
  workers, Cloudflare, Redis, Railway/Supabase config, billing, and UI redesign
  stayed out of scope.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 44 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check HEAD^ HEAD`, `git diff --check`, and
  `git diff --cached --check` passed.
- Credential-shaped diff scans were clean.

## MIMIR Closeout

Closed on 2026-06-23.

PR190 satisfies the Phase 2E `update_layout` suggestion/readback boundary. It
does not unlock direct layout mutation. Any future direct visual config mutation
needs a separate lane with explicit rollback/readback proof.

Remaining Phase 2E Developer Agent gap:

- `run_job` needs a dry-run/readiness boundary before any worker or provider
  execution can be considered.
