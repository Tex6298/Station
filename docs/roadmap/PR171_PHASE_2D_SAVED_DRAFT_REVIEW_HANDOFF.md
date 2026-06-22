# PR171 - Phase 2D Saved Draft Review Handoff

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, receipt payloads, route boundaries, and
public leakage.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts.
Status: open for DAEDALUS

## Why This Lane

PR170 proved the first bounded Developer Agent artifact mutation: a confirmed
owner action can save one private draft document for a Developer Space.

The next useful Phase 2D step is not public publishing. It is the owner handoff:
after the agent saves a draft, the owner should be able to find it, review it,
and continue editing from existing Studio document flows.

This keeps the product promise honest:

- the agent can prepare owner-private work;
- the owner stays in control of review and publication;
- public visitors do not see private draft material;
- blocked future actions remain visibly blocked.

## Scope

Implement the narrowest review handoff for saved Developer Agent drafts:

- Surface a clear owner-only review/edit path for drafts created by
  `save_project_update_draft`.
- Prefer linking to the existing Studio document edit flow, for example
  `/studio/publish?documentId=...`, when the signed-in owner is viewing the
  Developer Space manage surface.
- Refresh or expose the owner evidence path so the saved draft is visible as an
  owner-only Developer Space document with draft/private metadata.
- Preserve existing manual Studio edit/publish behavior.
- Keep `publish_to_page` blocked; this lane does not automate public
  publishing.
- Keep `draft_project_update` preview-only.

## Boundaries

Do not:

- add public publishing automation;
- add provider/model calls;
- add deployment, repository, worker, webhook, billing, key, signing secret,
  layout, or runtime execution;
- expose private draft links or receipt copy on anonymous/public Developer
  Space detail;
- render raw UUIDs as visible UI text;
- store document bodies, raw prompts, event payloads, provider payloads, API
  keys, cookies, tokens, environment values, confirmation ids, owner ids,
  preview hashes, or route-only identifiers in receipt payloads unless they are
  already part of a safe owner-only linked document contract.

URLs may carry document ids where the existing owner-only route requires them,
but the UI should avoid presenting raw ids as copyable or visible content.

## Expected Behavior

After an owner approves and executes `save_project_update_draft`:

- exactly one private draft receipt remains visible on the owner manage page;
- the receipt or nearby owner evidence section offers a review/edit route for
  the saved draft;
- the destination loads the saved document for the owner and allows normal
  Studio draft review/edit;
- repeat execute remains idempotent and does not create duplicate receipts,
  duplicate documents, or duplicate owner evidence rows;
- anonymous/public Developer Space detail does not reveal the draft, owner-only
  link, or private receipt copy;
- `publish_to_page` can still be previewed/confirmed only as a blocked future
  action and must not expose any save/review control.

## Validation

DAEDALUS should run the focused suites touched by the change, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if the owner UI route changes
- `git diff --check`

ARGUS should add hostile review around:

- owner-only access to saved draft review/edit links;
- receipt payload minimization;
- public Developer Space leakage;
- idempotency across repeated save execution;
- `publish_to_page` staying blocked.

ARIADNE should run a hosted human rehearsal if the review path reaches visible
UI:

- desktop owner saves a draft, sees one receipt, follows the review/edit path,
  and lands on the saved draft;
- mobile owner can see and use the handoff without horizontal overflow;
- anonymous/public detail stays clean;
- visible text scan finds no UUID-shaped values or secret-shaped strings.

## Next Baton

DAEDALUS should implement PR171, then wake ARGUS with the exact changed files,
validation, and remaining risks. ARGUS should wake ARIADNE if visible owner UI
needs hosted proof; otherwise ARGUS wakes MIMIR with the verdict.
