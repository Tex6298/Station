# PR190 - Developer Agent Layout Suggestion Readback

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE only if visible owner flows change.
Status: open

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
